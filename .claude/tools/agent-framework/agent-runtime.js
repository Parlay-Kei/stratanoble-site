#!/usr/bin/env node
/**
 * agent-runtime.js - ANX Agent Framework Runtime
 *
 * Provides the autonomy layer for agents to:
 * - Execute within defined boundaries (APPROVALS.md)
 * - Delegate to skills via orchestrator
 * - Track KPIs and escalate when needed
 * - Generate proof receipts
 *
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const ANX_ROOT = 'C:/Dev/.claude-anx';
const GOVERNANCE_ROOT = path.join(ANX_ROOT, 'governance');
const ROSTER_PATH = path.join(GOVERNANCE_ROOT, 'roster.json');
const APPROVALS_PATH = path.join(GOVERNANCE_ROOT, 'APPROVALS.md');
const INTAKE_PATH = path.join(GOVERNANCE_ROOT, 'INTAKE.md');
const RECEIPTS_ROOT = path.join(ANX_ROOT, 'docs/ops/04-PROOFS');

/**
 * Agent class - represents an autonomous agent
 */
export class Agent {
  constructor(id, config = {}) {
    this.id = id;
    this.name = config.name || id;
    this.owner = config.owner || 'OCS';
    this.mission = config.mission || '';
    this.kpis = config.kpis || [];
    this.skills = config.skills || [];
    this.services = config.services || [];
    this.status = config.status || 'active';
    this.permissions = config.permissions || {};
    this.state = {
      running: false,
      currentTask: null,
      lastActivity: null,
      kpiMetrics: {}
    };
  }

  /**
   * Check if agent can perform an action within its authority
   */
  async canPerform(action, context = {}) {
    // Load approval thresholds
    const thresholds = await loadApprovalThresholds();

    // Check action type
    const { type, value, risk } = action;

    // Auto-approved actions
    const autoApproved = [
      'bug_fix',
      'documentation',
      'test_addition',
      'code_refactoring',
      'monitoring_update'
    ];

    if (autoApproved.includes(type)) {
      return { approved: true, reason: 'Auto-approved action' };
    }

    // Check financial thresholds
    if (type === 'expense' || type === 'spend') {
      if (value < 500) {
        return { approved: true, reason: 'Within auto-approve threshold (<$500)' };
      }
      if (value < 5000 && this.id === 'A3') { // CFO Agent
        return { approved: true, reason: 'CFO authority ($500-$5000)' };
      }
      return { approved: false, reason: 'Requires Principal approval (>$5000)', escalateTo: 'Steve' };
    }

    // Check technical actions
    if (type === 'deploy') {
      if (context.env === 'production') {
        return { approved: true, reason: 'QA Gatekeeper approved', requiresGate: true };
      }
      return { approved: true, reason: 'Preview deployment auto-approved' };
    }

    // Default: check agent's explicit permissions
    if (this.permissions[type]) {
      return { approved: true, reason: `Agent has ${type} permission` };
    }

    return { approved: false, reason: 'Action requires approval', escalateTo: this.owner };
  }

  /**
   * Execute a task using assigned skills
   */
  async executeTask(task) {
    this.state.running = true;
    this.state.currentTask = task;
    this.state.lastActivity = new Date().toISOString();

    const result = {
      agent: this.id,
      task: task.title,
      startTime: this.state.lastActivity,
      status: 'pending',
      skillsInvoked: [],
      receipts: [],
      output: null
    };

    try {
      // Check if we can perform this task
      const permission = await this.canPerform(task.action || { type: 'general' }, task.context || {});

      if (!permission.approved) {
        result.status = 'blocked';
        result.output = `Blocked: ${permission.reason}. Escalate to: ${permission.escalateTo}`;
        return result;
      }

      // Determine which skills to invoke
      const skillsToUse = task.skills || this.skills;

      // Invoke orchestrator for each skill
      for (const skillId of skillsToUse) {
        const skillResult = await this.invokeSkill(skillId, task.action?.name || 'execute', task.params || {});
        result.skillsInvoked.push({
          skill: skillId,
          success: skillResult.success,
          output: skillResult.output
        });

        if (!skillResult.success && task.stopOnError !== false) {
          result.status = 'failed';
          result.output = `Skill ${skillId} failed: ${skillResult.error}`;
          break;
        }
      }

      // Generate receipt
      const receipt = await this.generateReceipt(result);
      result.receipts.push(receipt);

      // Update status
      if (result.status === 'pending') {
        result.status = result.skillsInvoked.every(s => s.success) ? 'completed' : 'partial';
      }

      result.output = result.skillsInvoked.map(s => s.output).join('\n---\n');

    } catch (err) {
      result.status = 'error';
      result.output = err.message;
    } finally {
      this.state.running = false;
      this.state.currentTask = null;
      result.endTime = new Date().toISOString();
      result.duration = new Date(result.endTime) - new Date(result.startTime);
    }

    return result;
  }

  /**
   * Invoke a skill via oc_do orchestrator
   */
  async invokeSkill(skillId, action, params = {}) {
    return new Promise((resolve) => {
      const args = [
        path.join(ANX_ROOT, 'tools/ops-dispatcher/oc_do.js'),
        '--skill', skillId,
        '--action', action
      ];

      const proc = spawn('node', args, {
        cwd: process.cwd(),
        shell: true
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => { stdout += data.toString(); });
      proc.stderr.on('data', (data) => { stderr += data.toString(); });

      proc.on('close', (code) => {
        resolve({
          success: code === 0,
          output: stdout,
          error: code !== 0 ? stderr || 'Skill execution failed' : null
        });
      });

      proc.on('error', (err) => {
        resolve({
          success: false,
          output: null,
          error: err.message
        });
      });
    });
  }

  /**
   * Generate a proof receipt for the task
   */
  async generateReceipt(result) {
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];
    const year = date.split('-')[0];
    const yearMonth = date.substring(0, 7);

    const receiptDir = path.join(RECEIPTS_ROOT, year, yearMonth);
    await fs.mkdir(receiptDir, { recursive: true });

    const receiptPath = path.join(receiptDir, `RECEIPT_${this.id}_${timestamp.replace(/[:.]/g, '-')}.md`);

    const receipt = `# Agent Execution Receipt

**Agent**: ${this.name} (${this.id})
**Task**: ${result.task}
**Status**: ${result.status.toUpperCase()}
**Timestamp**: ${timestamp}
**Duration**: ${result.duration}ms

## Skills Invoked

${result.skillsInvoked.map(s => `- **${s.skill}**: ${s.success ? '✅ Success' : '❌ Failed'}`).join('\n')}

## Output Summary

\`\`\`
${(result.output || 'No output').substring(0, 2000)}
\`\`\`

## Agent Context

- **Owner**: ${this.owner}
- **Mission**: ${this.mission}
- **Assigned Skills**: ${this.skills.join(', ')}

---
*Generated by ANX Agent Framework v1.0.0*
`;

    await fs.writeFile(receiptPath, receipt, 'utf-8');
    return receiptPath;
  }

  /**
   * Track a KPI metric
   */
  trackKPI(kpiName, value) {
    if (!this.state.kpiMetrics[kpiName]) {
      this.state.kpiMetrics[kpiName] = [];
    }
    this.state.kpiMetrics[kpiName].push({
      value,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get agent status summary
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      running: this.state.running,
      currentTask: this.state.currentTask,
      lastActivity: this.state.lastActivity,
      skills: this.skills.length,
      services: this.services.length,
      kpis: this.kpis
    };
  }
}

/**
 * AgentRegistry - manages all agents
 */
export class AgentRegistry {
  constructor() {
    this.agents = new Map();
    this.loaded = false;
  }

  /**
   * Load agents from roster.json
   */
  async load() {
    try {
      const content = await fs.readFile(ROSTER_PATH, 'utf-8');
      const roster = JSON.parse(content);

      for (const agentConfig of roster.agents) {
        const agent = new Agent(agentConfig.id, {
          name: agentConfig.name,
          owner: agentConfig.owner,
          mission: agentConfig.mission,
          kpis: agentConfig.kpis,
          skills: agentConfig.skills,
          services: agentConfig.services,
          status: agentConfig.status,
          permissions: this.derivePermissions(agentConfig)
        });

        this.agents.set(agentConfig.id, agent);
      }

      this.loaded = true;
      return { success: true, agentCount: this.agents.size };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Derive permissions from agent config and role
   */
  derivePermissions(config) {
    const permissions = {};

    // Core permissions based on agent role
    switch (config.id) {
      case 'A1': // OCS
        permissions.delegate = true;
        permissions.route = true;
        permissions.escalate = true;
        break;
      case 'A2': // QA Gatekeeper
        permissions.deploy_gate = true;
        permissions.proof_validation = true;
        break;
      case 'A3': // CFO
        permissions.expense_approve = true;
        permissions.pricing = true;
        break;
      case 'A7': // Platform Ops
        permissions.deploy = true;
        permissions.infrastructure = true;
        permissions.security = true;
        break;
      case 'A8': // Direct Cuts GM
        permissions.venture_ops = true;
        permissions.feature_request = true;
        break;
    }

    return permissions;
  }

  /**
   * Get an agent by ID
   */
  get(agentId) {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  getAll() {
    return Array.from(this.agents.values());
  }

  /**
   * Get active agents
   */
  getActive() {
    return this.getAll().filter(a => a.status === 'active');
  }

  /**
   * Find agent by skill
   */
  findBySkill(skillId) {
    return this.getAll().find(a => a.skills.includes(skillId));
  }

  /**
   * Route a task to the appropriate agent
   */
  async routeTask(task) {
    // Try to find agent by explicit assignment
    if (task.agentId) {
      const agent = this.get(task.agentId);
      if (agent) return agent;
    }

    // Try to find agent by skill match
    if (task.skill) {
      const agent = this.findBySkill(task.skill);
      if (agent) return agent;
    }

    // Try to find agent by task type
    const typeToAgent = {
      'bug': 'A2',        // QA Gatekeeper
      'feature': 'A5',    // Product Lead
      'infra': 'A7',      // Platform Ops
      'deploy': 'A7',     // Platform Ops
      'finance': 'A3',    // CFO
      'legal': 'A4',      // Legal Ops
      'marketing': 'A6',  // Growth Lead
      'support': 'A9'     // Support Triage
    };

    if (task.type && typeToAgent[task.type]) {
      const agent = this.get(typeToAgent[task.type]);
      if (agent) return agent;
    }

    // Default to OCS
    return this.get('A1');
  }
}

/**
 * Load approval thresholds from APPROVALS.md
 */
async function loadApprovalThresholds() {
  // Simplified thresholds - in production, parse APPROVALS.md
  return {
    expense: {
      auto: 500,
      agentAuthority: 5000,
      principalRequired: 5001
    },
    contract: {
      standard: 10000,
      custom: 50000
    },
    deploy: {
      preview: 'auto',
      production: 'qa_gate'
    }
  };
}

/**
 * Create a singleton registry instance
 */
let registryInstance = null;

export async function getRegistry() {
  if (!registryInstance) {
    registryInstance = new AgentRegistry();
    await registryInstance.load();
  }
  return registryInstance;
}

/**
 * Main entry point for CLI usage
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
ANX Agent Framework Runtime

Usage:
  node agent-runtime.js --list                    List all agents
  node agent-runtime.js --agent A1 --status      Get agent status
  node agent-runtime.js --agent A2 --task "Run QA gate"
  node agent-runtime.js --route --type bug       Route task by type

Options:
  --list           List all agents
  --agent <id>     Target agent ID
  --status         Get agent status
  --task <title>   Execute a task
  --route          Route a task to appropriate agent
  --type <type>    Task type (bug, feature, infra, etc.)
`);
    process.exit(0);
  }

  const registry = await getRegistry();

  // Handle --list
  if (args.includes('--list')) {
    const agents = registry.getAll();
    console.log('\nANX Agent Registry\n');
    console.log('| ID  | Name | Status | Skills | Owner |');
    console.log('|-----|------|--------|--------|-------|');
    for (const agent of agents) {
      console.log(`| ${agent.id} | ${agent.name} | ${agent.status} | ${agent.skills.length} | ${agent.owner} |`);
    }
    console.log(`\nTotal: ${agents.length} agents`);
    process.exit(0);
  }

  // Handle --agent operations
  const agentIdx = args.indexOf('--agent');
  if (agentIdx !== -1) {
    const agentId = args[agentIdx + 1];
    const agent = registry.get(agentId);

    if (!agent) {
      console.error(`Agent not found: ${agentId}`);
      process.exit(1);
    }

    // Status
    if (args.includes('--status')) {
      console.log(JSON.stringify(agent.getStatus(), null, 2));
      process.exit(0);
    }

    // Task execution
    const taskIdx = args.indexOf('--task');
    if (taskIdx !== -1) {
      const taskTitle = args[taskIdx + 1];
      console.log(`\n[Agent ${agentId}] Executing: ${taskTitle}\n`);

      const result = await agent.executeTask({
        title: taskTitle,
        action: { type: 'general' }
      });

      console.log(JSON.stringify(result, null, 2));
      process.exit(result.status === 'completed' ? 0 : 1);
    }
  }

  // Handle --route
  if (args.includes('--route')) {
    const typeIdx = args.indexOf('--type');
    const taskType = typeIdx !== -1 ? args[typeIdx + 1] : 'general';

    const agent = await registry.routeTask({ type: taskType });
    console.log(`Task type "${taskType}" routed to: ${agent.name} (${agent.id})`);
    process.exit(0);
  }

  console.error('Invalid arguments. Use --help for usage.');
  process.exit(1);
}

// Run if called directly
if (process.argv[1]?.includes('agent-runtime')) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

export default {
  Agent,
  AgentRegistry,
  getRegistry
};
