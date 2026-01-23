/**
 * Job Queue v1.0
 * Priority-based job queue with persistence
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter } from 'events';

export class JobQueue extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      queueDir: config.queueDir || 'C:\\Dev\\.claude-anx\\queue\\jobs',
      maxConcurrent: config.maxConcurrent || 3,
      pollInterval: config.pollInterval || 1000,
      staleTimeout: config.staleTimeout || 300000, // 5 minutes
      ...config
    };

    this.queue = [];
    this.activeJobs = new Map();
    this.processing = false;
    this.workers = [];
  }

  /**
   * Initialize queue
   */
  async initialize() {
    await fs.mkdir(this.config.queueDir, { recursive: true });
    await this.loadPersistedJobs();
    this.startProcessing();
  }

  /**
   * Enqueue a job
   */
  async enqueue(job) {
    const jobId = this.generateJobId();

    const queuedJob = {
      id: jobId,
      type: job.type,
      name: job.name || `Job-${jobId}`,
      payload: job.payload || {},
      priority: job.priority || 'normal',
      retries: 0,
      maxRetries: job.maxRetries ?? 3,
      timeout: job.timeout || 60000,
      createdAt: new Date().toISOString(),
      scheduledFor: job.scheduledFor || new Date().toISOString(),
      status: 'pending',
      attempts: [],
      metadata: job.metadata || {}
    };

    // Add to queue
    this.addToQueue(queuedJob);

    // Persist job
    await this.persistJob(queuedJob);

    this.emit('job:enqueued', {
      id: jobId,
      name: queuedJob.name,
      priority: queuedJob.priority
    });

    return jobId;
  }

  /**
   * Add job to queue maintaining priority order
   */
  addToQueue(job) {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    const jobPriority = priorityOrder[job.priority] || 2;

    // Find insertion point
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const queuedPriority = priorityOrder[this.queue[i].priority] || 2;
      if (jobPriority < queuedPriority) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, job);
  }

  /**
   * Start processing queue
   */
  startProcessing() {
    if (this.processing) return;

    this.processing = true;
    this.processLoop();
  }

  /**
   * Stop processing
   */
  stopProcessing() {
    this.processing = false;
  }

  /**
   * Process loop
   */
  async processLoop() {
    while (this.processing) {
      try {
        // Check for stale jobs
        await this.checkStaleJobs();

        // Process available jobs
        while (this.activeJobs.size < this.config.maxConcurrent && this.queue.length > 0) {
          const job = this.getNextJob();
          if (job) {
            this.processJob(job);
          }
        }
      } catch (error) {
        console.error('Queue process error:', error.message);
      }

      await new Promise(resolve => setTimeout(resolve, this.config.pollInterval));
    }
  }

  /**
   * Get next job respecting scheduled time
   */
  getNextJob() {
    const now = new Date();

    for (let i = 0; i < this.queue.length; i++) {
      const job = this.queue[i];
      const scheduledTime = new Date(job.scheduledFor);

      if (scheduledTime <= now) {
        return this.queue.splice(i, 1)[0];
      }
    }

    return null;
  }

  /**
   * Process a job
   */
  async processJob(job) {
    const startTime = Date.now();

    // Mark as active
    this.activeJobs.set(job.id, {
      job,
      startTime,
      worker: null
    });

    // Update status
    job.status = 'processing';
    job.startedAt = new Date().toISOString();
    await this.persistJob(job);

    this.emit('job:started', {
      id: job.id,
      name: job.name,
      type: job.type
    });

    try {
      // Execute job with timeout
      const result = await this.executeJobWithTimeout(job);

      // Mark as completed
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.duration = Date.now() - startTime;
      job.result = result;

      await this.persistJob(job);
      await this.archiveJob(job);

      this.activeJobs.delete(job.id);

      this.emit('job:completed', {
        id: job.id,
        name: job.name,
        duration: job.duration,
        result
      });

    } catch (error) {
      // Handle job failure
      await this.handleJobFailure(job, error, startTime);
    }
  }

  /**
   * Execute job with timeout
   */
  async executeJobWithTimeout(job) {
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        reject(new Error(`Job timeout after ${job.timeout}ms`));
      }, job.timeout);

      this.executeJob(job)
        .then(result => {
          clearTimeout(timeoutHandle);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutHandle);
          reject(error);
        });
    });
  }

  /**
   * Execute job (override in subclasses or provide handlers)
   */
  async executeJob(job) {
    // Look for registered handler
    const handler = this.config.handlers?.[job.type];

    if (handler) {
      return await handler(job.payload, job);
    }

    // Default mock execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: `Job ${job.name} completed` };
  }

  /**
   * Handle job failure
   */
  async handleJobFailure(job, error, startTime) {
    job.attempts.push({
      attemptNumber: job.retries + 1,
      startedAt: job.startedAt,
      failedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
      error: error.message,
      stack: error.stack
    });

    job.retries++;
    job.lastError = error.message;

    this.activeJobs.delete(job.id);

    if (job.retries < job.maxRetries) {
      // Schedule retry with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, job.retries), 60000);
      job.scheduledFor = new Date(Date.now() + delay).toISOString();
      job.status = 'retry_pending';

      this.addToQueue(job);
      await this.persistJob(job);

      this.emit('job:retry', {
        id: job.id,
        name: job.name,
        attempt: job.retries,
        nextRetry: job.scheduledFor
      });

    } else {
      // Send to dead letter queue
      job.status = 'failed';
      job.failedAt = new Date().toISOString();
      job.duration = Date.now() - startTime;

      await this.sendToDeadLetter(job);

      this.emit('job:failed', {
        id: job.id,
        name: job.name,
        attempts: job.retries,
        error: error.message
      });
    }
  }

  /**
   * Send job to dead letter queue
   */
  async sendToDeadLetter(job) {
    const deadLetterDir = path.join(this.config.queueDir, '..', 'dead-letter');
    await fs.mkdir(deadLetterDir, { recursive: true });

    const deadLetterPath = path.join(deadLetterDir, `${job.id}.json`);
    await fs.writeFile(deadLetterPath, JSON.stringify(job, null, 2));

    // Remove from regular queue
    const jobPath = path.join(this.config.queueDir, `${job.id}.json`);
    await fs.unlink(jobPath).catch(() => {});

    this.emit('job:deadletter', {
      id: job.id,
      name: job.name,
      reason: job.lastError
    });
  }

  /**
   * Check for stale jobs
   */
  async checkStaleJobs() {
    const now = Date.now();

    for (const [jobId, active] of this.activeJobs.entries()) {
      if (now - active.startTime > this.config.staleTimeout) {
        this.emit('job:stale', {
          id: jobId,
          duration: now - active.startTime
        });

        // Force fail the job
        const job = active.job;
        await this.handleJobFailure(
          job,
          new Error('Job stalled - exceeded stale timeout'),
          active.startTime
        );
      }
    }
  }

  /**
   * Archive completed job
   */
  async archiveJob(job) {
    const archiveDir = path.join(this.config.queueDir, '..', 'archive',
      new Date().toISOString().split('T')[0]);
    await fs.mkdir(archiveDir, { recursive: true });

    // Generate receipt
    const receipt = {
      ...job,
      receiptId: `RCP-${job.id}`,
      archivedAt: new Date().toISOString()
    };

    const receiptPath = path.join(archiveDir, `${job.id}-receipt.json`);
    await fs.writeFile(receiptPath, JSON.stringify(receipt, null, 2));

    // Remove from queue directory
    const jobPath = path.join(this.config.queueDir, `${job.id}.json`);
    await fs.unlink(jobPath).catch(() => {});

    return receiptPath;
  }

  /**
   * Persist job to disk
   */
  async persistJob(job) {
    const jobPath = path.join(this.config.queueDir, `${job.id}.json`);
    await fs.writeFile(jobPath, JSON.stringify(job, null, 2));
  }

  /**
   * Load persisted jobs on startup
   */
  async loadPersistedJobs() {
    try {
      const files = await fs.readdir(this.config.queueDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const jobPath = path.join(this.config.queueDir, file);
          const content = await fs.readFile(jobPath, 'utf-8');
          const job = JSON.parse(content);

          // Only load pending or retry jobs
          if (job.status === 'pending' || job.status === 'retry_pending') {
            this.addToQueue(job);
          } else if (job.status === 'processing') {
            // Reset stuck processing jobs
            job.status = 'pending';
            job.retries = (job.retries || 0) + 1;
            this.addToQueue(job);
          }
        }
      }

      this.emit('queue:loaded', {
        jobCount: this.queue.length
      });

    } catch (error) {
      // Directory might not exist yet
    }
  }

  /**
   * Generate job ID
   */
  generateJobId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `JOB-${timestamp}-${random}`;
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      pending: this.queue.length,
      active: this.activeJobs.size,
      processing: this.processing,
      workers: this.config.maxConcurrent,
      queue: this.queue.map(j => ({
        id: j.id,
        name: j.name,
        priority: j.priority,
        scheduledFor: j.scheduledFor
      }))
    };
  }

  /**
   * Get job by ID
   */
  async getJob(jobId) {
    // Check active
    const active = this.activeJobs.get(jobId);
    if (active) return active.job;

    // Check queue
    const queued = this.queue.find(j => j.id === jobId);
    if (queued) return queued;

    // Check persisted
    try {
      const jobPath = path.join(this.config.queueDir, `${jobId}.json`);
      const content = await fs.readFile(jobPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId) {
    // Check if active
    if (this.activeJobs.has(jobId)) {
      throw new Error('Cannot cancel active job');
    }

    // Remove from queue
    const index = this.queue.findIndex(j => j.id === jobId);
    if (index !== -1) {
      const job = this.queue.splice(index, 1)[0];
      job.status = 'cancelled';
      job.cancelledAt = new Date().toISOString();

      await this.archiveJob(job);

      this.emit('job:cancelled', {
        id: jobId,
        name: job.name
      });

      return true;
    }

    return false;
  }
}