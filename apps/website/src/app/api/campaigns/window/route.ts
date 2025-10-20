import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const campaignId = (form.get('campaignId') as string) || '';
    const window = (form.get('window') as string) || '';
    if (!campaignId || !window) return NextResponse.json({ error: 'campaignId and window required' }, { status: 400 });

    const base = process.cwd();
    const p = path.join(base, 'apps/website/.data/campaigns.jsonl');
    if (!fs.existsSync(p)) return NextResponse.json({ error: 'no campaigns' }, { status: 404 });
    const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/).filter(Boolean);
    const updated = lines.map((l) => {
      try {
        const obj = JSON.parse(l);
        if (obj.id === campaignId) obj.window = window;
        return JSON.stringify(obj);
      } catch { return l; }
    }).join('\n') + '\n';
    fs.writeFileSync(p, updated);
    return NextResponse.redirect(new URL('/campaigns', req.url));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}