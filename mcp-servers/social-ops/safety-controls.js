/**
 * Safety Controls Module
 * Implements approval gates, rate limiting, and kill switches
 */

import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';

export class SafetyControls {
  constructor(config) {
    this.config = config;
    this.killSwitches = {
      linkedin: !config.linkedin?.enabled,
      tiktok: !config.tiktok?.enabled,
    };
    this.rateLimits = new Map();
    this.approvalCache = new Map();
  }

  /**
   * Check if platform is enabled (kill switch)
   */
  isPlatformEnabled(platform) {
    return !this.killSwitches[platform.toLowerCase()];
  }

  /**
   * Toggle kill switch for a platform
   */
  toggleKillSwitch(platform, enabled) {
    this.killSwitches[platform.toLowerCase()] = !enabled;
    return {
      platform,
      enabled: !this.killSwitches[platform.toLowerCase()],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check rate limit for platform
   */
  checkRateLimit(platform) {
    const now = Date.now();
    const platformLimits = this.rateLimits.get(platform) || [];

    // Remove entries older than 1 hour
    const recentRequests = platformLimits.filter(
      time => now - time < 3600000
    );

    // Check limits
    const limits = {
      linkedin: { hourly: 10, daily: 50 },
      tiktok: { hourly: 5, daily: 20 },
    };

    const platformLimit = limits[platform.toLowerCase()];
    if (!platformLimit) return { allowed: true };

    // Check hourly limit
    const lastHour = recentRequests.filter(
      time => now - time < 3600000
    );

    if (lastHour.length >= platformLimit.hourly) {
      return {
        allowed: false,
        reason: `Hourly limit reached (${platformLimit.hourly}/hour)`,
        resetIn: Math.ceil((lastHour[0] + 3600000 - now) / 60000),
      };
    }

    // Check daily limit
    const last24Hours = recentRequests.filter(
      time => now - time < 86400000
    );

    if (last24Hours.length >= platformLimit.daily) {
      return {
        allowed: false,
        reason: `Daily limit reached (${platformLimit.daily}/day)`,
        resetIn: Math.ceil((last24Hours[0] + 86400000 - now) / 60000),
      };
    }

    // Add current request
    recentRequests.push(now);
    this.rateLimits.set(platform, recentRequests);

    return { allowed: true };
  }

  /**
   * Request approval for a post
   */
  async requestApproval(postId, content, platform) {
    const approvalRequest = {
      id: crypto.randomBytes(8).toString('hex'),
      postId,
      content,
      platform,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    this.approvalCache.set(approvalRequest.id, approvalRequest);

    // In production, this would trigger notification/webhook
    console.log(`Approval requested for ${platform} post:`, approvalRequest.id);

    return approvalRequest;
  }

  /**
   * Check approval status
   */
  async checkApproval(approvalId) {
    const approval = this.approvalCache.get(approvalId);
    if (!approval) {
      return { approved: false, reason: 'Approval request not found' };
    }

    // Check Notion-based approval if configured
    if (this.config.approval?.method === 'notion' && approval.postId) {
      // This would check Notion API for approval status
      // Simplified for v1
      return {
        approved: approval.status === 'approved',
        approvedBy: approval.approvedBy,
        approvedAt: approval.approvedAt,
      };
    }

    return {
      approved: approval.status === 'approved',
      approvedBy: approval.approvedBy,
      approvedAt: approval.approvedAt,
    };
  }

  /**
   * Grant approval (for testing/manual approval)
   */
  grantApproval(approvalId, approvedBy = 'system') {
    const approval = this.approvalCache.get(approvalId);
    if (!approval) {
      return { success: false, error: 'Approval request not found' };
    }

    approval.status = 'approved';
    approval.approvedBy = approvedBy;
    approval.approvedAt = new Date().toISOString();

    this.approvalCache.set(approvalId, approval);

    return {
      success: true,
      approval,
    };
  }

  /**
   * Validate content for safety
   */
  validateContent(content, platform) {
    const issues = [];

    // Check content length
    const maxLengths = {
      linkedin: 3000,
      tiktok: 2200,
    };

    const maxLength = maxLengths[platform.toLowerCase()];
    if (maxLength && content.length > maxLength) {
      issues.push({
        type: 'warning',
        message: `Content exceeds ${platform} limit (${content.length}/${maxLength} chars)`,
      });
    }

    // Check for potentially sensitive content patterns
    const sensitivePatterns = [
      { pattern: /\b(password|token|api[_\s]?key|secret)\b/gi, message: 'Potential credential detected' },
      { pattern: /(https?:\/\/[^\s]+\.(exe|bat|sh|ps1))/gi, message: 'Executable URL detected' },
      { pattern: /\b(hack|exploit|bypass)\b/gi, message: 'Potentially suspicious terminology' },
    ];

    sensitivePatterns.forEach(({ pattern, message }) => {
      if (pattern.test(content)) {
        issues.push({
          type: 'warning',
          message,
        });
      }
    });

    // Check for required approvals based on content
    const requiresApproval = issues.some(issue => issue.type === 'warning');

    return {
      valid: issues.length === 0,
      issues,
      requiresApproval,
    };
  }

  /**
   * Create audit log entry
   */
  async logAction(action, platform, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      platform,
      details,
      environment: {
        dryRun: this.config.dryRun,
        node: process.version,
      },
    };

    // Write to audit log
    const logDir = path.join(process.cwd(), 'audit-logs');
    await fs.ensureDir(logDir);

    const logFile = path.join(
      logDir,
      `${platform}_${new Date().toISOString().split('T')[0]}.jsonl`
    );

    await fs.appendFile(
      logFile,
      JSON.stringify(logEntry) + '\n'
    );

    return logEntry;
  }

  /**
   * Emergency stop - disable all platforms
   */
  emergencyStop() {
    Object.keys(this.killSwitches).forEach(platform => {
      this.killSwitches[platform] = true;
    });

    this.logAction('emergency_stop', 'all', {
      message: 'All platforms disabled via emergency stop',
    });

    return {
      success: true,
      message: 'All platforms disabled',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get safety status report
   */
  getStatus() {
    const platformStatus = {};

    Object.keys(this.killSwitches).forEach(platform => {
      const rateLimit = this.checkRateLimit(platform);
      platformStatus[platform] = {
        enabled: !this.killSwitches[platform],
        rateLimit: rateLimit.allowed ? 'ok' : rateLimit.reason,
        pendingApprovals: Array.from(this.approvalCache.values())
          .filter(a => a.platform === platform && a.status === 'pending')
          .length,
      };
    });

    return {
      dryRun: this.config.dryRun,
      platforms: platformStatus,
      totalPendingApprovals: Array.from(this.approvalCache.values())
        .filter(a => a.status === 'pending').length,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Approval Gate Interface
 */
export class ApprovalGate {
  constructor(notionClient, config) {
    this.notion = notionClient;
    this.config = config;
  }

  /**
   * Check if post is approved in Notion
   */
  async checkNotionApproval(pageId) {
    if (!this.notion) {
      return { approved: false, reason: 'Notion not configured' };
    }

    try {
      const page = await this.notion.pages.retrieve({ page_id: pageId });

      // Check multiple possible approval fields
      const approvalStatus =
        page.properties?.['Approval Status']?.select?.name ||
        page.properties?.['Status']?.select?.name;

      const approved =
        approvalStatus === 'Approved' ||
        approvalStatus === 'Ready to Post';

      return {
        approved,
        status: approvalStatus,
        approvedBy: page.properties?.['Approved By']?.rich_text?.[0]?.text?.content,
        approvedAt: page.properties?.['Approved At']?.date?.start,
      };
    } catch (error) {
      return {
        approved: false,
        reason: `Notion error: ${error.message}`,
      };
    }
  }

  /**
   * Request approval via Notion
   */
  async requestNotionApproval(pageId, message) {
    if (!this.notion) {
      return { success: false, error: 'Notion not configured' };
    }

    try {
      await this.notion.pages.update({
        page_id: pageId,
        properties: {
          'Approval Status': {
            select: { name: 'Pending Approval' },
          },
          'Approval Request': {
            rich_text: [{
              text: { content: message || 'Approval requested for posting' },
            }],
          },
          'Requested At': {
            date: { start: new Date().toISOString() },
          },
        },
      });

      return { success: true, pageId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Wait for approval with timeout
   */
  async waitForApproval(pageId, timeoutMs = 300000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const approval = await this.checkNotionApproval(pageId);

      if (approval.approved) {
        return { approved: true, ...approval };
      }

      if (approval.status === 'Rejected' || approval.status === 'Cancelled') {
        return {
          approved: false,
          reason: `Post ${approval.status.toLowerCase()}`,
        };
      }

      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    return {
      approved: false,
      reason: 'Approval timeout',
    };
  }
}

export default { SafetyControls, ApprovalGate };