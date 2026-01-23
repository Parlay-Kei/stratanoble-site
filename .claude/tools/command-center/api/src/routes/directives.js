/**
 * Directives API Routes
 * Handles CRUD operations for directives
 */

const express = require('express');
const router = express.Router();
const dbService = require('../services/database');

// Boot diagnostics for mission compiler
let MissionCompiler;
let compiler;
let compilerVersion;
let compilerLoadError;

try {
  console.log('[API] Loading Mission Compiler from: ../../../mission-compiler/src/compiler.js');
  MissionCompiler = require('../../../mission-compiler/src/compiler.js');
  compiler = new MissionCompiler();
  compilerVersion = compiler.version || 'unknown';
  console.log(`[API] Mission Compiler loaded successfully - version: ${compilerVersion}`);
} catch (error) {
  compilerLoadError = error.message;
  console.error('[API] CRITICAL: Mission Compiler failed to load:', error);
  console.error('[API] Import attempted from API routes/directives.js');
  console.error('[API] Current working directory:', process.cwd());
  console.error('[API] Attempted path: ../../../mission-compiler/src/compiler.js');
  console.error('[API] This will cause directive creation to fail');
}

// GET /api/directives - List all directives
router.get('/', async (req, res) => {
  try {
    const directives = await dbService.getAllDirectives();
    res.json({
      directives,
      count: directives.length
    });
  } catch (error) {
    console.error('Error fetching directives:', error);
    res.status(500).json({ error: 'Failed to fetch directives' });
  }
});

// GET /api/directives/:id - Get specific directive
router.get('/:id', async (req, res) => {
  try {
    const directive = await dbService.getDirective(req.params.id);
    if (!directive) {
      return res.status(404).json({ error: 'Directive not found' });
    }

    // Get associated plans
    const plans = await dbService.getPlansByDirective(req.params.id);

    res.json({
      directive,
      plans
    });
  } catch (error) {
    console.error('Error fetching directive:', error);
    res.status(500).json({ error: 'Failed to fetch directive' });
  }
});

// POST /api/directives - Create new directive
router.post('/', async (req, res) => {
  try {
    const { title, body, scope, intent, owner } = req.body;

    // Validate required fields
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Check if mission compiler is available
    if (compilerLoadError) {
      return res.status(503).json({
        error: 'Mission Compiler unavailable',
        details: compilerLoadError,
        directive_creation: 'blocked'
      });
    }

    // Create directive
    const directiveId = await dbService.createDirective(
      title,
      body,
      scope || 'all',
      intent || 'analyze',
      owner || 'OCS'
    );

    const directive = await dbService.getDirective(directiveId);

    // Automatically compile a plan
    const jobGraph = compiler.compile({
      id: directiveId,
      title,
      body,
      scope: scope || 'all',
      intent: intent || 'analyze'
    });

    // Sign the plan
    const signedPlan = compiler.signPlan(jobGraph);

    // Save the plan
    const planId = await dbService.createPlan(directiveId, signedPlan);

    // Update directive status
    await dbService.updateDirectiveStatus(directiveId, 'planned');

    res.status(201).json({
      directive,
      plan: {
        id: planId,
        job_graph: signedPlan
      },
      compiler_info: {
        version: compilerVersion,
        status: 'operational'
      }
    });
  } catch (error) {
    console.error('Error creating directive:', error);
    res.status(500).json({ error: 'Failed to create directive' });
  }
});

// PUT /api/directives/:id/status - Update directive status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'planned', 'executing', 'completed', 'failed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        valid: validStatuses
      });
    }

    await dbService.updateDirectiveStatus(req.params.id, status);
    const directive = await dbService.getDirective(req.params.id);

    res.json({ directive });
  } catch (error) {
    console.error('Error updating directive status:', error);
    res.status(500).json({ error: 'Failed to update directive status' });
  }
});

// DELETE /api/directives/:id - Delete directive
router.delete('/:id', async (req, res) => {
  try {
    // Check if directive exists
    const directive = await dbService.getDirective(req.params.id);
    if (!directive) {
      return res.status(404).json({ error: 'Directive not found' });
    }

    // Soft delete by updating status
    await dbService.updateDirectiveStatus(req.params.id, 'deleted');

    res.json({ message: 'Directive deleted', id: req.params.id });
  } catch (error) {
    console.error('Error deleting directive:', error);
    res.status(500).json({ error: 'Failed to delete directive' });
  }
});

module.exports = router;