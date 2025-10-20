import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

function load(base: string) {
  const p = path.join(base, 'apps/website/.data/dnc.json');
  if (!fs.existsSync(p)) return { path: p, list: [] as string[] };
  const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  const list = Array.isArray(raw) ? raw.map(String) : Array.isArray(raw.numbers) ? raw.numbers.map(String) : [];
  return { path: p, list };
}

export async function POST(req: NextRequest) {
  try {
    const { number } = await req.json();
    if (!number) return NextResponse.json({ error: 'number required' }, { status: 400 });
    const base = process.cwd();
    const { path: p, list } = load(base);
    const next = list.filter((n) => n !== String(number).trim());
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify({ numbers: next }, null, 2));
    return NextResponse.json({ ok: true, numbers: next });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}