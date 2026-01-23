#!/usr/bin/env node
/**
 * Queue System Demo
 * Demonstrates job queue, scheduler, retry, and dead letter functionality
 */

import { QueueManager } from './queue-manager.js';

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

class QueueSystemDemo {
  constructor() {
    this.manager = new QueueManager({
      autoStart: false
    });
  }

  async initialize() {
    console.log(colors.cyan + '\n=== INITIALIZING QUEUE SYSTEM ===' + colors.reset);

    await this.manager.initialize();

    // Setup event listeners
    this.setupEventListeners();

    // Register handlers
    this.registerHandlers();

    console.log(colors.green + '✓ Queue system initialized' + colors.reset);
  }

  setupEventListeners() {
    // Job events
    this.manager.on('job:enqueued', (data) => {
      this.log('📥 JOB ENQUEUED', `${data.name} (${data.id})`, 'cyan');
    });

    this.manager.on('job:started', (data) => {
      this.log('▶️  JOB STARTED', `${data.name}`, 'blue');
    });

    this.manager.on('job:completed', (data) => {
      this.log('✅ JOB COMPLETED', `${data.name} (${data.duration}ms)`, 'green');
    });

    this.manager.on('job:retry', (data) => {
      this.log('🔄 JOB RETRY', `${data.name} (attempt ${data.attempt})`, 'yellow');
    });

    this.manager.on('job:failed', (data) => {
      this.log('❌ JOB FAILED', `${data.name}: ${data.error}`, 'red');
    });

    this.manager.on('job:deadletter', (data) => {
      this.log('💀 DEAD LETTER', `${data.name}: ${data.reason}`, 'red');
    });

    // Schedule events
    this.manager.on('schedule:triggered', (data) => {
      this.log('⏰ SCHEDULE TRIGGERED', `${data.scheduleName} → Job ${data.jobId}`, 'cyan');
    });

    this.manager.on('qagate:scheduled', (data) => {
      this.log('🌙 NIGHTLY QA SCHEDULED', `Next run: ${data.nextRun}`, 'blue');
    });
  }

  registerHandlers() {
    // Success handler
    this.manager.registerHandler('demo_success', async (payload, job) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        message: `Successfully processed: ${payload.message}`
      };
    });

    // Failure handler (will retry)
    this.manager.registerHandler('demo_failure', async (payload, job) => {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fail first 2 attempts
      if (job.retries < 2) {
        throw new Error(`Simulated failure (attempt ${job.retries + 1})`);
      }

      // Succeed on third attempt
      return {
        success: true,
        message: 'Succeeded after retries'
      };
    });

    // Always fail handler (will dead letter)
    this.manager.registerHandler('demo_dead_letter', async (payload, job) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      throw new Error('This job always fails for demo purposes');
    });

    // Quick test handler
    this.manager.registerHandler('quick_test', async (payload, job) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { success: true, timestamp: new Date().toISOString() };
    });
  }

  async runDemo() {
    console.log(colors.bold + '\n╔═══════════════════════════════════════════════════════╗');
    console.log('║          QUEUE SYSTEM DEMO                             ║');
    console.log('╚═══════════════════════════════════════════════════════╝' + colors.reset);

    // Start processing
    this.manager.start();
    console.log(colors.green + '\n✓ Queue processing started' + colors.reset);

    // Demo 1: Successful job
    await this.demoSuccessfulJob();

    // Demo 2: Job with retries
    await this.demoRetryJob();

    // Demo 3: Dead letter job
    await this.demoDeadLetterJob();

    // Demo 4: Priority queue
    await this.demoPriorityQueue();

    // Demo 5: Scheduled job
    await this.demoScheduledJob();

    // Demo 6: Nightly QA gate
    await this.demoNightlyQAGate();

    // Show final status
    await this.showStatus();

    console.log(colors.green + colors.bold + '\n✅ DEMO COMPLETE' + colors.reset);
  }

  async demoSuccessfulJob() {
    console.log(colors.cyan + '\n--- Demo 1: Successful Job ---' + colors.reset);

    const jobId = await this.manager.enqueueJob({
      type: 'demo_success',
      name: 'Test Success Job',
      payload: { message: 'Hello Queue!' },
      priority: 'normal'
    });

    await this.waitForJob(jobId, 2000);
  }

  async demoRetryJob() {
    console.log(colors.cyan + '\n--- Demo 2: Job with Retries ---' + colors.reset);

    const jobId = await this.manager.enqueueJob({
      type: 'demo_failure',
      name: 'Test Retry Job',
      payload: { test: 'retry' },
      priority: 'normal',
      maxRetries: 3
    });

    await this.waitForJob(jobId, 8000);
  }

  async demoDeadLetterJob() {
    console.log(colors.cyan + '\n--- Demo 3: Dead Letter Queue ---' + colors.reset);

    const jobId = await this.manager.enqueueJob({
      type: 'demo_dead_letter',
      name: 'Test Dead Letter Job',
      payload: { test: 'always fails' },
      priority: 'normal',
      maxRetries: 2
    });

    await this.waitForJob(jobId, 6000);
  }

  async demoPriorityQueue() {
    console.log(colors.cyan + '\n--- Demo 4: Priority Queue ---' + colors.reset);

    // Enqueue multiple jobs with different priorities
    const jobs = [
      { priority: 'low', name: 'Low Priority Job' },
      { priority: 'critical', name: 'Critical Priority Job' },
      { priority: 'normal', name: 'Normal Priority Job' },
      { priority: 'high', name: 'High Priority Job' }
    ];

    console.log('Enqueueing jobs in order: low, critical, normal, high');

    for (const job of jobs) {
      await this.manager.enqueueJob({
        type: 'quick_test',
        name: job.name,
        priority: job.priority,
        payload: {}
      });
    }

    console.log('Watch execution order (should be: critical, high, normal, low)...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async demoScheduledJob() {
    console.log(colors.cyan + '\n--- Demo 5: Scheduled Job ---' + colors.reset);

    // Create a schedule that runs soon
    const scheduleId = await this.manager.scheduleJob({
      name: 'Demo Scheduled Task',
      description: 'Runs every minute for demo',
      cron: '@hourly', // Would be every hour in production
      job: {
        type: 'quick_test',
        priority: 'normal',
        payload: { scheduled: true }
      }
    });

    console.log(`Created schedule: ${scheduleId}`);

    // Manually trigger it for demo
    console.log('Manually triggering scheduled job...');
    await this.manager.scheduler.triggerNow(scheduleId);

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async demoNightlyQAGate() {
    console.log(colors.cyan + '\n--- Demo 6: Nightly QA Gate ---' + colors.reset);

    // Setup nightly QA gate
    const scheduleId = await this.manager.setupNightlyQAGate();

    console.log('Nightly QA Gate scheduled');

    // Manually trigger for demo
    console.log('Triggering QA Gate now for demo...');
    await this.manager.scheduler.triggerNow(scheduleId);

    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Show receipt
    const status = await this.manager.getStatus();
    console.log(colors.green + `\n✓ QA Gate completed - Check receipts in archive` + colors.reset);
    console.log(`  Archive today: ${status.archive.today} receipts`);
  }

  async showStatus() {
    console.log(colors.cyan + '\n--- System Status ---' + colors.reset);

    const status = await this.manager.getStatus();

    console.log('\n📊 QUEUE STATUS:');
    console.log(`  Pending: ${status.queue.pending}`);
    console.log(`  Active: ${status.queue.active}`);
    console.log(`  Workers: ${status.queue.workers}`);

    console.log('\n📅 SCHEDULES:');
    console.log(`  Total: ${status.schedules.count}`);
    console.log(`  Enabled: ${status.schedules.enabled}`);

    status.schedules.items.forEach(schedule => {
      console.log(`  - ${schedule.name}: ${schedule.cron} (next: ${schedule.nextRun})`);
    });

    console.log('\n💀 DEAD LETTER:');
    console.log(`  Failed jobs: ${status.deadLetter}`);

    console.log('\n📦 ARCHIVE:');
    console.log(`  Total receipts: ${status.archive.total}`);
    console.log(`  Today: ${status.archive.today}`);
  }

  async waitForJob(jobId, timeout) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

  log(label, message, color = 'reset') {
    const colorCode = colors[color] || colors.reset;
    console.log(colorCode + label + colors.reset + ': ' + message);
  }
}

// Run demo
async function main() {
  const demo = new QueueSystemDemo();

  try {
    await demo.initialize();
    await demo.runDemo();

    console.log(colors.yellow + '\nPress Ctrl+C to exit' + colors.reset);

  } catch (error) {
    console.error(colors.red + '\n❌ Demo error:', error.message + colors.reset);
    process.exit(1);
  }
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log(colors.yellow + '\n\nShutting down...' + colors.reset);
  process.exit(0);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}