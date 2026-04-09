import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function saveFile(
  file: File,
  type: 'audio' | 'image'
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Ensure directory exists
  const uploadDir = path.join(process.cwd(), 'data', 'media');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const extension = file.name.split('.').pop();
  const filename = `${timestamp}-${randomSuffix}.${extension}`;

  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);

  return `/media/${filename}`;
}
