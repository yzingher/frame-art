export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

const RELAY_URL = process.env.PUSH_RELAY_URL || 'https://charlotte-turn-skip-bidding.trycloudflare.com';

export async function POST(req: NextRequest) {
  try {
    const { prompt, size, count = 1 } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const numImages = Math.min(Math.max(1, count), 6);
    
    // Generate images sequentially to avoid timeouts
    const imageUrls: string[] = [];
    for (let i = 0; i < numImages; i++) {
      const variantPrompt = numImages > 1 
        ? `${prompt} (unique variation ${i + 1} of ${numImages}, different composition and angle)`
        : prompt;
      
      const res = await fetch(`${RELAY_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: variantPrompt, size }),
        signal: AbortSignal.timeout(120000),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Generation failed');
      imageUrls.push(data.imageUrl as string);
    }

    return NextResponse.json({ 
      imageUrl: imageUrls[0],
      imageUrls,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    console.error('Generate error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
