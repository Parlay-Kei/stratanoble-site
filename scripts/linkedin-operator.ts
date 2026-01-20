#!/usr/bin/env npx ts-node

/**
 * LinkedIn Operator Agent - Playwright RPA Runner v2.3
 *
 * Internal ANX agent for managing LinkedIn Service Page updates via browser automation.
 *
 * SAFETY: Defaults to dry-run mode. Must explicitly enable live mode.
 * LOGGING: Every action logged with timestamp and proof screenshots.
 * SECURITY: Stops on 2FA/CAPTCHA, returns control to OCS.
 *
 * v2.0 UPGRADES:
 * - Robust click handling with scrollIntoView, force clicks, evaluate fallbacks
 * - Sticky header mitigation
 * - Wizard navigation for uploads
 * - Tag dropdown selection
 * - finish-update command for completing partial runs
 *
 * v2.1 UPGRADES:
 * - CSS injection to neutralize sticky header (pointer-events: none)
 * - Section-specific edit targeting (find edit button within section container)
 * - Enhanced wizard navigation for multi-step uploads
 * - Dropdown-only tag selection with NOT_AVAILABLE graceful handling
 * - Pricing verification (read-back confirmation)
 * - Gallery verification after upload
 *
 * v2.2 UPGRADES:
 * - File chooser interception using page.waitForEvent('filechooser')
 * - Modal-scoped tag selection (queries within modal container)
 * - Force click with Escape retry for overlay interception
 * - Neutralize artdeco-modal-overlay pointer events
 *
 * v2.3 UPGRADES (Upload Resolver):
 * - Editability state verification with hard proof screenshots
 * - File chooser event BEFORE trigger click
 * - Hidden input discovery (DOM + iframes)
 * - Dropzone simulation (DataTransfer events)
 * - Shadow DOM traversal for file inputs
 * - Iframe context switching for upload modals
 * - Tags readonly detection and confirmation
 */

import { chromium, Browser, BrowserContext, Page, ElementHandle, FileChooser } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';

// ============================================================================
// TYPES
// ============================================================================

interface SessionConfig {
  cookiePath?: string;
  headless?: boolean;
  servicePageUrl?: string;
}

interface UpdateOptions {
  dryRun: boolean;
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

interface ActionLog {
  action: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

interface ServicePageUpdateConfig {
  servicePageUrl: string;
  tagsToRemove: string[];
  tagsToKeep: string[];
  tagsToAdd: string[];
  overviewText: string;
  pricingText: string;
  workSamplePaths: string[];
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;
let runId: string = '';
let actionCount = 0;
const MAX_ACTIONS_PER_SESSION = 25; // Increased for wizard navigation

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
  PROOF_PACKS_DIR: './proof-packs',
  SESSION_FILE: './linkedin-session.json',

  // LinkedIn URLs
  LINKEDIN_FEED: 'https://www.linkedin.com/feed/',

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

async function randomWait(min: number = CONFIG.MIN_WAIT, max: number = CONFIG.MAX_WAIT): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`  [wait ${delay}ms]`);
  await new Promise(resolve => setTimeout(resolve, delay));
}

async function ensureProofPackDir(): Promise<string> {
  const proofDir = path.join(CONFIG.PROOF_PACKS_DIR, runId);
  await fs.mkdir(proofDir, { recursive: true });
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
  const screenshotPath = path.join(proofDir, filename);

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
// ROBUST CLICK UTILITIES (v2.1)
// ============================================================================

/**
 * Neutralize sticky header by injecting CSS (v2.1)
 * Temporarily sets pointer-events: none on global nav
 */
async function neutralizeStickyHeader(): Promise<void> {
  if (!page) return;

  await page.evaluate(() => {
    const style = document.createElement('style');
    style.id = 'linkedin-sticky-neutralizer';
    style.textContent = `
      .global-nav, nav[aria-label*="Primary"], header.global-nav {
        pointer-events: none !important;
        position: relative !important;
      }
      .global-nav *, nav[aria-label*="Primary"] * {
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  });
  console.log('  [v2.1] Sticky header neutralized');
  await logAction('sticky_header_neutralized');
}

/**
 * Restore sticky header after operations
 */
async function restoreStickyHeader(): Promise<void> {
  if (!page) return;

  await page.evaluate(() => {
    const style = document.getElementById('linkedin-sticky-neutralizer');
    if (style) style.remove();
  });
  console.log('  [v2.1] Sticky header restored');
}

/**
 * Neutralize modal overlay by injecting CSS (v2.2)
 * Temporarily sets pointer-events: none on artdeco-modal-overlay
 */
async function neutralizeModalOverlay(): Promise<void> {
  if (!page) return;

  await page.evaluate(() => {
    const style = document.createElement('style');
    style.id = 'linkedin-modal-overlay-neutralizer';
    style.textContent = `
      .artdeco-modal-overlay,
      .artdeco-modal-overlay--layer-default,
      [class*="modal-overlay"] {
        pointer-events: none !important;
      }
      .artdeco-modal,
      .artdeco-modal__content,
      [class*="modal__content"],
      [role="dialog"] {
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);
  });
  console.log('  [v2.2] Modal overlay neutralized');
  await logAction('modal_overlay_neutralized');
}

/**
 * Restore modal overlay after operations
 */
async function restoreModalOverlay(): Promise<void> {
  if (!page) return;

  await page.evaluate(() => {
    const style = document.getElementById('linkedin-modal-overlay-neutralizer');
    if (style) style.remove();
  });
  console.log('  [v2.2] Modal overlay restored');
}

/**
 * Scroll element into view and away from sticky headers
 */
async function scrollIntoViewSafe(element: ElementHandle): Promise<void> {
  if (!page) return;

  await element.scrollIntoViewIfNeeded();
  // Extra scroll to avoid sticky header (scroll down 100px more)
  await page.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < 100) {
      window.scrollBy(0, rect.top - 150);
    }
  }, element);
  await new Promise(r => setTimeout(r, 500));
}

/**
 * Robust click with multiple fallback strategies
 */
async function robustClick(selector: string, description: string): Promise<boolean> {
  if (!page) return false;

  console.log(`  Attempting click: ${description}`);

  // Strategy 1: Normal click with scroll
  try {
    const element = await page.$(selector);
    if (element) {
      await scrollIntoViewSafe(element);
      await element.click({ timeout: 5000 });
      console.log(`    ✓ Normal click succeeded`);
      await logAction('click_success', { selector, method: 'normal' });
      return true;
    }
  } catch (e) {
    console.log(`    Normal click failed, trying force...`);
  }

  // Strategy 2: Force click
  try {
    const element = await page.$(selector);
    if (element) {
      await scrollIntoViewSafe(element);
      await element.click({ force: true, timeout: 5000 });
      console.log(`    ✓ Force click succeeded`);
      await logAction('click_success', { selector, method: 'force' });
      return true;
    }
  } catch (e) {
    console.log(`    Force click failed, trying JS click...`);
  }

  // Strategy 3: JavaScript click via evaluate
  try {
    const clicked = await page.evaluate((sel) => {
      const el = document.querySelector(sel) as HTMLElement;
      if (el) {
        el.scrollIntoView({ block: 'center' });
        el.click();
        return true;
      }
      return false;
    }, selector);

    if (clicked) {
      console.log(`    ✓ JS click succeeded`);
      await logAction('click_success', { selector, method: 'evaluate' });
      return true;
    }
  } catch (e) {
    console.log(`    JS click failed`);
  }

  // Strategy 4: Click by coordinates
  try {
    const element = await page.$(selector);
    if (element) {
      const box = await element.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        console.log(`    ✓ Coordinate click succeeded`);
        await logAction('click_success', { selector, method: 'coordinates' });
        return true;
      }
    }
  } catch (e) {
    console.log(`    Coordinate click failed`);
  }

  await logAction('click_failed', { selector, description });
  return false;
}

/**
 * Find and click element by text content with multiple strategies
 */
async function clickByText(text: string, description: string): Promise<boolean> {
  if (!page) return false;

  console.log(`  Clicking by text: "${text}" (${description})`);

  // Try various selectors
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

  // Try evaluate with exact text match
  try {
    const clicked = await page.evaluate((searchText) => {
      const elements = document.querySelectorAll('button, a, span, div, [role="button"]');
      for (const el of elements) {
        if (el.textContent?.includes(searchText)) {
          (el as HTMLElement).scrollIntoView({ block: 'center' });
          (el as HTMLElement).click();
          return true;
        }
      }
      return false;
    }, text);

    if (clicked) {
      console.log(`    ✓ JS text click succeeded`);
      await logAction('click_by_text_success', { text, method: 'evaluate' });
      return true;
    }
  } catch {
    // Continue
  }

  console.log(`    ✗ Could not find/click: "${text}"`);
  await logAction('click_by_text_failed', { text });
  return false;
}

/**
 * Wait for and dismiss any modal overlays
 */
async function dismissOverlays(): Promise<void> {
  if (!page) return;

  const overlaySelectors = [
    'button[aria-label="Dismiss"]',
    'button[aria-label="Close"]',
    '.artdeco-modal__dismiss',
    '[data-test-modal-close-btn]'
  ];

  for (const sel of overlaySelectors) {
    try {
      const overlay = await page.$(sel);
      if (overlay && await overlay.isVisible()) {
        await overlay.click();
        await new Promise(r => setTimeout(r, 500));
      }
    } catch {
      // Continue
    }
  }
}

/**
 * Click edit button within a specific section container (v2.1)
 * Finds section by heading text, then clicks Edit within that section
 */
async function clickSectionEdit(sectionHeading: string): Promise<boolean> {
  if (!page) return false;

  console.log(`  [v2.1] Looking for Edit in section: "${sectionHeading}"`);

  const clicked = await page.evaluate((heading) => {
    // Find all section-like containers
    const sections = document.querySelectorAll('section, div[class*="section"], div[class*="card"]');

    for (const section of sections) {
      // Check if this section contains our heading
      const headings = section.querySelectorAll('h1, h2, h3, h4, span, div');
      let hasHeading = false;

      for (const h of headings) {
        if (h.textContent?.toLowerCase().includes(heading.toLowerCase())) {
          hasHeading = true;
          break;
        }
      }

      if (hasHeading) {
        // Find Edit button/link within this section
        const editBtns = section.querySelectorAll('button, a');
        for (const btn of editBtns) {
          if (btn.textContent?.toLowerCase().includes('edit') ||
              btn.getAttribute('aria-label')?.toLowerCase().includes('edit')) {
            (btn as HTMLElement).scrollIntoView({ block: 'center' });
            (btn as HTMLElement).click();
            return true;
          }
        }
      }
    }
    return false;
  }, sectionHeading);

  if (clicked) {
    console.log(`    ✓ Section Edit clicked for: ${sectionHeading}`);
    await logAction('section_edit_clicked', { section: sectionHeading });
    return true;
  }

  console.log(`    ✗ Section Edit not found for: ${sectionHeading}`);
  await logAction('section_edit_not_found', { section: sectionHeading });
  return false;
}

/**
 * Select tag from dropdown by typing and clicking option (v2.2)
 * Modal-scoped with force click and Escape retry
 * Handles NOT_AVAILABLE gracefully
 */
async function selectTagFromDropdown(tagName: string): Promise<'ADDED' | 'NOT_AVAILABLE' | 'ERROR'> {
  if (!page) return 'ERROR';

  console.log(`  [v2.2] Selecting tag from dropdown (modal-scoped): "${tagName}"`);

  // v2.2: Neutralize modal overlay to prevent pointer event interception
  await neutralizeModalOverlay();

  const attemptSelect = async (retryCount: number): Promise<'ADDED' | 'NOT_AVAILABLE' | 'ERROR'> => {
    try {
      // v2.2: Modal-scoped input selectors - query within modal container
      const modalContainer = await page!.$('.artdeco-modal, [role="dialog"], .artdeco-modal__content');

      const inputSelectors = [
        'input[placeholder*="Add"]',
        'input[placeholder*="Search"]',
        'input[placeholder*="service"]',
        'input[aria-label*="Add"]',
        'input[type="text"]:not([disabled])'
      ];

      let inputFound = false;
      let inputElement: ElementHandle | null = null;

      for (const sel of inputSelectors) {
        // v2.2: Query within modal if found, otherwise fallback to page
        inputElement = modalContainer
          ? await modalContainer.$(sel)
          : await page!.$(sel);

        if (inputElement) {
          const isVisible = await inputElement.isVisible();
          const isEnabled = await inputElement.isEnabled();

          if (isVisible && isEnabled) {
            inputFound = true;
            break;
          }
        }
      }

      if (!inputFound || !inputElement) {
        console.log(`    ⚠ No enabled input found for tag selection`);
        await logAction('tag_input_not_found_v22', { tag: tagName, retry: retryCount });
        return 'ERROR';
      }

      // v2.2: Force click with scroll
      await inputElement.scrollIntoViewIfNeeded();
      await inputElement.click({ force: true });
      await new Promise(r => setTimeout(r, 500));

      // Clear and type
      await inputElement.fill('');
      await inputElement.type(tagName, { delay: 80 });
      await new Promise(r => setTimeout(r, 1500)); // Wait for dropdown

      // v2.2: Modal-scoped dropdown option selection
      const optionClicked = await page!.evaluate((tag) => {
        // First try within modal
        const modal = document.querySelector('.artdeco-modal, [role="dialog"]');
        const searchRoot = modal || document;

        const selectors = [
          '[role="option"]',
          '[role="listitem"]',
          'li[class*="suggestion"]',
          'li[class*="option"]',
          'div[class*="dropdown"] li',
          'ul[class*="dropdown"] li',
          '[class*="typeahead"] li',
          '[class*="autocomplete"] li'
        ];

        for (const sel of selectors) {
          const options = searchRoot.querySelectorAll(sel);
          for (const opt of options) {
            const text = opt.textContent?.toLowerCase() || '';
            if (text.includes(tag.toLowerCase())) {
              // v2.2: Force click via JS
              (opt as HTMLElement).scrollIntoView({ block: 'center' });
              (opt as HTMLElement).click();
              return 'ADDED';
            }
          }
        }
        return 'NOT_FOUND';
      }, tagName);

      if (optionClicked === 'ADDED') {
        console.log(`    ✓ Tag selected: ${tagName}`);
        await logAction('tag_selected_v22', { tag: tagName });
        return 'ADDED';
      }

      // Tag not in dropdown
      console.log(`    ⚠ NOT_AVAILABLE: ${tagName} (not in dropdown)`);
      await logAction('tag_not_available_v22', { tag: tagName });

      // Clear input and press Escape to close dropdown
      await page!.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));

      return 'NOT_AVAILABLE';

    } catch (err) {
      const errorMsg = String(err);
      console.log(`    ✗ Error selecting tag (attempt ${retryCount + 1}): ${errorMsg}`);

      // v2.2: If interception error and first attempt, press Escape and retry
      if (retryCount === 0 && errorMsg.includes('intercept')) {
        console.log(`    [v2.2] Escape retry: pressing Escape and retrying...`);
        await page!.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 1000));
        return attemptSelect(retryCount + 1);
      }

      await logAction('tag_selection_error_v22', { tag: tagName, error: errorMsg, retry: retryCount });
      return 'ERROR';
    }
  };

  const result = await attemptSelect(0);

  // v2.2: Restore modal overlay
  await restoreModalOverlay();

  return result;
}

/**
 * Upload files using file chooser interception (v2.2)
 * Uses page.waitForEvent('filechooser') to catch the file dialog
 */
async function uploadWithFileChooser(
  filePaths: string[],
  triggerSelector?: string
): Promise<{ uploaded: number; errors: string[] }> {
  if (!page) return { uploaded: 0, errors: ['No page available'] };

  const results = { uploaded: 0, errors: [] as string[] };
  console.log(`  [v2.2] Using file chooser interception for ${filePaths.length} files`);

  // Resolve all file paths first
  const resolvedPaths: string[] = [];
  for (const filePath of filePaths) {
    const absolutePath = path.resolve(filePath);
    try {
      await fs.access(absolutePath);
      resolvedPaths.push(absolutePath);
    } catch {
      results.errors.push(`File not found: ${absolutePath}`);
    }
  }

  if (resolvedPaths.length === 0) {
    results.errors.push('No valid files to upload');
    return results;
  }

  try {
    // Click the trigger button first
    let clicked = false;
    const triggerTexts = ['Upload samples', 'Upload', 'Add media', 'Choose file', 'Browse', 'Select files', 'Add work'];

    if (triggerSelector) {
      clicked = await robustClick(triggerSelector, 'Upload trigger');
    }

    if (!clicked) {
      for (const text of triggerTexts) {
        clicked = await clickByText(text, `Upload trigger: ${text}`);
        if (clicked) break;
      }
    }

    if (!clicked) {
      // Try clicking any visible file-related button via evaluate
      clicked = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button, a, [role="button"]');
        for (const btn of buttons) {
          const text = btn.textContent?.toLowerCase() || '';
          const label = btn.getAttribute('aria-label')?.toLowerCase() || '';
          if (text.includes('upload') || text.includes('add') || text.includes('file') ||
              label.includes('upload') || label.includes('add')) {
            (btn as HTMLElement).click();
            return true;
          }
        }
        return false;
      });
    }

    if (!clicked) {
      results.errors.push('Could not click upload trigger');
      return results;
    }

    // Wait for page to potentially navigate/update
    await new Promise(r => setTimeout(r, 2000));
    await captureProofScreenshot('upload-wizard-opened');

    // v2.2: Try file chooser interception with wizard buttons
    console.log('    [v2.2] Trying file chooser interception...');
    let fileChooser: FileChooser | null = null;

    const wizardButtons = ['Upload', 'Choose file', 'Browse', 'Select files', 'Add file'];
    for (const btnText of wizardButtons) {
      // Click the wizard button
      console.log(`    [v2.2] Trying button: "${btnText}"`);
      const btnClicked = await clickByText(btnText, `Wizard: ${btnText}`);

      if (btnClicked) {
        // Use Promise.race with a timeout to avoid unhandled rejection
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), 5000);
        });

        const chooserPromise = page.waitForEvent('filechooser').catch(() => null);

        const result = await Promise.race([chooserPromise, timeoutPromise]);

        if (result) {
          fileChooser = result as FileChooser;
          console.log(`    [v2.2] ✓ File chooser intercepted after "${btnText}"`);
          await logAction('filechooser_intercepted_v22', { trigger: btnText });
          break;
        } else {
          console.log(`    [v2.2] No file chooser after "${btnText}"`);
        }
      }
    }

    // If file chooser not intercepted, fall back to v2.1
    if (!fileChooser) {
      console.log('    [v2.2] File chooser not intercepted - falling back to v2.1 method');
      await logAction('filechooser_fallback_to_v21');
      return navigateUploadWizardV21(filePaths);
    }

    // Upload all files at once via file chooser
    console.log(`    [v2.2] Setting files: ${resolvedPaths.map(p => path.basename(p)).join(', ')}`);
    await fileChooser.setFiles(resolvedPaths);
    await new Promise(r => setTimeout(r, 3000));

    results.uploaded = resolvedPaths.length;
    await logAction('files_uploaded_v22', { files: resolvedPaths.map(p => path.basename(p)) });
    await captureProofScreenshot('files-uploaded-v22');

    // Complete wizard if needed
    await new Promise(r => setTimeout(r, 2000));
    const completeButtons = ['Done', 'Save', 'Finish', 'Complete', 'Post'];
    for (const btnText of completeButtons) {
      const btnClicked = await clickByText(btnText, `Complete: ${btnText}`);
      if (btnClicked) {
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    }

    await captureProofScreenshot('upload-complete-v22');

  } catch (err) {
    const errMsg = `File chooser error: ${err}`;
    console.log(`    ✗ ${errMsg}`);
    results.errors.push(errMsg);
    await logAction('filechooser_error_v22', { error: String(err) });
  }

  return results;
}

/**
 * Navigate upload wizard step by step (v2.1 fallback)
 */
async function navigateUploadWizardV21(filePaths: string[]): Promise<{ uploaded: number; errors: string[] }> {
  if (!page) return { uploaded: 0, errors: ['No page available'] };

  const results = { uploaded: 0, errors: [] as string[] };
  console.log(`  [v2.1 fallback] Starting upload wizard with ${filePaths.length} files`);

  try {
    // Step 1: Click Upload samples / Add media
    let wizardOpened = await clickByText('Upload samples', 'Upload samples button');
    if (!wizardOpened) {
      wizardOpened = await clickByText('Add media', 'Add media button');
    }
    if (!wizardOpened) {
      wizardOpened = await clickByText('Add work', 'Add work button');
    }

    if (!wizardOpened) {
      results.errors.push('Could not open upload wizard');
      return results;
    }

    await new Promise(r => setTimeout(r, 2000));
    await captureProofScreenshot('upload-wizard-step1');

    // Step 2: Look for file input in multiple ways
    let fileInput = await findFileInput();

    if (!fileInput) {
      // Try clicking through wizard buttons
      const wizardButtons = ['Upload', 'Choose file', 'Browse', 'Select files'];
      for (const btnText of wizardButtons) {
        await clickByText(btnText, `Wizard button: ${btnText}`);
        await new Promise(r => setTimeout(r, 1500));
        fileInput = await findFileInput();
        if (fileInput) break;
      }
    }

    if (!fileInput) {
      // Try finding hidden input and making it visible
      fileInput = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="file"]');
        for (const input of inputs) {
          // Make hidden inputs visible
          (input as HTMLElement).style.display = 'block';
          (input as HTMLElement).style.visibility = 'visible';
          (input as HTMLElement).style.opacity = '1';
          return true;
        }
        return false;
      }) ? await page.$('input[type="file"]') : null;
    }

    if (!fileInput) {
      results.errors.push('File input not found after wizard navigation');
      await captureProofScreenshot('upload-wizard-no-input');
      return results;
    }

    // Step 3: Upload files
    for (const filePath of filePaths) {
      const absolutePath = path.resolve(filePath);
      const fileName = path.basename(absolutePath);

      console.log(`    Uploading: ${fileName}`);

      try {
        await fs.access(absolutePath);
        await fileInput.setInputFiles(absolutePath);
        await new Promise(r => setTimeout(r, 3000));

        results.uploaded++;
        await logAction('file_uploaded_v21', { file: fileName });
        await captureProofScreenshot(`uploaded-${fileName.replace(/\.[^.]+$/, '')}`);

        // Check for "Add another" button for multiple files
        if (filePaths.indexOf(filePath) < filePaths.length - 1) {
          const addMore = await clickByText('Add another', 'Add another file');
          if (!addMore) {
            await clickByText('Add', 'Add file');
          }
          await new Promise(r => setTimeout(r, 1000));
          fileInput = await findFileInput();
        }
      } catch (err) {
        const errorMsg = `Failed to upload ${fileName}: ${err}`;
        console.log(`    ✗ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }

    // Step 4: Complete wizard
    const completeButtons = ['Done', 'Save', 'Finish', 'Complete', 'Close'];
    for (const btnText of completeButtons) {
      const clicked = await clickByText(btnText, `Complete wizard: ${btnText}`);
      if (clicked) {
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    }

    await captureProofScreenshot('upload-wizard-complete');

  } catch (err) {
    results.errors.push(`Wizard error: ${err}`);
  }

  return results;
}

/**
 * Navigate upload wizard step by step (v2.3 - uses Upload Resolver)
 */
async function navigateUploadWizard(filePaths: string[]): Promise<{ uploaded: number; errors: string[] }> {
  // v2.3: Use Upload Resolver with all methods
  return uploadResolverV23(filePaths);
}

/**
 * Find file input element with multiple strategies
 */
async function findFileInput(): Promise<ElementHandle | null> {
  if (!page) return null;

  // Direct query
  let input = await page.$('input[type="file"]');
  if (input) return input;

  // Try in iframes
  const frames = page.frames();
  for (const frame of frames) {
    try {
      input = await frame.$('input[type="file"]');
      if (input) return input;
    } catch {
      continue;
    }
  }

  return null;
}

// ============================================================================
// V2.3 UPLOAD RESOLVER
// ============================================================================

interface EditabilityState {
  isEditable: boolean;
  editButtons: string[];
  saveButtons: string[];
  disabledElements: number;
  uploadSection: {
    found: boolean;
    hasUploadButton: boolean;
    hasDropzone: boolean;
    hasFileInput: boolean;
  };
  tagsSection: {
    found: boolean;
    inputEnabled: boolean;
  };
}

/**
 * v2.3: Verify editability state with hard proof
 * Detects if page is in editable mode vs view-only
 */
async function verifyEditabilityState(): Promise<EditabilityState> {
  if (!page) {
    return {
      isEditable: false,
      editButtons: [],
      saveButtons: [],
      disabledElements: 0,
      uploadSection: { found: false, hasUploadButton: false, hasDropzone: false, hasFileInput: false },
      tagsSection: { found: false, inputEnabled: false }
    };
  }

  console.log('  [v2.3] Verifying editability state...');

  const state = await page.evaluate(() => {
    const result = {
      isEditable: false,
      editButtons: [] as string[],
      saveButtons: [] as string[],
      disabledElements: 0,
      uploadSection: {
        found: false,
        hasUploadButton: false,
        hasDropzone: false,
        hasFileInput: false
      },
      tagsSection: {
        found: false,
        inputEnabled: false
      }
    };

    // Find Edit buttons
    const editBtns = document.querySelectorAll('button, a, [role="button"]');
    for (const btn of editBtns) {
      const text = btn.textContent?.toLowerCase() || '';
      const label = btn.getAttribute('aria-label')?.toLowerCase() || '';
      if (text.includes('edit') || label.includes('edit')) {
        result.editButtons.push(text.trim().substring(0, 30));
        result.isEditable = true;
      }
      if (text.includes('save') || text.includes('done') || text.includes('next')) {
        result.saveButtons.push(text.trim().substring(0, 30));
      }
    }

    // Count disabled elements
    result.disabledElements = document.querySelectorAll('[disabled], [aria-disabled="true"]').length;

    // Check upload section
    const uploadTexts = ['upload sample', 'add media', 'work sample', 'portfolio'];
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
      const text = el.textContent?.toLowerCase() || '';
      if (uploadTexts.some(t => text.includes(t))) {
        result.uploadSection.found = true;
        break;
      }
    }

    // Check for upload button
    for (const btn of editBtns) {
      const text = btn.textContent?.toLowerCase() || '';
      if (text.includes('upload') || text.includes('add media')) {
        result.uploadSection.hasUploadButton = true;
        break;
      }
    }

    // Check for dropzone
    const dropzones = document.querySelectorAll('[class*="drop"], [class*="drag"], [data-drop], [ondrop]');
    result.uploadSection.hasDropzone = dropzones.length > 0;

    // Check for file input
    result.uploadSection.hasFileInput = document.querySelector('input[type="file"]') !== null;

    // Check tags section
    const tagsSection = Array.from(allElements).find(el =>
      el.textContent?.toLowerCase().includes('services provided')
    );
    if (tagsSection) {
      result.tagsSection.found = true;
      const inputs = document.querySelectorAll('input[type="text"]');
      for (const input of inputs) {
        if (!(input as HTMLInputElement).disabled) {
          result.tagsSection.inputEnabled = true;
          break;
        }
      }
    }

    return result;
  });

  await logAction('editability_state_v23', state);
  await captureProofScreenshot('editor-mode-proof');

  console.log(`    isEditable: ${state.isEditable}`);
  console.log(`    editButtons: ${state.editButtons.length}`);
  console.log(`    uploadSection.found: ${state.uploadSection.found}`);
  console.log(`    uploadSection.hasFileInput: ${state.uploadSection.hasFileInput}`);
  console.log(`    tagsSection.inputEnabled: ${state.tagsSection.inputEnabled}`);

  return state;
}

/**
 * v2.3: Find file input in Shadow DOM
 */
async function findFileInputInShadowDOM(): Promise<boolean> {
  if (!page) return false;

  console.log('  [v2.3] Searching Shadow DOM for file inputs...');

  const found = await page.evaluate(() => {
    const searchShadowRoots = (root: Document | ShadowRoot): HTMLInputElement | null => {
      // Check direct children
      const inputs = root.querySelectorAll('input[type="file"]');
      if (inputs.length > 0) return inputs[0] as HTMLInputElement;

      // Check shadow roots
      const allElements = root.querySelectorAll('*');
      for (const el of allElements) {
        if (el.shadowRoot) {
          const result = searchShadowRoots(el.shadowRoot);
          if (result) return result;
        }
      }
      return null;
    };

    const input = searchShadowRoots(document);
    if (input) {
      // Make it visible and accessible
      input.style.display = 'block';
      input.style.visibility = 'visible';
      input.style.opacity = '1';
      input.style.position = 'fixed';
      input.style.top = '50%';
      input.style.left = '50%';
      input.style.zIndex = '999999';
      return true;
    }
    return false;
  });

  if (found) {
    console.log('    [v2.3] ✓ File input found in Shadow DOM!');
    await logAction('shadow_dom_input_found_v23');
  } else {
    console.log('    [v2.3] No file input in Shadow DOM');
  }

  return found;
}

/**
 * v2.3: Simulate dropzone upload using DataTransfer
 */
async function simulateDropzoneUpload(filePaths: string[]): Promise<{ success: boolean; error?: string }> {
  if (!page) return { success: false, error: 'No page available' };

  console.log('  [v2.3] Attempting dropzone simulation...');

  // Find dropzone area
  const dropzoneInfo = await page.evaluate(() => {
    const selectors = [
      '[class*="dropzone"]',
      '[class*="drop-area"]',
      '[class*="drag-drop"]',
      '[class*="upload-area"]',
      '[data-testid*="drop"]',
      '[ondrop]',
      '[ondragover]'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const rect = el.getBoundingClientRect();
        return { found: true, selector: sel, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      }
    }

    // Try finding by text content
    const allDivs = document.querySelectorAll('div, section');
    for (const div of allDivs) {
      const text = div.textContent?.toLowerCase() || '';
      if (text.includes('drag') && text.includes('drop') || text.includes('drop files')) {
        const rect = div.getBoundingClientRect();
        return { found: true, selector: 'text-match', x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      }
    }

    return { found: false, selector: '', x: 0, y: 0 };
  });

  if (!dropzoneInfo.found) {
    console.log('    [v2.3] No dropzone found');
    await logAction('dropzone_not_found_v23');
    return { success: false, error: 'No dropzone element found' };
  }

  console.log(`    [v2.3] Dropzone found: ${dropzoneInfo.selector}`);
  await logAction('dropzone_found_v23', { selector: dropzoneInfo.selector });

  // Read files and create DataTransfer
  const fileBuffers: { name: string; type: string; data: string }[] = [];
  for (const filePath of filePaths) {
    try {
      const absolutePath = path.resolve(filePath);
      const buffer = await fs.readFile(absolutePath);
      const base64 = buffer.toString('base64');
      const fileName = path.basename(absolutePath);
      const mimeType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      fileBuffers.push({ name: fileName, type: mimeType, data: base64 });
    } catch (err) {
      console.log(`    [v2.3] Failed to read file: ${filePath}`);
    }
  }

  if (fileBuffers.length === 0) {
    return { success: false, error: 'No valid files to drop' };
  }

  // Dispatch drop events
  const dropResult = await page.evaluate(async (args: { x: number; y: number; files: typeof fileBuffers }) => {
    const { x, y, files } = args;

    // Find element at coordinates
    const dropTarget = document.elementFromPoint(x, y);
    if (!dropTarget) return { success: false, error: 'No element at drop coordinates' };

    // Create DataTransfer with files
    const dataTransfer = new DataTransfer();

    for (const fileInfo of files) {
      const binaryString = atob(fileInfo.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const file = new File([bytes], fileInfo.name, { type: fileInfo.type });
      dataTransfer.items.add(file);
    }

    // Dispatch events
    const events = ['dragenter', 'dragover', 'drop'];
    for (const eventType of events) {
      const event = new DragEvent(eventType, {
        bubbles: true,
        cancelable: true,
        dataTransfer
      });
      dropTarget.dispatchEvent(event);
      await new Promise(r => setTimeout(r, 100));
    }

    return { success: true };
  }, { x: dropzoneInfo.x, y: dropzoneInfo.y, files: fileBuffers });

  if (dropResult.success) {
    console.log('    [v2.3] ✓ Drop events dispatched!');
    await logAction('dropzone_events_dispatched_v23');
    await new Promise(r => setTimeout(r, 3000));
    await captureProofScreenshot('after-dropzone-v23');
  }

  return dropResult;
}

/**
 * v2.3: Find and use file input in iframes
 */
async function findFileInputInIframes(): Promise<{ frame: any; input: ElementHandle } | null> {
  if (!page) return null;

  console.log('  [v2.3] Searching iframes for file inputs...');

  const frames = page.frames();
  console.log(`    [v2.3] Found ${frames.length} frames`);

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    try {
      const input = await frame.$('input[type="file"]');
      if (input) {
        console.log(`    [v2.3] ✓ File input found in frame ${i}!`);
        await logAction('iframe_input_found_v23', { frameIndex: i });
        return { frame, input };
      }
    } catch (err) {
      // Frame may be detached
      continue;
    }
  }

  console.log('    [v2.3] No file input in iframes');
  return null;
}

/**
 * v2.3: Upload Resolver - tries all methods in sequence
 */
async function uploadResolverV23(filePaths: string[]): Promise<{ uploaded: number; errors: string[]; method?: string }> {
  if (!page) return { uploaded: 0, errors: ['No page available'] };

  const results = { uploaded: 0, errors: [] as string[], method: '' };
  console.log(`\n  [v2.3] Upload Resolver starting with ${filePaths.length} files`);

  // Resolve file paths
  const resolvedPaths: string[] = [];
  for (const filePath of filePaths) {
    const absolutePath = path.resolve(filePath);
    try {
      await fs.access(absolutePath);
      resolvedPaths.push(absolutePath);
    } catch {
      results.errors.push(`File not found: ${absolutePath}`);
    }
  }

  if (resolvedPaths.length === 0) {
    results.errors.push('No valid files to upload');
    return results;
  }

  // Step 1: Verify editability
  const editState = await verifyEditabilityState();
  if (!editState.isEditable) {
    results.errors.push('Page is not in editable mode');
    await logAction('not_editable_v23');
    return results;
  }

  // Navigate to upload section
  await page.evaluate(() => {
    const uploadSection = Array.from(document.querySelectorAll('*')).find(el =>
      el.textContent?.toLowerCase().includes('upload sample') ||
      el.textContent?.toLowerCase().includes('work sample')
    );
    if (uploadSection) {
      uploadSection.scrollIntoView({ block: 'center' });
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  // METHOD 1: File chooser with pre-attached listener
  console.log('\n  [v2.3] METHOD 1: File chooser (pre-attached)');
  await logAction('method1_start_v23');

  // Set up file chooser listener BEFORE any clicks
  let fileChooserResolved = false;
  const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 10000 })
    .then(chooser => {
      fileChooserResolved = true;
      return chooser;
    })
    .catch(() => null);

  // Click all possible upload triggers
  const uploadTriggers = [
    'a:has-text("Upload samples")',
    'button:has-text("Upload")',
    '[aria-label*="upload" i]',
    '[aria-label*="add media" i]',
    'svg[data-supported-dps="24x24"]', // Camera/plus icons
    '[class*="upload"] button',
    '[class*="media"] button'
  ];

  for (const trigger of uploadTriggers) {
    try {
      const el = await page.$(trigger);
      if (el && await el.isVisible()) {
        console.log(`    Clicking: ${trigger}`);
        await el.click({ force: true });
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch {
      continue;
    }
  }

  // Also try text-based clicks
  await clickByText('Upload samples', 'Upload samples');
  await clickByText('Add media', 'Add media');
  await clickByText('Upload', 'Upload');

  // Wait for file chooser
  const fileChooser = await fileChooserPromise;
  if (fileChooser) {
    console.log('    [v2.3] ✓ File chooser intercepted!');
    await fileChooser.setFiles(resolvedPaths);
    await new Promise(r => setTimeout(r, 3000));
    results.uploaded = resolvedPaths.length;
    results.method = 'file_chooser';
    await logAction('method1_success_v23', { files: resolvedPaths.length });
    await captureProofScreenshot('method1-success-v23');
    return results;
  }

  console.log('    [v2.3] File chooser not triggered');
  await captureProofScreenshot('after-method1-v23');

  // METHOD 2: Hidden input discovery
  console.log('\n  [v2.3] METHOD 2: Hidden input discovery');
  await logAction('method2_start_v23');

  // Search DOM for hidden file inputs
  const hiddenInput = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="file"]');
    for (const input of inputs) {
      // Make visible
      (input as HTMLElement).style.cssText = 'display:block!important;visibility:visible!important;opacity:1!important;position:fixed!important;top:50%!important;left:50%!important;z-index:999999!important;';
      return true;
    }
    return false;
  });

  if (hiddenInput) {
    const input = await page.$('input[type="file"]');
    if (input) {
      console.log('    [v2.3] ✓ Hidden input found and exposed!');

      // Check if input accepts multiple files
      const acceptsMultiple = await page.evaluate(() => {
        const inp = document.querySelector('input[type="file"]') as HTMLInputElement;
        return inp?.multiple || false;
      });

      if (acceptsMultiple) {
        // Upload all at once
        await input.setInputFiles(resolvedPaths);
        await new Promise(r => setTimeout(r, 3000));
        results.uploaded = resolvedPaths.length;
      } else {
        // Single file input - upload one at a time
        console.log('    [v2.3] Single-file input detected - uploading sequentially');
        for (let i = 0; i < resolvedPaths.length; i++) {
          const filePath = resolvedPaths[i];
          const fileName = path.basename(filePath);
          console.log(`    [v2.3] Uploading file ${i + 1}/${resolvedPaths.length}: ${fileName}`);

          try {
            await input.setInputFiles(filePath);
            await new Promise(r => setTimeout(r, 3000));
            await captureProofScreenshot(`method2-uploaded-${i + 1}-v23`);
            results.uploaded++;

            // Look for "Add another" or similar button for next file
            if (i < resolvedPaths.length - 1) {
              const addMore = await clickByText('Add another', 'Add another file');
              if (!addMore) {
                await clickByText('Add', 'Add file');
              }
              await new Promise(r => setTimeout(r, 1500));

              // Re-find the input as it may have changed
              const newInput = await page.$('input[type="file"]');
              if (newInput) {
                // Expose it again
                await page.evaluate(() => {
                  const inputs = document.querySelectorAll('input[type="file"]');
                  for (const inp of inputs) {
                    (inp as HTMLElement).style.cssText = 'display:block!important;visibility:visible!important;opacity:1!important;position:fixed!important;top:50%!important;left:50%!important;z-index:999999!important;';
                  }
                });
              }
            }
          } catch (err) {
            console.log(`    [v2.3] Error uploading ${fileName}: ${err}`);
            results.errors.push(`Failed to upload ${fileName}: ${err}`);
          }
        }
      }

      if (results.uploaded > 0) {
        results.method = 'hidden_input';
        await logAction('method2_success_v23', { files: results.uploaded });
        await captureProofScreenshot('method2-success-v23');

        // Complete the wizard/save
        const completeButtons = ['Done', 'Save', 'Finish', 'Complete', 'Post', 'Next'];
        for (const btnText of completeButtons) {
          const btnClicked = await clickByText(btnText, `Complete: ${btnText}`);
          if (btnClicked) {
            await new Promise(r => setTimeout(r, 2000));
            break;
          }
        }

        return results;
      }
    }
  }

  // Check iframes
  const iframeResult = await findFileInputInIframes();
  if (iframeResult) {
    console.log('    [v2.3] Using iframe file input');
    await iframeResult.input.setInputFiles(resolvedPaths);
    await new Promise(r => setTimeout(r, 3000));
    results.uploaded = resolvedPaths.length;
    results.method = 'iframe_input';
    await logAction('method2_iframe_success_v23', { files: resolvedPaths.length });
    await captureProofScreenshot('method2-iframe-success-v23');
    return results;
  }

  console.log('    [v2.3] No hidden input found');

  // METHOD 3: Dropzone simulation
  console.log('\n  [v2.3] METHOD 3: Dropzone simulation');
  await logAction('method3_start_v23');

  const dropResult = await simulateDropzoneUpload(filePaths);
  if (dropResult.success) {
    // Verify files were accepted by checking for thumbnails
    const thumbnailCount = await page.evaluate(() => {
      const thumbnails = document.querySelectorAll('[class*="thumbnail"], [class*="preview"], [class*="uploaded"] img');
      return thumbnails.length;
    });

    if (thumbnailCount > 0) {
      console.log(`    [v2.3] ✓ Dropzone accepted files! ${thumbnailCount} thumbnails visible`);
      results.uploaded = thumbnailCount;
      results.method = 'dropzone';
      await logAction('method3_success_v23', { thumbnails: thumbnailCount });
      return results;
    }
  }

  console.log('    [v2.3] Dropzone simulation did not upload files');

  // METHOD 4: Shadow DOM traversal
  console.log('\n  [v2.3] METHOD 4: Shadow DOM traversal');
  await logAction('method4_start_v23');

  const shadowInputFound = await findFileInputInShadowDOM();
  if (shadowInputFound) {
    const input = await page.$('input[type="file"]');
    if (input) {
      console.log('    [v2.3] ✓ Shadow DOM input exposed!');
      await input.setInputFiles(resolvedPaths);
      await new Promise(r => setTimeout(r, 3000));
      results.uploaded = resolvedPaths.length;
      results.method = 'shadow_dom';
      await logAction('method4_success_v23', { files: resolvedPaths.length });
      await captureProofScreenshot('method4-success-v23');
      return results;
    }
  }

  console.log('    [v2.3] Shadow DOM search did not find input');

  // All methods failed
  results.errors.push('All upload methods failed');
  await logAction('all_methods_failed_v23');
  await captureProofScreenshot('all-methods-failed-v23');

  return results;
}

/**
 * v2.3: Confirm if tags are read-only
 */
async function confirmTagsReadonly(): Promise<boolean> {
  if (!page) return true;

  console.log('  [v2.3] Checking if tags input is readonly...');

  const isReadonly = await page.evaluate(() => {
    const modal = document.querySelector('.artdeco-modal, [role="dialog"]');
    const searchRoot = modal || document;

    const inputs = searchRoot.querySelectorAll('input[type="text"]');
    for (const input of inputs) {
      const htmlInput = input as HTMLInputElement;
      if (!htmlInput.disabled && !htmlInput.readOnly) {
        // Try to determine if it's the tags input
        const placeholder = htmlInput.placeholder?.toLowerCase() || '';
        const label = htmlInput.getAttribute('aria-label')?.toLowerCase() || '';
        if (placeholder.includes('add') || placeholder.includes('service') ||
            label.includes('add') || label.includes('service')) {
          return false; // Found editable tag input
        }
      }
    }
    return true; // All inputs are readonly/disabled
  });

  if (isReadonly) {
    console.log('    [v2.3] TAGS_READONLY_CONFIRMED');
    await logAction('tags_readonly_confirmed_v23');
    await captureProofScreenshot('tags-readonly-proof-v23');
  } else {
    console.log('    [v2.3] Tags input appears editable');
  }

  return isReadonly;
}

// ============================================================================
// SECURITY DETECTION
// ============================================================================

async function detectSecurityPrompt(): Promise<string | null> {
  if (!page) return null;

  for (const { selector, type } of CONFIG.SECURITY_SELECTORS) {
    try {
      const element = await page.$(selector);
      if (element) {
        await logAction('security_prompt_detected', { type });
        return type;
      }
    } catch {
      // Selector not found, continue
    }
  }

  return null;
}

async function handleSecurityPrompt(promptType: string): Promise<OperationResult> {
  await captureProofScreenshot(`security-prompt-${promptType}`);

  console.error(`\n${'='.repeat(60)}`);
  console.error('[OPERATOR HALT] Security prompt detected');
  console.error(`Type: ${promptType}`);
  console.error('Action: Returning control to Operator Control Station (OCS)');
  console.error('Manual intervention required.');
  console.error(`${'='.repeat(60)}\n`);

  return {
    success: false,
    status: 'SECURITY_PROMPT',
    promptType,
    action: 'RETURN_TO_OCS',
    message: `Security prompt detected: ${promptType}. Manual intervention required.`
  };
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

async function establishSession(config: SessionConfig = {}): Promise<OperationResult> {
  if (!checkActionLimit()) {
    return { success: false, status: 'ACTION_LIMIT_EXCEEDED', action: 'RETURN_TO_OCS' };
  }

  await logAction('session_establish_start', { headless: config.headless ?? false });

  try {
    browser = await chromium.launch({
      headless: config.headless ?? false,
      slowMo: CONFIG.SLOW_MO
    });

    const storageStatePath = config.cookiePath || CONFIG.SESSION_FILE;
    let storageState: string | undefined;

    try {
      await fs.access(storageStatePath);
      storageState = storageStatePath;
      await logAction('using_stored_session', { path: storageStatePath });
    } catch {
      await logAction('no_stored_session', { path: storageStatePath });
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
// NAVIGATION
// ============================================================================

async function navigateToServicePage(servicePageUrl: string): Promise<OperationResult> {
  if (!page) {
    return { success: false, status: 'NO_SESSION', error: 'No active session' };
  }

  if (!checkActionLimit()) {
    return { success: false, status: 'ACTION_LIMIT_EXCEEDED', action: 'RETURN_TO_OCS' };
  }

  await logAction('navigation_start', { url: servicePageUrl });
  await randomWait(1000, 2000);

  try {
    await page.goto(servicePageUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await new Promise(r => setTimeout(r, 4000));

    // Dismiss any overlays
    await dismissOverlays();

    // Check for security prompts
    const securityPrompt = await detectSecurityPrompt();
    if (securityPrompt) {
      return handleSecurityPrompt(securityPrompt);
    }

    await captureProofScreenshot('service-page-loaded');
    await logAction('navigation_complete', { url: page.url() });

    return {
      success: true,
      status: 'NAVIGATED',
      message: `Navigated to: ${page.url()}`
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logAction('navigation_error', { error: errorMessage });
    return {
      success: false,
      status: 'ERROR',
      error: errorMessage
    };
  }
}

// ============================================================================
// EDIT PAGE MODAL HANDLING (v2.0)
// ============================================================================

async function openEditPageModal(): Promise<boolean> {
  if (!page) return false;

  console.log('  Opening Edit Page modal...');

  // First scroll to top to ensure button is visible
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1000));

  // Try multiple approaches
  const editSelectors = [
    'button:has-text("Edit page")',
    'a:has-text("Edit page")',
    '[aria-label*="Edit page"]',
    '.edit-page-button'
  ];

  for (const sel of editSelectors) {
    const clicked = await robustClick(sel, 'Edit page button');
    if (clicked) {
      await new Promise(r => setTimeout(r, 2000));
      await captureProofScreenshot('edit-modal-opened');
      return true;
    }
  }

  // Fallback: click by text
  const clicked = await clickByText('Edit page', 'Edit page button fallback');
  if (clicked) {
    await new Promise(r => setTimeout(r, 2000));
    await captureProofScreenshot('edit-modal-opened');
    return true;
  }

  await logAction('edit_modal_open_failed');
  return false;
}

async function closeEditModal(): Promise<void> {
  if (!page) return;

  const closeSelectors = [
    'button[aria-label="Dismiss"]',
    'button[aria-label="Close"]',
    '.artdeco-modal__dismiss',
    'button:has-text("Done")',
    'button:has-text("Cancel")'
  ];

  for (const sel of closeSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn && await btn.isVisible()) {
        await btn.click();
        await new Promise(r => setTimeout(r, 1000));
        return;
      }
    } catch {
      continue;
    }
  }
}

// ============================================================================
// SERVICE PAGE OPERATIONS (v2.0 UPGRADED)
// ============================================================================

async function updateOverview(
  overviewText: string,
  options: UpdateOptions = { dryRun: true }
): Promise<OperationResult> {
  if (!page) {
    return { success: false, status: 'NO_SESSION', error: 'No active session' };
  }

  if (!checkActionLimit()) {
    return { success: false, status: 'ACTION_LIMIT_EXCEEDED', action: 'RETURN_TO_OCS' };
  }

  await logAction('update_overview_start', { dryRun: options.dryRun });
  await captureProofScreenshot('before-overview-edit');

  if (options.dryRun) {
    console.log('\n[DRY RUN] Would update overview');
    return { success: true, status: 'DRY_RUN_COMPLETE', message: 'Dry run complete' };
  }

  try {
    // Open edit modal
    const modalOpened = await openEditPageModal();
    if (!modalOpened) {
      return { success: false, status: 'MODAL_FAILED', error: 'Could not open edit modal' };
    }

    await new Promise(r => setTimeout(r, 2000));
    await captureProofScreenshot('overview-edit-mode');

    // Find and click Overview section in modal
    await clickByText('Overview', 'Overview section');
    await new Promise(r => setTimeout(r, 1500));

    // Find textarea
    const textArea = await page.$('textarea');
    if (textArea) {
      await textArea.click();
      await page.keyboard.press('Control+A');
      await new Promise(r => setTimeout(r, 300));
      await page.keyboard.type(overviewText, { delay: CONFIG.TYPING_DELAY });
      await captureProofScreenshot('after-overview-typed');
    }

    // Save
    await clickByText('Save', 'Save button');
    await new Promise(r => setTimeout(r, 3000));

    await captureProofScreenshot('overview-saved');
    await logAction('update_overview_complete');

    return { success: true, status: 'UPDATED', message: 'Overview updated' };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await captureProofScreenshot('overview-error');
    await logAction('update_overview_error', { error: errorMessage });
    return { success: false, status: 'ERROR', error: errorMessage };
  }
}

async function updateServicesTags(
  config: { toRemove: string[], toKeep: string[], toAdd: string[] },
  options: UpdateOptions = { dryRun: true }
): Promise<OperationResult> {
  if (!page) {
    return { success: false, status: 'NO_SESSION', error: 'No active session' };
  }

  if (!checkActionLimit()) {
    return { success: false, status: 'ACTION_LIMIT_EXCEEDED', action: 'RETURN_TO_OCS' };
  }

  await logAction('update_services_start', { config, dryRun: options.dryRun });
  await captureProofScreenshot('before-services-edit');

  if (options.dryRun) {
    console.log('\n[DRY RUN] Would update service tags');
    return { success: true, status: 'DRY_RUN_COMPLETE', message: 'Dry run complete' };
  }

  try {
    const modalOpened = await openEditPageModal();
    if (!modalOpened) {
      return { success: false, status: 'MODAL_FAILED', error: 'Could not open edit modal' };
    }

    await new Promise(r => setTimeout(r, 2000));

    // Click Services provided section
    await clickByText('Services provided', 'Services section');
    await new Promise(r => setTimeout(r, 2000));
    await captureProofScreenshot('services-edit-mode');

    // Remove tags by clicking X on each
    for (const tagToRemove of config.toRemove) {
      console.log(`  Removing tag: ${tagToRemove}`);

      // Find tag with remove button
      const removed = await page.evaluate((tag) => {
        const tags = document.querySelectorAll('[class*="tag"], [class*="pill"], [class*="chip"], button');
        for (const el of tags) {
          if (el.textContent?.includes(tag)) {
            const removeBtn = el.querySelector('button, [aria-label*="Remove"], svg');
            if (removeBtn) {
              (removeBtn as HTMLElement).click();
              return true;
            }
            // Try clicking the tag itself
            (el as HTMLElement).click();
            return true;
          }
        }
        return false;
      }, tagToRemove);

      if (removed) {
        await logAction('tag_removed', { tag: tagToRemove });
        console.log(`    ✓ Removed: ${tagToRemove}`);
      }
      await new Promise(r => setTimeout(r, 800));
    }

    await captureProofScreenshot('after-tags-removed');

    // v2.1: Add new tags via dropdown with NOT_AVAILABLE handling
    const tagResults: { tag: string; status: 'ADDED' | 'NOT_AVAILABLE' | 'ERROR' }[] = [];

    for (const tagToAdd of config.toAdd) {
      const result = await selectTagFromDropdown(tagToAdd);
      tagResults.push({ tag: tagToAdd, status: result });
      await new Promise(r => setTimeout(r, 800));
    }

    // Log tag results summary
    const added = tagResults.filter(r => r.status === 'ADDED').map(r => r.tag);
    const notAvailable = tagResults.filter(r => r.status === 'NOT_AVAILABLE').map(r => r.tag);

    if (added.length > 0) {
      console.log(`  ✓ Tags added: ${added.join(', ')}`);
    }
    if (notAvailable.length > 0) {
      console.log(`  ⚠ Tags NOT_AVAILABLE: ${notAvailable.join(', ')}`);
      await logAction('tags_not_available', { tags: notAvailable });
    }

    await captureProofScreenshot('after-tags-added');

    // Save
    await clickByText('Save', 'Save tags');
    await new Promise(r => setTimeout(r, 3000));

    await captureProofScreenshot('services-saved');
    await logAction('update_services_complete');

    return { success: true, status: 'UPDATED', message: 'Tags updated' };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await captureProofScreenshot('services-error');
    await logAction('update_services_error', { error: errorMessage });
    return { success: false, status: 'ERROR', error: errorMessage };
  }
}

async function updatePricing(
  pricingInfo: string,
  options: UpdateOptions = { dryRun: true }
): Promise<OperationResult> {
  if (!page) {
    return { success: false, status: 'NO_SESSION', error: 'No active session' };
  }

  if (!checkActionLimit()) {
    return { success: false, status: 'ACTION_LIMIT_EXCEEDED', action: 'RETURN_TO_OCS' };
  }

  await logAction('update_pricing_start_v21', { dryRun: options.dryRun });
  await captureProofScreenshot('before-pricing-edit');

  if (options.dryRun) {
    console.log('\n[DRY RUN] Would update pricing');
    return { success: true, status: 'DRY_RUN_COMPLETE', message: 'Dry run complete' };
  }

  try {
    // v2.1: Neutralize sticky header to prevent click interception
    await neutralizeStickyHeader();

    // Scroll down first
    await page.evaluate(() => window.scrollTo(0, 300));
    await new Promise(r => setTimeout(r, 1000));

    // v2.1: Try section-specific edit first
    let sectionEditClicked = await clickSectionEdit('Pricing');

    if (!sectionEditClicked) {
      // Fallback to modal approach
      const modalOpened = await openEditPageModal();
      if (!modalOpened) {
        await restoreStickyHeader();
        return { success: false, status: 'MODAL_FAILED', error: 'Could not open edit modal' };
      }

      await new Promise(r => setTimeout(r, 2000));

      // Scroll within modal to find Pricing
      await page.evaluate(() => {
        const modal = document.querySelector('.artdeco-modal__content, [role="dialog"]');
        if (modal) modal.scrollTop = modal.scrollHeight / 2;
      });
      await new Promise(r => setTimeout(r, 1000));

      // Click Pricing section in modal
      const pricingClicked = await clickByText('Pricing', 'Pricing section');
      if (!pricingClicked) {
        await page.evaluate(() => {
          const elements = document.querySelectorAll('button, div, span, h3');
          for (const el of elements) {
            if (el.textContent?.includes('Pricing')) {
              (el as HTMLElement).click();
              return;
            }
          }
        });
      }
    }

    await new Promise(r => setTimeout(r, 2000));
    await captureProofScreenshot('pricing-edit-mode');

    // Look for pricing input/textarea
    const pricingInput = await page.$('textarea, input[type="text"]:not([placeholder*="Add"])');
    if (pricingInput) {
      await pricingInput.click();
      await page.keyboard.press('Control+A');
      await new Promise(r => setTimeout(r, 300));
      await page.keyboard.type(pricingInfo, { delay: CONFIG.TYPING_DELAY });
      await captureProofScreenshot('after-pricing-typed');
    } else {
      // Try clicking "Add pricing" or similar
      await clickByText('Add', 'Add pricing');
      await new Promise(r => setTimeout(r, 1000));

      const textarea = await page.$('textarea');
      if (textarea) {
        await textarea.type(pricingInfo, { delay: CONFIG.TYPING_DELAY });
        await captureProofScreenshot('after-pricing-typed');
      }
    }

    // Save
    await clickByText('Save', 'Save pricing');
    await new Promise(r => setTimeout(r, 3000));

    // v2.1: Restore sticky header
    await restoreStickyHeader();

    // Verify pricing was saved by reading back
    await captureProofScreenshot('pricing-saved');

    // Verification: check if pricing text appears on page
    const verifyResult = await page.evaluate((expectedText) => {
      const body = document.body.textContent || '';
      const firstLine = expectedText.split('\n')[0];
      return body.includes(firstLine.substring(0, 20));
    }, pricingInfo);

    if (verifyResult) {
      console.log('  [v2.1] ✓ Pricing verified on page');
      await logAction('pricing_verified');
    }

    await logAction('update_pricing_complete_v21');

    return { success: true, status: 'UPDATED', message: 'Pricing updated (v2.1)' };

  } catch (error) {
    await restoreStickyHeader();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await captureProofScreenshot('pricing-error');
    await logAction('update_pricing_error_v21', { error: errorMessage });
    return { success: false, status: 'ERROR', error: errorMessage };
  }
}

async function uploadWorkSamples(
  filePaths: string[],
  options: UpdateOptions = { dryRun: true }
): Promise<OperationResult> {
  if (!page) {
    return { success: false, status: 'NO_SESSION', error: 'No active session' };
  }

  if (!checkActionLimit()) {
    return { success: false, status: 'ACTION_LIMIT_EXCEEDED', action: 'RETURN_TO_OCS' };
  }

  await logAction('upload_samples_start_v21', { files: filePaths, dryRun: options.dryRun });
  await captureProofScreenshot('before-upload');

  if (options.dryRun) {
    console.log('\n[DRY RUN] Would upload work samples');
    return { success: true, status: 'DRY_RUN_COMPLETE', message: 'Dry run complete' };
  }

  try {
    // v2.1: Neutralize sticky header
    await neutralizeStickyHeader();

    // Scroll to Work Samples section
    await page.evaluate(() => {
      const uploadSection = Array.from(document.querySelectorAll('button, a, section, div')).find(
        el => el.textContent?.includes('Upload samples') ||
              el.textContent?.includes('Add media') ||
              el.textContent?.includes('Work samples') ||
              el.textContent?.includes('Portfolio')
      );
      if (uploadSection) {
        uploadSection.scrollIntoView({ block: 'center' });
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    // v2.1: Use enhanced wizard navigation
    const wizardResult = await navigateUploadWizard(filePaths);

    await restoreStickyHeader();

    if (wizardResult.uploaded > 0) {
      // Verify gallery shows uploaded items
      const galleryCount = await page.evaluate(() => {
        const gallery = document.querySelectorAll('[class*="gallery"] img, [class*="sample"] img, [class*="work"] img, [class*="portfolio"] img');
        return gallery.length;
      });

      console.log(`  [v2.1] Gallery verification: ${galleryCount} items visible`);
      await logAction('gallery_verified', { count: galleryCount });
    }

    await captureProofScreenshot('upload-complete-v21');
    await logAction('upload_samples_complete_v21', {
      uploaded: wizardResult.uploaded,
      errors: wizardResult.errors
    });

    return {
      success: wizardResult.uploaded > 0,
      status: wizardResult.uploaded > 0 ? 'UPLOADED' : 'NO_FILES_UPLOADED',
      message: `Uploaded ${wizardResult.uploaded}/${filePaths.length} files${wizardResult.errors.length > 0 ? ` (${wizardResult.errors.length} errors)` : ''}`
    };

  } catch (error) {
    await restoreStickyHeader();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await captureProofScreenshot('upload-error');
    await logAction('upload_error_v21', { error: errorMessage });
    return { success: false, status: 'ERROR', error: errorMessage };
  }
}

// ============================================================================
// FULL UPDATE & FINISH UPDATE COMMANDS (v2.1)
// ============================================================================

async function executeFullUpdate(
  config: ServicePageUpdateConfig,
  options: UpdateOptions = { dryRun: true }
): Promise<OperationResult> {
  console.log('\n' + '='.repeat(60));
  console.log('FULL SERVICE PAGE UPDATE v2.1');
  console.log('='.repeat(60));
  console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`URL: ${config.servicePageUrl}`);
  console.log('='.repeat(60) + '\n');

  const results: { step: string; result: OperationResult }[] = [];

  // Navigate
  console.log('\n[STEP 1/5] Navigating...');
  const navResult = await navigateToServicePage(config.servicePageUrl);
  results.push({ step: 'navigate', result: navResult });
  if (!navResult.success) {
    return { success: false, status: 'NAVIGATION_FAILED', error: navResult.error };
  }

  // Tags
  console.log('\n[STEP 2/5] Updating tags...');
  const tagsResult = await updateServicesTags({
    toRemove: config.tagsToRemove,
    toKeep: config.tagsToKeep,
    toAdd: config.tagsToAdd
  }, options);
  results.push({ step: 'tags', result: tagsResult });

  if (!options.dryRun) await navigateToServicePage(config.servicePageUrl);

  // Overview
  console.log('\n[STEP 3/5] Updating overview...');
  const overviewResult = await updateOverview(config.overviewText, options);
  results.push({ step: 'overview', result: overviewResult });

  if (!options.dryRun) await navigateToServicePage(config.servicePageUrl);

  // Pricing
  console.log('\n[STEP 4/5] Updating pricing...');
  const pricingResult = await updatePricing(config.pricingText, options);
  results.push({ step: 'pricing', result: pricingResult });

  if (!options.dryRun) await navigateToServicePage(config.servicePageUrl);

  // Upload
  if (config.workSamplePaths.length > 0) {
    console.log('\n[STEP 5/5] Uploading work samples...');
    const uploadResult = await uploadWorkSamples(config.workSamplePaths, options);
    results.push({ step: 'upload', result: uploadResult });
  } else {
    results.push({ step: 'upload', result: { success: true, status: 'SKIPPED' } });
  }

  // Final screenshot
  await navigateToServicePage(config.servicePageUrl);
  await captureProofScreenshot('final-state');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('UPDATE SUMMARY');
  console.log('='.repeat(60));
  for (const r of results) {
    const icon = r.result.success ? '✅' : '❌';
    console.log(`  ${icon} ${r.step}: ${r.result.status}`);
  }
  console.log('='.repeat(60) + '\n');

  await logAction('full_update_complete', {
    mode: options.dryRun ? 'dry_run' : 'live',
    results: results.map(r => ({ step: r.step, status: r.result.status, success: r.result.success }))
  });

  const allSuccess = results.every(r => r.result.success);
  return {
    success: allSuccess,
    status: options.dryRun ? 'DRY_RUN_COMPLETE' : (allSuccess ? 'FULLY_UPDATED' : 'PARTIALLY_UPDATED'),
    message: `Update completed: ${results.filter(r => r.result.success).length}/${results.length} steps succeeded`
  };
}

async function executeFinishUpdate(
  config: ServicePageUpdateConfig,
  options: UpdateOptions = { dryRun: true }
): Promise<OperationResult> {
  console.log('\n' + '='.repeat(60));
  console.log('FINISH UPDATE v2.3 - Upload Resolver');
  console.log('='.repeat(60));
  console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('='.repeat(60) + '\n');

  const results: { step: string; result: OperationResult }[] = [];

  console.log('  [v2.3 Upload Resolver Active]');
  console.log('  - Editability state verification');
  console.log('  - Method 1: File chooser (pre-attached listener)');
  console.log('  - Method 2: Hidden input discovery (DOM + iframes)');
  console.log('  - Method 3: Dropzone simulation (DataTransfer)');
  console.log('  - Method 4: Shadow DOM traversal');
  console.log('  - Tags readonly detection\n');

  // Navigate
  console.log('\n[STEP 1/4] Navigating...');
  const navResult = await navigateToServicePage(config.servicePageUrl);
  results.push({ step: 'navigate', result: navResult });
  if (!navResult.success) {
    return { success: false, status: 'NAVIGATION_FAILED', error: navResult.error };
  }

  // v2.3: Check if tags are readonly first - skip if readonly
  console.log('\n[STEP 2/4] Checking tags editability (v2.3)...');
  let tagsResult: OperationResult;

  // Open edit modal to check tags
  const modalOpened = await openEditPageModal();
  if (modalOpened) {
    await clickByText('Services provided', 'Services section');
    await new Promise(r => setTimeout(r, 1500));
    const tagsReadonly = await confirmTagsReadonly();

    if (tagsReadonly) {
      console.log('  [v2.3] Tags are READONLY - skipping tag addition');
      tagsResult = { success: true, status: 'TAGS_READONLY_SKIPPED', message: 'Tags input is readonly' };
      await closeEditModal();
    } else {
      // Try to add tags
      await closeEditModal();
      tagsResult = await updateServicesTags({
        toRemove: [],
        toKeep: [],
        toAdd: config.tagsToAdd
      }, options);
    }
  } else {
    tagsResult = { success: false, status: 'MODAL_FAILED', error: 'Could not open edit modal' };
  }
  results.push({ step: 'add_tags', result: tagsResult });

  if (!options.dryRun) await navigateToServicePage(config.servicePageUrl);

  // Pricing (verify it's still live)
  console.log('\n[STEP 3/4] Verifying pricing (v2.3)...');
  const pricingResult = await updatePricing(config.pricingText, options);
  results.push({ step: 'pricing', result: pricingResult });

  if (!options.dryRun) await navigateToServicePage(config.servicePageUrl);

  // Upload work samples (v2.3: Upload Resolver)
  if (config.workSamplePaths.length > 0) {
    console.log('\n[STEP 4/4] Uploading work samples (v2.3 Upload Resolver)...');
    const uploadResult = await uploadWorkSamples(config.workSamplePaths, options);
    results.push({ step: 'upload', result: uploadResult });
  } else {
    results.push({ step: 'upload', result: { success: true, status: 'SKIPPED' } });
  }

  // Final screenshot
  await navigateToServicePage(config.servicePageUrl);
  await captureProofScreenshot('finish-update-final-state-v22');

  // v2.2: Verify work samples in gallery
  const galleryCount = await page!.evaluate(() => {
    const gallery = document.querySelectorAll('[class*="gallery"] img, [class*="sample"] img, [class*="work"] img, [class*="portfolio"] img, [class*="media"] img');
    return gallery.length;
  });
  console.log(`\n  [v2.2] Gallery verification: ${galleryCount} items visible`);
  await logAction('gallery_verified_v22', { count: galleryCount });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('FINISH UPDATE SUMMARY v2.3 (Upload Resolver)');
  console.log('='.repeat(60));
  for (const r of results) {
    const icon = r.result.success ? '✅' : '❌';
    console.log(`  ${icon} ${r.step}: ${r.result.status}`);
  }
  console.log(`  📷 Gallery items: ${galleryCount}`);
  console.log('='.repeat(60) + '\n');

  await logAction('finish_update_complete_v23', {
    version: '2.3',
    mode: options.dryRun ? 'dry_run' : 'live',
    galleryItems: galleryCount,
    results: results.map(r => ({ step: r.step, status: r.result.status, success: r.result.success }))
  });

  const allSuccess = results.every(r => r.result.success);
  return {
    success: allSuccess,
    status: options.dryRun ? 'DRY_RUN_COMPLETE' : (allSuccess ? 'FINISH_COMPLETE' : 'PARTIALLY_COMPLETE'),
    message: `Finish update v2.3: ${results.filter(r => r.result.success).length}/${results.length} steps succeeded (gallery: ${galleryCount})`
  };
}

// ============================================================================
// RECEIPT GENERATION
// ============================================================================

async function generateReceipt(): Promise<void> {
  const proofDir = await ensureProofPackDir();
  const logPath = path.join(proofDir, 'action-log.json');
  const receiptPath = path.join(proofDir, 'receipt.json');

  let logs: ActionLog[] = [];
  try {
    const content = await fs.readFile(logPath, 'utf8');
    logs = JSON.parse(content);
  } catch {
    logs = [];
  }

  const receipt = {
    runId,
    version: '2.3',
    startTime: logs[0]?.timestamp || new Date().toISOString(),
    endTime: new Date().toISOString(),
    totalActions: logs.length,
    actionCount,
    actions: logs.map(l => l.action),
    status: 'COMPLETED',
    proofDir: path.resolve(proofDir)
  };

  await fs.writeFile(receiptPath, JSON.stringify(receipt, null, 2));
  console.log(`\nReceipt generated: ${receiptPath}`);
}

// ============================================================================
// CLI
// ============================================================================

async function printUsage(): Promise<void> {
  console.log(`
LinkedIn Operator Agent v2.3 - Upload Resolver

USAGE:
  tsx scripts/linkedin-operator.ts <command> [options]

COMMANDS:
  full-update             Execute full service page update
  finish-update           Complete remaining items (v2.3 Upload Resolver)
  dry-run <url>           Navigate and screenshot only
  update-overview         Update overview section
  update-services         Update service tags
  update-pricing          Update pricing section
  upload <files>          Upload work samples
  status                  Check session status
  help                    Show this help

OPTIONS:
  --live                  Enable live mode (default: dry-run)
  --headless              Run browser headless
  --url <url>             Service page URL

SAFETY:
  - All operations default to DRY RUN mode
  - Must use --live flag for actual edits
  - Stops on 2FA/CAPTCHA prompts
  - Max ${MAX_ACTIONS_PER_SESSION} actions per session

v2.3 UPLOAD RESOLVER:
  - Editability state verification (hard proof screenshots)
  - Method 1: File chooser (pre-attached before trigger click)
  - Method 2: Hidden input discovery (DOM + iframes)
  - Method 3: Dropzone simulation (DataTransfer events)
  - Method 4: Shadow DOM traversal
  - Tags readonly detection (TAGS_READONLY_CONFIRMED)
  `);
}

// ============================================================================
// HARDCODED CONFIG FOR STRATA NOBLE
// ============================================================================

const STRATA_NOBLE_UPDATE_CONFIG: ServicePageUpdateConfig = {
  servicePageUrl: 'https://www.linkedin.com/services/page/6283b234143a289798/',

  tagsToRemove: [
    'Android Development',
    'Application Development',
    'Custom Software Development',
    'SaaS Development'
  ],

  tagsToKeep: [
    'Business Consulting',
    'Project Management',
    'Business Analytics'
  ],

  tagsToAdd: [
    'CRM',
    'Lead Generation'
  ],

  overviewText: `Lead-to-customer pipeline setup for service businesses.

I install simple, trackable systems that turn inquiries into booked appointments and paid jobs:
• Lead capture (forms, calls, SMS, email)
• Auto follow-up + reminders
• Calendar scheduling + routing
• CRM pipeline stages + visibility
• Lightweight reporting so nothing slips

Best fit: solo operators, small teams, agencies, and consultants who need clean execution without hiring a full-time ops team.`,

  pricingText: `Pipeline Audit + Build Plan: $250
Basic Pipeline Install: $750–$1,500
Full System Build + Automation: $2,500–$5,000`,

  workSamplePaths: [
    './proof-packs/work-samples/pipeline-blueprint.png',
    './proof-packs/work-samples/crm-stage-map.png',
    './proof-packs/work-samples/automation-flow.png'
  ]
};

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  runId = generateRunId();
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help') {
    await printUsage();
    process.exit(0);
  }

  const command = args[0];
  const isLive = args.includes('--live');
  const isHeadless = args.includes('--headless');
  const options: UpdateOptions = { dryRun: !isLive };

  console.log(`\n${'='.repeat(60)}`);
  console.log('LinkedIn Operator Agent v2.3 (Upload Resolver)');
  console.log(`Run ID: ${runId}`);
  console.log(`Mode: ${isLive ? '🔴 LIVE' : '🟡 DRY RUN'}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    const sessionResult = await establishSession({ headless: isHeadless });
    if (!sessionResult.success) {
      console.error(`Session failed: ${sessionResult.message || sessionResult.error}`);
      await generateReceipt();
      process.exit(1);
    }

    let result: OperationResult;

    switch (command) {
      case 'full-update':
        result = await executeFullUpdate(STRATA_NOBLE_UPDATE_CONFIG, options);
        break;

      case 'finish-update':
        result = await executeFinishUpdate(STRATA_NOBLE_UPDATE_CONFIG, options);
        break;

      case 'dry-run': {
        const url = args[1] || STRATA_NOBLE_UPDATE_CONFIG.servicePageUrl;
        result = await navigateToServicePage(url);
        break;
      }

      case 'status':
        result = { success: true, status: 'ACTIVE', message: 'Session is active' };
        break;

      case 'update-overview':
        await navigateToServicePage(STRATA_NOBLE_UPDATE_CONFIG.servicePageUrl);
        result = await updateOverview(STRATA_NOBLE_UPDATE_CONFIG.overviewText, options);
        break;

      case 'update-services':
        await navigateToServicePage(STRATA_NOBLE_UPDATE_CONFIG.servicePageUrl);
        result = await updateServicesTags({
          toRemove: STRATA_NOBLE_UPDATE_CONFIG.tagsToRemove,
          toKeep: STRATA_NOBLE_UPDATE_CONFIG.tagsToKeep,
          toAdd: STRATA_NOBLE_UPDATE_CONFIG.tagsToAdd
        }, options);
        break;

      case 'update-pricing':
        await navigateToServicePage(STRATA_NOBLE_UPDATE_CONFIG.servicePageUrl);
        result = await updatePricing(STRATA_NOBLE_UPDATE_CONFIG.pricingText, options);
        break;

      case 'upload': {
        const files = args.filter(a => !a.startsWith('--') && a !== command);
        const filesToUpload = files.length > 0 ? files : STRATA_NOBLE_UPDATE_CONFIG.workSamplePaths;
        await navigateToServicePage(STRATA_NOBLE_UPDATE_CONFIG.servicePageUrl);
        result = await uploadWorkSamples(filesToUpload, options);
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        await printUsage();
        process.exit(1);
    }

    console.log('\nResult:', JSON.stringify(result, null, 2));

    if (result.action === 'RETURN_TO_OCS') {
      console.error('\n[OPERATOR HALT] Returning control to OCS');
    }

  } catch (error) {
    console.error('Unhandled error:', error);
  } finally {
    await generateReceipt();
    await closeSession();
  }
}

main().catch(console.error);

export {
  establishSession,
  navigateToServicePage,
  updateOverview,
  updateServicesTags,
  updatePricing,
  uploadWorkSamples,
  executeFullUpdate,
  executeFinishUpdate,
  closeSession
};
