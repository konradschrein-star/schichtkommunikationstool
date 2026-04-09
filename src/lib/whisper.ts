// ============================================================================
// FAST-WHISPER CLIENT
// ============================================================================

const WHISPER_SERVICE_URL = process.env.WHISPER_SERVICE_URL || 'http://localhost:8000';

export interface TranscriptionResult {
  transcript: string;
  language: string;
  duration: number;
}

export interface TranscriptionOptions {
  language?: 'auto' | 'de' | 'pl';
  enableVAD?: boolean; // Voice Activity Detection
}

/**
 * Transcribes audio file using fast-whisper service
 */
export async function transcribeAudio(
  audioPath: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  const { language = 'auto', enableVAD = true } = options;

  try {
    // Read audio file
    const fs = await import('fs/promises');
    const audioBuffer = await fs.readFile(audioPath);

    // Create form data
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer]);
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('language', language);
    formData.append('vad_filter', enableVAD.toString());

    // Send to whisper service
    const response = await fetch(`${WHISPER_SERVICE_URL}/v2/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Whisper service error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    return {
      transcript: result.transcript,
      language: result.language,
      duration: result.duration,
    };
  } catch (error) {
    console.error('Transcription failed:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Transcribes audio buffer (for in-memory processing)
 */
export async function transcribeAudioBuffer(
  audioBuffer: Buffer,
  filename: string = 'audio.webm',
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  const { language = 'auto', enableVAD = true } = options;

  try {
    // Create form data
    const formData = new FormData();
    const audioBlob = new Blob([new Uint8Array(audioBuffer)]);
    formData.append('file', audioBlob, filename);
    formData.append('language', language);
    formData.append('vad_filter', enableVAD.toString());

    // Send to whisper service
    const response = await fetch(`${WHISPER_SERVICE_URL}/v2/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Whisper service error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    return {
      transcript: result.transcript,
      language: result.language,
      duration: result.duration,
    };
  } catch (error) {
    console.error('Transcription failed:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Checks if whisper service is available
 */
export async function checkWhisperServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${WHISPER_SERVICE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Gets whisper service info (model version, etc.)
 */
export async function getWhisperServiceInfo(): Promise<{
  model: string;
  device: string;
  version: string;
} | null> {
  try {
    const response = await fetch(`${WHISPER_SERVICE_URL}/info`, {
      method: 'GET',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}
