// Summarize transcripts per session (testName). If OPENAI_API_KEY missing or DRY_RUN=true, produce heuristic summary.
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'apps/website/.data');
const TX_FILE = path.join(DATA_DIR, 'transcripts.jsonl');
const SUM_FILE = path.join(DATA_DIR, 'summaries.jsonl');

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function groupBySession(recs) {
  const g = {};
  recs.forEach(r => {
    const key = r.testName || 'unknown';
    (g[key] = g[key] || []).push(r);
  });
  Object.values(g).forEach(arr => arr.sort((a,b) => a.timestamp.localeCompare(b.timestamp)));
  return g;
}

async function openaiSummary(text) {
  if (process.env.DRY_RUN === 'true' || !process.env.OPENAI_API_KEY) {
    const len = text.split(/\s+/).length;
    return { summary: `Heuristic summary (${len} words)`, outcome: 'unknown', confidence: 0.3 };
  }
  try {
    const { OpenAI } = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Summarize this sales call. Provide JSON with fields: summary, outcome(one of interested, not_interested, callback, unavailable), confidence(0-1). Transcript:\n\n${text}`;
    const res = await client.chat.completions.create({
      model: process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'system', content: 'You are a concise call summarizer.' }, { role: 'user', content: prompt }],
      temperature: 0.3,
    });
    const content = res.choices?.[0]?.message?.content || '';
    let parsed = null;
    try { parsed = JSON.parse(content); } catch { parsed = { summary: content.slice(0, 800), outcome: 'unknown', confidence: 0.5 }; }
    return parsed;
  } catch (e) {
    return { summary: `Summary error: ${(e && e.message) || e}`, outcome: 'error', confidence: 0 };
  }
}

async function summarize() {\n  const recs = readJsonl(TX_FILE);\n  const by = groupBySession(recs);\n  // Skip sessions already summarized\n  const existing = readJsonl(SUM_FILE).reduce((acc, x) => { if (x && x.session) acc.add(x.session); return acc; }, new Set());\n  const out = [];\n  for (const [session, lines] of Object.entries(by)) {\n    if (existing.has(session)) continue;\n    const text = lines.map(l => `${l.role}: ${l.text}`).join("\\n");\n    const s = await openaiSummary(text);\n    const item = { id: `sum_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, session, createdAt: new Date().toISOString(), ...s };\n    fs.appendFileSync(SUM_FILE, JSON.stringify(item) + "\\n");\n    out.push(item);\n  }\n  console.log(`[summarize] wrote ${out.length} summaries -> ${SUM_FILE}`);\n}: ${l.text}`).join('\n');
    const s = await openaiSummary(text);
    const item = { id: `sum_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, session, createdAt: new Date().toISOString(), ...s };
    fs.appendFileSync(SUM_FILE, JSON.stringify(item) + '\n');
    out.push(item);
  }
  console.log(`[summarize] wrote ${out.length} summaries -> ${SUM_FILE}`);
}

if (require.main === module) {
  summarize().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { summarize };
