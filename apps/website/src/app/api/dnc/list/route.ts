import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export async function GET() {
  try {
    const base = process.cwd();
    const p = path.join(base, 'apps/website/.data/dnc.json');
    let numbers: string[] = [];
    if (fs.existsSync(p)) {
      const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (Array.isArray(raw)) numbers = raw.map(String);
      else if (raw && Array.isArray(raw.numbers)) numbers = raw.numbers.map(String);
    }
    return NextResponse.json({ numbers });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}