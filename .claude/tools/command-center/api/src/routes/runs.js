/**
 * Runs API Routes
 * Handles execution run management
 */

const express = require('express');
const router = express.Router();
const dbService = require('../services/database');

// GET /api/runs/:id - Get specific run
router.get('/:id', async (req, res) => {
  try {
    const run = await dbService.getRun(req.params.id);
    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }

    // Get jobs for this run
    const jobs = await dbService.getJobsByRun(req.params.id);

    // Calculate progress
    const progress = {
      total: run.job_count,
      completed: run.jobs_completed,
      failed: run.jobs_failed,
      percentage: run.job_count > 0
        ? Math.round((run.jobs_completed + run.jobs_failed) / run.job_count * 100)
        : 0
    };

    res.json({
      run,
      jobs,
      progress
    });
  } catch (error) {
    console.error('Error fetching run:', error);
    res.status(500).json({ error: 'Failed to fetch run' });
  }
});

// PUT /api/runs/:id/stop - Stop a running execution
router.put('/:id/stop', async (req, res) => {
  try {
    const run = await dbService.getRun(req.params.id);
    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }

    // Update run status
    await dbService.updateRunStatus(req.params.id, 'stopped');

    // Stop all pending jobs
    await dbService.run(
      `UPDATE queue SET status = 'STOPPED', updated_at = CURRENT_TIMESTAMP
       WHERE run_id = ? AND status = 'PENDING'`,
      [req.params.id]
    );

    res.json({ message: 'Run stopped', run_id: req.params.id });
  } catch (error) {
    console.error('Error stopping run:', error);
    res.status(500).json({ error: 'Failed to stop run' });
  }
});

// GET /api/runs/plan/:planId - Get all runs for a plan
router.get('/plan/:planId', async (req, res) => {
  try {
    const runs = await dbService.getRunsByPlan(req.params.planId);

    res.json({
      plan_id: req.params.planId,
      runs,
      count: runs.length
    });
  } catch (error) {
    console.error('Error fetching runs:', error);
    res.status(500).json({ error: 'Failed to fetch runs' });
  }
});

module.exports = router;