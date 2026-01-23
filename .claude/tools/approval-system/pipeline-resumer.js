/**
 * Pipeline Resumer v1.0
 * Handles pipeline resume after approval with state restoration
 */

import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

export class PipelineResumer extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      stateDir: config.stateDir || 'C:\\Dev\\.claude-anx\\approvals\\states',
      resumeDir: config.resumeDir || 'C:\\Dev\\.claude-anx\\approvals\\resumes',
      logDir: config.logDir || 'C:\\Dev\\.claude-anx\\logs',
      ...config
    };

    this.activeResumes = new Map();
  }

  /**
   * Initialize resumer
   */
  async initialize() {
    await fs.mkdir(this.config.stateDir, { recursive: true });
    await fs.mkdir(this.config.resumeDir, { recursive: true });
    await fs.mkdir(this.config.logDir, { recursive: true });
  }

  /**
   * Resume pipeline with approval token
   */
  async resumeWithToken(requestId, token, tokenValidator) {
    try {
      // Validate token
      const validation = await tokenValidator.validateToken(token, requestId);

      if (!validation.valid) {
        throw new Error(`Invalid token: ${validation.reason}`);
      }

      // Load checkpoint state
      const state = await this.loadCheckpointState(requestId);

      if (!state) {
        throw new Error('Checkpoint state not found');
      }

      // Mark token as used
      await tokenValidator.useToken(token);

      // Create resume context
      const resumeContext = {
        requestId,
        token: token.substring(0, 20) + '...',
        approverId: validation.approverId,
        resumedAt: new Date().toISOString(),
        state,
        status: 'resuming'
      };

      // Start resume process
      const resumeResult = await this.executeResume(resumeContext);

      return {
        success: true,
        requestId,
        resumed: true,
        result: resumeResult
      };

    } catch (error) {
      this.emit('resume:failed', {
        requestId,
        error: error.message
      });

      return {
        success: false,
        requestId,
        error: error.message
      };
    }
  }

  /**
   * Resume with approval code
   */
  async resumeWithCode(requestId, code, tokenValidator) {
    try {
      // Validate code
      const validation = await tokenValidator.validateApprovalCode(code, requestId);

      if (!validation.valid) {
        throw new Error(`Invalid code: ${validation.reason}`);
      }

      // Load checkpoint state
      const state = await this.loadCheckpointState(requestId);

      if (!state) {
        throw new Error('Checkpoint state not found');
      }

      // Create resume context
      const resumeContext = {
        requestId,
        approvalCode: code,
        resumedAt: new Date().toISOString(),
        state,
        status: 'resuming'
      };

      // Start resume process
      const resumeResult = await this.executeResume(resumeContext);

      return {
        success: true,
        requestId,
        resumed: true,
        result: resumeResult
      };

    } catch (error) {
      this.emit('resume:failed', {
        requestId,
        error: error.message
      });

      return {
        success: false,
        requestId,
        error: error.message
      };
    }
  }

  /**
   * Execute pipeline resume
   */
  async executeResume(context) {
    const { requestId, state } = context;

    // Log resume start
    await this.logResume(requestId, 'START', context);

    this.emit('resume:started', {
      requestId,
      stage: state.stage,
      step: state.step
    });

    // Register active resume
    this.activeResumes.set(requestId, {
      context,
      startTime: Date.now(),
      status: 'running'
    });

    try {
      // Restore pipeline state
      const pipeline = await this.restorePipeline(state);

      // Execute remaining steps
      const results = await this.executeRemainingSteps(pipeline, state);

      // Complete resume
      this.activeResumes.delete(requestId);

      await this.logResume(requestId, 'COMPLETE', {
        ...context,
        results,
        duration: Date.now() - this.activeResumes.get(requestId)?.startTime
      });

      this.emit('resume:completed', {
        requestId,
        results
      });

      return {
        status: 'completed',
        stage: state.stage,
        completedSteps: results.completed,
        results: results.output
      };

    } catch (error) {
      // Handle resume error
      this.activeResumes.delete(requestId);

      await this.logResume(requestId, 'ERROR', {
        ...context,
        error: error.message,
        stack: error.stack
      });

      this.emit('resume:error', {
        requestId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Restore pipeline from checkpoint state
   */
  async restorePipeline(state) {
    return {
      stage: state.stage,
      currentStep: state.step,
      data: state.data || {},
      completed: state.completed || [],
      remaining: state.remaining || [],
      config: state.config || {},
      handlers: this.loadStageHandlers(state.stage)
    };
  }

  /**
   * Execute remaining pipeline steps
   */
  async executeRemainingSteps(pipeline, state) {
    const results = {
      completed: [],
      failed: [],
      output: {}
    };

    // Process remaining steps
    for (const step of pipeline.remaining) {
      try {
        this.emit('step:executing', {
          stage: pipeline.stage,
          step
        });

        // Execute step handler
        const stepResult = await this.executeStep(step, pipeline);

        results.completed.push({
          step,
          result: stepResult,
          timestamp: new Date().toISOString()
        });

        // Update pipeline data
        if (stepResult.data) {
          Object.assign(pipeline.data, stepResult.data);
        }

        this.emit('step:completed', {
          stage: pipeline.stage,
          step,
          result: stepResult
        });

      } catch (error) {
        results.failed.push({
          step,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        this.emit('step:failed', {
          stage: pipeline.stage,
          step,
          error: error.message
        });

        // Decide whether to continue or abort
        if (!pipeline.config.continueOnError) {
          throw error;
        }
      }
    }

    results.output = pipeline.data;
    return results;
  }

  /**
   * Execute individual step
   */
  async executeStep(step, pipeline) {
    // Look for step handler
    const handler = pipeline.handlers[step];

    if (!handler) {
      // Default step execution
      return await this.defaultStepHandler(step, pipeline);
    }

    // Execute custom handler
    return await handler(pipeline.data, pipeline.config);
  }

  /**
   * Default step handler
   */
  async defaultStepHandler(step, pipeline) {
    // Simulate step execution
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      step,
      status: 'completed',
      data: {
        [`${step}_result`]: `Completed at ${new Date().toISOString()}`
      }
    };
  }

  /**
   * Load stage handlers
   */
  loadStageHandlers(stage) {
    // This would load actual stage handlers in production
    // For now, return mock handlers
    return {
      validate: async (data) => ({
        status: 'validated',
        data: { validated: true }
      }),

      process: async (data) => ({
        status: 'processed',
        data: { processed: true }
      }),

      deploy: async (data) => ({
        status: 'deployed',
        data: { deployed: true }
      }),

      verify: async (data) => ({
        status: 'verified',
        data: { verified: true }
      })
    };
  }

  /**
   * Load checkpoint state
   */
  async loadCheckpointState(requestId) {
    try {
      const stateFile = path.join(
        this.config.stateDir,
        `${requestId}-state.json`
      );

      const content = await fs.readFile(stateFile, 'utf-8');
      return JSON.parse(content);

    } catch (error) {
      return null;
    }
  }

  /**
   * Save resume record
   */
  async saveResumeRecord(requestId, record) {
    const resumeFile = path.join(
      this.config.resumeDir,
      `${requestId}-resume.json`
    );

    await fs.writeFile(resumeFile, JSON.stringify(record, null, 2));
  }

  /**
   * Log resume activity
   */
  async logResume(requestId, action, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      action,
      details
    };

    const logFile = path.join(
      this.config.logDir,
      `resume-${new Date().toISOString().split('T')[0]}.log`
    );

    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.appendFile(logFile, logLine);

    // Also save resume record
    if (action === 'COMPLETE' || action === 'ERROR') {
      await this.saveResumeRecord(requestId, logEntry);
    }
  }

  /**
   * Get resume status
   */
  getResumeStatus(requestId) {
    const active = this.activeResumes.get(requestId);

    if (!active) {
      return null;
    }

    return {
      requestId,
      status: active.status,
      stage: active.context.state.stage,
      startTime: new Date(active.startTime).toISOString(),
      duration: Date.now() - active.startTime
    };
  }

  /**
   * Abort resume
   */
  async abortResume(requestId, reason) {
    const active = this.activeResumes.get(requestId);

    if (!active) {
      throw new Error('No active resume found');
    }

    this.activeResumes.delete(requestId);

    await this.logResume(requestId, 'ABORTED', {
      reason,
      abortedAt: new Date().toISOString()
    });

    this.emit('resume:aborted', {
      requestId,
      reason
    });

    return {
      requestId,
      aborted: true,
      reason
    };
  }
}