export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

const RELAY = process.env.PUSH_RELAY_URL || 'https://oem-psychology-gardening-tracks.trycloudflare.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${RELAY}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Generation failed');
    
    // Rewrite relay-images URL to go through relay
    if (data.imageUrl?.startsWith('/relay-images/')) {
      data.imageUrl = `${RELAY}${data.imageUrl}`;
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
