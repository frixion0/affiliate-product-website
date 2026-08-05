import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

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

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.name = { contains: search };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    type OrderBy = Record<string, string>;
    let orderBy: OrderBy = { createdAt: 'desc' };

    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { clickCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { name: true, slug: true } },
          media: {
            orderBy: { sortOrder: 'asc' },
            select: { id: true, url: true, type: true, source: true, sortOrder: true },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
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

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();

    const product = await db.product.create({
      data: {
        name,
        slug,
        description: description || '',
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        affiliateLink,
        categoryId: categoryId || null,
        featured: featured || false,
        media: {
          create: (media || []).map((m: { url: string; type: string; source: string; sortOrder: number }, i: number) => ({
            url: m.url,
            type: m.type || 'image',
            source: m.source || 'url',
            sortOrder: m.sortOrder ?? i,
          })),
        },
      },
      include: {
        category: { select: { name: true, slug: true } },
        media: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
