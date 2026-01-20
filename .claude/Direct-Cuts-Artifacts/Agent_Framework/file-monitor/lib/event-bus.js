/**
 * Central Event Bus for File Monitor
 * Routes file system events to appropriate agents with priority queuing
 */

import { EventEmitter } from 'events';
import { getDatabase } from './database.js';

class FileMonitorEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
    this.db = getDatabase();
    this.queues = {
      critical: [],
      high: [],
      normal: [],
      low: []
    };
    this.processing = false;
    this.handlers = new Map();
  }

  /**
   * Register an agent handler for a specific trigger
   */
  registerHandler(trigger, handler) {
    this.handlers.set(trigger, handler);
    console.log(`[EventBus] Registered handler for: ${trigger}`);
  }

  /**
   * Queue an event for processing
   */
  queueEvent(event) {
    const priority = event.priority || 'normal';
    const eventWithId = {
      ...event,
      queuedAt: new Date(),
      eventId: this.db.logEvent(event)
    };

    this.queues[priority].push(eventWithId);
    this.emit('event:queued', eventWithId);

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }

    return eventWithId.eventId;
  }

  /**
   * Process events in priority order
   */
  async processQueue() {
    this.processing = true;

    while (this.hasEvents()) {
      // Process in priority order: critical -> high -> normal -> low
      const event = this.getNextEvent();

      if (event) {
        await this.processEvent(event);
      }
    }

    this.processing = false;
  }

  hasEvents() {
    return (
      this.queues.critical.length > 0 ||
      this.queues.high.length > 0 ||
      this.queues.normal.length > 0 ||
      this.queues.low.length > 0
    );
  }

  getNextEvent() {
    if (this.queues.critical.length > 0) return this.queues.critical.shift();
    if (this.queues.high.length > 0) return this.queues.high.shift();
    if (this.queues.normal.length > 0) return this.queues.normal.shift();
    if (this.queues.low.length > 0) return this.queues.low.shift();
    return null;
  }

  /**
   * Process a single event
   */
  async processEvent(event) {
    const handler = this.handlers.get(event.trigger);

    if (!handler) {
      console.warn(`[EventBus] No handler for trigger: ${event.trigger}`);
      this.db.markEventProcessed(event.eventId, 'skipped', 'No handler registered');
      return;
    }

    const runId = this.db.startAgentRun(event.trigger, event.eventId);

    try {
      this.emit('event:processing', event);
      const result = await handler(event);

      this.db.completeAgentRun(runId, true, JSON.stringify(result));
      this.db.markEventProcessed(event.eventId, 'success');
      this.emit('event:completed', { event, result });

    } catch (error) {
      const errorMessage = error.message || String(error);
      this.db.completeAgentRun(runId, false, null, errorMessage);
      this.db.markEventProcessed(event.eventId, 'error', errorMessage);
      this.emit('event:error', { event, error: errorMessage });

      console.error(`[EventBus] Error processing event:`, errorMessage);
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      processing: this.processing,
      queues: {
        critical: this.queues.critical.length,
        high: this.queues.high.length,
        normal: this.queues.normal.length,
        low: this.queues.low.length
      },
      handlers: Array.from(this.handlers.keys())
    };
  }

  /**
   * Clear all queues
   */
  clearQueues() {
    this.queues = {
      critical: [],
      high: [],
      normal: [],
      low: []
    };
  }
}

// Singleton instance
let instance = null;

export function getEventBus() {
  if (!instance) {
    instance = new FileMonitorEventBus();
  }
  return instance;
}

export default FileMonitorEventBus;
