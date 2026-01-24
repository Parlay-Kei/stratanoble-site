#!/usr/bin/env node
/**
 * Inbox Service v1.2 - Simple Version
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Directories
const BASE_DIR = 'C:\\Dev\\.claude-anx';
const RUNS_DIR = path.join(BASE_DIR, 'runs');
const BRIEFS_DIR = path.join(BASE_DIR, 'intake', 'delegate-briefs');
const RUNTIME_DIR = path.join(BASE_DIR, 'runtime');
const EXECUTION_LOG = path.join(RUNTIME_DIR, 'execution.log');

class InboxService {
  constructor() {
    this.ensureDirectories();
    this.app = express();
    this.app.use(express.json());
    this.setupRoutes();
  }

  ensureDirectories() {
    [RUNS_DIR, BRIEFS_DIR, RUNTIME_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ ok: true, service: 'inbox-service', version: '1.2' });
    });

    // Main inbox endpoint
    this.app.post('/inbox', (req, res) => {
      this.processMessage(req, res);
    });

    // CORS for browser testing
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  async processMessage(req, res) {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        ok: false,
        error: 'Message required',
        example: { message: 'Build feature X for repo Y. Done when: A, B, C.' }
      });
    }

    try {
      const runId = this.generateRunId();
      const runDir = path.join(RUNS_DIR, runId);
      fs.mkdirSync(runDir, { recursive: true });

      this.log(`Processing message → ${runId}`);

      // Simple parsing
      const brief = this.parseMessage(message, runId);

      // Create files
      await this.createBriefFiles(brief, runId, runDir);

      // Create run stub
      const run = this.createRunStub(brief, runId);
      fs.writeFileSync(
        path.join(runDir, 'run.json'),
        JSON.stringify(run, null, 2)
      );

      this.log(`Brief created: ${brief.title} (${runId})`);

      res.json({
        ok: true,
        run_id: runId,
        brief: {
          title: brief.title,
          target: brief.target,
          type: brief.type
        },
        files_created: [
          `runs/${runId}/brief.md`,
          `runs/${runId}/run.json`,
          `intake/delegate-briefs/${brief.filename}`
        ]
      });

    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  }

  parseMessage(message, runId) {
    const lines = message.split('\n').filter(line => line.trim());
    const text = message.toLowerCase();

    // Extract title (first sentence)
    const firstSentence = message.split('.')[0] || lines[0] || 'Untitled Brief';
    const title = firstSentence.trim().substring(0, 100);

    // Detect type
    let type = 'feature';
    if (text.includes('process') || text.includes('workflow')) type = 'process';
    if (text.includes('project') || text.includes('initiative')) type = 'project';

    // Extract target - simple approach
    let target = 'unknown';
    if (message.includes('Target:')) {
      const targetMatch = message.match(/Target:(.+)/i);
      if (targetMatch) target = targetMatch[1].trim();
    } else if (message.includes('C:\\Dev')) {
      const pathMatch = message.match(/C:\\Dev\\[^\\s]+/);
      if (pathMatch) target = pathMatch[0];
    } else if (message.includes('repo')) {
      const repoMatch = message.match(/repo[:\\s]+([^\\s\\n.]+)/i);
      if (repoMatch) target = repoMatch[1];
    }

    // Extract done criteria - look for bullet points or lists
    const done = [];
    const bulletMatches = message.match(/[-*•]\s*(.+)/g);
    if (bulletMatches) {
      bulletMatches.forEach(bullet => {
        const clean = bullet.replace(/^[-*•]\s*/, '').trim();
        if (clean) done.push(clean);
      });
    }

    // Look for "Done when" patterns
    const doneWhenMatch = message.match(/done when[:\\s]*(.+)/gi);
    if (doneWhenMatch && done.length === 0) {
      doneWhenMatch.forEach(match => {
        const content = match.replace(/done when[:\\s]*/gi, '').trim();
        const items = content.split(/[,;]/).map(s => s.trim()).filter(s => s);
        done.push(...items);
      });
    }

    // Fallback done criteria
    if (done.length === 0) {
      done.push('Implementation complete', 'Tests pass', 'Documentation updated');
    }

    // Extract why
    let why = 'Requested via inbox';
    const becauseMatch = message.match(/because (.+)/i);
    if (becauseMatch) {
      why = becauseMatch[1].trim();
    }

    // Extract constraints
    const constraints = [];
    if (message.toLowerCase().includes('no new ui')) {
      constraints.push('No new UI');
    }
    if (message.toLowerCase().includes('lightweight')) {
      constraints.push('Keep it lightweight');
    }

    // Create filename slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    const timestamp = Date.now();
    const filename = `${timestamp}_${slug}.md`;

    return {
      title,
      type,
      target,
      why,
      done: done.slice(0, 7),
      constraints,
      filename,
      run_id: runId,
      raw_message: message
    };
  }

  async createBriefFiles(brief, runId, runDir) {
    const briefMd = `# ${brief.title}

**Type**: ${brief.type}
**Target**: ${brief.target}
**Run ID**: ${brief.run_id}

## Why
${brief.why}

## Definition of Done
${brief.done.map(item => `- [ ] ${item}`).join('\n')}

${brief.constraints.length > 0 ? `## Constraints\n${brief.constraints.map(c => `- ${c}`).join('\n')}` : ''}

---
*Generated from inbox message: ${new Date().toISOString()}*

## Original Message
${brief.raw_message}`;

    // Write files
    fs.writeFileSync(path.join(runDir, 'brief.md'), briefMd);
    fs.writeFileSync(path.join(BRIEFS_DIR, brief.filename), briefMd);

    const briefJson = {
      title: brief.title,
      type: brief.type,
      target: brief.target,
      why: brief.why,
      done: brief.done,
      constraints: brief.constraints,
      created_at: new Date().toISOString(),
      raw_message: brief.raw_message
    };

    fs.writeFileSync(
      path.join(runDir, 'brief.json'),
      JSON.stringify(briefJson, null, 2)
    );
  }

  createRunStub(brief, runId) {
    return {
      run_id: runId,
      status: 'created',
      title: brief.title,
      type: brief.type,
      target: brief.target,
      created_at: new Date().toISOString(),
      created_from: 'inbox',
      phases: {
        brief_created: new Date().toISOString(),
        missions_generated: null,
        execution_started: null,
        execution_completed: null,
        closeout_ready: null
      },
      files: {
        brief_md: `runs/${runId}/brief.md`,
        brief_json: `runs/${runId}/brief.json`,
        intake_brief: `intake/delegate-briefs/${brief.filename}`
      }
    };
  }

  generateRunId() {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/T/, '_').split('.')[0];
    const random = crypto.randomBytes(2).toString('hex');
    return `RUN_${timestamp}_${random.toUpperCase()}`;
  }

  log(message) {
    const logEntry = `[${new Date().toISOString()}] [INBOX] ${message}\n`;
    console.log(logEntry.trim());
    fs.appendFileSync(EXECUTION_LOG, logEntry);
  }

  start(port = 5100) {
    this.app.listen(port, () => {
      console.log(`[INBOX] Service v1.2 listening on port ${port}`);
      console.log(`[INBOX] POST to /inbox with {"message": "..."}`);
      this.log(`Inbox service started on port ${port}`);
    });
  }
}

// Export for use
module.exports = InboxService;

// CLI entry point
if (require.main === module) {
  const service = new InboxService();
  service.start();
}