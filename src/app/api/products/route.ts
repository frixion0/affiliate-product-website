import { NextRequest, NextResponse } from 'next/server';
import { readLocalJSON, ghUpdateJSON } from '@/lib/github';

interface ProductMedia {
  id: string;
  url: string;
  type: string;
  source: string;
  sortOrder: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  affiliateLink: string;
  categoryId: string | null;
  featured: boolean;
  clickCount: number;
  uniqueClickCount: number;
  createdAt: string;
  updatedAt: string;
  media: ProductMedia[];
  category?: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    let products = readLocalJSON<Product[]>('data/products.json');
    const categories = readLocalJSON<Category[]>('data/categories.json');
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    // Filter by category slug
    if (category) {
      const cat = categories.find((c) => c.slug === category);
      if (cat) {
        products = products.filter((p) => p.categoryId === cat.id);
      }
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Filter by featured
    if (featured === 'true') {
      products = products.filter((p) => p.featured);
    }

    // Sort
    switch (sort) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        products.sort((a, b) => b.clickCount - a.clickCount);
        break;
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    const total = products.length;
    const paginatedProducts = products.slice(skip, skip + limit);

    // Attach category objects
    const withCategories = paginatedProducts.map((p) => {
      const cat = p.categoryId ? categoryMap.get(p.categoryId) : null;
      return {
        ...p,
        category: cat ? { name: cat.name, slug: cat.slug } : null,
      };
    });

    return NextResponse.json({
      products: withCategories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, comparePrice, affiliateLink, categoryId, featured, media } = body;

    if (!name || !price || !affiliateLink) {
      return NextResponse.json(
        { error: 'Name, price, and affiliate link are required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const id = generateId();
    const slug = generateSlug(name);

    const newProduct: Product = {
      id,
      name,
      slug,
      description: description || '',
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      affiliateLink,
      categoryId: categoryId || null,
      featured: featured || false,
      clickCount: 0,
      uniqueClickCount: 0,
      createdAt: now,
      updatedAt: now,
      media: (media || []).map((m: { url: string; type?: string; source?: string; sortOrder?: number }, i: number) => ({
        id: generateId(),
        url: m.url,
        type: m.type || 'image',
        source: m.source || 'url',
        sortOrder: m.sortOrder ?? i,
      })),
    };

    await ghUpdateJSON<Product[]>('data/products.json', (products) => {
      return [...products, newProduct];
    }, `Add product: ${name}`);

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
