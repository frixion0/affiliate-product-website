import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || !url.includes('amazon')) {
      return NextResponse.json({ error: 'Not an Amazon URL' }, { status: 400 });
    }

    // Attempt to fetch Amazon product page
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error('Fetch failed');
      const html = await res.text();

      // Parse basic info
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
      const title = titleMatch
        ? titleMatch[1].replace(/\s*[:\-|]\s*Amazon\.com.*$/, '').trim()
        : '';

      // Try to find main image
      const imgMatch = html.match(/"hiRes":"(https?:[^"]+)"/);
      const image = imgMatch ? imgMatch[1].replace(/\\u002F/g, '/') : '';

      // Try to find price
      const priceMatch = html.match(/"priceAmount":"([\d.]+)"/);
      const price = priceMatch ? parseFloat(priceMatch[1]) : null;

      const data: Record<string, any> = {};
      if (title) data.name = title;
      if (image) data.image = image;
      if (price) data.price = price;
      data.autoFetched = true;
      data.partial = !title || !image;

      return NextResponse.json(data);
    } catch {
      clearTimeout(timeout);
      return NextResponse.json({
        autoFetched: false,
        partial: true,
        message: 'Could not fetch product data. Please enter details manually.',
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
