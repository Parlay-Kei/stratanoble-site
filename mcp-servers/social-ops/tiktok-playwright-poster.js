/**
 * TikTok posting via Playwright persistent Chromium profile.
 * When TIKTOK_USE_PERSISTENT_PROFILE=true, session cookies in env are not required.
 */

import { chromium } from 'playwright';
import fs from 'fs-extra';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPECTED_HANDLE = 'strata.noble';

function extractHandleFromTikTokProfileUrl(urlString) {
  const match = urlString.match(/tiktok\.com\/@([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]).toLowerCase() : '';
}

/**
 * Fallback when URL stays on /@me: infer handle from in-page links or visible @mention text.
 */
async function readLoggedInHandleFromProfileDom(page) {
  return page.evaluate(() => {
    const pathSeg = window.location.pathname.match(/^\/@([^/]+)/);
    if (pathSeg && pathSeg[1].toLowerCase() !== 'me') {
      return pathSeg[1].toLowerCase();
    }
    const anchors = Array.from(document.querySelectorAll('a[href*="tiktok.com/@"]'));
    for (const a of anchors) {
      const href = a.getAttribute('href') || '';
      const m = href.match(/tiktok\.com\/@([^/?#]+)/i);
      if (m && m[1].toLowerCase() !== 'me') {
        return decodeURIComponent(m[1]).toLowerCase();
      }
    }
    const tm = (document.body?.innerText || '').match(/@([a-z0-9._]{2,64})\b/i);
    return tm ? tm[1].toLowerCase() : '';
  });
}

export class TikTokPlaywrightPoster {
  constructor(config) {
    this.config = config;
    this.context = null;
    this.page = null;
  }

  /**
   * Profile directory under social-ops (default .auth/tiktok-profile).
   */
  resolveProfileDir() {
    const raw = this.config.tiktok?.profileDir || '.auth/tiktok-profile';
    return path.isAbsolute(raw) ? raw : path.join(__dirname, raw);
  }

  _getPage() {
    if (!this.page) {
      throw new Error('Playwright page not initialized');
    }
    return this.page;
  }

  /**
   * Launch persistent context. Skips launch when dryRun unless allowWhenDryRun (validation tool).
   */
  async _ensurePersistentContext(options = {}) {
    const allowWhenDryRun = options.allowWhenDryRun === true;
    if (this.config.dryRun && !allowWhenDryRun) {
      return;
    }
    if (this.context) {
      return;
    }

    const userDataDir = this.resolveProfileDir();
    await fs.ensureDir(userDataDir);

    this.context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      viewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });

    const pages = this.context.pages();
    this.page = pages.length > 0 ? pages[0] : await this.context.newPage();
  }

  /**
   * Validate saved profile: logged-in as @strata.noble and upload route reachable.
   * Runs a real browser even when DRY_RUN_MODE=true (explicit validation entrypoint).
   * Never logs cookies or raw session data.
   */
  async validatePersistentProfileAndAccount() {
    await this._ensurePersistentContext({ allowWhenDryRun: true });
    const page = this._getPage();

    await page.goto('https://www.tiktok.com/@me', {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
    await sleep(1500);

    let url = page.url();
    if (url.includes('/login')) {
      await page.goto('https://www.tiktok.com/login', {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      return {
        finalStatus: 'NEEDS_ONE_TIME_LOGIN',
        message:
          'Complete TikTok login in the opened browser window, then run validate_tiktok_persistent_profile again.',
      };
    }

    // TikTok often keeps /@me briefly then redirects to /@handle — wait for canonical profile URL.
    try {
      await page.waitForURL(
        (u) => {
          if (!u.hostname.endsWith('tiktok.com')) return false;
          const seg = u.pathname.match(/^\/@([^/]+)/);
          if (!seg) return false;
          return decodeURIComponent(seg[1]).toLowerCase() !== 'me';
        },
        { timeout: 25000 }
      );
    } catch {
      // Still on /@me or non-standard URL — continue with DOM fallback below.
    }
    await sleep(500);
    url = page.url();

    let handle = extractHandleFromTikTokProfileUrl(url);
    if (handle === 'me' || handle === '') {
      handle = await readLoggedInHandleFromProfileDom(page);
    }

    if (!handle) {
      await page.goto('https://www.tiktok.com/login', {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      return {
        finalStatus: 'NEEDS_ONE_TIME_LOGIN',
        message:
          'Could not confirm a logged-in handle (new profile, challenge page, or session not ready). Log in as @strata.noble in the browser, then run validation again.',
      };
    }

    if (handle !== EXPECTED_HANDLE) {
      return {
        finalStatus: 'WRONG_ACCOUNT',
        message:
          'Persistent profile must be logged in as @strata.noble for Strata Noble automation.',
        observedHandle: `@${handle}`,
      };
    }

    await page.goto('https://www.tiktok.com/upload', {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
    await sleep(1000);

    if (page.url().includes('/login')) {
      await page.goto('https://www.tiktok.com/login', {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      return {
        finalStatus: 'NEEDS_ONE_TIME_LOGIN',
        message:
          'Upload flow requires login. Complete TikTok login in the browser, then re-run validation.',
      };
    }

    return {
      finalStatus: 'READY_FOR_DRAFT_TEST',
      message:
        'Session matches @strata.noble and can reach the TikTok upload flow. Proceed with draft-mode tests when ready.',
    };
  }

  async validateVideo(videoPath) {
    if (!(await fs.pathExists(videoPath))) {
      return { valid: false, error: 'Video file not found' };
    }

    const stats = await fs.stat(videoPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    const maxSizeMB = 287;
    const supportedFormats = ['.mp4', '.mov', '.mpeg', '.3gp', '.avi'];
    const ext = path.extname(videoPath).toLowerCase();

    if (!supportedFormats.includes(ext)) {
      return {
        valid: false,
        error: `Unsupported format: ${ext}. Supported: ${supportedFormats.join(', ')}`,
      };
    }

    if (fileSizeMB > maxSizeMB) {
      return {
        valid: false,
        error: `File too large: ${fileSizeMB.toFixed(2)}MB. Maximum: ${maxSizeMB}MB`,
      };
    }

    const buffer = await fs.readFile(videoPath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      valid: true,
      fileSizeMB: fileSizeMB.toFixed(2),
      format: ext,
      hash,
    };
  }

  formatCaption(caption, options = {}) {
    let formatted = caption;

    if (options.hashtags && Array.isArray(options.hashtags)) {
      const hashtagStr = options.hashtags
        .map((tag) => {
          const cleaned = tag.replace(/[^a-zA-Z0-9]/g, '');
          return `#${cleaned}`;
        })
        .join(' ');
      formatted = `${formatted}\n\n${hashtagStr}`;
    }

    if (options.mentions && Array.isArray(options.mentions)) {
      options.mentions.forEach((mention) => {
        formatted = formatted.replace(new RegExp(`@${mention}`, 'g'), `@${mention}`);
      });
    }

    if (formatted.length > 2200) {
      formatted = formatted.substring(0, 2197) + '...';
    }

    return formatted;
  }

  async upload(videoPath, caption, options = {}) {
    if (!this.config.tiktok.enabled) {
      return { success: false, error: 'TikTok posting disabled' };
    }

    const validation = await this.validateVideo(videoPath);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (this.config.dryRun) {
      return {
        success: true,
        dryRun: true,
        executionMode: 'dry_run',
        preview: {
          videoPath,
          videoHash: validation.hash,
          fileSizeMB: validation.fileSizeMB,
          format: validation.format,
          caption: this.formatCaption(caption, options),
          privacy: options.privacy || 'public',
          allowComments: options.allowComments !== false,
          allowDuet: options.allowDuet !== false,
          allowStitch: options.allowStitch !== false,
          persistentProfile: true,
        },
      };
    }

    try {
      await this._ensurePersistentContext();
      const page = this._getPage();

      await page.goto('https://www.tiktok.com/upload', {
        waitUntil: 'load',
        timeout: 120000,
      });

      await page.locator('input[type="file"]').first().waitFor({
        state: 'attached',
        timeout: 10000,
      });
      await page.locator('input[type="file"]').first().setInputFiles(videoPath);

      await page
        .locator('[class*="upload-progress"], [class*="uploading"]')
        .first()
        .waitFor({ state: 'visible', timeout: 30000 })
        .catch(() => {});

      await page.waitForFunction(
        () => {
          const progress = document.querySelector('[class*="progress"]');
          return !progress || (progress.textContent && progress.textContent.includes('100'));
        },
        { timeout: 300000 }
      );

      const formattedCaption = this.formatCaption(caption, options);
      await page
        .locator('[class*="caption"] textarea, .caption-input')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 });
      const captionBox = page.locator('[class*="caption"] textarea, .caption-input').first();
      await captionBox.click({ clickCount: 3 });
      await captionBox.fill(formattedCaption);

      const mode = options.executionMode || 'publish';

      if (mode === 'draft') {
        const ok = await this.clickFirstButtonMatchingLabels([
          'Draft',
          'Save draft',
          'Save to drafts',
        ]);
        if (!ok) {
          return {
            success: false,
            error:
              'Draft control not found in TikTok upload UI. Inspect DOM and update selector list after QA.',
            executionMode: 'draft',
            videoHash: validation.hash,
          };
        }
        return {
          success: true,
          executionMode: 'draft',
          videoHash: validation.hash,
          timestamp: new Date().toISOString(),
          message:
            'Draft action triggered; verify draft in TikTok before relying on automation',
        };
      }

      if (mode === 'schedule') {
        return {
          success: false,
          error:
            'schedule mode requires TikTok scheduling UI selectors and optional scheduleAt handling. Not enabled for unattended runs.',
          executionMode: 'schedule',
          videoHash: validation.hash,
        };
      }

      if (mode !== 'publish') {
        return {
          success: false,
          error: `Unknown executionMode "${mode}". Use draft, schedule, or publish.`,
          videoHash: validation.hash,
        };
      }

      await this.setPrivacySettings(options);
      await this.setInteractionSettings(options);

      if (options.coverTime) {
        await this.selectCoverImage(options.coverTime);
      }

      if (!options.skipConfirmation) {
        await this.waitForUserConfirmation();
      }

      const posted = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('button[class*="post"], button'));
        const postBtn = nodes.find(
          (n) =>
            n.textContent &&
            /^\s*post\s*$/i.test(n.textContent.trim()) &&
            !n.disabled
        );
        if (postBtn) {
          postBtn.click();
          return true;
        }
        const fallback = nodes.find(
          (n) =>
            n.textContent &&
            /post/i.test(n.textContent.trim()) &&
            !n.disabled &&
            (n.className.includes('post') || n.getAttribute('class')?.includes('post'))
        );
        if (fallback) {
          fallback.click();
          return true;
        }
        return false;
      });
      if (!posted) {
        return {
          success: false,
          error: 'Could not find Post button in TikTok upload UI.',
          videoHash: validation.hash,
        };
      }

      await page.waitForFunction(
        () =>
          window.location.href.includes('/foryou') || window.location.href.includes('/@'),
        { timeout: 60000 }
      );

      const postUrl = await this.getLatestPostUrl();

      return {
        success: true,
        postUrl,
        videoHash: validation.hash,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async setPrivacySettings(options) {
    const page = this._getPage();
    const privacy = options.privacy || 'public';

    await page
      .locator('[class*="privacy"], [aria-label*="Who can view"]')
      .first()
      .waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('[class*="privacy"], [aria-label*="Who can view"]').first().click();

    const privacyMap = {
      public: 'Everyone',
      friends: 'Friends',
      private: 'Only me',
    };
    const privacyText = privacyMap[privacy] || 'Everyone';
    await page.getByText(privacyText, { exact: false }).first().click();
  }

  async setInteractionSettings(options) {
    const page = this._getPage();

    if (options.allowComments === false) {
      const commentsToggle = page.locator('[aria-label*="Allow comments"]').first();
      if ((await commentsToggle.count()) > 0) {
        await commentsToggle.click();
      }
    }

    if (options.allowDuet === false) {
      const duetToggle = page.locator('[aria-label*="Allow Duet"]').first();
      if ((await duetToggle.count()) > 0) {
        await duetToggle.click();
      }
    }

    if (options.allowStitch === false) {
      const stitchToggle = page.locator('[aria-label*="Allow Stitch"]').first();
      if ((await stitchToggle.count()) > 0) {
        await stitchToggle.click();
      }
    }
  }

  async selectCoverImage(coverTime) {
    const page = this._getPage();
    const editCoverButton = page.locator('[class*="cover"], [aria-label*="Edit cover"]').first();
    if ((await editCoverButton.count()) === 0) return;

    await editCoverButton.click();
    await page
      .locator('[class*="timeline"], [class*="slider"]')
      .first()
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});
    await sleep(1000);

    const confirmButton = page.locator('button').filter({ hasText: /Confirm|Save/i }).first();
    if ((await confirmButton.count()) > 0) {
      await confirmButton.click();
    }
  }

  async clickFirstButtonMatchingLabels(labels) {
    const page = this._getPage();
    return page.evaluate((texts) => {
      const nodes = Array.from(
        document.querySelectorAll('button, [role="button"], a[role="button"]')
      );
      for (const label of texts) {
        const lower = label.toLowerCase();
        const found = nodes.find(
          (n) =>
            n.textContent &&
            n.textContent.trim().toLowerCase().includes(lower) &&
            !n.disabled
        );
        if (found) {
          found.click();
          return true;
        }
      }
      return false;
    }, labels);
  }

  async waitForUserConfirmation() {
    console.log('Please review the video upload and press Enter to continue...');
    await new Promise((resolve) => {
      process.stdin.once('data', resolve);
    });
  }

  async getLatestPostUrl() {
    const page = this._getPage();
    await page.goto('https://www.tiktok.com/@me', {
      waitUntil: 'load',
      timeout: 60000,
    });

    return page.evaluate(() => {
      const firstVideo = document.querySelector('a[href*="/video/"]');
      return firstVideo ? firstVideo.href : null;
    });
  }

  async close() {
    if (this.context) {
      await this.context.close();
      this.context = null;
      this.page = null;
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
