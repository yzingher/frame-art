export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

const TV_PUSH_URL = process.env.TV_PUSH_URL || 'https://charlotte-turn-skip-bidding.trycloudflare.com';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, tvIds } = await req.json();

    if (!imageUrl || !tvIds?.length) {
      return NextResponse.json({ error: 'imageUrl and tvIds are required' }, { status: 400 });
    }

    // Fetch the image
    const imgResp = await fetch(imageUrl.startsWith('http') ? imageUrl : `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}${imageUrl}`);
    if (!imgResp.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
    }
    const imgBuffer = await imgResp.arrayBuffer();
    const imageData = Buffer.from(imgBuffer).toString('base64');

    // Call the OpenClaw push relay
    const pushResp = await fetch(`${TV_PUSH_URL}/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageData, tvIds }),
    });

    if (!pushResp.ok) {
      const err = await pushResp.text();
      return NextResponse.json({ error: `Push relay error: ${err}` }, { status: 500 });
    }

    const results = await pushResp.json();
    const allOk = Object.values(results).every((r: any) => r.ok);

    return NextResponse.json({
      success: allOk,
      results,
      message: allOk ? 'Pushed to all TVs' : 'Some TVs failed',
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
