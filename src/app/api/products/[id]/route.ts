import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, comparePrice, affiliateLink, categoryId, featured, media } = body;

    // If media is provided, delete old and recreate
    if (media !== undefined) {
      await db.productMedia.deleteMany({ where: { productId: id } });
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(comparePrice !== undefined && { comparePrice: comparePrice ? parseFloat(comparePrice) : null }),
        ...(affiliateLink !== undefined && { affiliateLink }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(featured !== undefined && { featured }),
        ...(media !== undefined && {
          media: {
            create: (media || []).map((m: { url: string; type: string; source: string; sortOrder: number }, i: number) => ({
              url: m.url,
              type: m.type || 'image',
              source: m.source || 'url',
              sortOrder: m.sortOrder ?? i,
            })),
          },
        }),
      },
      include: {
        category: { select: { name: true, slug: true } },
        media: true,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete media first (cascade should handle this, but be explicit)
    await db.productMedia.deleteMany({ where: { productId: id } });
    await db.clickLog.deleteMany({ where: { productId: id } });
    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
