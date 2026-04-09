import { NextRequest, NextResponse } from 'next/server';
import { saveFile } from '@/lib/file-storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const audioFile = formData.get('audio') as File | null;
    const imageFile = formData.get('image') as File | null;
    const workerId = formData.get('workerId') as string;
    const shift = formData.get('shift') as string;

    if (!audioFile && !imageFile) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const audioUrl = audioFile ? await saveFile(audioFile, 'audio') : null;
    const imageUrl = imageFile ? await saveFile(imageFile, 'image') : null;

    const uploadId = `upload-${Date.now()}`;

    return NextResponse.json({
      success: true,
      uploadId,
      audioUrl,
      imageUrl,
      workerId,
      shift,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}
