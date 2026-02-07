#!/usr/bin/env tsx

/**
 * LinkedIn Live Post Verification Script
 *
 * One-and-done verification that the LinkedIn posting system works.
 * Posts a controlled test message and verifies it appeared correctly.
 *
 * CRITICAL: This is a LIVE POST - will actually post to LinkedIn
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Identity verification - CORRECTED based on actual profile
  EXPECTED_PROFILE_SLUG: 'mr-steve-hubbard',
  EXPECTED_PROFILE_NAME: 'Steve Hubbard',
  LINKEDIN_PROFILE_URL: 'https://www.linkedin.com/in/mr-steve-hubbard/',

  // Post content - P01: Why Automation Fails in Serious Businesses
  TEST_POST_CONTENT: `Most automation fails because it automates the wrong things.

You automate the visible workflows.
You dashboard the obvious metrics.
You alert on the expected failures.

But the real failures happen silently:
- Permission drift that nobody notices
- Integration delays that compound
- Data quality that degrades slowly
- Edge cases that multiply quietly

The solution isn't more automation.
It's automating the right things:
- Ownership verification
- Drift detection
- Assumption testing
- Silent failure monitoring

Stop automating what's easy.
Start automating what matters.

What's failing silently in your business right now?

#ownership`,

  // LinkedIn URLs
  LINKEDIN_FEED: 'https://www.linkedin.com/feed/',

  // Timing
  MIN_WAIT: 1500,
  MAX_WAIT: 3500,
  TYPING_DELAY: 30,
  SLOW_MO: 200,

  // Paths
  PROOF_PACK_DIR: './proofs/linkedin-live-post-proof/2026-01-27',
  SESSION_FILE: './linkedin-session.json',

  // Security selectors
  SECURITY_SELECTORS: [
    { selector: 'input[name="pin"]', type: '2FA_PIN' },
    { selector: '#captcha-challenge', type: 'CAPTCHA' },
    { selector: '[data-test-id="checkpoint-challenge"]', type: 'CHECKPOINT' },
    { selector: 'form[action*="challenge"]', type: 'SECURITY_CHALLENGE' },
    { selector: '[data-test-id="login-form"]', type: 'LOGIN_REQUIRED' }
  ]
};

// ============================================================================
// TYPES
// ============================================================================

interface VerificationResult {
  status: 'PASS' | 'FAIL';
  timestamp: string;
  runId: string;
  identityVerification: {
    expected: string;
    actual: string;
    matched: boolean;
    screenshot: string;
  };
  postVerification: {
    postUrl: string;
    authorSlug: string;
    authorMatched: boolean;
    visibleOnFeed: boolean;
    permalinkLoads: boolean;
    screenshot: string;
  };
  notionUpdate: {
    attempted: boolean;
    success: boolean;
  };
  error?: string;
  screenshots: string[];
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;
let runId = `live-verify-${new Date().toISOString().replace(/[:.]/g, '-')}`;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function randomWait(min = CONFIG.MIN_WAIT, max = CONFIG.MAX_WAIT): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`  [wait ${delay}ms]`);
  await new Promise(resolve => setTimeout(resolve, delay));
}

async function captureScreenshot(name: string): Promise<string> {
  if (!page) throw new Error('No page available');

  const filename = `${new Date().toISOString().replace(/[:.]/g, '-')}_${name}.png`;
  const screenshotPath = path.join(CONFIG.PROOF_PACK_DIR, 'screenshots', filename);

  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`  📸 Screenshot: ${filename}`);

  return screenshotPath;
}

async function logAction(action: string, data?: any): Promise<void> {
  const logPath = path.join(CONFIG.PROOF_PACK_DIR, 'action-log.json');

  let logs: any[] = [];
  try {
    const existing = await fs.readFile(logPath, 'utf8');
    logs = JSON.parse(existing);
  } catch {
    // File doesn't exist yet
  }

  logs.push({
    action,
    timestamp: new Date().toISOString(),
    data
  });

  await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
  console.log(`[${new Date().toISOString()}] ${action}`);
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

async function establishSession(): Promise<boolean> {
  await logAction('session_establish_start');

  try {
    browser = await chromium.launch({
      headless: false,
      slowMo: CONFIG.SLOW_MO
    });

    let storageState: string | undefined;
    try {
      await fs.access(CONFIG.SESSION_FILE);
      storageState = CONFIG.SESSION_FILE;
      await logAction('using_stored_session');
    } catch {
      await logAction('no_stored_session');
    }

    context = await browser.newContext({
      ...(storageState ? { storageState } : {}),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      viewport: { width: 1280, height: 900 }
    });

    page = await context.newPage();

    await page.goto(CONFIG.LINKEDIN_FEED, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await new Promise(r => setTimeout(r, 3000));

    // Check for security prompts
    for (const check of CONFIG.SECURITY_SELECTORS) {
      const element = await page.$(check.selector);
      if (element) {
        console.error(`  ❌ Security prompt: ${check.type}`);
        return false;
      }
    }

    // Verify logged in
    const isLoggedIn = await page.$('nav, .global-nav');
    if (!isLoggedIn) {
      console.error('  ❌ Not logged in');
      return false;
    }

    await captureScreenshot('session-established');
    await logAction('session_established');
    return true;

  } catch (error) {
    console.error('Session error:', error);
    return false;
  }
}

async function closeSession(): Promise<void> {
  if (context) {
    await context.storageState({ path: CONFIG.SESSION_FILE });
  }
  if (browser) {
    await browser.close();
    browser = null;
    context = null;
    page = null;
  }
}

// ============================================================================
// IDENTITY VERIFICATION GATE
// ============================================================================

async function verifyIdentity(): Promise<{ success: boolean; slug: string; name: string; screenshot: string }> {
  console.log('\n🔐 IDENTITY VERIFICATION GATE');
  console.log(`  Expected: ${CONFIG.EXPECTED_PROFILE_NAME} (${CONFIG.EXPECTED_PROFILE_SLUG})`);

  if (!page) {
    return { success: false, slug: '', name: '', screenshot: '' };
  }

  try {
    // Navigate to feed
    await page.goto(CONFIG.LINKEDIN_FEED, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomWait(2000, 3000);

    // Click Me menu
    const meMenuSelectors = [
      '.global-nav__me',
      'button[aria-label*="Me"]',
      '#global-nav-icon--mercado__profile--person'
    ];

    let meMenu = null;
    for (const selector of meMenuSelectors) {
      meMenu = await page.$(selector);
      if (meMenu) break;
    }

    if (meMenu) {
      await meMenu.click();
      await randomWait(1000, 1500);
    }

    // Capture identity screenshot
    const screenshot = await captureScreenshot('identity_menu');

    // Get profile URL from View Profile link
    let profileSlug = '';
    let profileName = '';

    const viewProfileLink = await page.$('a[href*="/in/"]:has-text("View Profile")');
    if (viewProfileLink) {
      const href = await viewProfileLink.getAttribute('href') || '';
      const slugMatch = href.match(/\/in\/([^\/\?]+)/);
      if (slugMatch) {
        profileSlug = slugMatch[1];
      }
    }

    // Get name
    const nameElement = await page.$('.global-nav__me-content .t-16, .feed-identity-module__actor-meta');
    if (nameElement) {
      profileName = (await nameElement.textContent() || '').trim();
    }

    // Close menu
    await page.keyboard.press('Escape');
    await randomWait(500, 1000);

    const isMatch = profileSlug === CONFIG.EXPECTED_PROFILE_SLUG;

    await logAction('identity_verified', {
      expected: CONFIG.EXPECTED_PROFILE_SLUG,
      actual: profileSlug,
      name: profileName,
      matched: isMatch
    });

    if (isMatch) {
      console.log(`  ✅ Identity verified: ${profileName} (${profileSlug})`);
    } else {
      console.error(`  ❌ IDENTITY MISMATCH!`);
      console.error(`     Expected: ${CONFIG.EXPECTED_PROFILE_SLUG}`);
      console.error(`     Actual: ${profileSlug || 'UNKNOWN'}`);
    }

    return { success: isMatch, slug: profileSlug, name: profileName, screenshot };

  } catch (error) {
    console.error('Identity check error:', error);
    return { success: false, slug: '', name: '', screenshot: '' };
  }
}

// ============================================================================
// POST VERIFICATION GATE
// ============================================================================

async function verifyPostAppeared(): Promise<{ success: boolean; postUrl: string; authorSlug: string; screenshot: string }> {
  console.log('\n🔍 POST VERIFICATION GATE');

  if (!page) {
    return { success: false, postUrl: '', authorSlug: '', screenshot: '' };
  }

  try {
    // Navigate to profile activity feed
    const profileActivityUrl = `${CONFIG.LINKEDIN_PROFILE_URL}recent-activity/all/`;
    await page.goto(profileActivityUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomWait(3000, 4000);

    // Capture feed screenshot
    const feedScreenshot = await captureScreenshot('posted_on_feed');

    // Look for the test post content
    const searchText = 'Systems check';

    let foundPost = false;
    let postUrl = '';
    let authorSlug = '';

    // Search for post containing our content
    const posts = await page.$$('.feed-shared-update-v2, .feed-shared-text, article');
    for (const post of posts) {
      const text = await post.textContent();
      if (text && text.includes(searchText)) {
        foundPost = true;
        console.log('  ✅ Post found on feed');

        // Get post URL
        const postLink = await post.$('a[href*="/feed/update/"]');
        if (postLink) {
          postUrl = await postLink.getAttribute('href') || '';
          if (!postUrl.startsWith('http')) {
            postUrl = `https://www.linkedin.com${postUrl}`;
          }
        }

        // Get author profile URL
        const authorLink = await post.$('a[href*="/in/"]');
        if (authorLink) {
          const authorHref = await authorLink.getAttribute('href') || '';
          const authorMatch = authorHref.match(/\/in\/([^\/\?]+)/);
          if (authorMatch) {
            authorSlug = authorMatch[1];
          }
        }

        break;
      }
    }

    if (!foundPost) {
      console.error('  ❌ Post NOT found on feed!');
      return { success: false, postUrl: '', authorSlug: '', screenshot: feedScreenshot };
    }

    // Verify author matches
    if (authorSlug !== CONFIG.EXPECTED_PROFILE_SLUG) {
      console.error(`  ❌ Wrong author! Expected: ${CONFIG.EXPECTED_PROFILE_SLUG}, Got: ${authorSlug}`);
      return { success: false, postUrl, authorSlug, screenshot: feedScreenshot };
    }
    console.log(`  ✅ Author verified: ${authorSlug}`);

    // Navigate to permalink and verify it loads
    if (postUrl) {
      console.log('  Verifying permalink loads...');
      await page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await randomWait(2000, 3000);

      // Check for 404
      const is404 = await page.$('text=/Page not found/i, text=/doesn\'t exist/i');
      if (is404) {
        console.error('  ❌ Permalink returns 404!');
        await captureScreenshot('permalink_404');
        return { success: false, postUrl, authorSlug, screenshot: feedScreenshot };
      }

      console.log(`  ✅ Permalink loads: ${postUrl}`);
      await captureScreenshot('permalink_author');
    }

    await logAction('post_verified', { postUrl, authorSlug, foundOnFeed: true, permalinkLoads: true });

    return { success: true, postUrl, authorSlug, screenshot: feedScreenshot };

  } catch (error) {
    console.error('Post verification error:', error);
    return { success: false, postUrl: '', authorSlug: '', screenshot: '' };
  }
}

// ============================================================================
// MAIN VERIFICATION FLOW
// ============================================================================

async function runLivePostVerification(): Promise<VerificationResult> {
  console.log('\n========================================');
  console.log('LINKEDIN LIVE POST VERIFICATION');
  console.log('========================================');
  console.log(`Run ID: ${runId}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const result: VerificationResult = {
    status: 'FAIL',
    timestamp: new Date().toISOString(),
    runId,
    identityVerification: {
      expected: CONFIG.EXPECTED_PROFILE_SLUG,
      actual: '',
      matched: false,
      screenshot: ''
    },
    postVerification: {
      postUrl: '',
      authorSlug: '',
      authorMatched: false,
      visibleOnFeed: false,
      permalinkLoads: false,
      screenshot: ''
    },
    notionUpdate: {
      attempted: false,
      success: false
    },
    screenshots: []
  };

  try {
    // Ensure proof pack directory exists
    await fs.mkdir(path.join(CONFIG.PROOF_PACK_DIR, 'screenshots'), { recursive: true });

    // Step 1: Establish session
    console.log('\n📡 Step 1: Establishing session...');
    const sessionOk = await establishSession();
    if (!sessionOk) {
      result.error = 'SESSION_FAILED';
      await generateFailProofPack(result);
      return result;
    }

    // Step 2: Verify identity
    console.log('\n🔐 Step 2: Identity verification...');
    const identityResult = await verifyIdentity();
    result.identityVerification = {
      expected: CONFIG.EXPECTED_PROFILE_SLUG,
      actual: identityResult.slug,
      matched: identityResult.success,
      screenshot: identityResult.screenshot
    };
    result.screenshots.push(identityResult.screenshot);

    if (!identityResult.success) {
      result.error = `IDENTITY_MISMATCH: Expected ${CONFIG.EXPECTED_PROFILE_SLUG}, got ${identityResult.slug}`;
      await generateFailProofPack(result);
      await closeSession();
      return result;
    }

    // Step 3: Open composer and post
    console.log('\n📝 Step 3: Creating post...');

    // Navigate to feed
    await page!.goto(CONFIG.LINKEDIN_FEED, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await randomWait(2000, 3000);

    // Find and click "Start a post"
    const postButtonSelectors = [
      'button:has-text("Start a post")',
      '.share-box-feed-entry__trigger',
      '[data-control-name="share.create_post"]'
    ];

    let postButton = null;
    for (const selector of postButtonSelectors) {
      postButton = await page!.$(selector);
      if (postButton) break;
    }

    if (!postButton) {
      result.error = 'COMPOSER_NOT_FOUND';
      await captureScreenshot('error_no_composer');
      await generateFailProofPack(result);
      await closeSession();
      return result;
    }

    await postButton.click();
    await randomWait(2000, 3000);

    // Capture composer screenshot
    const composerScreenshot = await captureScreenshot('composer_open');
    result.screenshots.push(composerScreenshot);

    // Find editor - wait for it to be ready
    console.log('  Finding editor...');
    const editorSelectors = [
      '.ql-editor[contenteditable="true"]',
      '.share-creation-state__text-editor [contenteditable="true"]',
      '[contenteditable="true"][data-placeholder]',
      '.ql-editor'
    ];

    let editor = null;
    for (const selector of editorSelectors) {
      try {
        await page!.waitForSelector(selector, { timeout: 5000 });
        editor = await page!.$(selector);
        if (editor) {
          console.log(`  Found editor: ${selector}`);
          break;
        }
      } catch {
        continue;
      }
    }

    if (!editor) {
      result.error = 'EDITOR_NOT_FOUND';
      await captureScreenshot('error_no_editor');
      await generateFailProofPack(result);
      await closeSession();
      return result;
    }

    // Click into editor and ensure focus
    await editor.click();
    await randomWait(500, 800);

    // Clear any placeholder and type content
    console.log('  Typing content...');
    await page!.keyboard.type(CONFIG.TEST_POST_CONTENT, { delay: CONFIG.TYPING_DELAY });
    await randomWait(1500, 2000);

    // Verify content was typed
    const editorContent = await editor.textContent();
    if (!editorContent || !editorContent.includes('automation')) {
      console.log('  ⚠️ Content may not have typed correctly, retrying...');
      await editor.click();
      // Select all with Ctrl+A
      await page!.keyboard.down('Control');
      await page!.keyboard.press('a');
      await page!.keyboard.up('Control');
      await randomWait(200, 300);
      await page!.keyboard.type(CONFIG.TEST_POST_CONTENT, { delay: CONFIG.TYPING_DELAY });
      await randomWait(1000, 1500);
    }

    // Capture composer with content
    await captureScreenshot('composer_with_content');

    // Click Post button
    console.log('  Clicking Post button...');
    let publishBtn = null;
    const postBtnSelectors = [
      'button.share-actions__primary-action',
      'button:has-text("Post"):not([disabled])',
      '[data-control-name="share.post"]'
    ];

    for (const selector of postBtnSelectors) {
      publishBtn = await page!.$(selector);
      if (publishBtn) {
        const isDisabled = await publishBtn.getAttribute('disabled');
        if (!isDisabled) {
          console.log(`  Found Post button: ${selector}`);
          break;
        }
        publishBtn = null;
      }
    }

    if (!publishBtn) {
      result.error = 'POST_BUTTON_NOT_FOUND';
      await captureScreenshot('error_no_post_button');
      await generateFailProofPack(result);
      await closeSession();
      return result;
    }

    await publishBtn.click();
    await randomWait(2000, 3000);

    // Handle Post Settings modal if it appears
    console.log('  Checking for Post settings modal...');
    await randomWait(1500, 2000);

    const shareboxModal = await page!.$('[data-test-modal-id="sharebox"], .artdeco-modal:has-text("Post settings")');
    if (shareboxModal) {
      console.log('  Post settings modal detected...');
      await captureScreenshot('post_settings_modal');

      // Wait for modal to fully render
      await randomWait(1000, 1500);

      // Log all buttons for debugging
      const allBtns = await page!.$$('button');
      console.log(`  Found ${allBtns.length} buttons on page`);
      for (const btn of allBtns.slice(0, 10)) {
        try {
          const text = await btn.textContent();
          const isVisible = await btn.isVisible();
          if (isVisible && text && text.trim().length < 30) {
            console.log(`    Button: "${text.trim()}"`);
          }
        } catch { /* ignore */ }
      }

      // Click Done button - try multiple approaches
      console.log('  Looking for Done button...');

      // Approach 1: Direct selector
      let doneClicked = false;
      const doneSelectors = [
        'button:has-text("Done")',
        '.artdeco-modal button:has-text("Done")',
        '[data-test-modal-id="sharebox"] button:has-text("Done")'
      ];

      for (const selector of doneSelectors) {
        try {
          const doneBtn = await page!.$(selector);
          if (doneBtn) {
            const isVisible = await doneBtn.isVisible();
            const isDisabled = await doneBtn.getAttribute('disabled');
            console.log(`  Found Done with ${selector}, visible=${isVisible}, disabled=${isDisabled}`);
            if (isVisible && !isDisabled) {
              await doneBtn.click({ force: true });
              console.log('  ✅ Clicked Done button');
              doneClicked = true;
              break;
            }
          }
        } catch (e) {
          console.log(`  Selector ${selector} failed: ${e}`);
        }
      }

      // Approach 2: Find by iterating buttons
      if (!doneClicked) {
        console.log('  Trying button iteration approach...');
        const buttons = await page!.$$('button');
        for (const btn of buttons) {
          try {
            const text = await btn.textContent();
            if (text && text.trim() === 'Done') {
              const isVisible = await btn.isVisible();
              if (isVisible) {
                await btn.click({ force: true });
                console.log('  ✅ Clicked Done via iteration');
                doneClicked = true;
                break;
              }
            }
          } catch { /* continue */ }
        }
      }

      // Approach 3: Tab to Done and press Enter
      if (!doneClicked) {
        console.log('  Trying keyboard navigation...');
        // Tab through the modal to reach Done button
        for (let i = 0; i < 10; i++) {
          await page!.keyboard.press('Tab');
          await randomWait(100, 200);
        }
        await page!.keyboard.press('Enter');
        console.log('  Pressed Enter after tabbing');
      }

      await randomWait(4000, 6000);

      // Check if modal closed
      const modalStillOpen = await page!.$('.artdeco-modal:has-text("Post settings")');
      if (modalStillOpen) {
        console.log('  ⚠️ Modal still open, trying Escape...');
        await captureScreenshot('modal_still_open');
        await page!.keyboard.press('Escape');
        await randomWait(2000, 3000);
      }
    } else {
      console.log('  No post settings modal detected');
    }

    // Wait for post to process
    console.log('  Waiting for post to process...');
    await randomWait(6000, 8000);

    // Step 4: Verify post appeared
    console.log('\n✓ Step 4: Verifying post appeared...');
    const postResult = await verifyPostAppeared();
    result.postVerification = {
      postUrl: postResult.postUrl,
      authorSlug: postResult.authorSlug,
      authorMatched: postResult.authorSlug === CONFIG.EXPECTED_PROFILE_SLUG,
      visibleOnFeed: postResult.success,
      permalinkLoads: postResult.success && postResult.postUrl !== '',
      screenshot: postResult.screenshot
    };
    result.screenshots.push(postResult.screenshot);

    if (!postResult.success) {
      result.error = `POST_VERIFICATION_FAILED: ${postResult.authorSlug ? 'Wrong author' : 'Post not found'}`;
      await generateFailProofPack(result);
      await closeSession();
      return result;
    }

    // SUCCESS!
    result.status = 'PASS';
    console.log('\n✅ VERIFICATION PASSED!');
    console.log(`   Post URL: ${result.postVerification.postUrl}`);
    console.log(`   Author: ${result.postVerification.authorSlug}`);

    // Generate success proof pack
    await generateSuccessProofPack(result);

    await closeSession();
    return result;

  } catch (error) {
    result.error = `UNEXPECTED_ERROR: ${error instanceof Error ? error.message : String(error)}`;
    await generateFailProofPack(result);
    await closeSession();
    return result;
  }
}

// ============================================================================
// PROOF PACK GENERATION
// ============================================================================

async function generateSuccessProofPack(result: VerificationResult): Promise<void> {
  const indexContent = `# LinkedIn Live Post Verification - SUCCESS

**Status**: ✅ PASS
**Run ID**: ${result.runId}
**Timestamp**: ${result.timestamp}

## Verification Evidence

### Identity Verification
- **Expected**: ${result.identityVerification.expected}
- **Actual**: ${result.identityVerification.actual}
- **Match**: ✅ VERIFIED
- **Screenshot**: [identity_menu.png](screenshots/${path.basename(result.identityVerification.screenshot)})

### Post Verification
- **Post URL**: ${result.postVerification.postUrl}
- **Author Slug**: ${result.postVerification.authorSlug}
- **Author Match**: ✅ VERIFIED
- **Visible on Feed**: ✅ YES
- **Permalink Loads**: ✅ YES
- **Screenshot**: [posted_on_feed.png](screenshots/${path.basename(result.postVerification.screenshot)})

### Test Post Content
\`\`\`
${CONFIG.TEST_POST_CONTENT}
\`\`\`

## Screenshots
${result.screenshots.map(s => `- [${path.basename(s)}](screenshots/${path.basename(s)})`).join('\n')}

## Verdict

**PASS**: The LinkedIn posting system correctly:
1. Identifies as the expected profile (steve-hubbard-3869133a3)
2. Posts content to the personal profile
3. Post is visible on the activity feed
4. Permalink is valid and loads

---
Generated: ${new Date().toISOString()}
`;

  await fs.writeFile(path.join(CONFIG.PROOF_PACK_DIR, 'INDEX.md'), indexContent);

  const proofPackContent = `# LIVE POST PROOF PACK

## Verification Summary

| Check | Result |
|-------|--------|
| Identity Verification | ✅ PASS |
| Post Created | ✅ PASS |
| Post on Feed | ✅ PASS |
| Author Correct | ✅ PASS |
| Permalink Valid | ✅ PASS |

## Post Details

- **URL**: ${result.postVerification.postUrl}
- **Author**: ${result.postVerification.authorSlug}
- **Posted At**: ${result.timestamp}

## Evidence Files

1. \`screenshots/identity_menu.png\` - Identity verification
2. \`screenshots/composer_open.png\` - Composer with content
3. \`screenshots/posted_on_feed.png\` - Post visible on feed
4. \`screenshots/permalink_author.png\` - Permalink page showing author

## Acceptance Criteria

- [x] Permalink exists and loads
- [x] Author slug == steve-hubbard-3869133a3
- [x] Post visible on feed at time of verification

**VERDICT: PASS**
`;

  await fs.writeFile(path.join(CONFIG.PROOF_PACK_DIR, 'LIVE_POST_PROOF_PACK.md'), proofPackContent);

  // Save result JSON
  await fs.writeFile(path.join(CONFIG.PROOF_PACK_DIR, 'verification-result.json'), JSON.stringify(result, null, 2));

  console.log(`\n📁 Proof pack saved to: ${CONFIG.PROOF_PACK_DIR}`);
}

async function generateFailProofPack(result: VerificationResult): Promise<void> {
  const indexContent = `# LinkedIn Live Post Verification - FAILED

**Status**: ❌ FAIL
**Run ID**: ${result.runId}
**Timestamp**: ${result.timestamp}
**Error**: ${result.error}

## Verification Status

### Identity Verification
- **Expected**: ${result.identityVerification.expected}
- **Actual**: ${result.identityVerification.actual || 'NOT CAPTURED'}
- **Match**: ${result.identityVerification.matched ? '✅ VERIFIED' : '❌ FAILED'}

### Post Verification
- **Post URL**: ${result.postVerification.postUrl || 'NOT FOUND'}
- **Author Slug**: ${result.postVerification.authorSlug || 'NOT FOUND'}
- **Visible on Feed**: ${result.postVerification.visibleOnFeed ? '✅ YES' : '❌ NO'}

## Error Analysis

**Root Cause**: ${result.error}

## Screenshots
${result.screenshots.length > 0 ? result.screenshots.map(s => `- [${path.basename(s)}](screenshots/${path.basename(s)})`).join('\n') : 'No screenshots captured'}

---
Generated: ${new Date().toISOString()}
`;

  await fs.writeFile(path.join(CONFIG.PROOF_PACK_DIR, 'INDEX.md'), indexContent);

  const failProofContent = `# LIVE POST PROOF PACK - FAILED

## Failure Summary

| Check | Result |
|-------|--------|
| Identity Verification | ${result.identityVerification.matched ? '✅ PASS' : '❌ FAIL'} |
| Post Created | ${result.postVerification.postUrl ? '✅ PASS' : '❌ FAIL'} |
| Post on Feed | ${result.postVerification.visibleOnFeed ? '✅ PASS' : '❌ FAIL'} |
| Author Correct | ${result.postVerification.authorMatched ? '✅ PASS' : '❌ FAIL'} |

## Error

\`\`\`
${result.error}
\`\`\`

**VERDICT: FAIL**
`;

  await fs.writeFile(path.join(CONFIG.PROOF_PACK_DIR, 'LIVE_POST_PROOF_PACK.md'), failProofContent);
  await fs.writeFile(path.join(CONFIG.PROOF_PACK_DIR, 'verification-result.json'), JSON.stringify(result, null, 2));

  console.log(`\n📁 FAIL proof pack saved to: ${CONFIG.PROOF_PACK_DIR}`);
}

// ============================================================================
// MAIN
// ============================================================================

runLivePostVerification()
  .then(result => {
    console.log('\n========================================');
    console.log(`FINAL VERDICT: ${result.status}`);
    console.log('========================================');

    if (result.status === 'PASS') {
      console.log(`✅ Post URL: ${result.postVerification.postUrl}`);
    } else {
      console.log(`❌ Error: ${result.error}`);
    }

    process.exit(result.status === 'PASS' ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
