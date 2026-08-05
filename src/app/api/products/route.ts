import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const trending = searchParams.get('trending');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = { slug: category };
    }
    if (featured === 'true') {
      where.featured = true;
    }
    if (trending === 'true') {
      where.trending = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const orderBy: Record<string, string> = {};
    if (sort === 'price-asc') orderBy.price = 'asc';
    else if (sort === 'price-desc') orderBy.price = 'desc';
    else if (sort === 'rating') orderBy.rating = 'desc';
    else if (sort === 'popular') orderBy.reviewCount = 'desc';
    else orderBy.createdAt = 'desc';

    const products = await db.product.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
        reviews: { take: 3, orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}