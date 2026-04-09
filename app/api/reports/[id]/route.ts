import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { SAMPLE_REPORTS } from '@/lib/fallback-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filepath = path.join(process.cwd(), 'data', 'reports', `${id}.md`);

    if (!existsSync(filepath)) {
      // Try to find in sample data
      const sample = SAMPLE_REPORTS.find(r => r.id === id);
      if (sample) {
        return NextResponse.json({
          success: true,
          report: {
            ...sample,
            content: `## Bericht\n\n${sample.summary}`,
          },
          usedFallback: true,
        });
      }

      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    const fileContent = await readFile(filepath, 'utf-8');
    const { data, content } = matter(fileContent);

    return NextResponse.json({
      success: true,
      report: {
        ...data,
        content,
      },
    });

  } catch (error) {
    console.error('Report fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
