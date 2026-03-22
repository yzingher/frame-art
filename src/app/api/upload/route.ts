import { NextRequest, NextResponse } from 'next/server';
import { saveImage } from '@/lib/storage';
import { toJpeg } from '@/lib/image-utils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const jpegBuffer = await toJpeg(buffer);
    const imageUrl = await saveImage(jpegBuffer);

    return NextResponse.json({ imageUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    console.error('Upload error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
