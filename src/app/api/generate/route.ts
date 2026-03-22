export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { openai, enhancePrompt } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, enhance, size } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    let finalPrompt = prompt.trim();
    let enhancedPrompt: string | undefined;

    if (enhance) {
      enhancedPrompt = await enhancePrompt(finalPrompt);
      finalPrompt = enhancedPrompt;
    }

    const imageSize = size === 'landscape' ? '1792x1024' : '1024x1024';

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: finalPrompt,
      n: 1,
      size: imageSize as '1024x1024' | '1792x1024',
      quality: 'hd',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) throw new Error('No image URL returned');

    // Return the OpenAI URL directly (valid for ~1 hour)
    return NextResponse.json({ imageUrl, enhancedPrompt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    console.error('Generate error full:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error('API key present:', !!process.env.OPENAI_API_KEY);
    return NextResponse.json({ error: message, debug: process.env.NODE_ENV === 'development' ? String(err) : undefined }, { status: 500 });
  }
}
