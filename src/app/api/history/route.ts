export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { listImages } from '@/lib/storage';

export async function GET(_req: NextRequest) {
  try {
    const images = await listImages();
    return NextResponse.json({ items: images, total: images.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch history';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
