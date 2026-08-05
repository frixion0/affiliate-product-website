import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // On Vercel (read-only filesystem), return base64 data URL
    if (process.env.VERCEL) {
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ url: dataUrl, source: 'base64' });
    }

    // Local development: save to public/uploads
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split('.').pop() || 'bin';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}`, source: 'upload' });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
