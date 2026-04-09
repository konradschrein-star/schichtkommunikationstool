import { z } from 'zod';

// ============================================================================
// QA AGENT OUTPUT SCHEMA
// ============================================================================

export const QAOutputSchema = z.object({
  isComplete: z.boolean().describe('Ob alle Pflichtfelder vorhanden sind'),
  missingFields: z.array(z.string()).describe('Liste fehlender Pflichtfelder'),
  confidence: z.number().min(0).max(1).describe('Konfidenz der Analyse (0-1)'),
  suggestedQuestions: z.array(z.string()).max(2).describe('Max 2 Rückfragen an Worker'),
});

export type QAOutput = z.infer<typeof QAOutputSchema>;

// ============================================================================
// CLEANER AGENT OUTPUT SCHEMA
// ============================================================================

export const HindranceSchema = z.object({
  description: z.string().describe('Beschreibung der Behinderung'),
  estimatedCostEUR: z.number().optional().describe('Geschätzte Kosten in EUR'),
  isVOBRelevant: z.boolean().describe('Ob VOB/B §6 relevant'),
});

export const CleanerOutputSchema = z.object({
  cleanedText: z.string().describe('Bereinigter Text in Markdown-Format'),
  structuredData: z.object({
    location: z.string().describe('Standort (z.B. "Sektor B, Achse 7")'),
    taskType: z.enum(['excavation', 'concrete', 'inspection', 'maintenance', 'other']).describe('Art der Tätigkeit'),
    completedWork: z.array(z.string()).describe('Liste abgeschlossener Arbeiten'),
    hindrances: z.array(HindranceSchema).optional().describe('Behinderungen/Verzögerungen'),
  }),
});

export type CleanerOutput = z.infer<typeof CleanerOutputSchema>;
export type Hindrance = z.infer<typeof HindranceSchema>;

// ============================================================================
// SHIFT AGGREGATOR OUTPUT SCHEMA
// ============================================================================

export const ShiftAggregationOutputSchema = z.object({
  completed: z.array(z.string()).describe('Abgeschlossene Aufgaben'),
  inProgress: z.array(z.string()).describe('Laufende Aufgaben'),
  blocked: z.array(z.string()).describe('Blockierte Aufgaben'),
  nextShiftActions: z.array(z.string()).describe('To-Dos für nächste Schicht'),
  criticalIssues: z.array(z.string()).describe('Kritische Probleme (Sicherheit, VOB/B, etc.)'),
  summaryText: z.string().describe('3-5 Sätze Fließtext-Summary für Schichtleiter'),
});

export type ShiftAggregationOutput = z.infer<typeof ShiftAggregationOutputSchema>;

// ============================================================================
// BOSS KPI OUTPUT SCHEMA
// ============================================================================

export const CriticalHindranceSchema = z.object({
  worker: z.string().describe('Worker Name'),
  location: z.string().describe('Standort'),
  issue: z.string().describe('Problem-Beschreibung'),
  estimatedCostEUR: z.number().describe('Geschätzte Kosten'),
});

export const BossKPIOutputSchema = z.object({
  totalWorkers: z.number().describe('Anzahl aktiver Worker'),
  productivityScore: z.number().min(0).max(100).describe('Produktivität 0-100'),
  delayMinutes: z.number().describe('Gesamtverzögerung in Minuten'),
  materialCostEUR: z.number().describe('Geschätzte Materialkosten'),
  hindranceEvents: z.number().describe('Anzahl VOB/B-relevanter Behinderungen'),
  topPerformer: z.string().optional().describe('Top Performer Name'),
  underperformer: z.string().optional().describe('Underperformer Name'),
  criticalHindrances: z.array(CriticalHindranceSchema).describe('Kritische Behinderungen mit Kosten'),
});

export type BossKPIOutput = z.infer<typeof BossKPIOutputSchema>;
export type CriticalHindrance = z.infer<typeof CriticalHindranceSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates and parses LLM JSON response
 */
export function parseAgentResponse<T>(
  schema: z.ZodSchema<T>,
  rawResponse: string
): T {
  try {
    // Try to extract JSON from response (in case LLM adds extra text)
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : rawResponse;

    const parsed = JSON.parse(jsonString);
    return schema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Agent response validation failed: ${error.message}`);
    }
    throw new Error(`Failed to parse agent response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a type-safe agent response handler
 */
export function createAgentResponseParser<T>(schema: z.ZodSchema<T>) {
  return (rawResponse: string): T => {
    return parseAgentResponse(schema, rawResponse);
  };
}

// ============================================================================
// PRE-BUILT PARSERS
// ============================================================================

export const parseQAResponse = createAgentResponseParser(QAOutputSchema);
export const parseCleanerResponse = createAgentResponseParser(CleanerOutputSchema);
export const parseShiftAggregationResponse = createAgentResponseParser(ShiftAggregationOutputSchema);
export const parseBossKPIResponse = createAgentResponseParser(BossKPIOutputSchema);
