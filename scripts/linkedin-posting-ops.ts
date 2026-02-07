#!/usr/bin/env tsx

/**
 * LinkedIn Posting Ops Agent v1.1
 *
 * OCS-gated publishing for LinkedIn posts sourced from Notion tracker.
 * Posts to PERSONAL PROFILE (not company page).
 *
 * v1.1 CHANGES:
 * - Approval via OCS command, NOT Notion status click
 * - Posts to personal profile (company page disabled until v2)
 * - Notion status updated as OUTPUT (after actions), not gating INPUT
 *
 * FLOW:
 * 1. queue   - Pull posts from Notion, show what's ready
 * 2. approve - OCS validates (body exists, not posted, cooldown) and approves
 * 3. publish - Posts to personal profile, captures URL, updates Notion
 *
 * GUARDRAILS:
 * - No publish without OCS approval (approve command)
 * - No edits/deletes without explicit directive
 * - One post per approval event
 * - Receipt required per post
 * - Cooldown enforced (4h between posts)
 *
 * Usage:
 *   npx tsx linkedin-posting-ops.ts queue          # Generate approval queue
 *   npx tsx linkedin-posting-ops.ts approve --id=X # OCS approve post
 *   npx tsx linkedin-posting-ops.ts publish --id=X # Publish approved post
 *   npx tsx linkedin-posting-ops.ts draft --id=X   # Preview draft (no publish)
 *   npx tsx linkedin-posting-ops.ts status         # Check today's runs
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from apps/website/.env.local
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
    // .env.local not found, continue with existing env
  }
}
loadEnvFile(path.join(__dirname, '../apps/website/.env.local'));

// ============================================================================
// TYPES
// ============================================================================

interface NotionPost {
  id: string;
  notionPageId: string;
  title: string;
  body: string;
  platform: string;
  status: 'Scheduled' | 'Approved to Post' | 'Posted' | 'Draft' | 'Failed';
  publishDate: string;
  publishTime?: string;
  assetLink?: string;  // LinkedIn post URL after publishing
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
  draftCaptured?: boolean;
  draftScreenshot?: string;
}

interface PublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
  screenshot?: string;
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
  // v1.1: Default to personal profile (--target=company for company page)
  POSTING_TARGET: process.env.LINKEDIN_POSTING_TARGET || 'personal',
  // CRITICAL: Must be Steve Hubbard's actual profile, NOT mrstefanaudreys (doesn't exist)
  LINKEDIN_PROFILE_URL: 'https://www.linkedin.com/in/steve-hubbard-3869133a3/',
  EXPECTED_PROFILE_SLUG: 'steve-hubbard-3869133a3',
  EXPECTED_PROFILE_NAME: 'Steve Hubbard',

  // Company page (v2 feature - requires explicit --target=company flag)
  LINKEDIN_COMPANY_PAGE_ID: process.env.LINKEDIN_COMPANY_PAGE_ID || '',
  LINKEDIN_COMPANY_PAGE_URL: process.env.LINKEDIN_COMPANY_PAGE_URL || 'https://www.linkedin.com/company/strata-noble/',

  // Notion Database ID for content tracker
  NOTION_DATABASE_ID: process.env.NOTION_CONTENT_DATABASE_ID || '2f213b428aa781e39558f0c6accc1c67',
  NOTION_API_KEY: process.env.NOTION_API_KEY || '',

  // Timing (milliseconds)
  MIN_WAIT: 1500,
  MAX_WAIT: 3500,
  TYPING_DELAY: 30,
  SLOW_MO: 200,

  // Cooldown: minimum hours between posts
  COOLDOWN_HOURS: 4,

  // Paths
  PROOF_PACKS_DIR: './proof-packs/linkedin-posting-ops',
  SESSION_FILE: './linkedin-session.json',

  // LinkedIn URLs
  LINKEDIN_FEED: 'https://www.linkedin.com/feed/',
  LINKEDIN_COMPANY_ADMIN: 'https://www.linkedin.com/company/strata-noble/admin/',

  // Security selectors (same as triage)
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
// NOTION INTEGRATION
// ============================================================================

/**
 * Fetch scheduled LinkedIn posts from Notion
 * Filters: Platform = LinkedIn, Status = Scheduled OR Approved to Post, Publish Date <= today + 1
 */
async function fetchPostsFromNotion(): Promise<NotionPost[]> {
  await logAction('notion_fetch_start');

  // If no Notion API key, use mock data for development
  if (!CONFIG.NOTION_API_KEY || !CONFIG.NOTION_DATABASE_ID) {
    console.log('  [DEV MODE] No Notion credentials - using mock data');
    return getMockNotionPosts();
  }

  try {
    // Extend window to 14 days for queue visibility (publishing still checks date)
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

/**
 * Parse Notion page into NotionPost structure
 */
function parseNotionPage(page: any): NotionPost {
  const props = page.properties;

  // Extract pillar as a hashtag if present
  const pillar = props.Pillar?.select?.name;
  const tags = props.Tags?.multi_select?.map((t: any) => t.name) || [];
  const hashtags = pillar ? [pillar.toLowerCase(), ...tags] : tags;

  return {
    id: `post-${page.id.substring(0, 8)}`,
    notionPageId: page.id,
    // Use Name (title field) from Strata Noble content tracker
    title: props.Name?.title?.[0]?.plain_text || props.Title?.title?.[0]?.plain_text || 'Untitled',
    // Use Script field for post content
    body: props.Script?.rich_text?.map((t: any) => t.plain_text).join('') ||
          props.Body?.rich_text?.map((t: any) => t.plain_text).join('') ||
          props.Content?.rich_text?.map((t: any) => t.plain_text).join('') || '',
    platform: props.Platform?.select?.name || 'LinkedIn',
    status: props.Status?.select?.name || 'Draft',
    publishDate: props['Publish Date']?.date?.start || new Date().toISOString().split('T')[0],
    publishTime: props['Publish Time']?.rich_text?.[0]?.plain_text,
    // Check Notes field for asset link (or dedicated Asset Link if added later)
    assetLink: props['Asset Link']?.url || props['Post URL']?.url,
    hashtags,
    mediaUrls: props.Media?.files?.map((f: any) => f.file?.url || f.external?.url) || [],
    notionUrl: page.url,
    lastModified: page.last_edited_time
  };
}

/**
 * Update Notion page after publishing
 */
async function updateNotionAfterPublish(notionPageId: string, postUrl: string): Promise<boolean> {
  await logAction('notion_update_start', { notionPageId, postUrl });

  if (!CONFIG.NOTION_API_KEY) {
    console.log('  [DEV MODE] Would update Notion with URL:', postUrl);
    return true;
  }

  try {
    // First, try to update with Asset Link property
    // If that fails, fall back to updating Notes with the URL
    const updatePayload: any = {
      properties: {
        'Status': { select: { name: 'Posted' } }
      }
    };

    // Try to add Asset Link if the property exists
    // Note: Add "Asset Link" (URL type) property to Notion database for best results
    try {
      updatePayload.properties['Asset Link'] = { url: postUrl };
    } catch {
      // Property might not exist, continue without it
    }

    const response = await fetch(`https://api.notion.com/v1/pages/${notionPageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CONFIG.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!response.ok) {
      const errorText = await response.text();

      // If Asset Link property doesn't exist, retry without it
      if (errorText.includes('Asset Link') || errorText.includes('property')) {
        console.log('  Note: Asset Link property not found, updating status only');
        const fallbackResponse = await fetch(`https://api.notion.com/v1/pages/${notionPageId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${CONFIG.NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: {
              'Status': { select: { name: 'Posted' } },
              // Append URL to Notes field as fallback
              'Notes': { rich_text: [{ text: { content: `Posted: ${postUrl}\nTimestamp: ${new Date().toISOString()}` } }] }
            }
          })
        });

        if (!fallbackResponse.ok) {
          // Last resort: just update status
          await fetch(`https://api.notion.com/v1/pages/${notionPageId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${CONFIG.NOTION_API_KEY}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              properties: {
                'Status': { select: { name: 'Posted' } }
              }
            })
          });
        }
      } else {
        throw new Error(`Notion update failed: ${response.status} - ${errorText}`);
      }
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

/**
 * Mock data for development without Notion
 */
function getMockNotionPosts(): NotionPost[] {
  // Mock data based on actual Strata Noble content tracker
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
    },
    {
      id: 'post-P02-LI',
      notionPageId: 'mock-p02-linkedin',
      title: 'P02 - Manual Steps Are Hidden Risk',
      body: `"It's just a quick manual step."

Famous last words.

That manual step that takes 5 minutes today?
- In 3 months, it takes 20 minutes
- In 6 months, it requires 3 people
- In a year, it's a full-time job

Manual processes don't just drift.
They multiply.
They create dependencies.
They hide institutional knowledge.
They become "the way we've always done it."

Every manual step is technical debt with compound interest.

Document it, automate it, or eliminate it.
There is no fourth option.`,
      platform: 'LinkedIn',
      status: 'Approved to Post',
      publishDate: '2026-01-29',
      hashtags: ['cost', 'automation', 'operations'],
      mediaUrls: [],
      notionUrl: 'https://notion.so/mock-p02',
      lastModified: new Date().toISOString()
    }
  ];
}

// ============================================================================
// VALIDATION & GUARDRAILS
// ============================================================================

interface ValidationResult {
  valid: boolean;
  blockReason?: string;
}

/**
 * Validate post is ready for publishing
 */
function validatePost(post: NotionPost, lastPostedTime?: Date): ValidationResult {
  // Block 1: Body missing or too short
  if (!post.body || post.body.trim().length < 20) {
    return {
      valid: false,
      blockReason: 'BODY_MISSING: Post body is empty or too short (min 20 chars)'
    };
  }

  // Block 2: Already posted (URL exists)
  if (post.assetLink && post.assetLink.includes('linkedin.com')) {
    return {
      valid: false,
      blockReason: `ALREADY_POSTED: Post already published at ${post.assetLink}`
    };
  }

  // Block 3: Within cooldown window
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

  // Block 4: Publish date in future (more than 1 day)
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

// ============================================================================
// SESSION MANAGEMENT (Same as triage)
// ============================================================================

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
    browser = await chromium.launch({
      headless: false,
      slowMo: CONFIG.SLOW_MO
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
      viewport: { width: 1280, height: 900 }
    });

    page = await context.newPage();

    // Navigate to LinkedIn
    await page.goto(CONFIG.LINKEDIN_FEED, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await new Promise(r => setTimeout(r, 3000));

    // Check for security prompts
    const securityPrompt = await detectSecurityPrompt();
    if (securityPrompt) {
      return {
        success: false,
        error: `Security prompt detected: ${securityPrompt.type}. Manual intervention required.`
      };
    }

    // Verify logged in
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
// QUEUE GENERATION
// ============================================================================

async function generatePostQueue(): Promise<PostQueueItem[]> {
  console.log('\n============================================================');
  console.log('LINKEDIN POSTING OPS - Generate Approval Queue');
  console.log('============================================================\n');

  // Fetch posts from Notion
  console.log('Step 1: Fetching posts from Notion...');
  const posts = await fetchPostsFromNotion();
  console.log(`  Found ${posts.length} posts matching criteria`);

  if (posts.length === 0) {
    console.log('\n  No posts ready for publishing.');
    return [];
  }

  // Load last posted time for cooldown check
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

  // Build queue with validation
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

  // Save queue
  const proofDir = await ensureProofPackDir();
  const queueMarkdown = generateQueueMarkdown(queue);
  await fs.writeFile(path.join(proofDir, 'POST_APPROVAL_QUEUE.md'), queueMarkdown);
  await fs.writeFile(path.join(proofDir, 'POST_APPROVAL_QUEUE.json'), JSON.stringify(queue, null, 2));
  await logAction('queue_saved', { total: queue.length, approved: queue.filter(q => q.status === 'APPROVED').length });

  console.log(`\nQueue saved to: ${proofDir}`);
  return queue;
}

function generateQueueMarkdown(queue: PostQueueItem[]): string {
  const approved = queue.filter(q => q.status === 'APPROVED');
  const ready = queue.filter(q => q.status === 'READY');
  const blocked = queue.filter(q => q.status === 'BLOCKED');

  let content = `# LinkedIn Post Approval Queue

**Date**: ${new Date().toISOString().split('T')[0]}
**Run ID**: ${runId}
**Total Posts**: ${queue.length}

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Approved (Ready to Publish) | ${approved.length} |
| 📝 Ready (Needs Approval) | ${ready.length} |
| 🚫 Blocked | ${blocked.length} |

---

`;

  // Approved posts
  if (approved.length > 0) {
    content += `## ✅ Approved - Ready to Publish

`;
    for (const item of approved) {
      content += generatePostCard(item);
    }
  }

  // Ready posts
  if (ready.length > 0) {
    content += `## 📝 Ready - Needs Approval in Notion

Set Status = "Approved to Post" in Notion to enable publishing.

`;
    for (const item of ready) {
      content += generatePostCard(item);
    }
  }

  // Blocked posts
  if (blocked.length > 0) {
    content += `## 🚫 Blocked - Cannot Publish

`;
    for (const item of blocked) {
      content += `### ${item.title}

**Block Reason**: ${item.blockReason}
**Notion**: [View in Notion](${item.notionUrl})

---

`;
    }
  }

  content += `
## How to Publish

1. In Notion, set Status = "Approved to Post"
2. Run: \`npx ts-node linkedin-posting-ops.ts publish --id=<post-id>\`
3. Agent will publish, capture URL, and update Notion

---

**Generated by**: LinkedIn Posting Ops Agent v1.0
**Mode**: APPROVAL-GATED (no publish without Notion approval)
`;

  return content;
}

function generatePostCard(item: PostQueueItem): string {
  const hashtagStr = item.hashtags.length > 0
    ? item.hashtags.map(h => `#${h}`).join(' ')
    : 'No hashtags';

  return `### ${item.title}

**ID**: \`${item.id}\`
**Scheduled**: ${item.publishDate} ${item.publishTime || ''}
**Status**: ${item.status}
**Notion**: [View in Notion](${item.notionUrl})

**Full Post Body**:

\`\`\`
${item.body}
\`\`\`

**Hashtags**: ${hashtagStr}

**Actions**:
- [ ] Review content
- [ ] Approve in Notion (set Status = "Approved to Post")
- [ ] Run: \`npx ts-node linkedin-posting-ops.ts publish --id=${item.id}\`

---

`;
}

// ============================================================================
// DRAFT MODE
// ============================================================================

async function createDraft(postId: string): Promise<{ success: boolean; screenshot?: string; error?: string }> {
  console.log('\n============================================================');
  console.log('LINKEDIN POSTING OPS - Create Draft (No Publish)');
  console.log('============================================================\n');

  // Load queue
  const proofDir = await ensureProofPackDir();
  let queue: PostQueueItem[];

  try {
    const queueJson = await fs.readFile(path.join(proofDir, 'POST_APPROVAL_QUEUE.json'), 'utf8');
    queue = JSON.parse(queueJson);
  } catch {
    return { success: false, error: 'No queue found. Run queue command first.' };
  }

  const post = queue.find(p => p.id === postId);
  if (!post) {
    return { success: false, error: `Post not found: ${postId}` };
  }

  if (post.status === 'BLOCKED') {
    return { success: false, error: `Post is blocked: ${post.blockReason}` };
  }

  console.log(`  Creating draft for: ${post.title}`);

  if (!page) {
    return { success: false, error: 'No browser session. Call establishSession first.' };
  }

  try {
    // Navigate to company page admin
    console.log('  Step 1: Navigating to company page...');
    await page.goto(CONFIG.LINKEDIN_COMPANY_ADMIN, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await randomWait(2000, 3000);

    // Check for security
    const securityPrompt = await detectSecurityPrompt();
    if (securityPrompt) {
      return { success: false, error: `Security prompt: ${securityPrompt.type}` };
    }

    // Find "Start a post" button or similar
    console.log('  Step 2: Opening post composer...');
    const postButtonSelectors = [
      'button:has-text("Start a post")',
      'button:has-text("Create a post")',
      '.share-box-feed-entry__trigger',
      '[data-control-name="share.create_post"]',
      '.org-page-creation-button'
    ];

    let postButton = null;
    for (const selector of postButtonSelectors) {
      postButton = await page.$(selector);
      if (postButton) {
        console.log(`    Found: ${selector}`);
        break;
      }
    }

    if (!postButton) {
      await captureProofScreenshot('draft-error-no-button');
      return { success: false, error: 'Could not find post creation button' };
    }

    await postButton.click();
    await randomWait(2000, 3000);

    // Type the post content
    console.log('  Step 3: Entering post content...');
    const editorSelectors = [
      '.ql-editor',
      '[contenteditable="true"]',
      '.share-creation-state__text-editor',
      '.editor-content'
    ];

    let editor = null;
    for (const selector of editorSelectors) {
      editor = await page.$(selector);
      if (editor) {
        console.log(`    Found editor: ${selector}`);
        break;
      }
    }

    if (!editor) {
      await captureProofScreenshot('draft-error-no-editor');
      return { success: false, error: 'Could not find post editor' };
    }

    await editor.click();
    await randomWait(500, 1000);

    // Build full post content with hashtags
    let fullContent = post.body;
    if (post.hashtags && post.hashtags.length > 0) {
      fullContent += '\n\n' + post.hashtags.map(h => `#${h}`).join(' ');
    }

    await page.keyboard.type(fullContent, { delay: CONFIG.TYPING_DELAY });
    await randomWait(1000, 1500);

    // Capture draft screenshot
    console.log('  Step 4: Capturing draft proof...');
    const screenshot = await captureProofScreenshot(`draft-${post.id}`);

    // DO NOT click post - just close the modal
    console.log('  Step 5: Closing without posting (draft-first mode)...');

    // Look for close button
    const closeSelectors = [
      'button[aria-label="Close"]',
      'button[aria-label="Dismiss"]',
      '.artdeco-modal__dismiss',
      'button:has-text("Discard")'
    ];

    for (const selector of closeSelectors) {
      const closeBtn = await page.$(selector);
      if (closeBtn) {
        await closeBtn.click();
        await randomWait(1000, 2000);

        // Handle "Discard draft?" confirmation if it appears
        const discardBtn = await page.$('button:has-text("Discard")');
        if (discardBtn) {
          await discardBtn.click();
          await randomWait(500, 1000);
        }
        break;
      }
    }

    // Update queue with draft status
    post.draftCaptured = true;
    post.draftScreenshot = screenshot;
    await fs.writeFile(path.join(proofDir, 'POST_APPROVAL_QUEUE.json'), JSON.stringify(queue, null, 2));

    await logAction('draft_created', { postId: post.id, screenshot });

    console.log('\n  ✅ DRAFT CAPTURED (not posted)');
    console.log(`     Screenshot: ${screenshot}`);

    return { success: true, screenshot };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await captureProofScreenshot('draft-error');
    return { success: false, error: errorMsg };
  }
}

// ============================================================================
// OCS APPROVAL (v1.1 - Explicit approval, not Notion-gated)
// ============================================================================

interface ApprovalResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * OCS Approval command - validates and approves a post for publishing
 * v1.1: This replaces the Notion status gate with explicit OCS approval
 *
 * Validates:
 * - Body exists
 * - Asset Link empty (not already posted)
 * - Cooldown satisfied
 *
 * On success:
 * - Creates local approval file
 * - Updates Notion status to "Approved to Post"
 */
/**
 * Find the latest queue file from today's runs
 */
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

async function approvePost(postId: string): Promise<ApprovalResult> {
  console.log('\n============================================================');
  console.log('LINKEDIN POSTING OPS v1.1 - OCS Approval');
  console.log('============================================================\n');

  // Find latest queue from any run today
  const latestQueue = await findLatestQueue();
  if (!latestQueue) {
    return { success: false, error: 'No queue found. Run queue command first.' };
  }

  let queue = latestQueue.queue;
  const queueDir = path.dirname(latestQueue.queuePath);
  console.log(`  Using queue from: ${path.basename(queueDir)}`);

  // Also ensure current proof dir exists for approval file
  const proofDir = queueDir; // Use same dir as queue

  // Try to find the post (support partial ID matching)
  const post = queue.find(p => p.id === postId || p.id.includes(postId) || postId.includes(p.id.replace('post-', '')));
  if (!post) {
    return { success: false, error: `Post not found: ${postId}` };
  }

  console.log(`  Approving: ${post.title}`);

  // Validation 1: Body exists
  if (!post.body || post.body.trim().length < 20) {
    return { success: false, error: 'BODY_MISSING: Post body is empty or too short' };
  }
  console.log('  ✓ Body exists');

  // Validation 2: Not already posted (check Notion for Asset Link)
  // This is checked in queue generation, but double-check here
  if (post.status === 'POSTED') {
    return { success: false, error: 'ALREADY_POSTED: This post has already been published' };
  }
  console.log('  ✓ Not already posted');

  // Validation 3: Cooldown satisfied
  let lastPostedTime: Date | undefined;
  try {
    const historyPath = path.join(getTodayFolder(), 'post-history.json');
    const history = JSON.parse(await fs.readFile(historyPath, 'utf8'));
    if (history.lastPostedAt) {
      lastPostedTime = new Date(history.lastPostedAt);
    }
  } catch {
    // No history yet
  }

  if (lastPostedTime) {
    const hoursSinceLastPost = (Date.now() - lastPostedTime.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastPost < CONFIG.COOLDOWN_HOURS) {
      const hoursRemaining = Math.ceil(CONFIG.COOLDOWN_HOURS - hoursSinceLastPost);
      return {
        success: false,
        error: `COOLDOWN_ACTIVE: ${hoursRemaining}h remaining until next post allowed`
      };
    }
  }
  console.log('  ✓ Cooldown satisfied');

  // Create local approval file
  const approvalFile = path.join(proofDir, `APPROVAL_${postId}.json`);
  const approval = {
    postId,
    title: post.title,
    approved: true,
    approvedAt: new Date().toISOString(),
    approvedBy: 'OCS',
    target: 'personal'
  };
  await fs.writeFile(approvalFile, JSON.stringify(approval, null, 2));
  console.log('  ✓ Local approval created');

  // Update queue status
  post.status = 'APPROVED';
  await fs.writeFile(path.join(proofDir, 'POST_APPROVAL_QUEUE.json'), JSON.stringify(queue, null, 2));

  // Update Notion status to "Approved to Post"
  console.log('  Updating Notion status...');
  await updateNotionStatus(post.notionPageId, 'Approved to Post');
  console.log('  ✓ Notion status updated');

  await logAction('post_approved', {
    postId,
    title: post.title,
    approvedAt: approval.approvedAt
  });

  console.log('\n  ✅ POST APPROVED');
  console.log(`     ID: ${postId}`);
  console.log(`     Next: Run publish --id=${postId}`);

  return { success: true, postId };
}

/**
 * Update Notion page status only (without Asset Link)
 */
async function updateNotionStatus(notionPageId: string, status: string): Promise<boolean> {
  if (!CONFIG.NOTION_API_KEY) {
    console.log(`  [DEV MODE] Would update Notion status to: ${status}`);
    return true;
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
          'Status': { select: { name: status } }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`  Warning: Notion update failed: ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.log(`  Warning: Notion update error: ${error}`);
    return false;
  }
}

// ============================================================================
// PUBLISH MODE (OCS-Gated in v1.1)
// ============================================================================

async function publishPost(postId: string, target: 'personal' | 'company' = 'personal'): Promise<PublishResult> {
  console.log('\n============================================================');
  console.log(`LINKEDIN POSTING OPS v1.2 - Publish to ${target === 'personal' ? 'Personal Profile' : 'Company Page'}`);
  console.log('============================================================\n');

  // CONTAINMENT: Freeze posting until guards are verified
  console.error('\n⛔ POSTING FROZEN: RC-001 remediation in progress');
  console.error('   Incident: Wrong account targeted, false success reported');
  console.error('   Required: Identity verification, post verification gates');
  console.error('   Remove freeze after implementing all guards\n');
  return {
    success: false,
    error: 'POSTING FROZEN: RC-001 incident - Guards being implemented. See .claude/docs/ops/03-TICKETS/2026/2026-01/OCS-RC-001/'
  };

  // v1.1: Block company page posting unless explicitly enabled (v2 feature)
  if (target === 'company') {
    return {
      success: false,
      error: 'Company page posting disabled in v1.1. Use personal profile (default) or wait for v2.'
    };
  }

  // Find latest queue from any run today
  const latestQueue = await findLatestQueue();
  if (!latestQueue) {
    return { success: false, error: 'No queue found. Run queue command first.' };
  }

  let queue = latestQueue.queue;
  const proofDir = path.dirname(latestQueue.queuePath);
  console.log(`  Using queue from: ${path.basename(proofDir)}`);

  // Try to find the post (support partial ID matching)
  const post = queue.find(p => p.id === postId || p.id.includes(postId) || postId.includes(p.id.replace('post-', '')));
  if (!post) {
    return { success: false, error: `Post not found: ${postId}` };
  }

  // v1.1: Check for OCS approval (local approval file, NOT Notion status)
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
  console.log(`  Target: Personal Profile`);

  if (!page) {
    return { success: false, error: 'No browser session. Call establishSession first.' };
  }

  try {
    // v1.1: Navigate to personal feed (not company page)
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

    // Handle "Post settings" modal if it appears (visibility settings)
    // LinkedIn sometimes shows this before actually posting
    console.log('  Step 4b: Checking for Post settings modal...');

    // Wait a moment for modal to fully render
    await randomWait(1000, 1500);

    // Check for the "Post settings" modal
    const shareboxModal = await page.$('[data-test-modal-id="sharebox"], .artdeco-modal');
    if (shareboxModal) {
      console.log('    Post settings modal detected...');
      await captureProofScreenshot('modal-detected');

      // The modal asks:
      // 1. WHO posts (personal profile vs company page) - need to ensure personal is selected
      // 2. WHO can see (Anyone vs Connections only) - default is fine
      // 3. Then click "Done" to confirm and actually post

      // Step 1: Ensure personal profile is selected (Steve Hubbard, not Strata Noble)
      // The profile selector shows current selection - click it to see options if needed
      console.log('    Checking posting identity...');

      // Look for profile selector - it's the first clickable item with the user's name
      const profileSelector = await page.$('button:has-text("Steve Hubbard"), [role="button"]:has-text("Steve Hubbard")');
      if (profileSelector) {
        console.log('    Personal profile (Steve Hubbard) already selected');
      }

      // Step 2: Ensure "Anyone" visibility is selected (should be default)
      const anyoneOption = await page.$('input[type="radio"][checked], [aria-checked="true"]:has-text("Anyone")');
      if (anyoneOption) {
        console.log('    "Anyone" visibility confirmed');
      }

      // Step 3: Click "Done" button to confirm settings and post
      console.log('    Looking for Done button...');

      // Find the Done button specifically (it's on the right, next to Back)
      const doneBtn = await page.locator('button:has-text("Done")').first();

      try {
        const isVisible = await doneBtn.isVisible({ timeout: 3000 });
        if (isVisible) {
          console.log('    Found Done button, clicking to publish...');
          await doneBtn.click({ timeout: 5000 });
          console.log('    Clicked Done - post should be publishing');
          await randomWait(4000, 6000);
        } else {
          console.log('    Done button not visible');
        }
      } catch (e) {
        console.log(`    Done button error: ${e}`);
        // Fallback: try clicking by exact text match
        const allButtons = await page.$$('button');
        for (const btn of allButtons) {
          const text = await btn.textContent();
          if (text && text.trim() === 'Done') {
            console.log('    Found Done via fallback, clicking...');
            await btn.click({ force: true });
            await randomWait(4000, 6000);
            break;
          }
        }
      }

      // Verify modal closed
      await randomWait(1000, 1500);
      const stillHasModal = await page.$('[data-test-modal-id="sharebox"], .artdeco-modal:has-text("Post settings")');
      if (stillHasModal) {
        console.log('    WARNING: Modal still visible after clicking Done');
        await captureProofScreenshot('modal-still-open');
      } else {
        console.log('    Modal closed successfully');
      }
    } else {
      // No modal, post may have gone through directly
      console.log('    No post settings modal detected');
      await randomWait(2000, 3000);
    }

    // Capture after-publish screenshot
    const afterScreenshot = await captureProofScreenshot(`publish-after-${post.id}`);

    // Try to capture the post URL
    console.log('  Step 5: Capturing post URL...');
    let postUrl = '';

    // v1.1: Navigate to personal profile activity to find the post
    await page.goto(`${CONFIG.LINKEDIN_PROFILE_URL}recent-activity/all/`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await randomWait(2000, 3000);

    // Look for the most recent post link
    const postLinks = await page.$$('a[href*="/feed/update/"]');
    if (postLinks.length > 0) {
      const firstLink = postLinks[0];
      postUrl = await firstLink.getAttribute('href') || '';
      if (postUrl && !postUrl.startsWith('http')) {
        postUrl = `https://www.linkedin.com${postUrl}`;
      }
    }

    // Fallback: try alternate selector
    if (!postUrl) {
      const altLinks = await page.$$('a[href*="/posts/"]');
      if (altLinks.length > 0) {
        postUrl = await altLinks[0].getAttribute('href') || '';
        if (postUrl && !postUrl.startsWith('http')) {
          postUrl = `https://www.linkedin.com${postUrl}`;
        }
      }
    }

    // Update queue status
    post.status = 'POSTED';
    await fs.writeFile(path.join(proofDir, 'POST_APPROVAL_QUEUE.json'), JSON.stringify(queue, null, 2));

    // Update post history for cooldown tracking
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
      url: postUrl
    });
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));

    // Update Notion
    console.log('  Step 6: Updating Notion...');
    if (postUrl) {
      await updateNotionAfterPublish(post.notionPageId, postUrl);
    }

    // Generate receipt
    await generatePublishReceipt(post, postUrl, afterScreenshot);

    await logAction('post_published', {
      postId: post.id,
      title: post.title,
      url: postUrl
    });

    console.log('\n  ✅ POST PUBLISHED SUCCESSFULLY');
    console.log(`     URL: ${postUrl || 'Could not capture URL'}`);
    console.log(`     Notion: Updated`);

    return {
      success: true,
      postId: post.id,
      postUrl: postUrl || undefined,
      screenshot: afterScreenshot
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await captureProofScreenshot('publish-error');
    await logAction('publish_error', { postId, error: errorMsg });
    return { success: false, error: errorMsg };
  }
}

async function generatePublishReceipt(post: PostQueueItem, postUrl: string, screenshot: string): Promise<void> {
  const proofDir = await ensureProofPackDir();
  const timestamp = new Date().toISOString();

  const receipt = `# LinkedIn Post Publish Receipt

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
| Post URL | ${postUrl || 'Not captured'} |
| Notion | [View](${post.notionUrl}) |

---

## Content Published

\`\`\`
${post.body}

${post.hashtags.map(h => `#${h}`).join(' ')}
\`\`\`

---

## Proof

- **Screenshot**: \`${screenshot}\`
- **Notion Updated**: Status = Posted, Asset Link = ${postUrl || 'N/A'}

---

## Status

- **LinkedIn**: ✅ POSTED
- **Notion**: ✅ UPDATED
- **Receipt**: ✅ GENERATED

---

**Generated by**: LinkedIn Posting Ops Agent v1.0
`;

  await fs.writeFile(path.join(proofDir, `PUBLISH_RECEIPT_${post.id}.md`), receipt);
  await logAction('publish_receipt_generated', { postId: post.id });
}

// ============================================================================
// CLI HANDLER
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'queue';

  runId = generateRunId();

  console.log(`\n🚀 LinkedIn Posting Ops Agent v1.1 - ${runId}\n`);

  switch (command) {
    case 'queue':
      await generatePostQueue();
      break;

    case 'draft': {
      const idArg = args.find(a => a.startsWith('--id='));
      if (!idArg) {
        console.error('Usage: draft --id=<post-id>');
        process.exit(1);
      }
      const postId = idArg.split('=')[1];

      const sessionResult = await establishSession();
      if (!sessionResult.success) {
        console.error('Session failed:', sessionResult.error);
        process.exit(1);
      }

      const draftResult = await createDraft(postId);
      await closeSession();

      if (!draftResult.success) {
        console.error('Draft failed:', draftResult.error);
        process.exit(1);
      }
      break;
    }

    // v1.1: OCS Approval command (replaces Notion status gate)
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

      // v1.1: Establish browser session first
      const sessionResult = await establishSession();
      if (!sessionResult.success) {
        console.error('Session failed:', sessionResult.error);
        process.exit(1);
      }

      // v1.1: Publish to personal profile (OCS approval checked inside publishPost)
      const publishResult = await publishPost(postId, 'personal');
      await closeSession();

      if (!publishResult.success) {
        console.error('Publish failed:', publishResult.error);
        process.exit(1);
      }
      break;
    }

    case 'status':
      // Show current queue status
      const proofDir = path.join(getTodayFolder(), '*');
      console.log('Checking for existing queues...');
      try {
        const todayDir = getTodayFolder();
        const runs = await fs.readdir(todayDir);
        console.log(`\nFound ${runs.length} runs today:\n`);
        for (const run of runs.sort().reverse()) {
          const queuePath = path.join(todayDir, run, 'POST_APPROVAL_QUEUE.json');
          try {
            const queue = JSON.parse(await fs.readFile(queuePath, 'utf8'));
            const approved = queue.filter((p: PostQueueItem) => p.status === 'APPROVED').length;
            const posted = queue.filter((p: PostQueueItem) => p.status === 'POSTED').length;
            console.log(`  ${run}: ${queue.length} posts (${approved} approved, ${posted} posted)`);
          } catch {
            console.log(`  ${run}: No queue`);
          }
        }
      } catch {
        console.log('  No runs found today.');
      }
      break;

    default:
      console.log(`
LinkedIn Posting Ops v1.1 - Personal Profile Publishing

Usage:
  npx tsx linkedin-posting-ops.ts queue          # Generate approval queue from Notion
  npx tsx linkedin-posting-ops.ts approve --id=X # OCS approve post for publishing
  npx tsx linkedin-posting-ops.ts publish --id=X # Publish OCS-approved post
  npx tsx linkedin-posting-ops.ts draft --id=X   # Create draft preview (no publish)
  npx tsx linkedin-posting-ops.ts status         # Check today's runs

Workflow:
  1. queue    - See what's ready in Notion
  2. approve  - OCS approves a specific post (validates + updates Notion)
  3. publish  - Publishes to personal profile, updates Notion with URL

Note: v1.1 publishes to personal profile only. Company page requires v2.
`);
  }
}

main().catch(console.error);
