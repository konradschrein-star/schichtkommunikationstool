import { pgTable, uuid, text, timestamp, pgEnum, jsonb, varchar, boolean, bigint } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const roleEnum = pgEnum('role', ['WORKER', 'SHIFT_LEADER', 'BOSS']);
export const shiftTypeEnum = pgEnum('shift_type', ['DAY', 'NIGHT']);
export const reportStatusEnum = pgEnum('report_status', ['DRAFT', 'QA_PENDING', 'CLEANED', 'AGGREGATED', 'FINAL']);

// ============================================================================
// USERS & AUTH
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).unique(),
  role: roleEnum('role').notNull().default('WORKER'),
  profession: text('profession'), // z.B. "Baggerfahrer", "Schachtmeister", "Handler"
  language: varchar('language', { length: 2 }).notNull().default('de'), // 'de' | 'pl'
  profileImage: text('profile_image_url'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// API KEY MANAGEMENT (KMS-verschlüsselt für Chef)
// ============================================================================

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // 'openai' | 'anthropic' | 'gemini'
  encryptedKey: text('encrypted_key').notNull(), // AES-256-GCM verschlüsselt
  iv: text('iv').notNull(), // Initialization Vector für Decryption
  authTag: text('auth_tag').notNull(), // Authentication Tag für GCM
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================================================
// SHIFTS & REPORTS
// ============================================================================

export const shifts = pgTable('shifts', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: timestamp('date').notNull(),
  type: shiftTypeEnum('type').notNull(),
  projectName: text('project_name').notNull(), // z.B. "Gleisbau Sektor 4, Berlin Hbf"
  leaderId: uuid('leader_id').references(() => users.id, { onDelete: 'set null' }),

  // Ressourcen-Tracking (JSONB für Flexibilität)
  resources: jsonb('resources').$type<{
    excavators?: number;
    handlers?: number;
    workers?: number;
    trucks?: number;
  }>(),

  // Schicht-Status
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active' | 'completed' | 'archived'

  // Metadata
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const workerReports = pgTable('worker_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  shiftId: uuid('shift_id').references(() => shifts.id, { onDelete: 'cascade' }).notNull(),
  workerId: uuid('worker_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // File Paths (Markdown + Media)
  markdownPath: text('markdown_path').notNull(), // `/data/reports/{worker_id}/{YYYY-MM-DD}/report-{timestamp}.md`
  audioPath: text('audio_path'), // `/data/media/{worker_id}/audio-{timestamp}.webm`

  // Transkription & Verarbeitung
  rawTranscript: text('raw_transcript'), // Fast-Whisper Output (Original-Sprache)
  translatedTranscript: text('translated_transcript'), // Falls Polish→Deutsch
  cleanedText: text('cleaned_text'), // Nach Cleaner-Agent

  // QA-Status
  qaStatus: varchar('qa_status', { length: 20 }).default('pending'), // 'pending' | 'approved' | 'needs_clarification'
  qaFeedback: jsonb('qa_feedback').$type<{
    missingFields?: string[];
    suggestedQuestions?: string[];
    confidence?: number;
  }>(),

  // Metadaten (extrahiert aus YAML Frontmatter)
  frontmatterTags: jsonb('frontmatter_tags').$type<{
    location?: string; // z.B. "Sektor B, Achse 7"
    taskType?: string; // "excavation" | "concrete" | "inspection"
    materialUsed?: string[];
    hindrance?: boolean; // VOB/B §6 relevant?
    estimatedDelay?: number; // in Minuten
  }>(),

  status: reportStatusEnum('status').notNull().default('DRAFT'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const shiftAggregations = pgTable('shift_aggregations', {
  id: uuid('id').primaryKey().defaultRandom(),
  shiftId: uuid('shift_id').references(() => shifts.id, { onDelete: 'cascade' }).notNull().unique(),

  // Aggregierter Report (für Schichtleiter)
  summaryMarkdownPath: text('summary_markdown_path').notNull(),
  structuredSummary: jsonb('structured_summary').$type<{
    completed: string[];
    inProgress: string[];
    blocked: string[];
    nextShiftActions: string[];
    criticalIssues?: string[];
  }>(),

  // KPIs (für Boss-Dashboard)
  kpis: jsonb('kpis').$type<{
    totalWorkers: number;
    productivityScore: number; // 0-100
    delayMinutes: number;
    materialCostEUR: number;
    hindranceEvents: number;
    topPerformer?: string; // worker_id
    underperformer?: string;
    criticalHindrances?: Array<{
      worker: string;
      location: string;
      issue: string;
      estimatedCostEUR: number;
    }>;
  }>(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================================================
// MEDIA FILES (Optional: Falls mehr Metadaten nötig)
// ============================================================================

export const mediaFiles = pgTable('media_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => workerReports.id, { onDelete: 'cascade' }),
  filePath: text('file_path').notNull(),
  fileType: varchar('file_type', { length: 20 }).notNull(), // 'audio' | 'image' | 'document'
  mimeType: varchar('mime_type', { length: 100 }),
  sizeBytes: bigint('size_bytes', { mode: 'number' }),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  reports: many(workerReports),
  apiKeys: many(apiKeys),
  ledShifts: many(shifts),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));

export const shiftsRelations = relations(shifts, ({ one, many }) => ({
  leader: one(users, { fields: [shifts.leaderId], references: [users.id] }),
  reports: many(workerReports),
  aggregation: one(shiftAggregations, { fields: [shifts.id], references: [shiftAggregations.shiftId] }),
}));

export const workerReportsRelations = relations(workerReports, ({ one, many }) => ({
  shift: one(shifts, { fields: [workerReports.shiftId], references: [shifts.id] }),
  worker: one(users, { fields: [workerReports.workerId], references: [users.id] }),
  media: many(mediaFiles),
}));

export const shiftAggregationsRelations = relations(shiftAggregations, ({ one }) => ({
  shift: one(shifts, { fields: [shiftAggregations.shiftId], references: [shifts.id] }),
}));

export const mediaFilesRelations = relations(mediaFiles, ({ one }) => ({
  report: one(workerReports, { fields: [mediaFiles.reportId], references: [workerReports.id] }),
}));

// ============================================================================
// TYPES (Export for use in app)
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;

export type WorkerReport = typeof workerReports.$inferSelect;
export type NewWorkerReport = typeof workerReports.$inferInsert;

export type ShiftAggregation = typeof shiftAggregations.$inferSelect;
export type NewShiftAggregation = typeof shiftAggregations.$inferInsert;

export type MediaFile = typeof mediaFiles.$inferSelect;
export type NewMediaFile = typeof mediaFiles.$inferInsert;
