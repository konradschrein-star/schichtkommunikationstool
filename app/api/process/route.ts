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
      const { runAgentWorkflow } = await import('@/src/agents/workflow');

      const result = await runAgentWorkflow({
        transcript,
        workerId,
        shift,
      });

      // Check if QA agent needs follow-up
      if (result.needsFollowUp) {
        return NextResponse.json({
          success: true,
          needsFollowUp: true,
          qaQuestion: result.qaQuestion,
        });
      }

      // Save processed report
      const reportId = `report-${Date.now()}`;
      await saveMarkdownReport({
        id: reportId,
        mitarbeiter: workerName || 'Unbekannt',
        workerId,
        rolle: role || 'Arbeiter',
        datum: new Date().toISOString().split('T')[0],
        zeit: new Date().toISOString().split('T')[1].split('.')[0],
        schicht: shift,
        tags: result.tags || [],
        audio_url: metadata?.audioUrl,
        image_urls: metadata?.imageUrl ? [metadata.imageUrl] : [],
        status: 'processed',
        delay_hours: result.delayHours,
        estimated_cost: result.estimatedCost,
      }, result.markdown);

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
