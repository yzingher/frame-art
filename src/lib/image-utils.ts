import sharp from 'sharp';

export async function rotateImage90(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer).rotate(90).jpeg({ quality: 95 }).toBuffer();
}

export async function toJpeg(buffer: Buffer, quality = 95): Promise<Buffer> {
  return sharp(buffer).jpeg({ quality }).toBuffer();
}

export async function resizeForTV(buffer: Buffer, landscape = false): Promise<Buffer> {
  const width = landscape ? 1792 : 1024;
  const height = landscape ? 1024 : 1792;
  return sharp(buffer)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 95 })
    .toBuffer();
}
