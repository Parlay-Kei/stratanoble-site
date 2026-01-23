/**
 * Jobs API Routes
 * Handles job status and management
 */

const express = require('express');
const router = express.Router();
const dbService = require('../services/database');

// GET /api/jobs/run/:runId - Get all jobs for a run
router.get('/run/:runId', async (req, res) => {
  try {
    const jobs = await dbService.getJobsByRun(req.params.runId);

    // Calculate statistics
    const stats = {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'PENDING').length,
      executing: jobs.filter(j => j.status === 'EXECUTING').length,
      completed: jobs.filter(j => j.status === 'COMPLETED' || j.status === 'SUCCESS').length,
      failed: jobs.filter(j => j.status === 'FAILED' || j.status === 'TIMEOUT' || j.status === 'CRASH').length,
      blocked: jobs.filter(j => j.status === 'BLOCKED').length
    };

    res.json({
      run_id: req.params.runId,
      jobs,
      stats
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id - Get specific job
router.get('/:id', async (req, res) => {
  try {
    const job = await dbService.get(
      `SELECT * FROM queue WHERE id = ?`,
      [req.params.id]
    );

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Parse payload if it's a string
    if (typeof job.payload === 'string') {
      job.payload = JSON.parse(job.payload);
    }

    res.json({ job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// PUT /api/jobs/:id/status - Update job status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, error } = req.body;
    const validStatuses = [
      'PENDING', 'EXECUTING', 'COMPLETED', 'SUCCESS',
      'FAILED', 'TIMEOUT', 'CRASH', 'BLOCKED', 'STOPPED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        valid: validStatuses
      });
    }

    await dbService.updateJobStatus(req.params.id, status, error);

    // If job completed/failed, update run statistics
    const job = await dbService.get(
      `SELECT run_id FROM queue WHERE id = ?`,
      [req.params.id]
    );

    if (job && job.run_id) {
      const jobs = await dbService.getJobsByRun(job.run_id);
      const completed = jobs.filter(j =>
        ['COMPLETED', 'SUCCESS', 'BLOCKED'].includes(j.status)
      ).length;
      const failed = jobs.filter(j =>
        ['FAILED', 'TIMEOUT', 'CRASH'].includes(j.status)
      ).length;

      await dbService.updateRunStatus(
        job.run_id,
        jobs.every(j => j.status !== 'PENDING' && j.status !== 'EXECUTING')
          ? (failed > 0 ? 'failed' : 'completed')
          : 'executing',
        completed,
        failed
      );
    }

    res.json({ message: 'Job status updated', id: req.params.id });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

// POST /api/jobs/:id/retry - Retry a specific job
router.post('/:id/retry', async (req, res) => {
  try {
    const job = await dbService.get(
      `SELECT * FROM queue WHERE id = ?`,
      [req.params.id]
    );

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Parse and update payload
    const payload = JSON.parse(job.payload);
    payload.retry_of = req.params.id;
    payload.retry_attempt = (payload.retry_attempt || 0) + 1;

    // Create new job
    const newJobId = await dbService.enqueueJob(payload, job.run_id, job.directive_id);

    res.json({
      original_job_id: req.params.id,
      new_job_id: newJobId,
      retry_attempt: payload.retry_attempt
    });
  } catch (error) {
    console.error('Error retrying job:', error);
    res.status(500).json({ error: 'Failed to retry job' });
  }
});

module.exports = router;