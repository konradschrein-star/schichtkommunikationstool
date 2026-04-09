/**
 * Worker Report Server Actions
 *
 * Handles the complete worker report submission pipeline:
 * 1. Transcribe audio via Whisper
 * 2. Run QA Agent (validate completeness)
 * 3. Translate if Polish
 * 4. Run Cleaner Agent (format professional report)
 * 5. Save to DB + Markdown file
 */

'use server';

import { db } from '@/db';
import { workerReports, shifts } from '@/db/schema';
import { saveWorkerReport } from '@/lib/filesystem';
import { transcribeAudio } from '@/lib/whisper';
import { getUserApiKey } from '@/lib/api-keys';
import { processWorkerReport } from '@/agents/workflow';
import { createInitialFrontmatter, type MarkdownFrontmatter } from '@/types/markdown';
import { eq } from 'drizzle-orm';

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
  qaResult: {
    isComplete: boolean;
    confidence: number;
  };
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

    // ============================================================================
    // VALIDATION
    // ============================================================================

    // Validate shift exists
    const shift = await db.query.shifts.findFirst({
      where: eq(shifts.id, shiftId),
    });

    if (!shift) {
      return {
        success: false,
        error: `Shift ${shiftId} not found`,
      };
    }

    // ============================================================================
    // STEP 1: TRANSCRIBE AUDIO
    // ============================================================================

    let transcript: string;
    let detectedLanguage: string;
    let normalizedLanguage: 'de' | 'pl';

    try {
      const whisperResult = await transcribeAudio(audioPath);
      transcript = whisperResult.transcript;
      detectedLanguage = whisperResult.language;

      // Normalize language to supported values ('de' or 'pl')
      normalizedLanguage = detectedLanguage === 'pl' ? 'pl' : 'de';

      if (!transcript || transcript.trim().length === 0) {
        return {
          success: false,
          error: 'Transkription fehlgeschlagen: Leerer Text',
        };
      }
    } catch (whisperError) {
      console.error('Whisper transcription error:', whisperError);
      return {
        success: false,
        error: `Whisper-Fehler: ${whisperError instanceof Error ? whisperError.message : 'Unbekannter Fehler'}`,
      };
    }

    // ============================================================================
    // STEP 2: GET API KEY FOR AGENT PIPELINE
    // ============================================================================

    let apiKey: string;
    let llmProvider: 'anthropic' | 'openai' | 'gemini';

    try {
      const keyData = await getUserApiKey('BOSS');
      apiKey = keyData.decrypted;
      llmProvider = keyData.provider;
    } catch (keyError) {
      console.error('API key retrieval error:', keyError);
      return {
        success: false,
        error: 'LLM API-Schlüssel nicht konfiguriert. Bitte in den Einstellungen hinterlegen.',
      };
    }

    // ============================================================================
    // STEP 3: RUN AGENT PIPELINE (QA + CLEANER)
    // ============================================================================

    const frontmatterPartial = {
      workerId,
      workerName,
      profession,
      shiftId,
      shiftType: shift.type,
      language: normalizedLanguage,
    };

    let agentResult;
    try {
      agentResult = await processWorkerReport(
        transcript,
        frontmatterPartial,
        apiKey,
        llmProvider
      );
    } catch (agentError) {
      console.error('Agent pipeline error:', agentError);
      return {
        success: false,
        error: `Agent-Fehler: ${agentError instanceof Error ? agentError.message : 'Unbekannter Fehler'}`,
      };
    }

    // ============================================================================
    // STEP 4: CHECK QA RESULT
    // ============================================================================

    if (!agentResult.qaResult.isComplete) {
      return {
        success: false,
        needsInput: true,
        suggestedQuestions: agentResult.qaResult.suggestedQuestions,
        partialTranscript: transcript,
      };
    }

    // QA passed, must have cleaner result
    if (!agentResult.cleanerResult) {
      return {
        success: false,
        error: 'Cleaner-Agent lieferte kein Ergebnis trotz bestandener QA',
      };
    }

    // ============================================================================
    // STEP 5: CONSTRUCT FULL FRONTMATTER
    // ============================================================================

    const now = new Date();
    const reportId = crypto.randomUUID();

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

      // Extracted from Cleaner Agent
      location: agentResult.cleanerResult.structuredData.location,
      taskType: agentResult.cleanerResult.structuredData.taskType as any,

      // Optional fields (extracted from hindrances or set to undefined)
      materialUsed: undefined, // Not extracted by cleaner agent
      machineHours: undefined, // Not extracted by cleaner agent
      delayMinutes: undefined, // Could be calculated from hindrances in future
      hindrance: agentResult.cleanerResult.structuredData.hindrances?.some(h => h.isVOBRelevant) || false,
      tags: undefined, // Not extracted by cleaner agent

      // Media
      audioFile: audioPath,
      imageFiles: imagePaths,
    };

    // ============================================================================
    // STEP 6: SAVE TO MARKDOWN FILE
    // ============================================================================

    let markdownPath: string;

    try {
      markdownPath = await saveWorkerReport(
        workerId,
        now,
        frontmatter,
        {
          rawTranscript: transcript,
          translatedText: agentResult.translatedText || '',
          cleanedText: agentResult.cleanerResult.cleanedText,
        }
      );
    } catch (fsError) {
      console.error('Filesystem save error:', fsError);
      return {
        success: false,
        error: `Markdown-Speicherung fehlgeschlagen: ${fsError instanceof Error ? fsError.message : 'Unbekannter Fehler'}`,
      };
    }

    // ============================================================================
    // STEP 7: SAVE TO DATABASE
    // ============================================================================

    try {
      await db.insert(workerReports).values({
        id: reportId,
        shiftId,
        workerId,
        markdownPath,
        audioPath,
        rawTranscript: transcript,
        translatedTranscript: agentResult.translatedText || null,
        cleanedText: agentResult.cleanerResult.cleanedText,
        qaStatus: 'approved',
        qaFeedback: {
          confidence: agentResult.qaResult.confidence,
          missingFields: [],
        },
        frontmatterTags: {
          location: frontmatter.location,
          taskType: frontmatter.taskType,
          materialUsed: frontmatter.materialUsed,
          hindrance: frontmatter.hindrance,
          estimatedDelay: frontmatter.delayMinutes,
        },
        status: 'CLEANED',
      });
    } catch (dbError) {
      console.error('Database insert error:', dbError);
      // Markdown file is saved, but DB failed - log this for manual recovery
      return {
        success: false,
        error: `Datenbank-Fehler: ${dbError instanceof Error ? dbError.message : 'Unbekannter Fehler'}. Markdown-Datei wurde trotzdem gespeichert unter: ${markdownPath}`,
      };
    }

    // ============================================================================
    // SUCCESS
    // ============================================================================

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
