import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function enhancePrompt(userPrompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an expert art director. Transform the user\'s simple prompt into a rich, detailed art description optimized for DALL-E 3 to generate gallery-quality artwork. Focus on composition, lighting, mood, color palette, and artistic style. Keep it under 200 words. Return only the enhanced prompt, no explanation.',
      },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 300,
  });
  return response.choices[0]?.message?.content || userPrompt;
}

export async function generateStyleTransferPrompt(
  imageBase64: string,
  style: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert art director. Analyze the provided reference image and create a DALL-E 3 prompt that recreates the subject/scene in ${style} style. Describe the key elements, composition, and subjects from the image, then specify how they should be rendered in ${style} style. Be specific about artistic techniques, color palette, and mood. Return only the prompt, no explanation.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
          {
            type: 'text',
            text: `Create a DALL-E prompt to render this image in ${style} style.`,
          },
        ],
      },
    ],
    max_tokens: 400,
  });
  return response.choices[0]?.message?.content || `${style} style artwork`;
}

export async function generateStyleFromPhotos(
  images: string[],
  userPrompt: string
): Promise<string> {
  const imageContent = images.map(img => ({
    type: 'image_url' as const,
    image_url: { url: `data:image/jpeg;base64,${img}` },
  }));

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert art director. Analyze the provided reference photos and the user\'s description to create a detailed DALL-E 3 prompt. Describe the subjects from the photos (appearance, clothing, expressions) and combine them with the requested scene or style. Create a rich, gallery-quality art description. Return only the DALL-E prompt, no explanation. Keep under 400 words.',
      },
      {
        role: 'user',
        content: [
          ...imageContent,
          {
            type: 'text',
            text: `Create a DALL-E 3 prompt incorporating the people/subjects from these reference photos with this scene/style: ${userPrompt}`,
          },
        ],
      },
    ],
    max_tokens: 500,
  });
  return response.choices[0]?.message?.content || userPrompt;
}
