import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const days = parseInt(searchParams.get('days') || '30');
    const since = new Date(Date.now() - days * 86400000);

    // Per-product stats
    const productStats = await db.product.findMany({
      orderBy: { clickCount: 'desc' },
      take: 50,
      select: { id: true, name: true, clickCount: true, uniqueClickCount: true },
    });

    // Click logs for chart data
    const logs = await db.clickLog.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, productId: true, sessionId: true },
      orderBy: { createdAt: 'asc' },
    });

    // Total stats
    const totals = await db.product.aggregate({
      _sum: { clickCount: true, uniqueClickCount: true },
      _count: true,
    });

    // Build time-series data
    const timeSeries: Record<string, { total: number; unique: number }> = {};
    const sessionSet = new Set<string>();

    for (const log of logs) {
      let key: string;
      const d = new Date(log.createdAt);
      if (period === 'hourly') {
        key = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
      } else if (period === 'weekly') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = `Week of ${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      } else if (period === 'monthly') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      if (!timeSeries[key]) timeSeries[key] = { total: 0, unique: 0 };
      timeSeries[key].total++;
      const sKey = `${log.productId}-${log.sessionId}-${key}`;
      if (!sessionSet.has(sKey)) {
        sessionSet.add(sKey);
        timeSeries[key].unique++;
      }
    }

    // Recent click logs
    const recentLogs = await db.clickLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { name: true } } },
    });

    return NextResponse.json({
      totals: {
        totalClicks: totals._sum.clickCount || 0,
        totalUnique: totals._sum.uniqueClickCount || 0,
        totalProducts: totals._count,
      },
      productStats,
      timeSeries: Object.entries(timeSeries).map(([date, data]) => ({ date, ...data })),
      recentLogs,
    });
  } catch (error) {
    console.error('Clicks stats error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
