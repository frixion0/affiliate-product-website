import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const existingLog = await db.clickLog.findFirst({
      where: { productId: id, sessionId },
    });

    await db.clickLog.create({
      data: { productId: id, sessionId },
    });

    await db.product.update({
      where: { id },
      data: {
        clickCount: { increment: 1 },
        ...(existingLog ? {} : { uniqueClickCount: { increment: 1 } }),
      },
    });

    return NextResponse.json({ success: true, affiliateLink: product.affiliateLink });
  } catch (error) {
    console.error('Error logging click:', error);
    return NextResponse.json({ error: 'Failed to log click' }, { status: 500 });
  }
}
