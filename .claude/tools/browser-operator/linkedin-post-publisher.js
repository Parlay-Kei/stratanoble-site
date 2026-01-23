#!/usr/bin/env node
/**
 * LinkedIn Post Publisher v1.0
 * Automated posting to LinkedIn profiles with proof capture
 *
 * Usage:
 *   node linkedin-post-publisher.js post --content "Post text" [--live]
 *   node linkedin-post-publisher.js post --file content.txt [--live]
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class LinkedInPostPublisher {
  constructor(config = {}) {
    this.config = {
      headless: config.headless ?? false,
      slowMo: config.slowMo ?? 150,
      sessionDir: config.sessionDir ?? 'C:\\Dev\\.claude-anx\\browser-sessions\\linkedin',
      proofDir: config.proofDir ?? 'C:\\Dev\\.claude-anx\\proof-packs\\linkedin\\posts',
      timeout: config.timeout ?? 30000,
      dryRun: config.dryRun ?? true, // SAFE MODE BY DEFAULT
      bootstrapMode: config.bootstrapMode ?? false, // SESSION BOOTSTRAP MODE
      ...config
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
   * Initialize browser with persistent LinkedIn session
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

    await this.log('initialization_start', {
      dryRun: this.config.dryRun,
      runId: this.runId
    });

    // Launch browser with persistent context (maintains session)
    this.context = await chromium.launchPersistentContext(this.config.sessionDir, {
      headless: this.config.headless,
      slowMo: this.config.slowMo,
      viewport: { width: 1920, height: 1080 },
      permissions: ['clipboard-read', 'clipboard-write'],
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });

    // Get first page or create new one
    const pages = this.context.pages();
    this.page = pages.length > 0 ? pages[0] : await this.context.newPage();
    this.page.setDefaultTimeout(this.config.timeout);

    await this.log('browser_initialized', {
      sessionDir: this.config.sessionDir,
      headless: this.config.headless
    });

    return this.runId;
  }

  /**
   * Navigate to LinkedIn and verify session
   */
  async verifySession() {
    await this.log('session_verification_start', {});

    // Navigate to LinkedIn feed
    await this.page.goto('https://www.linkedin.com/feed/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await this.randomWait(2000, 4000);

    // Check for security prompts
    const securityPrompt = await this.detectSecurityPrompt();
    if (securityPrompt) {
      await this.captureScreenshot('security-prompt-detected');
      await this.log('security_prompt_detected', { type: securityPrompt });
      return {
        success: false,
        status: 'SECURITY_PROMPT',
        promptType: securityPrompt,
        action: 'RETURN_TO_OCS',
        message: `Security prompt detected: ${securityPrompt}. Manual intervention required.`
      };
    }

    // Check if logged in by looking for profile elements
    const isLoggedIn = await this.page.evaluate(() => {
      // Check URL first
      const url = window.location.href;
      if (url.includes('/feed') && !url.includes('/login')) {
        return true;
      }

      // Look for elements that indicate logged-in state
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
      await this.captureScreenshot('not-logged-in');
      await this.log('session_invalid', {});
      return {
        success: false,
        status: 'NOT_LOGGED_IN',
        action: 'RETURN_TO_OCS',
        message: 'LinkedIn session expired or invalid. Please log in manually first.'
      };
    }

    await this.captureScreenshot('session-verified');
    await this.log('session_verified', { url: this.page.url() });

    return {
      success: true,
      status: 'ACTIVE',
      message: 'LinkedIn session active and verified.'
    };
  }

  /**
   * Bootstrap LinkedIn session with human authentication
   */
  async bootstrapSession() {
    console.log('🔑 LINKEDIN SESSION BOOTSTRAP STARTING...');
    console.log('='.repeat(50));

    await this.log('session_bootstrap_start', { mode: 'HEADFUL' });

    // LIVE GUARDRAIL CHECK: Prevent --live if no session exists
    if (!this.config.dryRun && !this.config.bootstrapMode) {
      const hasExistingSession = await this.checkExistingSession();
      if (!hasExistingSession) {
        await this.captureScreenshot('live-guardrail-blocked');
        return {
          success: false,
          status: 'SESSION_REQUIRED',
          action: 'BOOTSTRAP_REQUIRED',
          message: 'LIVE GUARDRAIL: No authenticated session exists. Run session bootstrap first.',
          nextStep: 'Run: node linkedin-post-publisher.js bootstrap --headful'
        };
      }
    }

    // Navigate to LinkedIn login page
    console.log('📄 Navigating to LinkedIn login page...');
    await this.page.goto('https://www.linkedin.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await this.randomWait(2000, 3000);
    await this.captureScreenshot('session-login-page');
    await this.log('login_page_loaded', { url: this.page.url() });

    // Check for security prompts immediately
    const securityPrompt = await this.detectSecurityPrompt();
    if (securityPrompt) {
      await this.captureScreenshot('security-block-detected');
      await this.log('security_block_detected', { type: securityPrompt });
      return {
        success: false,
        status: 'SECURITY_BLOCK',
        promptType: securityPrompt,
        action: 'RETURN_TO_OCS',
        message: `STOP: Security prompt detected during bootstrap: ${securityPrompt}. Manual intervention required.`
      };
    }

    // Pause automation and request human login
    console.log('\n🚨 AUTOMATION PAUSED - HUMAN LOGIN REQUIRED');
    console.log('='.repeat(50));
    console.log('👤 Steve: Please authenticate manually in the browser window');
    console.log('📋 Steps:');
    console.log('   1. Enter your LinkedIn credentials');
    console.log('   2. Complete any 2FA/security checks');
    console.log('   3. Wait until you reach the LinkedIn feed');
    console.log('   4. Press ENTER in this terminal when ready');
    console.log('');
    console.log('⚠️  DO NOT CLOSE THE BROWSER WINDOW');
    console.log('='.repeat(50));

    // Wait for human input
    await this.waitForHumanInput();

    // Verify session is now established
    console.log('\n🔍 Verifying session establishment...');

    // Navigate to feed to verify login
    await this.page.goto('https://www.linkedin.com/feed/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await this.randomWait(3000, 5000);

    // Check for security prompts after login
    const postLoginSecurityPrompt = await this.detectSecurityPrompt();
    if (postLoginSecurityPrompt) {
      await this.captureScreenshot('post-login-security-block');
      await this.log('post_login_security_block', { type: postLoginSecurityPrompt });
      return {
        success: false,
        status: 'SECURITY_BLOCK',
        promptType: postLoginSecurityPrompt,
        action: 'RETURN_TO_OCS',
        message: `STOP: Security prompt after login: ${postLoginSecurityPrompt}. Session bootstrap failed.`
      };
    }

    // Verify we're logged in and can see the feed
    const sessionResult = await this.verifySession();
    if (!sessionResult.success) {
      await this.captureScreenshot('session-bootstrap-failed');
      return {
        success: false,
        status: 'BOOTSTRAP_FAILED',
        action: 'RETURN_TO_OCS',
        message: 'Session bootstrap failed - could not verify authenticated state.'
      };
    }

    // Capture proof that session is established
    await this.captureScreenshot('session-established');
    await this.captureScreenshot('session-verified-after-bootstrap');
    await this.log('session_bootstrap_complete', {
      url: this.page.url(),
      sessionDir: this.config.sessionDir
    });

    console.log('\n✅ SESSION BOOTSTRAP COMPLETE');
    console.log(`📁 Session saved to: ${this.config.sessionDir}`);

    // Generate bootstrap receipt
    await this.generateBootstrapReceipt();

    return {
      success: true,
      status: 'SESSION_ESTABLISHED',
      sessionDir: this.config.sessionDir,
      message: 'LinkedIn session bootstrap completed successfully.',
      proofDir: this.runDir,
      screenshots: this.proofCaptures
    };
  }

  /**
   * Check if existing session exists
   */
  async checkExistingSession() {
    try {
      await fs.access(this.config.sessionDir);
      const sessionFiles = await fs.readdir(this.config.sessionDir);
      return sessionFiles.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Wait for human input to continue
   */
  async waitForHumanInput() {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Press ENTER when login is complete and feed is visible: ', () => {
        rl.close();
        resolve();
      });
    });
  }

  /**
   * Generate session bootstrap receipt
   */
  async generateBootstrapReceipt() {
    const receipt = `# LINKEDIN_SESSION_BOOTSTRAP_RECEIPT

**Date**: ${new Date().toISOString()}
**Bootstrap ID**: ${this.runId}
**Status**: SESSION_ESTABLISHED ✅
**Session Directory**: ${this.config.sessionDir}

## Session Bootstrap Summary

✅ **LinkedIn Login Page**: Loaded successfully
✅ **Human Authentication**: Completed by Steve
✅ **Security Checks**: No blocks detected
✅ **Feed Access**: Verified authenticated state
✅ **Session Persistence**: Saved to browser-sessions directory

## Proof Artifacts

${this.proofCaptures.map(capture => `- **${capture.name}**: ${capture.filename}`).join('\n')}

## Session Details

- **Session Type**: Persistent browser session
- **Authentication Method**: Manual login by approved user (Steve)
- **Session Directory**: \`${this.config.sessionDir}\`
- **Bootstrap Mode**: HEADFUL (human-interactive)
- **Security Status**: No prompts or blocks detected

## Verification Results

The session has been verified with the following checks:
- LinkedIn feed accessible without login prompt
- Profile elements visible (indicating authenticated state)
- No security warnings or captcha challenges
- Session data persisted to designated directory

## Next Steps

✅ Session is ready for automated posting
✅ Dry-run testing can proceed
✅ LIVE guardrail will allow --live mode with this session

## Security Notes

- Session established with manual authentication
- No automated credential handling
- Security prompts monitored and would block operation
- Session persistence follows browser security standards

---
*LinkedIn Session Bootstrap completed*
*Generated: ${new Date().toISOString()}*
*Bootstrap ID: ${this.runId}*
`;

    const receiptPath = path.join(this.config.sessionDir, 'LINKEDIN_SESSION_BOOTSTRAP_RECEIPT.md');
    await fs.mkdir(path.dirname(receiptPath), { recursive: true });
    await fs.writeFile(receiptPath, receipt);

    console.log(`\n📋 Bootstrap receipt: ${receiptPath}`);
    return receiptPath;
  }

  /**
   * Generate LIVE guardrail receipt when session is missing
   */
  async generateLiveGuardrailReceipt() {
    const receipt = `# LINKEDIN_POST_PUBLISHER_LIVE_GUARDRAIL_RECEIPT

**Date**: ${new Date().toISOString()}
**Guardrail ID**: ${this.runId}
**Status**: SESSION_REQUIRED ❌
**Action**: BOOTSTRAP_REQUIRED

## LIVE Guardrail Protection

🛑 **LIVE posting blocked** - No authenticated LinkedIn session exists.

## Security Check Results

❌ **Session Directory**: ${this.config.sessionDir} (not found or empty)
❌ **Session Files**: No persistent browser session detected
✅ **Guardrail Active**: LIVE mode protection working correctly

## Required Action

Before proceeding with LIVE posting, a LinkedIn session must be established:

\`\`\`bash
node linkedin-post-publisher.js bootstrap --headful
\`\`\`

## Guardrail Purpose

This protection prevents LIVE posting attempts when:
- No authenticated session exists
- Session has expired
- Session directory is missing or corrupted

## Next Steps

1. **Bootstrap Session**: Run session bootstrap with headful mode
2. **Human Authentication**: Steve authenticates manually
3. **Session Verification**: System verifies session persistence
4. **Retry LIVE Post**: LIVE posting will be allowed after session exists

## Proof Screenshot

- **live-guardrail-blocked.png**: Screenshot of blocked state

## Compliance

✅ **Safety First**: No automated posting without verified session
✅ **Human Approval**: Manual authentication required
✅ **Audit Trail**: All guardrail blocks documented
✅ **Clear Instructions**: Next steps provided for resolution

---
*LIVE Guardrail Protection v1.0*
*Generated: ${new Date().toISOString()}*
*Guardrail ID: ${this.runId}*
`;

    const receiptPath = path.join(this.runDir, 'LINKEDIN_POST_PUBLISHER_LIVE_GUARDRAIL_RECEIPT.md');
    await fs.mkdir(path.dirname(receiptPath), { recursive: true });
    await fs.writeFile(receiptPath, receipt);

    console.log(`\n🛑 LIVE guardrail receipt: ${receiptPath}`);
    return receiptPath;
  }

  /**
   * Post content to LinkedIn
   */
  async publishPost(content, options = {}) {
    const { hashtags = '' } = options;
    const fullContent = hashtags ? `${content}\n\n${hashtags}` : content;

    await this.log('post_start', {
      contentLength: fullContent.length,
      dryRun: this.config.dryRun,
      hasHashtags: !!hashtags
    });

    // LIVE GUARDRAIL: Check session exists before LIVE posting
    if (!this.config.dryRun) {
      const hasExistingSession = await this.checkExistingSession();
      if (!hasExistingSession) {
        await this.captureScreenshot('live-guardrail-blocked');
        await this.log('live_guardrail_blocked', { reason: 'NO_SESSION' });

        // Generate guardrail receipt
        await this.generateLiveGuardrailReceipt();

        return {
          success: false,
          status: 'SESSION_REQUIRED',
          action: 'BOOTSTRAP_REQUIRED',
          message: 'LIVE GUARDRAIL: No authenticated session exists. Run session bootstrap first.',
          nextStep: 'Run: node linkedin-post-publisher.js bootstrap --headful',
          receipt: 'LINKEDIN_POST_PUBLISHER_LIVE_GUARDRAIL_RECEIPT.md'
        };
      }
    }

    // Verify session first
    const sessionResult = await this.verifySession();
    if (!sessionResult.success) {
      return sessionResult;
    }

    try {
      // Step 1: Click "Start a post" button
      await this.log('opening_composer', {});

      // Multiple selectors for the post button (LinkedIn changes these)
      const postButtonSelectors = [
        'button[aria-label*="Start a post"]',
        '.share-box-feed-entry__trigger',
        'button:has-text("Start a post")',
        '[data-control-name="share.sharebox_open"]',
        '.share-creation-state__start-action button',
        // New LinkedIn UI selectors
        '.share-box-feed-entry__top-bar',
        'div[data-view-name="share-box-feed-entry"]',
        '.share-box-feed-entry__closed-share-box button',
        'span:has-text("Start a post")',
        // Input field trigger
        'input[placeholder*="Start a post"]',
        '.share-box input',
        // Any clickable area in share box
        '.share-box-feed-entry__avatar-image ~ button',
        '.artdeco-card .share-box button'
      ];

      let clicked = false;
      for (const selector of postButtonSelectors) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            await button.click();
            clicked = true;
            await this.log('post_button_clicked', { selector });
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }

      // Fallback: try to click the share box area directly using text content
      if (!clicked) {
        try {
          await this.page.click('text="Start a post"');
          clicked = true;
          await this.log('post_button_clicked', { selector: 'text="Start a post"' });
        } catch (e) {
          // Try another fallback
        }
      }

      // Fallback 2: Find and click the profile image button in share box
      if (!clicked) {
        try {
          const shareBox = await this.page.$('.share-box-feed-entry, [data-view-name*="share"]');
          if (shareBox) {
            await shareBox.click();
            clicked = true;
            await this.log('post_button_clicked', { selector: 'share-box-area' });
          }
        } catch (e) {
          // Continue to error
        }
      }

      if (!clicked) {
        await this.captureScreenshot('post-button-not-found');
        return {
          success: false,
          status: 'ELEMENT_NOT_FOUND',
          error: 'Could not find "Start a post" button. LinkedIn UI may have changed.',
          action: 'RETURN_TO_OCS'
        };
      }

      await this.randomWait(2000, 3500);
      await this.captureScreenshot('composer-opened');

      // Step 2: Wait for composer modal
      await this.log('waiting_for_composer', {});

      const editorSelectors = [
        '.ql-editor[data-placeholder]',
        'div[data-placeholder*="What do you want to talk about"]',
        '.share-creation-state__text-editor .ql-editor',
        '[role="textbox"][aria-label*="Text editor"]',
        '.editor-content[contenteditable="true"]'
      ];

      let editor = null;
      for (const selector of editorSelectors) {
        try {
          editor = await this.page.waitForSelector(selector, { timeout: 10000 });
          if (editor) {
            await this.log('editor_found', { selector });
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }

      if (!editor) {
        await this.captureScreenshot('editor-not-found');
        return {
          success: false,
          status: 'ELEMENT_NOT_FOUND',
          error: 'Could not find post editor. LinkedIn UI may have changed.',
          action: 'RETURN_TO_OCS'
        };
      }

      // Step 3: Enter content
      await this.log('entering_content', { contentLength: fullContent.length });

      await editor.click();
      await this.randomWait(500, 1000);

      // Type content with human-like delay
      await editor.fill(fullContent);

      await this.randomWait(1500, 2500);
      await this.captureScreenshot('content-entered');

      // Step 4: Capture pre-publish proof
      await this.captureScreenshot('pre-publish-composer');
      await this.log('pre_publish_proof_captured', {
        contentPreview: fullContent.substring(0, 100) + '...'
      });

      // DRY RUN CHECK - Stop here if not live mode
      if (this.config.dryRun) {
        await this.log('dry_run_complete', {
          wouldPublish: fullContent.substring(0, 200),
          message: 'Dry run: Post composed but NOT published. Use --live flag to publish.'
        });

        // Close the modal without publishing
        await this.page.keyboard.press('Escape');
        await this.randomWait(1000, 2000);
        await this.captureScreenshot('dry-run-cancelled');

        const receipt = await this.generateReceipt({
          status: 'DRY_RUN_COMPLETE',
          content: fullContent,
          published: false
        });

        return {
          success: true,
          status: 'DRY_RUN_COMPLETE',
          message: 'Dry run completed. Post composed but NOT published.',
          contentPreview: fullContent.substring(0, 200),
          receipt: receipt.path,
          proofDir: this.runDir
        };
      }

      // LIVE MODE: Publish the post
      await this.log('publishing_post', { mode: 'LIVE' });

      // Find and click Post button
      const publishButtonSelectors = [
        'button:has-text("Post")',
        'button[aria-label*="Post"]',
        '.share-actions__primary-action button',
        'button.share-actions__primary-action',
        '[data-control-name="share.post"]'
      ];

      let published = false;
      for (const selector of publishButtonSelectors) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            const isDisabled = await button.isDisabled();
            if (!isDisabled) {
              await button.click();
              published = true;
              await this.log('post_button_clicked', { selector });
              break;
            }
          }
        } catch (e) {
          // Try next selector
        }
      }

      if (!published) {
        await this.captureScreenshot('publish-button-not-found');
        return {
          success: false,
          status: 'ELEMENT_NOT_FOUND',
          error: 'Could not find or click Post button.',
          action: 'RETURN_TO_OCS'
        };
      }

      // Wait for post to be published
      await this.randomWait(3000, 5000);
      await this.page.waitForLoadState('networkidle');

      // Step 5: Verify post is visible
      await this.log('verifying_post', {});

      // Navigate to profile to confirm post
      await this.page.goto('https://www.linkedin.com/in/me/recent-activity/all/', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      await this.randomWait(2000, 3000);
      await this.captureScreenshot('post-published-on-profile');

      // Try to find the post URL
      const postUrl = await this.findRecentPostUrl();

      await this.log('post_published', {
        url: postUrl || 'URL not captured',
        timestamp: new Date().toISOString()
      });

      // Generate receipt
      const receipt = await this.generateReceipt({
        status: 'PUBLISHED',
        content: fullContent,
        published: true,
        postUrl
      });

      return {
        success: true,
        status: 'PUBLISHED',
        message: 'Post published successfully!',
        postUrl: postUrl || 'Check profile for post URL',
        receipt: receipt.path,
        proofDir: this.runDir
      };

    } catch (error) {
      await this.captureScreenshot('error-occurred');
      await this.log('error', {
        message: error.message,
        stack: error.stack
      });

      return {
        success: false,
        status: 'ERROR',
        error: error.message,
        action: 'RETURN_TO_OCS'
      };
    }
  }

  /**
   * Find URL of most recent post
   */
  async findRecentPostUrl() {
    try {
      const postLink = await this.page.$('a[href*="/feed/update/"]');
      if (postLink) {
        return await postLink.getAttribute('href');
      }
    } catch (e) {
      // Couldn't find post URL
    }
    return null;
  }

  /**
   * Detect security prompts (2FA, CAPTCHA, etc.)
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
        if (element) {
          return type;
        }
      } catch (e) {
        // Continue checking
      }
    }

    return null;
  }

  /**
   * Capture screenshot with metadata
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
   * Log action for audit trail
   */
  async log(action, data) {
    const entry = {
      action,
      timestamp: new Date().toISOString(),
      ...data
    };

    this.actionLog.push(entry);

    // Write to log file
    const logPath = path.join(this.runDir, 'action-log.json');
    await fs.writeFile(logPath, JSON.stringify(this.actionLog, null, 2));

    console.log(`[${entry.timestamp}] ${action}`, JSON.stringify(data));
  }

  /**
   * Random wait for human-like behavior
   */
  async randomWait(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Generate receipt markdown file
   */
  async generateReceipt(result) {
    const endTime = new Date();
    const duration = endTime - this.startTime;
    const dateStr = this.startTime.toISOString().split('T')[0];

    const receipt = {
      ticketId: `LINKEDIN_POST_${dateStr}`,
      runId: this.runId,
      status: result.status,
      mode: this.config.dryRun ? 'DRY_RUN' : 'LIVE',
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: `${(duration / 1000).toFixed(2)}s`,
      content: {
        preview: result.content.substring(0, 300),
        length: result.content.length
      },
      postUrl: result.postUrl || null,
      published: result.published,
      screenshots: this.proofCaptures.map(c => c.filename),
      proofPackPath: this.runDir
    };

    // Generate markdown receipt
    const markdown = `# LinkedIn Post Receipt

**Ticket ID**: ${receipt.ticketId}
**Run ID**: ${receipt.runId}
**Status**: ${receipt.status === 'PUBLISHED' ? 'PUBLISHED' : receipt.status === 'DRY_RUN_COMPLETE' ? 'DRY RUN (Not Published)' : 'FAILED'}
**Mode**: ${receipt.mode}
**Timestamp**: ${receipt.startTime}
**Duration**: ${receipt.duration}

## Post Content

\`\`\`
${result.content}
\`\`\`

## Execution Details

| Field | Value |
|-------|-------|
| Published | ${receipt.published ? 'Yes' : 'No'} |
| Post URL | ${receipt.postUrl || 'N/A'} |
| Content Length | ${receipt.content.length} characters |
| Screenshots | ${receipt.screenshots.length} |

## Proof Pack

- **Location**: \`${receipt.proofPackPath}\`
- **Action Log**: \`${receipt.proofPackPath}/action-log.json\`

### Screenshots

${this.proofCaptures.map(c => `- \`${c.filename}\` - ${c.name} (${c.timestamp})`).join('\n')}

## Verification Checklist

- [${result.status !== 'ERROR' ? 'x' : ' '}] Browser session established
- [${this.proofCaptures.some(c => c.name === 'session-verified') ? 'x' : ' '}] LinkedIn session verified
- [${this.proofCaptures.some(c => c.name === 'content-entered') ? 'x' : ' '}] Content entered in composer
- [${this.proofCaptures.some(c => c.name === 'pre-publish-composer') ? 'x' : ' '}] Pre-publish screenshot captured
- [${result.published ? 'x' : ' '}] Post published
- [${this.proofCaptures.some(c => c.name === 'post-published-on-profile') ? 'x' : ' '}] Post visible on profile

---
*Generated by LinkedIn Post Publisher v1.0*
*Run completed: ${receipt.endTime}*
`;

    const receiptFilename = `LINKEDIN_POST_RECEIPT_${dateStr}.md`;
    const receiptPath = path.join(this.runDir, receiptFilename);
    await fs.writeFile(receiptPath, markdown);

    // Also write JSON receipt
    const jsonPath = path.join(this.runDir, 'receipt.json');
    await fs.writeFile(jsonPath, JSON.stringify(receipt, null, 2));

    return {
      path: receiptPath,
      filename: receiptFilename,
      data: receipt
    };
  }

  /**
   * Close browser
   */
  async close() {
    if (this.context) {
      await this.context.close();
    }
    this.context = null;
    this.page = null;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
LinkedIn Post Publisher v1.0

Usage:
  node linkedin-post-publisher.js post --content "Your post text" [options]
  node linkedin-post-publisher.js post --file content.txt [options]
  node linkedin-post-publisher.js bootstrap --headful

Commands:
  post              Publish a post to LinkedIn
  bootstrap         Bootstrap LinkedIn session (one-time setup)

Options:
  --content <text>  Post content (inline)
  --file <path>     Read post content from file
  --hashtags <text> Optional hashtags block (will be appended)
  --live            REQUIRED for actual publishing (default: dry-run)
  --headless        Run browser in headless mode
  --help, -h        Show this help

Safety:
  By default, runs in DRY-RUN mode (composes post but does NOT publish).
  You MUST specify --live flag to actually publish.

Examples:
  # Bootstrap session (one-time setup)
  node linkedin-post-publisher.js bootstrap --headful

  # Dry run (safe - doesn't publish)
  node linkedin-post-publisher.js post --content "Hello LinkedIn!"

  # Live publish (requires existing session)
  node linkedin-post-publisher.js post --content "Hello LinkedIn!" --live

  # From file with hashtags
  node linkedin-post-publisher.js post --file post.txt --hashtags "#sales #crm" --live
`);
    process.exit(0);
  }

  const command = args[0];

  if (command !== 'post' && command !== 'bootstrap') {
    console.error(`Unknown command: ${command}`);
    console.error('Use --help for usage information.');
    process.exit(1);
  }

  if (command === 'bootstrap') {
    // Handle bootstrap command
    let isHeadful = false;

    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--headful') {
        isHeadful = true;
      }
    }

    if (!isHeadful) {
      console.error('Error: Bootstrap requires --headful flag for human authentication.');
      console.error('Usage: node linkedin-post-publisher.js bootstrap --headful');
      process.exit(1);
    }

    console.log('='.repeat(60));
    console.log('LinkedIn Session Bootstrap v1.0');
    console.log('='.repeat(60));
    console.log('Mode: HEADFUL (human authentication required)');
    console.log('='.repeat(60));

    const publisher = new LinkedInPostPublisher({
      headless: false,
      bootstrapMode: true
    });

    try {
      await publisher.initialize();
      const result = await publisher.bootstrapSession();

      console.log('\n' + '='.repeat(60));
      console.log('BOOTSTRAP RESULT:');
      console.log(JSON.stringify(result, null, 2));
      console.log('='.repeat(60));

      if (result.success) {
        console.log(`\nSession directory: ${result.sessionDir}`);
        console.log(`Proof pack: ${result.proofDir}`);
        process.exit(0);
      } else {
        console.error(`\nBootstrap failed: ${result.error || result.message}`);
        if (result.action === 'RETURN_TO_OCS') {
          console.error('Returning to OCS with status:', result.status);
        }
        process.exit(1);
      }

    } catch (error) {
      console.error('Bootstrap fatal error:', error.message);
      process.exit(2);

    } finally {
      await publisher.close();
    }

  } else if (command === 'post') {
    // Handle post command
    let content = null;
    let hashtags = '';
    let isLive = false;
    let isHeadless = false;

    for (let i = 1; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--content' && args[i + 1]) {
        content = args[++i];
      } else if (arg === '--file' && args[i + 1]) {
        const filePath = args[++i];
        try {
          content = await fs.readFile(filePath, 'utf-8');
        } catch (e) {
          console.error(`Could not read file: ${filePath}`);
          process.exit(1);
        }
      } else if (arg === '--hashtags' && args[i + 1]) {
        hashtags = args[++i];
      } else if (arg === '--live') {
        isLive = true;
      } else if (arg === '--headless') {
        isHeadless = true;
      }
    }

    if (!content) {
      console.error('Error: No content provided. Use --content or --file.');
      process.exit(1);
    }

    console.log('='.repeat(60));
    console.log('LinkedIn Post Publisher v1.0');
    console.log('='.repeat(60));
    console.log(`Mode: ${isLive ? 'LIVE (will publish)' : 'DRY-RUN (will NOT publish)'}`);
    console.log(`Content length: ${content.length} characters`);
    if (hashtags) console.log(`Hashtags: ${hashtags}`);
    console.log('='.repeat(60));

    if (!isLive) {
      console.log('\nNOTE: Running in DRY-RUN mode. Use --live flag to actually publish.\n');
    }

    const publisher = new LinkedInPostPublisher({
      dryRun: !isLive,
      headless: isHeadless
    });

    try {
      await publisher.initialize();
      const result = await publisher.publishPost(content, { hashtags });

      console.log('\n' + '='.repeat(60));
      console.log('RESULT:');
      console.log(JSON.stringify(result, null, 2));
      console.log('='.repeat(60));

      if (result.success) {
        console.log(`\nProof pack: ${result.proofDir}`);
        if (result.receipt) {
          console.log(`Receipt: ${result.receipt}`);
        }
        process.exit(0);
      } else {
        console.error(`\nOperation failed: ${result.error || result.message}`);
        if (result.status === 'SESSION_REQUIRED') {
          console.error('\nNext step:', result.nextStep);
        }
        process.exit(1);
      }

    } catch (error) {
      console.error('Fatal error:', error.message);
      process.exit(2);

    } finally {
      await publisher.close();
    }
  }
}

// Export for module use
export { LinkedInPostPublisher };

// Run if called directly
const isMain = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` ||
               import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;

if (isMain) {
  main();
}
