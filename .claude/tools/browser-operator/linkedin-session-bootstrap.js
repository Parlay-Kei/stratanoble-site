#!/usr/bin/env node
/**
 * LinkedIn Session Bootstrap v1.0
 * Establishes persistent authenticated LinkedIn session
 *
 * This utility:
 * 1. Opens Chrome with persistent session directory
 * 2. Navigates to LinkedIn login
 * 3. PAUSES for human to manually log in
 * 4. Captures proof once logged in
 * 5. Persists session for future headless runs
 *
 * Usage:
 *   node linkedin-session-bootstrap.js
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class LinkedInSessionBootstrap {
  constructor() {
    this.config = {
      sessionDir: 'C:\\Dev\\.claude-anx\\browser-sessions\\linkedin',
      proofDir: 'c:\\Dev\\msaudreys-house\\proof-packs\\linkedin-posts\\session-bootstrap',
      timeout: 300000  // 5 minutes for manual login
    };

    this.context = null;
    this.page = null;
    this.runId = null;
    this.runDir = null;
    this.proofCaptures = [];
    this.actionLog = [];
    this.startTime = null;
  }

  /**
   * Prompt user in console and wait for response
   */
  async prompt(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      rl.question(question, answer => {
        rl.close();
        resolve(answer);
      });
    });
  }

  /**
   * Initialize browser and directories
   */
  async initialize() {
    this.startTime = new Date();
    const dateStr = this.startTime.toISOString().split('T')[0];
    this.runId = `run-${this.startTime.toISOString().replace(/[:.]/g, '-')}`;
    this.runDir = path.join(this.config.proofDir, dateStr, this.runId);

    // Ensure directories exist
    await fs.mkdir(this.runDir, { recursive: true });
    await fs.mkdir(path.join(this.runDir, 'screenshots'), { recursive: true });
    await fs.mkdir(this.config.sessionDir, { recursive: true });

    await this.log('bootstrap_start', {
      runId: this.runId,
      sessionDir: this.config.sessionDir
    });

    console.log('\n' + '='.repeat(60));
    console.log('LinkedIn Session Bootstrap v1.0');
    console.log('='.repeat(60));
    console.log(`Session Directory: ${this.config.sessionDir}`);
    console.log(`Proof Pack: ${this.runDir}`);
    console.log('='.repeat(60) + '\n');

    // Launch browser with persistent context (HEADFUL - visible)
    console.log('[*] Launching Chrome browser (headful mode)...\n');

    this.context = await chromium.launchPersistentContext(this.config.sessionDir, {
      headless: false,  // MUST be visible for human login
      slowMo: 100,
      viewport: { width: 1920, height: 1080 },
      permissions: ['clipboard-read', 'clipboard-write'],
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });

    const pages = this.context.pages();
    this.page = pages.length > 0 ? pages[0] : await this.context.newPage();
    this.page.setDefaultTimeout(this.config.timeout);

    await this.log('browser_launched', { headless: false });

    return this.runId;
  }

  /**
   * Check if already logged in
   */
  async checkExistingSession() {
    console.log('[*] Checking for existing LinkedIn session...\n');

    await this.page.goto('https://www.linkedin.com/feed/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await this.sleep(3000);

    // Check for security prompts first
    const securityPrompt = await this.detectSecurityPrompt();
    if (securityPrompt) {
      await this.captureScreenshot('security-prompt-detected');
      console.log(`\n[!] SECURITY PROMPT DETECTED: ${securityPrompt}`);
      console.log('[!] Please handle the security challenge manually in the browser.\n');
      return { loggedIn: false, securityPrompt };
    }

    // Check if logged in
    const isLoggedIn = await this.page.evaluate(() => {
      const feedExists = document.querySelector('[data-test-id="feed-nav-item"]') ||
                         document.querySelector('button[aria-label*="Start a post"]') ||
                         document.querySelector('.share-box-feed-entry__trigger') ||
                         document.querySelector('.feed-shared-update-v2') ||
                         document.querySelector('.global-nav__me');
      return !!feedExists;
    });

    if (isLoggedIn) {
      console.log('[+] Existing valid session found!\n');
      await this.captureScreenshot('existing-session-valid');
      return { loggedIn: true, existing: true };
    }

    return { loggedIn: false };
  }

  /**
   * Navigate to login page and wait for human authentication
   */
  async waitForHumanLogin() {
    console.log('[*] Navigating to LinkedIn login page...\n');

    await this.page.goto('https://www.linkedin.com/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await this.captureScreenshot('login-page-loaded');
    await this.log('login_page_loaded', { url: this.page.url() });

    console.log('='.repeat(60));
    console.log('HUMAN ACTION REQUIRED');
    console.log('='.repeat(60));
    console.log('\nPlease log in to LinkedIn manually in the browser window.');
    console.log('The script will wait until you complete login.\n');
    console.log('Steps:');
    console.log('  1. Enter your email/username');
    console.log('  2. Enter your password');
    console.log('  3. Complete any 2FA/verification if prompted');
    console.log('  4. Wait for the LinkedIn home feed to appear');
    console.log('\nOnce you see the LinkedIn feed, press ENTER here to continue...');
    console.log('='.repeat(60) + '\n');

    await this.prompt('\nPress ENTER when logged in and feed is visible: ');

    // Verify login succeeded
    console.log('\n[*] Verifying login status...\n');
    await this.sleep(2000);

    // Check for security prompts
    const securityPrompt = await this.detectSecurityPrompt();
    if (securityPrompt) {
      await this.captureScreenshot('security-prompt-after-login');
      await this.log('security_prompt_detected', { type: securityPrompt });

      return {
        success: false,
        status: 'SECURITY_PROMPT',
        type: securityPrompt,
        message: `Security prompt detected: ${securityPrompt}. Please resolve manually.`
      };
    }

    // Navigate to feed to confirm
    await this.page.goto('https://www.linkedin.com/feed/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await this.sleep(3000);

    const isLoggedIn = await this.page.evaluate(() => {
      const feedExists = document.querySelector('[data-test-id="feed-nav-item"]') ||
                         document.querySelector('button[aria-label*="Start a post"]') ||
                         document.querySelector('.share-box-feed-entry__trigger') ||
                         document.querySelector('.feed-shared-update-v2') ||
                         document.querySelector('.global-nav__me');
      return !!feedExists;
    });

    if (!isLoggedIn) {
      await this.captureScreenshot('login-failed');
      await this.log('login_failed', { url: this.page.url() });

      return {
        success: false,
        status: 'LOGIN_FAILED',
        message: 'Login verification failed. Feed not detected.'
      };
    }

    await this.captureScreenshot('session-established');
    await this.log('session_established', { url: this.page.url() });

    console.log('[+] Login verified! Session established.\n');

    return {
      success: true,
      status: 'SESSION_ESTABLISHED',
      message: 'LinkedIn session successfully established and persisted.'
    };
  }

  /**
   * Verify session works for posting (dry-run test)
   */
  async verifySessionForPosting() {
    console.log('[*] Running post dry-run verification...\n');

    await this.log('verification_start', {});

    // Try to open composer
    const postButtonSelectors = [
      'button[aria-label*="Start a post"]',
      '.share-box-feed-entry__trigger',
      'button:has-text("Start a post")',
      '[data-control-name="share.sharebox_open"]'
    ];

    let composerOpened = false;
    for (const selector of postButtonSelectors) {
      try {
        const button = await this.page.$(selector);
        if (button) {
          await button.click();
          composerOpened = true;
          await this.log('composer_opened', { selector });
          break;
        }
      } catch (e) {
        // Try next
      }
    }

    if (!composerOpened) {
      await this.captureScreenshot('composer-not-found');
      console.log('[!] Warning: Could not open post composer for verification.\n');
      return { verified: false, warning: 'Composer not found' };
    }

    await this.sleep(2000);
    await this.captureScreenshot('session-verified-after-bootstrap');

    // Close composer
    await this.page.keyboard.press('Escape');
    await this.sleep(1000);

    await this.log('verification_complete', { composerAccessible: true });
    console.log('[+] Session verification complete - composer accessible.\n');

    return { verified: true };
  }

  /**
   * Detect security prompts
   */
  async detectSecurityPrompt() {
    const securitySelectors = [
      { selector: 'input[name="pin"]', type: '2FA_PIN' },
      { selector: '#captcha-challenge', type: 'CAPTCHA' },
      { selector: '[data-test-id="checkpoint-challenge"]', type: 'CHECKPOINT' },
      { selector: 'form[action*="challenge"]', type: 'SECURITY_CHALLENGE' },
      { selector: 'input[name="verification_code"]', type: 'VERIFICATION_CODE' },
      { selector: '.recaptcha-checkbox', type: 'RECAPTCHA' },
      { selector: '#app__container iframe[title*="security"]', type: 'SECURITY_IFRAME' }
    ];

    for (const { selector, type } of securitySelectors) {
      try {
        const element = await this.page.$(selector);
        if (element) return type;
      } catch (e) {
        // Continue
      }
    }

    return null;
  }

  /**
   * Capture screenshot
   */
  async captureScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${name}.png`;
    const filepath = path.join(this.runDir, 'screenshots', filename);

    const screenshot = await this.page.screenshot({
      path: filepath,
      fullPage: false
    });

    const hash = crypto.createHash('sha256').update(screenshot).digest('hex');

    const capture = {
      name,
      filename,
      filepath,
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      hash
    };

    this.proofCaptures.push(capture);
    await this.log('screenshot_captured', { name, filename });

    return capture;
  }

  /**
   * Log action
   */
  async log(action, data) {
    const entry = {
      action,
      timestamp: new Date().toISOString(),
      ...data
    };

    this.actionLog.push(entry);

    const logPath = path.join(this.runDir, 'action-log.json');
    await fs.writeFile(logPath, JSON.stringify(this.actionLog, null, 2));

    console.log(`[${entry.timestamp.split('T')[1].split('.')[0]}] ${action}`);
  }

  /**
   * Sleep utility
   */
  async sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate receipt
   */
  async generateReceipt(result) {
    const endTime = new Date();
    const duration = endTime - this.startTime;
    const dateStr = this.startTime.toISOString().split('T')[0];

    const receipt = {
      ticketId: `LINKEDIN_SESSION_BOOTSTRAP_${dateStr}`,
      runId: this.runId,
      status: result.status,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: `${(duration / 1000).toFixed(2)}s`,
      sessionDir: this.config.sessionDir,
      sessionReady: result.success,
      verificationPassed: result.verified || false,
      screenshots: this.proofCaptures.map(c => c.filename),
      proofPackPath: this.runDir
    };

    const markdown = `# LinkedIn Session Bootstrap Receipt

**Ticket ID**: ${receipt.ticketId}
**Run ID**: ${receipt.runId}
**Status**: ${receipt.status === 'SESSION_ESTABLISHED' ? 'SUCCESS' : receipt.status}
**Timestamp**: ${receipt.startTime}
**Duration**: ${receipt.duration}

## Session Details

| Field | Value |
|-------|-------|
| Session Directory | \`${receipt.sessionDir}\` |
| Session Ready | ${receipt.sessionReady ? 'Yes' : 'No'} |
| Verification Passed | ${receipt.verificationPassed ? 'Yes' : 'No'} |
| Screenshots Captured | ${receipt.screenshots.length} |

## Proof Pack Location

\`${receipt.proofPackPath}\`

## Screenshots

${this.proofCaptures.map(c => `- \`${c.filename}\` - ${c.name}`).join('\n')}

## Verification Checklist

- [${receipt.sessionReady ? 'x' : ' '}] Browser launched in headful mode
- [${this.proofCaptures.some(c => c.name.includes('session-established') || c.name.includes('existing-session')) ? 'x' : ' '}] LinkedIn session established
- [${receipt.verificationPassed ? 'x' : ' '}] Post composer accessibility verified
- [${this.proofCaptures.some(c => c.name === 'session-verified-after-bootstrap') ? 'x' : ' '}] Post-bootstrap verification screenshot captured

## Next Steps

${receipt.sessionReady ? `Session is ready for use. You can now run:

\`\`\`bash
# Dry run test
node .claude/tools/browser-operator/linkedin-post-publisher.js post --content "Test post"

# Live posting
node .claude/tools/browser-operator/linkedin-post-publisher.js post --content "Your content" --live
\`\`\`
` : `Session establishment failed. Please:
1. Check the screenshots for errors
2. Manually verify LinkedIn credentials
3. Re-run the bootstrap process
`}

---
*Generated by LinkedIn Session Bootstrap v1.0*
*Completed: ${receipt.endTime}*
`;

    const receiptPath = path.join(this.runDir, 'LINKEDIN_SESSION_BOOTSTRAP_RECEIPT.md');
    await fs.writeFile(receiptPath, markdown);

    const jsonPath = path.join(this.runDir, 'receipt.json');
    await fs.writeFile(jsonPath, JSON.stringify(receipt, null, 2));

    return { path: receiptPath, data: receipt };
  }

  /**
   * Close browser
   */
  async close() {
    if (this.context) {
      await this.context.close();
    }
  }

  /**
   * Main bootstrap flow
   */
  async run() {
    try {
      await this.initialize();

      // Check for existing session
      const existingCheck = await this.checkExistingSession();

      let loginResult;

      if (existingCheck.loggedIn) {
        console.log('[+] Using existing valid session.\n');
        loginResult = {
          success: true,
          status: 'SESSION_ESTABLISHED',
          existing: true
        };
      } else if (existingCheck.securityPrompt) {
        console.log('\n[!] Security prompt detected. Please handle it in the browser.');
        await this.prompt('\nPress ENTER after resolving the security prompt: ');

        // Re-check after handling
        loginResult = await this.waitForHumanLogin();
      } else {
        // Need to log in
        loginResult = await this.waitForHumanLogin();
      }

      if (!loginResult.success) {
        console.log(`\n[!] Session establishment failed: ${loginResult.message}\n`);
        const receipt = await this.generateReceipt(loginResult);
        console.log(`Receipt: ${receipt.path}\n`);
        return loginResult;
      }

      // Verify session works for posting
      const verification = await this.verifySessionForPosting();
      loginResult.verified = verification.verified;

      // Generate receipt
      const receipt = await this.generateReceipt(loginResult);

      console.log('='.repeat(60));
      console.log('BOOTSTRAP COMPLETE');
      console.log('='.repeat(60));
      console.log(`Status: ${loginResult.status}`);
      console.log(`Session Directory: ${this.config.sessionDir}`);
      console.log(`Verification: ${verification.verified ? 'PASSED' : 'WARNING'}`);
      console.log(`Receipt: ${receipt.path}`);
      console.log(`Proof Pack: ${this.runDir}`);
      console.log('='.repeat(60) + '\n');

      return loginResult;

    } catch (error) {
      console.error('\n[!] Fatal error:', error.message);
      await this.log('fatal_error', { error: error.message });
      throw error;

    } finally {
      console.log('[*] Closing browser...\n');
      await this.close();
    }
  }
}

// Main entry
async function main() {
  const bootstrap = new LinkedInSessionBootstrap();

  try {
    const result = await bootstrap.run();

    if (result.success) {
      console.log('[+] Session ready for headless + --live posting runs.\n');
      process.exit(0);
    } else {
      console.error('[!] Bootstrap failed.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('Bootstrap error:', error.message);
    process.exit(2);
  }
}

export { LinkedInSessionBootstrap };

main();
