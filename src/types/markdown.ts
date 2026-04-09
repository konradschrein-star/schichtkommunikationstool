import { z } from 'zod';

// ============================================================================
// MARKDOWN FRONTMATTER SCHEMA
// ============================================================================

export const MarkdownFrontmatterSchema = z.object({
  // Core IDs
  id: z.string().uuid(),
  workerId: z.string().uuid(),
  workerName: z.string(),
  profession: z.string().optional(),
  shiftId: z.string().uuid(),

  // Timestamps
  date: z.string(), // ISO 8601 date (YYYY-MM-DD)
  timestamp: z.string(), // ISO 8601 datetime
  shiftType: z.enum(['DAY', 'NIGHT']),

  // Language
  language: z.enum(['de', 'pl']).default('de'),

  // Pflicht-Tags (für VOB/B & KPI-Extraktion)
  location: z.string(), // "Sektor B, Achse 7"
  taskType: z.enum(['excavation', 'concrete', 'inspection', 'maintenance', 'other']),

  // Optional Tags
  materialUsed: z.array(z.string()).optional(),
  machineHours: z.number().optional(),
  delayMinutes: z.number().optional(),
  hindrance: z.boolean().default(false), // VOB/B §6 Flag
  tags: z.array(z.string()).optional(), // ['rohr', 'verzögerung', 'grundwasser']

  // Media References
  audioFile: z.string().optional(),
  imageFiles: z.array(z.string()).optional(),
});

export type MarkdownFrontmatter = z.infer<typeof MarkdownFrontmatterSchema>;

// ============================================================================
// PARTIAL FRONTMATTER (für initiale Erstellung vor Agent-Processing)
// ============================================================================

export const PartialFrontmatterSchema = MarkdownFrontmatterSchema.partial({
  location: true,
  taskType: true,
  materialUsed: true,
  machineHours: true,
  delayMinutes: true,
  hindrance: true,
  tags: true,
});

export type PartialFrontmatter = z.infer<typeof PartialFrontmatterSchema>;

// ============================================================================
// REPORT CONTENT STRUCTURE
// ============================================================================

export interface ReportContent {
  rawTranscript: string;
  translatedText?: string; // Falls Polish → Deutsch
  cleanedText: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates and parses frontmatter from raw data
 */
export function parseFrontmatter(data: unknown): MarkdownFrontmatter {
  return MarkdownFrontmatterSchema.parse(data);
}

/**
 * Creates initial frontmatter with minimal required fields
 */
export function createInitialFrontmatter(
  workerId: string,
  workerName: string,
  shiftId: string,
  language: 'de' | 'pl' = 'de',
  profession?: string
): PartialFrontmatter {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const hour = now.getHours();
  const shiftType = hour >= 6 && hour < 18 ? 'DAY' : 'NIGHT';

  return {
    id: crypto.randomUUID(),
    workerId,
    workerName,
    profession,
    shiftId,
    date: dateStr,
    timestamp: now.toISOString(),
    shiftType,
    language,
  };
}
