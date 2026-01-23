---
name: linkedin-operator-ops
description: LinkedIn RPA automation skill for managing LinkedIn Service Page updates and inbound service requests via Playwright browser automation. Supports dry-run mode for safe testing.
version: 1.0.0
level: 2
triggers:
  - linkedin service page
  - linkedin update
  - linkedin operator
  - service page edit
  - linkedin automation
  - linkedin rpa
---

# linkedin-operator-ops Skill

Internal ANX agent for managing LinkedIn Service Page updates and handling inbound service requests using Playwright browser automation.

## Quick Commands

| Command | Action |
|---------|--------|
| `login` | Establish LinkedIn session (cookie-based) |
| `navigate` | Navigate to LinkedIn Service Page admin view |
| `update-overview` | Edit Service Page Overview section |
| `update-services` | Edit Services Provided tags |
| `update-pricing` | Edit Pricing information |
| `upload-samples` | Upload work samples (images/PDFs) |
| `post` | Publish a text post to LinkedIn profile |
| `screenshot` | Capture proof screenshot |
| `dry-run` | Navigate + screenshot without edits |
| `status` | Check current session status |

---

## Safety Requirements

### CRITICAL: Safe Operation Mode

1. **Dry Run Mode (Default)**
   - All operations default to `dryRun: true`
   - Only navigates and captures screenshots
   - No actual edits are performed
   - Must explicitly set `dryRun: false` to enable edits

2. **Security Prompt Detection**
   - Automatically stops on 2FA prompts
   - Automatically stops on CAPTCHA challenges
   - Returns to OCS (Operator Control Station) with status
   - Never attempts to bypass security measures

3. **Rate Limiting & Pacing**
   - Minimum 2-5 second randomized waits between actions
   - Single task per run (no batch operations)
   - Maximum 10 actions per session
   - Automatic session cooldown after operations

4. **Action Logging**
   - Every action logged with timestamp
   - Screenshots captured at each step
   - Full audit trail maintained
   - Logs stored in proof pack folder

---

## Level 1: Basic Operations

### establishSession()
```typescript
/**
 * Establish LinkedIn session using stored cookies or credential vault
 * NEVER stores passwords - uses secure session tokens only
 */
async function establishSession(config: LinkedInSessionConfig): Promise<SessionResult> {
  const browser = await playwright.chromium.launch({
    headless: config.headless ?? true,
    slowMo: 500 // Safety: slow down all operations
  });

  const context = await browser.newContext({
    storageState: config.cookiePath || './linkedin-session.json',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Navigate to LinkedIn
  await page.goto('https://www.linkedin.com/feed/', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Check for security prompts
  const securityPrompt = await detectSecurityPrompt(page);
  if (securityPrompt) {
    await captureProofScreenshot(page, 'security-prompt-detected');
    return {
      success: false,
      status: 'SECURITY_PROMPT',
      promptType: securityPrompt,
      action: 'RETURN_TO_OCS',
      message: `Security prompt detected: ${securityPrompt}. Manual intervention required.`
    };
  }

  // Verify logged in
  const isLoggedIn = await page.$('div[data-test-id="nav-settings-menu"]');
  if (!isLoggedIn) {
    return {
      success: false,
      status: 'NOT_LOGGED_IN',
      action: 'RETURN_TO_OCS',
      message: 'Session expired or invalid. Please re-authenticate manually.'
    };
  }

  await logAction('session_established', { timestamp: Date.now() });

  return {
    success: true,
    status: 'ACTIVE',
    browser,
    context,
    page
  };
}
```

### detectSecurityPrompt()
```typescript
/**
 * Detect 2FA, CAPTCHA, or other security challenges
 */
async function detectSecurityPrompt(page: Page): Promise<string | null> {
  const securitySelectors = [
    { selector: 'input[name="pin"]', type: '2FA_PIN' },
    { selector: '#captcha-challenge', type: 'CAPTCHA' },
    { selector: '[data-test-id="checkpoint-challenge"]', type: 'CHECKPOINT' },
    { selector: 'form[action*="challenge"]', type: 'SECURITY_CHALLENGE' },
    { selector: 'input[name="verification_code"]', type: 'VERIFICATION_CODE' },
    { selector: '.recaptcha-checkbox', type: 'RECAPTCHA' }
  ];

  for (const { selector, type } of securitySelectors) {
    const element = await page.$(selector);
    if (element) {
      await logAction('security_prompt_detected', { type, timestamp: Date.now() });
      return type;
    }
  }

  return null;
}
```

### navigateToServicePage()
```typescript
/**
 * Navigate to LinkedIn Service Page admin view
 */
async function navigateToServicePage(
  page: Page,
  servicePageUrl: string
): Promise<NavigationResult> {
  await randomWait(2000, 5000); // Safety pacing

  await page.goto(servicePageUrl, {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Check for security prompts after navigation
  const securityPrompt = await detectSecurityPrompt(page);
  if (securityPrompt) {
    return {
      success: false,
      status: 'SECURITY_PROMPT',
      promptType: securityPrompt
    };
  }

  await captureProofScreenshot(page, 'service-page-loaded');
  await logAction('navigated_to_service_page', { url: servicePageUrl, timestamp: Date.now() });

  return {
    success: true,
    status: 'READY',
    currentUrl: page.url()
  };
}
```

---

## Level 2: Post Publishing Operations

### publishPost()
```typescript
/**
 * Publish a text post to LinkedIn profile
 * Uses linkedin-post-publisher.js module
 *
 * SAFETY: Dry-run mode by default. Must use --live flag to publish.
 */

// Import and use the publisher
import { LinkedInPostPublisher } from './linkedin-post-publisher.js';

async function publishPost(
  content: string,
  options: PostOptions = { dryRun: true }
): Promise<PostResult> {
  const publisher = new LinkedInPostPublisher({
    dryRun: options.dryRun ?? true,  // SAFE by default
    headless: options.headless ?? false
  });

  try {
    await publisher.initialize();

    const result = await publisher.publishPost(content, {
      hashtags: options.hashtags || ''
    });

    return result;
  } finally {
    await publisher.close();
  }
}

interface PostOptions {
  dryRun?: boolean;      // Default: true (safe mode)
  headless?: boolean;    // Default: false (visible browser)
  hashtags?: string;     // Optional hashtags to append
}

interface PostResult {
  success: boolean;
  status: 'PUBLISHED' | 'DRY_RUN_COMPLETE' | 'ERROR' | 'SECURITY_PROMPT' | 'NOT_LOGGED_IN';
  message: string;
  postUrl?: string;          // URL of published post (live mode only)
  receipt?: string;          // Path to receipt file
  proofDir?: string;         // Path to proof pack directory
  error?: string;            // Error message if failed
  action?: 'RETURN_TO_OCS';  // Action to take on failure
}
```

### Post Flow Steps
1. Initialize browser with persistent LinkedIn session
2. Navigate to LinkedIn feed
3. Verify session is active (check for security prompts)
4. Click "Start a post" button
5. Enter content in composer
6. Capture pre-publish screenshot (proof)
7. **DRY-RUN**: Close modal without publishing, generate receipt
8. **LIVE**: Click Post button, verify on profile, capture proof

### Proof Pack Structure for Posts
```
proof-packs/
└── linkedin-posts/
    └── YYYY-MM-DD/
        └── run-YYYY-MM-DDTHH-MM-SS-SSSZ/
            ├── screenshots/
            │   ├── session-verified.png
            │   ├── composer-opened.png
            │   ├── content-entered.png
            │   ├── pre-publish-composer.png
            │   └── post-published-on-profile.png (live only)
            ├── action-log.json
            ├── receipt.json
            └── LINKEDIN_POST_RECEIPT_YYYY-MM-DD.md
```

---

## Level 2: Service Page Operations

### updateOverview()
```typescript
/**
 * Update Service Page Overview section
 */
async function updateOverview(
  page: Page,
  overviewText: string,
  options: UpdateOptions = { dryRun: true }
): Promise<UpdateResult> {
  await logAction('update_overview_start', { dryRun: options.dryRun, timestamp: Date.now() });

  // Navigate to edit mode
  const editButton = await page.$('[data-test-id="edit-overview-button"]');
  if (!editButton) {
    return {
      success: false,
      error: 'Edit button not found',
      action: 'RETURN_TO_OCS'
    };
  }

  await captureProofScreenshot(page, 'before-overview-edit');

  if (options.dryRun) {
    await logAction('dry_run_overview', {
      wouldUpdate: overviewText.substring(0, 100),
      timestamp: Date.now()
    });
    return {
      success: true,
      status: 'DRY_RUN_COMPLETE',
      message: 'Dry run: Would update overview. No changes made.',
      screenshot: 'before-overview-edit.png'
    };
  }

  // Actual edit flow
  await randomWait(1000, 2000);
  await editButton.click();
  await randomWait(1500, 3000);

  const textArea = await page.$('textarea[name="overview"]');
  if (!textArea) {
    return {
      success: false,
      error: 'Overview textarea not found',
      action: 'RETURN_TO_OCS'
    };
  }

  await textArea.fill('');
  await randomWait(500, 1000);
  await textArea.type(overviewText, { delay: 50 }); // Human-like typing speed

  await captureProofScreenshot(page, 'after-overview-typed');

  // Save changes
  const saveButton = await page.$('[data-test-id="save-button"]');
  if (saveButton) {
    await randomWait(1000, 2000);
    await saveButton.click();
    await page.waitForLoadState('networkidle');
  }

  await captureProofScreenshot(page, 'overview-saved');
  await logAction('update_overview_complete', { timestamp: Date.now() });

  return {
    success: true,
    status: 'UPDATED',
    screenshots: ['before-overview-edit.png', 'after-overview-typed.png', 'overview-saved.png']
  };
}
```

### updateServicesTags()
```typescript
/**
 * Update Services Provided tags
 */
async function updateServicesTags(
  page: Page,
  tags: string[],
  options: UpdateOptions = { dryRun: true }
): Promise<UpdateResult> {
  await logAction('update_services_start', { tags, dryRun: options.dryRun, timestamp: Date.now() });

  await captureProofScreenshot(page, 'before-services-edit');

  if (options.dryRun) {
    await logAction('dry_run_services', {
      wouldAddTags: tags,
      timestamp: Date.now()
    });
    return {
      success: true,
      status: 'DRY_RUN_COMPLETE',
      message: `Dry run: Would update services to: ${tags.join(', ')}`,
      screenshot: 'before-services-edit.png'
    };
  }

  // Navigate to services edit
  const editButton = await page.$('[data-test-id="edit-services-button"]');
  if (!editButton) {
    return { success: false, error: 'Services edit button not found' };
  }

  await randomWait(1500, 3000);
  await editButton.click();
  await randomWait(2000, 4000);

  // Add each tag
  for (const tag of tags) {
    const tagInput = await page.$('input[placeholder*="service"]');
    if (tagInput) {
      await tagInput.type(tag, { delay: 75 });
      await randomWait(800, 1500);
      await page.keyboard.press('Enter');
      await randomWait(1000, 2000);
    }
  }

  await captureProofScreenshot(page, 'services-tags-added');

  // Save
  const saveButton = await page.$('[data-test-id="save-button"]');
  if (saveButton) {
    await randomWait(1500, 2500);
    await saveButton.click();
    await page.waitForLoadState('networkidle');
  }

  await captureProofScreenshot(page, 'services-saved');
  await logAction('update_services_complete', { timestamp: Date.now() });

  return {
    success: true,
    status: 'UPDATED',
    addedTags: tags
  };
}
```

### uploadWorkSamples()
```typescript
/**
 * Upload work samples (images/PDFs) to Service Page
 */
async function uploadWorkSamples(
  page: Page,
  filePaths: string[],
  options: UpdateOptions = { dryRun: true }
): Promise<UpdateResult> {
  await logAction('upload_samples_start', {
    files: filePaths,
    dryRun: options.dryRun,
    timestamp: Date.now()
  });

  await captureProofScreenshot(page, 'before-upload');

  if (options.dryRun) {
    return {
      success: true,
      status: 'DRY_RUN_COMPLETE',
      message: `Dry run: Would upload ${filePaths.length} file(s)`,
      files: filePaths.map(f => path.basename(f))
    };
  }

  // Navigate to work samples section
  const uploadButton = await page.$('[data-test-id="add-work-sample"]');
  if (!uploadButton) {
    return { success: false, error: 'Upload button not found' };
  }

  await randomWait(2000, 4000);
  await uploadButton.click();
  await randomWait(1500, 3000);

  // Handle file input
  const fileInput = await page.$('input[type="file"]');
  if (!fileInput) {
    return { success: false, error: 'File input not found' };
  }

  for (const filePath of filePaths) {
    await fileInput.setInputFiles(filePath);
    await randomWait(3000, 6000); // Wait for upload
    await captureProofScreenshot(page, `uploaded-${path.basename(filePath)}`);
  }

  // Confirm upload
  const confirmButton = await page.$('[data-test-id="confirm-upload"]');
  if (confirmButton) {
    await randomWait(1500, 2500);
    await confirmButton.click();
    await page.waitForLoadState('networkidle');
  }

  await captureProofScreenshot(page, 'upload-complete');
  await logAction('upload_samples_complete', { uploaded: filePaths.length, timestamp: Date.now() });

  return {
    success: true,
    status: 'UPLOADED',
    uploadedFiles: filePaths.length
  };
}
```

---

## Utility Functions

### randomWait()
```typescript
/**
 * Random wait for human-like behavior
 */
async function randomWait(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
}
```

### captureProofScreenshot()
```typescript
/**
 * Capture proof screenshot with timestamp
 */
async function captureProofScreenshot(page: Page, name: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}_${name}.png`;
  const proofPath = `./proof-packs/${getRunId()}/${filename}`;

  await fs.mkdir(path.dirname(proofPath), { recursive: true });
  await page.screenshot({ path: proofPath, fullPage: true });

  await logAction('screenshot_captured', { filename, timestamp: Date.now() });

  return proofPath;
}
```

### logAction()
```typescript
/**
 * Log action with timestamp for audit trail
 */
async function logAction(action: string, data: Record<string, any>): Promise<void> {
  const logEntry = {
    action,
    ...data,
    timestamp: new Date().toISOString()
  };

  const logPath = `./proof-packs/${getRunId()}/action-log.json`;

  let logs = [];
  try {
    const existing = await fs.readFile(logPath, 'utf8');
    logs = JSON.parse(existing);
  } catch {
    // File doesn't exist yet
  }

  logs.push(logEntry);
  await fs.writeFile(logPath, JSON.stringify(logs, null, 2));

  console.log(`[${logEntry.timestamp}] ${action}`, JSON.stringify(data));
}
```

---

## Dry Run Mode

**Default Behavior**: All operations run in dry-run mode unless explicitly disabled.

```typescript
// Dry run (default) - only navigates and screenshots
await updateOverview(page, 'New overview text');
// Output: "Dry run: Would update overview. No changes made."

// Actual edit - requires explicit flag
await updateOverview(page, 'New overview text', { dryRun: false });
// Output: "Overview updated successfully."
```

---

## Proof Pack Structure

```
./proof-packs/
└── run-2026-01-19T10-30-00/
    ├── action-log.json           # Full audit trail
    ├── 2026-01-19T10-30-01_session-established.png
    ├── 2026-01-19T10-30-05_service-page-loaded.png
    ├── 2026-01-19T10-30-10_before-overview-edit.png
    ├── 2026-01-19T10-30-15_after-overview-typed.png
    ├── 2026-01-19T10-30-20_overview-saved.png
    └── receipt.json              # Operation summary
```

---

## Error Handling & Recovery

```typescript
interface OperatorError {
  code: 'SECURITY_PROMPT' | 'SESSION_EXPIRED' | 'ELEMENT_NOT_FOUND' | 'TIMEOUT' | 'NETWORK_ERROR';
  message: string;
  action: 'RETURN_TO_OCS' | 'RETRY' | 'ABORT';
  screenshot?: string;
  timestamp: string;
}

async function handleError(error: OperatorError): Promise<void> {
  await logAction('error_occurred', error);

  if (error.action === 'RETURN_TO_OCS') {
    console.error(`[OPERATOR HALT] ${error.code}: ${error.message}`);
    console.error('Returning control to Operator Control Station');
    // Graceful shutdown
    await browser?.close();
    process.exit(1);
  }
}
```

---

## Integration Commands

```bash
# Dry run navigation (safe mode)
linkedin-operator dry-run --url "https://linkedin.com/services/your-page"

# Check session status
linkedin-operator status

# Update overview (dry run)
linkedin-operator update-overview --text "New overview" --dry-run

# Update overview (live)
linkedin-operator update-overview --text "New overview" --live

# Upload work samples (dry run)
linkedin-operator upload --files "sample1.pdf,sample2.jpg" --dry-run

# Full proof pack review
linkedin-operator proof-pack --run-id "2026-01-19T10-30-00"

# Post to LinkedIn (dry run - default, safe mode)
node .claude/tools/browser-operator/linkedin-post-publisher.js post --content "Your post content here"

# Post to LinkedIn (live - actually publishes)
node .claude/tools/browser-operator/linkedin-post-publisher.js post --content "Your post content" --live

# Post from file with hashtags
node .claude/tools/browser-operator/linkedin-post-publisher.js post --file content.txt --hashtags "#sales #crm" --live
```

---

## Agent Coordination

| Agent | Coordination Purpose |
|-------|---------------------|
| `security-ops` | Session security, credential vault access |
| `file-monitor-ops` | Watch for proof pack uploads |
| `docs-admin-ops` | Document operation receipts |

---

## Success Criteria

- Zero security bypasses attempted
- 100% action logging coverage
- Proof screenshots for every edit
- Dry-run mode works correctly
- Session management secure
- Rate limiting enforced
- Clean error handling with OCS return

**Safe automation. Full audit trail. Human oversight preserved.**
