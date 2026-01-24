#!/usr/bin/env node
/**
 * Command Center Control Plane v0
 * Minimal localhost-only API for cockpit UI to control supervisor
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');

const app = express();
const PORT = 5001;
const HOST = '127.0.0.1';

// Paths
// Universal ANX root resolution
const { getANXRoot, validateCanonicalRoot } = require('C:\\Dev\\.claude-anx\\tools\\anx-root-resolver');
const ANX_ROOT = getANXRoot();
const RUNTIME_FILE = path.join(ANX_ROOT, 'runtime', 'command_center.runtime.json');
const RECEIPTS_DIR = path.join(ANX_ROOT, 'receipts');
const SUPERVISOR_PATH = path.join(ANX_ROOT, 'tools', 'command-center', 'supervisor', 'anx_supervisor.js');

// Global supervisor process reference
let supervisorProcess = null;

app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware to log all requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

/**
 * GET /runtime
 * Returns parsed runtime contract JSON or { state: "STOPPED" } if missing
 */
app.get('/runtime', async (req, res) => {
  try {
    const runtimeData = await fs.readFile(RUNTIME_FILE, 'utf8');
    const contract = JSON.parse(runtimeData);

    // Add derived state for UI
    contract.control_plane_status = 'ONLINE';
    contract.supervisor_running = supervisorProcess && !supervisorProcess.killed;

    console.log('[CONTROL] Runtime contract read:', contract.state || contract.api_status);
    res.json(contract);
  } catch (error) {
    console.log('[CONTROL] Runtime file not found or invalid, returning STOPPED');
    res.json({
      state: 'STOPPED',
      control_plane_status: 'ONLINE',
      supervisor_running: false,
      message: 'Supervisor not running'
    });
  }
});

/**
 * POST /start
 * Triggers supervisor start sequence
 */
app.post('/start', async (req, res) => {
  try {
    if (supervisorProcess && !supervisorProcess.killed) {
      return res.json({
        ok: false,
        error: 'Supervisor already running',
        pid: supervisorProcess.pid
      });
    }

    console.log('[CONTROL] Starting supervisor...');

    // Generate run ID
    const runId = Date.now().toString(36);

    // Start supervisor process
    supervisorProcess = spawn('node', [SUPERVISOR_PATH], {
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ANX_RUN_ID: runId
      }
    });

    // Log supervisor output
    supervisorProcess.stdout.on('data', (data) => {
      console.log(`[SUPERVISOR] ${data.toString().trim()}`);
    });

    supervisorProcess.stderr.on('data', (data) => {
      console.error(`[SUPERVISOR ERROR] ${data.toString().trim()}`);
    });

    supervisorProcess.on('exit', (code, signal) => {
      console.log(`[CONTROL] Supervisor exited: code=${code}, signal=${signal}`);
      supervisorProcess = null;
    });

    // Write start receipt
    await writeControlReceipt('START_REQUESTED', {
      runId,
      supervisorPid: supervisorProcess.pid,
      requestedAt: new Date().toISOString()
    });

    console.log(`[CONTROL] Supervisor started with PID ${supervisorProcess.pid}, run_id: ${runId}`);

    res.json({
      ok: true,
      run_id: runId,
      supervisor_pid: supervisorProcess.pid,
      message: 'Supervisor starting'
    });

  } catch (error) {
    console.error('[CONTROL] Failed to start supervisor:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/**
 * POST /stop
 * Stops services cleanly
 */
app.post('/stop', async (req, res) => {
  try {
    if (!supervisorProcess || supervisorProcess.killed) {
      return res.json({
        ok: false,
        error: 'Supervisor not running'
      });
    }

    console.log('[CONTROL] Stopping supervisor...');

    const stopTime = new Date().toISOString();
    const pid = supervisorProcess.pid;

    // Send SIGTERM for graceful shutdown
    supervisorProcess.kill('SIGTERM');

    // Write stop receipt
    await writeControlReceipt('STOP_REQUESTED', {
      supervisorPid: pid,
      requestedAt: stopTime,
      signal: 'SIGTERM'
    });

    console.log(`[CONTROL] Stop signal sent to supervisor PID ${pid}`);

    res.json({
      ok: true,
      message: 'Stop signal sent',
      supervisor_pid: pid
    });

  } catch (error) {
    console.error('[CONTROL] Failed to stop supervisor:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/**
 * GET /health
 * Returns { ok: true } for the control plane itself
 */
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'command-center-control-plane',
    version: '0.1.0',
    uptime: process.uptime(),
    supervisor_running: supervisorProcess && !supervisorProcess.killed
  });
});

/**
 * GET /receipts?limit=20
 * Returns latest receipt filenames + timestamps + first 300 chars
 */
app.get('/receipts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get all .md files from receipts directory
    const files = await fs.readdir(RECEIPTS_DIR);
    const receiptFiles = files.filter(f => f.endsWith('.md'));

    // Get file stats and content preview
    const receipts = await Promise.all(
      receiptFiles.slice(0, limit).map(async (filename) => {
        try {
          const filepath = path.join(RECEIPTS_DIR, filename);
          const stats = await fs.stat(filepath);
          const content = await fs.readFile(filepath, 'utf8');

          return {
            filename,
            created_at: stats.birthtime.toISOString(),
            modified_at: stats.mtime.toISOString(),
            size: stats.size,
            preview: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
            type: extractReceiptType(filename)
          };
        } catch (error) {
          return {
            filename,
            error: error.message,
            type: 'ERROR'
          };
        }
      })
    );

    // Sort by creation time (newest first)
    receipts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log(`[CONTROL] Returned ${receipts.length} receipts`);

    res.json({
      ok: true,
      receipts: receipts.slice(0, limit),
      total_files: receiptFiles.length,
      receipts_directory: RECEIPTS_DIR
    });

  } catch (error) {
    console.error('[CONTROL] Failed to read receipts:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/**
 * Helper: Extract receipt type from filename
 */
function extractReceiptType(filename) {
  if (filename.startsWith('SYSTEM_STARTED')) return 'STARTED';
  if (filename.startsWith('SYSTEM_STOPPED')) return 'STOPPED';
  if (filename.startsWith('SYSTEM_RESTARTED')) return 'RESTART';
  if (filename.startsWith('SYSTEM_RESTART_STORM_ROLLUP')) return 'ROLLUP';
  if (filename.startsWith('CIRCUIT_BREAKER_TRIGGERED')) return 'DEGRADED';
  if (filename.startsWith('CONTROL_PLANE')) return 'CONTROL';
  if (filename.startsWith('QA_')) return 'QA';
  if (filename.startsWith('ENG_')) return 'ENGINEERING';
  if (filename.startsWith('PLATFORM_')) return 'PLATFORM';
  return 'OTHER';
}

/**
 * Helper: Write control plane receipt
 */
async function writeControlReceipt(eventType, details) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `CONTROL_PLANE_${eventType}_${timestamp}.md`;
    const filepath = path.join(RECEIPTS_DIR, filename);

    const content = `# Control Plane Receipt - ${eventType}

**Date:** ${new Date().toISOString()}
**Component:** Command Center Control Plane
**Event:** ${eventType}

## Details

${JSON.stringify(details, null, 2)}

## System State

- Control Plane: ONLINE
- Supervisor Process: ${supervisorProcess ? 'Running' : 'Stopped'}
- Supervisor PID: ${supervisorProcess?.pid || 'N/A'}

---
Generated by: Command Center Control Plane v0
`;

    await fs.writeFile(filepath, content);
    console.log(`[CONTROL] Written receipt: ${filename}`);
  } catch (error) {
    console.error('[CONTROL] Failed to write receipt:', error);
  }
}

// Error handling
app.use((error, req, res, next) => {
  console.error('[CONTROL] Unhandled error:', error);
  res.status(500).json({
    ok: false,
    error: 'Internal server error'
  });
});

// Start control plane
app.listen(PORT, HOST, () => {
  console.log(`[CONTROL] Command Center Control Plane v0 running at http://${HOST}:${PORT}`);
  console.log(`[CONTROL] Endpoints:`);
  console.log(`[CONTROL]   GET  /runtime`);
  console.log(`[CONTROL]   POST /start`);
  console.log(`[CONTROL]   POST /stop`);
  console.log(`[CONTROL]   GET  /health`);
  console.log(`[CONTROL]   GET  /receipts`);

  // Write startup receipt
  writeControlReceipt('CONTROL_PLANE_STARTED', {
    host: HOST,
    port: PORT,
    startedAt: new Date().toISOString(),
    pid: process.pid
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[CONTROL] Shutting down control plane...');

  if (supervisorProcess && !supervisorProcess.killed) {
    console.log('[CONTROL] Stopping supervisor before shutdown...');
    supervisorProcess.kill('SIGTERM');
  }

  await writeControlReceipt('CONTROL_PLANE_STOPPED', {
    stoppedAt: new Date().toISOString(),
    reason: 'SIGINT'
  });

  process.exit(0);
});