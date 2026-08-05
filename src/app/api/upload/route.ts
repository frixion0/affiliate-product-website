import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const type = formData.get('type') || 'image';

    if (!files.length) {
      return NextResponse.json({ error: 'No files' }, { status: 400 });
    }

    const results = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || '.jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      const subdir = type === 'video' ? 'videos' : 'images';
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdir);

      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      results.push({
        url: `/uploads/${subdir}/${filename}`,
        filename,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
      });
    }

    return NextResponse.json({ files: results });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
