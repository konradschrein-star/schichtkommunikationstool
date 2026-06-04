/**
 * Audio/Image Upload API Route
 *
 * Handles multipart/form-data uploads from the Worker UI.
 * Saves files to local filesystem under /data/media/{workerId}/
 *
 * Usage:
 * POST /api/upload/audio
 * FormData: {
 *   audio: Blob (webm/wav/mp3),
 *   images?: Blob[] (jpg/png),
 *   workerId: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveAudioFile, saveImageFile } from '@/lib/filesystem';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for large uploads

interface UploadResponse {
  success: boolean;
  audioPath?: string;
  imagePaths?: string[];
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await req.formData();

    // Extract workerId
    const workerId = formData.get('workerId') as string | null;
    if (!workerId) {
      return NextResponse.json(
        { success: false, error: 'Missing workerId' },
        { status: 400 }
      );
    }

    // Validate id format (no path traversal). Accepts seeded ids like "u-piotr"
    // as well as UUIDs.
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(workerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workerId format' },
        { status: 400 }
      );
    }

    let audioPath: string | undefined;
    const imagePaths: string[] = [];

    // Process audio file
    const audioFile = formData.get('audio') as Blob | null;
    if (audioFile) {
      // Validate audio file type
      const audioMimeTypes = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg'];
      const audioType = audioFile.type.split(';')[0].trim();
      if (!audioMimeTypes.includes(audioType)) {
        return NextResponse.json(
          { success: false, error: `Invalid audio type: ${audioFile.type}. Allowed: webm, mp4, wav, mp3, ogg` },
          { status: 400 }
        );
      }

      // Validate size (max 50MB)
      if (audioFile.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'Audio file too large (max 50MB)' },
          { status: 413 }
        );
      }

      // Convert Blob to Buffer
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

      // Save with appropriate extension (saveAudioFile maps from a mime hint)
      audioPath = await saveAudioFile(audioBuffer, workerId, audioType);
    }

    // Process image files (multiple possible)
    const imageFiles = formData.getAll('images') as Blob[];
    for (const imageFile of imageFiles) {
      if (!imageFile || !(imageFile instanceof Blob)) {
        continue; // Skip invalid entries
      }

      // Validate image type
      const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!imageMimeTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid image type: ${imageFile.type}. Allowed: jpg, png, webp` },
          { status: 400 }
        );
      }

      // Validate size (max 10MB per image)
      if (imageFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'Image file too large (max 10MB per image)' },
          { status: 413 }
        );
      }

      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

      // Determine extension
      const extension = imageFile.type === 'image/png' ? 'png'
        : imageFile.type === 'image/webp' ? 'webp'
        : 'jpg';

      const imagePath = await saveImageFile(imageBuffer, workerId, extension);
      imagePaths.push(imagePath);
    }

    // Return success with file paths
    return NextResponse.json({
      success: true,
      audioPath,
      imagePaths: imagePaths.length > 0 ? imagePaths : undefined,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      },
      { status: 500 }
    );
  }
}
