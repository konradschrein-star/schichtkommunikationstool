// ============================================================================
// AGENTS MODULE - PUBLIC API
// ============================================================================

// Export workflow functions
export {
  runQAAgent,
  runCleanerAgent,
  runShiftAggregator,
  runBossKPIAgent,
  translatePolishToGerman,
  processWorkerReport,
  processShiftCompletion,
  type CleanerAgentInput,
  type ShiftAggregatorInput,
  type BossKPIAgentInput,
} from './workflow';

// Export schemas and types
export {
  QAOutputSchema,
  CleanerOutputSchema,
  ShiftAggregationOutputSchema,
  BossKPIOutputSchema,
  parseQAResponse,
  parseCleanerResponse,
  parseShiftAggregationResponse,
  parseBossKPIResponse,
  type QAOutput,
  type CleanerOutput,
  type ShiftAggregationOutput,
  type BossKPIOutput,
  type Hindrance,
  type CriticalHindrance,
} from './schemas';

// Export LLM client utilities
export {
  createLLMClient,
  type LLMProvider,
  type LLMClient,
} from './llm-clients';

// Export prompts (for customization if needed)
export {
  QA_AGENT_PROMPT,
  CLEANER_AGENT_PROMPT,
  SHIFT_AGGREGATOR_PROMPT,
  BOSS_AGENT_PROMPT,
  TRANSLATION_PROMPT,
  injectPromptVariables,
} from './prompts';
