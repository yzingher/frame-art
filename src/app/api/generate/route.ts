export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

const RELAY_URL = process.env.PUSH_RELAY_URL || 'https://understanding-hear-placing-sight.trycloudflare.com';

export async function POST(req: NextRequest) {
  try {
    const { prompt, size, index = 0, total = 1 } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const variantPrompt = total > 1
      ? `${prompt} (unique variation ${index + 1} of ${total}, distinctly different composition, angle, and color scheme from other variations)`
      : prompt;

    const res = await fetch(`${RELAY_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: variantPrompt, size }),
      signal: AbortSignal.timeout(120000),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Generation failed');

    return NextResponse.json({ imageUrl: data.imageUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    console.error('Generate error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
