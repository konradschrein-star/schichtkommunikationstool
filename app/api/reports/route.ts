import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getSampleReports } from '@/lib/fallback-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shift = searchParams.get('shift') ? parseInt(searchParams.get('shift')!) : undefined;
    const date = searchParams.get('date');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    const reportsDir = path.join(process.cwd(), 'data', 'reports');

    // Check if reports directory exists and has files
    if (!existsSync(reportsDir)) {
      // Return sample data
      return NextResponse.json({
        success: true,
        reports: getSampleReports(shift),
        total: getSampleReports(shift).length,
        usedFallback: true,
      });
    }

    const files = await readdir(reportsDir);
    const markdownFiles = files.filter(f => f.endsWith('.md') && !f.includes('summary'));

    if (markdownFiles.length === 0) {
      // Return sample data
      return NextResponse.json({
        success: true,
        reports: getSampleReports(shift),
        total: getSampleReports(shift).length,
        usedFallback: true,
      });
    }

    // Read and parse markdown files
    const reports = await Promise.all(
      markdownFiles.map(async (file) => {
        const filepath = path.join(reportsDir, file);
        const content = await readFile(filepath, 'utf-8');
        const { data } = matter(content);
        return data;
      })
    );

    // Filter by shift if provided
    let filtered = reports;
    if (shift !== undefined) {
      filtered = filtered.filter(r => r.schicht === shift);
    }
    if (date) {
      filtered = filtered.filter(r => r.datum === date);
    }

    // Sort by date/time descending
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.datum}T${a.zeit}`);
      const dateB = new Date(`${b.datum}T${b.zeit}`);
      return dateB.getTime() - dateA.getTime();
    });

    // Limit results
    const paginated = filtered.slice(0, limit);

    // Calculate aggregated metrics
    const aggregated = {
      totalDelays: filtered.reduce((sum, r) => sum + (r.delay_hours || 0), 0),
      totalCost: filtered.reduce((sum, r) => sum + (r.estimated_cost || 0), 0),
      reportsCount: filtered.length,
    };

    return NextResponse.json({
      success: true,
      reports: paginated,
      total: filtered.length,
      aggregated,
    });

  } catch (error) {
    console.error('Reports fetch error:', error);

    // Fallback to sample data on error
    return NextResponse.json({
      success: true,
      reports: getSampleReports(),
      total: getSampleReports().length,
      usedFallback: true,
    });
  }
}
