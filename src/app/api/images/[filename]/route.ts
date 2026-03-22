import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const IMAGE_DIR = process.env.IMAGE_DIR || '/tmp/frame-art-images';

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  // Sanitize filename
  const safe = path.basename(filename);
  if (safe !== filename || !safe.match(/^[\w-]+\.(jpg|jpeg|png|webp)$/i)) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }

  const filepath = path.join(IMAGE_DIR, safe);
  if (!existsSync(filepath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const buffer = await readFile(filepath);
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
