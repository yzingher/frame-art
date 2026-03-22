export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getTVsByIds } from '@/lib/tv-config';
import { rotateImage90, toJpeg } from '@/lib/image-utils';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

const IMAGE_DIR = process.env.IMAGE_DIR || '/tmp/frame-art-images';
const PUSH_RELAY_URL = process.env.PUSH_RELAY_URL || 'https://charlotte-turn-skip-bidding.trycloudflare.com';

async function fetchImageBuffer(imageUrl: string): Promise<Buffer> {
  if (imageUrl.startsWith('/api/images/')) {
    const filename = path.basename(imageUrl);
    const filepath = path.join(IMAGE_DIR, path.basename(filename));
    if (existsSync(filepath)) {
      return readFile(filepath);
    }
  }
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
    const imageData = baseBuffer.toString('base64');

    // Call the OpenClaw push relay
    const relayResp = await fetch(`${PUSH_RELAY_URL}/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageData, tvIds }),
    });

    if (!relayResp.ok) {
      throw new Error(`Relay error: ${relayResp.status}`);
    }

    const results = await relayResp.json();

    const successful = Object.values(results as Record<string, {ok: boolean}>).filter(r => r.ok).length;
    const failed = Object.values(results as Record<string, {ok: boolean}>).filter(r => !r.ok).length;

    return NextResponse.json({
      success: true,
      message: `Pushed to ${successful} TV${successful !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}`,
      results,
    });
  } catch (error) {
    console.error('Push error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to push to TVs' },
      { status: 500 }
    );
  }
}
