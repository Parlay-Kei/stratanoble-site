import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

interface Rec { timestamp: string; testName: string; role: string; text: string }

function readTranscripts(): Record<string, Rec[]> {
  try {
    const base = process.cwd();
    const p = path.join(base, 'apps/website/.data/transcripts.jsonl');
    if (!fs.existsSync(p)) return {};
    const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/).filter(Boolean);
    const byName: Record<string, Rec[]> = {};
    for (const line of lines) {
      try {
        const rec: Rec = JSON.parse(line);
        const key = rec.testName || 'unknown';
        byName[key] = byName[key] || [];
        byName[key].push(rec);
      } catch {}
    }
    // sort each by timestamp
    Object.values(byName).forEach(arr => arr.sort((a,b) => a.timestamp.localeCompare(b.timestamp)));
    return byName;
  } catch {
    return {};
  }
}

export default function TranscriptsPage() {
  const data = readTranscripts();
  const sessions = Object.keys(data).sort();

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Transcripts</h1>
      {sessions.length === 0 && (
        <p className="text-gray-600">No transcripts found. Run the media emulator or place a call.</p>
      )}
      <div className="space-y-8">
        {sessions.map((name) => (
          <div key={name} className="border rounded-lg p-4 bg-white shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">{name}</h2>
              <span className="text-sm text-slate-grey">{data[name].length} turns</span>
            </div>
            <div className="space-y-2">
              {data[name].map((r, idx) => (
                <div key={idx} className="text-sm">
                  <span className={`font-medium ${r.role === 'assistant' ? 'text-blue-700' : 'text-gray-800'}`}>[{new Date(r.timestamp).toLocaleTimeString()}] {r.role}:</span>{' '}
                  <span>{r.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}