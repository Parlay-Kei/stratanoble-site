#!/usr/bin/env node
/**
 * ANX Supervisor - Local daemon for Command Center
 * Ensures API and UI are always running with health checks and auto-restart
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();

// For Node.js < 18, use node-fetch. For Node.js 18+, fetch is global
let fetch;
try {
  fetch = globalThis.fetch || require('node-fetch');
} catch (e) {
  // Fallback to http module if fetch is not available
  fetch = null;
}

// Universal ANX root resolution
const { getANXRoot, validateCanonicalRoot } = require('C:\\Dev\\.claude-anx\\tools\\anx-root-resolver');
const ANX_ROOT = getANXRoot();
const STATE_DB = path.join(ANX_ROOT, 'state', 'anx_state.db');
const RECEIPTS_DIR = path.join(ANX_ROOT, 'receipts');
const RUNTIME_DIR = path.join(ANX_ROOT, 'runtime');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'command_center.runtime.json');
const API_DIR = path.join(ANX_ROOT, 'tools', 'command-center', 'api');
const UI_DIR = path.join(ANX_ROOT, 'tools', 'command-center', 'ui');

const API_HOST = '127.0.0.1';
const API_PORT = 5000;
const UI_PORT = 3000;
const UI_PORT_START = 3000;  // Start searching from port 3000
const UI_PORT_RANGE = 10;    // Check ports 3000-3009
const HEALTH_CHECK_INTERVAL = 5000; // 5 seconds
const RESTART_BACKOFF = [1000, 2000, 5000, 10000, 30000]; // Progressive backoff

// Service states enum
const ServiceState = {
  STOPPED: 'STOPPED',
  STARTING: 'STARTING',
  RUNNING: 'RUNNING',
  RESTARTING: 'RESTARTING',
  DEGRADED: 'DEGRADED',
  FAILED: 'FAILED'
};

class ANXSupervisor {
  constructor() {
    this.apiProcess = null;
    this.uiProcess = null;
    this.restartCount = { api: 0, ui: 0 };
    this.isShuttingDown = false;
    this.db = null;
    this.healthCheckTimer = null;
    this.startTime = new Date();
    this.actualUIPort = null; // Detected UI port
    this.actualAPIPort = null; // Detected API port
    this.apiPortInUse = false;
    this.uiBuildPresent = false;
    this.supervisorStartMethod = null;
    this.uiOutputBuffer = ''; // Buffer for multiline output detection
    this.uiPortAttempt = UI_PORT_START;

    // State machine tracking
    this.serviceStates = {
      api: ServiceState.STOPPED,
      ui: ServiceState.STOPPED,
      supervisor: ServiceState.STOPPED
    };

    // Receipt deduplication
    this.receiptCache = new Map(); // key -> { count, firstSeen, lastSeen }
    this.receiptDedupeWindow = 60000; // 60 seconds
    this.lastRestartReceipt = { api: null, ui: null }; // Track last restart times

    // Circuit breaker
    this.failureThreshold = 5; // Max failures before circuit breaker triggers
    this.consecutiveFailures = { api: 0, ui: 0 };
    this.runId = Date.now().toString(36); // Unique run identifier
  }

  async init() {
    console.log('[SUPERVISOR] ANX Command Center Supervisor starting...');
    this.serviceStates.supervisor = ServiceState.STARTING;

    // Load existing runtime state if available
    await this.loadRuntimeState();

    // Detect how supervisor was started
    await this.detectStartupMethod();

    // Check if API port is available
    await this.checkAPIPortAvailable();

    // Check if UI build is present
    await this.checkUIBuildPresent();

    // Connect to database
    await this.connectDatabase();

    // Create supervisor tables if needed
    await this.createTables();

    // Write STARTED receipt
    await this.writeSystemReceipt('STARTED', {
      message: 'ANX Supervisor initialized',
      pid: process.pid,
      timestamp: new Date().toISOString()
    });

    // Set up signal handlers
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('uncaughtException', (err) => {
      console.error('[SUPERVISOR] Uncaught exception:', err);
      this.recordCrashEvent('supervisor', err.message);
      this.shutdown('CRASH');
    });

    // Start services
    await this.startAPI();
    await this.startUI();

    // Start health monitoring
    this.startHealthChecks();

    // Write runtime contract file
    await this.writeRuntimeFile();

    this.serviceStates.supervisor = ServiceState.RUNNING;
    console.log('[SUPERVISOR] All services started successfully');

    // Write receipt rollup periodically if we've been suppressing
    setInterval(() => this.writeReceiptRollup(), 60000); // Every minute
  }

  async writeReceiptRollup() {
    let totalSuppressed = 0;
    const suppressedDetails = [];

    for (const [key, value] of this.receiptCache.entries()) {
      if (value.count > 1) {
        totalSuppressed += value.count - 1;
        suppressedDetails.push({
          key,
          count: value.count,
          firstSeen: new Date(value.firstSeen).toISOString(),
          lastSeen: new Date(value.lastSeen).toISOString()
        });
      }
    }

    if (totalSuppressed > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `SYSTEM_RESTART_STORM_ROLLUP_${timestamp}.md`;
      const filepath = path.join(RECEIPTS_DIR, filename);

      const content = `# Receipt Storm Rollup

**Date:** ${new Date().toISOString()}
**Total Suppressed:** ${totalSuppressed}
**Run ID:** ${this.runId}

## Suppressed Events

${JSON.stringify(suppressedDetails, null, 2)}

## Service States

${JSON.stringify(this.serviceStates, null, 2)}

---
Generated by: ANX Supervisor Receipt Deduplication System
`;

      try {
        await fs.writeFile(filepath, content);
        console.log(`[SUPERVISOR] Written receipt rollup: ${filename} (${totalSuppressed} suppressed)`);
        // Clear processed cache entries
        this.receiptCache.clear();
      } catch (err) {
        console.error(`[SUPERVISOR] Failed to write rollup: ${err.message}`);
      }
    }
  }

  connectDatabase() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(STATE_DB, (err) => {
        if (err) {
          console.error('[SUPERVISOR] Failed to connect to database:', err);
          reject(err);
        } else {
          console.log('[SUPERVISOR] Connected to ANX state database');
          resolve();
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Create supervisor events table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS supervisor_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            service TEXT,
            details TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) console.error('Error creating supervisor_events table:', err);
        });

        // Create heartbeats table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS supervisor_heartbeats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_status TEXT,
            ui_status TEXT,
            uptime_seconds INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) console.error('Error creating supervisor_heartbeats table:', err);
          resolve();
        });
      });
    });
  }

  async startAPI() {
    console.log('[SUPERVISOR] Starting API server...');
    this.serviceStates.api = ServiceState.STARTING;

    return new Promise((resolve) => {
      this.apiProcess = spawn('node', ['src/server.js'], {
        cwd: API_DIR,
        env: { ...process.env, PORT: API_PORT, HOST: API_HOST },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let portDetected = false;
      this.apiProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[API] ${output.trim()}`);

        // Detect actual API port from server output
        const portMatch = output.match(/API Server running on http:\/\/127\.0\.0\.1:(\d+)/);
        if (portMatch && portMatch[1] && !portDetected) {
          portDetected = true;
          this.actualAPIPort = parseInt(portMatch[1]);
          console.log(`[SUPERVISOR] API server detected on port ${this.actualAPIPort}`);
          // Write runtime file with updated API port
          this.writeRuntimeFile();
          // Now that we have the port, start waiting for service
          this.waitForService('api', resolve);
        }
      });

      this.apiProcess.stderr.on('data', (data) => {
        console.error(`[API ERROR] ${data.toString().trim()}`);
      });

      this.apiProcess.on('exit', (code, signal) => {
        console.log(`[SUPERVISOR] API server exited (code: ${code}, signal: ${signal})`);

        if (!this.isShuttingDown) {
          this.recordCrashEvent('api', `Exit code: ${code}`);
          this.scheduleRestart('api');
        }
      });

      // Fallback: if port not detected after timeout, try default port
      setTimeout(() => {
        if (!portDetected) {
          console.log('[SUPERVISOR] Port detection timeout, using default port');
          this.actualAPIPort = this.actualAPIPort || API_PORT;
          this.waitForService('api', resolve);
        }
      }, 5000);
    });
  }

  async startUI() {
    console.log('[SUPERVISOR] Starting UI server...');
    this.serviceStates.ui = ServiceState.STARTING;

    // Find an available port for UI
    const uiPort = await this.findAvailableUIPort();
    if (!uiPort) {
      console.error('[SUPERVISOR] No available ports for UI server');
      return Promise.resolve();
    }

    console.log(`[SUPERVISOR] Attempting to start UI on port ${uiPort}`);
    this.actualUIPort = uiPort; // Set expected port

    return new Promise((resolve) => {
      // For production, we'd serve the built UI. For now, start dev server
      this.uiProcess = spawn('npm', ['start'], {
        cwd: UI_DIR,
        env: { ...process.env, BROWSER: 'none', PORT: uiPort }, // Set explicit port
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });

      this.uiProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[UI] ${output.trim()}`);

        // Detect actual UI port from CRA output
        this.detectUIPort(output);

        // Also check for successful compilation
        if (output.includes('Compiled successfully') || output.includes('webpack compiled successfully')) {
          console.log('[SUPERVISOR] UI compilation successful');
          // If we haven't detected port yet, use the one we set
          if (!this.actualUIPort) {
            this.actualUIPort = uiPort;
          }
          this.validateUIReadiness(this.actualUIPort);
        }
      });

      this.uiProcess.stderr.on('data', (data) => {
        const output = data.toString();
        // React dev server outputs to stderr sometimes
        if (output && !output.includes('Compiled successfully')) {
          console.error(`[UI ERROR] ${output.trim()}`);
        }

        // Also check stderr for port info
        this.detectUIPort(output);
      });

      this.uiProcess.on('exit', (code, signal) => {
        console.log(`[SUPERVISOR] UI server exited (code: ${code}, signal: ${signal})`);

        if (!this.isShuttingDown) {
          this.recordCrashEvent('ui', `Exit code: ${code}`);
          this.scheduleRestart('ui');
        }
      });

      // UI takes longer to start
      setTimeout(() => {
        console.log('[SUPERVISOR] UI server started (dev mode)');
        resolve();
      }, 5000);
    });
  }

  waitForService(service, callback, attempts = 0) {
    const maxAttempts = 30; // 30 seconds max wait

    if (service === 'api') {
      this.checkAPIHealth((healthy) => {
        if (healthy) {
          console.log('[SUPERVISOR] API server is healthy');
          this.serviceStates.api = ServiceState.RUNNING;
          this.consecutiveFailures.api = 0; // Reset failures on successful start
          callback();
        } else if (attempts < maxAttempts) {
          setTimeout(() => {
            this.waitForService(service, callback, attempts + 1);
          }, 1000);
        } else {
          console.error('[SUPERVISOR] API server failed to start');
          callback();
        }
      });
    } else {
      callback();
    }
  }

  checkAPIHealth(callback) {
    const options = {
      hostname: API_HOST,
      port: this.actualAPIPort || API_PORT,
      path: '/api/health',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      callback(res.statusCode === 200);
    });

    req.on('error', () => {
      callback(false);
    });

    req.on('timeout', () => {
      req.destroy();
      callback(false);
    });

    req.end();
  }

  startHealthChecks() {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, HEALTH_CHECK_INTERVAL);

    console.log('[SUPERVISOR] Health monitoring started');
  }

  async performHealthCheck() {
    const apiHealthy = await new Promise(resolve => this.checkAPIHealth(resolve));
    const uiHealthy = this.uiProcess && !this.uiProcess.killed;

    // Update service states based on health
    if (apiHealthy && this.serviceStates.api === ServiceState.STARTING) {
      this.serviceStates.api = ServiceState.RUNNING;
    }
    if (uiHealthy && this.serviceStates.ui === ServiceState.STARTING) {
      this.serviceStates.ui = ServiceState.RUNNING;
    }

    // Record heartbeat
    const uptime = Math.floor((new Date() - this.startTime) / 1000);

    this.db.run(`
      INSERT INTO supervisor_heartbeats (api_status, ui_status, uptime_seconds)
      VALUES (?, ?, ?)
    `, [
      apiHealthy ? 'ONLINE' : 'OFFLINE',
      uiHealthy ? 'ONLINE' : 'OFFLINE',
      uptime
    ]);

    // Restart if needed (but not if already restarting or degraded)
    if (!apiHealthy && !this.isShuttingDown &&
        this.serviceStates.api !== ServiceState.RESTARTING &&
        this.serviceStates.api !== ServiceState.DEGRADED) {
      console.log('[SUPERVISOR] API health check failed, scheduling restart...');
      this.scheduleRestart('api');
    }

    if (!uiHealthy && !this.isShuttingDown &&
        this.serviceStates.ui !== ServiceState.RESTARTING &&
        this.serviceStates.ui !== ServiceState.DEGRADED) {
      console.log('[SUPERVISOR] UI process died, scheduling restart...');
      this.scheduleRestart('ui');
    }
  }

  async scheduleRestart(service) {
    const count = this.restartCount[service];
    const delay = RESTART_BACKOFF[Math.min(count, RESTART_BACKOFF.length - 1)];

    console.log(`[SUPERVISOR] Scheduling ${service} restart in ${delay}ms (attempt ${count + 1})`);

    // Check if we should trigger circuit breaker
    if (this.consecutiveFailures[service] >= this.failureThreshold) {
      await this.triggerCircuitBreaker(service);
      return;
    }

    // Transition to RESTARTING state and emit receipt only on state change
    const previousState = this.serviceStates[service];
    if (previousState !== ServiceState.RESTARTING) {
      this.serviceStates[service] = ServiceState.RESTARTING;

      // Check if we should emit a receipt (deduplicated)
      const shouldEmit = await this.shouldEmitRestartReceipt(service, 'Health check failure or crash');
      if (shouldEmit) {
        await this.writeSystemReceipt('RESTARTED', {
          service,
          attempt: count + 1,
          delay,
          reason: 'Health check failure or crash',
          runId: this.runId,
          ownerPid: process.pid,
          previousState,
          newState: ServiceState.RESTARTING
        });
      }
    }

    setTimeout(async () => {
      if (this.isShuttingDown) return;

      // Don't restart if in DEGRADED state
      if (this.serviceStates[service] === ServiceState.DEGRADED) {
        console.log(`[SUPERVISOR] Skipping restart for ${service} - service is DEGRADED`);
        return;
      }

      this.restartCount[service]++;
      this.consecutiveFailures[service]++;

      // Transition to STARTING state
      this.serviceStates[service] = ServiceState.STARTING;

      if (service === 'api') {
        if (this.apiProcess && !this.apiProcess.killed) {
          this.apiProcess.kill();
        }
        await this.startAPI();
      } else if (service === 'ui') {
        if (this.uiProcess && !this.uiProcess.killed) {
          this.uiProcess.kill();
        }
        await this.startUI();
      }

      // Update runtime file after service restart
      await this.updateRuntimeFile();

      // Reset count on successful restart
      setTimeout(() => {
        if (service === 'api') {
          this.checkAPIHealth((healthy) => {
            if (healthy) {
              this.restartCount[service] = 0;
              this.consecutiveFailures[service] = 0; // Reset consecutive failures
              this.serviceStates[service] = ServiceState.RUNNING;
              console.log(`[SUPERVISOR] ${service} restart successful`);
            } else {
              this.consecutiveFailures[service]++;
              console.log(`[SUPERVISOR] ${service} restart failed (consecutive failures: ${this.consecutiveFailures[service]})`);
            }
          });
        } else {
          this.restartCount[service] = 0;
          this.consecutiveFailures[service] = 0;
          this.serviceStates[service] = ServiceState.RUNNING;
        }
      }, 5000);
    }, delay);
  }

  recordCrashEvent(service, details) {
    this.db.run(`
      INSERT INTO supervisor_events (event_type, service, details)
      VALUES ('CRASH', ?, ?)
    `, [service, details]);
  }

  async shouldEmitRestartReceipt(service, reason) {
    const now = Date.now();
    const cacheKey = `RESTART_${service}_${reason}_${this.runId}`;

    // Check receipt cache
    const cached = this.receiptCache.get(cacheKey);
    if (cached) {
      const timeSinceFirst = now - cached.firstSeen;
      if (timeSinceFirst < this.receiptDedupeWindow) {
        // Update suppression count
        cached.count++;
        cached.lastSeen = now;
        console.log(`[SUPERVISOR] Suppressed duplicate restart receipt for ${service} (count: ${cached.count})`);
        return false;
      }
    }

    // Check rate limiting (max 3 per 10 minutes per service)
    const lastReceipt = this.lastRestartReceipt[service];
    if (lastReceipt && (now - lastReceipt) < 200000) { // ~3.3 minutes between receipts
      console.log(`[SUPERVISOR] Rate limited restart receipt for ${service}`);
      return false;
    }

    // Cache this receipt
    this.receiptCache.set(cacheKey, {
      count: 1,
      firstSeen: now,
      lastSeen: now
    });

    // Update last receipt time
    this.lastRestartReceipt[service] = now;

    // Clean old cache entries
    this.cleanReceiptCache();

    return true;
  }

  cleanReceiptCache() {
    const now = Date.now();
    for (const [key, value] of this.receiptCache.entries()) {
      if (now - value.lastSeen > this.receiptDedupeWindow * 2) {
        this.receiptCache.delete(key);
      }
    }
  }

  async triggerCircuitBreaker(service) {
    console.error(`[SUPERVISOR] Circuit breaker triggered for ${service} after ${this.failureThreshold} consecutive failures`);

    // Transition to DEGRADED state
    this.serviceStates[service] = ServiceState.DEGRADED;

    // Write a single authoritative receipt
    await this.writeSystemReceipt('CIRCUIT_BREAKER_TRIGGERED', {
      service,
      consecutiveFailures: this.consecutiveFailures[service],
      restartAttempts: this.restartCount[service],
      runId: this.runId,
      ownerPid: process.pid,
      degradedAt: new Date().toISOString(),
      message: `Service ${service} has been marked as DEGRADED after ${this.failureThreshold} consecutive failures`
    });

    // Stop trying to restart this service
    console.log(`[SUPERVISOR] Service ${service} marked as DEGRADED. Manual intervention required.`);
  }

  async writeSystemReceipt(eventType, details) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `SYSTEM_${eventType}_${timestamp}.md`;
    const filepath = path.join(RECEIPTS_DIR, filename);

    const content = `# SYSTEM Receipt - ${eventType}

**Date:** ${new Date().toISOString()}
**Component:** ANX Command Center Supervisor
**Event:** ${eventType}

## Details

${JSON.stringify(details, null, 2)}

## System State

- API Process: ${this.apiProcess ? 'Running' : 'Stopped'}
- UI Process: ${this.uiProcess ? 'Running' : 'Stopped'}
- Restart Counts: API=${this.restartCount.api}, UI=${this.restartCount.ui}
- Uptime: ${Math.floor((new Date() - this.startTime) / 1000)} seconds

---
Generated by: ANX Supervisor
`;

    try {
      await fs.writeFile(filepath, content);
      console.log(`[SUPERVISOR] Written ${eventType} receipt: ${filename}`);
    } catch (err) {
      console.error(`[SUPERVISOR] Failed to write receipt: ${err.message}`);
    }
  }

  async findAvailableUIPort() {
    const net = require('net');

    for (let port = UI_PORT_START; port < UI_PORT_START + UI_PORT_RANGE; port++) {
      const available = await new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
          server.close(() => resolve(true));
        });
        server.listen(port, API_HOST);
      });

      if (available) {
        console.log(`[SUPERVISOR] Found available UI port: ${port}`);
        return port;
      } else {
        console.log(`[SUPERVISOR] Port ${port} is in use`);
      }
    }

    console.error(`[SUPERVISOR] No available ports in range ${UI_PORT_START}-${UI_PORT_START + UI_PORT_RANGE - 1}`);
    return null;
  }

  async writeRuntimeFile() {
    try {
      // Ensure runtime directory exists
      await fs.mkdir(RUNTIME_DIR, { recursive: true });

      // Use detected UI port or check if API serves UI directly
      let uiUrl;
      if (this.actualUIPort) {
        uiUrl = `http://${API_HOST}:${this.actualUIPort}/`;
      } else {
        // Check if API serves UI directly (has built UI files)
        try {
          const apiUIPath = path.join(API_DIR, 'public', 'index.html');
          await fs.access(apiUIPath);
          uiUrl = `http://${API_HOST}:${API_PORT}/`;
        } catch (e) {
          // No UI detected yet - will update when UI starts
          uiUrl = null;
        }
      }

      // Use actual detected API port if available, otherwise use default
      const apiPort = this.actualAPIPort || API_PORT;

      const runtimeContract = {
        api_url: `http://${API_HOST}:${apiPort}`,
        ui_url: uiUrl,
        health_endpoint: `http://${API_HOST}:${apiPort}/api/health`,
        started_at: this.startTime.toISOString(),
        supervisor_pid: process.pid,
        supervisor_start_method: this.supervisorStartMethod,
        api_port_conflict: this.apiPortInUse,
        ui_build_present: this.uiBuildPresent,
        actual_ui_port: this.actualUIPort,
        actual_api_port: this.actualAPIPort,
        api_status: this.apiProcess ? 'running' : 'stopped',
        ui_status: this.uiProcess ? 'running' : 'stopped',
        last_updated: new Date().toISOString()
      };

      await fs.writeFile(RUNTIME_FILE, JSON.stringify(runtimeContract, null, 2), 'utf8');
      console.log(`[SUPERVISOR] Runtime contract written: ${RUNTIME_FILE}`);
    } catch (error) {
      console.error('[SUPERVISOR] Failed to write runtime file:', error);
    }
  }

  async updateRuntimeFile() {
    // Update existing runtime file when services restart or port changes
    await this.writeRuntimeFile();
  }

  async shutdown(reason) {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log(`[SUPERVISOR] Shutting down (reason: ${reason})...`);

    // Stop health checks
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    // Write STOPPED receipt
    await this.writeSystemReceipt('STOPPED', {
      reason,
      uptime: Math.floor((new Date() - this.startTime) / 1000),
      timestamp: new Date().toISOString()
    });

    // Kill processes
    if (this.apiProcess && !this.apiProcess.killed) {
      console.log('[SUPERVISOR] Stopping API server...');
      this.apiProcess.kill();
    }

    if (this.uiProcess && !this.uiProcess.killed) {
      console.log('[SUPERVISOR] Stopping UI server...');
      this.uiProcess.kill();
    }

    // Close database
    if (this.db) {
      this.db.close();
    }

    // Give processes time to clean up
    setTimeout(() => {
      console.log('[SUPERVISOR] Shutdown complete');
      process.exit(0);
    }, 2000);
  }

  async loadRuntimeState() {
    try {
      const runtimeData = await fs.readFile(RUNTIME_FILE, 'utf8');
      const runtime = JSON.parse(runtimeData);

      // Restore actual ports from previous run if API/UI still running
      if (runtime.actual_api_port) {
        console.log(`[SUPERVISOR] Loaded previous API port: ${runtime.actual_api_port}`);
        this.actualAPIPort = runtime.actual_api_port;
      }
      if (runtime.actual_ui_port) {
        console.log(`[SUPERVISOR] Loaded previous UI port: ${runtime.actual_ui_port}`);
        this.actualUIPort = runtime.actual_ui_port;
      }
    } catch (error) {
      // No runtime file or invalid - will be created fresh
      console.log('[SUPERVISOR] No valid runtime state found, starting fresh');
    }
  }

  async detectStartupMethod() {
    try {
      // Check if running as scheduled task by looking for specific env vars or process parent
      const parentProcess = process.env.SCHEDULED_TASK_NAME || process.env.TASK_NAME;
      if (parentProcess && parentProcess.includes('ANXCommandCenterSupervisor')) {
        this.supervisorStartMethod = 'scheduled_task';
        console.log('[SUPERVISOR] Started via scheduled task');
      } else {
        this.supervisorStartMethod = 'direct';
        console.log('[SUPERVISOR] Started directly');
      }
    } catch (error) {
      this.supervisorStartMethod = 'unknown';
      console.error('[SUPERVISOR] Could not detect startup method:', error);
    }
  }

  async checkAPIPortAvailable() {
    return new Promise((resolve) => {
      const server = require('net').createServer();

      server.listen(API_PORT, API_HOST, () => {
        server.close(() => {
          this.apiPortInUse = false;
          console.log(`[SUPERVISOR] API port ${API_PORT} is available`);
          resolve(false);
        });
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          this.apiPortInUse = true;
          console.error(`[SUPERVISOR] API port ${API_PORT} is already in use`);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  async checkUIBuildPresent() {
    try {
      // Check for React build directory
      const buildPath = path.join(UI_DIR, 'build', 'index.html');
      await fs.access(buildPath);
      this.uiBuildPresent = true;
      console.log('[SUPERVISOR] UI build found');
    } catch (error) {
      this.uiBuildPresent = false;
      console.log('[SUPERVISOR] No UI build found, will use dev server');
    }
  }

  detectUIPort(output) {
    // Parse CRA dev server output for actual port
    // CRA outputs across multiple lines, so we need to buffer
    this.uiOutputBuffer += output;

    // Keep only last 2000 chars to avoid memory issues
    if (this.uiOutputBuffer.length > 2000) {
      this.uiOutputBuffer = this.uiOutputBuffer.slice(-2000);
    }

    // CRA output pattern: "Local:            http://localhost:3002"
    const patterns = [
      /Local:\s+http:\/\/localhost:(\d+)/,
      /Local:\s+http:\/\/127\.0\.0\.1:(\d+)/,
      /Local:\s*http:\/\/localhost:(\d+)/,  // Handle variable spacing
      /Server running at http:\/\/localhost:(\d+)/,
      /webpack compiled.*successfully/i
    ];

    for (const pattern of patterns) {
      const match = this.uiOutputBuffer.match(pattern);
      if (match && match[1]) {
        const detectedPort = parseInt(match[1]);
        if (detectedPort !== this.actualUIPort || !this.actualUIPort) {
          this.actualUIPort = detectedPort;
          console.log(`[SUPERVISOR] UI server detected on port ${detectedPort}`);

          // Clear buffer after successful detection
          this.uiOutputBuffer = '';

          // Validate UI readiness before updating contract
          this.validateUIReadiness(detectedPort);
        }
        break;
      }
    }
  }

  async validateUIReadiness(port) {
    const uiUrl = `http://${API_HOST}:${port}`;
    const maxAttempts = 10;
    let attempts = 0;

    console.log(`[SUPERVISOR] Validating UI readiness at ${uiUrl}`);

    const checkReadiness = async () => {
      try {
        if (fetch) {
          // Use fetch if available
          const response = await fetch(uiUrl, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
          });

          if (response.ok) {
            console.log(`[SUPERVISOR] UI ready at ${uiUrl} (${response.status})`);
            await this.writeRuntimeFile();
            return;
          }
        } else {
          // Fallback to http module
          const response = await new Promise((resolve, reject) => {
            const req = http.get(uiUrl, { timeout: 3000 }, (res) => {
              resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode });
            });
            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Timeout')));
          });

          if (response.ok) {
            console.log(`[SUPERVISOR] UI ready at ${uiUrl} (${response.status})`);
            await this.writeRuntimeFile();
            return;
          }
        }
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`[SUPERVISOR] UI not ready yet, attempt ${attempts}/${maxAttempts}: ${error.message}`);
          setTimeout(checkReadiness, 2000);
        } else {
          console.error(`[SUPERVISOR] UI failed to become ready after ${maxAttempts} attempts`);
          // Still update contract but mark UI as not ready
          await this.writeRuntimeFile();
        }
      }
    };

    // Start readiness check
    setTimeout(checkReadiness, 1000); // Give UI a moment to initialize
  }
}

// Start supervisor
const supervisor = new ANXSupervisor();
supervisor.init().catch(err => {
  console.error('[SUPERVISOR] Fatal error during initialization:', err);
  process.exit(1);
});