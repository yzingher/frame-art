export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getTVsByIds } from '@/lib/tv-config';
import { pushImageToTV } from '@/lib/tv-push';
import { rotateImage90, toJpeg } from '@/lib/image-utils';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

const IMAGE_DIR = process.env.IMAGE_DIR || '/tmp/frame-art-images';

async function fetchImageBuffer(imageUrl: string): Promise<Buffer> {
  // Handle local API path
  if (imageUrl.startsWith('/api/images/')) {
    const filename = path.basename(imageUrl);
    const safe = path.basename(filename);
    const filepath = path.join(IMAGE_DIR, safe);
    if (existsSync(filepath)) {
      return readFile(filepath);
    }
  }

  // Handle absolute URL
  const fetchUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:${process.env.PORT || 3000}${imageUrl}`;
  const response = await fetch(fetchUrl);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, tvIds } = await req.json();

    if (!imageUrl || !tvIds?.length) {
      return NextResponse.json({ error: 'imageUrl and tvIds are required' }, { status: 400 });
    }

    const tvs = getTVsByIds(tvIds);
    if (!tvs.length) {
      return NextResponse.json({ error: 'No valid TVs found' }, { status: 400 });
    }

    const rawBuffer = await fetchImageBuffer(imageUrl);
    const baseBuffer = await toJpeg(rawBuffer);

    // Push to each TV concurrently
    const results = await Promise.allSettled(
      tvs.map(async (tv) => {
        let buffer = baseBuffer;
        if (tv.rotate90) {
          buffer = await rotateImage90(baseBuffer);
        }
        await pushImageToTV(buffer, tv);
        return { tvId: tv.id, status: 'success' as const };
      })
    );

    const pushResults = results.map((result, i) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          tvId: tvs[i].id,
          status: 'error' as const,
          error: result.reason?.message || 'Unknown error',
        };
      }
    });

    return NextResponse.json({ results: pushResults });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Push failed';
    console.error('Push error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
