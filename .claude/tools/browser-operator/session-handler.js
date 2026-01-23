/**
 * Session Handler v1.0
 * Manages browser sessions, authentication persistence, and secure credential storage
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class SessionHandler {
  constructor(config = {}) {
    this.config = {
      sessionDir: config.sessionDir || 'C:\\Dev\\.claude-anx\\browser-sessions',
      credentialDir: config.credentialDir || 'C:\\Dev\\.claude-anx\\credentials',
      maxSessionAge: config.maxSessionAge || 7 * 24 * 60 * 60 * 1000, // 7 days
      encryptionKey: config.encryptionKey || process.env.BROWSER_SESSION_KEY,
      ...config
    };

    this.sessions = new Map();
  }

  /**
   * Initialize session handler
   */
  async initialize() {
    // Ensure directories exist
    await fs.mkdir(this.config.sessionDir, { recursive: true });
    await fs.mkdir(this.config.credentialDir, { recursive: true });

    // Load existing sessions
    await this.loadSessions();
  }

  /**
   * Create new session
   */
  async createSession(platform, identifier, metadata = {}) {
    const sessionId = this.generateSessionId(platform, identifier);

    const session = {
      id: sessionId,
      platform,
      identifier,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      metadata,
      state: 'active',
      cookies: [],
      localStorage: {},
      sessionStorage: {}
    };

    this.sessions.set(sessionId, session);
    await this.saveSession(session);

    return session;
  }

  /**
   * Get session by ID or platform/identifier
   */
  async getSession(platformOrId, identifier = null) {
    let sessionId;

    if (identifier) {
      sessionId = this.generateSessionId(platformOrId, identifier);
    } else {
      sessionId = platformOrId;
    }

    // Check memory cache
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId);

      // Check if expired
      if (this.isSessionExpired(session)) {
        await this.removeSession(sessionId);
        return null;
      }

      // Update last used
      session.lastUsed = new Date().toISOString();
      await this.saveSession(session);

      return session;
    }

    // Try to load from disk
    try {
      const sessionPath = path.join(this.config.sessionDir, `${sessionId}.json`);
      const content = await fs.readFile(sessionPath, 'utf-8');
      const session = JSON.parse(content);

      if (this.isSessionExpired(session)) {
        await this.removeSession(sessionId);
        return null;
      }

      this.sessions.set(sessionId, session);
      return session;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update session data
   */
  async updateSession(sessionId, updates) {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    Object.assign(session, updates, {
      lastUsed: new Date().toISOString()
    });

    await this.saveSession(session);
    return session;
  }

  /**
   * Store cookies for session
   */
  async storeCookies(sessionId, cookies) {
    return await this.updateSession(sessionId, { cookies });
  }

  /**
   * Store localStorage data
   */
  async storeLocalStorage(sessionId, localStorage) {
    return await this.updateSession(sessionId, { localStorage });
  }

  /**
   * Store credentials securely
   */
  async storeCredentials(platform, identifier, credentials) {
    const credentialId = this.generateSessionId(platform, identifier);
    const encryptedCreds = this.encrypt(JSON.stringify(credentials));

    const credentialData = {
      id: credentialId,
      platform,
      identifier,
      encrypted: encryptedCreds,
      storedAt: new Date().toISOString()
    };

    const credPath = path.join(this.config.credentialDir, `${credentialId}.enc`);
    await fs.writeFile(credPath, JSON.stringify(credentialData, null, 2));

    return credentialId;
  }

  /**
   * Retrieve credentials
   */
  async getCredentials(platform, identifier) {
    const credentialId = this.generateSessionId(platform, identifier);
    const credPath = path.join(this.config.credentialDir, `${credentialId}.enc`);

    try {
      const content = await fs.readFile(credPath, 'utf-8');
      const credentialData = JSON.parse(content);

      const decrypted = this.decrypt(credentialData.encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      return null;
    }
  }

  /**
   * Session recovery strategy
   */
  async recoverSession(platform, identifier, browserContext) {
    const session = await this.getSession(platform, identifier);

    if (!session) {
      return {
        recovered: false,
        reason: 'No saved session found'
      };
    }

    try {
      // Restore cookies
      if (session.cookies && session.cookies.length > 0) {
        await browserContext.addCookies(session.cookies);
      }

      // Restore localStorage (requires page context)
      if (session.localStorage && Object.keys(session.localStorage).length > 0) {
        const page = browserContext.pages()[0] || await browserContext.newPage();

        // Navigate to platform base URL to set localStorage
        const baseUrl = this.getPlatformBaseUrl(platform);
        if (baseUrl) {
          await page.goto(baseUrl);

          await page.evaluate((storage) => {
            Object.entries(storage).forEach(([key, value]) => {
              localStorage.setItem(key, value);
            });
          }, session.localStorage);
        }
      }

      return {
        recovered: true,
        sessionId: session.id,
        lastUsed: session.lastUsed
      };

    } catch (error) {
      return {
        recovered: false,
        reason: error.message
      };
    }
  }

  /**
   * Clear expired sessions
   */
  async cleanupSessions() {
    const sessions = await this.loadSessions();
    let cleaned = 0;

    for (const [sessionId, session] of sessions) {
      if (this.isSessionExpired(session)) {
        await this.removeSession(sessionId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Remove specific session
   */
  async removeSession(sessionId) {
    this.sessions.delete(sessionId);

    try {
      const sessionPath = path.join(this.config.sessionDir, `${sessionId}.json`);
      await fs.unlink(sessionPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }

  /**
   * Generate session ID
   */
  generateSessionId(platform, identifier) {
    return `${platform}_${identifier}_${crypto
      .createHash('md5')
      .update(`${platform}:${identifier}`)
      .digest('hex')
      .substring(0, 8)}`;
  }

  /**
   * Check if session is expired
   */
  isSessionExpired(session) {
    const lastUsed = new Date(session.lastUsed);
    const now = new Date();
    return (now - lastUsed) > this.config.maxSessionAge;
  }

  /**
   * Save session to disk
   */
  async saveSession(session) {
    const sessionPath = path.join(this.config.sessionDir, `${session.id}.json`);
    await fs.writeFile(sessionPath, JSON.stringify(session, null, 2));
  }

  /**
   * Load all sessions from disk
   */
  async loadSessions() {
    try {
      const files = await fs.readdir(this.config.sessionDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(
            path.join(this.config.sessionDir, file),
            'utf-8'
          );
          const session = JSON.parse(content);

          if (!this.isSessionExpired(session)) {
            this.sessions.set(session.id, session);
          }
        }
      }
    } catch (error) {
      // Directory might not exist yet
    }

    return this.sessions;
  }

  /**
   * Get platform base URL
   */
  getPlatformBaseUrl(platform) {
    const urls = {
      shopify: 'https://admin.shopify.com',
      notion: 'https://www.notion.so',
      google: 'https://admin.google.com',
      github: 'https://github.com',
      linkedin: 'https://www.linkedin.com'
    };

    return urls[platform.toLowerCase()] || null;
  }

  /**
   * Encrypt data
   */
  encrypt(text) {
    if (!this.config.encryptionKey) {
      // No encryption if no key provided (dev mode)
      return Buffer.from(text).toString('base64');
    }

    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.config.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      encrypted,
      authTag: authTag.toString('hex'),
      iv: iv.toString('hex')
    });
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData) {
    if (!this.config.encryptionKey) {
      // No decryption if no key provided (dev mode)
      return Buffer.from(encryptedData, 'base64').toString('utf8');
    }

    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.config.encryptionKey, 'salt', 32);

    const data = JSON.parse(encryptedData);
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(data.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Export session data for backup
   */
  async exportSessions() {
    const sessions = Array.from(this.sessions.values());
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      sessions: sessions.map(s => ({
        ...s,
        cookies: [], // Don't export cookies for security
        localStorage: {} // Don't export localStorage for security
      }))
    };
  }
}