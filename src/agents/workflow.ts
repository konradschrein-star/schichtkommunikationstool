// ============================================================================
// MULTI-AGENT WORKFLOW
// ============================================================================

import { createLLMClient, type LLMProvider } from './llm-clients';
import {
  QA_AGENT_PROMPT,
  CLEANER_AGENT_PROMPT,
  SHIFT_AGGREGATOR_PROMPT,
  BOSS_AGENT_PROMPT,
  TRANSLATION_PROMPT,
  injectPromptVariables,
} from './prompts';
import {
  parseQAResponse,
  parseCleanerResponse,
  parseShiftAggregationResponse,
  parseBossKPIResponse,
  type QAOutput,
  type CleanerOutput,
  type ShiftAggregationOutput,
  type BossKPIOutput,
} from './schemas';

// ============================================================================
// QA AGENT
// ============================================================================

/**
 * Runs QA validation on worker transcript
 */
export async function runQAAgent(
  transcript: string,
  apiKey: string,
  provider: LLMProvider = 'anthropic'
): Promise<QAOutput> {
  const client = createLLMClient(provider, apiKey);

  const prompt = injectPromptVariables(QA_AGENT_PROMPT, {
    transcript,
  });

  const response = await client.call(prompt);
  return parseQAResponse(response);
}

// ============================================================================
// CLEANER AGENT
// ============================================================================

export interface CleanerAgentInput {
  transcript: string;
  frontmatter: {
    workerId: string;
    workerName: string;
    profession?: string;
    shiftId: string;
    shiftType: 'DAY' | 'NIGHT';
    language: 'de' | 'pl';
  };
}

/**
 * Runs cleaner agent to transform raw transcript into professional report
 */
export async function runCleanerAgent(
  input: CleanerAgentInput,
  apiKey: string,
  provider: LLMProvider = 'anthropic'
): Promise<CleanerOutput> {
  const client = createLLMClient(provider, apiKey);

  const prompt = injectPromptVariables(CLEANER_AGENT_PROMPT, {
    transcript: input.transcript,
    frontmatter: JSON.stringify(input.frontmatter, null, 2),
  });

  const response = await client.call(prompt);
  return parseCleanerResponse(response);
}

// ============================================================================
// TRANSLATION HELPER
// ============================================================================

/**
 * Translates Polish text to German
 */
export async function translatePolishToGerman(
  polishText: string,
  apiKey: string,
  provider: LLMProvider = 'anthropic'
): Promise<string> {
  const client = createLLMClient(provider, apiKey);

  const prompt = injectPromptVariables(TRANSLATION_PROMPT, {
    polishText,
  });

  const response = await client.call(prompt);
  // Response is just the translation, no JSON parsing needed
  return response.trim();
}

// ============================================================================
// SHIFT AGGREGATOR AGENT
// ============================================================================

export interface ShiftAggregatorInput {
  reports: Array<{
    workerName: string;
    content: string;
    frontmatter: {
      location?: string;
      taskType?: string;
      hindrance?: boolean;
    };
  }>;
  shiftMeta: {
    shiftId: string;
    date: string;
    type: 'DAY' | 'NIGHT';
    projectName: string;
  };
}

/**
 * Aggregates all worker reports into shift summary
 */
export async function runShiftAggregator(
  input: ShiftAggregatorInput,
  apiKey: string,
  provider: LLMProvider = 'anthropic'
): Promise<ShiftAggregationOutput> {
  const client = createLLMClient(provider, apiKey);

  // Format reports as markdown
  const reportsMarkdown = input.reports
    .map(
      (r) => `### ${r.workerName}
**Standort:** ${r.frontmatter.location || 'N/A'}
**Tätigkeit:** ${r.frontmatter.taskType || 'N/A'}
**VOB/B Behinderung:** ${r.frontmatter.hindrance ? 'Ja' : 'Nein'}

${r.content}
`
    )
    .join('\n---\n\n');

  const prompt = injectPromptVariables(SHIFT_AGGREGATOR_PROMPT, {
    reports: reportsMarkdown,
    shiftMeta: JSON.stringify(input.shiftMeta, null, 2),
  });

  const response = await client.call(prompt);
  return parseShiftAggregationResponse(response);
}

// ============================================================================
// BOSS KPI AGENT
// ============================================================================

export interface BossKPIAgentInput {
  reports: Array<{
    workerName: string;
    profession?: string;
    content: string;
    frontmatter: {
      location?: string;
      taskType?: string;
      materialUsed?: string[];
      machineHours?: number;
      delayMinutes?: number;
      hindrance?: boolean;
    };
  }>;
  shiftMeta: {
    shiftId: string;
    date: string;
    type: 'DAY' | 'NIGHT';
    projectName: string;
  };
}

/**
 * Extracts KPIs from all worker reports
 */
export async function runBossKPIAgent(
  input: BossKPIAgentInput,
  apiKey: string,
  provider: LLMProvider = 'anthropic'
): Promise<BossKPIOutput> {
  const client = createLLMClient(provider, apiKey);

  // Format reports with metadata
  const reportsMarkdown = input.reports
    .map(
      (r) => `### ${r.workerName} (${r.profession || 'Worker'})
**Standort:** ${r.frontmatter.location || 'N/A'}
**Tätigkeit:** ${r.frontmatter.taskType || 'N/A'}
**Material:** ${r.frontmatter.materialUsed?.join(', ') || 'N/A'}
**Maschinenstunden:** ${r.frontmatter.machineHours || 0}h
**Verzögerung:** ${r.frontmatter.delayMinutes || 0} min
**VOB/B Behinderung:** ${r.frontmatter.hindrance ? 'Ja' : 'Nein'}

${r.content}
`
    )
    .join('\n---\n\n');

  const prompt = injectPromptVariables(BOSS_AGENT_PROMPT, {
    reports: reportsMarkdown,
    shiftMeta: JSON.stringify(input.shiftMeta, null, 2),
  });

  const response = await client.call(prompt);
  return parseBossKPIResponse(response);
}

// ============================================================================
// COMPLETE WORKFLOW
// ============================================================================

/**
 * Runs the complete multi-agent pipeline for a single worker report
 */
export async function processWorkerReport(
  transcript: string,
  frontmatter: CleanerAgentInput['frontmatter'],
  apiKey: string,
  provider: LLMProvider = 'anthropic'
): Promise<{
  qaResult: QAOutput;
  cleanerResult?: CleanerOutput;
  translatedText?: string;
}> {
  // Step 1: QA validation
  const qaResult = await runQAAgent(transcript, apiKey, provider);

  // If QA fails, return early
  if (!qaResult.isComplete) {
    return { qaResult };
  }

  // Step 2: Translation if Polish
  let translatedText: string | undefined;
  let textToClean = transcript;

  if (frontmatter.language === 'pl') {
    translatedText = await translatePolishToGerman(transcript, apiKey, provider);
    textToClean = translatedText;
  }

  // Step 3: Clean and structure
  const cleanerResult = await runCleanerAgent(
    {
      transcript: textToClean,
      frontmatter,
    },
    apiKey,
    provider
  );

  return { qaResult, cleanerResult, translatedText };
}

/**
 * Runs shift completion workflow (aggregation + KPIs)
 */
export async function processShiftCompletion(
  shiftData: {
    reports: BossKPIAgentInput['reports'];
    shiftMeta: BossKPIAgentInput['shiftMeta'];
  },
  apiKey: string,
  provider: LLMProvider = 'anthropic'
): Promise<{
  aggregation: ShiftAggregationOutput;
  kpis: BossKPIOutput;
}> {
  // Run aggregator and KPI extraction in parallel
  const [aggregation, kpis] = await Promise.all([
    runShiftAggregator(
      {
        reports: shiftData.reports.map((r) => ({
          workerName: r.workerName,
          content: r.content,
          frontmatter: r.frontmatter,
        })),
        shiftMeta: shiftData.shiftMeta,
      },
      apiKey,
      provider
    ),
    runBossKPIAgent(shiftData, apiKey, provider),
  ]);

  return { aggregation, kpis };
}
