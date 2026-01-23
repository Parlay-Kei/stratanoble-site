#!/usr/bin/env node
/**
 * Demo: High-Risk Pipeline with Approval Checkpoint
 * Demonstrates pipeline pause/resume with approval tokens
 */

import { ApprovalManager } from './approval-manager.js';
import readline from 'readline';

// Console colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

class HighRiskPipelineDemo {
  constructor() {
    this.approvalManager = new ApprovalManager();
    this.sessionId = `SESSION-${Date.now()}`;
    this.ticketId = `OCS-DEMO-${Math.floor(Math.random() * 9999)}`;
    this.steps = [];
  }

  /**
   * Initialize demo
   */
  async initialize() {
    await this.approvalManager.initialize();

    // Setup event listeners
    this.approvalManager.on('approval:requested', (data) => {
      this.log('🔒 APPROVAL REQUESTED', `Request ID: ${data.requestId}`, 'yellow');
    });

    this.approvalManager.on('checkpoint:approved', (data) => {
      this.log('✅ CHECKPOINT APPROVED', `Request ID: ${data.requestId}`, 'green');
    });

    this.approvalManager.on('resume:started', (data) => {
      this.log('▶️ RESUME STARTED', `Stage: ${data.stage}`, 'cyan');
    });

    this.approvalManager.on('step:completed', (data) => {
      this.log('✓ STEP COMPLETED', data.step, 'green');
    });
  }

  /**
   * Run demo pipeline
   */
  async runPipeline() {
    this.log('=== HIGH-RISK PIPELINE DEMO ===', '', 'bold');
    this.log('Pipeline Session', this.sessionId, 'cyan');
    this.log('Ticket ID', this.ticketId, 'cyan');

    console.log('\n' + '─'.repeat(60) + '\n');

    // Phase 1: Safe operations
    await this.executePhase1();

    // Phase 2: High-risk operation requiring approval
    await this.executePhase2();

    // Phase 3: Continue after approval
    await this.executePhase3();

    this.log('\n=== PIPELINE COMPLETE ===', '', 'bold');
    this.showSummary();
  }

  /**
   * Phase 1: Safe operations
   */
  async executePhase1() {
    this.log('PHASE 1', 'Executing safe operations...', 'blue');

    const safeSteps = [
      'Validating configuration',
      'Running tests',
      'Building artifacts',
      'Running security scan'
    ];

    for (const step of safeSteps) {
      await this.executeStep(step, 'safe');
    }

    this.log('✓ Phase 1 Complete', 'All safe operations passed', 'green');
  }

  /**
   * Phase 2: High-risk operation
   */
  async executePhase2() {
    console.log('\n' + '─'.repeat(60) + '\n');
    this.log('PHASE 2', 'HIGH-RISK OPERATION DETECTED', 'red');
    this.log('⚠️ WARNING', 'Production database migration required', 'yellow');

    // Create approval checkpoint
    const approvalRequest = await this.approvalManager.requestApproval({
      sessionId: this.sessionId,
      ticketId: this.ticketId,
      operation: 'Production Database Migration',
      severity: 'critical',
      reason: 'Migrating production database schema - affects all users',
      risks: [
        'Potential data loss if migration fails',
        'Service downtime during migration',
        'Rollback complexity if issues occur'
      ],
      target: 'production-db-primary',
      impact: {
        scope: 'global',
        users: 100000,
        services: ['api', 'web', 'mobile'],
        estimatedDuration: '30 minutes'
      },
      rollbackPlan: 'Restore from backup snapshot taken before migration',
      requiredApprovers: [
        { agentId: 'DBA', role: 'database-admin' },
        { agentId: 'OPS', role: 'operations-lead' }
      ],
      minApprovals: 1,
      state: {
        stage: 'phase2',
        step: 4,
        data: {
          migrationScript: 'v2.0.0-migration.sql',
          backupId: 'backup-20240120-1500'
        },
        completed: [
          'validation',
          'tests',
          'build',
          'security-scan'
        ],
        remaining: [
          'database-migration',
          'data-verification',
          'cache-clear',
          'service-restart',
          'health-check'
        ]
      }
    });

    this.log('🔒 PIPELINE BLOCKED', '', 'red');
    console.log('\n' + colors.yellow + approvalRequest.instructions + colors.reset);

    // Store request ID for later
    this.requestId = approvalRequest.requestId;
    this.approvalCode = approvalRequest.approvalCode;

    // Wait for user input
    await this.waitForApproval();
  }

  /**
   * Wait for approval input
   */
  async waitForApproval() {
    console.log('\n' + '─'.repeat(60) + '\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      const askForApproval = () => {
        rl.question(colors.cyan + 'Enter approval code or token (or "skip" to simulate timeout): ' + colors.reset, async (input) => {
          if (input.toLowerCase() === 'skip') {
            this.log('⏭️ SKIPPING', 'Simulating timeout...', 'yellow');
            rl.close();
            resolve();
            return;
          }

          try {
            // Try as code first (6 characters)
            if (input.length === 6) {
              this.log('🔐 Processing approval code...', '', 'cyan');

              const result = await this.approvalManager.approveWithCode(
                this.requestId,
                input,
                'DEMO-USER'
              );

              if (result.canProceed) {
                this.log('✅ APPROVED', 'Approval code valid!', 'green');

                // Resume pipeline
                this.log('▶️ RESUMING PIPELINE', '', 'cyan');

                // Simulate resume
                await this.simulateResume();

                rl.close();
                resolve();
                return;
              }
            } else {
              // Try as token
              this.log('🔐 Processing approval token...', '', 'cyan');

              const result = await this.approvalManager.approveWithToken(
                this.requestId,
                input
              );

              if (result.canProceed) {
                this.log('✅ APPROVED', 'Token valid!', 'green');

                // Resume pipeline
                this.log('▶️ RESUMING PIPELINE', '', 'cyan');

                // Simulate resume
                await this.simulateResume();

                rl.close();
                resolve();
                return;
              }
            }
          } catch (error) {
            this.log('❌ INVALID', error.message, 'red');
            console.log(colors.yellow + `\nHint: Use approval code: ${this.approvalCode}` + colors.reset);
            askForApproval(); // Ask again
          }
        });
      };

      askForApproval();
    });
  }

  /**
   * Simulate pipeline resume
   */
  async simulateResume() {
    const remainingSteps = [
      'database-migration',
      'data-verification',
      'cache-clear',
      'service-restart',
      'health-check'
    ];

    this.log('\n📋 RESUMING FROM CHECKPOINT', '', 'cyan');
    this.log('Remaining steps', remainingSteps.length.toString(), 'blue');

    for (const step of remainingSteps) {
      await this.executeStep(step, 'resumed');
    }
  }

  /**
   * Phase 3: Post-approval operations
   */
  async executePhase3() {
    console.log('\n' + '─'.repeat(60) + '\n');
    this.log('PHASE 3', 'Completing pipeline...', 'blue');

    const finalSteps = [
      'Updating monitoring alerts',
      'Sending notifications',
      'Generating reports',
      'Cleanup temporary files'
    ];

    for (const step of finalSteps) {
      await this.executeStep(step, 'final');
    }

    this.log('✓ Phase 3 Complete', 'All operations completed', 'green');
  }

  /**
   * Execute a step
   */
  async executeStep(stepName, phase) {
    process.stdout.write(colors.blue + '  ▶ ' + stepName + '...' + colors.reset);

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    // Record step
    this.steps.push({
      name: stepName,
      phase,
      timestamp: new Date().toISOString()
    });

    console.log(colors.green + ' ✓' + colors.reset);
  }

  /**
   * Show summary
   */
  showSummary() {
    console.log('\n' + '═'.repeat(60));
    console.log(colors.bold + '\n📊 PIPELINE SUMMARY\n' + colors.reset);

    console.log('Session ID:', this.sessionId);
    console.log('Ticket ID:', this.ticketId);
    console.log('Total Steps:', this.steps.length);

    // Group by phase
    const phases = {};
    for (const step of this.steps) {
      if (!phases[step.phase]) {
        phases[step.phase] = [];
      }
      phases[step.phase].push(step);
    }

    console.log('\nPhases:');
    for (const [phase, steps] of Object.entries(phases)) {
      console.log(`  ${phase}: ${steps.length} steps`);
    }

    if (this.requestId) {
      console.log('\n' + colors.yellow + 'Approval Details:' + colors.reset);
      console.log('  Request ID:', this.requestId);
      console.log('  Status: APPROVED ✅');
    }

    console.log('\n' + colors.green + '✅ Pipeline completed successfully!' + colors.reset);
    console.log('═'.repeat(60));
  }

  /**
   * Log helper
   */
  log(label, message, color = 'reset') {
    const colorCode = colors[color] || colors.reset;
    console.log(colorCode + colors.bold + label + colors.reset + (message ? ': ' + message : ''));
  }
}

// Run demo
async function main() {
  console.clear();
  console.log(colors.cyan + colors.bold);
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         APPROVAL TOKENS v1.0 - DEMO                      ║');
  console.log('║         High-Risk Pipeline with Checkpoint               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  const demo = new HighRiskPipelineDemo();

  try {
    await demo.initialize();
    await demo.runPipeline();
  } catch (error) {
    console.error(colors.red + '\n❌ Demo failed:', error.message + colors.reset);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}