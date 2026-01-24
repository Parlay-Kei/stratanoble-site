/**
 * System Status Authority Endpoint
 * Single source of truth for all system status information
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getANXRoot } = require('C:\\Dev\\.claude-anx\\tools\\anx-root-resolver');

// Load runtime information
function getRuntimeInfo() {
  try {
    const runtimePath = path.join(getANXRoot(), 'runtime', 'command_center.runtime.json');
    if (fs.existsSync(runtimePath)) {
      return JSON.parse(fs.readFileSync(runtimePath, 'utf-8'));
    }
  } catch (err) {
    console.error('[SYSTEM] Error reading runtime file:', err);
  }
  return null;
}

// Load context information
function getContextInfo() {
  try {
    const contextPath = path.join(getANXRoot(), 'runtime', 'context.json');
    if (fs.existsSync(contextPath)) {
      return JSON.parse(fs.readFileSync(contextPath, 'utf-8'));
    }
  } catch (err) {
    console.error('[SYSTEM] Error reading context file:', err);
  }
  return { project_root: null };
}

// Check if process is running
function isProcessRunning(pid) {
  if (!pid) return false;
  try {
    // On Windows, this will throw if process doesn't exist
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * GET /api/system/status
 * Unified status endpoint - single source of truth
 */
router.get('/status', (req, res) => {
  const runtime = getRuntimeInfo();
  const context = getContextInfo();
  const now = new Date();

  // Determine API status
  const apiStatus = {
    status: 'online', // If we can respond, API is online
    last_seen: now.toISOString(),
    port: process.env.PORT || (runtime?.actual_api_port) || 5000,
    host: '127.0.0.1',
    uptime: process.uptime(),
    pid: process.pid
  };

  // Determine supervisor status from runtime file
  let supervisorStatus = {
    status: 'unknown',
    pid: null,
    started_at: null
  };

  if (runtime) {
    const supervisorRunning = isProcessRunning(runtime.supervisor_pid);
    supervisorStatus = {
      status: supervisorRunning ? 'running' : 'stopped',
      pid: runtime.supervisor_pid,
      started_at: runtime.started_at || null,
      last_update: runtime.last_updated || null
    };
  }

  // Port information - simplified
  const ports = {
    api: apiStatus.port,
    ui: runtime?.actual_ui_port || 3000
  };

  // Context information
  const contextInfo = {
    project_root: context.project_root || null,
    project_name: context.project_root ? path.basename(context.project_root) : 'Global',
    source: context.project_root ? 'explicit' : 'implicit',
    working_directory: process.cwd()
  };

  // UI service status (from runtime)
  const uiStatus = {
    status: runtime?.ui_status || 'unknown',
    url: runtime?.ui_url || null,
    port: runtime?.actual_ui_port || null
  };

  // System health summary
  const systemHealth = {
    overall: 'operational', // We're responding, so at least partially operational
    api: apiStatus.status,
    supervisor: supervisorStatus.status,
    ui: uiStatus.status,
    timestamp: now.toISOString()
  };

  res.json({
    health: systemHealth,
    api: apiStatus,
    supervisor: supervisorStatus,
    ui: uiStatus,
    ports: ports,
    context: contextInfo,
    runtime: {
      file_present: runtime !== null,
      last_updated: runtime?.last_updated || null
    },
    // UI-facing relative paths only
    endpoints: {
      api_base: "/api",
      runtime: "/api/system/runtime",
      context: "/api/context",
      health: "/api/health",
      status: "/api/system/status"
    },
    // Internal platform URLs (not for UI consumption)
    _internal_urls: {
      api_origin: `http://127.0.0.1:${apiStatus.port}`,
      control_origin: `http://127.0.0.1:5001`,
      ui_origin: runtime?.ui_url || `http://127.0.0.1:3000`
    },
    server_time: now.toISOString(),
    started_at: runtime?.started_at || null,
    last_healthy_at: now.toISOString()
  });
});

/**
 * GET /api/system/heartbeat
 * Simple heartbeat for quick health checks
 */
router.get('/heartbeat', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET /api/system/runtime
 * Runtime status for cockpit compatibility
 */
router.get('/runtime', (req, res) => {
  const runtime = getRuntimeInfo();
  const now = new Date();

  res.json({
    state: 'RUNNING',
    started_at: runtime?.started_at || now.toISOString(),
    last_seen: now.toISOString(),
    api_port: process.env.PORT || 5000,
    ui_port: runtime?.actual_ui_port || 3000,
    supervisor_pid: runtime?.supervisor_pid || null,
    supervisor_running: runtime ? isProcessRunning(runtime.supervisor_pid) : false,
    timestamp: now.toISOString()
  });
});

module.exports = router;