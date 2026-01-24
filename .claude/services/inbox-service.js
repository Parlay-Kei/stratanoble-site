#!/usr/bin/env node
/**
 * Inbox Service v1.2
 * Accepts one message → creates brief + run stub
 *
 * Input: HTTP POST { "message": "..." }
 * Outputs:
 * - runs/{run_id}/brief.md
 * - runs/{run_id}/run.json
 * - intake/delegate-briefs/{timestamp}_{slug}.md
 * - runtime/execution.log entry
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

  /**
   * Process incoming message and create brief
   */
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

      // Parse message into brief structure
      const brief = this.parseMessage(message, runId);

      // Create brief files
      await this.createBriefFiles(brief, runId, runDir);

      // Create run stub
      const run = this.createRunStub(brief, runId);
      fs.writeFileSync(
        path.join(runDir, 'run.json'),
        JSON.stringify(run, null, 2)
      );

      // Log to execution log
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

  /**
   * Parse natural language message into structured brief
   */
  parseMessage(message, runId) {
    const lines = message.split('\n').filter(line => line.trim());
    const text = message.toLowerCase();

    // Extract title (first sentence or line)
    const titleMatch = message.match(/^([^.!?\\n]+)/);
    const title = titleMatch ? titleMatch[1].trim() : lines[0] || 'Untitled Brief';

    // Detect type
    let type = 'feature'; // default
    if (text.includes('process') || text.includes('workflow')) type = 'process';
    if (text.includes('project') || text.includes('initiative')) type = 'project';

    // Extract target
    let target = 'unknown';
    const targetPatterns = [
      /target[:\s]+([^\n.]+)/i,
      /repo[:\s]+([^\n.]+)/i,
      /C:\\Dev\\[^\s\n]+/i,
      /[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+/
    ];

    for (const pattern of targetPatterns) {
      const match = message.match(pattern);
      if (match) {
        target = match[1] || match[0];
        break;
      }
    }

    // Extract definition of done
    const donePatterns = [
      /done when[:\\s]*([^\\n]+)/gi,
      /definition of done[:\\s]*([^\\n]+)/gi,
      /must[:\\s]*([^\\n]+)/gi,
      /should[:\\s]*([^\\n]+)/gi
    ];

    const done = [];

    // Look for bullet points
    const bullets = message.match(/^\\s*[-*•]\\s*(.+)$/gm);
    if (bullets) {
      bullets.forEach(bullet => {
        const clean = bullet.replace(/^\\s*[-*•]\\s*/, '').trim();
        if (clean) done.push(clean);
      });
    }

    // Look for numbered lists
    const numbered = message.match(/^\\s*\\d+[.):]\\s*(.+)$/gm);
    if (numbered) {
      numbered.forEach(item => {
        const clean = item.replace(/^\\s*\\d+[.):]\\s*/, '').trim();
        if (clean) done.push(clean);
      });
    }

    // Look for done patterns
    for (const pattern of donePatterns) {
      const matches = [...message.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1]) {
          const items = match[1].split(/[,;]/).map(s => s.trim()).filter(s => s);
          done.push(...items);
        }
      });
    }

    // If no done criteria found, try to extract from parentheses
    if (done.length === 0) {
      const parenMatch = message.match(/\\(([^)]+)\\)/);
      if (parenMatch) {
        const items = parenMatch[1].split(/[,;]/).map(s => s.trim()).filter(s => s);
        done.push(...items);
      }
    }

    // Fallback done criteria
    if (done.length === 0) {
      done.push('Implementation complete', 'Tests pass', 'Documentation updated');
    }

    // Extract constraints
    const constraints = [];
    const constraintPatterns = [
      /no new ui/i,
      /no \\w+/gi,
      /do not \\w+/gi,
      /cannot \\w+/gi,
      /must not \\w+/gi,
      /avoid \\w+/gi
    ];

    constraintPatterns.forEach(pattern => {
      const matches = [...message.matchAll(pattern)];
      matches.forEach(match => {
        constraints.push(match[0]);
      });
    });

    // Extract why (sentence containing "because", "since", "for")
    let why = 'Requested via inbox';
    const whyPatterns = [
      /because ([^.!?\\n]+)/i,
      /since ([^.!?\\n]+)/i,
      /for ([^.!?\\n]+)/i
    ];

    for (const pattern of whyPatterns) {
      const match = message.match(pattern);
      if (match) {
        why = match[1].trim();
        break;
      }
    }

    // Create filename slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\\s-]/g, '')
      .replace(/\\s+/g, '-')
      .substring(0, 50);

    const timestamp = Date.now();
    const filename = `${timestamp}_${slug}.md`;

    return {
      title: title.substring(0, 100),
      type,
      target,
      why,
      done: done.slice(0, 7), // max 7 items
      constraints,
      filename,
      run_id: runId,
      raw_message: message
    };
  }

  /**
   * Create brief files in both locations
   */
  async createBriefFiles(brief, runId, runDir) {
    // Create markdown brief
    const briefMd = this.formatBriefMarkdown(brief);

    // Write to run directory
    fs.writeFileSync(path.join(runDir, 'brief.md'), briefMd);

    // Write to intake directory for compiler to pick up
    fs.writeFileSync(path.join(BRIEFS_DIR, brief.filename), briefMd);

    // Also create structured JSON for reference
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

  /**
   * Format brief as markdown
   */
  formatBriefMarkdown(brief) {
    return `# ${brief.title}

**Type**: ${brief.type}
**Target**: ${brief.target}
**Run ID**: ${brief.run_id}

## Why
${brief.why}

## Definition of Done
${brief.done.map(item => `- [ ] ${item}`).join('\\n')}

${brief.constraints.length > 0 ? `## Constraints\\n${brief.constraints.map(c => `- ${c}`).join('\\n')}` : ''}

---
*Generated from inbox message: ${new Date().toISOString()}*

## Original Message
${brief.raw_message}`;
  }

  /**
   * Create run stub for tracking
   */
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

  /**
   * Generate run ID
   */
  generateRunId() {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/T/, '_').split('.')[0];
    const random = crypto.randomBytes(2).toString('hex');
    return `RUN_${timestamp}_${random.toUpperCase()}`;
  }

  /**
   * Log to execution log
   */
  log(message) {
    const logEntry = `[${new Date().toISOString()}] [INBOX] ${message}\\n`;
    console.log(logEntry.trim());
    fs.appendFileSync(EXECUTION_LOG, logEntry);
  }

  /**
   * Start the service
   */
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