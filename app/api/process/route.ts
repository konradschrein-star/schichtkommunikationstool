import { NextRequest, NextResponse } from 'next/server';
import { saveMarkdownReport } from '@/lib/markdown';

// Fallback processing if agents unavailable
async function fallbackProcessing(transcript: string, metadata: any) {
  const reportId = `report-${Date.now()}`;

  const content = `## Original Transkript
${transcript}

## Übersetzt & Bereinigt
*(Automatische Verarbeitung läuft im Hintergrund)*

${transcript}
`;

  await saveMarkdownReport({
    id: reportId,
    mitarbeiter: metadata.workerName || 'Unbekannt',
    workerId: metadata.workerId,
    rolle: metadata.role || 'Arbeiter',
    datum: new Date().toISOString().split('T')[0],
    zeit: new Date().toISOString().split('T')[1].split('.')[0],
    schicht: metadata.shift || 2,
    gleis: metadata.track,
    tags: ['Unverarbeitet'],
    audio_url: metadata.audioUrl,
    image_urls: metadata.imageUrl ? [metadata.imageUrl] : [],
    status: 'fallback',
  }, content);

  return { reportId, usedFallback: true };
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, workerId, workerName, role, shift, metadata } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { success: false, error: 'No transcript provided' },
        { status: 400 }
      );
    }

    try {
      // Try real agent processing
      const { processWorkerReport } = await import('@/src/agents/workflow');
      const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || '';

      if (!apiKey) {
        throw new Error('No API key configured');
      }

      const result = await processWorkerReport(
        transcript,
        {
          workerId,
          workerName: workerName || 'Unbekannt',
          profession: role,
          shiftId: `shift-${shift}`,
          shiftType: shift === 1 ? 'DAY' : 'NIGHT',
          language: 'de', // Default to German, could be detected
        },
        apiKey,
        process.env.GEMINI_API_KEY ? 'gemini' : 'anthropic'
      );

      // Check if QA agent needs follow-up
      if (!result.qaResult.isComplete) {
        return NextResponse.json({
          success: true,
          needsFollowUp: true,
          qaQuestion: result.qaResult.suggestedQuestions[0] || 'Bitte geben Sie mehr Details an.',
        });
      }

      // Save processed report
      const reportId = `report-${Date.now()}`;
      const content = result.cleanerResult?.cleanedText || transcript;

      // Extract tags from structured data
      const tags: string[] = [];
      if (result.cleanerResult?.structuredData.taskType) {
        tags.push(result.cleanerResult.structuredData.taskType);
      }
      if (result.cleanerResult?.structuredData.hindrances && result.cleanerResult.structuredData.hindrances.length > 0) {
        tags.push('Verzögerung');
      }

      // Calculate costs and delays from hindrances
      const hindrances = result.cleanerResult?.structuredData.hindrances || [];
      const totalCost = hindrances.reduce((sum, h) => sum + (h.estimatedCostEUR || 0), 0);
      const delayHours = hindrances.length > 0 ? hindrances.length * 0.5 : undefined; // Estimate

      await saveMarkdownReport({
        id: reportId,
        mitarbeiter: workerName || 'Unbekannt',
        workerId,
        rolle: role || 'Arbeiter',
        datum: new Date().toISOString().split('T')[0],
        zeit: new Date().toISOString().split('T')[1].split('.')[0],
        schicht: shift,
        tags: tags.length > 0 ? tags : ['Allgemein'],
        audio_url: metadata?.audioUrl,
        image_urls: metadata?.imageUrl ? [metadata.imageUrl] : [],
        status: 'processed',
        delay_hours: delayHours,
        estimated_cost: totalCost > 0 ? totalCost : undefined,
      }, content);

      return NextResponse.json({
        success: true,
        reportId,
        needsFollowUp: false,
      });

    } catch (agentError) {
      console.error('Agent processing failed, using fallback:', agentError);

      // Fallback: Simple processing
      const result = await fallbackProcessing(transcript, {
        workerId,
        workerName,
        role,
        shift,
        audioUrl: metadata?.audioUrl,
        imageUrl: metadata?.imageUrl,
      });

      return NextResponse.json({
        success: true,
        ...result,
      });
    }

  } catch (error) {
    console.error('Process error:', error);
    return NextResponse.json(
      { success: false, error: 'Processing failed' },
      { status: 500 }
    );
  }
}
