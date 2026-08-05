import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Support both 'file' (single) and 'files' (multiple) field names
    const file = formData.get('file') as File | null;
    const files = formData.getAll('files') as File[];
    const allFiles = file ? [file, ...files] : files;

    if (allFiles.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // On Vercel (read-only filesystem), return base64 data URLs
    if (process.env.VERCEL) {
      const results = await Promise.all(allFiles.map(async (f) => {
        const bytes = await f.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        return { url: `data:${f.type};base64,${base64}`, source: 'base64' };
      }));
      return NextResponse.json({ files: results });
    }

    // Local development: save to public/uploads
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const results = await Promise.all(allFiles.map(async (f) => {
      const bytes = await f.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = f.name.split('.').pop() || 'bin';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      return { url: `/uploads/${filename}`, source: 'upload' };
    }));

    return NextResponse.json({ files: results });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
