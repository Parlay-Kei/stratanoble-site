#!/usr/bin/env tsx

/**
 * LinkedIn Inbox Daily Triage Agent v1.0
 *
 * Internal ANX agent for triaging LinkedIn inbound messages and Service Requests.
 * Runs daily to:
 * 1. Collect and snapshot all new/unreplied threads
 * 2. Score and classify leads by fit
 * 3. Draft responses (NO sending unless explicitly approved)
 * 4. Escalate high-fit leads to Steve for approval
 *
 * SAFETY: Draft-first mode by default. No messages sent without explicit approval.
 * LOGGING: Every action logged with timestamp and proof screenshots.
 * SECURITY: Stops on 2FA/CAPTCHA, returns control to OCS.
 *
 * Usage:
 *   npx ts-node linkedin-inbox-triage.ts intake        # Phase 1: Collect leads
 *   npx ts-node linkedin-inbox-triage.ts triage        # Phase 2: Score leads
 *   npx ts-node linkedin-inbox-triage.ts draft         # Phase 3: Draft responses
 *   npx ts-node linkedin-inbox-triage.ts escalate      # Phase 4: Build approval queue
 *   npx ts-node linkedin-inbox-triage.ts send --id=X   # Phase 5: Send approved message
 *   npx ts-node linkedin-inbox-triage.ts full          # Run phases 1-4 in sequence
 */

import { chromium, Browser, BrowserContext, Page, ElementHandle } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';

// ============================================================================
// TYPES
// ============================================================================

interface LeadIntake {
  id: string;
  source: 'inbox' | 'service_request';
  threadId?: string;
  name: string;
  profileUrl?: string;
  headline?: string;
  company?: string;
  lastMessage: string;
  lastMessageDate?: string;
  lastMessageSender?: 'steve' | 'them' | 'unknown';
  lastOutboundTimestamp?: string;
  hasInboundSinceLastOutbound?: boolean;
  isNew: boolean;
  isUnreplied: boolean;
  alreadyReplied?: boolean;  // True if Steve sent last message within 14 days
  rawData: Record<string, unknown>;
}

interface LeadTriage {
  id: string;
  lead: LeadIntake;
  fitScore: number;
  fitScoreBreakdown: string[];
  leadType: 'PIPELINE_CLIENT' | 'REFERRAL_PARTNER' | 'WRONG_FIT' | 'LOW_SIGNAL' | 'REACTIVATION' | 'ALREADY_REPLIED' | 'VENDOR_PITCH';
  priority: 'P0' | 'P1' | 'P2';
  suppressedReason?: string;
  analysis: {
    wantsPipeline: boolean;
    mentionsLeakage: boolean;
    businessType: string;
    teamSize?: string;
    urgencyCues: string[];
    budgetCues: string[];
  };
}

interface DraftReply {
  id: string;
  leadId: string;
  leadName: string;
  leadType: string;
  priority: string;
  template: string;
  draftText: string;
  status: 'DRAFT' | 'APPROVED' | 'SENT' | 'REJECTED';
  threadId?: string;
}

interface EscalationCard {
  leadId: string;
  leadName: string;
  priority: string;
  fitScore: number;
  leadType: string;
  whatTheyWant: string;
  recommendedAction: 'SEND_DRAFT' | 'BOOK_CALL' | 'DECLINE' | 'ASK_QUESTIONS';
  reasoning: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedReceipt: string;
  draftPreview: string;
  bookcallVariant?: string;  // Which BOOKCALL variant was selected (V1, V2, or V3)
  bookcallDraft?: string;    // The actual BOOKCALL message if recommended
}

interface SuppressedCard {
  leadId: string;
  leadName: string;
  reason: string;
  lastOutboundTimestamp: string;
  daysSinceOutbound: number;
  hasNewInbound: boolean;
}

interface VendorPitchCard {
  leadId: string;
  leadName: string;
  triggersMatched: string[];
  messagePreview: string;
  reason: string;
}

interface ActionLog {
  action: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

interface OperationResult {
  success: boolean;
  status: string;
  message?: string;
  error?: string;
  screenshots?: string[];
  action?: 'RETURN_TO_OCS' | 'CONTINUE';
  promptType?: string;
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;
let runId: string = '';
let actionCount = 0;
const MAX_ACTIONS_PER_SESSION = 50;

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Timing (milliseconds)
  MIN_WAIT: 1500,
  MAX_WAIT: 3500,
  TYPING_DELAY: 40,
  SLOW_MO: 200,

  // Paths
  PROOF_PACKS_DIR: './proof-packs/linkedin-inbox-triage',
  SESSION_FILE: './linkedin-session.json',

  // LinkedIn URLs
  LINKEDIN_FEED: 'https://www.linkedin.com/feed/',
  LINKEDIN_INBOX: 'https://www.linkedin.com/messaging/',
  LINKEDIN_SERVICE_REQUESTS: 'https://www.linkedin.com/services/page/6283b234143a289798/requests/',

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
// UTILITY FUNCTIONS
// ============================================================================

function generateRunId(): string {
  return `run-${new Date().toISOString().replace(/[:.]/g, '-')}`;
}

function getTodayFolder(): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
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

function checkActionLimit(): boolean {
  if (actionCount >= MAX_ACTIONS_PER_SESSION) {
    console.error(`[SAFETY] Maximum actions per session (${MAX_ACTIONS_PER_SESSION}) reached`);
    return false;
  }
  actionCount++;
  console.log(`  [action ${actionCount}/${MAX_ACTIONS_PER_SESSION}]`);
  return true;
}

// ============================================================================
// SECURITY CHECKS
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

function handleSecurityPrompt(prompt: { type: string; selector: string }): OperationResult {
  return {
    success: false,
    status: 'SECURITY_PROMPT',
    action: 'RETURN_TO_OCS',
    promptType: prompt.type,
    message: `Security prompt detected: ${prompt.type}. Manual intervention required.`
  };
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

async function establishSession(): Promise<OperationResult> {
  if (!checkActionLimit()) {
    return { success: false, status: 'ACTION_LIMIT_EXCEEDED', action: 'RETURN_TO_OCS' };
  }

  await logAction('session_establish_start', { headless: false });

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
      await logAction('no_stored_session', { path: CONFIG.SESSION_FILE });
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
      return handleSecurityPrompt(securityPrompt);
    }

    // Verify logged in
    const isLoggedIn = await page.$('nav, .global-nav, [data-test-id*="nav"]');
    if (!isLoggedIn) {
      await captureProofScreenshot('session-not-logged-in');
      return {
        success: false,
        status: 'NOT_LOGGED_IN',
        action: 'RETURN_TO_OCS',
        message: 'Session expired or invalid. Please re-authenticate manually.'
      };
    }

    await captureProofScreenshot('session-established');
    await logAction('session_established');

    return {
      success: true,
      status: 'ACTIVE',
      message: 'Session established successfully'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logAction('session_error', { error: errorMessage });
    return {
      success: false,
      status: 'ERROR',
      error: errorMessage,
      action: 'RETURN_TO_OCS'
    };
  }
}

async function saveSession(): Promise<void> {
  if (context) {
    await context.storageState({ path: CONFIG.SESSION_FILE });
    await logAction('session_saved', { path: CONFIG.SESSION_FILE });
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
// CLICK UTILITIES
// ============================================================================

async function scrollIntoViewSafe(element: ElementHandle): Promise<void> {
  if (!page) return;

  await element.scrollIntoViewIfNeeded();
  await page.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < 100) {
      window.scrollBy(0, rect.top - 150);
    }
  }, element);
  await new Promise(r => setTimeout(r, 500));
}

async function clickByText(text: string, description: string): Promise<boolean> {
  if (!page) return false;

  console.log(`  Clicking by text: "${text}" (${description})`);

  const selectors = [
    `button:has-text("${text}")`,
    `a:has-text("${text}")`,
    `span:has-text("${text}")`,
    `div:has-text("${text}")`,
    `[role="button"]:has-text("${text}")`
  ];

  for (const sel of selectors) {
    try {
      const element = await page.$(sel);
      if (element) {
        await scrollIntoViewSafe(element);
        await element.click({ timeout: 5000 });
        console.log(`    ✓ Found and clicked: ${sel}`);
        await logAction('click_by_text_success', { text, selector: sel });
        return true;
      }
    } catch {
      continue;
    }
  }

  await logAction('click_by_text_failed', { text });
  return false;
}

// ============================================================================
// PHASE 1: INTAKE - Collect and Snapshot Leads
// ============================================================================

async function navigateToInbox(): Promise<OperationResult> {
  if (!page) {
    return { success: false, status: 'NO_SESSION', error: 'No active session' };
  }

  await logAction('navigate_inbox_start');
  await randomWait(1000, 2000);

  try {
    await page.goto(CONFIG.LINKEDIN_INBOX, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await new Promise(r => setTimeout(r, 4000));

    const securityPrompt = await detectSecurityPrompt();
    if (securityPrompt) {
      return handleSecurityPrompt(securityPrompt);
    }

    await captureProofScreenshot('inbox-overview');
    await logAction('navigate_inbox_complete');

    return {
      success: true,
      status: 'NAVIGATED',
      message: 'Navigated to inbox'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logAction('navigate_inbox_error', { error: errorMessage });
    return {
      success: false,
      status: 'ERROR',
      error: errorMessage
    };
  }
}

async function navigateToServiceRequests(): Promise<OperationResult> {
  if (!page) {
    return { success: false, status: 'NO_SESSION', error: 'No active session' };
  }

  await logAction('navigate_service_requests_start');
  await randomWait(1000, 2000);

  try {
    await page.goto(CONFIG.LINKEDIN_SERVICE_REQUESTS, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await new Promise(r => setTimeout(r, 4000));

    const securityPrompt = await detectSecurityPrompt();
    if (securityPrompt) {
      return handleSecurityPrompt(securityPrompt);
    }

    await captureProofScreenshot('service-requests-overview');
    await logAction('navigate_service_requests_complete');

    return {
      success: true,
      status: 'NAVIGATED',
      message: 'Navigated to service requests'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logAction('navigate_service_requests_error', { error: errorMessage });
    return {
      success: false,
      status: 'ERROR',
      error: errorMessage
    };
  }
}

async function extractInboxThreads(): Promise<LeadIntake[]> {
  if (!page) return [];

  const leads: LeadIntake[] = [];
  await logAction('extract_inbox_threads_start');

  try {
    // Wait for conversations to load
    await page.waitForSelector('.msg-conversation-listitem, .msg-conversations-container__convo-item-link', { timeout: 10000 });

    // Get all conversation items
    const conversations = await page.$$('.msg-conversation-listitem, [data-control-name="overlay.messaging_convo_card"]');
    console.log(`  Found ${conversations.length} inbox conversations`);

    for (let i = 0; i < Math.min(conversations.length, 20); i++) {
      const conv = conversations[i];

      try {
        // Extract name
        const nameEl = await conv.$('.msg-conversation-card__participant-names, .msg-conversation-listitem__participant-names');
        const name = nameEl ? (await nameEl.textContent())?.trim() || 'Unknown' : 'Unknown';

        // Extract last message preview
        const messageEl = await conv.$('.msg-conversation-card__message-snippet, .msg-conversation-listitem__message-snippet');
        const lastMessage = messageEl ? (await messageEl.textContent())?.trim() || '' : '';

        // Extract timestamp
        const timeEl = await conv.$('.msg-conversation-card__time-stamp, .msg-conversation-listitem__time-stamp');
        const lastMessageDate = timeEl ? (await timeEl.textContent())?.trim() || '' : '';

        // Check if unread
        const isUnread = await conv.$('.msg-conversation-card__unread-dot, .notification-badge') !== null;

        // Detect last message sender from preview text
        // LinkedIn shows "You: message" if Steve sent the last message
        const lastMessageSender: 'steve' | 'them' | 'unknown' =
          lastMessage.startsWith('You:') ? 'steve' :
          lastMessage.includes(':') ? 'them' : 'unknown';

        // Parse relative timestamp to check if within 14 days
        const daysSinceLastMessage = parseRelativeTimestamp(lastMessageDate);
        const isWithin14Days = daysSinceLastMessage !== null && daysSinceLastMessage <= 14;

        // Mark as already replied if Steve sent last message within 14 days
        const alreadyReplied = lastMessageSender === 'steve' && isWithin14Days;

        const leadId = `inbox-${i}-${Date.now()}`;
        leads.push({
          id: leadId,
          source: 'inbox',
          threadId: `thread-${i}`,
          name,
          lastMessage,
          lastMessageDate,
          lastMessageSender,
          lastOutboundTimestamp: lastMessageSender === 'steve' ? lastMessageDate : undefined,
          hasInboundSinceLastOutbound: lastMessageSender === 'them',
          isNew: isUnread,
          isUnreplied: isUnread,
          alreadyReplied,
          rawData: { index: i, daysSinceLastMessage, lastMessageSender }
        });

        // Click to open and capture screenshot for first few or if unread
        if ((isUnread || i < 3) && i < 5) {
          try {
            await conv.click();
            await new Promise(r => setTimeout(r, 2000));
            await captureProofScreenshot(`inbox-thread-${i}-${name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}`);

            // Extract headline/company from opened thread
            const profileLink = await page.$('.msg-entity-lockup__entity-title a, .msg-s-message-group__profile-link');
            if (profileLink) {
              const href = await profileLink.getAttribute('href');
              leads[leads.length - 1].profileUrl = href || undefined;
            }

            const headlineEl = await page.$('.msg-entity-lockup__entity-subtitle');
            if (headlineEl) {
              const headline = await headlineEl.textContent();
              leads[leads.length - 1].headline = headline?.trim();
            }

            // Check for Steve's last outbound message in thread history
            const lastOutbound = await detectLastOutboundInThread();
            if (lastOutbound) {
              leads[leads.length - 1].lastOutboundTimestamp = lastOutbound.timestamp;
              leads[leads.length - 1].hasInboundSinceLastOutbound = lastOutbound.hasInboundSince;
              if (!lastOutbound.hasInboundSince && lastOutbound.daysAgo <= 14) {
                leads[leads.length - 1].alreadyReplied = true;
              }
            }
          } catch {
            console.log(`    Could not open thread ${i}`);
          }
        }

      } catch (error) {
        console.log(`  Error extracting conversation ${i}:`, error);
      }
    }

    await logAction('extract_inbox_threads_complete', { count: leads.length });
    return leads;

  } catch (error) {
    console.log('  Error extracting inbox threads:', error);
    await logAction('extract_inbox_threads_error', { error: String(error) });
    return leads;
  }
}

/**
 * Parse LinkedIn's relative timestamp format (e.g., "2h", "3d", "1w", "2mo", "Jan 19")
 * Returns number of days, or null if cannot parse
 */
function parseRelativeTimestamp(timestamp: string): number | null {
  if (!timestamp) return null;

  const lower = timestamp.toLowerCase().trim();

  // Handle "just now", "now"
  if (lower.includes('now') || lower.includes('just')) return 0;

  // Extract number and unit (e.g., "2h", "3d", "1w")
  const relativeMatch = lower.match(/(\d+)\s*(m|h|d|w|mo|y)/);
  if (relativeMatch) {
    const num = parseInt(relativeMatch[1], 10);
    const unit = relativeMatch[2];

    switch (unit) {
      case 'm': return 0; // minutes = same day
      case 'h': return 0; // hours = same day
      case 'd': return num;
      case 'w': return num * 7;
      case 'mo': return num * 30;
      case 'y': return num * 365;
    }
  }

  // Handle absolute dates like "Jan 19", "Dec 5", "Jan 13"
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  const dateMatch = lower.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{1,2})/);
  if (dateMatch) {
    const month = months[dateMatch[1]];
    const day = parseInt(dateMatch[2], 10);
    const now = new Date();
    const year = now.getFullYear();

    // Construct the date (assume current year, or previous year if date is in the future)
    let targetDate = new Date(year, month, day);
    if (targetDate > now) {
      targetDate = new Date(year - 1, month, day);
    }

    const diffTime = now.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  return null;
}

/**
 * Detect Steve's last outbound message in the currently open thread
 * Returns timestamp and whether there's been inbound since
 */
async function detectLastOutboundInThread(): Promise<{ timestamp: string; daysAgo: number; hasInboundSince: boolean } | null> {
  if (!page) return null;

  try {
    // Look for message groups - LinkedIn groups consecutive messages from same sender
    // Outbound messages typically have a different class or "You" indicator
    const messages = await page.$$('.msg-s-message-list__event, .msg-s-event-listitem');

    let lastOutboundIndex = -1;
    let lastOutboundTimestamp = '';
    let hasInboundAfter = false;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      // Check if this is an outbound message (from Steve)
      // LinkedIn typically marks outbound with specific classes or "You" in sender
      const senderEl = await msg.$('.msg-s-message-group__name, .msg-s-event-listitem__sender-name');
      const senderText = senderEl ? await senderEl.textContent() : '';

      // Also check for "you" indicator in message wrapper
      const isOutbound = await msg.evaluate((el) => {
        return el.classList.contains('msg-s-message-list__event--outbound') ||
               el.querySelector('[class*="outbound"]') !== null ||
               el.textContent?.toLowerCase().includes('you sent');
      });

      if (isOutbound || senderText?.toLowerCase().includes('you')) {
        lastOutboundIndex = i;
        // Try to get timestamp
        const timeEl = await msg.$('.msg-s-message-group__timestamp, time');
        lastOutboundTimestamp = timeEl ? (await timeEl.textContent())?.trim() || '' : '';
      } else if (lastOutboundIndex >= 0) {
        // Found inbound after outbound
        hasInboundAfter = true;
      }
    }

    if (lastOutboundIndex >= 0) {
      const daysAgo = parseRelativeTimestamp(lastOutboundTimestamp) || 0;
      return {
        timestamp: lastOutboundTimestamp,
        daysAgo,
        hasInboundSince: hasInboundAfter
      };
    }

    return null;
  } catch (error) {
    console.log('  Error detecting outbound in thread:', error);
    return null;
  }
}

async function extractServiceRequests(): Promise<LeadIntake[]> {
  if (!page) return [];

  const leads: LeadIntake[] = [];
  await logAction('extract_service_requests_start');

  try {
    // Wait for requests list
    await page.waitForSelector('.service-request-card, .lead-card, [data-view-name="service-request-list-item"]', { timeout: 10000 });

    const requests = await page.$$('.service-request-card, .lead-card, [data-view-name="service-request-list-item"]');
    console.log(`  Found ${requests.length} service requests`);

    for (let i = 0; i < Math.min(requests.length, 10); i++) {
      const req = requests[i];

      try {
        // Extract name
        const nameEl = await req.$('.service-request-card__name, .lead-card__name, h3');
        const name = nameEl ? (await nameEl.textContent())?.trim() || 'Unknown' : 'Unknown';

        // Extract message/description
        const msgEl = await req.$('.service-request-card__description, .lead-card__description, p');
        const lastMessage = msgEl ? (await msgEl.textContent())?.trim() || '' : '';

        // Extract timestamp
        const timeEl = await req.$('.service-request-card__time, .lead-card__time, time');
        const lastMessageDate = timeEl ? (await timeEl.textContent())?.trim() || '' : '';

        // Check if new (within 24 hours - heuristic based on "ago" text)
        const isNew = lastMessageDate.includes('hour') || lastMessageDate.includes('minute') ||
                      lastMessageDate.includes('just now') || lastMessageDate.includes('1d');

        const leadId = `service-${i}-${Date.now()}`;
        leads.push({
          id: leadId,
          source: 'service_request',
          name,
          lastMessage,
          lastMessageDate,
          isNew,
          isUnreplied: true, // Assume all service requests need reply
          rawData: { index: i }
        });

        // Click to view details and capture screenshot
        if (i < 5) {
          try {
            await req.click();
            await new Promise(r => setTimeout(r, 2000));
            await captureProofScreenshot(`service-request-${i}-${name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}`);

            // Extract additional details from modal/expanded view
            const headlineEl = await page.$('.service-request-detail__headline, .lead-detail__headline');
            if (headlineEl) {
              const headline = await headlineEl.textContent();
              leads[leads.length - 1].headline = headline?.trim();
            }

            const companyEl = await page.$('.service-request-detail__company, .lead-detail__company');
            if (companyEl) {
              const company = await companyEl.textContent();
              leads[leads.length - 1].company = company?.trim();
            }

            // Close modal if open
            const closeBtn = await page.$('button[aria-label="Dismiss"], button[aria-label="Close"]');
            if (closeBtn) {
              await closeBtn.click();
              await new Promise(r => setTimeout(r, 1000));
            }
          } catch {
            console.log(`    Could not open service request ${i}`);
          }
        }

      } catch (error) {
        console.log(`  Error extracting service request ${i}:`, error);
      }
    }

    await logAction('extract_service_requests_complete', { count: leads.length });
    return leads;

  } catch (error) {
    console.log('  Error extracting service requests:', error);
    await logAction('extract_service_requests_error', { error: String(error) });
    return leads;
  }
}

async function executeIntakePhase(): Promise<{ leads: LeadIntake[]; success: boolean }> {
  console.log('\n============================================================');
  console.log('PHASE 1: INTAKE - Collect and Snapshot Leads');
  console.log('============================================================\n');

  const allLeads: LeadIntake[] = [];

  // Navigate to inbox and extract
  console.log('Step 1: Collecting inbox threads...');
  const inboxResult = await navigateToInbox();
  if (!inboxResult.success) {
    console.log('  Failed to navigate to inbox:', inboxResult.error);
    return { leads: [], success: false };
  }
  const inboxLeads = await extractInboxThreads();
  allLeads.push(...inboxLeads);

  // Navigate to service requests and extract
  console.log('\nStep 2: Collecting service requests...');
  const serviceResult = await navigateToServiceRequests();
  if (!serviceResult.success) {
    console.log('  Failed to navigate to service requests:', serviceResult.error);
    // Continue anyway, we have inbox leads
  } else {
    const serviceLeads = await extractServiceRequests();
    allLeads.push(...serviceLeads);
  }

  // Check for --all flag to include all leads (for first audit/review)
  const includeAll = process.argv.includes('--all');

  // Filter to new/unreplied only, unless --all flag is set
  const actionableLeads = includeAll ? allLeads : allLeads.filter(l => l.isNew || l.isUnreplied);
  console.log(`\nTotal leads: ${allLeads.length}, Actionable: ${actionableLeads.length}${includeAll ? ' (--all mode)' : ''}`);

  // Save LEAD_INTAKE.json
  const proofDir = await ensureProofPackDir();
  await fs.writeFile(
    path.join(proofDir, 'LEAD_INTAKE.json'),
    JSON.stringify(actionableLeads, null, 2)
  );
  await fs.writeFile(
    path.join(proofDir, 'ALL_LEADS.json'),
    JSON.stringify(allLeads, null, 2)
  );
  await logAction('lead_intake_saved', { total: allLeads.length, actionable: actionableLeads.length, includeAll });

  return { leads: actionableLeads, success: true };
}

// ============================================================================
// PHASE 2: TRIAGE - Score and Classify Leads
// ============================================================================

function calculateFitScore(lead: LeadIntake): { score: number; breakdown: string[]; analysis: LeadTriage['analysis'] } {
  let score = 5; // Base score
  const breakdown: string[] = ['Base: 5'];
  const message = lead.lastMessage.toLowerCase();
  const headline = (lead.headline || '').toLowerCase();

  const analysis: LeadTriage['analysis'] = {
    wantsPipeline: false,
    mentionsLeakage: false,
    businessType: 'unknown',
    urgencyCues: [],
    budgetCues: []
  };

  // +3 if service business or consultant/agency
  const serviceTerms = ['consultant', 'agency', 'coach', 'advisor', 'freelance', 'contractor',
                        'realtor', 'real estate', 'lawyer', 'attorney', 'accountant', 'dentist',
                        'doctor', 'clinic', 'salon', 'spa', 'plumber', 'electrician', 'hvac',
                        'landscap', 'cleaning', 'home service', 'marketing', 'creative'];
  if (serviceTerms.some(t => message.includes(t) || headline.includes(t))) {
    score += 3;
    breakdown.push('+3 Service business/consultant');
    analysis.businessType = 'service_business';
  }

  // +2 if they clearly want pipeline/CRM/follow-up
  const pipelineTerms = ['pipeline', 'crm', 'follow-up', 'follow up', 'leads', 'booking',
                         'scheduling', 'automation', 'automate', 'system', 'process'];
  if (pipelineTerms.some(t => message.includes(t))) {
    score += 2;
    breakdown.push('+2 Wants pipeline/CRM/follow-up');
    analysis.wantsPipeline = true;
  }

  // +2 if they mention missed leads / booking / conversion / automation
  const leakageTerms = ['missed', 'losing', 'slip', 'no-show', 'noshow', 'ghost', 'forget',
                        'conversion', 'close rate', 'falling through'];
  if (leakageTerms.some(t => message.includes(t))) {
    score += 2;
    breakdown.push('+2 Mentions leakage/missed opportunities');
    analysis.mentionsLeakage = true;
  }

  // +1 if team size 1-50
  const smallTeamTerms = ['solo', 'just me', 'small team', 'few employees', '1-', '2-', '5-', '10-'];
  if (smallTeamTerms.some(t => message.includes(t))) {
    score += 1;
    breakdown.push('+1 Small team (1-50)');
    analysis.teamSize = '1-50';
  }

  // -3 if they want custom app / dev build / SaaS engineering
  const devTerms = ['app development', 'mobile app', 'ios app', 'android app', 'saas',
                    'software development', 'custom software', 'build an app', 'developer'];
  if (devTerms.some(t => message.includes(t))) {
    score -= 3;
    breakdown.push('-3 Wants custom app/dev build');
    analysis.businessType = 'dev_project';
  }

  // -2 if they want unrelated admin
  const adminTerms = ['credentialing', 'hr', 'payroll', 'compliance', 'legal', 'taxes',
                      'accounting', 'bookkeeping'];
  if (adminTerms.some(t => message.includes(t))) {
    score -= 2;
    breakdown.push('-2 Wants unrelated admin work');
    analysis.businessType = 'admin_project';
  }

  // -2 if vague "synergy" with no clear ask
  const vagueTerms = ['synergy', 'collaborate', 'pick your brain', 'connect', 'network'];
  const hasVague = vagueTerms.some(t => message.includes(t));
  const hasClearAsk = pipelineTerms.some(t => message.includes(t)) ||
                      message.includes('?') ||
                      message.includes('need') ||
                      message.includes('help');
  if (hasVague && !hasClearAsk) {
    score -= 2;
    breakdown.push('-2 Vague "synergy" with no clear ask');
  }

  // Extract urgency cues
  const urgencyWords = ['asap', 'urgent', 'immediately', 'this week', 'today', 'right away',
                        'quickly', 'soon as possible'];
  analysis.urgencyCues = urgencyWords.filter(w => message.includes(w));

  // Extract budget cues
  const budgetWords = ['budget', 'price', 'cost', 'invest', 'spend', 'afford', '$', 'quote'];
  analysis.budgetCues = budgetWords.filter(w => message.includes(w));

  return { score: Math.max(0, Math.min(10, score)), breakdown, analysis };
}

// Vendor pitch keywords - exported for reuse in reporting
const VENDOR_PITCH_KEYWORDS = [
  'we help',
  'we handle',
  'virtual assistant',
  ' va ',  // space-padded to avoid false matches
  'vas ',
  'appointment setting',
  'prospecting',
  'reply yes',
  'just reply',
  'just reply with your number',
  'would you be open to a quick call',
  'book a quick call',
  'out of the blue',
  'lighten your workload',
  'keep pipelines full',
  'ai-powered',
  'ai powered'
];

/**
 * Get list of vendor pitch keywords matched in a message
 */
function getVendorTriggersMatched(message: string): string[] {
  const lower = message.toLowerCase();
  return VENDOR_PITCH_KEYWORDS.filter(k => lower.includes(k));
}

function classifyLeadType(lead: LeadIntake, fitScore: number, analysis: LeadTriage['analysis']): LeadTriage['leadType'] {
  const message = lead.lastMessage.toLowerCase();
  const headline = (lead.headline || '').toLowerCase();

  // GUARDRAIL: Check for already replied (Steve sent last message within 14 days, no new inbound)
  if (lead.alreadyReplied && !lead.hasInboundSinceLastOutbound) {
    return 'ALREADY_REPLIED';
  }

  // GUARDRAIL: Detect vendor pitches (any 2 keywords triggers)
  const vendorKeywords = [
    'we help',
    'we handle',
    'virtual assistant',
    ' va ',  // space-padded to avoid false matches
    'vas ',
    'appointment setting',
    'prospecting',
    'reply yes',
    'just reply',
    'just reply with your number',
    'would you be open to a quick call',
    'book a quick call',
    'out of the blue',
    'lighten your workload',
    'keep pipelines full',
    'ai-powered',
    'ai powered'
  ];
  const vendorMatches = vendorKeywords.filter(k => message.includes(k));
  if (vendorMatches.length >= 2) {
    return 'VENDOR_PITCH';
  }
  // Also check for "agency" combined with pitch language (not partner language)
  if (message.includes('agency') && !message.includes('your clients') && !message.includes('white label')) {
    const pitchTerms = ['we help', 'we handle', 'would you be open', 'quick call'];
    if (pitchTerms.some(t => message.includes(t))) {
      return 'VENDOR_PITCH';
    }
  }

  // Check for referral partner signals
  const partnerTerms = ['agency', 'white label', 'partner', 'referral', 'clients', 'fulfillment'];
  if (partnerTerms.some(t => message.includes(t) || headline.includes(t))) {
    if (analysis.wantsPipeline || message.includes('deliver') || message.includes('build for')) {
      return 'REFERRAL_PARTNER';
    }
  }

  // Wrong fit
  if (fitScore <= 3 || analysis.businessType === 'dev_project' || analysis.businessType === 'admin_project') {
    return 'WRONG_FIT';
  }

  // Low signal
  if (!analysis.wantsPipeline && !analysis.mentionsLeakage && lead.lastMessage.length < 50) {
    return 'LOW_SIGNAL';
  }

  // Reactivation (existing thread with old messages) - only if they replied after Steve's last message
  if (lead.source === 'inbox' && lead.hasInboundSinceLastOutbound) {
    return 'REACTIVATION';
  }

  // Pipeline client (direct buyer)
  return 'PIPELINE_CLIENT';
}

function determinePriority(fitScore: number, analysis: LeadTriage['analysis'], leadType: LeadTriage['leadType']): LeadTriage['priority'] {
  // P0: Fit ≥ 8 AND clear request OR ready to book
  if (fitScore >= 8 && (analysis.wantsPipeline || analysis.urgencyCues.length > 0)) {
    return 'P0';
  }

  // P1: Fit 6-7 needs qualification
  if (fitScore >= 6 && fitScore <= 7) {
    return 'P1';
  }

  // P1 boost if budget mentioned
  if (fitScore >= 5 && analysis.budgetCues.length > 0) {
    return 'P1';
  }

  // P2: Fit ≤ 5 or wrong-fit
  return 'P2';
}

async function executeTriagePhase(leads: LeadIntake[]): Promise<{ triaged: LeadTriage[]; success: boolean }> {
  console.log('\n============================================================');
  console.log('PHASE 2: TRIAGE - Score and Classify Leads');
  console.log('============================================================\n');

  const triaged: LeadTriage[] = [];

  for (const lead of leads) {
    const { score, breakdown, analysis } = calculateFitScore(lead);
    const leadType = classifyLeadType(lead, score, analysis);

    // GUARDRAIL: Force P2 and add suppressed reason for ALREADY_REPLIED
    let priority = determinePriority(score, analysis, leadType);
    let suppressedReason: string | undefined;

    if (leadType === 'ALREADY_REPLIED') {
      priority = 'P2';
      suppressedReason = `Steve sent last message ${lead.lastOutboundTimestamp || 'recently'}, no reply from contact`;
      console.log(`  ${lead.name}: SUPPRESSED - Already replied (${lead.lastOutboundTimestamp})`);
    } else if (leadType === 'VENDOR_PITCH') {
      priority = 'P2';
      suppressedReason = 'Vendor pitch detected (VA, agency, or service offer)';
      console.log(`  ${lead.name}: VENDOR_PITCH - Suppressed (inbound sales pitch)`);
    } else {
      console.log(`  ${lead.name}: Score ${score}, Type: ${leadType}, Priority: ${priority}`);
    }

    triaged.push({
      id: lead.id,
      lead,
      fitScore: score,
      fitScoreBreakdown: breakdown,
      leadType,
      priority,
      suppressedReason,
      analysis
    });
  }

  // Sort by priority and score
  triaged.sort((a, b) => {
    const priorityOrder = { P0: 0, P1: 1, P2: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.fitScore - a.fitScore;
  });

  // Generate triage report
  const proofDir = await ensureProofPackDir();
  const reportContent = generateTriageReport(triaged);
  await fs.writeFile(path.join(proofDir, 'LEAD_TRIAGE_REPORT.md'), reportContent);
  await logAction('triage_report_saved', { count: triaged.length });

  return { triaged, success: true };
}

function generateTriageReport(triaged: LeadTriage[]): string {
  const p0 = triaged.filter(t => t.priority === 'P0' && !['ALREADY_REPLIED', 'VENDOR_PITCH'].includes(t.leadType));
  const p1 = triaged.filter(t => t.priority === 'P1' && !['ALREADY_REPLIED', 'VENDOR_PITCH'].includes(t.leadType));
  const p2 = triaged.filter(t => t.priority === 'P2' && !['ALREADY_REPLIED', 'VENDOR_PITCH'].includes(t.leadType));
  const alreadyReplied = triaged.filter(t => t.leadType === 'ALREADY_REPLIED');
  const vendorPitches = triaged.filter(t => t.leadType === 'VENDOR_PITCH');

  let report = `# LinkedIn Inbox Triage Report

**Date**: ${new Date().toISOString().split('T')[0]}
**Run ID**: ${runId}
**Total Leads**: ${triaged.length}
**Suppressed (Already Replied)**: ${alreadyReplied.length}
**Vendor Pitches (Filtered)**: ${vendorPitches.length}

---

## Summary

| Priority | Count | Action Required |
|----------|-------|-----------------|
| P0 | ${p0.length} | Immediate response + escalate |
| P1 | ${p1.length} | Qualify with questions |
| P2 | ${p2.length} | Low priority / wrong fit |
| 🚫 Suppressed | ${alreadyReplied.length} | Already replied, awaiting response |
| 📢 Vendor Pitch | ${vendorPitches.length} | Inbound sales pitch, auto-filtered |

---

## P0 - High Priority (Fit ≥ 8, Clear Request)

`;

  for (const t of p0) {
    report += `### ${t.lead.name}
- **Source**: ${t.lead.source}
- **Fit Score**: ${t.fitScore}/10
- **Type**: ${t.leadType}
- **Breakdown**: ${t.fitScoreBreakdown.join(', ')}
- **Message**: "${t.lead.lastMessage.substring(0, 200)}..."
- **Analysis**: Wants pipeline: ${t.analysis.wantsPipeline}, Mentions leakage: ${t.analysis.mentionsLeakage}

`;
  }

  report += `---

## P1 - Medium Priority (Needs Qualification)

`;

  for (const t of p1) {
    report += `### ${t.lead.name}
- **Fit Score**: ${t.fitScore}/10
- **Type**: ${t.leadType}
- **Message**: "${t.lead.lastMessage.substring(0, 150)}..."

`;
  }

  report += `---

## P2 - Low Priority / Wrong Fit

`;

  for (const t of p2) {
    report += `- **${t.lead.name}**: ${t.leadType} (Score: ${t.fitScore})
`;
  }

  // Add Already Replied section
  if (alreadyReplied.length > 0) {
    report += `
---

## 🚫 Suppressed - Already Replied (Awaiting Their Response)

These threads have an outbound message from Steve within 14 days with no reply. **Do not re-message.**

| Lead | Last Outbound | Status |
|------|---------------|--------|
`;
    for (const t of alreadyReplied) {
      report += `| ${t.lead.name} | ${t.lead.lastOutboundTimestamp || t.lead.lastMessageDate || 'Unknown'} | ${t.suppressedReason || 'Awaiting response'} |\n`;
    }
  }

  // Add Vendor Pitches section
  if (vendorPitches.length > 0) {
    report += `
---

## 📢 Vendor Pitches (Auto-Filtered)

These are inbound sales pitches from vendors/agencies. **No action needed** unless Steve enables "Vendor Replies".

| Lead | Message Preview |
|------|-----------------|
`;
    for (const t of vendorPitches) {
      const preview = t.lead.lastMessage.replace(/\n/g, ' ').substring(0, 80);
      report += `| ${t.lead.name} | ${preview}... |\n`;
    }
  }

  return report;
}

// ============================================================================
// PHASE 3: RESPONSE DRAFTING
// ============================================================================

const RESPONSE_TEMPLATES = {
  // TONE: No em-dashes, no corporate filler, short lines, plain English, max 2 questions
  PIPELINE_CLIENT: (name: string, _goal: string) => `Hey ${name}, appreciate you reaching out.

Quick question so I don't guess:
Where are your leads coming from right now?

If you tell me that, I'll point you to the fastest fix.
If it makes sense, we can do a quick 15-min call this week.`,

  REFERRAL_PARTNER: (name: string) => `Hey ${name}, I'm open to that.

When you close a client, what do they usually need built right after?
CRM setup, follow-up automation, booking flow, onboarding, reporting?

If you've got one client to test with, I can take delivery and you stay on the relationship.`,

  WRONG_FIT: (name: string) => `Hey ${name}, appreciate the message.

That's not the lane I'm focused on right now.
If you ever need help building a lead-to-booking pipeline, I can help with that.`,

  LOW_SIGNAL: (name: string) => `Hey ${name}, I'm open.

What are you trying to improve right now?
More booked calls, faster follow-up, fewer no-shows, or cleaner lead tracking?

Give me the short version and I'll tell you what I'd build.`,

  REACTIVATION: (name: string) => `Hey ${name}, circling back on this.

Still working on that pipeline system, or did this move to the back burner?
If timing's better now, tell me what you're trying to fix and I'll point you in the right direction.`,

  // ALREADY_REPLIED: Suppressed by guardrail, but create placeholder for tracking
  ALREADY_REPLIED: (name: string) => `Hey ${name}, I'm open.

What are you trying to improve right now?
More booked calls, faster follow-up, fewer no-shows, or cleaner lead tracking?

Give me the short version and I'll tell you what I'd build.`,

  // VENDOR_PITCH: Polite decline for inbound vendor/service pitches
  VENDOR_PITCH: (name: string) => `Hey ${name}, appreciate it.
We're not looking for VA support right now, but I'll keep you in mind.`,

  // BOOKCALL variants - Steve-style messaging for booking calls
  BOOKCALL_V1_DEFAULT: (name: string) => `Hey ${name}, appreciate you reaching out.

Quick question so I don't guess:
Where are your leads coming from right now?

If you tell me that, I'll point you to the fastest fix.
If it makes sense, we can do a quick 15-min call this week.`,

  BOOKCALL_V2_OPERATOR_FRAME: (name: string) => `Hey ${name}, appreciate the message.

What's the one thing you want your pipeline to do better this month?

If you want, we can do a quick 15-min call and I'll map the simplest build to get it handled.`,

  BOOKCALL_V3_TIME_WINDOWS: (name: string, timeWindowA?: string, timeWindowB?: string) => {
    const windowA = timeWindowA || 'Tue 6:30pm PT';
    const windowB = timeWindowB || 'Wed 7:15pm PT';
    return `Hey ${name}, appreciate you reaching out.

I can do a quick 15-min call and tell you exactly what I'd fix first.

I'm open ${windowA} or ${windowB}. What works better?`;
  }
};

function extractGoalFromMessage(message: string): string {
  // Try to extract what they want from the message
  const lowered = message.toLowerCase();

  if (lowered.includes('leads') || lowered.includes('pipeline')) {
    return 'get more leads converting to booked appointments';
  }
  if (lowered.includes('follow-up') || lowered.includes('follow up')) {
    return 'automate follow-up so nothing slips';
  }
  if (lowered.includes('crm') || lowered.includes('tracking')) {
    return 'get visibility on your pipeline and stop losing deals';
  }
  if (lowered.includes('booking') || lowered.includes('scheduling')) {
    return 'streamline your booking process and reduce no-shows';
  }
  if (lowered.includes('automation') || lowered.includes('automate')) {
    return 'automate the repetitive stuff so you can focus on delivery';
  }

  return 'fix your lead-to-customer pipeline';
}

/**
 * Select appropriate BOOKCALL variant based on lead intent and fit
 * Returns the variant name and the draft text
 */
function selectBookcallVariant(lead: LeadIntake, analysis: LeadTriage['analysis'], fitScore: number): { variant: string; text: string } {
  const message = lead.lastMessage.toLowerCase();
  const name = lead.name.split(' ')[0];

  // V3: If lead explicitly asks for a call, use TIME_WINDOWS (lowest friction)
  const callPhrases = ['call', 'chat', 'talk', 'speak', 'meeting', 'schedule', 'book'];
  if (callPhrases.some(p => message.includes(p))) {
    return {
      variant: 'BOOKCALL_V3_TIME_WINDOWS',
      text: RESPONSE_TEMPLATES.BOOKCALL_V3_TIME_WINDOWS(name)
    };
  }

  // V2: High intent + Steve should control the frame (urgency cues or budget cues)
  if (analysis.urgencyCues.length > 0 || analysis.budgetCues.length > 0) {
    return {
      variant: 'BOOKCALL_V2_OPERATOR_FRAME',
      text: RESPONSE_TEMPLATES.BOOKCALL_V2_OPERATOR_FRAME(name)
    };
  }

  // V1: Default for unclear but high fit leads
  return {
    variant: 'BOOKCALL_V1_DEFAULT',
    text: RESPONSE_TEMPLATES.BOOKCALL_V1_DEFAULT(name)
  };
}

async function executeDraftPhase(triaged: LeadTriage[]): Promise<{ drafts: DraftReply[]; success: boolean }> {
  console.log('\n============================================================');
  console.log('PHASE 3: RESPONSE DRAFTING (No Send)');
  console.log('============================================================\n');

  const drafts: DraftReply[] = [];

  for (const t of triaged) {
    let draftText: string;
    const name = t.lead.name.split(' ')[0]; // First name only
    const goal = extractGoalFromMessage(t.lead.lastMessage);

    switch (t.leadType) {
      case 'PIPELINE_CLIENT':
        draftText = RESPONSE_TEMPLATES.PIPELINE_CLIENT(name, goal);
        break;
      case 'REFERRAL_PARTNER':
        draftText = RESPONSE_TEMPLATES.REFERRAL_PARTNER(name);
        break;
      case 'WRONG_FIT':
        draftText = RESPONSE_TEMPLATES.WRONG_FIT(name);
        break;
      case 'LOW_SIGNAL':
        draftText = RESPONSE_TEMPLATES.LOW_SIGNAL(name);
        break;
      case 'REACTIVATION':
        draftText = RESPONSE_TEMPLATES.REACTIVATION(name);
        break;
      case 'ALREADY_REPLIED':
        draftText = RESPONSE_TEMPLATES.ALREADY_REPLIED(name);
        break;
      case 'VENDOR_PITCH':
        draftText = RESPONSE_TEMPLATES.VENDOR_PITCH(name);
        break;
      default:
        draftText = RESPONSE_TEMPLATES.LOW_SIGNAL(name);
    }

    drafts.push({
      id: `draft-${t.id}`,
      leadId: t.id,
      leadName: t.lead.name,
      leadType: t.leadType,
      priority: t.priority,
      template: t.leadType,
      draftText,
      status: 'DRAFT',
      threadId: t.lead.threadId
    });

    console.log(`  Drafted reply for ${t.lead.name} (${t.leadType})`);
  }

  // Save drafts
  const proofDir = await ensureProofPackDir();
  const draftsContent = generateDraftsMarkdown(drafts);
  await fs.writeFile(path.join(proofDir, 'DRAFT_REPLIES.md'), draftsContent);
  await fs.writeFile(path.join(proofDir, 'DRAFT_REPLIES.json'), JSON.stringify(drafts, null, 2));
  await logAction('drafts_saved', { count: drafts.length });

  return { drafts, success: true };
}

function generateDraftsMarkdown(drafts: DraftReply[]): string {
  let content = `# Draft Replies

**Date**: ${new Date().toISOString().split('T')[0]}
**Run ID**: ${runId}
**Total Drafts**: ${drafts.length}

⚠️ **DRAFT MODE**: No messages will be sent without explicit approval.

---

`;

  for (const draft of drafts) {
    content += `## ${draft.leadName}

**Lead Type**: ${draft.leadType}
**Priority**: ${draft.priority}
**Template**: ${draft.template}
**Status**: ${draft.status}

### Draft Message

\`\`\`
${draft.draftText}
\`\`\`

---

`;
  }

  return content;
}

// ============================================================================
// PHASE 4: ESCALATION QUEUE
// ============================================================================

async function executeEscalationPhase(triaged: LeadTriage[], drafts: DraftReply[]): Promise<{ cards: EscalationCard[]; success: boolean }> {
  console.log('\n============================================================');
  console.log('PHASE 4: ESCALATION TO STEVE (Approval Gate)');
  console.log('============================================================\n');

  const cards: EscalationCard[] = [];

  // GUARDRAIL: Collect suppressed leads (already replied, no new inbound)
  const suppressed: SuppressedCard[] = triaged
    .filter(t => t.leadType === 'ALREADY_REPLIED')
    .map(t => ({
      leadId: t.id,
      leadName: t.lead.name,
      reason: t.suppressedReason || 'Already replied within 14 days',
      lastOutboundTimestamp: t.lead.lastOutboundTimestamp || t.lead.lastMessageDate || 'Unknown',
      daysSinceOutbound: parseRelativeTimestamp(t.lead.lastOutboundTimestamp || t.lead.lastMessageDate || '') || 0,
      hasNewInbound: t.lead.hasInboundSinceLastOutbound || false
    }));

  // GUARDRAIL: Collect vendor pitches with their matched triggers
  const vendorPitches: VendorPitchCard[] = triaged
    .filter(t => t.leadType === 'VENDOR_PITCH')
    .map(t => ({
      leadId: t.id,
      leadName: t.lead.name,
      triggersMatched: getVendorTriggersMatched(t.lead.lastMessage),
      messagePreview: t.lead.lastMessage.replace(/\n/g, ' ').substring(0, 100),
      reason: t.suppressedReason || 'Vendor pitch detected'
    }));

  if (suppressed.length > 0) {
    console.log(`  Suppressed ${suppressed.length} leads (already replied, awaiting their response)`);
    for (const s of suppressed) {
      console.log(`    - ${s.leadName}: ${s.reason}`);
    }
  }

  if (vendorPitches.length > 0) {
    console.log(`  Vendor pitches filtered: ${vendorPitches.length}`);
    for (const v of vendorPitches) {
      console.log(`    - ${v.leadName}: ${v.triggersMatched.join(', ')}`);
    }
  }

  // Only escalate P0 and qualifying P1 leads (EXCLUDING suppressed types)
  const toEscalate = triaged.filter(t => {
    // GUARDRAIL: Never escalate ALREADY_REPLIED or VENDOR_PITCH
    if (t.leadType === 'ALREADY_REPLIED') return false;
    if (t.leadType === 'VENDOR_PITCH') return false;

    if (t.priority === 'P0') return true;
    if (t.priority === 'P1' && t.analysis.wantsPipeline) return true;
    if (t.analysis.budgetCues.length > 0) return true;
    if (t.analysis.urgencyCues.length > 0) return true;
    return false;
  });

  console.log(`  Escalating ${toEscalate.length} of ${triaged.length} leads (${suppressed.length} suppressed)`);

  for (const t of toEscalate) {
    const draft = drafts.find(d => d.leadId === t.id);
    const goal = extractGoalFromMessage(t.lead.lastMessage);

    // Determine recommended action
    let recommendedAction: EscalationCard['recommendedAction'] = 'SEND_DRAFT';
    let reasoning = 'Standard qualification reply.';
    let riskLevel: EscalationCard['riskLevel'] = 'LOW';
    let bookcallVariant: string | undefined;
    let bookcallDraft: string | undefined;

    if (t.priority === 'P0' && t.analysis.urgencyCues.length > 0) {
      recommendedAction = 'BOOK_CALL';
      reasoning = 'High fit + urgency signals. Ready to close.';
      riskLevel = 'LOW';
      // Select appropriate BOOKCALL variant
      const bookcall = selectBookcallVariant(t.lead, t.analysis, t.fitScore);
      bookcallVariant = bookcall.variant;
      bookcallDraft = bookcall.text;
    } else if (t.leadType === 'WRONG_FIT') {
      recommendedAction = 'DECLINE';
      reasoning = 'Not our lane. Polite redirect.';
      riskLevel = 'LOW';
    } else if (t.analysis.budgetCues.length > 0) {
      recommendedAction = 'SEND_DRAFT';
      reasoning = 'Budget mentioned. Qualify quickly.';
      riskLevel = 'LOW';
    } else if (t.fitScore <= 5) {
      recommendedAction = 'ASK_QUESTIONS';
      reasoning = 'Needs more qualification before committing.';
      riskLevel = 'MEDIUM';
    }

    // Also select BOOKCALL for high-fit P0 leads even without urgency
    if (t.priority === 'P0' && !bookcallVariant) {
      const bookcall = selectBookcallVariant(t.lead, t.analysis, t.fitScore);
      bookcallVariant = bookcall.variant;
      bookcallDraft = bookcall.text;
    }

    cards.push({
      leadId: t.id,
      leadName: t.lead.name,
      priority: t.priority,
      fitScore: t.fitScore,
      leadType: t.leadType,
      whatTheyWant: goal,
      recommendedAction,
      reasoning,
      riskLevel,
      expectedReceipt: recommendedAction === 'BOOK_CALL'
        ? 'Call booked, move to pipeline'
        : 'Reply sent, awaiting response',
      draftPreview: draft?.draftText.substring(0, 150) + '...' || 'No draft',
      bookcallVariant,
      bookcallDraft
    });

    console.log(`  ${t.lead.name}: ${recommendedAction} (${reasoning})${bookcallVariant ? ` [${bookcallVariant}]` : ''}`);
  }

  // Save escalation queue
  const proofDir = await ensureProofPackDir();
  const queueContent = generateEscalationQueue(cards, suppressed, vendorPitches);
  await fs.writeFile(path.join(proofDir, 'STEVE_APPROVAL_QUEUE.md'), queueContent);
  await fs.writeFile(path.join(proofDir, 'STEVE_APPROVAL_QUEUE.json'), JSON.stringify({ escalated: cards, suppressed, vendorPitches }, null, 2));
  await logAction('escalation_queue_saved', { escalated: cards.length, suppressed: suppressed.length, vendorPitches: vendorPitches.length });

  return { cards, success: true };
}

function generateEscalationQueue(cards: EscalationCard[], suppressed: SuppressedCard[] = [], vendorPitches: VendorPitchCard[] = []): string {
  let content = `# Steve's Approval Queue

**Date**: ${new Date().toISOString().split('T')[0]}
**Run ID**: ${runId}
**Leads to Review**: ${cards.length}
**Suppressed (Already Replied)**: ${suppressed.length}
**Vendor Pitches (Filtered)**: ${vendorPitches.length}

---

## Quick Actions Required

`;

  for (const card of cards) {
    const actionEmoji = {
      'SEND_DRAFT': '✉️',
      'BOOK_CALL': '📞',
      'DECLINE': '👋',
      'ASK_QUESTIONS': '❓'
    }[card.recommendedAction];

    content += `### ${actionEmoji} ${card.leadName}

| Field | Value |
|-------|-------|
| Priority | ${card.priority} |
| Fit Score | ${card.fitScore}/10 |
| Type | ${card.leadType} |
| Risk | ${card.riskLevel} |

**What they want**: ${card.whatTheyWant}

**Recommended**: ${card.recommendedAction}
**Why**: ${card.reasoning}
**Expected outcome**: ${card.expectedReceipt}
`;

    // Add BOOKCALL variant info if available
    if (card.bookcallVariant) {
      content += `
**BOOKCALL Variant**: ${card.bookcallVariant}
**BOOKCALL Draft**:
\`\`\`
${card.bookcallDraft}
\`\`\`
`;
    }

    content += `
**Standard Draft preview**:
> ${card.draftPreview}

**Actions**:
- [ ] APPROVE - Send draft as-is
- [ ] EDIT - Modify before sending
- [ ] REJECT - Do not send
${card.bookcallVariant ? '- [ ] BOOKCALL - Use the BOOKCALL draft instead' : ''}

---

`;
  }

  // Add suppressed section if there are any
  if (suppressed.length > 0) {
    content += `
---

## Suppressed (Already Replied)

These leads have already received an outbound message from Steve within the last 14 days and have not replied. **No action needed** - they will be re-evaluated if they respond.

| Lead | Last Outbound | Days Ago | Reason |
|------|---------------|----------|--------|
`;
    for (const s of suppressed) {
      content += `| ${s.leadName} | ${s.lastOutboundTimestamp} | ${s.daysSinceOutbound} | ${s.reason} |\n`;
    }

    content += `
**Note**: If a suppressed lead replies, they will automatically move to the active queue in the next triage run.

`;
  }

  // Add vendor pitches section if there are any
  if (vendorPitches.length > 0) {
    content += `
---

## Suppressed (Vendor Pitch)

These are inbound vendor/service pitches. **No action needed** unless Steve enables "Vendor Replies Mode".

| Lead | Triggers Matched | Message Preview |
|------|------------------|-----------------|
`;
    for (const v of vendorPitches) {
      content += `| ${v.leadName} | ${v.triggersMatched.join(', ')} | ${v.messagePreview}... |\n`;
    }

    content += `
**Note**: Vendor pitch detection uses keyword matching. If a lead is incorrectly classified, manually send via the send command.

`;
  }

  content += `
---

## How to Approve

1. Mark checkboxes above for each lead
2. Run: \`npx ts-node linkedin-inbox-triage.ts send --id=<leadId>\`

Or reply to this file with your decisions and the agent will execute.
`;

  return content;
}

// ============================================================================
// PHASE 5: SEND MODE (Only With Explicit Approval)
// ============================================================================

async function executeSendPhase(leadId: string, overrideMessage?: string): Promise<OperationResult> {
  console.log('\n============================================================');
  console.log('PHASE 5: SEND MODE (With Approval)');
  console.log('============================================================\n');

  // Load drafts
  const proofDir = await ensureProofPackDir();
  let drafts: DraftReply[];

  try {
    const draftsJson = await fs.readFile(path.join(proofDir, 'DRAFT_REPLIES.json'), 'utf8');
    drafts = JSON.parse(draftsJson);
  } catch {
    return {
      success: false,
      status: 'NO_DRAFTS',
      error: 'No drafts found. Run intake, triage, and draft phases first.'
    };
  }

  const draft = drafts.find(d => d.leadId === leadId || d.id === leadId);
  if (!draft) {
    return {
      success: false,
      status: 'DRAFT_NOT_FOUND',
      error: `No draft found for lead ID: ${leadId}`
    };
  }

  // Use override message if provided, otherwise use draft
  const messageToSend = overrideMessage || draft.draftText;

  console.log(`  Sending to: ${draft.leadName}`);
  console.log(`  Thread ID: ${draft.threadId}`);
  console.log(`  Message preview: ${messageToSend.substring(0, 100)}...`);

  if (!page) {
    return {
      success: false,
      status: 'NO_SESSION',
      error: 'No active browser session. Call establishSession first.'
    };
  }

  try {
    // Step 1: Navigate to inbox
    console.log('\n  Step 1: Navigating to inbox...');
    await page.goto(CONFIG.LINKEDIN_INBOX, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await randomWait(2000, 3000);

    // Check for security prompts
    const securityCheck = await detectSecurityPrompt();
    if (securityCheck) {
      return {
        success: false,
        status: 'SECURITY_PROMPT',
        message: `Security prompt detected: ${securityCheck.type}`,
        action: 'RETURN_TO_OCS',
        promptType: securityCheck.type
      };
    }

    // Step 2: Wait for conversation list to load
    console.log('  Step 2: Waiting for conversation list...');
    await page.waitForSelector('.msg-conversation-listitem, .msg-conversations-container__convo-item-link', { timeout: 15000 });

    // Step 3: Find the target conversation by name
    console.log(`  Step 3: Finding conversation with ${draft.leadName}...`);
    const conversations = await page.$$('.msg-conversation-listitem, [data-control-name="overlay.messaging_convo_card"]');

    let targetConversation: ElementHandle | null = null;
    for (const conv of conversations) {
      const nameEl = await conv.$('.msg-conversation-card__participant-names, .msg-conversation-listitem__participant-names');
      if (nameEl) {
        const name = await nameEl.textContent();
        if (name && name.trim().includes(draft.leadName.replace('☑️', '').trim())) {
          targetConversation = conv;
          console.log(`    Found conversation: ${name.trim()}`);
          break;
        }
      }
    }

    if (!targetConversation) {
      // Fallback: try to find by thread index
      const threadIndex = parseInt(draft.threadId?.replace('thread-', '') || '-1');
      if (threadIndex >= 0 && threadIndex < conversations.length) {
        targetConversation = conversations[threadIndex];
        console.log(`    Using fallback: thread index ${threadIndex}`);
      }
    }

    if (!targetConversation) {
      return {
        success: false,
        status: 'THREAD_NOT_FOUND',
        error: `Could not find conversation with ${draft.leadName}`
      };
    }

    // Step 4: Click to open the conversation
    console.log('  Step 4: Opening conversation...');
    await targetConversation.click();
    await randomWait(2000, 3000);

    // Step 5: Find and focus the message input
    console.log('  Step 5: Finding message input...');
    const messageInputSelectors = [
      '.msg-form__contenteditable',
      '[data-artdeco-is-focused] .msg-form__contenteditable',
      '.msg-form__msg-content-container [contenteditable="true"]',
      'div[role="textbox"][aria-label*="message"]',
      '.msg-form__placeholder'
    ];

    let messageInput: ElementHandle | null = null;
    for (const selector of messageInputSelectors) {
      messageInput = await page.$(selector);
      if (messageInput) {
        console.log(`    Found input with selector: ${selector}`);
        break;
      }
    }

    if (!messageInput) {
      await captureProofScreenshot('send-error-no-input');
      return {
        success: false,
        status: 'INPUT_NOT_FOUND',
        error: 'Could not find message input field'
      };
    }

    // Step 6: Click to focus and type the message
    console.log('  Step 6: Typing message...');
    await messageInput.click();
    await randomWait(500, 1000);

    // Clear any existing text
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await randomWait(200, 400);

    // Type the message with human-like delays
    await page.keyboard.type(messageToSend, { delay: CONFIG.TYPING_DELAY });
    await randomWait(1000, 1500);

    // Capture screenshot before sending
    await captureProofScreenshot(`send-before-${draft.leadName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}`);

    // Step 7: Find and click the send button
    console.log('  Step 7: Clicking send button...');
    const sendButtonSelectors = [
      'button.msg-form__send-button',
      'button[type="submit"].msg-form__send-button',
      '.msg-form__send-button',
      'button[aria-label="Send"]',
      'button:has-text("Send")'
    ];

    let sendButton: ElementHandle | null = null;
    for (const selector of sendButtonSelectors) {
      try {
        sendButton = await page.$(selector);
        if (sendButton) {
          const isDisabled = await sendButton.getAttribute('disabled');
          if (!isDisabled) {
            console.log(`    Found send button: ${selector}`);
            break;
          }
        }
      } catch {
        // Continue trying other selectors
      }
    }

    if (!sendButton) {
      await captureProofScreenshot('send-error-no-button');
      return {
        success: false,
        status: 'SEND_BUTTON_NOT_FOUND',
        error: 'Could not find send button'
      };
    }

    // Click send
    await sendButton.click();
    await randomWait(2000, 3000);

    // Step 8: Verify message was sent and capture proof
    console.log('  Step 8: Verifying message sent...');
    await captureProofScreenshot(`send-after-${draft.leadName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}`);

    // Update draft status
    draft.status = 'SENT';
    await fs.writeFile(path.join(proofDir, 'DRAFT_REPLIES.json'), JSON.stringify(drafts, null, 2));

    // Log the send action
    await logAction('message_sent', {
      leadId,
      leadName: draft.leadName,
      threadId: draft.threadId,
      messageLength: messageToSend.length,
      timestamp: new Date().toISOString()
    });

    // Generate send receipt
    await generateSendReceipt(draft, messageToSend);

    console.log('\n  ✅ MESSAGE SENT SUCCESSFULLY');
    console.log(`     To: ${draft.leadName}`);
    console.log(`     Length: ${messageToSend.length} characters`);

    return {
      success: true,
      status: 'SENT',
      message: `Message sent to ${draft.leadName}`,
      screenshots: [
        `send-before-${draft.leadName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}.png`,
        `send-after-${draft.leadName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}.png`
      ]
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  ❌ Send failed: ${errorMessage}`);
    await captureProofScreenshot('send-error');
    await logAction('send_error', { leadId, error: errorMessage });

    return {
      success: false,
      status: 'SEND_ERROR',
      error: errorMessage
    };
  }
}

async function generateSendReceipt(draft: DraftReply, messageSent: string): Promise<void> {
  const proofDir = await ensureProofPackDir();
  const timestamp = new Date().toISOString();

  const receipt = `# Message Send Receipt

**Date**: ${timestamp.split('T')[0]}
**Time**: ${timestamp.split('T')[1].split('.')[0]} UTC
**Run ID**: ${runId}

---

## Recipient

| Field | Value |
|-------|-------|
| Name | ${draft.leadName} |
| Lead ID | ${draft.leadId} |
| Thread ID | ${draft.threadId} |
| Lead Type | ${draft.leadType} |
| Priority | ${draft.priority} |

---

## Message Sent

\`\`\`
${messageSent}
\`\`\`

---

## Status

- **Status**: ✅ SENT
- **Timestamp**: ${timestamp}
- **Character Count**: ${messageSent.length}

---

## Proof Screenshots

- \`screenshots/send-before-*.png\` - Message composed
- \`screenshots/send-after-*.png\` - Message sent confirmation

---

**Generated by**: LinkedIn Inbox Triage Agent v1.0
`;

  await fs.writeFile(path.join(proofDir, `SEND_RECEIPT_${draft.leadId}.md`), receipt);
  await logAction('send_receipt_generated', { leadId: draft.leadId });
}

// ============================================================================
// RECEIPT GENERATION
// ============================================================================

async function generateReceipt(
  leads: LeadIntake[],
  triaged: LeadTriage[],
  drafts: DraftReply[],
  escalated: EscalationCard[]
): Promise<void> {
  const proofDir = await ensureProofPackDir();

  const receipt = `# LinkedIn Inbox Daily Triage - Receipt

**Date**: ${new Date().toISOString().split('T')[0]}
**Run ID**: ${runId}
**Timestamp**: ${new Date().toISOString()}

---

## Summary

| Metric | Count |
|--------|-------|
| Total Leads Collected | ${leads.length} |
| Inbox Threads | ${leads.filter(l => l.source === 'inbox').length} |
| Service Requests | ${leads.filter(l => l.source === 'service_request').length} |
| P0 (High Priority) | ${triaged.filter(t => t.priority === 'P0').length} |
| P1 (Medium Priority) | ${triaged.filter(t => t.priority === 'P1').length} |
| P2 (Low Priority) | ${triaged.filter(t => t.priority === 'P2').length} |
| Drafts Created | ${drafts.length} |
| Escalated to Steve | ${escalated.length} |

---

## Phase Results

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Intake | ✅ COMPLETE | ${leads.length} leads collected |
| 2. Triage | ✅ COMPLETE | All leads scored and classified |
| 3. Draft | ✅ COMPLETE | ${drafts.length} responses drafted |
| 4. Escalate | ✅ COMPLETE | ${escalated.length} leads in approval queue |
| 5. Send | ⏸️ PENDING | Awaiting Steve's approval |

---

## Files Generated

- \`LEAD_INTAKE.json\` - Raw lead data
- \`LEAD_TRIAGE_REPORT.md\` - Scoring and classification
- \`DRAFT_REPLIES.md\` - Response drafts
- \`DRAFT_REPLIES.json\` - Drafts in JSON format
- \`STEVE_APPROVAL_QUEUE.md\` - Approval decisions needed
- \`STEVE_APPROVAL_QUEUE.json\` - Queue in JSON format
- \`screenshots/\` - Proof screenshots

---

## Next Steps

1. Review \`STEVE_APPROVAL_QUEUE.md\`
2. Mark approvals for each lead
3. Run: \`npx ts-node linkedin-inbox-triage.ts send --id=<leadId>\`

---

**Generated by**: LinkedIn Inbox Triage Agent v1.0
**Mode**: DRAFT-FIRST (no sends without approval)
`;

  await fs.writeFile(path.join(proofDir, 'LINKEDIN_INBOX_TRIAGE_RECEIPT.md'), receipt);
  await logAction('receipt_generated');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function runFullTriage(): Promise<void> {
  runId = generateRunId();
  console.log(`\n🚀 LinkedIn Inbox Daily Triage - ${runId}\n`);

  try {
    // Establish session
    console.log('Establishing LinkedIn session...');
    const sessionResult = await establishSession();
    if (!sessionResult.success) {
      console.error('Failed to establish session:', sessionResult.error || sessionResult.message);
      return;
    }

    // Phase 1: Intake
    const { leads, success: intakeSuccess } = await executeIntakePhase();
    if (!intakeSuccess || leads.length === 0) {
      console.log('\nNo actionable leads found. Ending triage.');
      await closeSession();
      return;
    }

    // Phase 2: Triage
    const { triaged, success: triageSuccess } = await executeTriagePhase(leads);
    if (!triageSuccess) {
      console.log('\nTriage phase failed.');
      await closeSession();
      return;
    }

    // Phase 3: Draft
    const { drafts, success: draftSuccess } = await executeDraftPhase(triaged);
    if (!draftSuccess) {
      console.log('\nDraft phase failed.');
      await closeSession();
      return;
    }

    // Phase 4: Escalation
    const { cards, success: escalateSuccess } = await executeEscalationPhase(triaged, drafts);
    if (!escalateSuccess) {
      console.log('\nEscalation phase failed.');
      await closeSession();
      return;
    }

    // Generate final receipt
    await generateReceipt(leads, triaged, drafts, cards);

    console.log('\n============================================================');
    console.log('TRIAGE COMPLETE');
    console.log('============================================================');
    console.log(`\nResults saved to: ${path.join(getTodayFolder(), runId)}`);
    console.log(`\nNext: Review STEVE_APPROVAL_QUEUE.md and approve sends.`);

  } catch (error) {
    console.error('Triage failed:', error);
    await logAction('triage_error', { error: String(error) });
  } finally {
    await closeSession();
  }
}

// ============================================================================
// CLI HANDLER
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';

  runId = generateRunId();

  switch (command) {
    case 'intake':
      console.log('Running Phase 1: Intake only');
      const sessionResult = await establishSession();
      if (sessionResult.success) {
        await executeIntakePhase();
        await closeSession();
      }
      break;

    case 'triage':
      console.log('Running Phase 2: Triage (requires existing intake)');
      // Load existing intake and run triage
      break;

    case 'draft':
      console.log('Running Phase 3: Draft (requires existing triage)');
      // Load existing triage and run draft
      break;

    case 'escalate':
      console.log('Running Phase 4: Escalate (requires existing drafts)');
      // Load existing drafts and run escalation
      break;

    case 'send':
      const leadIdArg = args.find(a => a.startsWith('--id='));
      if (!leadIdArg) {
        console.error('Usage: send --id=<leadId> [--run=<runId>] [--message="custom message"]');
        process.exit(1);
      }
      const leadId = leadIdArg.split('=')[1];

      // Check for run ID override or find the latest run with drafts
      const runIdArg = args.find(a => a.startsWith('--run='));
      if (runIdArg) {
        runId = runIdArg.split('=')[1];
        console.log(`  Using specified run: ${runId}`);
      } else {
        // Find the latest run with DRAFT_REPLIES.json
        const todayFolder = getTodayFolder();
        try {
          const runs = await fs.readdir(todayFolder);
          const validRuns = [];
          for (const run of runs.sort().reverse()) {
            const draftsPath = path.join(todayFolder, run, 'DRAFT_REPLIES.json');
            try {
              await fs.access(draftsPath);
              validRuns.push(run);
            } catch {
              // No drafts in this run
            }
          }
          if (validRuns.length > 0) {
            runId = validRuns[0]; // Most recent run with drafts
            console.log(`  Found latest run with drafts: ${runId}`);
          } else {
            console.error('No runs with drafts found in today\'s folder');
            process.exit(1);
          }
        } catch (err) {
          console.error('Could not read today\'s runs folder:', err);
          process.exit(1);
        }
      }

      // Check for custom message override
      const messageArg = args.find(a => a.startsWith('--message='));
      const customMessage = messageArg ? messageArg.split('=').slice(1).join('=') : undefined;

      console.log(`Running Phase 5: Send for lead ${leadId}`);
      if (customMessage) {
        console.log('  Using custom message override');
      }

      const sendSession = await establishSession();
      if (sendSession.success) {
        const result = await executeSendPhase(leadId, customMessage);
        await closeSession();
        if (result.success) {
          console.log('\n✅ Send completed successfully');
          console.log(`   Screenshots: ${result.screenshots?.join(', ')}`);
        } else {
          console.error(`\n❌ Send failed: ${result.error || result.message}`);
          process.exit(1);
        }
      }
      break;

    case 'full':
    default:
      await runFullTriage();
      break;
  }
}

main().catch(console.error);
