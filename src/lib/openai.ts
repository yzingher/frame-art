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
