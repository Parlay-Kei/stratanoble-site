#!/usr/bin/env node
/**
 * File Monitor v2.0 - Main Entry Point
 * Real-time directory watching with intelligent agent triggering
 *
 * Architecture:
 *   Layer 1: Monitor (this file) - Detects changes, classifies, routes to orchestrator
 *   Layer 2: Orchestrator - Decides actions, enforces gates, validates outcomes
 *   Layer 3: Agents - Security, Docs, Admin, Codebase specialists
 *
 * Usage:
 *   node monitor.js                        # Start with default profile
 *   node monitor.js --profile=direct-cuts  # Start with specific profile
 *   node monitor.js --status               # Show current status
 *   node monitor.js --jobs                 # Show job queue
 *   node monitor.js --gates                # Show pending gate approvals
 *   node monitor.js --approve=<jobId>      # Approve a gate
 *   node monitor.js --reject=<jobId> --reason="..."  # Reject a gate
 *   node monitor.js --scan                 # Run immediate scan
 *   node monitor.js --artifacts            # Show recent artifacts
 */

import chokidar from 'chokidar';
import { spawn } from 'child_process';
import { existsSync, statSync, readFileSync, mkdirSync } from 'fs';
import { join, relative, resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

import { getDatabase } from './lib/database.js';
import { getEventBus } from './lib/event-bus.js';
import RuleMatcher from './lib/rule-matcher.js';
import Orchestrator from './lib/orchestrator.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
};
const hasArg = (name) => args.includes(`--${name}`);

// Load configuration and profile
const profileName = getArg('profile') || 'direct-cuts';
const configPath = join(__dirname, 'config.json');
const baselineProfilePath = join(__dirname, 'profiles', 'baseline.json');
const profilePath = join(__dirname, 'profiles', `${profileName}.json`);

let config, profile;

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

try {
  config = JSON.parse(readFileSync(configPath, 'utf-8'));

  // Load baseline first
  const baseline = existsSync(baselineProfilePath)
    ? JSON.parse(readFileSync(baselineProfilePath, 'utf-8'))
    : {};

  // Load specific profile and merge with baseline
  const specificProfile = existsSync(profilePath)
    ? JSON.parse(readFileSync(profilePath, 'utf-8'))
    : {};

  // Deep merge: baseline + specific profile
  profile = deepMerge(baseline, specificProfile);

  // Override config with profile values
  if (profile.projectRoot) config.projectRoot = profile.projectRoot;
  if (profile.watchDirs) config.watchDirs = profile.watchDirs;
  if (profile.rules) config.rules = profile.rules;
  if (profile.agents) config.agents = { ...config.agents, ...profile.agents };
  if (profile.ignoredPatterns) config.ignoredPatterns = profile.ignoredPatterns;

} catch (error) {
  console.error(chalk.red('Failed to load configuration:'), error.message);
  process.exit(1);
}

// Initialize components
const db = getDatabase();
const bus = getEventBus();
const ruleMatcher = new RuleMatcher(config.rules);
const orchestrator = new Orchestrator(config, profile);

// Track watchers
const watchers = [];
let isShuttingDown = false;
let scanInterval = null;

/**
 * Log with timestamp and color
 */
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const colors = {
    info: chalk.blue,
    success: chalk.green,
    warn: chalk.yellow,
    error: chalk.red,
    event: chalk.cyan,
    agent: chalk.magenta,
    gate: chalk.yellowBright
  };

  const color = colors[level] || chalk.white;
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  console.log(color(prefix), message);
  if (data) {
    console.log(chalk.gray(JSON.stringify(data, null, 2)));
  }
}

/**
 * Create agent handler that spawns agent subprocess (legacy mode)
 */
function createAgentHandler(agentName, agentConfig) {
  return async (event) => {
    log('agent', `Triggering ${agentName} agent`, {
      path: event.path,
      eventType: event.eventType
    });

    return new Promise((resolve, reject) => {
      const args = [...agentConfig.args, JSON.stringify(event)];
      const agentPath = join(__dirname, agentConfig.args[0]);

      if (!existsSync(agentPath)) {
        log('warn', `Agent script not found: ${agentPath}`);
        resolve({ status: 'skipped', reason: 'Agent script not found' });
        return;
      }

      const child = spawn(agentConfig.command, args, {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: agentConfig.timeout || 30000
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });

      child.on('close', (code) => {
        if (code === 0) {
          log('success', `${agentName} agent completed successfully`);
          resolve({ status: 'success', output: stdout, exitCode: code });
        } else {
          log('error', `${agentName} agent failed with code ${code}`);
          reject(new Error(stderr || `Exit code: ${code}`));
        }
      });

      child.on('error', (err) => {
        log('error', `Failed to spawn ${agentName} agent`, err.message);
        reject(err);
      });

      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGTERM');
          reject(new Error(`Agent timeout after ${agentConfig.timeout}ms`));
        }
      }, agentConfig.timeout || 30000);
    });
  };
}

/**
 * Register all agent handlers (for legacy event bus mode)
 */
function registerAgentHandlers() {
  for (const [agentName, agentConfig] of Object.entries(config.agents)) {
    bus.registerHandler(agentName, createAgentHandler(agentName, agentConfig));
  }
}

/**
 * Check if path falls into a risk zone
 */
function checkRiskZones(path) {
  const riskZones = profile.riskZones || [];

  for (const zone of riskZones) {
    const patterns = zone.patterns || [zone.pattern];
    for (const pattern of patterns) {
      if (matchPattern(path, pattern)) {
        log('gate', `Risk zone: ${zone.id}`, { path, gate: zone.gate, reason: zone.reason });
        return zone.gate;
      }
    }
  }

  return null;
}

/**
 * Simple pattern matching
 */
function matchPattern(path, pattern) {
  const regex = pattern
    .replace(/\*\*/g, '{{DOUBLESTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/{{DOUBLESTAR}}/g, '.*')
    .replace(/\?/g, '.')
    .replace(/\{([^}]+)\}/g, (_, group) => `(${group.split(',').join('|')})`)
    .replace(/\./g, '\\.');

  try {
    return new RegExp(`^${regex}$`).test(path);
  } catch {
    return false;
  }
}

/**
 * Handle file system event
 */
function handleFileEvent(eventType, filePath) {
  if (isShuttingDown) return;

  // Convert to relative path for matching
  const fullPath = resolve(filePath);
  const relativePath = relative(config.projectRoot, fullPath).replace(/\\/g, '/');

  // Find matching rules
  const matchingRules = ruleMatcher.findMatchingRules(relativePath, eventType);

  if (matchingRules.length === 0) {
    return; // No rules match this file/event
  }

  // Process each matching rule
  for (const rule of matchingRules) {
    // Check debounce
    if (!db.shouldProcess(relativePath, rule.id, rule.debounceMs || 2000)) {
      db.updateDebounce(relativePath, rule.id, { eventType, relativePath });
      continue;
    }

    // Check additional conditions
    const conditionResult = ruleMatcher.checkConditions(rule, relativePath, fullPath);
    if (!conditionResult.passes) {
      continue;
    }

    // Get file stats if available
    let fileStats = {};
    try {
      if (eventType !== 'unlink' && eventType !== 'unlinkDir') {
        const stats = statSync(fullPath);
        fileStats = {
          fileSize: stats.size,
          fileMtime: stats.mtime.toISOString()
        };
        db.updateFileState(relativePath, stats);
      }
    } catch (e) {
      // File might be gone
    }

    // Update debounce timestamp
    db.updateDebounce(relativePath, rule.id);

    // Check risk zones for gate requirement
    let gateRequired = rule.gate || null;
    if (!gateRequired) {
      gateRequired = checkRiskZones(relativePath);
    }

    // Log the event
    log('event', `${eventType}: ${relativePath}`, {
      rule: rule.name,
      trigger: rule.trigger,
      priority: rule.priority,
      gate: gateRequired || 'none'
    });

    // Queue to orchestrator (Layer 2)
    orchestrator.queueEvent({
      path: relativePath,
      fullPath,
      eventType,
      ruleId: rule.id,
      ruleName: rule.name,
      trigger: rule.trigger,
      priority: rule.priority,
      gateRequired,
      outcomeRequired: rule.outcomeRequired,
      ...fileStats
    });
  }
}

/**
 * Initialize file watchers
 */
function initializeWatchers() {
  const watchPaths = config.watchDirs.map(dir =>
    join(config.projectRoot, dir)
  );

  log('info', 'Initializing watchers for:', watchPaths);

  const watcher = chokidar.watch(watchPaths, {
    ignored: profile.ignoredPatterns || config.ignoredPatterns,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100
    },
    usePolling: false,
    interval: 100,
    binaryInterval: 300
  });

  watcher.on('add', path => handleFileEvent('add', path));
  watcher.on('change', path => handleFileEvent('change', path));
  watcher.on('unlink', path => handleFileEvent('unlink', path));
  watcher.on('addDir', path => handleFileEvent('addDir', path));
  watcher.on('unlinkDir', path => handleFileEvent('unlinkDir', path));

  watcher.on('ready', () => {
    log('success', 'File monitor ready and watching');
    db.recordMetric('monitor_started', 1);
  });

  watcher.on('error', error => {
    log('error', 'Watcher error', error.message);
    db.recordMetric('watcher_error', 1, { error: error.message });
  });

  watchers.push(watcher);
  return watcher;
}

/**
 * Run scheduled scan for stale files
 */
async function runStaleScan() {
  log('info', 'Running scheduled staleness scan...');

  const scanRules = ruleMatcher.getScanRules();

  for (const rule of scanRules) {
    if (rule.conditions?.staleDays) {
      const staleFiles = db.getStaleFiles(rule.conditions.staleDays);

      for (const file of staleFiles) {
        log('event', `Stale file detected: ${file.path}`, {
          daysStale: Math.floor(file.days_stale)
        });

        orchestrator.queueEvent({
          eventType: 'scan',
          path: file.path,
          fullPath: join(config.projectRoot, file.path),
          ruleId: rule.id,
          ruleName: rule.name,
          trigger: rule.trigger,
          priority: rule.priority,
          daysStale: Math.floor(file.days_stale)
        });
      }
    }
  }

  db.recordMetric('scan_completed', 1);
}

/**
 * Show current status
 */
function showStatus() {
  const busStatus = bus.getStatus();
  const eventStats = db.getEventStats(24);
  const agentStats = db.getAgentStats();
  const jobStats = db.getJobStats();

  console.log(chalk.bold('\n=== File Monitor v2.0 Status ===\n'));

  console.log(chalk.cyan('Profile:'), profileName);
  console.log(chalk.cyan('Project:'), config.projectRoot);
  console.log(chalk.cyan('Rules:'), config.rules.length);
  console.log(chalk.cyan('Risk Zones:'), (profile.riskZones || []).length);

  console.log(chalk.cyan('\nJob Queue:'));
  if (jobStats.length === 0) {
    console.log(chalk.gray('  No jobs yet'));
  } else {
    for (const stat of jobStats) {
      const color = stat.status === 'done' ? chalk.green :
                    stat.status === 'failed' ? chalk.red :
                    stat.status === 'blocked' ? chalk.yellow : chalk.white;
      console.log(`  ${color(stat.status)}: ${stat.count} (avg ${Math.round(stat.avg_duration_ms || 0)}ms)`);
    }
  }

  const pendingGates = db.getJobsAwaitingGate();
  if (pendingGates.length > 0) {
    console.log(chalk.yellowBright(`\nPending Gate Approvals: ${pendingGates.length}`));
    console.log(chalk.gray('  Run: node monitor.js --gates'));
  }

  console.log(chalk.cyan('\nEvent Stats (Last 24h):'));
  if (eventStats.length === 0) {
    console.log(chalk.gray('  No events yet'));
  } else {
    for (const stat of eventStats) {
      console.log(`  ${stat.trigger_agent}/${stat.event_type}: ${stat.count} (${stat.priority})`);
    }
  }

  console.log(chalk.cyan('\nAgent Performance:'));
  if (agentStats.length === 0) {
    console.log(chalk.gray('  No agent runs yet'));
  } else {
    for (const agent of agentStats) {
      const successRate = ((agent.successful_runs / agent.total_runs) * 100).toFixed(1);
      console.log(`  ${agent.agent_name}: ${agent.total_runs} runs, ${successRate}% success, avg ${Math.round(agent.avg_duration_ms || 0)}ms`);
    }
  }

  console.log('');
}

/**
 * Show job queue
 */
function showJobs() {
  console.log(chalk.bold('\n=== Job Queue ===\n'));

  const statuses = ['running', 'queued', 'blocked', 'done', 'failed'];
  let hasJobs = false;

  for (const status of statuses) {
    const jobs = db.getJobsByStatus(status);
    if (jobs.length > 0) {
      hasJobs = true;
      const color = status === 'done' ? chalk.green :
                    status === 'failed' ? chalk.red :
                    status === 'blocked' ? chalk.yellow :
                    status === 'running' ? chalk.cyan : chalk.white;

      console.log(color(`${status.toUpperCase()} (${jobs.length}):`));
      for (const job of jobs.slice(0, 10)) {
        const gate = job.gate_required ? chalk.yellow(`[Gate ${job.gate_required}]`) : '';
        console.log(`  ${job.job_id.slice(0, 30)} | ${job.assigned_agent} ${gate}`);
        console.log(chalk.gray(`    ${job.trigger_reason?.slice(0, 60) || 'No reason'}`));
      }
      console.log('');
    }
  }

  if (!hasJobs) {
    console.log(chalk.gray('No jobs in queue'));
  }
}

/**
 * Show pending gate approvals
 */
function showGates() {
  const pending = db.getJobsAwaitingGate();

  console.log(chalk.bold('\n=== Pending Gate Approvals ===\n'));

  if (pending.length === 0) {
    console.log(chalk.gray('No jobs awaiting approval'));
    return;
  }

  for (const job of pending) {
    const gateColor = job.gate_required === 'A' ? chalk.red :
                      job.gate_required === 'B' ? chalk.yellow :
                      job.gate_required === 'C' ? chalk.blue : chalk.white;

    console.log(gateColor(`[Gate ${job.gate_required}]`), job.job_id);
    console.log(`  Agent: ${job.assigned_agent}`);
    console.log(`  Reason: ${job.trigger_reason}`);
    console.log(`  Priority: ${job.priority}`);
    console.log(`  Created: ${job.created_at}`);
    console.log('');
    console.log(chalk.gray(`  To approve: node monitor.js --approve=${job.job_id}`));
    console.log(chalk.gray(`  To reject:  node monitor.js --reject=${job.job_id} --reason="..."`));
    console.log('');
  }
}

/**
 * Show recent artifacts
 */
function showArtifacts() {
  const artifacts = db.getRecentArtifacts(20);

  console.log(chalk.bold('\n=== Recent Artifacts ===\n'));

  if (artifacts.length === 0) {
    console.log(chalk.gray('No artifacts generated yet'));
    return;
  }

  for (const artifact of artifacts) {
    const statusColor = artifact.job_status === 'done' ? chalk.green : chalk.yellow;
    console.log(`${statusColor('[' + artifact.artifact_type + ']')} ${artifact.artifact_path}`);
    console.log(chalk.gray(`  Agent: ${artifact.assigned_agent} | Created: ${artifact.created_at}`));
  }

  console.log('');
}

/**
 * Approve a gate
 */
function approveGate(jobId) {
  const job = db.getJob(jobId);
  if (!job) {
    console.log(chalk.red(`Job not found: ${jobId}`));
    return;
  }

  db.approveGate(jobId, 'cli-user');
  console.log(chalk.green(`Gate approved for job: ${jobId}`));
}

/**
 * Reject a gate
 */
function rejectGate(jobId, reason) {
  const job = db.getJob(jobId);
  if (!job) {
    console.log(chalk.red(`Job not found: ${jobId}`));
    return;
  }

  db.rejectGate(jobId, 'cli-user', reason);
  console.log(chalk.red(`Gate rejected for job: ${jobId}`));
}

/**
 * Graceful shutdown
 */
function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  log('info', 'Shutting down file monitor...');

  // Stop orchestrator
  orchestrator.stop();

  // Stop scan interval
  if (scanInterval) {
    clearInterval(scanInterval);
  }

  // Close watchers
  Promise.all(watchers.map(w => w.close()))
    .then(() => {
      db.recordMetric('monitor_stopped', 1);
      db.close();
      log('success', 'File monitor stopped gracefully');
      process.exit(0);
    })
    .catch(err => {
      log('error', 'Error during shutdown', err.message);
      process.exit(1);
    });
}

/**
 * Main entry point
 */
async function main() {
  // Handle CLI commands
  if (hasArg('status')) {
    showStatus();
    db.close();
    return;
  }

  if (hasArg('jobs')) {
    showJobs();
    db.close();
    return;
  }

  if (hasArg('gates')) {
    showGates();
    db.close();
    return;
  }

  if (hasArg('artifacts')) {
    showArtifacts();
    db.close();
    return;
  }

  const approveJobId = getArg('approve');
  if (approveJobId) {
    approveGate(approveJobId);
    db.close();
    return;
  }

  const rejectJobId = getArg('reject');
  if (rejectJobId) {
    const reason = getArg('reason') || 'Rejected via CLI';
    rejectGate(rejectJobId, reason);
    db.close();
    return;
  }

  if (hasArg('scan')) {
    await runStaleScan();
    db.close();
    return;
  }

  if (hasArg('cleanup')) {
    const deleted = db.cleanup(30);
    log('info', `Cleaned up ${deleted} old events`);
    db.close();
    return;
  }

  // Ensure artifact directories exist
  const artifactDir = join(config.projectRoot, profile.settings?.outcomes?.artifactDir || '.anx/artifacts');
  const logsDir = join(config.projectRoot, profile.settings?.outcomes?.logsDir || '.anx/logs');
  mkdirSync(artifactDir, { recursive: true });
  mkdirSync(join(logsDir, 'agent_runs'), { recursive: true });

  // Normal startup
  console.log(chalk.bold.green(`
╔═══════════════════════════════════════════════════════════╗
║                    FILE MONITOR v2.0                      ║
║         Real-time Directory Watching + Orchestrator       ║
╚═══════════════════════════════════════════════════════════╝
  `));

  log('info', `Profile: ${profileName}`);
  log('info', `Project root: ${config.projectRoot}`);
  log('info', `Watch directories: ${config.watchDirs.join(', ')}`);
  log('info', `Active rules: ${config.rules.length}`);
  log('info', `Risk zones: ${(profile.riskZones || []).length}`);

  // Register legacy handlers for event bus (fallback)
  registerAgentHandlers();

  // Start orchestrator (Layer 2)
  orchestrator.start();

  // Initialize watchers (Layer 1)
  initializeWatchers();

  // Set up scheduled scans
  const scanning = profile.scanning || config.scanning;
  if (scanning?.enabled) {
    const intervalMs = (scanning.intervalMinutes || 60) * 60 * 1000;
    scanInterval = setInterval(runStaleScan, intervalMs);

    if (scanning.onStartup) {
      setTimeout(runStaleScan, 5000);
    }
  }

  // Handle shutdown signals
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('SIGHUP', shutdown);

  log('success', 'File monitor active and watching...');
  log('info', 'Commands: --status, --jobs, --gates, --artifacts, --approve=<id>, --scan');
}

// Run
main().catch(err => {
  log('error', 'Fatal error', err.message);
  process.exit(1);
});
