import { writeFile, readdir, readFile, unlink } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const IMAGE_DIR = process.env.IMAGE_DIR || '/tmp/frame-art-images';

export function ensureImageDir() {
  if (!existsSync(IMAGE_DIR)) {
    mkdirSync(IMAGE_DIR, { recursive: true });
  }
}

export async function saveImage(buffer: Buffer, ext = 'jpg'): Promise<string> {
  ensureImageDir();
  const id = crypto.randomUUID();
  const filename = `${id}.${ext}`;
  const filepath = path.join(IMAGE_DIR, filename);
  await writeFile(filepath, buffer);
  return `/api/images/${filename}`;
}

export async function getImagePath(filename: string): Promise<string> {
  return path.join(IMAGE_DIR, filename);
}

export async function listImages(): Promise<string[]> {
  ensureImageDir();
  const files = await readdir(IMAGE_DIR);
  return files
    .filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i))
    .sort()
    .reverse()
    .map(f => `/api/images/${f}`);
}

export async function deleteImage(filename: string): Promise<void> {
  const filepath = path.join(IMAGE_DIR, filename);
  if (existsSync(filepath)) {
    await unlink(filepath);
  }
}
