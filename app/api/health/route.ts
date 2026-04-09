import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import path from 'path';

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      dataDirectories: {
        media: existsSync(path.join(process.cwd(), 'data', 'media')),
        reports: existsSync(path.join(process.cwd(), 'data', 'reports')),
        fallback: existsSync(path.join(process.cwd(), 'data', 'fallback')),
      },
      env: {
        geminiKey: !!process.env.GEMINI_API_KEY,
        demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
      },
    },
  };

  return NextResponse.json(checks);
}
