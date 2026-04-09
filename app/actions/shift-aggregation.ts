/**
 * Shift Aggregation Server Actions
 *
 * Handles shift completion and aggregation:
 * 1. Fetch all worker reports for the shift
 * 2. Run Shift Aggregator (summary for shift leader)
 * 3. Run Boss KPI Agent (analytics for management)
 * 4. Save aggregation + KPIs to database
 * 5. Update shift status to 'completed'
 */

'use server';

import { db } from '@/db';
import { shiftAggregations, shifts, workerReports } from '@/db/schema';
import { getAllReportsForShift, saveShiftAggregation, saveBossKPIs } from '@/lib/filesystem';
import { getUserApiKey } from '@/lib/api-keys';
import { processShiftCompletion } from '@/agents/workflow';
import { eq, and } from 'drizzle-orm';

interface CompleteShiftInput {
  shiftId: string;
}

interface CompleteShiftSuccess {
  success: true;
  aggregationId: string;
  summaryPath: string;
  kpisPath: string;
  stats: {
    totalReports: number;
    totalWorkers: number;
    productivityScore: number;
    hindranceEvents: number;
  };
}

interface CompleteShiftError {
  success: false;
  error: string;
}

type CompleteShiftResponse = CompleteShiftSuccess | CompleteShiftError;

export async function completeShift(
  input: CompleteShiftInput
): Promise<CompleteShiftResponse> {
  try {
    const { shiftId } = input;

    // ============================================================================
    // VALIDATION
    // ============================================================================

    // Check if shift exists
    const shift = await db.query.shifts.findFirst({
      where: eq(shifts.id, shiftId),
    });

    if (!shift) {
      return {
        success: false,
        error: `Schicht ${shiftId} nicht gefunden`,
      };
    }

    // Check if already completed
    if (shift.status === 'completed') {
      return {
        success: false,
        error: 'Schicht wurde bereits abgeschlossen',
      };
    }

    // Check if aggregation already exists
    const existingAggregation = await db.query.shiftAggregations.findFirst({
      where: eq(shiftAggregations.shiftId, shiftId),
    });

    if (existingAggregation) {
      return {
        success: false,
        error: 'Aggregation für diese Schicht existiert bereits',
      };
    }

    // ============================================================================
    // STEP 1: FETCH ALL WORKER REPORTS
    // ============================================================================

    let reportFrontmatters;
    try {
      reportFrontmatters = await getAllReportsForShift(shiftId);
    } catch (fsError) {
      console.error('Error fetching reports from filesystem:', fsError);
      return {
        success: false,
        error: `Fehler beim Laden der Reports: ${fsError instanceof Error ? fsError.message : 'Unbekannt'}`,
      };
    }

    if (reportFrontmatters.length === 0) {
      return {
        success: false,
        error: 'Keine Worker-Reports für diese Schicht gefunden',
      };
    }

    // Also fetch from DB for additional metadata
    const dbReports = await db.query.workerReports.findMany({
      where: eq(workerReports.shiftId, shiftId),
    });

    if (dbReports.length !== reportFrontmatters.length) {
      console.warn(
        `Mismatch: ${reportFrontmatters.length} Markdown files vs ${dbReports.length} DB records`
      );
    }

    // ============================================================================
    // STEP 2: GET API KEY FOR AGENTS
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
        error: 'LLM API-Schlüssel nicht konfiguriert',
      };
    }

    // ============================================================================
    // STEP 3: PREPARE SHIFT METADATA
    // ============================================================================

    const shiftMeta = {
      shiftId,
      date: shift.date.toISOString().split('T')[0],
      type: shift.type,
      projectName: shift.projectName,
      totalWorkers: new Set(reportFrontmatters.map((r) => r.frontmatter.workerId)).size,
      totalReports: reportFrontmatters.length,
    };

    // ============================================================================
    // STEP 4: RUN AGGREGATION PIPELINE (PARALLEL)
    // ============================================================================

    let aggregationResult;
    try {
      // Transform reports to match expected structure
      const transformedReports = reportFrontmatters.map((r) => ({
        workerName: r.frontmatter.workerName,
        profession: r.frontmatter.profession,
        content: r.content,
        frontmatter: {
          location: r.frontmatter.location,
          taskType: r.frontmatter.taskType,
          materialUsed: r.frontmatter.materialUsed,
          machineHours: r.frontmatter.machineHours,
          delayMinutes: r.frontmatter.delayMinutes,
          hindrance: r.frontmatter.hindrance,
        },
      }));

      aggregationResult = await processShiftCompletion(
        {
          reports: transformedReports,
          shiftMeta: shiftMeta
        },
        apiKey,
        llmProvider
      );
    } catch (agentError) {
      console.error('Agent pipeline error:', agentError);
      return {
        success: false,
        error: `Agent-Fehler: ${agentError instanceof Error ? agentError.message : 'Unbekannt'}`,
      };
    }

    const { aggregation: aggregationOutput, kpis: kpiOutput } = aggregationResult;

    // ============================================================================
    // STEP 5: SAVE AGGREGATION TO MARKDOWN
    // ============================================================================

    let summaryPath: string;
    try {
      summaryPath = await saveShiftAggregation(
        shiftId,
        new Date(shift.date),
        shift.type,
        aggregationOutput.summaryText
      );
    } catch (fsError) {
      console.error('Error saving shift aggregation markdown:', fsError);
      return {
        success: false,
        error: `Fehler beim Speichern der Schicht-Zusammenfassung: ${fsError instanceof Error ? fsError.message : 'Unbekannt'}`,
      };
    }

    // ============================================================================
    // STEP 6: SAVE BOSS KPIS TO JSON
    // ============================================================================

    let kpisPath: string;
    try {
      kpisPath = await saveBossKPIs(
        shiftId,
        new Date(shift.date),
        kpiOutput
      );
    } catch (fsError) {
      console.error('Error saving boss KPIs:', fsError);
      return {
        success: false,
        error: `Fehler beim Speichern der KPIs: ${fsError instanceof Error ? fsError.message : 'Unbekannt'}`,
      };
    }

    // ============================================================================
    // STEP 7: SAVE TO DATABASE
    // ============================================================================

    let aggregationId: string;
    try {
      aggregationId = crypto.randomUUID();

      await db.insert(shiftAggregations).values({
        id: aggregationId,
        shiftId,
        summaryMarkdownPath: summaryPath,
        structuredSummary: {
          completed: aggregationOutput.completed,
          inProgress: aggregationOutput.inProgress,
          blocked: aggregationOutput.blocked,
          nextShiftActions: aggregationOutput.nextShiftActions,
          criticalIssues: aggregationOutput.criticalIssues,
        },
        kpis: {
          totalWorkers: kpiOutput.totalWorkers,
          productivityScore: kpiOutput.productivityScore,
          delayMinutes: kpiOutput.delayMinutes,
          materialCostEUR: kpiOutput.materialCostEUR,
          hindranceEvents: kpiOutput.hindranceEvents,
          topPerformer: kpiOutput.topPerformer,
          underperformer: kpiOutput.underperformer,
        },
      });
    } catch (dbError) {
      console.error('Database insert error (aggregation):', dbError);
      return {
        success: false,
        error: `Datenbank-Fehler: ${dbError instanceof Error ? dbError.message : 'Unbekannt'}`,
      };
    }

    // ============================================================================
    // STEP 8: UPDATE SHIFT STATUS
    // ============================================================================

    try {
      await db
        .update(shifts)
        .set({
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(shifts.id, shiftId));
    } catch (dbError) {
      console.error('Database update error (shift status):', dbError);
      // Aggregation was saved, but status update failed - log for manual fix
      console.warn(
        `Shift ${shiftId} aggregation created but status not updated. Manual intervention needed.`
      );
    }

    // ============================================================================
    // SUCCESS
    // ============================================================================

    return {
      success: true,
      aggregationId,
      summaryPath,
      kpisPath,
      stats: {
        totalReports: reportFrontmatters.length,
        totalWorkers: kpiOutput.totalWorkers,
        productivityScore: kpiOutput.productivityScore,
        hindranceEvents: kpiOutput.hindranceEvents,
      },
    };

  } catch (error) {
    console.error('Unexpected error in completeShift:', error);
    return {
      success: false,
      error: `Unerwarteter Fehler: ${error instanceof Error ? error.message : 'Unbekannt'}`,
    };
  }
}

/**
 * Get shift aggregation data (for Shift Leader dashboard)
 */
export async function getShiftAggregation(shiftId: string) {
  try {
    const aggregation = await db.query.shiftAggregations.findFirst({
      where: eq(shiftAggregations.shiftId, shiftId),
    });

    if (!aggregation) {
      return {
        success: false,
        error: 'Aggregation nicht gefunden',
      };
    }

    return {
      success: true,
      data: aggregation,
    };
  } catch (error) {
    console.error('Error fetching shift aggregation:', error);
    return {
      success: false,
      error: `Fehler: ${error instanceof Error ? error.message : 'Unbekannt'}`,
    };
  }
}

/**
 * Get all shifts for Boss dashboard
 */
export async function getAllShiftsWithKPIs() {
  try {
    const allShifts = await db.query.shifts.findMany({
      with: {
        aggregation: true,
      },
      orderBy: (shifts, { desc }) => [desc(shifts.date)],
    });

    return {
      success: true,
      data: allShifts,
    };
  } catch (error) {
    console.error('Error fetching shifts with KPIs:', error);
    return {
      success: false,
      error: `Fehler: ${error instanceof Error ? error.message : 'Unbekannt'}`,
    };
  }
}
