/**
 * Approval Token Manager v1.0
 * Generates and validates approval tokens for pipeline resume
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export class TokenManager {
  constructor(config = {}) {
    this.config = {
      secretKey: config.secretKey || process.env.APPROVAL_SECRET || 'dev-secret-key',
      tokenExpiry: config.tokenExpiry || 3600000, // 1 hour default
      algorithm: config.algorithm || 'HS256',
      storageDir: config.storageDir || 'C:\\Dev\\.claude-anx\\approvals\\tokens',
      ...config
    };

    this.tokens = new Map();
  }

  /**
   * Initialize token manager
   */
  async initialize() {
    await fs.mkdir(this.config.storageDir, { recursive: true });
    await this.loadTokens();
  }

  /**
   * Generate approval token
   * Format: APT-{TIMESTAMP}-{REQUESTID}-{HASH}-{SIGNATURE}
   */
  generateToken(requestId, approverId, metadata = {}) {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(8).toString('hex');

    // Create token payload
    const payload = {
      requestId,
      approverId,
      timestamp,
      nonce,
      expiresAt: timestamp + this.config.tokenExpiry,
      metadata
    };

    // Generate token components
    const tokenData = {
      header: 'APT',
      version: '1',
      timestamp: timestamp.toString(36), // Base36 for compactness
      requestId: requestId.substring(4, 12), // Extract core ID
      nonce: nonce.substring(0, 8)
    };

    // Create signature
    const signatureData = `${tokenData.timestamp}.${requestId}.${approverId}.${nonce}`;
    const signature = this.createSignature(signatureData);

    // Assemble token
    const token = `${tokenData.header}-${tokenData.version}-${tokenData.timestamp}-${tokenData.requestId}-${tokenData.nonce}-${signature.substring(0, 16)}`;

    // Store token data
    const tokenRecord = {
      token,
      payload,
      signature: signature,
      createdAt: new Date(timestamp).toISOString(),
      expiresAt: new Date(payload.expiresAt).toISOString(),
      used: false,
      usedAt: null
    };

    this.tokens.set(token, tokenRecord);
    this.saveToken(tokenRecord);

    return {
      token,
      expiresAt: tokenRecord.expiresAt,
      payload
    };
  }

  /**
   * Validate approval token
   */
  async validateToken(token, requestId) {
    // Check token format
    if (!this.isValidFormat(token)) {
      return {
        valid: false,
        reason: 'Invalid token format'
      };
    }

    // Check if token exists
    const tokenRecord = await this.getToken(token);
    if (!tokenRecord) {
      return {
        valid: false,
        reason: 'Token not found'
      };
    }

    // Check if already used
    if (tokenRecord.used) {
      return {
        valid: false,
        reason: 'Token already used',
        usedAt: tokenRecord.usedAt
      };
    }

    // Check expiration
    if (Date.now() > tokenRecord.payload.expiresAt) {
      return {
        valid: false,
        reason: 'Token expired',
        expiredAt: tokenRecord.expiresAt
      };
    }

    // Check request ID match
    if (tokenRecord.payload.requestId !== requestId) {
      return {
        valid: false,
        reason: 'Token not valid for this request'
      };
    }

    // Verify signature
    const parts = token.split('-');
    const timestamp = parseInt(parts[2], 36);
    const nonce = parts[4];
    const providedSignature = parts[5];

    const signatureData = `${parts[2]}.${tokenRecord.payload.requestId}.${tokenRecord.payload.approverId}.${nonce}`;
    const expectedSignature = this.createSignature(signatureData);

    if (!expectedSignature.startsWith(providedSignature)) {
      return {
        valid: false,
        reason: 'Invalid signature'
      };
    }

    return {
      valid: true,
      payload: tokenRecord.payload,
      approverId: tokenRecord.payload.approverId,
      metadata: tokenRecord.payload.metadata
    };
  }

  /**
   * Mark token as used
   */
  async useToken(token) {
    const tokenRecord = await this.getToken(token);

    if (!tokenRecord) {
      throw new Error('Token not found');
    }

    if (tokenRecord.used) {
      throw new Error('Token already used');
    }

    tokenRecord.used = true;
    tokenRecord.usedAt = new Date().toISOString();

    this.tokens.set(token, tokenRecord);
    await this.saveToken(tokenRecord);

    return tokenRecord;
  }

  /**
   * Generate one-time approval code (simpler format)
   */
  generateApprovalCode(requestId) {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const timestamp = Date.now();

    const codeRecord = {
      code,
      requestId,
      timestamp,
      expiresAt: timestamp + 300000, // 5 minutes
      used: false
    };

    // Store with code as key
    this.tokens.set(`CODE-${code}`, codeRecord);

    return {
      code,
      expiresIn: '5 minutes',
      instruction: `Enter approval code: ${code}`
    };
  }

  /**
   * Validate approval code
   */
  async validateApprovalCode(code, requestId) {
    const key = `CODE-${code.toUpperCase()}`;
    const codeRecord = this.tokens.get(key);

    if (!codeRecord) {
      return { valid: false, reason: 'Invalid code' };
    }

    if (codeRecord.used) {
      return { valid: false, reason: 'Code already used' };
    }

    if (Date.now() > codeRecord.expiresAt) {
      return { valid: false, reason: 'Code expired' };
    }

    if (codeRecord.requestId !== requestId) {
      return { valid: false, reason: 'Code not valid for this request' };
    }

    codeRecord.used = true;
    this.tokens.set(key, codeRecord);

    return { valid: true };
  }

  /**
   * Create HMAC signature
   */
  createSignature(data) {
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(data)
      .digest('hex');
  }

  /**
   * Check token format
   */
  isValidFormat(token) {
    // Format: APT-{VERSION}-{TIMESTAMP}-{REQUESTID}-{NONCE}-{SIGNATURE}
    const pattern = /^APT-\d-[a-z0-9]+-[A-Z0-9]{8}-[a-f0-9]{8}-[a-f0-9]{16}$/;
    return pattern.test(token);
  }

  /**
   * Get token record
   */
  async getToken(token) {
    // Check memory
    if (this.tokens.has(token)) {
      return this.tokens.get(token);
    }

    // Check storage
    try {
      const tokenFile = path.join(this.config.storageDir, `${token}.json`);
      const content = await fs.readFile(tokenFile, 'utf-8');
      const tokenRecord = JSON.parse(content);

      this.tokens.set(token, tokenRecord);
      return tokenRecord;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save token to storage
   */
  async saveToken(tokenRecord) {
    const tokenFile = path.join(this.config.storageDir, `${tokenRecord.token}.json`);
    await fs.writeFile(tokenFile, JSON.stringify(tokenRecord, null, 2));
  }

  /**
   * Load tokens from storage
   */
  async loadTokens() {
    try {
      const files = await fs.readdir(this.config.storageDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(
            path.join(this.config.storageDir, file),
            'utf-8'
          );
          const tokenRecord = JSON.parse(content);

          // Only load non-expired, unused tokens
          if (!tokenRecord.used && Date.now() < tokenRecord.payload.expiresAt) {
            this.tokens.set(tokenRecord.token, tokenRecord);
          }
        }
      }
    } catch (error) {
      // Directory might not exist yet
    }
  }

  /**
   * Clean expired tokens
   */
  async cleanupExpired() {
    const now = Date.now();
    let cleaned = 0;

    for (const [token, record] of this.tokens) {
      if (record.payload && record.payload.expiresAt < now) {
        this.tokens.delete(token);

        try {
          const tokenFile = path.join(this.config.storageDir, `${token}.json`);
          await fs.unlink(tokenFile);
          cleaned++;
        } catch (error) {
          // File might not exist
        }
      }
    }

    return cleaned;
  }

  /**
   * Generate approval URL
   */
  generateApprovalUrl(requestId, token) {
    const baseUrl = this.config.approvalUrl || 'http://localhost:3000/approve';
    const params = new URLSearchParams({
      request: requestId,
      token: token
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Create token summary
   */
  getTokenSummary(token) {
    const record = this.tokens.get(token);

    if (!record) {
      return null;
    }

    return {
      token: token.substring(0, 20) + '...',
      requestId: record.payload.requestId,
      approverId: record.payload.approverId,
      created: record.createdAt,
      expires: record.expiresAt,
      used: record.used,
      usedAt: record.usedAt
    };
  }
}