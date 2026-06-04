/**
 * Shift Aggregation Server Actions
 *
 * On shift completion:
 * 1. Gather all worker reports of the shift (from the flat-file store)
 * 2. Shift Aggregator (handover summary for the shift leader)
 * 3. Boss KPI Agent (analytics for management)
 * 4. Persist aggregation (markdown + JSON artifacts + store record)
 * 5. Mark shift completed
 */

'use server';

import { saveShiftAggregation, saveBossKPIs } from '@/lib/filesystem';
import { getLLMCredentials } from '@/lib/api-keys';
import { processShiftCompletion } from '@/agents/workflow';
import {
  getShift,
  getAggregation,
  getReportsByShift,
  createAggregation,
  updateShift,
  listShiftsWithAggregations,
} from '@/lib/store';

interface CompleteShiftInput {
  shiftId: string;
}

interface CompleteShiftSuccess {
  success: true;
  aggregationId: string;
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

export async function completeShift(input: CompleteShiftInput): Promise<CompleteShiftResponse> {
  try {
    const { shiftId } = input;

    const shift = await getShift(shiftId);
    if (!shift) {
      return { success: false, error: `Schicht ${shiftId} nicht gefunden` };
    }
    if (shift.status === 'completed') {
      return { success: false, error: 'Schicht wurde bereits abgeschlossen' };
    }
    if (await getAggregation(shiftId)) {
      return { success: false, error: 'Aggregation für diese Schicht existiert bereits' };
    }

    // ----- Step 1: gather reports -----
    const reports = await getReportsByShift(shiftId);
    if (reports.length === 0) {
      return { success: false, error: 'Keine Worker-Reports für diese Schicht gefunden' };
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

    // ----- Step 3: run aggregator + KPI agent -----
    const dateStr = shift.date.split('T')[0];
    const shiftMeta = {
      shiftId,
      date: dateStr,
      type: shift.type,
      projectName: shift.projectName,
    };

    let aggregationResult;
    try {
      const agentReports = reports.map((r) => ({
        workerName: r.workerName,
        profession: r.profession,
        content: r.cleanedText,
        frontmatter: {
          location: r.location,
          taskType: r.taskType,
          materialUsed: r.materialUsed,
          machineHours: r.machineHours,
          delayMinutes: r.delayMinutes,
          hindrance: r.hindrance,
        },
      }));

      aggregationResult = await processShiftCompletion(
        { reports: agentReports, shiftMeta },
        settings
      );
    } catch (agentError) {
      console.error('Agent pipeline error:', agentError);
      return {
        success: false,
        error: `Agent-Fehler: ${agentError instanceof Error ? agentError.message : 'Unbekannt'}`,
      };
    }

    const { aggregation: aggregationOutput, kpis: kpiOutput } = aggregationResult;

    // ----- Step 4: persist flat-file artifacts (best-effort) -----
    let summaryPath: string | undefined;
    try {
      summaryPath = await saveShiftAggregation(
        shiftId,
        new Date(shift.date),
        shift.type,
        aggregationOutput.summaryText
      );
      await saveBossKPIs(shiftId, new Date(shift.date), kpiOutput);
    } catch (fsError) {
      console.warn('Aggregation artifact write failed (non-fatal):', fsError);
    }

    // ----- Step 5: store record -----
    const aggregation = await createAggregation({
      shiftId,
      summaryText: aggregationOutput.summaryText,
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
        criticalHindrances: kpiOutput.criticalHindrances,
      },
    });

    // ----- Step 6: mark shift completed -----
    await updateShift(shiftId, { status: 'completed', completedAt: new Date().toISOString() });

    return {
      success: true,
      aggregationId: aggregation.id,
      stats: {
        totalReports: reports.length,
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
    const aggregation = await getAggregation(shiftId);
    if (!aggregation) {
      return { success: false as const, error: 'Aggregation nicht gefunden' };
    }
    return { success: true as const, data: aggregation };
  } catch (error) {
    console.error('Error fetching shift aggregation:', error);
    return { success: false as const, error: `Fehler: ${error instanceof Error ? error.message : 'Unbekannt'}` };
  }
}

/**
 * Get all shifts (newest first) joined with KPIs — for the Boss dashboard.
 */
export async function getAllShiftsWithKPIs() {
  try {
    const data = await listShiftsWithAggregations();
    return { success: true as const, data };
  } catch (error) {
    console.error('Error fetching shifts with KPIs:', error);
    return { success: false as const, error: `Fehler: ${error instanceof Error ? error.message : 'Unbekannt'}` };
  }
}
