export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

const RELAY_URL = process.env.PUSH_RELAY_URL || 'https://ranking-wisdom-bulletin-mysimon.trycloudflare.com';

export async function POST(req: NextRequest) {
  try {
    const { prompt, size } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Delegate generation to OpenClaw relay (has OpenAI key + filesystem)
    const relayResp = await fetch(`${RELAY_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt.trim(), size: size || 'square' }),
    });

    const data = await relayResp.json();

    if (!relayResp.ok || data.error) {
      throw new Error(data.error || 'Generation failed');
    }

    // Convert relay-images URL to full relay URL so browser can fetch it
    const imageUrl = data.imageUrl.startsWith('/relay-images/')
      ? `${RELAY_URL}${data.imageUrl}`
      : data.imageUrl;

    return NextResponse.json({ imageUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    console.error('Generate error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
