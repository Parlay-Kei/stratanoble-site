/**
 * Job Scheduler v1.0
 * Cron-based job scheduling with triggers
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

export class JobScheduler extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      scheduleDir: config.scheduleDir || 'C:\\Dev\\.claude-anx\\queue\\schedules',
      checkInterval: config.checkInterval || 60000, // 1 minute
      ...config
    };

    this.schedules = new Map();
    this.running = false;
    this.jobQueue = null;
  }

  /**
   * Initialize scheduler
   */
  async initialize(jobQueue) {
    this.jobQueue = jobQueue;
    await fs.mkdir(this.config.scheduleDir, { recursive: true });
    await this.loadSchedules();
  }

  /**
   * Start scheduler
   */
  start() {
    if (this.running) return;

    this.running = true;
    this.emit('scheduler:started');

    this.checkSchedules();
    this.scheduleInterval = setInterval(() => {
      this.checkSchedules();
    }, this.config.checkInterval);
  }

  /**
   * Stop scheduler
   */
  stop() {
    if (!this.running) return;

    this.running = false;
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
    }

    this.emit('scheduler:stopped');
  }

  /**
   * Add scheduled job
   */
  async addSchedule(schedule) {
    const scheduleId = `SCH-${Date.now().toString(36).toUpperCase()}`;

    const scheduledJob = {
      id: scheduleId,
      name: schedule.name,
      description: schedule.description || '',
      cron: schedule.cron,
      job: schedule.job,
      enabled: schedule.enabled ?? true,
      lastRun: null,
      nextRun: this.calculateNextRun(schedule.cron),
      createdAt: new Date().toISOString(),
      metadata: schedule.metadata || {}
    };

    this.schedules.set(scheduleId, scheduledJob);
    await this.persistSchedule(scheduledJob);

    this.emit('schedule:added', {
      id: scheduleId,
      name: scheduledJob.name,
      nextRun: scheduledJob.nextRun
    });

    return scheduleId;
  }

  /**
   * Check schedules and trigger jobs
   */
  async checkSchedules() {
    const now = new Date();

    for (const [id, schedule] of this.schedules.entries()) {
      if (!schedule.enabled) continue;

      const nextRun = new Date(schedule.nextRun);

      if (nextRun <= now) {
        await this.triggerScheduledJob(schedule);
      }
    }
  }

  /**
   * Trigger scheduled job
   */
  async triggerScheduledJob(schedule) {
    try {
      // Enqueue job
      const jobId = await this.jobQueue.enqueue({
        type: schedule.job.type,
        name: `${schedule.name} (Scheduled)`,
        payload: schedule.job.payload,
        priority: schedule.job.priority || 'normal',
        maxRetries: schedule.job.maxRetries ?? 3,
        metadata: {
          ...schedule.job.metadata,
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          triggeredAt: new Date().toISOString()
        }
      });

      // Update schedule
      schedule.lastRun = new Date().toISOString();
      schedule.nextRun = this.calculateNextRun(schedule.cron);
      schedule.lastJobId = jobId;

      await this.persistSchedule(schedule);

      this.emit('schedule:triggered', {
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        jobId,
        nextRun: schedule.nextRun
      });

    } catch (error) {
      this.emit('schedule:error', {
        scheduleId: schedule.id,
        error: error.message
      });
    }
  }

  /**
   * Calculate next run time from cron expression
   */
  calculateNextRun(cronExpression) {
    const now = new Date();

    // Simple cron parser for common patterns
    const patterns = {
      '@hourly': () => {
        const next = new Date(now);
        next.setHours(next.getHours() + 1, 0, 0, 0);
        return next;
      },
      '@daily': () => {
        const next = new Date(now);
        next.setDate(next.getDate() + 1);
        next.setHours(0, 0, 0, 0);
        return next;
      },
      '@midnight': () => {
        const next = new Date(now);
        next.setDate(next.getDate() + 1);
        next.setHours(0, 0, 0, 0);
        return next;
      },
      '@weekly': () => {
        const next = new Date(now);
        next.setDate(next.getDate() + 7);
        next.setHours(0, 0, 0, 0);
        return next;
      },
      '@monthly': () => {
        const next = new Date(now);
        next.setMonth(next.getMonth() + 1, 1);
        next.setHours(0, 0, 0, 0);
        return next;
      }
    };

    // Check for preset patterns
    if (patterns[cronExpression]) {
      return patterns[cronExpression]().toISOString();
    }

    // Parse standard cron format (simplified)
    // Format: minute hour day month weekday
    const parts = cronExpression.split(' ');

    if (parts.length === 5) {
      const [minute, hour, day, month, weekday] = parts;
      const next = new Date(now);

      // Simple implementation for specific times
      if (minute !== '*' && hour !== '*') {
        const targetHour = parseInt(hour);
        const targetMinute = parseInt(minute);

        next.setHours(targetHour, targetMinute, 0, 0);

        // If time has passed today, move to tomorrow
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }

        return next.toISOString();
      }
    }

    // Default to next hour if can't parse
    const next = new Date(now);
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next.toISOString();
  }

  /**
   * Update schedule
   */
  async updateSchedule(scheduleId, updates) {
    const schedule = this.schedules.get(scheduleId);

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    Object.assign(schedule, updates, {
      updatedAt: new Date().toISOString()
    });

    if (updates.cron) {
      schedule.nextRun = this.calculateNextRun(updates.cron);
    }

    await this.persistSchedule(schedule);

    this.emit('schedule:updated', {
      id: scheduleId,
      name: schedule.name
    });

    return schedule;
  }

  /**
   * Enable/disable schedule
   */
  async setScheduleEnabled(scheduleId, enabled) {
    return await this.updateSchedule(scheduleId, { enabled });
  }

  /**
   * Delete schedule
   */
  async deleteSchedule(scheduleId) {
    const schedule = this.schedules.get(scheduleId);

    if (!schedule) {
      return false;
    }

    this.schedules.delete(scheduleId);

    const schedulePath = path.join(this.config.scheduleDir, `${scheduleId}.json`);
    await fs.unlink(schedulePath).catch(() => {});

    this.emit('schedule:deleted', {
      id: scheduleId,
      name: schedule.name
    });

    return true;
  }

  /**
   * Get all schedules
   */
  getSchedules() {
    return Array.from(this.schedules.values());
  }

  /**
   * Get schedule by ID
   */
  getSchedule(scheduleId) {
    return this.schedules.get(scheduleId);
  }

  /**
   * Persist schedule
   */
  async persistSchedule(schedule) {
    const schedulePath = path.join(this.config.scheduleDir, `${schedule.id}.json`);
    await fs.writeFile(schedulePath, JSON.stringify(schedule, null, 2));
  }

  /**
   * Load schedules from disk
   */
  async loadSchedules() {
    try {
      const files = await fs.readdir(this.config.scheduleDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const schedulePath = path.join(this.config.scheduleDir, file);
          const content = await fs.readFile(schedulePath, 'utf-8');
          const schedule = JSON.parse(content);

          this.schedules.set(schedule.id, schedule);
        }
      }

      this.emit('schedules:loaded', {
        count: this.schedules.size
      });

    } catch (error) {
      // Directory might not exist yet
    }
  }

  /**
   * Force trigger a schedule immediately
   */
  async triggerNow(scheduleId) {
    const schedule = this.schedules.get(scheduleId);

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    await this.triggerScheduledJob(schedule);

    return {
      scheduleId,
      triggered: true,
      nextRun: schedule.nextRun
    };
  }
}