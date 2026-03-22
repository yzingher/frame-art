export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { openai, generateStyleTransferPrompt } from '@/lib/openai';
import { saveImage } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const { referenceImageBase64, style } = await req.json();

    if (!referenceImageBase64 || !style) {
      return NextResponse.json({ error: 'Reference image and style are required' }, { status: 400 });
    }

    const dallePrompt = await generateStyleTransferPrompt(referenceImageBase64, style);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: dallePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) throw new Error('No image URL returned');

    // Download and save locally using native fetch
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) throw new Error(`Failed to download image: ${imgResponse.status}`);
    const buffer = Buffer.from(await imgResponse.arrayBuffer());
    const localUrl = await saveImage(buffer);

    return NextResponse.json({ imageUrl: localUrl, description: dallePrompt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Style transfer failed';
    console.error('Style error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
