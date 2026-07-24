import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await db.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Also fetch related products
    const related = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      include: { category: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({ product, related });
  } catch (error) {
    console.error('Product detail API error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
