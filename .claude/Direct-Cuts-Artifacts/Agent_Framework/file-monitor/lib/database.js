/**
 * SQLite Database Layer for File Monitor
 * Handles event persistence, debouncing, and history tracking
 */

import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'state.db');

class MonitorDatabase {
  constructor() {
    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.initSchema();
  }

  initSchema() {
    this.db.exec(`
      -- Events log table
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        event_type TEXT NOT NULL,
        rule_id TEXT,
        trigger_agent TEXT,
        priority TEXT DEFAULT 'normal',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        file_size INTEGER,
        file_mtime DATETIME,
        processed BOOLEAN DEFAULT FALSE,
        process_result TEXT,
        error TEXT
      );

      -- Debounce tracking
      CREATE TABLE IF NOT EXISTS debounce (
        path TEXT PRIMARY KEY,
        rule_id TEXT NOT NULL,
        last_event DATETIME NOT NULL,
        pending_event TEXT
      );

      -- Agent execution history
      CREATE TABLE IF NOT EXISTS agent_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_name TEXT NOT NULL,
        event_id INTEGER,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        success BOOLEAN,
        output TEXT,
        error TEXT,
        duration_ms INTEGER,
        FOREIGN KEY (event_id) REFERENCES events(id)
      );

      -- File state tracking for staleness detection
      CREATE TABLE IF NOT EXISTS file_state (
        path TEXT PRIMARY KEY,
        first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_modified DATETIME,
        last_scanned DATETIME,
        size_bytes INTEGER,
        hash TEXT,
        metadata TEXT
      );

      -- Statistics and metrics
      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
      );

      -- Agent jobs queue (Orchestrator Layer 2)
      CREATE TABLE IF NOT EXISTS agent_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id TEXT UNIQUE NOT NULL,
        repo TEXT NOT NULL,
        profile TEXT DEFAULT 'baseline',
        priority TEXT DEFAULT 'normal',
        trigger_reason TEXT,
        event_bundle TEXT,
        assigned_agent TEXT,
        gate_required TEXT,
        gate_status TEXT DEFAULT 'pending',
        gate_approved_by TEXT,
        gate_approved_at DATETIME,
        outcome_required TEXT,
        outcome_type TEXT,
        outcome_artifact TEXT,
        status TEXT DEFAULT 'queued',
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 2,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME,
        completed_at DATETIME,
        error TEXT
      );

      -- Event coalescing batch tracking
      CREATE TABLE IF NOT EXISTS event_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id TEXT UNIQUE NOT NULL,
        directory TEXT,
        extension TEXT,
        event_count INTEGER DEFAULT 0,
        first_event_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_event_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        coalesced BOOLEAN DEFAULT FALSE,
        job_id TEXT,
        paths TEXT,
        FOREIGN KEY (job_id) REFERENCES agent_jobs(job_id)
      );

      -- Outcome artifacts tracking
      CREATE TABLE IF NOT EXISTS artifacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id TEXT NOT NULL,
        artifact_type TEXT NOT NULL,
        artifact_path TEXT NOT NULL,
        file_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (job_id) REFERENCES agent_jobs(job_id)
      );

      -- Gate approvals history
      CREATE TABLE IF NOT EXISTS gate_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id TEXT NOT NULL,
        gate_level TEXT NOT NULL,
        action TEXT NOT NULL,
        reason TEXT,
        actor TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES agent_jobs(job_id)
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_events_path ON events(path);
      CREATE INDEX IF NOT EXISTS idx_events_trigger ON events(trigger_agent);
      CREATE INDEX IF NOT EXISTS idx_agent_runs_agent ON agent_runs(agent_name);
      CREATE INDEX IF NOT EXISTS idx_file_state_modified ON file_state(last_modified);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON agent_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_priority ON agent_jobs(priority);
      CREATE INDEX IF NOT EXISTS idx_jobs_gate ON agent_jobs(gate_required, gate_status);
      CREATE INDEX IF NOT EXISTS idx_batches_coalesced ON event_batches(coalesced);
      CREATE INDEX IF NOT EXISTS idx_artifacts_job ON artifacts(job_id);
    `);
  }

  // Event logging
  logEvent(event) {
    const stmt = this.db.prepare(`
      INSERT INTO events (path, event_type, rule_id, trigger_agent, priority, file_size, file_mtime)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      event.path,
      event.eventType,
      event.ruleId,
      event.trigger,
      event.priority || 'normal',
      event.fileSize || null,
      event.fileMtime || null
    );

    return result.lastInsertRowid;
  }

  markEventProcessed(eventId, result, error = null) {
    const stmt = this.db.prepare(`
      UPDATE events
      SET processed = TRUE, process_result = ?, error = ?
      WHERE id = ?
    `);
    stmt.run(result, error, eventId);
  }

  // Debounce management
  shouldProcess(path, ruleId, debounceMs) {
    const stmt = this.db.prepare(`
      SELECT last_event FROM debounce WHERE path = ? AND rule_id = ?
    `);
    const row = stmt.get(path, ruleId);

    if (!row) {
      return true;
    }

    const lastEvent = new Date(row.last_event).getTime();
    const now = Date.now();
    return (now - lastEvent) >= debounceMs;
  }

  updateDebounce(path, ruleId, pendingEvent = null) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO debounce (path, rule_id, last_event, pending_event)
      VALUES (?, ?, datetime('now'), ?)
    `);
    stmt.run(path, ruleId, pendingEvent ? JSON.stringify(pendingEvent) : null);
  }

  getPendingDebounced() {
    const stmt = this.db.prepare(`
      SELECT path, rule_id, pending_event
      FROM debounce
      WHERE pending_event IS NOT NULL
    `);
    return stmt.all();
  }

  clearDebounce(path, ruleId) {
    const stmt = this.db.prepare(`
      DELETE FROM debounce WHERE path = ? AND rule_id = ?
    `);
    stmt.run(path, ruleId);
  }

  // Agent execution tracking
  startAgentRun(agentName, eventId) {
    const stmt = this.db.prepare(`
      INSERT INTO agent_runs (agent_name, event_id)
      VALUES (?, ?)
    `);
    return stmt.run(agentName, eventId).lastInsertRowid;
  }

  completeAgentRun(runId, success, output, error = null) {
    const stmt = this.db.prepare(`
      UPDATE agent_runs
      SET completed_at = datetime('now'),
          success = ?,
          output = ?,
          error = ?,
          duration_ms = (julianday(datetime('now')) - julianday(started_at)) * 86400000
      WHERE id = ?
    `);
    stmt.run(success ? 1 : 0, output, error, runId);
  }

  // File state management
  updateFileState(path, stats) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO file_state (path, last_modified, last_scanned, size_bytes, metadata)
      VALUES (?, ?, datetime('now'), ?, ?)
    `);
    stmt.run(
      path,
      stats.mtime ? stats.mtime.toISOString() : null,
      stats.size || null,
      stats.metadata ? JSON.stringify(stats.metadata) : null
    );
  }

  getStaleFiles(staleDays) {
    const stmt = this.db.prepare(`
      SELECT path, last_modified,
             julianday('now') - julianday(last_modified) as days_stale
      FROM file_state
      WHERE julianday('now') - julianday(last_modified) > ?
      ORDER BY days_stale DESC
    `);
    return stmt.all(staleDays);
  }

  getFileState(path) {
    const stmt = this.db.prepare(`
      SELECT * FROM file_state WHERE path = ?
    `);
    return stmt.get(path);
  }

  // Metrics and statistics
  recordMetric(name, value, metadata = null) {
    const stmt = this.db.prepare(`
      INSERT INTO metrics (metric_name, metric_value, metadata)
      VALUES (?, ?, ?)
    `);
    stmt.run(name, value, metadata ? JSON.stringify(metadata) : null);
  }

  getRecentEvents(limit = 50) {
    const stmt = this.db.prepare(`
      SELECT * FROM events ORDER BY timestamp DESC LIMIT ?
    `);
    return stmt.all(limit);
  }

  getEventsByPath(path) {
    const stmt = this.db.prepare(`
      SELECT * FROM events WHERE path LIKE ? ORDER BY timestamp DESC
    `);
    return stmt.all(`%${path}%`);
  }

  getAgentStats(agentName = null) {
    let stmt;
    if (agentName) {
      stmt = this.db.prepare(`
        SELECT agent_name,
               COUNT(*) as total_runs,
               SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_runs,
               AVG(duration_ms) as avg_duration_ms,
               MAX(completed_at) as last_run
        FROM agent_runs
        WHERE agent_name = ?
        GROUP BY agent_name
      `);
      return stmt.get(agentName);
    } else {
      stmt = this.db.prepare(`
        SELECT agent_name,
               COUNT(*) as total_runs,
               SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_runs,
               AVG(duration_ms) as avg_duration_ms,
               MAX(completed_at) as last_run
        FROM agent_runs
        GROUP BY agent_name
      `);
      return stmt.all();
    }
  }

  getEventStats(hours = 24) {
    const stmt = this.db.prepare(`
      SELECT trigger_agent,
             event_type,
             COUNT(*) as count,
             priority
      FROM events
      WHERE timestamp > datetime('now', '-' || ? || ' hours')
      GROUP BY trigger_agent, event_type, priority
      ORDER BY count DESC
    `);
    return stmt.all(hours);
  }

  // ============================================
  // Agent Jobs Queue (Orchestrator Layer 2)
  // ============================================

  createJob(job) {
    const stmt = this.db.prepare(`
      INSERT INTO agent_jobs (
        job_id, repo, profile, priority, trigger_reason, event_bundle,
        assigned_agent, gate_required, outcome_required, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued')
    `);

    stmt.run(
      job.jobId,
      job.repo,
      job.profile || 'baseline',
      job.priority || 'normal',
      job.triggerReason,
      JSON.stringify(job.eventBundle || []),
      job.assignedAgent,
      job.gateRequired || null,
      job.outcomeRequired || null
    );

    return job.jobId;
  }

  getNextJob(maxConcurrent = 2) {
    // Check current running jobs
    const runningStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM agent_jobs WHERE status = 'running'
    `);
    const running = runningStmt.get();

    if (running.count >= maxConcurrent) {
      return null;
    }

    // Get next job by priority (critical > high > normal > low)
    // Only get jobs that are queued and either have no gate or gate is approved
    const stmt = this.db.prepare(`
      SELECT * FROM agent_jobs
      WHERE status = 'queued'
        AND (gate_required IS NULL OR gate_status = 'approved')
      ORDER BY
        CASE priority
          WHEN 'critical' THEN 0
          WHEN 'high' THEN 1
          WHEN 'normal' THEN 2
          WHEN 'low' THEN 3
          ELSE 4
        END,
        created_at ASC
      LIMIT 1
    `);

    return stmt.get();
  }

  getJobsAwaitingGate() {
    const stmt = this.db.prepare(`
      SELECT * FROM agent_jobs
      WHERE status = 'queued'
        AND gate_required IS NOT NULL
        AND gate_status = 'pending'
      ORDER BY
        CASE gate_required
          WHEN 'A' THEN 0
          WHEN 'B' THEN 1
          WHEN 'C' THEN 2
          WHEN 'D' THEN 3
          ELSE 4
        END,
        created_at ASC
    `);
    return stmt.all();
  }

  startJob(jobId) {
    const stmt = this.db.prepare(`
      UPDATE agent_jobs
      SET status = 'running', started_at = datetime('now')
      WHERE job_id = ?
    `);
    stmt.run(jobId);
  }

  completeJob(jobId, outcomeType, artifactPath = null) {
    const stmt = this.db.prepare(`
      UPDATE agent_jobs
      SET status = 'done',
          completed_at = datetime('now'),
          outcome_type = ?,
          outcome_artifact = ?
      WHERE job_id = ?
    `);
    stmt.run(outcomeType, artifactPath, jobId);
  }

  failJob(jobId, error) {
    const job = this.getJob(jobId);
    if (!job) return;

    if (job.retry_count < job.max_retries) {
      // Re-queue for retry
      const stmt = this.db.prepare(`
        UPDATE agent_jobs
        SET status = 'queued',
            retry_count = retry_count + 1,
            error = ?
        WHERE job_id = ?
      `);
      stmt.run(error, jobId);
    } else {
      // Mark as failed
      const stmt = this.db.prepare(`
        UPDATE agent_jobs
        SET status = 'failed',
            completed_at = datetime('now'),
            error = ?
        WHERE job_id = ?
      `);
      stmt.run(error, jobId);
    }
  }

  blockJob(jobId, gateLevel) {
    const stmt = this.db.prepare(`
      UPDATE agent_jobs
      SET status = 'blocked',
          gate_required = ?,
          gate_status = 'pending'
      WHERE job_id = ?
    `);
    stmt.run(gateLevel, jobId);
  }

  approveGate(jobId, actor, reason = null) {
    const transaction = this.db.transaction(() => {
      // Update job
      const updateStmt = this.db.prepare(`
        UPDATE agent_jobs
        SET gate_status = 'approved',
            gate_approved_by = ?,
            gate_approved_at = datetime('now'),
            status = CASE WHEN status = 'blocked' THEN 'queued' ELSE status END
        WHERE job_id = ?
      `);
      updateStmt.run(actor, jobId);

      // Log to history
      const historyStmt = this.db.prepare(`
        INSERT INTO gate_history (job_id, gate_level, action, reason, actor)
        SELECT job_id, gate_required, 'approved', ?, ?
        FROM agent_jobs WHERE job_id = ?
      `);
      historyStmt.run(reason, actor, jobId);
    });

    transaction();
  }

  rejectGate(jobId, actor, reason) {
    const transaction = this.db.transaction(() => {
      // Update job
      const updateStmt = this.db.prepare(`
        UPDATE agent_jobs
        SET gate_status = 'rejected',
            status = 'failed',
            completed_at = datetime('now'),
            error = ?
        WHERE job_id = ?
      `);
      updateStmt.run(`Gate rejected: ${reason}`, jobId);

      // Log to history
      const historyStmt = this.db.prepare(`
        INSERT INTO gate_history (job_id, gate_level, action, reason, actor)
        SELECT job_id, gate_required, 'rejected', ?, ?
        FROM agent_jobs WHERE job_id = ?
      `);
      historyStmt.run(reason, actor, jobId);
    });

    transaction();
  }

  getJob(jobId) {
    const stmt = this.db.prepare(`SELECT * FROM agent_jobs WHERE job_id = ?`);
    return stmt.get(jobId);
  }

  getJobsByStatus(status) {
    const stmt = this.db.prepare(`
      SELECT * FROM agent_jobs WHERE status = ? ORDER BY created_at DESC
    `);
    return stmt.all(status);
  }

  getJobStats() {
    const stmt = this.db.prepare(`
      SELECT
        status,
        COUNT(*) as count,
        AVG(CASE
          WHEN completed_at IS NOT NULL AND started_at IS NOT NULL
          THEN (julianday(completed_at) - julianday(started_at)) * 86400000
          ELSE NULL
        END) as avg_duration_ms
      FROM agent_jobs
      GROUP BY status
    `);
    return stmt.all();
  }

  // ============================================
  // Event Batching / Coalescing
  // ============================================

  getOrCreateBatch(directory, extension) {
    const batchId = `${directory}:${extension}:${Math.floor(Date.now() / 2000)}`; // 2-second windows

    const existing = this.db.prepare(`
      SELECT * FROM event_batches WHERE batch_id = ?
    `).get(batchId);

    if (existing) {
      return existing;
    }

    this.db.prepare(`
      INSERT INTO event_batches (batch_id, directory, extension, paths)
      VALUES (?, ?, ?, '[]')
    `).run(batchId, directory, extension);

    return this.db.prepare(`SELECT * FROM event_batches WHERE batch_id = ?`).get(batchId);
  }

  addToBatch(batchId, path) {
    const batch = this.db.prepare(`SELECT * FROM event_batches WHERE batch_id = ?`).get(batchId);
    if (!batch) return;

    const paths = JSON.parse(batch.paths || '[]');
    if (!paths.includes(path)) {
      paths.push(path);
    }

    this.db.prepare(`
      UPDATE event_batches
      SET paths = ?,
          event_count = event_count + 1,
          last_event_at = datetime('now')
      WHERE batch_id = ?
    `).run(JSON.stringify(paths), batchId);
  }

  getReadyBatches(windowMs = 2000) {
    const stmt = this.db.prepare(`
      SELECT * FROM event_batches
      WHERE coalesced = FALSE
        AND (julianday('now') - julianday(last_event_at)) * 86400000 >= ?
    `);
    return stmt.all(windowMs);
  }

  markBatchCoalesced(batchId, jobId) {
    this.db.prepare(`
      UPDATE event_batches
      SET coalesced = TRUE, job_id = ?
      WHERE batch_id = ?
    `).run(jobId, batchId);
  }

  // ============================================
  // Artifact Tracking
  // ============================================

  recordArtifact(jobId, artifactType, artifactPath, fileHash = null, metadata = null) {
    const stmt = this.db.prepare(`
      INSERT INTO artifacts (job_id, artifact_type, artifact_path, file_hash, metadata)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(jobId, artifactType, artifactPath, fileHash, metadata ? JSON.stringify(metadata) : null);
  }

  getArtifactsForJob(jobId) {
    const stmt = this.db.prepare(`SELECT * FROM artifacts WHERE job_id = ?`);
    return stmt.all(jobId);
  }

  getRecentArtifacts(limit = 20) {
    const stmt = this.db.prepare(`
      SELECT a.*, j.assigned_agent, j.status as job_status
      FROM artifacts a
      JOIN agent_jobs j ON a.job_id = j.job_id
      ORDER BY a.created_at DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  // Cleanup old data
  cleanup(daysToKeep = 30) {
    const stmt = this.db.prepare(`
      DELETE FROM events WHERE timestamp < datetime('now', '-' || ? || ' days')
    `);
    const result = stmt.run(daysToKeep);

    const metricsStmt = this.db.prepare(`
      DELETE FROM metrics WHERE timestamp < datetime('now', '-' || ? || ' days')
    `);
    metricsStmt.run(daysToKeep);

    return result.changes;
  }

  close() {
    this.db.close();
  }
}

// Singleton instance
let instance = null;

export function getDatabase() {
  if (!instance) {
    instance = new MonitorDatabase();
  }
  return instance;
}

export default MonitorDatabase;
