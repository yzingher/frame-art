export const runtime = 'nodejs';
import type { TV } from '@/types';

const PUSH_SERVER = process.env.PUSH_SERVER_URL || 'http://167.235.150.189:7842';

export async function pushImageToTV(imageBuffer: Buffer, tv: TV): Promise<void> {
  const imageData = imageBuffer.toString('base64');
  
  const response = await fetch(`${PUSH_SERVER}/push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData, tvIds: [tv.id] }),
    signal: AbortSignal.timeout(60000),
  });
  
  if (!response.ok) {
    throw new Error(`Push server error: ${response.status}`);
  }
  
  const result = await response.json();
  const tvResult = result[tv.id];
  
  if (!tvResult?.ok) {
    throw new Error(tvResult?.msg || 'Push failed');
  }
}
