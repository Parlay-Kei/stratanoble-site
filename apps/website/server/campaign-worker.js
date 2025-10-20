// Simple worker that pulls queued jobs and simulates processing (no Twilio)
const { listJobs, updateJob } = require('./queue');
const { metrics } = require('./metrics');

const LOOP_MS = Number(process.env.WORKER_LOOP_MS || 1000);

function nowIso() { return new Date().toISOString(); }

async function processJob(job) {
  metrics.jobsStarted = (metrics.jobsStarted || 0) + 1;
  const started = updateJob(job.id, { status: 'in_progress', startedAt: nowIso() });
  try {
    // Simulate dialing by waiting a tiny bit
    await new Promise(r => setTimeout(r, 300));
    // Mark as completed (no Twilio call in this mode)
    updateJob(job.id, { status: 'completed', completedAt: nowIso(), notes: 'dry-run (no Twilio)' });
    metrics.jobsCompleted = (metrics.jobsCompleted || 0) + 1;
  } catch (e) {
    updateJob(job.id, { status: 'failed', failedAt: nowIso(), error: (e && e.message) || String(e) });
    metrics.jobsFailed = (metrics.jobsFailed || 0) + 1;
  }
}

async function loop() {
  while (true) {
    try {
      const jobs = listJobs();
      const now = Date.now();
      const runnable = jobs.filter(j => j.status === 'queued' && (!j.scheduleAt || Date.parse(j.scheduleAt) <= now));
      // crude CPS: one per loop
      if (runnable.length > 0) {
        const job = runnable[0];
        await processJob(job);
        metrics.cpsCurrent = 1;
      } else {
        metrics.cpsCurrent = 0;
      }
    } catch {}
    await new Promise(r => setTimeout(r, LOOP_MS));
  }
}

if (require.main === module) {
  loop();
}

module.exports = { loop, processJob };