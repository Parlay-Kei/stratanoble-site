#!/usr/bin/env node
/**
 * Approval Manager Service v1.0
 * Central service for managing approval workflows
 */

import { ApprovalCheckpoint } from './approval-checkpoint.js';
import { TokenManager } from './token-manager.js';
import { PipelineResumer } from './pipeline-resumer.js';
import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

export class ApprovalManager extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      baseDir: config.baseDir || 'C:\\Dev\\.claude-anx\\approvals',
      autoCleanup: config.autoCleanup ?? true,
      cleanupInterval: config.cleanupInterval || 3600000, // 1 hour
      notificationUrl: config.notificationUrl || null,
      ...config
    };

    this.checkpoint = null;
    this.tokenManager = null;
    this.resumer = null;
    this.initialized = false;
  }

  /**
   * Initialize approval system
   */
  async initialize() {
    if (this.initialized) return;

    // Ensure base directory exists
    await fs.mkdir(this.config.baseDir, { recursive: true });

    // Initialize components
    this.checkpoint = new ApprovalCheckpoint({
      checkpointDir: path.join(this.config.baseDir, 'checkpoints'),
      stateDir: path.join(this.config.baseDir, 'states')
    });
    await this.checkpoint.initialize();

    this.tokenManager = new TokenManager({
      storageDir: path.join(this.config.baseDir, 'tokens')
    });
    await this.tokenManager.initialize();

    this.resumer = new PipelineResumer({
      stateDir: path.join(this.config.baseDir, 'states'),
      resumeDir: path.join(this.config.baseDir, 'resumes')
    });
    await this.resumer.initialize();

    // Setup event forwarding
    this.setupEventHandlers();

    // Start cleanup if enabled
    if (this.config.autoCleanup) {
      this.startCleanup();
    }

    this.initialized = true;
  }

  /**
   * Request approval for high-risk operation
   */
  async requestApproval(options) {
    await this.ensureInitialized();

    // Create checkpoint
    const checkpoint = await this.checkpoint.createCheckpoint(options);

    // Generate approval token for each required approver
    const tokens = [];
    for (const approver of options.requiredApprovers || []) {
      const tokenResult = this.tokenManager.generateToken(
        checkpoint.requestId,
        approver.agentId || approver,
        { role: approver.role }
      );
      tokens.push({
        approver: approver.agentId || approver,
        token: tokenResult.token,
        expiresAt: tokenResult.expiresAt
      });
    }

    // Generate simple approval code as alternative
    const approvalCode = this.tokenManager.generateApprovalCode(checkpoint.requestId);

    // Create approval artifact
    const artifact = await this.createApprovalArtifact(
      checkpoint.requestId,
      checkpoint.approvalRequest,
      tokens,
      approvalCode
    );

    // Send notification if configured
    if (this.config.notificationUrl) {
      await this.sendNotification(checkpoint.requestId, artifact);
    }

    this.emit('approval:requested', {
      requestId: checkpoint.requestId,
      operation: options.operation,
      severity: options.severity
    });

    return {
      requestId: checkpoint.requestId,
      status: 'pending',
      artifact: artifact.path,
      approvalCode: approvalCode.code,
      tokens,
      message: `Approval required. Request ID: ${checkpoint.requestId}`,
      instructions: `
To approve:
1. Use approval code: ${approvalCode.code}
2. Or use token: approve ${checkpoint.requestId} <token>
3. Or visit: ${this.generateApprovalUrl(checkpoint.requestId)}
      `.trim()
    };
  }

  /**
   * Wait for approval (blocking call)
   */
  async waitForApproval(requestId, options = {}) {
    await this.ensureInitialized();

    this.emit('approval:waiting', { requestId });

    try {
      const result = await this.checkpoint.waitForApproval(requestId, options);

      this.emit('approval:received', {
        requestId,
        status: result.status
      });

      return result;

    } catch (error) {
      this.emit('approval:failed', {
        requestId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Approve request with token
   */
  async approveWithToken(requestId, token, approverId = 'system') {
    await this.ensureInitialized();

    // Validate token
    const validation = await this.tokenManager.validateToken(token, requestId);

    if (!validation.valid) {
      throw new Error(`Invalid token: ${validation.reason}`);
    }

    // Process approval
    const result = await this.checkpoint.processApproval(requestId, {
      approverId: validation.approverId || approverId,
      role: validation.metadata?.role || 'approver',
      decision: 'approve',
      token,
      comments: 'Approved via token'
    });

    // Mark token as used
    await this.tokenManager.useToken(token);

    this.emit('approval:processed', {
      requestId,
      decision: 'approve',
      approverId: validation.approverId
    });

    return result;
  }

  /**
   * Approve with code
   */
  async approveWithCode(requestId, code, approverId = 'system') {
    await this.ensureInitialized();

    // Validate code
    const validation = await this.tokenManager.validateApprovalCode(code, requestId);

    if (!validation.valid) {
      throw new Error(`Invalid code: ${validation.reason}`);
    }

    // Process approval
    const result = await this.checkpoint.processApproval(requestId, {
      approverId,
      decision: 'approve',
      token: `CODE-${code}`,
      comments: 'Approved via code'
    });

    this.emit('approval:processed', {
      requestId,
      decision: 'approve',
      method: 'code'
    });

    return result;
  }

  /**
   * Reject approval request
   */
  async reject(requestId, reason, rejecterId = 'system') {
    await this.ensureInitialized();

    const result = await this.checkpoint.processApproval(requestId, {
      approverId: rejecterId,
      decision: 'reject',
      token: 'REJECTED',
      comments: reason
    });

    this.emit('approval:processed', {
      requestId,
      decision: 'reject',
      reason
    });

    return result;
  }

  /**
   * Resume pipeline after approval
   */
  async resumePipeline(requestId, token) {
    await this.ensureInitialized();

    this.emit('pipeline:resuming', { requestId });

    const result = await this.resumer.resumeWithToken(
      requestId,
      token,
      this.tokenManager
    );

    if (result.success) {
      this.emit('pipeline:resumed', {
        requestId,
        result: result.result
      });
    } else {
      this.emit('pipeline:resume:failed', {
        requestId,
        error: result.error
      });
    }

    return result;
  }

  /**
   * Get approval status
   */
  async getStatus(requestId) {
    await this.ensureInitialized();

    const checkpointStatus = await this.checkpoint.getCheckpointStatus(requestId);
    const resumeStatus = this.resumer.getResumeStatus(requestId);

    return {
      checkpoint: checkpointStatus,
      resume: resumeStatus,
      overall: this.determineOverallStatus(checkpointStatus, resumeStatus)
    };
  }

  /**
   * Check if session is blocked
   */
  isBlocked(sessionId) {
    if (!this.initialized) return false;
    return this.checkpoint.isSessionBlocked(sessionId);
  }

  /**
   * Create approval artifact file
   */
  async createApprovalArtifact(requestId, request, tokens, approvalCode) {
    const artifact = {
      ...request,
      approvalTokens: tokens.map(t => ({
        approver: t.approver,
        token: t.token.substring(0, 20) + '...',
        expiresAt: t.expiresAt
      })),
      approvalCode: approvalCode.code,
      approvalUrl: this.generateApprovalUrl(requestId),
      generatedAt: new Date().toISOString()
    };

    const artifactPath = path.join(
      this.config.baseDir,
      'artifacts',
      `${requestId}.json`
    );

    await fs.mkdir(path.dirname(artifactPath), { recursive: true });
    await fs.writeFile(artifactPath, JSON.stringify(artifact, null, 2));

    // Also create markdown version
    const markdown = this.generateApprovalMarkdown(artifact);
    const mdPath = path.join(
      this.config.baseDir,
      'artifacts',
      `${requestId}.md`
    );
    await fs.writeFile(mdPath, markdown);

    return {
      path: artifactPath,
      mdPath,
      artifact
    };
  }

  /**
   * Generate approval markdown
   */
  generateApprovalMarkdown(artifact) {
    return `# Approval Request: ${artifact.requestId}

**Status**: ${artifact.status.toUpperCase()}
**Severity**: ${artifact.severity.toUpperCase()}
**Created**: ${artifact.createdAt}
**Expires**: ${artifact.approvalRequirements.expiresAt}

## Operation Details

**Operation**: ${artifact.context.operation}
**Target**: ${artifact.context.target}
**Requester**: ${artifact.requester.agentId} (${artifact.requester.skillName || 'unknown'})

## Reason
${artifact.context.reason}

## Risks
${artifact.context.risks.map(r => `- ${r}`).join('\n')}

## Impact
- **Scope**: ${artifact.context.impact.scope}
- **Users Affected**: ${artifact.context.impact.users}
- **Services**: ${artifact.context.impact.services.join(', ')}

## Rollback Plan
${artifact.context.rollbackPlan}

## Approval Requirements
- **Minimum Approvals**: ${artifact.approvalRequirements.minimumApprovals}
- **Required Approvers**: ${artifact.approvalRequirements.requiredApprovers.map(a => `${a.agentId} (${a.role})`).join(', ')}

## How to Approve

### Option 1: Use Approval Code
\`\`\`
${artifact.approvalCode}
\`\`\`

### Option 2: Use CLI
\`\`\`bash
approve ${artifact.requestId} --code ${artifact.approvalCode}
\`\`\`

### Option 3: Use Token
\`\`\`bash
approve ${artifact.requestId} --token <YOUR_TOKEN>
\`\`\`

### Option 4: Web Interface
${artifact.approvalUrl}

## Current State
\`\`\`json
${JSON.stringify(artifact.checkpointState, null, 2)}
\`\`\`

---
*Generated: ${artifact.generatedAt}*
*Request ID: ${artifact.requestId}*`;
  }

  /**
   * Generate approval URL
   */
  generateApprovalUrl(requestId) {
    const base = this.config.approvalUrl || 'http://localhost:3000/approvals';
    return `${base}/${requestId}`;
  }

  /**
   * Send notification
   */
  async sendNotification(requestId, artifact) {
    if (!this.config.notificationUrl) return;

    try {
      const response = await fetch(this.config.notificationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'approval_required',
          requestId,
          artifact: artifact.artifact,
          url: this.generateApprovalUrl(requestId)
        })
      });

      if (!response.ok) {
        console.warn(`Failed to send notification: ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`Failed to send notification: ${error.message}`);
    }
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Forward checkpoint events
    this.checkpoint.on('checkpoint:created', (data) => {
      this.emit('checkpoint:created', data);
    });

    this.checkpoint.on('checkpoint:approved', (data) => {
      this.emit('checkpoint:approved', data);
    });

    this.checkpoint.on('checkpoint:rejected', (data) => {
      this.emit('checkpoint:rejected', data);
    });

    // Forward resumer events
    this.resumer.on('resume:started', (data) => {
      this.emit('resume:started', data);
    });

    this.resumer.on('resume:completed', (data) => {
      this.emit('resume:completed', data);
    });

    this.resumer.on('step:executing', (data) => {
      this.emit('step:executing', data);
    });

    this.resumer.on('step:completed', (data) => {
      this.emit('step:completed', data);
    });
  }

  /**
   * Start cleanup process
   */
  startCleanup() {
    setInterval(async () => {
      try {
        const tokensCleaned = await this.tokenManager.cleanupExpired();
        if (tokensCleaned > 0) {
          this.emit('cleanup:tokens', { cleaned: tokensCleaned });
        }
      } catch (error) {
        console.error('Cleanup error:', error.message);
      }
    }, this.config.cleanupInterval);
  }

  /**
   * Determine overall status
   */
  determineOverallStatus(checkpointStatus, resumeStatus) {
    if (resumeStatus?.status === 'running') {
      return 'resuming';
    }
    if (checkpointStatus?.status === 'pending') {
      return 'blocked';
    }
    if (checkpointStatus?.status === 'approved') {
      return 'approved';
    }
    if (checkpointStatus?.status === 'rejected') {
      return 'rejected';
    }
    return 'unknown';
  }

  /**
   * Ensure initialized
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

// Export for use as module
export default ApprovalManager;