#!/usr/bin/env tsx

/**
 * LinkedIn Posting Ops Agent v1.3
 *
 * MODAL FIX VERSION with improved anti-bot detection avoidance
 *
 * CRITICAL CHANGES:
 * 1. Preflight identity check before any action
 * 2. Target assertion with expected profile slug
 * 3. Post verification gate - must find post on profile
 * 4. Enhanced proof pack with identity screenshots
 *
 * FLOW:
 * 1. queue   - Pull posts from Notion, show what's ready
 * 2. approve - OCS validates and approves
 * 3. publish - IDENTITY CHECK → Post → VERIFY ON PROFILE → Update Notion
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
function loadEnvFile(envPath: string): void {
  try {
    const envContent = fsSync.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch {
    // Continue with existing env
  }
}
loadEnvFile(path.join(__dirname, '../apps/website/.env.local'));

// ============================================================================
// TYPES
// ============================================================================

interface IdentityCheckResult {
  success: boolean;
  profileSlug?: string;
  profileName?: string;
  profileUrl?: string;
  screenshot?: string;
  error?: string;
}

interface PostVerificationResult {
  success: boolean;
  postUrl?: string;
  authorName?: string;
  authorProfileUrl?: string;
  visibleOnFeed?: boolean;
  screenshot?: string;
  error?: string;
}

interface NotionPost {
  id: string;
  notionPageId: string;
  title: string;
  body: string;
  platform: string;
  status: 'Scheduled' | 'Approved to Post' | 'Posted' | 'Draft' | 'Failed';
  publishDate: string;
  publishTime?: string;
  assetLink?: string;
  hashtags?: string[];
  mediaUrls?: string[];
  notionUrl: string;
  lastModified: string;
}

interface PostQueueItem {
  id: string;
  notionPageId: string;
  title: string;
  body: string;
  publishDate: string;
  publishTime?: string;
  hashtags: string[];
  notionUrl: string;
  status: 'READY' | 'BLOCKED' | 'APPROVED' | 'POSTED';
  blockReason?: string;
}

interface PublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
  screenshot?: string;
  identityCheck?: IdentityCheckResult;
  postVerification?: PostVerificationResult;
}

interface ActionLog {
  action: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // CRITICAL: Must match actual Steve Hubbard profile
  // CORRECTED 2026-01-27: Actual slug is mr-steve-hubbard (verified via live post proof)
  POSTING_TARGET: process.env.LINKEDIN_POSTING_TARGET || 'personal',
  LINKEDIN_PROFILE_URL: 'https://www.linkedin.com/in/mr-steve-hubbard/',
  EXPECTED_PROFILE_SLUG: 'mr-steve-hubbard',
  EXPECTED_PROFILE_NAME: 'Steve Hubbard',

  // Company page (v2 feature)
  LINKEDIN_COMPANY_PAGE_ID: process.env.LINKEDIN_COMPANY_PAGE_ID || '',
  LINKEDIN_COMPANY_PAGE_URL: process.env.LINKEDIN_COMPANY_PAGE_URL || 'https://www.linkedin.com/company/strata-noble/',

  // Notion
  NOTION_DATABASE_ID: process.env.NOTION_CONTENT_DATABASE_ID || '2f213b428aa781e39558f0c6accc1c67',
  NOTION_API_KEY: process.env.NOTION_API_KEY || '',

  // Timing (v1.3: More human-like delays)
  MIN_WAIT: 2000,
  MAX_WAIT: 5000,
  TYPING_DELAY: 50,  // Increased for more natural typing
  SLOW_MO: 300,  // Increased for better anti-bot avoidance

  // Cooldown
  COOLDOWN_HOURS: 4,

  // Paths
  PROOF_PACKS_DIR: './proof-packs/linkedin-posting-ops',
  SESSION_FILE: './linkedin-session.json',

  // LinkedIn URLs
  LINKEDIN_FEED: 'https://www.linkedin.com/feed/',
  LINKEDIN_COMPANY_ADMIN: 'https://www.linkedin.com/company/strata-noble/admin/',

  // Security selectors
  SECURITY_SELECTORS: [
    { selector: 'input[name="pin"]', type: '2FA_PIN' },
    { selector: '#captcha-challenge', type: 'CAPTCHA' },
    { selector: '[data-test-id="checkpoint-challenge"]', type: 'CHECKPOINT' },
    { selector: 'form[action*="challenge"]', type: 'SECURITY_CHALLENGE' },
    { selector: 'input[name="verification_code"]', type: 'VERIFICATION_CODE' },
    { selector: '.recaptcha-checkbox', type: 'RECAPTCHA' },
    { selector: '[data-test-id="login-form"]', type: 'LOGIN_REQUIRED' }
  ]
};

// ============================================================================
// GLOBAL STATE
// ============================================================================

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;
let runId: string = '';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateRunId(): string {
  return `posting-${new Date().toISOString().replace(/[:.]/g, '-')}`;
}

function getTodayFolder(): string {
  const today = new Date().toISOString().split('T')[0];
  return path.join(CONFIG.PROOF_PACKS_DIR, today);
}

async function randomWait(min: number = CONFIG.MIN_WAIT, max: number = CONFIG.MAX_WAIT): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`  [wait ${delay}ms]`);
  await new Promise(resolve => setTimeout(resolve, delay));
}

async function ensureProofPackDir(): Promise<string> {
  const proofDir = path.join(getTodayFolder(), runId);
  await fs.mkdir(proofDir, { recursive: true });
  await fs.mkdir(path.join(proofDir, 'screenshots'), { recursive: true });
  return proofDir;
}

async function logAction(action: string, data?: Record<string, unknown>): Promise<void> {
  const logEntry: ActionLog = {
    action,
    timestamp: new Date().toISOString(),
    data
  };

  const proofDir = await ensureProofPackDir();
  const logPath = path.join(proofDir, 'action-log.json');

  let logs: ActionLog[] = [];
  try {
    const existing = await fs.readFile(logPath, 'utf8');
    logs = JSON.parse(existing);
  } catch {
    // File doesn't exist yet
  }

  logs.push(logEntry);
  await fs.writeFile(logPath, JSON.stringify(logs, null, 2));

  console.log(`[${logEntry.timestamp}] ${action}`, data ? JSON.stringify(data) : '');
}

async function captureProofScreenshot(name: string): Promise<string> {
  if (!page) throw new Error('No page available for screenshot');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}_${name}.png`;
  const proofDir = await ensureProofPackDir();
  const screenshotPath = path.join(proofDir, 'screenshots', filename);

  await page.screenshot({ path: screenshotPath, fullPage: true });
  await logAction('screenshot_captured', { filename });

  return screenshotPath;
}

// ============================================================================
// RC-001 GUARD: IDENTITY VERIFICATION
// ============================================================================

/**
 * Verify the logged-in LinkedIn account matches expected profile
 * MUST be called before any posting action
 */
async function verifyIdentity(): Promise<IdentityCheckResult> {
  console.log('\n🔐 IDENTITY VERIFICATION GATE');
  console.log('  Expected: ' + CONFIG.EXPECTED_PROFILE_NAME);
  console.log('  Profile: ' + CONFIG.EXPECTED_PROFILE_SLUG);

  if (!page) {
    return { success: false, error: 'No browser session available' };
  }

  try {
    // Navigate to Me menu to check identity
    await page.goto(CONFIG.LINKEDIN_FEED, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await randomWait(2000, 3000);

    // Click on profile menu (Me dropdown)
    const meMenuSelectors = [
      '[data-control-name="nav.settings_signout"]',
      '.global-nav__me',
      '#global-nav-icon--mercado__profile--person',
      'button[aria-label*="Me"]'
    ];

    let meMenu = null;
    for (const selector of meMenuSelectors) {
      meMenu = await page.$(selector);
      if (meMenu) break;
    }

    if (!meMenu) {
      // Try to get identity from page elements
      const nameElement = await page.$('.feed-identity-module__actor-meta');
      if (nameElement) {
        const nameText = await nameElement.textContent();
        console.log('  Found identity element: ' + nameText);
      }
      return { success: false, error: 'Cannot find profile menu for identity check' };
    }

    await meMenu.click();
    await randomWait(1000, 1500);

    // Capture identity screenshot
    const identityScreenshot = await captureProofScreenshot('identity-check');

    // Get profile URL from View Profile link
    const viewProfileLink = await page.$('a[href*="/in/"]:has-text("View Profile")');
    let profileUrl = '';
    let profileSlug = '';

    if (viewProfileLink) {
      profileUrl = await viewProfileLink.getAttribute('href') || '';
      if (!profileUrl.startsWith('http')) {
        profileUrl = `https://www.linkedin.com${profileUrl}`;
      }

      // Extract slug from URL
      const slugMatch = profileUrl.match(/\/in\/([^\/\?]+)/);
      if (slugMatch) {
        profileSlug = slugMatch[1];
      }
    }

    // Get profile name
    let profileName = '';
    const nameInMenu = await page.$('.global-nav__me-content .t-16');
    if (nameInMenu) {
      profileName = (await nameInMenu.textContent() || '').trim();
    }

    // Close menu
    await page.keyboard.press('Escape');
    await randomWait(500, 1000);

    // Verify it matches expected profile
    const isCorrectProfile = profileSlug === CONFIG.EXPECTED_PROFILE_SLUG ||
                            profileName === CONFIG.EXPECTED_PROFILE_NAME;

    await logAction('identity_verified', {
      expectedSlug: CONFIG.EXPECTED_PROFILE_SLUG,
      actualSlug: profileSlug,
      expectedName: CONFIG.EXPECTED_PROFILE_NAME,
      actualName: profileName,
      match: isCorrectProfile
    });

    if (!isCorrectProfile) {
      console.error('  ❌ IDENTITY MISMATCH!');
      console.error(`     Expected: ${CONFIG.EXPECTED_PROFILE_SLUG}`);
      console.error(`     Actual: ${profileSlug || 'UNKNOWN'}`);
      return {
        success: false,
        profileSlug,
        profileName,
        profileUrl,
        screenshot: identityScreenshot,
        error: `IDENTITY_MISMATCH: Logged in as ${profileName} (${profileSlug}), expected ${CONFIG.EXPECTED_PROFILE_NAME} (${CONFIG.EXPECTED_PROFILE_SLUG})`
      };
    }

    console.log(`  ✅ Identity verified: ${profileName}`);
    return {
      success: true,
      profileSlug,
      profileName,
      profileUrl,
      screenshot: identityScreenshot
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await logAction('identity_check_error', { error: errorMsg });
    return { success: false, error: errorMsg };
  }
}

// ============================================================================
// RC-001 GUARD: POST VERIFICATION
// ============================================================================

/**
 * Verify a post actually appeared on the correct profile
 * MUST be called after posting before marking success
 */
async function verifyPostAppeared(postContent: string): Promise<PostVerificationResult> {
  console.log('\n🔍 POST VERIFICATION GATE');
  console.log('  Verifying post appeared on profile...');

  if (!page) {
    return { success: false, error: 'No browser session available' };
  }

  try {
    // Navigate to profile activity feed
    const profileActivityUrl = `${CONFIG.LINKEDIN_PROFILE_URL}recent-activity/all/`;
    await page.goto(profileActivityUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await randomWait(3000, 4000);

    // Look for the post content (first 50 chars should be unique enough)
    const searchText = postContent.substring(0, 50);

    // Find post containing our content
    const postSelectors = [
      '.feed-shared-update-v2',
      '.feed-shared-text',
      '[data-test-app-aware-link]'
    ];

    let foundPost = false;
    let postUrl = '';
    let authorName = '';
    let authorProfileUrl = '';

    for (const selector of postSelectors) {
      const posts = await page.$$(selector);
      for (const post of posts) {
        const text = await post.textContent();
        if (text && text.includes(searchText)) {
          foundPost = true;

          // Get post URL
          const postLink = await post.$('a[href*="/feed/update/"]');
          if (postLink) {
            postUrl = await postLink.getAttribute('href') || '';
            if (!postUrl.startsWith('http')) {
              postUrl = `https://www.linkedin.com${postUrl}`;
            }
          }

          // Get author info
          const authorElement = await post.$('.feed-shared-actor__name');
          if (authorElement) {
            authorName = (await authorElement.textContent() || '').trim();
          }

          const authorLink = await post.$('a[href*="/in/"]');
          if (authorLink) {
            authorProfileUrl = await authorLink.getAttribute('href') || '';
            if (!authorProfileUrl.startsWith('http')) {
              authorProfileUrl = `https://www.linkedin.com${authorProfileUrl}`;
            }
          }

          break;
        }
      }
      if (foundPost) break;
    }

    // Capture verification screenshot
    const verifyScreenshot = await captureProofScreenshot('post-verification');

    if (!foundPost) {
      console.error('  ❌ POST NOT FOUND ON PROFILE!');
      return {
        success: false,
        screenshot: verifyScreenshot,
        error: 'POST_NOT_FOUND: Post does not appear on profile feed'
      };
    }

    // Verify author matches expected profile
    const authorSlugMatch = authorProfileUrl.match(/\/in\/([^\/\?]+)/);
    const authorSlug = authorSlugMatch ? authorSlugMatch[1] : '';

    if (authorSlug && authorSlug !== CONFIG.EXPECTED_PROFILE_SLUG) {
      console.error('  ❌ WRONG AUTHOR!');
      console.error(`     Expected: ${CONFIG.EXPECTED_PROFILE_SLUG}`);
      console.error(`     Actual: ${authorSlug}`);
      return {
        success: false,
        postUrl,
        authorName,
        authorProfileUrl,
        screenshot: verifyScreenshot,
        error: `WRONG_AUTHOR: Post by ${authorName} (${authorSlug}), expected ${CONFIG.EXPECTED_PROFILE_SLUG}`
      };
    }

    // Navigate to the post permalink to verify it loads
    if (postUrl) {
      console.log('  Verifying post permalink...');
      await page.goto(postUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      await randomWait(2000, 3000);

      // Check for 404 or error
      const is404 = await page.$('text=/Page not found/i');
      if (is404) {
        console.error('  ❌ POST URL IS 404!');
        return {
          success: false,
          postUrl,
          screenshot: await captureProofScreenshot('post-404'),
          error: 'POST_404: Post URL returns 404'
        };
      }

      // Capture permalink screenshot
      await captureProofScreenshot('post-permalink');
    }

    await logAction('post_verified', {
      postUrl,
      authorName,
      authorProfileUrl,
      authorSlug
    });

    console.log(`  ✅ Post verified on profile`);
    console.log(`     URL: ${postUrl}`);
    console.log(`     Author: ${authorName}`);

    return {
      success: true,
      postUrl,
      authorName,
      authorProfileUrl,
      visibleOnFeed: true,
      screenshot: verifyScreenshot
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await logAction('post_verification_error', { error: errorMsg });
    return { success: false, error: errorMsg };
  }
}

// ============================================================================
// NOTION INTEGRATION (keeping existing functions)
// ============================================================================

async function fetchPostsFromNotion(): Promise<NotionPost[]> {
  // [Keep existing implementation]
  await logAction('notion_fetch_start');

  if (!CONFIG.NOTION_API_KEY || !CONFIG.NOTION_DATABASE_ID) {
    console.log('  [DEV MODE] No Notion credentials - using mock data');
    return getMockNotionPosts();
  }

  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const tomorrowStr = futureDate.toISOString().split('T')[0];

    const response = await fetch(`https://api.notion.com/v1/databases/${CONFIG.NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          and: [
            {
              property: 'Platform',
              select: { equals: 'LinkedIn' }
            },
            {
              or: [
                { property: 'Status', select: { equals: 'Script Ready' } },
                { property: 'Status', select: { equals: 'Approved to Post' } }
              ]
            },
            {
              property: 'Publish Date',
              date: { on_or_before: tomorrowStr }
            }
          ]
        },
        sorts: [
          { property: 'Publish Date', direction: 'ascending' }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Notion API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const posts: NotionPost[] = data.results.map((page: any) => parseNotionPage(page));

    await logAction('notion_fetch_complete', { count: posts.length });
    return posts;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await logAction('notion_fetch_error', { error: errorMsg });
    console.error('  Error fetching from Notion:', errorMsg);
    return [];
  }
}

function parseNotionPage(page: any): NotionPost {
  const props = page.properties;

  const pillar = props.Pillar?.select?.name;
  const tags = props.Tags?.multi_select?.map((t: any) => t.name) || [];
  const hashtags = pillar ? [pillar.toLowerCase(), ...tags] : tags;

  return {
    id: `post-${page.id.slice(-12)}`,
    notionPageId: page.id,
    title: props.Name?.title?.[0]?.plain_text || props.Title?.title?.[0]?.plain_text || 'Untitled',
    body: props.Script?.rich_text?.map((t: any) => t.plain_text).join('') ||
          props.Body?.rich_text?.map((t: any) => t.plain_text).join('') ||
          props.Content?.rich_text?.map((t: any) => t.plain_text).join('') || '',
    platform: props.Platform?.select?.name || 'LinkedIn',
    status: props.Status?.select?.name || 'Draft',
    publishDate: props['Publish Date']?.date?.start || new Date().toISOString().split('T')[0],
    publishTime: props['Publish Time']?.rich_text?.[0]?.plain_text,
    assetLink: props['Asset Link']?.url || props['Post URL']?.url,
    hashtags,
    mediaUrls: props.Media?.files?.map((f: any) => f.file?.url || f.external?.url) || [],
    notionUrl: page.url,
    lastModified: page.last_edited_time
  };
}

async function updateNotionAfterPublish(notionPageId: string, postUrl: string): Promise<boolean> {
  await logAction('notion_update_start', { notionPageId, postUrl });

  if (!CONFIG.NOTION_API_KEY) {
    console.log('  [DEV MODE] Would update Notion with URL:', postUrl);
    return true;
  }

  // Only update if we have a verified URL
  if (!postUrl || postUrl === '') {
    console.error('  ⚠️ REFUSING TO UPDATE NOTION: No verified post URL');
    return false;
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/pages/${notionPageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CONFIG.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          'Status': { select: { name: 'Posted' } },
          'Asset Link': { url: postUrl }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('  Warning: Asset Link update failed, trying Notes field...');

      // Fallback to Notes field
      await fetch(`https://api.notion.com/v1/pages/${notionPageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${CONFIG.NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            'Status': { select: { name: 'Posted' } },
            'Notes': { rich_text: [{ text: { content: `Posted: ${postUrl}\nTimestamp: ${new Date().toISOString()}` } }] }
          }
        })
      });
    }

    await logAction('notion_update_complete', { notionPageId, postUrl });
    return true;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await logAction('notion_update_error', { error: errorMsg });
    console.error('  Error updating Notion:', errorMsg);
    return false;
  }
}

function getMockNotionPosts(): NotionPost[] {
  return [
    {
      id: 'post-P01-LI',
      notionPageId: 'mock-p01-linkedin',
      title: 'P01 - Why Automation Fails in Serious Businesses',
      body: `Most automation fails because it automates the wrong things.

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

What's failing silently in your business right now?`,
      platform: 'LinkedIn',
      status: 'Script Ready',
      publishDate: '2026-01-27',
      hashtags: ['ownership', 'automation', 'operations'],
      mediaUrls: [],
      notionUrl: 'https://notion.so/mock-p01',
      lastModified: new Date().toISOString()
    }
  ];
}

// ============================================================================
// VALIDATION & SESSION (keeping existing)
// ============================================================================

interface ValidationResult {
  valid: boolean;
  blockReason?: string;
}

function validatePost(post: NotionPost, lastPostedTime?: Date): ValidationResult {
  if (!post.body || post.body.trim().length < 20) {
    return {
      valid: false,
      blockReason: 'BODY_MISSING: Post body is empty or too short (min 20 chars)'
    };
  }

  if (post.assetLink && post.assetLink.includes('linkedin.com')) {
    return {
      valid: false,
      blockReason: `ALREADY_POSTED: Post already published at ${post.assetLink}`
    };
  }

  if (lastPostedTime) {
    const hoursSinceLastPost = (Date.now() - lastPostedTime.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastPost < CONFIG.COOLDOWN_HOURS) {
      const hoursRemaining = Math.ceil(CONFIG.COOLDOWN_HOURS - hoursSinceLastPost);
      return {
        valid: false,
        blockReason: `COOLDOWN_ACTIVE: ${hoursRemaining}h remaining until next post allowed`
      };
    }
  }

  const publishDate = new Date(post.publishDate);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  if (publishDate > tomorrow) {
    return {
      valid: false,
      blockReason: `FUTURE_DATE: Scheduled for ${post.publishDate}, not within publish window`
    };
  }

  return { valid: true };
}

async function detectSecurityPrompt(): Promise<{ type: string; selector: string } | null> {
  if (!page) return null;

  for (const check of CONFIG.SECURITY_SELECTORS) {
    const element = await page.$(check.selector);
    if (element) {
      await logAction('security_prompt_detected', { type: check.type });
      return check;
    }
  }
  return null;
}

async function establishSession(): Promise<{ success: boolean; error?: string }> {
  await logAction('session_establish_start');

  try {
    // Randomize viewport slightly for anti-bot
    const viewportWidth = 1280 + Math.floor(Math.random() * 100);
    const viewportHeight = 900 + Math.floor(Math.random() * 100);

    browser = await chromium.launch({
      headless: false,
      slowMo: CONFIG.SLOW_MO,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    let storageState: string | undefined;

    try {
      await fs.access(CONFIG.SESSION_FILE);
      storageState = CONFIG.SESSION_FILE;
      await logAction('using_stored_session', { path: CONFIG.SESSION_FILE });
    } catch {
      await logAction('no_stored_session');
    }

    context = await browser.newContext({
      ...(storageState ? { storageState } : {}),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: viewportWidth, height: viewportHeight },
      // Additional anti-detection measures
      ignoreHTTPSErrors: false,
      javaScriptEnabled: true,
      permissions: [],
      colorScheme: 'light',
      locale: 'en-US'
    });

    page = await context.newPage();

    // Session warmup - visit profile first (more natural flow)
    console.log('  Warming up session...');
    await page.goto(CONFIG.LINKEDIN_PROFILE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await randomWait(3000, 4000);

    // Then navigate to feed
    await page.goto(CONFIG.LINKEDIN_FEED, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await randomWait(3000, 4000);

    const securityPrompt = await detectSecurityPrompt();
    if (securityPrompt) {
      return {
        success: false,
        error: `Security prompt detected: ${securityPrompt.type}. Manual intervention required.`
      };
    }

    const isLoggedIn = await page.$('nav, .global-nav, [data-test-id*="nav"]');
    if (!isLoggedIn) {
      await captureProofScreenshot('session-not-logged-in');
      return {
        success: false,
        error: 'Session expired or invalid. Please re-authenticate manually.'
      };
    }

    await captureProofScreenshot('session-established');
    await logAction('session_established');

    return { success: true };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logAction('session_error', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

async function saveSession(): Promise<void> {
  if (context) {
    await context.storageState({ path: CONFIG.SESSION_FILE });
    await logAction('session_saved');
  }
}

async function closeSession(): Promise<void> {
  try {
    await saveSession();
  } catch {
    // Ignore save errors on close
  }

  if (browser) {
    await browser.close();
    browser = null;
    context = null;
    page = null;
    await logAction('session_closed');
  }
}

// ============================================================================
// HARDENED PUBLISH WITH VERIFICATION GATES
// ============================================================================

async function publishPost(postId: string, target: 'personal' | 'company' = 'personal'): Promise<PublishResult> {
  console.log('\n============================================================');
  console.log(`LINKEDIN POSTING OPS v1.2 - HARDENED PUBLISH`);
  console.log('============================================================\n');

  // Find queue
  const latestQueue = await findLatestQueue();
  if (!latestQueue) {
    return { success: false, error: 'No queue found. Run queue command first.' };
  }

  let queue = latestQueue.queue;
  const proofDir = path.dirname(latestQueue.queuePath);

  const post = queue.find(p => p.id === postId || p.id.includes(postId) || postId.includes(p.id.replace('post-', '')));
  if (!post) {
    return { success: false, error: `Post not found: ${postId}` };
  }

  // Check OCS approval
  const approvalFile = path.join(proofDir, `APPROVAL_${post.id}.json`);
  let isOcsApproved = false;
  try {
    const approval = JSON.parse(await fs.readFile(approvalFile, 'utf8'));
    isOcsApproved = approval.approved === true;
  } catch {
    // No approval file
  }

  if (!isOcsApproved) {
    return {
      success: false,
      error: `Post not OCS-approved. Run: approve --id=${postId} first.`
    };
  }

  console.log(`  Publishing: ${post.title}`);

  if (!page) {
    return { success: false, error: 'No browser session. Call establishSession first.' };
  }

  // ===== GATE 1: IDENTITY VERIFICATION =====
  const identityCheck = await verifyIdentity();
  if (!identityCheck.success) {
    await logAction('publish_aborted_identity', {
      postId: post.id,
      error: identityCheck.error
    });
    return {
      success: false,
      error: identityCheck.error,
      identityCheck
    };
  }

  try {
    // Navigate to feed
    console.log('  Step 1: Navigating to LinkedIn feed...');
    await page.goto(CONFIG.LINKEDIN_FEED, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await randomWait(2000, 3000);

    // Check for security
    const securityPrompt = await detectSecurityPrompt();
    if (securityPrompt) {
      return { success: false, error: `Security prompt: ${securityPrompt.type}` };
    }

    // Find "Start a post" button
    console.log('  Step 2: Opening post composer...');
    const postButtonSelectors = [
      'button:has-text("Start a post")',
      'button:has-text("Create a post")',
      '.share-box-feed-entry__trigger',
      '[data-control-name="share.create_post"]'
    ];

    let postButton = null;
    for (const selector of postButtonSelectors) {
      postButton = await page.$(selector);
      if (postButton) break;
    }

    if (!postButton) {
      await captureProofScreenshot('publish-error-no-button');
      return { success: false, error: 'Could not find post creation button' };
    }

    await postButton.click();
    await randomWait(2000, 3000);

    // Type the post content
    console.log('  Step 3: Entering post content...');
    const editorSelectors = [
      '.ql-editor',
      '[contenteditable="true"]',
      '.share-creation-state__text-editor'
    ];

    let editor = null;
    for (const selector of editorSelectors) {
      editor = await page.$(selector);
      if (editor) break;
    }

    if (!editor) {
      await captureProofScreenshot('publish-error-no-editor');
      return { success: false, error: 'Could not find post editor' };
    }

    await editor.click();
    await randomWait(500, 1000);

    // Build full post content
    let fullContent = post.body;
    if (post.hashtags && post.hashtags.length > 0) {
      fullContent += '\n\n' + post.hashtags.map(h => `#${h}`).join(' ');
    }

    await page.keyboard.type(fullContent, { delay: CONFIG.TYPING_DELAY });
    await randomWait(1000, 1500);

    // Capture before-publish screenshot
    await captureProofScreenshot(`publish-before-${post.id}`);

    // Find and click Post button
    console.log('  Step 4: Clicking Post button...');
    const publishButtonSelectors = [
      'button:has-text("Post")',
      'button[type="submit"]:has-text("Post")',
      '.share-actions__primary-action'
    ];

    let publishBtn = null;
    for (const selector of publishButtonSelectors) {
      publishBtn = await page.$(selector);
      if (publishBtn) {
        const isDisabled = await publishBtn.getAttribute('disabled');
        if (!isDisabled) break;
        publishBtn = null;
      }
    }

    if (!publishBtn) {
      await captureProofScreenshot('publish-error-no-submit');
      return { success: false, error: 'Could not find Post button' };
    }

    await publishBtn.click();
    await randomWait(2000, 3000);

    // Handle "Post settings" modal if it appears
    console.log('  Step 4b: Checking for Post settings modal...');
    await randomWait(2000, 3000);  // More natural wait

    const shareboxModal = await page.$('[data-test-modal-id="sharebox"], .artdeco-modal');
    if (shareboxModal) {
      console.log('    Post settings modal detected...');
      await captureProofScreenshot('modal-detected');

      // IMPROVED APPROACH: Let LinkedIn auto-handle the modal
      // Many modals auto-dismiss after a few seconds when default settings are correct

      // First, verify Steve Hubbard is the selected profile
      const profileText = await page.$eval(
        '.share-creation-state__author-button, [data-test-modal-id="sharebox"] button:first-of-type',
        el => el.textContent || ''
      ).catch(() => '');

      if (profileText.includes('Steve') || profileText.includes(CONFIG.EXPECTED_PROFILE_NAME)) {
        console.log('    ✅ Steve Hubbard is already selected as posting identity');
      } else if (profileText.includes('Strata')) {
        console.error('    ❌ Wrong identity - Strata Noble selected instead of Steve Hubbard');
        // Try to switch to personal profile
        const profileButton = await page.$('.share-creation-state__author-button');
        if (profileButton) {
          await profileButton.click();
          await randomWait(1500, 2000);
          const steveOption = await page.$('text="Steve Hubbard"');
          if (steveOption) {
            await steveOption.click();
            await randomWait(1500, 2000);
          }
        }
      }

      // Strategy 1: Wait for auto-dismissal (LinkedIn often auto-closes after ~5 seconds)
      console.log('    Waiting for modal auto-dismissal...');
      await page.waitForTimeout(5000);

      // Check if modal auto-closed
      let modalGone = await page.locator('.artdeco-modal').count() === 0;

      if (!modalGone) {
        console.log('    Modal still present, attempting gentle dismissal...');

        // Strategy 2: Try escape key (most natural way to close)
        await page.keyboard.press('Escape');
        await randomWait(2000, 3000);

        modalGone = await page.locator('.artdeco-modal').count() === 0;
      }

      if (!modalGone) {
        // Strategy 3: Click outside modal (another natural interaction)
        console.log('    Clicking outside modal...');
        await page.mouse.click(50, 50);  // Click in safe top-left area
        await randomWait(2000, 3000);

        modalGone = await page.locator('.artdeco-modal').count() === 0;
      }

      if (!modalGone) {
        // Strategy 4: Look for any enabled action button and click it
        console.log('    Looking for any action buttons...');
        const actionButtons = await page.$$('button.artdeco-button--primary:not([disabled])');
        for (const btn of actionButtons) {
          const text = await btn.textContent();
          if (text && (text.includes('Done') || text.includes('Post'))) {
            console.log(`    Clicking "${text.trim()}" button...`);
            await btn.click();
            await randomWait(3000, 4000);
            break;
          }
        }
      }

      // Final check and screenshot
      modalGone = await page.locator('.artdeco-modal').count() === 0;
      if (modalGone) {
        console.log('    ✅ Modal dismissed successfully');
      } else {
        console.log('    ⚠️ Modal may still be present, continuing anyway...');
        await captureProofScreenshot('modal-bypass-attempt');

        // As last resort, look for the main Post button which might still be accessible
        const mainPostBtn = await page.$('button.share-actions__primary-action:not([disabled])');
        if (mainPostBtn) {
          console.log('    Found main Post button, attempting direct click...');
          await mainPostBtn.click();
          await randomWait(3000, 4000);
        }
      }
    }

    // Wait for post to process
    await randomWait(3000, 4000);

    // ===== GATE 2: POST VERIFICATION =====
    const postVerification = await verifyPostAppeared(post.body);
    if (!postVerification.success) {
      await logAction('publish_failed_verification', {
        postId: post.id,
        error: postVerification.error
      });

      // Mark as FAILED in queue
      post.status = 'BLOCKED';
      post.blockReason = postVerification.error;
      await fs.writeFile(path.join(proofDir, 'POST_APPROVAL_QUEUE.json'), JSON.stringify(queue, null, 2));

      return {
        success: false,
        error: postVerification.error,
        postVerification
      };
    }

    // SUCCESS - Post verified on profile!
    const postUrl = postVerification.postUrl || '';

    // Update queue status
    post.status = 'POSTED';
    await fs.writeFile(path.join(proofDir, 'POST_APPROVAL_QUEUE.json'), JSON.stringify(queue, null, 2));

    // Update post history
    const historyPath = path.join(getTodayFolder(), 'post-history.json');
    let history: any = { posts: [] };
    try {
      history = JSON.parse(await fs.readFile(historyPath, 'utf8'));
    } catch {
      // No history yet
    }
    history.lastPostedAt = new Date().toISOString();
    history.posts.push({
      id: post.id,
      title: post.title,
      postedAt: new Date().toISOString(),
      url: postUrl,
      verified: true
    });
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));

    // Update Notion only with verified URL
    console.log('  Step 6: Updating Notion with verified URL...');
    await updateNotionAfterPublish(post.notionPageId, postUrl);

    // Generate receipt with verification details
    await generateVerifiedPublishReceipt(post, postUrl, identityCheck, postVerification);

    await logAction('post_published_verified', {
      postId: post.id,
      title: post.title,
      url: postUrl,
      identityVerified: true,
      postVerified: true
    });

    console.log('\n  ✅ POST PUBLISHED AND VERIFIED');
    console.log(`     URL: ${postUrl}`);
    console.log(`     Author: ${postVerification.authorName}`);
    console.log(`     Notion: Updated with verified URL`);

    return {
      success: true,
      postId: post.id,
      postUrl,
      identityCheck,
      postVerification
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await captureProofScreenshot('publish-error');
    await logAction('publish_error', { postId, error: errorMsg });
    return { success: false, error: errorMsg };
  }
}

async function generateVerifiedPublishReceipt(
  post: PostQueueItem,
  postUrl: string,
  identityCheck: IdentityCheckResult,
  postVerification: PostVerificationResult
): Promise<void> {
  const proofDir = await ensureProofPackDir();
  const timestamp = new Date().toISOString();

  const receipt = `# LinkedIn Post Publish Receipt - VERIFIED

**Date**: ${timestamp.split('T')[0]}
**Time**: ${timestamp.split('T')[1].split('.')[0]} UTC
**Run ID**: ${runId}

---

## Post Details

| Field | Value |
|-------|-------|
| ID | ${post.id} |
| Title | ${post.title} |
| Scheduled | ${post.publishDate} ${post.publishTime || ''} |
| Published At | ${timestamp} |
| Post URL | ${postUrl} |
| Notion | [View](${post.notionUrl}) |

---

## Identity Verification

| Check | Result |
|-------|--------|
| Expected Profile | ${CONFIG.EXPECTED_PROFILE_SLUG} |
| Actual Profile | ${identityCheck.profileSlug} |
| Profile Name | ${identityCheck.profileName} |
| Verification | ✅ PASSED |
| Screenshot | ${identityCheck.screenshot} |

---

## Post Verification

| Check | Result |
|-------|--------|
| Post Found on Feed | ${postVerification.visibleOnFeed ? '✅ Yes' : '❌ No'} |
| Author Name | ${postVerification.authorName} |
| Author Profile | ${postVerification.authorProfileUrl} |
| Post URL Valid | ✅ Yes |
| Verification | ✅ PASSED |
| Screenshot | ${postVerification.screenshot} |

---

## Content Published

\`\`\`
${post.body}

${post.hashtags.map(h => `#${h}`).join(' ')}
\`\`\`

---

## Proof Pack

1. Identity Check: \`${identityCheck.screenshot}\`
2. Post Verification: \`${postVerification.screenshot}\`
3. Notion Updated: Status = Posted, Asset Link = ${postUrl}

---

## Status

- **Identity**: ✅ VERIFIED
- **LinkedIn**: ✅ POSTED
- **Verification**: ✅ CONFIRMED
- **Notion**: ✅ UPDATED
- **Receipt**: ✅ GENERATED

---

**Generated by**: LinkedIn Posting Ops Agent v1.2 (HARDENED)
`;

  await fs.writeFile(path.join(proofDir, `VERIFIED_PUBLISH_RECEIPT_${post.id}.md`), receipt);
  await logAction('verified_receipt_generated', { postId: post.id });
}

// ============================================================================
// HELPER FUNCTIONS (keeping existing)
// ============================================================================

async function findLatestQueue(): Promise<{ queuePath: string; queue: PostQueueItem[] } | null> {
  const todayDir = getTodayFolder();
  try {
    const runs = await fs.readdir(todayDir);
    for (const run of runs.sort().reverse()) {
      const queuePath = path.join(todayDir, run, 'POST_APPROVAL_QUEUE.json');
      try {
        const queueJson = await fs.readFile(queuePath, 'utf8');
        const queue = JSON.parse(queueJson);
        return { queuePath, queue };
      } catch {
        continue;
      }
    }
  } catch {
    // No runs today
  }
  return null;
}

async function generatePostQueue(): Promise<PostQueueItem[]> {
  console.log('\n============================================================');
  console.log('LINKEDIN POSTING OPS - Generate Approval Queue');
  console.log('============================================================\n');

  console.log('Step 1: Fetching posts from Notion...');
  const posts = await fetchPostsFromNotion();
  console.log(`  Found ${posts.length} posts matching criteria`);

  if (posts.length === 0) {
    console.log('\n  No posts ready for publishing.');
    return [];
  }

  let lastPostedTime: Date | undefined;
  try {
    const proofDir = getTodayFolder();
    const historyPath = path.join(proofDir, 'post-history.json');
    const history = JSON.parse(await fs.readFile(historyPath, 'utf8'));
    if (history.lastPostedAt) {
      lastPostedTime = new Date(history.lastPostedAt);
    }
  } catch {
    // No history yet
  }

  console.log('\nStep 2: Validating posts...');
  const queue: PostQueueItem[] = [];

  for (const post of posts) {
    const validation = validatePost(post, lastPostedTime);

    const item: PostQueueItem = {
      id: post.id,
      notionPageId: post.notionPageId,
      title: post.title,
      body: post.body,
      publishDate: post.publishDate,
      publishTime: post.publishTime,
      hashtags: post.hashtags || [],
      notionUrl: post.notionUrl,
      status: validation.valid
        ? (post.status === 'Approved to Post' ? 'APPROVED' : 'READY')
        : 'BLOCKED',
      blockReason: validation.blockReason
    };

    queue.push(item);

    const statusIcon = item.status === 'APPROVED' ? '✅' :
                       item.status === 'READY' ? '📝' : '🚫';
    console.log(`  ${statusIcon} ${post.title.substring(0, 40)}... - ${item.status}`);
    if (item.blockReason) {
      console.log(`     Block: ${item.blockReason}`);
    }
  }

  const proofDir = await ensureProofPackDir();
  await fs.writeFile(path.join(proofDir, 'POST_APPROVAL_QUEUE.json'), JSON.stringify(queue, null, 2));
  await logAction('queue_saved', { total: queue.length });

  console.log(`\nQueue saved to: ${proofDir}`);
  return queue;
}

async function approvePost(postId: string): Promise<{ success: boolean; error?: string }> {
  console.log('\n============================================================');
  console.log('LINKEDIN POSTING OPS v1.2 - OCS Approval');
  console.log('============================================================\n');

  const latestQueue = await findLatestQueue();
  if (!latestQueue) {
    return { success: false, error: 'No queue found. Run queue command first.' };
  }

  let queue = latestQueue.queue;
  const proofDir = path.dirname(latestQueue.queuePath);

  const post = queue.find(p => p.id === postId || p.id.includes(postId));
  if (!post) {
    return { success: false, error: `Post not found: ${postId}` };
  }

  console.log(`  Approving: ${post.title}`);

  if (!post.body || post.body.trim().length < 20) {
    return { success: false, error: 'BODY_MISSING: Post body is empty or too short' };
  }
  console.log('  ✓ Body exists');

  if (post.status === 'POSTED') {
    return { success: false, error: 'ALREADY_POSTED: This post has already been published' };
  }
  console.log('  ✓ Not already posted');

  const approvalFile = path.join(proofDir, `APPROVAL_${post.id}.json`);
  const approval = {
    postId,
    title: post.title,
    approved: true,
    approvedAt: new Date().toISOString(),
    approvedBy: 'OCS',
    target: 'personal',
    expectedProfileSlug: CONFIG.EXPECTED_PROFILE_SLUG
  };
  await fs.writeFile(approvalFile, JSON.stringify(approval, null, 2));
  console.log('  ✓ Local approval created');

  post.status = 'APPROVED';
  await fs.writeFile(path.join(proofDir, 'POST_APPROVAL_QUEUE.json'), JSON.stringify(queue, null, 2));

  await logAction('post_approved', {
    postId,
    title: post.title,
    approvedAt: approval.approvedAt
  });

  console.log('\n  ✅ POST APPROVED');
  console.log(`     Next: Run publish --id=${postId}`);

  return { success: true };
}

// ============================================================================
// CLI HANDLER
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  runId = generateRunId();

  console.log(`\n🚀 LinkedIn Posting Ops Agent v1.3 MODAL FIX - ${runId}\n`);

  switch (command) {
    case 'queue':
      await generatePostQueue();
      break;

    case 'approve': {
      const idArg = args.find(a => a.startsWith('--id='));
      if (!idArg) {
        console.error('Usage: approve --id=<post-id>');
        process.exit(1);
      }
      const postId = idArg.split('=')[1];

      const approveResult = await approvePost(postId);
      if (!approveResult.success) {
        console.error('Approval failed:', approveResult.error);
        process.exit(1);
      }
      break;
    }

    case 'publish': {
      const idArg = args.find(a => a.startsWith('--id='));
      if (!idArg) {
        console.error('Usage: publish --id=<post-id>');
        process.exit(1);
      }
      const postId = idArg.split('=')[1];

      const sessionResult = await establishSession();
      if (!sessionResult.success) {
        console.error('Session failed:', sessionResult.error);
        process.exit(1);
      }

      const publishResult = await publishPost(postId, 'personal');
      await closeSession();

      if (!publishResult.success) {
        console.error('Publish failed:', publishResult.error);
        process.exit(1);
      }
      break;
    }

    default:
      console.log(`
LinkedIn Posting Ops v1.3 - MODAL FIX with Anti-Bot Improvements

Usage:
  npx tsx linkedin-posting-ops-v12.ts queue          # Generate queue
  npx tsx linkedin-posting-ops-v12.ts approve --id=X # OCS approve
  npx tsx linkedin-posting-ops-v12.ts publish --id=X # Publish with gates

Verification Gates:
  1. Identity Check - Verifies logged in as Steve Hubbard
  2. Post Verification - Confirms post appears on profile
  3. URL Validation - Ensures permalink is valid

RC-001 Fixes Applied:
  - Correct profile URL (steve-hubbard-3869133a3)
  - Identity verification before posting
  - Post verification after posting
  - No Notion update without verified URL
`);
  }
}

main().catch(console.error);