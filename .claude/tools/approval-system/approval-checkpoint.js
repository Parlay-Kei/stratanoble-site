/**
 * Approval Checkpoint v1.0
 * Implements blocking checkpoints that pause execution until approved
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter } from 'events';

export class ApprovalCheckpoint extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      checkpointDir: config.checkpointDir || 'C:\\Dev\\.claude-anx\\approvals\\checkpoints',
      stateDir: config.stateDir || 'C:\\Dev\\.claude-anx\\approvals\\states',
      timeout: config.timeout || 3600000, // 1 hour default
      pollInterval: config.pollInterval || 5000, // 5 seconds
      autoReject: config.autoReject || false,
      ...config
    };

    this.activeCheckpoints = new Map();
    this.blockedSessions = new Map();
  }

  /**
   * Initialize checkpoint system
   */
  async initialize() {
    await fs.mkdir(this.config.checkpointDir, { recursive: true });
    await fs.mkdir(this.config.stateDir, { recursive: true });
    await this.loadCheckpoints();
  }

  /**
   * Create approval checkpoint
   */
  async createCheckpoint(options) {
    const {
      sessionId,
      ticketId,
      operation,
      severity = 'medium',
      reason,
      risks = [],
      requiredApprovers = [],
      minApprovals = 1,
      state = {}
    } = options;

    // Generate request ID
    const requestId = this.generateRequestId();

    // Create approval request
    const approvalRequest = {
      requestId,
      ticketId,
      sessionId,
      requestType: this.determineRequestType(operation),
      severity,
      requester: {
        agentId: options.agentId || 'system',
        skillName: options.skillName || 'unknown',
        timestamp: new Date().toISOString()
      },
      context: {
        operation,
        target: options.target || 'unknown',
        reason,
        risks,
        impact: options.impact || {
          scope: 'local',
          users: 0,
          services: []
        },
        rollbackPlan: options.rollbackPlan || 'Manual rollback required'
      },
      approvalRequirements: {
        requiredApprovers: requiredApprovers.map(a => ({
          role: a.role || 'approver',
          agentId: a.agentId || a,
          optional: a.optional || false
        })),
        minimumApprovals: minApprovals,
        expiresAt: new Date(Date.now() + this.config.timeout).toISOString(),
        autoApproveAfter: options.autoApproveAfter || null
      },
      checkpointState: {
        stage: state.stage || 'unknown',
        step: state.step || 0,
        data: state.data || {},
        completed: state.completed || [],
        remaining: state.remaining || []
      },
      status: 'pending',
      approvals: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save checkpoint
    await this.saveCheckpoint(approvalRequest);

    // Register active checkpoint
    this.activeCheckpoints.set(requestId, {
      request: approvalRequest,
      blocked: true,
      startTime: Date.now(),
      pollHandle: null
    });

    // Block the session
    this.blockedSessions.set(sessionId, requestId);

    // Emit checkpoint created event
    this.emit('checkpoint:created', {
      requestId,
      sessionId,
      operation,
      severity
    });

    return {
      requestId,
      status: 'blocked',
      approvalRequest,
      message: `Pipeline blocked pending approval. Request ID: ${requestId}`
    };
  }

  /**
   * Wait for approval (blocking)
   */
  async waitForApproval(requestId, options = {}) {
    const timeout = options.timeout || this.config.timeout;
    const pollInterval = options.pollInterval || this.config.pollInterval;
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkApproval = async () => {
        try {
          // Check if timeout exceeded
          if (Date.now() - startTime > timeout) {
            await this.expireCheckpoint(requestId);

            if (this.config.autoReject) {
              reject({
                status: 'rejected',
                reason: 'Approval timeout exceeded',
                requestId
              });
            } else {
              reject({
                status: 'expired',
                reason: 'Approval request expired',
                requestId
              });
            }
            return;
          }

          // Load current checkpoint state
          const checkpoint = await this.loadCheckpoint(requestId);

          if (!checkpoint) {
            reject({
              status: 'error',
              reason: 'Checkpoint not found',
              requestId
            });
            return;
          }

          // Check status
          if (checkpoint.status === 'approved') {
            // Clear blocking state
            this.clearCheckpoint(requestId);

            resolve({
              status: 'approved',
              requestId,
              approvals: checkpoint.approvals,
              checkpointState: checkpoint.checkpointState,
              canProceed: true
            });
            return;
          }

          if (checkpoint.status === 'rejected') {
            // Clear blocking state
            this.clearCheckpoint(requestId);

            reject({
              status: 'rejected',
              reason: checkpoint.rejectionReason || 'Approval denied',
              requestId,
              approvals: checkpoint.approvals
            });
            return;
          }

          // Continue polling
          setTimeout(checkApproval, pollInterval);

        } catch (error) {
          reject({
            status: 'error',
            reason: error.message,
            requestId
          });
        }
      };

      // Start polling
      checkApproval();
    });
  }

  /**
   * Process approval
   */
  async processApproval(requestId, approval) {
    const checkpoint = await this.loadCheckpoint(requestId);

    if (!checkpoint) {
      throw new Error('Checkpoint not found');
    }

    if (checkpoint.status !== 'pending') {
      throw new Error(`Checkpoint already ${checkpoint.status}`);
    }

    // Add approval
    checkpoint.approvals.push({
      approverId: approval.approverId,
      role: approval.role || 'approver',
      decision: approval.decision,
      token: approval.token,
      timestamp: new Date().toISOString(),
      comments: approval.comments || ''
    });

    // Check if requirements met
    const approved = this.checkApprovalRequirements(checkpoint);

    if (approved) {
      checkpoint.status = 'approved';
      checkpoint.updatedAt = new Date().toISOString();

      this.emit('checkpoint:approved', {
        requestId,
        approvals: checkpoint.approvals
      });
    } else if (approval.decision === 'reject') {
      checkpoint.status = 'rejected';
      checkpoint.rejectionReason = approval.comments || 'Approval denied';
      checkpoint.updatedAt = new Date().toISOString();

      this.emit('checkpoint:rejected', {
        requestId,
        reason: checkpoint.rejectionReason
      });
    }

    // Save updated checkpoint
    await this.saveCheckpoint(checkpoint);

    return {
      requestId,
      status: checkpoint.status,
      approvalsReceived: checkpoint.approvals.length,
      approvalsRequired: checkpoint.approvalRequirements.minimumApprovals,
      canProceed: checkpoint.status === 'approved'
    };
  }

  /**
   * Check if approval requirements are met
   */
  checkApprovalRequirements(checkpoint) {
    const requirements = checkpoint.approvalRequirements;
    const approvals = checkpoint.approvals.filter(a => a.decision === 'approve');

    // Check minimum approvals
    if (approvals.length < requirements.minimumApprovals) {
      return false;
    }

    // Check required approvers
    for (const required of requirements.requiredApprovers) {
      if (!required.optional) {
        const hasApproval = approvals.some(a =>
          a.agentId === required.agentId || a.role === required.role
        );

        if (!hasApproval) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Resume checkpoint with token
   */
  async resumeWithToken(requestId, token, approverId) {
    // Process as approval
    return await this.processApproval(requestId, {
      approverId,
      decision: 'approve',
      token,
      comments: 'Resumed with valid token'
    });
  }

  /**
   * Force bypass checkpoint (emergency)
   */
  async forceBypass(requestId, bypassReason, bypasserId) {
    const checkpoint = await this.loadCheckpoint(requestId);

    if (!checkpoint) {
      throw new Error('Checkpoint not found');
    }

    checkpoint.status = 'bypassed';
    checkpoint.bypassReason = bypassReason;
    checkpoint.bypasserId = bypasserId;
    checkpoint.bypassedAt = new Date().toISOString();
    checkpoint.updatedAt = new Date().toISOString();

    await this.saveCheckpoint(checkpoint);

    this.emit('checkpoint:bypassed', {
      requestId,
      reason: bypassReason,
      bypasserId
    });

    this.clearCheckpoint(requestId);

    return {
      requestId,
      status: 'bypassed',
      canProceed: true
    };
  }

  /**
   * Expire checkpoint
   */
  async expireCheckpoint(requestId) {
    const checkpoint = await this.loadCheckpoint(requestId);

    if (checkpoint && checkpoint.status === 'pending') {
      checkpoint.status = 'expired';
      checkpoint.expiredAt = new Date().toISOString();
      checkpoint.updatedAt = new Date().toISOString();

      await this.saveCheckpoint(checkpoint);

      this.emit('checkpoint:expired', { requestId });
    }
  }

  /**
   * Clear checkpoint from active tracking
   */
  clearCheckpoint(requestId) {
    const active = this.activeCheckpoints.get(requestId);

    if (active) {
      if (active.pollHandle) {
        clearInterval(active.pollHandle);
      }

      // Remove session block
      if (active.request.sessionId) {
        this.blockedSessions.delete(active.request.sessionId);
      }

      this.activeCheckpoints.delete(requestId);
    }
  }

  /**
   * Check if session is blocked
   */
  isSessionBlocked(sessionId) {
    return this.blockedSessions.has(sessionId);
  }

  /**
   * Get blocking checkpoint for session
   */
  getSessionCheckpoint(sessionId) {
    const requestId = this.blockedSessions.get(sessionId);

    if (!requestId) {
      return null;
    }

    const active = this.activeCheckpoints.get(requestId);
    return active ? active.request : null;
  }

  /**
   * Generate request ID
   */
  generateRequestId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `APR-${timestamp}-${random}`;
  }

  /**
   * Determine request type from operation
   */
  determineRequestType(operation) {
    const operationLower = operation.toLowerCase();

    if (operationLower.includes('deploy') || operationLower.includes('release')) {
      return 'deployment';
    }
    if (operationLower.includes('delete') || operationLower.includes('remove')) {
      return 'data_deletion';
    }
    if (operationLower.includes('security') || operationLower.includes('auth')) {
      return 'security_change';
    }
    if (operationLower.includes('production') || operationLower.includes('prod')) {
      return 'production_access';
    }
    if (operationLower.includes('financial') || operationLower.includes('payment')) {
      return 'financial';
    }
    if (operationLower.includes('contract') || operationLower.includes('agreement')) {
      return 'contract_approval';
    }

    return 'high_risk_operation';
  }

  /**
   * Save checkpoint to disk
   */
  async saveCheckpoint(checkpoint) {
    const checkpointFile = path.join(
      this.config.checkpointDir,
      `${checkpoint.requestId}.json`
    );

    await fs.writeFile(checkpointFile, JSON.stringify(checkpoint, null, 2));

    // Also save state separately
    if (checkpoint.checkpointState) {
      const stateFile = path.join(
        this.config.stateDir,
        `${checkpoint.requestId}-state.json`
      );
      await fs.writeFile(stateFile, JSON.stringify(checkpoint.checkpointState, null, 2));
    }
  }

  /**
   * Load checkpoint from disk
   */
  async loadCheckpoint(requestId) {
    try {
      const checkpointFile = path.join(
        this.config.checkpointDir,
        `${requestId}.json`
      );

      const content = await fs.readFile(checkpointFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Load all checkpoints
   */
  async loadCheckpoints() {
    try {
      const files = await fs.readdir(this.config.checkpointDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(
            path.join(this.config.checkpointDir, file),
            'utf-8'
          );
          const checkpoint = JSON.parse(content);

          // Only load pending checkpoints
          if (checkpoint.status === 'pending') {
            this.activeCheckpoints.set(checkpoint.requestId, {
              request: checkpoint,
              blocked: true,
              startTime: Date.now()
            });

            if (checkpoint.sessionId) {
              this.blockedSessions.set(checkpoint.sessionId, checkpoint.requestId);
            }
          }
        }
      }
    } catch (error) {
      // Directory might not exist yet
    }
  }

  /**
   * Get checkpoint status
   */
  async getCheckpointStatus(requestId) {
    const checkpoint = await this.loadCheckpoint(requestId);

    if (!checkpoint) {
      return null;
    }

    return {
      requestId,
      status: checkpoint.status,
      severity: checkpoint.severity,
      operation: checkpoint.context.operation,
      createdAt: checkpoint.createdAt,
      approvalsReceived: checkpoint.approvals.length,
      approvalsRequired: checkpoint.approvalRequirements.minimumApprovals,
      expiresAt: checkpoint.approvalRequirements.expiresAt,
      canProceed: checkpoint.status === 'approved' || checkpoint.status === 'bypassed'
    };
  }
}