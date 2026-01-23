/**
 * Database Service for ANX State
 * Connects to anx_state.db and provides query methods
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const ANX_ROOT = 'C:\\Dev\\.claude-anx';
const DB_PATH = path.join(ANX_ROOT, 'state', 'anx_state.db');

class DatabaseService {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Failed to connect to database:', err);
          reject(err);
        } else {
          console.log('Connected to ANX state database');
          this.initializeTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async initializeTables() {
    // Create directives table if not exists
    await this.run(`
      CREATE TABLE IF NOT EXISTS directives (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        scope TEXT,
        intent TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        owner TEXT DEFAULT 'OCS',
        metadata TEXT
      )
    `);

    // Create plans table if not exists
    await this.run(`
      CREATE TABLE IF NOT EXISTS plans (
        id TEXT PRIMARY KEY,
        directive_id TEXT NOT NULL,
        job_graph TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (directive_id) REFERENCES directives(id)
      )
    `);

    // Create runs table for execution tracking
    await this.run(`
      CREATE TABLE IF NOT EXISTS runs (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        job_count INTEGER DEFAULT 0,
        jobs_completed INTEGER DEFAULT 0,
        jobs_failed INTEGER DEFAULT 0,
        metadata TEXT,
        FOREIGN KEY (plan_id) REFERENCES plans(id)
      )
    `);

    // Ensure queue table exists (already in anx_state.db)
    await this.run(`
      CREATE TABLE IF NOT EXISTS queue (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_error TEXT,
        attempts INTEGER DEFAULT 0,
        run_id TEXT,
        directive_id TEXT
      )
    `);

    console.log('Database tables initialized');
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }

  // Directive-specific methods
  async createDirective(title, body, scope, intent, owner = 'OCS') {
    const id = require('uuid').v4();
    const metadata = JSON.stringify({
      created_via: 'command_center',
      version: 'v1'
    });

    await this.run(
      `INSERT INTO directives (id, title, body, scope, intent, owner, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, title, body, scope, intent, owner, metadata]
    );

    return id;
  }

  async getDirective(id) {
    return await this.get(
      `SELECT * FROM directives WHERE id = ?`,
      [id]
    );
  }

  async getAllDirectives() {
    return await this.all(
      `SELECT * FROM directives ORDER BY created_at DESC`
    );
  }

  async updateDirectiveStatus(id, status) {
    await this.run(
      `UPDATE directives SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, id]
    );
  }

  // Plan-specific methods
  async createPlan(directiveId, jobGraph) {
    const id = require('uuid').v4();
    const metadata = JSON.stringify({
      compiler_version: 'v1',
      created_via: 'mission_compiler'
    });

    await this.run(
      `INSERT INTO plans (id, directive_id, job_graph, metadata)
       VALUES (?, ?, ?, ?)`,
      [id, directiveId, JSON.stringify(jobGraph), metadata]
    );

    return id;
  }

  async getPlan(id) {
    const plan = await this.get(
      `SELECT * FROM plans WHERE id = ?`,
      [id]
    );

    if (plan && plan.job_graph) {
      plan.job_graph = JSON.parse(plan.job_graph);
    }

    return plan;
  }

  async getPlansByDirective(directiveId) {
    const plans = await this.all(
      `SELECT * FROM plans WHERE directive_id = ? ORDER BY created_at DESC`,
      [directiveId]
    );

    return plans.map(plan => {
      if (plan.job_graph) {
        plan.job_graph = JSON.parse(plan.job_graph);
      }
      return plan;
    });
  }

  // Run-specific methods
  async createRun(planId, jobCount) {
    const id = require('uuid').v4();

    await this.run(
      `INSERT INTO runs (id, plan_id, job_count)
       VALUES (?, ?, ?)`,
      [id, planId, jobCount]
    );

    return id;
  }

  async updateRunStatus(id, status, jobsCompleted = null, jobsFailed = null) {
    let sql = `UPDATE runs SET status = ?, updated_at = CURRENT_TIMESTAMP`;
    const params = [status];

    if (jobsCompleted !== null) {
      sql += `, jobs_completed = ?`;
      params.push(jobsCompleted);
    }

    if (jobsFailed !== null) {
      sql += `, jobs_failed = ?`;
      params.push(jobsFailed);
    }

    if (status === 'completed' || status === 'failed') {
      sql += `, completed_at = CURRENT_TIMESTAMP`;
    }

    sql += ` WHERE id = ?`;
    params.push(id);

    await this.run(sql, params);
  }

  async getRun(id) {
    return await this.get(
      `SELECT * FROM runs WHERE id = ?`,
      [id]
    );
  }

  async getRunsByPlan(planId) {
    return await this.all(
      `SELECT * FROM runs WHERE plan_id = ? ORDER BY started_at DESC`,
      [planId]
    );
  }

  // Job queue methods
  async enqueueJob(payload, runId = null, directiveId = null) {
    const id = require('uuid').v4();

    await this.run(
      `INSERT INTO queue (id, payload, run_id, directive_id)
       VALUES (?, ?, ?, ?)`,
      [id, JSON.stringify(payload), runId, directiveId]
    );

    return id;
  }

  async getJobsByRun(runId) {
    return await this.all(
      `SELECT * FROM queue WHERE run_id = ? ORDER BY created_at`,
      [runId]
    );
  }

  async updateJobStatus(id, status, error = null) {
    const params = [status];
    let sql = `UPDATE queue SET status = ?, updated_at = CURRENT_TIMESTAMP`;

    if (error) {
      sql += `, last_error = ?`;
      params.push(error);
    }

    sql += ` WHERE id = ?`;
    params.push(id);

    await this.run(sql, params);
  }
}

// Export singleton instance
const dbService = new DatabaseService();
module.exports = dbService;