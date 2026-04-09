import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { MarkdownFrontmatterSchema, type MarkdownFrontmatter, type ReportContent } from '@/types/markdown';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const DATA_ROOT = process.env.DATA_ROOT_PATH || path.join(process.cwd(), 'data');

// ============================================================================
// DIRECTORY HELPERS
// ============================================================================

/**
 * Ensures directory exists, creates if not
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Checks if file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// WORKER REPORT OPERATIONS
// ============================================================================

/**
 * Saves a worker report as markdown file with YAML frontmatter
 * @returns Absolute path to created markdown file
 */
export async function saveWorkerReport(
  workerId: string,
  date: Date,
  frontmatter: MarkdownFrontmatter,
  content: ReportContent
): Promise<string> {
  // Validate frontmatter
  const validatedFrontmatter = MarkdownFrontmatterSchema.parse(frontmatter);

  // Create date string and timestamp for filename
  const dateStr = date.toISOString().split('T')[0]; // "2026-04-07"
  const timestamp = date.toISOString().replace(/[:.]/g, '').slice(0, 15); // "20260407043015"

  // Construct directory path
  const reportDir = path.join(DATA_ROOT, 'reports', workerId, dateStr);
  await ensureDir(reportDir);

  // Construct file path
  const filePath = path.join(reportDir, `report-${timestamp}.md`);

  // Build markdown content
  const languageLabel = frontmatter.language === 'pl' ? 'Polnisch' : 'Deutsch';

  let markdownBody = `## Original Transkript (${languageLabel})\n${content.rawTranscript}\n\n`;

  if (content.translatedText && frontmatter.language === 'pl') {
    markdownBody += `## Übersetzt (Deutsch)\n${content.translatedText}\n\n`;
  }

  markdownBody += `## Bereinigt & Strukturiert\n${content.cleanedText}`;

  // Create frontmatter + content
  const markdown = matter.stringify(markdownBody, validatedFrontmatter);

  // Write file
  await fs.writeFile(filePath, markdown, 'utf-8');

  return filePath;
}

/**
 * Reads and parses a worker report markdown file
 */
export async function readWorkerReport(filePath: string): Promise<{
  frontmatter: MarkdownFrontmatter;
  content: string;
  rawContent: string;
}> {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  const frontmatter = MarkdownFrontmatterSchema.parse(data);

  return {
    frontmatter,
    content,
    rawContent: fileContent
  };
}

/**
 * Gets all reports for a specific shift by scanning worker directories
 */
export async function getAllReportsForShift(shiftId: string): Promise<{
  frontmatter: MarkdownFrontmatter;
  content: string;
  filePath: string;
}[]> {
  const reportsDir = path.join(DATA_ROOT, 'reports');

  // Ensure reports directory exists
  await ensureDir(reportsDir);

  const reports: { frontmatter: MarkdownFrontmatter; content: string; filePath: string }[] = [];

  try {
    const workers = await fs.readdir(reportsDir);

    for (const workerId of workers) {
      const workerPath = path.join(reportsDir, workerId);

      // Check if it's a directory
      const stat = await fs.stat(workerPath);
      if (!stat.isDirectory()) continue;

      const dates = await fs.readdir(workerPath);

      for (const date of dates) {
        const datePath = path.join(workerPath, date);

        // Check if it's a directory
        const dateStat = await fs.stat(datePath);
        if (!dateStat.isDirectory()) continue;

        const files = await fs.readdir(datePath);

        for (const file of files.filter(f => f.endsWith('.md'))) {
          const filePath = path.join(datePath, file);
          const { frontmatter, content } = await readWorkerReport(filePath);

          if (frontmatter.shiftId === shiftId) {
            reports.push({ frontmatter, content, filePath });
          }
        }
      }
    }
  } catch (error) {
    // If reports directory doesn't exist or is empty, return empty array
    console.error('Error scanning reports:', error);
  }

  return reports;
}

/**
 * Gets all reports for a specific worker
 */
export async function getReportsByWorker(
  workerId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<{ frontmatter: MarkdownFrontmatter; content: string; filePath: string }[]> {
  const workerDir = path.join(DATA_ROOT, 'reports', workerId);

  if (!(await fileExists(workerDir))) {
    return [];
  }

  const reports: { frontmatter: MarkdownFrontmatter; content: string; filePath: string }[] = [];
  const dates = await fs.readdir(workerDir);

  for (const date of dates) {
    const datePath = path.join(workerDir, date);

    const stat = await fs.stat(datePath);
    if (!stat.isDirectory()) continue;

    // Filter by date range if provided
    if (dateFrom || dateTo) {
      const dateObj = new Date(date);
      if (dateFrom && dateObj < dateFrom) continue;
      if (dateTo && dateObj > dateTo) continue;
    }

    const files = await fs.readdir(datePath);

    for (const file of files.filter(f => f.endsWith('.md'))) {
      const filePath = path.join(datePath, file);
      const { frontmatter, content } = await readWorkerReport(filePath);
      reports.push({ frontmatter, content, filePath });
    }
  }

  // Sort by timestamp descending (newest first)
  reports.sort((a, b) =>
    new Date(b.frontmatter.timestamp).getTime() - new Date(a.frontmatter.timestamp).getTime()
  );

  return reports;
}

// ============================================================================
// SHIFT AGGREGATION OPERATIONS
// ============================================================================

/**
 * Saves shift aggregation summary as markdown
 */
export async function saveShiftAggregation(
  shiftId: string,
  date: Date,
  shiftType: 'DAY' | 'NIGHT',
  summaryText: string
): Promise<string> {
  const aggregationsDir = path.join(DATA_ROOT, 'aggregations', 'shifts');
  await ensureDir(aggregationsDir);

  const dateStr = date.toISOString().split('T')[0];
  const filename = `${dateStr}-${shiftType.toLowerCase()}.md`;
  const filePath = path.join(aggregationsDir, filename);

  const frontmatter = {
    shiftId,
    date: dateStr,
    type: shiftType,
    generatedAt: new Date().toISOString(),
  };

  const markdown = matter.stringify(summaryText, frontmatter);
  await fs.writeFile(filePath, markdown, 'utf-8');

  return filePath;
}

/**
 * Saves Boss KPIs as JSON
 */
export async function saveBossKPIs(
  shiftId: string,
  date: Date,
  kpis: Record<string, unknown>
): Promise<string> {
  const kpisDir = path.join(DATA_ROOT, 'aggregations', 'kpis');
  await ensureDir(kpisDir);

  const dateStr = date.toISOString().split('T')[0];
  const filename = `${dateStr}-boss.json`;
  const filePath = path.join(kpisDir, filename);

  const data = {
    shiftId,
    date: dateStr,
    generatedAt: new Date().toISOString(),
    kpis,
  };

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

  return filePath;
}

// ============================================================================
// MEDIA FILE OPERATIONS
// ============================================================================

/**
 * Saves audio file to media directory
 */
export async function saveAudioFile(
  audioBuffer: Buffer,
  workerId: string,
  mimeType: string = 'audio/webm'
): Promise<string> {
  const mediaDir = path.join(DATA_ROOT, 'media', workerId);
  await ensureDir(mediaDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
  const extension = mimeType.includes('webm') ? 'webm' :
                   mimeType.includes('mp4') ? 'mp4' :
                   mimeType.includes('wav') ? 'wav' : 'webm';

  const filename = `audio-${timestamp}.${extension}`;
  const filePath = path.join(mediaDir, filename);

  await fs.writeFile(filePath, audioBuffer);

  return filePath;
}

/**
 * Saves image file to media directory
 */
export async function saveImageFile(
  imageBuffer: Buffer,
  workerId: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const mediaDir = path.join(DATA_ROOT, 'media', workerId);
  await ensureDir(mediaDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
  const extension = mimeType.includes('png') ? 'png' :
                   mimeType.includes('webp') ? 'webp' : 'jpg';

  const filename = `img-${timestamp}.${extension}`;
  const filePath = path.join(mediaDir, filename);

  await fs.writeFile(filePath, imageBuffer);

  return filePath;
}

/**
 * Reads a media file (audio or image)
 */
export async function readMediaFile(filePath: string): Promise<Buffer> {
  return await fs.readFile(filePath);
}

/**
 * Deletes a media file
 */
export async function deleteMediaFile(filePath: string): Promise<void> {
  if (await fileExists(filePath)) {
    await fs.unlink(filePath);
  }
}

// ============================================================================
// CLEANUP OPERATIONS
// ============================================================================

/**
 * Archives old reports (moves to archive directory)
 */
export async function archiveOldReports(daysOld: number = 90): Promise<number> {
  const archiveDir = path.join(DATA_ROOT, 'archive', 'reports');
  await ensureDir(archiveDir);

  const reportsDir = path.join(DATA_ROOT, 'reports');
  if (!(await fileExists(reportsDir))) {
    return 0;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  let archivedCount = 0;
  const workers = await fs.readdir(reportsDir);

  for (const workerId of workers) {
    const workerPath = path.join(reportsDir, workerId);
    const stat = await fs.stat(workerPath);
    if (!stat.isDirectory()) continue;

    const dates = await fs.readdir(workerPath);

    for (const date of dates) {
      const dateObj = new Date(date);
      if (dateObj >= cutoffDate) continue;

      const sourcePath = path.join(workerPath, date);
      const targetPath = path.join(archiveDir, workerId, date);

      await ensureDir(path.dirname(targetPath));
      await fs.rename(sourcePath, targetPath);
      archivedCount++;
    }
  }

  return archivedCount;
}
