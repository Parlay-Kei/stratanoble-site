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

const ANX_ROOT = 'C:\\Dev\\.claude-anx';
const STATE_DB = path.join(ANX_ROOT, 'state', 'anx_state.db');
const RECEIPTS_DIR = path.join(ANX_ROOT, 'receipts');
const API_DIR = path.join(ANX_ROOT, 'tools', 'command-center', 'api');
const UI_DIR = path.join(ANX_ROOT, 'tools', 'command-center', 'ui');

const API_HOST = '127.0.0.1';
const API_PORT = 5000;
const UI_PORT = 3000;
const HEALTH_CHECK_INTERVAL = 5000; // 5 seconds
const RESTART_BACKOFF = [1000, 2000, 5000, 10000, 30000]; // Progressive backoff

class ANXSupervisor {
  constructor() {
    this.apiProcess = null;
    this.uiProcess = null;
    this.restartCount = { api: 0, ui: 0 };
    this.isShuttingDown = false;
    this.db = null;
    this.healthCheckTimer = null;
    this.startTime = new Date();
  }

  async init() {
    console.log('[SUPERVISOR] ANX Command Center Supervisor starting...');

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

    console.log('[SUPERVISOR] All services started successfully');
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

    return new Promise((resolve) => {
      this.apiProcess = spawn('node', ['src/server.js'], {
        cwd: API_DIR,
        env: { ...process.env, PORT: API_PORT, HOST: API_HOST },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.apiProcess.stdout.on('data', (data) => {
        console.log(`[API] ${data.toString().trim()}`);
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

      // Wait for API to be ready
      setTimeout(() => {
        this.waitForService('api', resolve);
      }, 2000);
    });
  }

  async startUI() {
    console.log('[SUPERVISOR] Starting UI server...');

    return new Promise((resolve) => {
      // For production, we'd serve the built UI. For now, start dev server
      this.uiProcess = spawn('npm', ['start'], {
        cwd: UI_DIR,
        env: { ...process.env, PORT: UI_PORT, BROWSER: 'none' },
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });

      this.uiProcess.stdout.on('data', (data) => {
        console.log(`[UI] ${data.toString().trim()}`);
      });

      this.uiProcess.stderr.on('data', (data) => {
        // React dev server outputs to stderr sometimes
        const msg = data.toString().trim();
        if (msg && !msg.includes('Compiled successfully')) {
          console.error(`[UI ERROR] ${msg}`);
        }
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
      port: API_PORT,
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

    // Restart if needed
    if (!apiHealthy && !this.isShuttingDown) {
      console.log('[SUPERVISOR] API health check failed, scheduling restart...');
      this.scheduleRestart('api');
    }

    if (!uiHealthy && !this.isShuttingDown) {
      console.log('[SUPERVISOR] UI process died, scheduling restart...');
      this.scheduleRestart('ui');
    }
  }

  async scheduleRestart(service) {
    const count = this.restartCount[service];
    const delay = RESTART_BACKOFF[Math.min(count, RESTART_BACKOFF.length - 1)];

    console.log(`[SUPERVISOR] Scheduling ${service} restart in ${delay}ms (attempt ${count + 1})`);

    await this.writeSystemReceipt('RESTARTED', {
      service,
      attempt: count + 1,
      delay,
      reason: 'Health check failure or crash'
    });

    setTimeout(async () => {
      if (this.isShuttingDown) return;

      this.restartCount[service]++;

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

      // Reset count on successful restart
      setTimeout(() => {
        if (service === 'api') {
          this.checkAPIHealth((healthy) => {
            if (healthy) {
              this.restartCount[service] = 0;
              console.log(`[SUPERVISOR] ${service} restart successful`);
            }
          });
        } else {
          this.restartCount[service] = 0;
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
}

// Start supervisor
const supervisor = new ANXSupervisor();
supervisor.init().catch(err => {
  console.error('[SUPERVISOR] Fatal error during initialization:', err);
  process.exit(1);
});