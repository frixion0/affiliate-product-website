import { NextRequest, NextResponse } from 'next/server';
import { ghUpdateJSON } from '@/lib/github';

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
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, comparePrice, affiliateLink, categoryId, featured, media } = body;

    let updatedProduct: Product | null = null;

    await ghUpdateJSON<Product[]>('data/products.json', (products) => {
      const idx = products.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error('Product not found');

      const existing = products[idx];
      updatedProduct = {
        ...existing,
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(comparePrice !== undefined && { comparePrice: comparePrice ? parseFloat(comparePrice) : null }),
        ...(affiliateLink !== undefined && { affiliateLink }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(featured !== undefined && { featured }),
        ...(media !== undefined && {
          media: (media || []).map((m: { url: string; type?: string; source?: string; sortOrder?: number }, i: number) => ({
            id: generateId(),
            url: m.url,
            type: m.type || 'image',
            source: m.source || 'url',
            sortOrder: m.sortOrder ?? i,
          })),
        }),
        updatedAt: new Date().toISOString(),
      };

      const copy = [...products];
      copy[idx] = updatedProduct;
      return copy;
    }, `Update product: ${name || id}`);

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await ghUpdateJSON<Product[]>('data/products.json', (products) => {
      if (!products.some((p) => p.id === id)) {
        throw new Error('Product not found');
      }
      return products.filter((p) => p.id !== id);
    }, `Delete product: ${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
