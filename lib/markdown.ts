import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ReportMetadata {
  id: string;
  mitarbeiter: string;
  workerId: string;
  rolle: string;
  datum: string;
  zeit: string;
  schicht: number;
  gleis?: string;
  tags: string[];
  audio_url?: string;
  image_urls: string[];
  status: string;
  delay_hours?: number;
  estimated_cost?: number;
}

export async function saveMarkdownReport(
  metadata: ReportMetadata,
  content: string
): Promise<string> {
  const reportsDir = path.join(process.cwd(), 'data', 'reports');
  if (!existsSync(reportsDir)) {
    await mkdir(reportsDir, { recursive: true });
  }

  const filename = `${metadata.id}.md`;
  const filepath = path.join(reportsDir, filename);

  const fileContent = matter.stringify(content, metadata);
  await writeFile(filepath, fileContent);

  return metadata.id;
}
