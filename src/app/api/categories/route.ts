import { NextRequest, NextResponse } from 'next/server';
import { readLocalJSON, ghUpdateJSON } from '@/lib/github';

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function GET() {
  try {
    const categories = readLocalJSON<Category[]>('data/categories.json');
    const products = readLocalJSON<{ categoryId: string | null }[]>('data/products.json');

    const productCountMap = new Map<string, number>();
    for (const p of products) {
      if (p.categoryId) {
        productCountMap.set(p.categoryId, (productCountMap.get(p.categoryId) || 0) + 1);
      }
    }

    const withCounts = categories
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((cat) => ({
        ...cat,
        _count: { products: productCountMap.get(cat.id) || 0 },
      }));

    return NextResponse.json(withCounts);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = generateSlug(trimmedName);
    const now = new Date().toISOString();

    const newCategory: Category = {
      id: generateId(),
      name: trimmedName,
      slug,
      createdAt: now,
      updatedAt: now,
    };

    await ghUpdateJSON<Category[]>('data/categories.json', (categories) => {
      // Check for duplicate slug
      if (categories.some((c) => c.slug === slug)) {
        throw new Error('Category already exists');
      }
      return [...categories, newCategory];
    }, `Add category: ${trimmedName}`);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Category already exists') {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    }
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
