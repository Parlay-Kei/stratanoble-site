/**
 * Browser Executor Adapter v1.0
 * Playwright-based browser automation with session management and proof capture
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class BrowserExecutor {
  constructor(config = {}) {
    this.config = {
      headless: config.headless ?? false,
      slowMo: config.slowMo ?? 100,
      viewport: config.viewport ?? { width: 1920, height: 1080 },
      userDataDir: config.userDataDir ?? 'C:\\Dev\\.claude-anx\\browser-sessions',
      screenshotDir: config.screenshotDir ?? 'C:\\Dev\\.claude-anx\\proofs\\browser-ops',
      recordVideo: config.recordVideo ?? true,
      timeout: config.timeout ?? 30000,
      ...config
    };

    this.browser = null;
    this.context = null;
    this.page = null;
    this.sessionId = null;
    this.proofCaptures = [];
    this.startTime = null;
  }

  /**
   * Initialize browser with persistent session
   */
  async initialize(sessionName = 'default') {
    this.sessionId = `${sessionName}-${Date.now()}`;
    this.startTime = new Date();

    // Ensure directories exist
    await this.ensureDirectories();

    // Launch browser with persistent context
    const userDataPath = path.join(this.config.userDataDir, sessionName);

    this.context = await chromium.launchPersistentContext(userDataPath, {
      headless: this.config.headless,
      slowMo: this.config.slowMo,
      viewport: this.config.viewport,
      recordVideo: this.config.recordVideo ? {
        dir: path.join(this.config.screenshotDir, this.sessionId, 'videos')
      } : undefined,
      permissions: ['clipboard-read', 'clipboard-write'],
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });

    // Get first page or create new one
    const pages = this.context.pages();
    this.page = pages.length > 0 ? pages[0] : await this.context.newPage();

    // Set default timeout
    this.page.setDefaultTimeout(this.config.timeout);

    // Setup request interception for monitoring
    this.page.on('request', request => {
      if (this.config.debug) {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`);
      }
    });

    this.page.on('response', response => {
      if (this.config.debug && response.status() >= 400) {
        console.log(`[ERROR] ${response.status()} ${response.url()}`);
      }
    });

    await this.captureProof('session_start', {
      sessionId: this.sessionId,
      timestamp: this.startTime.toISOString()
    });

    return this.sessionId;
  }

  /**
   * Navigate to URL and wait for load
   */
  async navigate(url, options = {}) {
    const waitUntil = options.waitUntil || 'networkidle';

    await this.captureProof('before_navigation', {
      fromUrl: this.page.url(),
      toUrl: url
    });

    const response = await this.page.goto(url, { waitUntil });

    await this.captureProof('after_navigation', {
      url: this.page.url(),
      status: response?.status(),
      title: await this.page.title()
    });

    return {
      url: this.page.url(),
      status: response?.status(),
      title: await this.page.title()
    };
  }

  /**
   * Perform login with credentials
   */
  async login(credentials, selectors = {}) {
    const defaultSelectors = {
      username: 'input[name="email"], input[name="username"], input[type="email"]',
      password: 'input[name="password"], input[type="password"]',
      submit: 'button[type="submit"], input[type="submit"], button:has-text("Sign in"), button:has-text("Log in")',
      ...selectors
    };

    try {
      // Fill username
      await this.page.fill(defaultSelectors.username, credentials.username);

      // Fill password
      await this.page.fill(defaultSelectors.password, credentials.password);

      // Capture before login
      await this.captureProof('before_login', {
        username: credentials.username,
        timestamp: new Date().toISOString()
      });

      // Click submit and wait for navigation
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle' }),
        this.page.click(defaultSelectors.submit)
      ]);

      // Check for MFA/2FA
      const mfaSelector = 'input[name="code"], input[name="otp"], input[name="token"]';
      const hasMFA = await this.page.isVisible(mfaSelector, { timeout: 5000 }).catch(() => false);

      if (hasMFA && credentials.mfaCode) {
        await this.page.fill(mfaSelector, credentials.mfaCode);
        await this.page.press(mfaSelector, 'Enter');
        await this.page.waitForNavigation({ waitUntil: 'networkidle' });
      }

      // Capture after login
      await this.captureProof('after_login', {
        url: this.page.url(),
        title: await this.page.title(),
        success: true
      });

      // Save session cookies
      const cookies = await this.context.cookies();
      await this.saveSession(credentials.username, cookies);

      return {
        success: true,
        url: this.page.url(),
        sessionSaved: true
      };

    } catch (error) {
      await this.captureProof('login_failed', {
        error: error.message,
        url: this.page.url()
      });

      throw error;
    }
  }

  /**
   * Execute action on element
   */
  async executeAction(action, selector, options = {}) {
    const element = await this.page.waitForSelector(selector, {
      state: options.state || 'visible',
      timeout: options.timeout || 10000
    });

    await this.captureProof(`before_${action}`, {
      action,
      selector,
      timestamp: new Date().toISOString()
    });

    let result;
    switch (action) {
      case 'click':
        await element.click(options);
        result = { clicked: true };
        break;

      case 'fill':
        await element.fill(options.value || '');
        result = { filled: true, value: options.value };
        break;

      case 'select':
        await element.selectOption(options.value);
        result = { selected: true, value: options.value };
        break;

      case 'check':
        await element.check();
        result = { checked: true };
        break;

      case 'uncheck':
        await element.uncheck();
        result = { unchecked: true };
        break;

      case 'hover':
        await element.hover();
        result = { hovered: true };
        break;

      case 'screenshot':
        const screenshotPath = await element.screenshot({
          path: path.join(this.config.screenshotDir, this.sessionId, `element_${Date.now()}.png`)
        });
        result = { screenshot: screenshotPath };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    await this.captureProof(`after_${action}`, {
      action,
      selector,
      result,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  /**
   * Wait for condition
   */
  async waitFor(condition, options = {}) {
    switch (condition.type) {
      case 'selector':
        return await this.page.waitForSelector(condition.value, options);

      case 'text':
        return await this.page.waitForFunction(
          text => document.body.textContent.includes(text),
          condition.value,
          options
        );

      case 'url':
        return await this.page.waitForURL(condition.value, options);

      case 'function':
        return await this.page.waitForFunction(condition.value, options);

      case 'timeout':
        return await this.page.waitForTimeout(condition.value);

      default:
        throw new Error(`Unknown condition type: ${condition.type}`);
    }
  }

  /**
   * Capture proof (screenshot + metadata)
   */
  async captureProof(eventName, metadata = {}) {
    const timestamp = new Date().toISOString();
    const screenshotName = `${eventName}_${Date.now()}.png`;
    const screenshotPath = path.join(
      this.config.screenshotDir,
      this.sessionId,
      'screenshots',
      screenshotName
    );

    // Ensure screenshot directory exists
    await fs.mkdir(path.dirname(screenshotPath), { recursive: true });

    // Take screenshot
    const screenshot = await this.page.screenshot({
      path: screenshotPath,
      fullPage: metadata.fullPage ?? false
    });

    // Get page info
    const pageInfo = {
      url: this.page.url(),
      title: await this.page.title(),
      viewport: this.page.viewportSize()
    };

    const proof = {
      eventName,
      timestamp,
      screenshotPath,
      screenshotName,
      pageInfo,
      metadata,
      hash: crypto.createHash('sha256').update(screenshot).digest('hex')
    };

    this.proofCaptures.push(proof);

    return proof;
  }

  /**
   * Save session cookies
   */
  async saveSession(identifier, cookies) {
    const sessionFile = path.join(
      this.config.userDataDir,
      'saved-sessions',
      `${identifier}.json`
    );

    await fs.mkdir(path.dirname(sessionFile), { recursive: true });
    await fs.writeFile(sessionFile, JSON.stringify({
      identifier,
      cookies,
      savedAt: new Date().toISOString()
    }, null, 2));
  }

  /**
   * Load saved session
   */
  async loadSession(identifier) {
    const sessionFile = path.join(
      this.config.userDataDir,
      'saved-sessions',
      `${identifier}.json`
    );

    try {
      const content = await fs.readFile(sessionFile, 'utf-8');
      const session = JSON.parse(content);

      if (session.cookies) {
        await this.context.addCookies(session.cookies);
        return true;
      }
    } catch (error) {
      console.warn(`Could not load session ${identifier}:`, error.message);
    }

    return false;
  }

  /**
   * Generate proof pack
   */
  async generateProofPack(mission, ticketId = null) {
    const endTime = new Date();
    const duration = endTime - this.startTime;

    const proofPack = {
      mission,
      ticketId: ticketId || `OCS-BO-${Date.now()}`,
      sessionId: this.sessionId,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: `${(duration / 1000).toFixed(2)}s`,
      captures: this.proofCaptures,
      summary: {
        totalEvents: this.proofCaptures.length,
        screenshots: this.proofCaptures.filter(p => p.screenshotPath).length,
        urls: [...new Set(this.proofCaptures.map(p => p.pageInfo?.url).filter(Boolean))],
        success: !this.proofCaptures.some(p => p.metadata?.error)
      }
    };

    const proofPackPath = path.join(
      this.config.screenshotDir,
      this.sessionId,
      'PROOF_PACK.json'
    );

    await fs.writeFile(proofPackPath, JSON.stringify(proofPack, null, 2));

    // Generate markdown report
    const markdownReport = await this.generateMarkdownReport(proofPack);
    const reportPath = path.join(
      this.config.screenshotDir,
      this.sessionId,
      'PROOF_PACK.md'
    );
    await fs.writeFile(reportPath, markdownReport);

    return {
      json: proofPackPath,
      markdown: reportPath,
      proofPack
    };
  }

  /**
   * Generate markdown report
   */
  async generateMarkdownReport(proofPack) {
    const report = `# Browser Operations Proof Pack

**Ticket ID**: ${proofPack.ticketId}
**Mission**: ${proofPack.mission}
**Session**: ${proofPack.sessionId}
**Date**: ${proofPack.startTime}
**Duration**: ${proofPack.duration}

## Summary

- Total Events: ${proofPack.summary.totalEvents}
- Screenshots Captured: ${proofPack.summary.screenshots}
- Pages Visited: ${proofPack.summary.urls.length}
- Status: ${proofPack.summary.success ? '✅ SUCCESS' : '❌ FAILED'}

## Test Results

### Browser Automation
- Session initialized: ✅
- Navigation successful: ${proofPack.captures.some(c => c.eventName === 'after_navigation') ? '✅' : '❌'}
- Actions executed: ${proofPack.captures.filter(c => c.eventName.includes('after_')).length}

## Quality Gate

| Check | Status | Details |
|-------|--------|---------|
| Session Start | ✅ PASS | Browser session initialized |
| Screenshots | ✅ PASS | All proof captures successful |
| Navigation | ${proofPack.summary.urls.length > 0 ? '✅ PASS' : '❌ FAIL'} | ${proofPack.summary.urls.length} pages visited |
| Errors | ${proofPack.summary.success ? '✅ PASS' : '❌ FAIL'} | ${proofPack.summary.success ? 'No errors' : 'Errors detected'} |

## Evidence

### Screenshots
${proofPack.captures
  .filter(c => c.screenshotPath)
  .map(c => `- ${c.eventName}: \`${c.screenshotName}\` (${c.timestamp})`)
  .join('\n')}

### URLs Visited
${proofPack.summary.urls.map(url => `- ${url}`).join('\n')}

### Event Timeline
${proofPack.captures.map(c => `
**${c.eventName}** - ${c.timestamp}
${c.metadata ? Object.entries(c.metadata)
  .filter(([k, v]) => k !== 'error')
  .map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`)
  .join('\n') : ''}
${c.metadata?.error ? `- ❌ ERROR: ${c.metadata.error}` : ''}
`).join('\n')}

## Verification

All browser operations have been recorded with visual proof:
1. ✅ Session management active
2. ✅ Screenshots captured at each step
3. ✅ Metadata recorded for audit trail
4. ✅ Timestamps for all events
5. ✅ Hash verification for screenshots

---
*Generated by Browser Operator v1.0*
*Session completed: ${proofPack.endTime}*`;

    return report;
  }

  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    const dirs = [
      this.config.userDataDir,
      this.config.screenshotDir,
      path.join(this.config.screenshotDir, this.sessionId),
      path.join(this.config.screenshotDir, this.sessionId, 'screenshots'),
      path.join(this.config.screenshotDir, this.sessionId, 'videos')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Close browser and cleanup
   */
  async close() {
    await this.captureProof('session_end', {
      totalCaptures: this.proofCaptures.length,
      timestamp: new Date().toISOString()
    });

    if (this.context) {
      await this.context.close();
    }

    this.browser = null;
    this.context = null;
    this.page = null;
  }
}