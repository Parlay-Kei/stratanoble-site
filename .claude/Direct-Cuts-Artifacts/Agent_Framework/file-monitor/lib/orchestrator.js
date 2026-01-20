/**
 * Orchestrator - Layer 2
 * Sits between file monitor and agents
 * Handles: debouncing, coalescing, gate enforcement, outcome validation
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomUUID } from 'crypto';

import { getDatabase } from './database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

class Orchestrator {
  constructor(config, profile) {
    this.config = config;
    this.profile = profile;
    this.db = getDatabase();
    this.running = false;
    this.processInterval = null;
    this.batchInterval = null;
  }

  /**
   * Start the orchestrator
   */
  start() {
    if (this.running) return;
    this.running = true;

    console.log('[Orchestrator] Starting...');

    // Process jobs every second
    this.processInterval = setInterval(() => this.processNextJob(), 1000);

    // Check for ready batches every 2 seconds
    this.batchInterval = setInterval(() => this.processBatches(), 2000);

    console.log('[Orchestrator] Started');
  }

  /**
   * Stop the orchestrator
   */
  stop() {
    this.running = false;
    if (this.processInterval) clearInterval(this.processInterval);
    if (this.batchInterval) clearInterval(this.batchInterval);
    console.log('[Orchestrator] Stopped');
  }

  /**
   * Queue a file event for processing
   * Handles batching/coalescing
   */
  queueEvent(event) {
    const { path, eventType, ruleId, trigger, priority, gateRequired, outcomeRequired } = event;

    // Get directory and extension for batching
    const directory = dirname(path);
    const extension = extname(path) || 'none';

    // Check if coalescing is enabled
    const settings = this.profile.settings?.debounce || {};
    const shouldCoalesce = settings.coalesceByDirectory || settings.coalesceByExtension;

    if (shouldCoalesce && eventType !== 'scan') {
      // Add to batch
      const batch = this.db.getOrCreateBatch(directory, extension);
      this.db.addToBatch(batch.batch_id, path);
      console.log(`[Orchestrator] Added to batch: ${batch.batch_id}`);
    } else {
      // Create immediate job
      this.createJob({
        paths: [path],
        trigger,
        priority,
        gateRequired,
        outcomeRequired,
        triggerReason: `${eventType}: ${path}`
      });
    }
  }

  /**
   * Process ready batches into jobs
   */
  processBatches() {
    const windowMs = this.profile.settings?.debounce?.windowMs || 2000;
    const batches = this.db.getReadyBatches(windowMs);

    for (const batch of batches) {
      const paths = JSON.parse(batch.paths || '[]');
      if (paths.length === 0) {
        this.db.markBatchCoalesced(batch.batch_id, null);
        continue;
      }

      // Find matching rule for this batch
      const rule = this.findRuleForPath(paths[0]);
      if (!rule) {
        this.db.markBatchCoalesced(batch.batch_id, null);
        continue;
      }

      // Create coalesced job
      const jobId = this.createJob({
        paths,
        trigger: rule.trigger,
        priority: rule.priority,
        gateRequired: rule.gate || this.checkRiskZone(paths),
        outcomeRequired: rule.outcomeRequired,
        triggerReason: `Batch: ${paths.length} files in ${batch.directory}`
      });

      this.db.markBatchCoalesced(batch.batch_id, jobId);
      console.log(`[Orchestrator] Coalesced batch ${batch.batch_id} into job ${jobId}`);
    }
  }

  /**
   * Find the best matching rule for a path
   */
  findRuleForPath(path) {
    const rules = this.profile.rules || [];
    for (const rule of rules) {
      if (this.matchPattern(path, rule.pattern)) {
        return rule;
      }
    }
    return null;
  }

  /**
   * Simple pattern matching (glob-like)
   */
  matchPattern(path, pattern) {
    // Convert glob to regex
    const regex = pattern
      .replace(/\*\*/g, '{{DOUBLESTAR}}')
      .replace(/\*/g, '[^/]*')
      .replace(/{{DOUBLESTAR}}/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\./g, '\\.');

    return new RegExp(`^${regex}$`).test(path);
  }

  /**
   * Check if any path falls into a risk zone
   */
  checkRiskZone(paths) {
    const riskZones = this.profile.riskZones || [];

    for (const path of paths) {
      for (const zone of riskZones) {
        const patterns = zone.patterns || [zone.pattern];
        for (const pattern of patterns) {
          if (this.matchPattern(path, pattern)) {
            console.log(`[Orchestrator] Risk zone matched: ${zone.id} for ${path}`);
            return zone.gate;
          }
        }
      }
    }

    return null;
  }

  /**
   * Create a new job
   */
  createJob({ paths, trigger, priority, gateRequired, outcomeRequired, triggerReason }) {
    const jobId = `job_${Date.now()}_${randomUUID().slice(0, 8)}`;

    // Check if gate can be auto-approved
    const autoApprove = this.profile.settings?.gates?.autoApprove || [];
    let gateStatus = 'pending';

    if (gateRequired && autoApprove.includes(gateRequired)) {
      gateStatus = 'approved';
      console.log(`[Orchestrator] Auto-approved gate ${gateRequired} for ${jobId}`);
    }

    this.db.createJob({
      jobId,
      repo: this.config.projectRoot,
      profile: this.profile.profile?.name || 'baseline',
      priority: priority || 'normal',
      triggerReason,
      eventBundle: paths.map(p => ({ path: p })),
      assignedAgent: trigger,
      gateRequired: gateRequired || null,
      outcomeRequired: outcomeRequired || null
    });

    if (gateStatus === 'approved') {
      this.db.approveGate(jobId, 'auto', 'Gate level in auto-approve list');
    }

    console.log(`[Orchestrator] Created job: ${jobId} -> ${trigger} (gate: ${gateRequired || 'none'})`);
    return jobId;
  }

  /**
   * Process the next available job
   */
  async processNextJob() {
    if (!this.running) return;

    const maxConcurrent = this.profile.settings?.queue?.maxConcurrent || 2;
    const job = this.db.getNextJob(maxConcurrent);

    if (!job) return;

    console.log(`[Orchestrator] Processing job: ${job.job_id}`);
    this.db.startJob(job.job_id);

    try {
      const result = await this.runAgent(job);
      await this.validateOutcome(job, result);
    } catch (error) {
      console.error(`[Orchestrator] Job failed: ${job.job_id}`, error.message);
      this.db.failJob(job.job_id, error.message);
    }
  }

  /**
   * Run an agent for a job
   */
  async runAgent(job) {
    const agentConfig = this.config.agents?.[job.assigned_agent];
    if (!agentConfig) {
      throw new Error(`No agent config for: ${job.assigned_agent}`);
    }

    const eventBundle = JSON.parse(job.event_bundle || '[]');
    const eventData = {
      jobId: job.job_id,
      paths: eventBundle.map(e => e.path),
      triggerReason: job.trigger_reason,
      outcomeRequired: job.outcome_required
    };

    return new Promise((resolve, reject) => {
      const agentPath = join(__dirname, '..', agentConfig.args[0]);

      if (!existsSync(agentPath)) {
        reject(new Error(`Agent script not found: ${agentPath}`));
        return;
      }

      const child = spawn(agentConfig.command, [
        ...agentConfig.args,
        JSON.stringify(eventData)
      ], {
        cwd: join(__dirname, '..'),
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: agentConfig.timeout || 30000
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });

      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Agent timeout'));
      }, agentConfig.timeout || 30000);

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          try {
            // Try to parse JSON output
            const jsonMatch = stdout.match(/\{[\s\S]*\}/);
            const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { output: stdout };
            resolve(result);
          } catch {
            resolve({ output: stdout });
          }
        } else {
          reject(new Error(stderr || `Exit code: ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * Validate outcome and create artifact
   */
  async validateOutcome(job, result) {
    const outcomeRequired = job.outcome_required;
    const settings = this.profile.settings?.outcomes || {};

    // Determine outcome type from result
    let outcomeType = 'no_issues_found';
    let artifactPath = null;

    if (result.findings?.length > 0 || result.issues?.length > 0) {
      outcomeType = 'security_finding_created';
    } else if (result.metrics) {
      outcomeType = 'lint_report_generated';
    }

    // Create artifact if required
    if (settings.requireArtifact) {
      artifactPath = await this.createArtifact(job, result, outcomeType);
    }

    // Validate outcome matches requirement
    if (outcomeRequired && outcomeRequired !== outcomeType && outcomeType !== 'no_issues_found') {
      if (settings.rejectOnMissingOutcome) {
        console.warn(`[Orchestrator] Outcome mismatch: expected ${outcomeRequired}, got ${outcomeType}`);
        // Don't fail, just log
      }
    }

    this.db.completeJob(job.job_id, outcomeType, artifactPath);
    console.log(`[Orchestrator] Job completed: ${job.job_id} -> ${outcomeType}`);
  }

  /**
   * Create an artifact file
   */
  async createArtifact(job, result, outcomeType) {
    const settings = this.profile.settings?.outcomes || {};
    const artifactDir = join(this.config.projectRoot, settings.artifactDir || '.anx/artifacts');
    const logsDir = join(this.config.projectRoot, settings.logsDir || '.anx/logs');

    // Ensure directories exist
    mkdirSync(artifactDir, { recursive: true });
    mkdirSync(logsDir, { recursive: true });
    mkdirSync(join(logsDir, 'agent_runs'), { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `run_${job.job_id.slice(0, 20)}_${timestamp}.md`;
    const filepath = join(logsDir, 'agent_runs', filename);

    // Generate markdown report
    const report = this.generateReport(job, result, outcomeType);
    writeFileSync(filepath, report);

    // Record in database
    const hash = createHash('sha256').update(report).digest('hex').slice(0, 12);
    this.db.recordArtifact(job.job_id, outcomeType, filepath, hash, {
      agent: job.assigned_agent,
      eventCount: JSON.parse(job.event_bundle || '[]').length
    });

    console.log(`[Orchestrator] Artifact created: ${filepath}`);
    return filepath;
  }

  /**
   * Generate markdown report
   */
  generateReport(job, result, outcomeType) {
    const eventBundle = JSON.parse(job.event_bundle || '[]');

    let report = `# Agent Run Report

## Job Details
- **Job ID**: ${job.job_id}
- **Agent**: ${job.assigned_agent}
- **Status**: Completed
- **Outcome**: ${outcomeType}
- **Started**: ${job.started_at}
- **Profile**: ${job.profile}

## Trigger
${job.trigger_reason}

## Files Processed
${eventBundle.map(e => `- ${e.path}`).join('\n') || 'None'}

`;

    if (result.findings?.length > 0) {
      report += `## Security Findings
${result.findings.map(f => `- **${f.severity}** [${f.type}] Line ${f.line}: ${f.context?.slice(0, 80) || 'N/A'}`).join('\n')}

`;
    }

    if (result.issues?.length > 0) {
      report += `## Issues
${result.issues.map(i => `- **${i.severity || 'INFO'}** [${i.type}]: ${i.message}`).join('\n')}

`;
    }

    if (result.metrics) {
      report += `## Metrics
\`\`\`json
${JSON.stringify(result.metrics, null, 2)}
\`\`\`

`;
    }

    if (result.todos?.length > 0) {
      report += `## TODOs Found
${result.todos.map(t => `- [${t.type}] Line ${t.line}: ${t.text}`).join('\n')}

`;
    }

    report += `---
Generated: ${new Date().toISOString()}
`;

    return report;
  }

  /**
   * Get orchestrator status
   */
  getStatus() {
    return {
      running: this.running,
      jobs: this.db.getJobStats(),
      awaitingGate: this.db.getJobsAwaitingGate().length,
      recentArtifacts: this.db.getRecentArtifacts(5)
    };
  }

  /**
   * Approve a gate
   */
  approveGate(jobId, actor = 'user', reason = null) {
    this.db.approveGate(jobId, actor, reason);
    console.log(`[Orchestrator] Gate approved for ${jobId}`);
  }

  /**
   * Reject a gate
   */
  rejectGate(jobId, actor = 'user', reason) {
    this.db.rejectGate(jobId, actor, reason);
    console.log(`[Orchestrator] Gate rejected for ${jobId}`);
  }
}

export default Orchestrator;
