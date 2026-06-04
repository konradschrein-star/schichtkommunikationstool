/**
 * Worker Report Server Action
 *
 * Pipeline:
 * 1. Transcribe audio via Whisper
 * 2. QA Agent (validate completeness)
 * 3. Translate if Polish
 * 4. Cleaner Agent (professional report + structured data)
 * 5. Persist as Markdown file + flat-file store record
 */

'use server';

import { saveWorkerReport } from '@/lib/filesystem';
import { transcribeAudio } from '@/lib/whisper';
import { getLLMCredentials } from '@/lib/api-keys';
import { processWorkerReport } from '@/agents/workflow';
import { getShift, createWorkerReport } from '@/lib/store';
import { type MarkdownFrontmatter } from '@/types/markdown';

interface SubmitWorkerReportInput {
  audioPath: string;
  imagePaths?: string[];
  workerId: string;
  shiftId: string;
  workerName: string;
  profession?: string;
}

interface SubmitWorkerReportSuccess {
  success: true;
  reportId: string;
  markdownPath: string;
  qaResult: { isComplete: boolean; confidence: number };
}

interface SubmitWorkerReportNeedsInput {
  success: false;
  needsInput: true;
  suggestedQuestions: string[];
  partialTranscript: string;
}

interface SubmitWorkerReportError {
  success: false;
  error: string;
}

type SubmitWorkerReportResponse =
  | SubmitWorkerReportSuccess
  | SubmitWorkerReportNeedsInput
  | SubmitWorkerReportError;

export async function submitWorkerReport(
  input: SubmitWorkerReportInput
): Promise<SubmitWorkerReportResponse> {
  try {
    const { audioPath, imagePaths, workerId, shiftId, workerName, profession } = input;

    // ----- Validate shift -----
    const shift = await getShift(shiftId);
    if (!shift) {
      return { success: false, error: `Schicht ${shiftId} nicht gefunden` };
    }

    // ----- Step 1: Transcribe -----
    let transcript: string;
    let normalizedLanguage: 'de' | 'pl';
    try {
      const whisperResult = await transcribeAudio(audioPath);
      transcript = whisperResult.transcript;
      normalizedLanguage = whisperResult.language === 'pl' ? 'pl' : 'de';

      if (!transcript || transcript.trim().length === 0) {
        return { success: false, error: 'Transkription fehlgeschlagen: Leerer Text' };
      }
    } catch (whisperError) {
      console.error('Whisper transcription error:', whisperError);
      return {
        success: false,
        error: `Whisper-Fehler: ${whisperError instanceof Error ? whisperError.message : 'Unbekannter Fehler'}`,
      };
    }

    // ----- Step 2: LLM credentials -----
    let settings;
    try {
      settings = await getLLMCredentials();
    } catch (keyError) {
      console.error('LLM credential error:', keyError);
      return {
        success: false,
        error: keyError instanceof Error ? keyError.message : 'LLM nicht konfiguriert',
      };
    }

    // ----- Step 3: Agent pipeline (QA + translate + cleaner) -----
    let agentResult;
    try {
      agentResult = await processWorkerReport(
        transcript,
        {
          workerId,
          workerName,
          profession,
          shiftId,
          shiftType: shift.type,
          language: normalizedLanguage,
        },
        settings
      );
    } catch (agentError) {
      console.error('Agent pipeline error:', agentError);
      return {
        success: false,
        error: `Agent-Fehler: ${agentError instanceof Error ? agentError.message : 'Unbekannter Fehler'}`,
      };
    }

    // ----- Step 4: QA gate -----
    if (!agentResult.qaResult.isComplete) {
      return {
        success: false,
        needsInput: true,
        suggestedQuestions: agentResult.qaResult.suggestedQuestions,
        partialTranscript: transcript,
      };
    }
    if (!agentResult.cleanerResult) {
      return { success: false, error: 'Cleaner-Agent lieferte kein Ergebnis trotz bestandener QA' };
    }

    // ----- Step 5: Build frontmatter -----
    const now = new Date();
    const reportId = crypto.randomUUID();
    const cleaned = agentResult.cleanerResult;
    const hindrance = cleaned.structuredData.hindrances?.some((h) => h.isVOBRelevant) || false;

    const frontmatter: MarkdownFrontmatter = {
      id: reportId,
      workerId,
      workerName,
      profession,
      shiftId,
      date: now.toISOString().split('T')[0],
      timestamp: now.toISOString(),
      shiftType: shift.type,
      language: normalizedLanguage,
      location: cleaned.structuredData.location,
      taskType: cleaned.structuredData.taskType as MarkdownFrontmatter['taskType'],
      hindrance,
      audioFile: audioPath,
      imageFiles: imagePaths,
    };

    // ----- Step 6: Save Markdown -----
    let markdownPath: string;
    try {
      markdownPath = await saveWorkerReport(workerId, now, frontmatter, {
        rawTranscript: transcript,
        translatedText: agentResult.translatedText || '',
        cleanedText: cleaned.cleanedText,
      });
    } catch (fsError) {
      console.error('Filesystem save error:', fsError);
      return {
        success: false,
        error: `Markdown-Speicherung fehlgeschlagen: ${fsError instanceof Error ? fsError.message : 'Unbekannter Fehler'}`,
      };
    }

    // ----- Step 7: Save store record -----
    try {
      await createWorkerReport({
        id: reportId,
        shiftId,
        workerId,
        workerName,
        profession,
        language: normalizedLanguage,
        markdownPath,
        audioPath,
        imagePaths,
        rawTranscript: transcript,
        translatedTranscript: agentResult.translatedText || undefined,
        cleanedText: cleaned.cleanedText,
        qaStatus: 'approved',
        qaConfidence: agentResult.qaResult.confidence,
        location: cleaned.structuredData.location,
        taskType: cleaned.structuredData.taskType,
        hindrance,
        createdAt: now.toISOString(),
      });
    } catch (storeError) {
      console.error('Store write error:', storeError);
      return {
        success: false,
        error: `Speicherung fehlgeschlagen: ${storeError instanceof Error ? storeError.message : 'Unbekannter Fehler'}. Markdown wurde gespeichert: ${markdownPath}`,
      };
    }

    return {
      success: true,
      reportId,
      markdownPath,
      qaResult: {
        isComplete: agentResult.qaResult.isComplete,
        confidence: agentResult.qaResult.confidence,
      },
    };
  } catch (error) {
    console.error('Unexpected error in submitWorkerReport:', error);
    return {
      success: false,
      error: `Unerwarteter Fehler: ${error instanceof Error ? error.message : 'Unbekannt'}`,
    };
  }
}
