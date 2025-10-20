import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

type Campaign = { id: string; name: string; createdAt: number; totalLeads: number; cps: number; fromNumber: string };
type Job = { id: string; status: string; campaignId?: string; scheduleAt?: string; startedAt?: string; completedAt?: string };
type Summary = { id: string; session: string; createdAt: string; summary?: string; outcome?: string; confidence?: number };

function readJsonl<T=any>(rel: string): T[] {
  try {
    const base = process.cwd();
    const p = path.join(base, 'apps/website/.data', rel);
    if (!fs.existsSync(p)) return [];
    const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/).filter(Boolean);
    return lines.map((l) => { try { return JSON.parse(l) as T; } catch { return null as any; } }).filter(Boolean);
  } catch {
    return [];
  }
}

function aggregateJobs(jobs: Job[]) {
  const byCampaign: Record<string, { queued: number; in_progress: number; completed: number; failed: number } > = {};
  for (const j of jobs) {
    const key = j.campaignId || 'unknown';
    const agg = (byCampaign[key] ||= { queued: 0, in_progress: 0, completed: 0, failed: 0 });
    if (j.status === 'queued') agg.queued++;
    else if (j.status === 'in_progress') agg.in_progress++;
    else if (j.status === 'completed') agg.completed++;
    else if (j.status === 'failed') agg.failed++;
  }
  return byCampaign;
}

export default function CampaignsPage() {
  const campaigns = readJsonl<Campaign>('campaigns.jsonl');
  const jobs = readJsonl<Job>('jobs.jsonl');
  const summaries = readJsonl<Summary>('summaries.jsonl');

  const jobsAgg = aggregateJobs(jobs);
  const recentSummaries = summaries.slice(-10).reverse();

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <a href="/transcripts" className="text-blue-600 hover:underline text-sm mr-3">View Transcripts</a><a href="/dnc" className="text-blue-600 hover:underline text-sm">Manage DNC</a>
      </div>

      {campaigns.length === 0 && (
        <div className="p-4 border rounded bg-yellow-50 text-yellow-800">
          No campaigns found. Use the scheduler to enqueue jobs.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((c) => {
          const agg = jobsAgg[c.id] || { queued: 0, in_progress: 0, completed: 0, failed: 0 };
          return (
            <div key={c.id} className="border rounded-lg bg-white shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{c.name}</h2>
                  <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-xs text-gray-600">CPS: {c.cps} • From: {c.fromNumber}</div>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Queued</div>
                  <div className="text-base font-semibold">{agg.queued}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">In Progress</div>
                  <div className="text-base font-semibold">{agg.in_progress}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Completed</div>
                  <div className="text-base font-semibold">{agg.completed}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Failed</div>
                  <div className="text-base font-semibold">{agg.failed}</div>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600">Total leads: {c.totalLeads}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Recent Summaries</h2>
        {recentSummaries.length === 0 ? (
          <p className="text-gray-600 text-sm">No summaries yet.</p>
        ) : (
          <div className="space-y-3">
            {recentSummaries.map((s) => (
              <div key={s.id} className="p-3 border rounded bg-white shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium">Session: {s.session}</div>
                  <div className="text-gray-500">{new Date(s.createdAt).toLocaleString()}</div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Outcome:</span> {s.outcome || 'unknown'}
                  {typeof s.confidence === 'number' && <span className="text-gray-500"> ({Math.round((s.confidence || 0)*100)}%)</span>}
                </div>
                {s.summary && (
                  <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{s.summary}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
