/**
 * Plans API Routes
 * Handles plan operations and execution
 */

const express = require('express');
const router = express.Router();
const dbService = require('../services/database');

// GET /api/plans/:id - Get specific plan
router.get('/:id', async (req, res) => {
  try {
    const plan = await dbService.getPlan(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Get runs for this plan
    const runs = await dbService.getRunsByPlan(req.params.id);

    res.json({
      plan,
      runs
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
});

// POST /api/plans/:id/execute - Execute a plan
router.post('/:id/execute', async (req, res) => {
  try {
    const plan = await dbService.getPlan(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const jobGraph = plan.job_graph;
    const jobs = jobGraph.jobs || [];

    // Create a run record
    const runId = await dbService.createRun(req.params.id, jobs.length);

    // Update run status to executing
    await dbService.updateRunStatus(runId, 'executing');

    // Enqueue jobs based on execution strategy
    const enqueuedJobs = [];
    for (const job of jobs) {
      const payload = {
        ...job.command,
        job_id: job.id,
        job_name: job.name,
        run_id: runId,
        directive_id: plan.directive_id,
        proof_required: job.proof_required,
        proof_type: job.proof_type
      };

      const queueId = await dbService.enqueueJob(payload, runId, plan.directive_id);
      enqueuedJobs.push({
        queue_id: queueId,
        job_id: job.id,
        job_name: job.name
      });
    }

    // Update directive status
    await dbService.updateDirectiveStatus(plan.directive_id, 'executing');

    res.json({
      run_id: runId,
      plan_id: req.params.id,
      jobs_queued: enqueuedJobs.length,
      execution_strategy: jobGraph.execution_strategy || 'sequential',
      jobs: enqueuedJobs
    });
  } catch (error) {
    console.error('Error executing plan:', error);
    res.status(500).json({ error: 'Failed to execute plan' });
  }
});

// POST /api/plans/:id/rerun-failed - Rerun only failed jobs
router.post('/:id/rerun-failed', async (req, res) => {
  try {
    const { run_id } = req.body;

    if (!run_id) {
      return res.status(400).json({ error: 'run_id is required' });
    }

    // Get failed jobs from the run
    const jobs = await dbService.getJobsByRun(run_id);
    const failedJobs = jobs.filter(job =>
      job.status === 'FAILED' || job.status === 'TIMEOUT' || job.status === 'CRASH'
    );

    if (failedJobs.length === 0) {
      return res.json({ message: 'No failed jobs to rerun' });
    }

    // Create a new run for the retry
    const newRunId = await dbService.createRun(req.params.id, failedJobs.length);
    await dbService.updateRunStatus(newRunId, 'executing');

    // Re-enqueue failed jobs
    const rerunJobs = [];
    for (const job of failedJobs) {
      const payload = JSON.parse(job.payload);
      payload.retry_of = job.id;
      payload.run_id = newRunId;

      const queueId = await dbService.enqueueJob(payload, newRunId, job.directive_id);
      rerunJobs.push({
        queue_id: queueId,
        original_job_id: job.id,
        job_name: payload.job_name
      });
    }

    res.json({
      run_id: newRunId,
      plan_id: req.params.id,
      jobs_requeued: rerunJobs.length,
      jobs: rerunJobs
    });
  } catch (error) {
    console.error('Error rerunning failed jobs:', error);
    res.status(500).json({ error: 'Failed to rerun failed jobs' });
  }
});

module.exports = router;