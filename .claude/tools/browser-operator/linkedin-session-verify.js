#!/usr/bin/env node
/**
 * LinkedIn Session Verify v1.0
 * Non-interactive session verification and proof capture
 *
 * Usage:
 *   node linkedin-session-verify.js [--capture-proof]
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const captureProof = process.argv.includes('--capture-proof');

  const config = {
    sessionDir: 'C:\\Dev\\.claude-anx\\browser-sessions\\linkedin',
    proofDir: 'c:\\Dev\\msaudreys-house\\proof-packs\\linkedin-posts\\session-bootstrap'
  };

  const startTime = new Date();
  const dateStr = startTime.toISOString().split('T')[0];
  const runId = `run-${startTime.toISOString().replace(/[:.]/g, '-')}`;
  const runDir = path.join(config.proofDir, dateStr, runId);

  console.log('\n' + '='.repeat(60));
  console.log('LinkedIn Session Verify v1.0');
  console.log('='.repeat(60));
  console.log(`Session Directory: ${config.sessionDir}`);
  console.log('='.repeat(60) + '\n');

  // Ensure directories
  await fs.mkdir(path.join(runDir, 'screenshots'), { recursive: true });

  let context = null;
  const actionLog = [];
  const screenshots = [];

  async function log(action, data = {}) {
    const entry = { action, timestamp: new Date().toISOString(), ...data };
    actionLog.push(entry);
    console.log(`[${entry.timestamp.split('T')[1].split('.')[0]}] ${action}`);
  }

  async function captureScreenshot(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${name}.png`;
    const filepath = path.join(runDir, 'screenshots', filename);

    const screenshot = await page.screenshot({ path: filepath, fullPage: false });
    const hash = crypto.createHash('sha256').update(screenshot).digest('hex');

    screenshots.push({ name, filename, filepath, hash, timestamp: new Date().toISOString() });
    await log('screenshot_captured', { name, filename });
    return filepath;
  }

  try {
    await log('verification_start', { sessionDir: config.sessionDir });

    // Launch with existing session
    console.log('[*] Launching browser with existing session...\n');

    context = await chromium.launchPersistentContext(config.sessionDir, {
      headless: false,
      slowMo: 100,
      viewport: { width: 1920, height: 1080 }
    });

    const pages = context.pages();
    const page = pages.length > 0 ? pages[0] : await context.newPage();
    page.setDefaultTimeout(60000);

    await log('browser_launched');

    // Navigate to feed
    console.log('[*] Navigating to LinkedIn feed...\n');
    await page.goto('https://www.linkedin.com/feed/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await new Promise(r => setTimeout(r, 3000));

    // Check for security prompts
    const securitySelectors = [
      { selector: 'input[name="pin"]', type: '2FA_PIN' },
      { selector: '#captcha-challenge', type: 'CAPTCHA' },
      { selector: '[data-test-id="checkpoint-challenge"]', type: 'CHECKPOINT' },
      { selector: 'form[action*="challenge"]', type: 'SECURITY_CHALLENGE' }
    ];

    let securityPrompt = null;
    for (const { selector, type } of securitySelectors) {
      const element = await page.$(selector);
      if (element) {
        securityPrompt = type;
        break;
      }
    }

    if (securityPrompt) {
      await captureScreenshot(page, 'security-prompt-detected');
      console.log(`\n[!] SECURITY PROMPT DETECTED: ${securityPrompt}`);
      console.log('[!] STOPPING - Manual intervention required.\n');

      await log('security_prompt', { type: securityPrompt });
      await fs.writeFile(path.join(runDir, 'action-log.json'), JSON.stringify(actionLog, null, 2));

      await context.close();
      process.exit(1);
    }

    // Check if logged in - multiple detection methods
    const isLoggedIn = await page.evaluate(() => {
      // Check URL first
      const url = window.location.href;
      if (url.includes('/feed') && !url.includes('/login')) {
        return true;
      }

      // Check for feed elements
      const feedExists = document.querySelector('[data-test-id="feed-nav-item"]') ||
                         document.querySelector('button[aria-label*="Start a post"]') ||
                         document.querySelector('.share-box-feed-entry__trigger') ||
                         document.querySelector('.feed-shared-update-v2') ||
                         document.querySelector('.global-nav__me') ||
                         document.querySelector('.feed-identity-module') ||
                         document.querySelector('.scaffold-layout__main') ||
                         document.querySelector('input[placeholder*="Start a post"]') ||
                         document.querySelector('.share-box') ||
                         document.querySelector('nav[aria-label="Primary"]');
      return !!feedExists;
    });

    if (!isLoggedIn) {
      await captureScreenshot(page, 'not-logged-in');
      console.log('\n[!] NOT LOGGED IN - Session invalid or expired.\n');

      await log('session_invalid');
      await fs.writeFile(path.join(runDir, 'action-log.json'), JSON.stringify(actionLog, null, 2));

      await context.close();
      process.exit(1);
    }

    // Session is valid!
    console.log('[+] SESSION VALID - Logged into LinkedIn!\n');
    await log('session_valid', { url: page.url() });

    await captureScreenshot(page, 'session-established');

    // Test composer access
    console.log('[*] Testing post composer access...\n');

    const postButtonSelectors = [
      'button[aria-label*="Start a post"]',
      '.share-box-feed-entry__trigger',
      'button:has-text("Start a post")'
    ];

    let composerOpened = false;
    for (const selector of postButtonSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          await button.click();
          composerOpened = true;
          await log('composer_button_clicked', { selector });
          break;
        }
      } catch (e) {
        // Try next
      }
    }

    if (composerOpened) {
      await new Promise(r => setTimeout(r, 2000));
      await captureScreenshot(page, 'session-verified-after-bootstrap');
      console.log('[+] Composer opened successfully!\n');

      // Close composer
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 1000));

      await log('verification_complete', { composerAccessible: true });
    } else {
      console.log('[!] Warning: Could not open composer, but session is valid.\n');
      await log('composer_not_found');
    }

    // Generate receipt
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;

    const receipt = {
      ticketId: `LINKEDIN_SESSION_BOOTSTRAP_${dateStr}`,
      runId,
      status: 'SESSION_ESTABLISHED',
      sessionReady: true,
      verificationPassed: composerOpened,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: `${duration.toFixed(2)}s`,
      sessionDir: config.sessionDir,
      screenshots: screenshots.map(s => s.filename),
      proofPackPath: runDir
    };

    const markdown = `# LinkedIn Session Bootstrap Receipt

**Ticket ID**: ${receipt.ticketId}
**Run ID**: ${receipt.runId}
**Status**: SUCCESS - SESSION ESTABLISHED
**Timestamp**: ${receipt.startTime}
**Duration**: ${receipt.duration}

## Session Details

| Field | Value |
|-------|-------|
| Session Directory | \`${receipt.sessionDir}\` |
| Session Ready | Yes |
| Composer Verified | ${receipt.verificationPassed ? 'Yes' : 'No'} |

## Proof Pack

\`${receipt.proofPackPath}\`

### Screenshots

${screenshots.map(s => `- \`${s.filename}\` - ${s.name}`).join('\n')}

## Verification Checklist

- [x] Browser launched with persistent session
- [x] LinkedIn feed loaded successfully
- [x] Session validated (logged in)
- [${composerOpened ? 'x' : ' '}] Post composer accessible

## Ready for Use

Session is ready for headless + --live posting runs:

\`\`\`bash
# Test dry-run
node .claude/tools/browser-operator/linkedin-post-publisher.js post --content "Test"

# Live post
node .claude/tools/browser-operator/linkedin-post-publisher.js post --content "Your post" --live
\`\`\`

---
*Generated by LinkedIn Session Verify v1.0*
*Completed: ${receipt.endTime}*
`;

    await fs.writeFile(path.join(runDir, 'LINKEDIN_SESSION_BOOTSTRAP_RECEIPT.md'), markdown);
    await fs.writeFile(path.join(runDir, 'receipt.json'), JSON.stringify(receipt, null, 2));
    await fs.writeFile(path.join(runDir, 'action-log.json'), JSON.stringify(actionLog, null, 2));

    console.log('='.repeat(60));
    console.log('SESSION VERIFICATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`Status: SESSION_ESTABLISHED`);
    console.log(`Session Directory: ${config.sessionDir}`);
    console.log(`Composer Verified: ${composerOpened ? 'YES' : 'NO'}`);
    console.log(`Receipt: ${path.join(runDir, 'LINKEDIN_SESSION_BOOTSTRAP_RECEIPT.md')}`);
    console.log(`Proof Pack: ${runDir}`);
    console.log('='.repeat(60) + '\n');

    console.log('[+] Session ready for headless + --live posting runs.\n');

    await context.close();
    process.exit(0);

  } catch (error) {
    console.error('\n[!] Error:', error.message);
    await log('error', { message: error.message });
    await fs.writeFile(path.join(runDir, 'action-log.json'), JSON.stringify(actionLog, null, 2));

    if (context) await context.close();
    process.exit(2);
  }
}

main();
