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
    
    // Generate multiple images in parallel
    const promises = Array.from({ length: numImages }, async (_, i) => {
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
      return data.imageUrl as string;
    });

    const imageUrls = await Promise.all(promises);

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
