/**
 * Flat-file store — replaces Postgres for the local/free MVP.
 *
 * All app state lives as JSON under `${DATA_ROOT}/db/*.json`, while the actual
 * worker reports additionally live as tagged Markdown files (see filesystem.ts),
 * exactly as the product vision intended ("getaggte Markdown-Files").
 *
 * This module is server-only (uses node:fs). Never import it into a client
 * component.
 */

import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// LOCATION
// ============================================================================

export const DATA_ROOT = process.env.DATA_ROOT_PATH
  ? path.resolve(process.cwd(), process.env.DATA_ROOT_PATH)
  : path.join(process.cwd(), 'data');

const DB_DIR = path.join(DATA_ROOT, 'db');

const FILES = {
  users: path.join(DB_DIR, 'users.json'),
  shifts: path.join(DB_DIR, 'shifts.json'),
  reports: path.join(DB_DIR, 'worker-reports.json'),
  aggregations: path.join(DB_DIR, 'aggregations.json'),
  config: path.join(DB_DIR, 'config.json'),
} as const;

// ============================================================================
// TYPES
// ============================================================================

export type Role = 'WORKER' | 'SHIFT_LEADER' | 'BOSS';
export type ShiftType = 'DAY' | 'NIGHT';
export type ShiftStatus = 'active' | 'completed' | 'archived';
export type LLMProvider = 'openai' | 'anthropic' | 'gemini';

export interface StoredUser {
  id: string;
  name: string;
  email?: string;
  role: Role;
  profession?: string;
  language: 'de' | 'pl';
  isActive: boolean;
  createdAt: string;
}

export interface StoredShift {
  id: string;
  date: string; // ISO datetime
  type: ShiftType;
  projectName: string;
  leaderId?: string;
  resources?: {
    excavators?: number;
    handlers?: number;
    workers?: number;
    trucks?: number;
  };
  status: ShiftStatus;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface StoredWorkerReport {
  id: string;
  shiftId: string;
  workerId: string;
  workerName: string;
  profession?: string;
  language: 'de' | 'pl';

  markdownPath?: string;
  audioPath?: string;
  imagePaths?: string[];

  rawTranscript?: string;
  translatedTranscript?: string;
  cleanedText: string;

  qaStatus: 'pending' | 'approved' | 'needs_clarification';
  qaConfidence?: number;

  // Extracted structured tags (used by KPI + drilldown)
  location?: string;
  taskType?: string;
  hindrance?: boolean;
  delayMinutes?: number;
  machineHours?: number;
  materialUsed?: string[];
  materialCostEUR?: number;
  tags?: string[];

  createdAt: string;
}

export interface StructuredSummary {
  completed: string[];
  inProgress: string[];
  blocked: string[];
  nextShiftActions: string[];
  criticalIssues?: string[];
}

export interface BossKPIs {
  totalWorkers: number;
  productivityScore: number;
  delayMinutes: number;
  materialCostEUR: number;
  hindranceEvents: number;
  topPerformer?: string;
  underperformer?: string;
  criticalHindrances?: Array<{
    worker: string;
    location: string;
    issue: string;
    estimatedCostEUR: number;
  }>;
}

export interface StoredAggregation {
  id: string;
  shiftId: string;
  summaryText: string;
  summaryMarkdownPath?: string;
  structuredSummary: StructuredSummary;
  kpis: BossKPIs;
  createdAt: string;
}

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface AppConfig {
  llm?: LLMConfig;
}

export type ShiftWithAggregation = StoredShift & {
  aggregation?: StoredAggregation;
};

// ============================================================================
// LOW-LEVEL JSON IO (with a tiny per-file write lock)
// ============================================================================

const locks = new Map<string, Promise<unknown>>();

async function ensureDbDir(): Promise<void> {
  await fs.mkdir(DB_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await ensureDbDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Serializes read-modify-write on a single file so concurrent server actions
 * don't clobber each other.
 */
async function withLock<T>(file: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(file) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((r) => (release = r));
  locks.set(file, prev.then(() => next));
  try {
    await prev;
    return await fn();
  } finally {
    release();
    if (locks.get(file) === next) locks.delete(file);
  }
}

function uuid(): string {
  return crypto.randomUUID();
}

// ============================================================================
// USERS
// ============================================================================

export async function listUsers(): Promise<StoredUser[]> {
  return readJson<StoredUser[]>(FILES.users, []);
}

export async function getUser(id: string): Promise<StoredUser | undefined> {
  return (await listUsers()).find((u) => u.id === id);
}

export async function getUsersByRole(role: Role): Promise<StoredUser[]> {
  return (await listUsers()).filter((u) => u.role === role);
}

export async function getBossUser(): Promise<StoredUser | undefined> {
  return (await getUsersByRole('BOSS'))[0];
}

export async function replaceUsers(users: StoredUser[]): Promise<void> {
  await withLock(FILES.users, () => writeJson(FILES.users, users));
}

// ============================================================================
// SHIFTS
// ============================================================================

export async function listShifts(): Promise<StoredShift[]> {
  const shifts = await readJson<StoredShift[]>(FILES.shifts, []);
  return shifts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getShift(id: string): Promise<StoredShift | undefined> {
  return (await listShifts()).find((s) => s.id === id);
}

export async function getActiveShift(): Promise<StoredShift | undefined> {
  return (await listShifts()).find((s) => s.status === 'active');
}

export async function createShift(
  shift: Omit<StoredShift, 'id' | 'createdAt'> & { id?: string }
): Promise<StoredShift> {
  return withLock(FILES.shifts, async () => {
    const shifts = await readJson<StoredShift[]>(FILES.shifts, []);
    const record: StoredShift = {
      ...shift,
      id: shift.id ?? uuid(),
      createdAt: new Date().toISOString(),
    };
    shifts.push(record);
    await writeJson(FILES.shifts, shifts);
    return record;
  });
}

export async function updateShift(
  id: string,
  patch: Partial<StoredShift>
): Promise<StoredShift | undefined> {
  return withLock(FILES.shifts, async () => {
    const shifts = await readJson<StoredShift[]>(FILES.shifts, []);
    const idx = shifts.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    shifts[idx] = { ...shifts[idx], ...patch };
    await writeJson(FILES.shifts, shifts);
    return shifts[idx];
  });
}

export async function replaceShifts(shifts: StoredShift[]): Promise<void> {
  await withLock(FILES.shifts, () => writeJson(FILES.shifts, shifts));
}

// ============================================================================
// WORKER REPORTS
// ============================================================================

export async function listWorkerReports(): Promise<StoredWorkerReport[]> {
  return readJson<StoredWorkerReport[]>(FILES.reports, []);
}

export async function getReportsByShift(shiftId: string): Promise<StoredWorkerReport[]> {
  return (await listWorkerReports())
    .filter((r) => r.shiftId === shiftId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function getReportsByWorker(workerId: string): Promise<StoredWorkerReport[]> {
  return (await listWorkerReports())
    .filter((r) => r.workerId === workerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getReport(id: string): Promise<StoredWorkerReport | undefined> {
  return (await listWorkerReports()).find((r) => r.id === id);
}

export async function createWorkerReport(
  report: Omit<StoredWorkerReport, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<StoredWorkerReport> {
  return withLock(FILES.reports, async () => {
    const reports = await readJson<StoredWorkerReport[]>(FILES.reports, []);
    const record: StoredWorkerReport = {
      ...report,
      id: report.id ?? uuid(),
      createdAt: report.createdAt ?? new Date().toISOString(),
    };
    reports.push(record);
    await writeJson(FILES.reports, reports);
    return record;
  });
}

export async function replaceWorkerReports(reports: StoredWorkerReport[]): Promise<void> {
  await withLock(FILES.reports, () => writeJson(FILES.reports, reports));
}

// ============================================================================
// AGGREGATIONS
// ============================================================================

export async function listAggregations(): Promise<StoredAggregation[]> {
  return readJson<StoredAggregation[]>(FILES.aggregations, []);
}

export async function getAggregation(shiftId: string): Promise<StoredAggregation | undefined> {
  return (await listAggregations()).find((a) => a.shiftId === shiftId);
}

export async function createAggregation(
  aggregation: Omit<StoredAggregation, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<StoredAggregation> {
  return withLock(FILES.aggregations, async () => {
    const aggregations = await readJson<StoredAggregation[]>(FILES.aggregations, []);
    const record: StoredAggregation = {
      ...aggregation,
      id: aggregation.id ?? uuid(),
      createdAt: aggregation.createdAt ?? new Date().toISOString(),
    };
    // one aggregation per shift
    const filtered = aggregations.filter((a) => a.shiftId !== record.shiftId);
    filtered.push(record);
    await writeJson(FILES.aggregations, filtered);
    return record;
  });
}

export async function replaceAggregations(aggregations: StoredAggregation[]): Promise<void> {
  await withLock(FILES.aggregations, () => writeJson(FILES.aggregations, aggregations));
}

/**
 * Shifts (newest first) joined with their aggregation — feeds the boss dashboard.
 */
export async function listShiftsWithAggregations(): Promise<ShiftWithAggregation[]> {
  const [shifts, aggregations] = await Promise.all([listShifts(), listAggregations()]);
  const byShift = new Map(aggregations.map((a) => [a.shiftId, a]));
  return shifts.map((s) => ({ ...s, aggregation: byShift.get(s.id) }));
}

export async function getLatestCompletedShiftWithAggregation(): Promise<ShiftWithAggregation | undefined> {
  const joined = await listShiftsWithAggregations();
  return joined.find((s) => s.status === 'completed' && s.aggregation);
}

// ============================================================================
// CONFIG (LLM provider/key/model overrides set via the Settings page)
// ============================================================================

export async function getConfig(): Promise<AppConfig> {
  return readJson<AppConfig>(FILES.config, {});
}

export async function setLLMConfig(llm: LLMConfig): Promise<void> {
  await withLock(FILES.config, async () => {
    const config = await readJson<AppConfig>(FILES.config, {});
    config.llm = llm;
    await writeJson(FILES.config, config);
  });
}
