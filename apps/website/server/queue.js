const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'apps/website/.data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.jsonl');

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function appendJsonl(file, obj) {
  ensureDataDir();
  fs.appendFileSync(file, JSON.stringify(obj) + '\n');
}

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  return lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function enqueue(job) {
  const item = { id: `job_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, status: 'queued', enqueuedAt: Date.now(), ...job };
  appendJsonl(JOBS_FILE, item);
  return item;
}

function listJobs() {
  return readJsonl(JOBS_FILE);
}

function updateJob(id, patch) {
  const jobs = listJobs();
  const idx = jobs.findIndex(j => j.id === id);
  if (idx === -1) return null;
  const updated = { ...jobs[idx], ...patch };
  // rewrite file (simple, safe for dev)
  ensureDataDir();
  const out = jobs.map((j, i) => i === idx ? updated : j).map(JSON.stringify).join('\n') + '\n';
  fs.writeFileSync(JOBS_FILE, out);
  return updated;
}

module.exports = { enqueue, listJobs, updateJob, DATA_DIR, JOBS_FILE };