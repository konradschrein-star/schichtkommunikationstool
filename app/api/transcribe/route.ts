import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

// Fallback transcription if Whisper unavailable
const FALLBACK_TRANSCRIPT = "[Transkription nicht verfügbar - Demo-Modus]";

export async function POST(request: NextRequest) {
  try {
    const { audioUrl, language = 'pl' } = await request.json();

    if (!audioUrl) {
      return NextResponse.json(
        { success: false, error: 'No audio URL provided' },
        { status: 400 }
      );
    }

    // Convert URL to filesystem path
    const audioPath = path.join(process.cwd(), 'data', audioUrl.replace('/media/', 'media/'));

    try {
      // Try real transcription (import dynamically to avoid errors if service not ready)
      const { transcribe } = await import('@/src/lib/whisper');
      const transcript = await transcribe(audioPath, language);

      return NextResponse.json({
        success: true,
        transcript,
        confidence: 0.95,
        language,
        duration: 10,
      });

    } catch (whisperError) {
      console.error('Whisper transcription failed, using fallback:', whisperError);

      // Fallback: Return mock transcript
      return NextResponse.json({
        success: true,
        transcript: FALLBACK_TRANSCRIPT,
        confidence: 0,
        language,
        duration: 0,
        usedFallback: true,
      });
    }

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { success: false, error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
