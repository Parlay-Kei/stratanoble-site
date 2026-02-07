/**
 * TikTok Posting Module
 * Handles browser-based TikTok video uploads with safety controls
 */

import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import crypto from 'crypto';
import path from 'path';

export class TikTokPoster {
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize browser with TikTok session
   */
  async initialize() {
    if (this.config.dryRun) {
      return { success: true, message: 'DRY RUN: Browser initialization skipped' };
    }

    try {
      this.browser = await puppeteer.launch({
        headless: false, // Show browser for user verification
        defaultViewport: null,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ],
      });

      this.page = await this.browser.newPage();

      // Set user agent to avoid detection
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Set cookies if provided
      if (this.config.sessionCookies) {
        const cookies = JSON.parse(this.config.sessionCookies);
        await this.page.setCookie(...cookies);
      }

      // Navigate to TikTok
      await this.page.goto('https://www.tiktok.com/upload', {
        waitUntil: 'networkidle2',
      });

      // Check if logged in
      const isLoggedIn = await this.page.evaluate(() => {
        return !window.location.href.includes('/login');
      });

      if (!isLoggedIn) {
        throw new Error('Not logged into TikTok. Please provide valid session cookies.');
      }

      return { success: true, message: 'TikTok session initialized' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate video file
   */
  async validateVideo(videoPath) {
    if (!await fs.pathExists(videoPath)) {
      return { valid: false, error: 'Video file not found' };
    }

    const stats = await fs.stat(videoPath);
    const fileSizeMB = stats.size / (1024 * 1024);

    // TikTok limits
    const maxSizeMB = 287; // 287 MB limit
    const supportedFormats = ['.mp4', '.mov', '.mpeg', '.3gp', '.avi'];

    const ext = path.extname(videoPath).toLowerCase();

    if (!supportedFormats.includes(ext)) {
      return {
        valid: false,
        error: `Unsupported format: ${ext}. Supported: ${supportedFormats.join(', ')}`
      };
    }

    if (fileSizeMB > maxSizeMB) {
      return {
        valid: false,
        error: `File too large: ${fileSizeMB.toFixed(2)}MB. Maximum: ${maxSizeMB}MB`
      };
    }

    // Calculate video hash for verification
    const buffer = await fs.readFile(videoPath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      valid: true,
      fileSizeMB: fileSizeMB.toFixed(2),
      format: ext,
      hash,
    };
  }

  /**
   * Format caption with hashtags and mentions
   */
  formatCaption(caption, options = {}) {
    let formatted = caption;

    // Add hashtags
    if (options.hashtags && Array.isArray(options.hashtags)) {
      const hashtagStr = options.hashtags.map(tag => {
        // Remove spaces and special characters from hashtags
        const cleaned = tag.replace(/[^a-zA-Z0-9]/g, '');
        return `#${cleaned}`;
      }).join(' ');

      formatted = `${formatted}\n\n${hashtagStr}`;
    }

    // Add mentions
    if (options.mentions && Array.isArray(options.mentions)) {
      options.mentions.forEach(mention => {
        formatted = formatted.replace(
          new RegExp(`@${mention}`, 'g'),
          `@${mention}`
        );
      });
    }

    // TikTok caption limit is 2200 characters
    if (formatted.length > 2200) {
      formatted = formatted.substring(0, 2197) + '...';
    }

    return formatted;
  }

  /**
   * Upload video to TikTok with approval gate
   */
  async upload(videoPath, caption, options = {}) {
    if (!this.config.tiktok.enabled) {
      return { success: false, error: 'TikTok posting disabled' };
    }

    // Validate video first
    const validation = await this.validateVideo(videoPath);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (this.config.dryRun) {
      return {
        success: true,
        dryRun: true,
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
        },
      };
    }

    try {
      if (!this.page) {
        await this.initialize();
      }

      // Navigate to upload page
      await this.page.goto('https://www.tiktok.com/upload', {
        waitUntil: 'networkidle2',
      });

      // Wait for upload input
      await this.page.waitForSelector('input[type="file"]', {
        visible: false, // Input might be hidden
        timeout: 10000,
      });

      // Upload video file
      const inputFile = await this.page.$('input[type="file"]');
      await inputFile.uploadFile(videoPath);

      // Wait for upload to process
      await this.page.waitForSelector('[class*="upload-progress"], [class*="uploading"]', {
        visible: true,
        timeout: 30000,
      });

      // Wait for upload to complete
      await this.page.waitForFunction(
        () => {
          const progress = document.querySelector('[class*="progress"]');
          return !progress || progress.textContent.includes('100');
        },
        { timeout: 300000 } // 5 minutes max for upload
      );

      // Add caption
      const formattedCaption = this.formatCaption(caption, options);
      await this.page.waitForSelector('[class*="caption"] textarea, .caption-input', {
        visible: true,
        timeout: 10000,
      });

      const captionSelector = await this.page.$('[class*="caption"] textarea, .caption-input');
      await captionSelector.click({ clickCount: 3 }); // Select all
      await captionSelector.type(formattedCaption);

      // Set privacy settings
      await this.setPrivacySettings(options);

      // Set interaction settings
      await this.setInteractionSettings(options);

      // Add cover image if specified
      if (options.coverTime) {
        await this.selectCoverImage(options.coverTime);
      }

      // Wait for user confirmation before posting
      if (!options.skipConfirmation) {
        await this.waitForUserConfirmation();
      }

      // Click post button
      await this.page.waitForSelector('button[class*="post"], button:has-text("Post")', {
        visible: true,
      });

      await this.page.click('button[class*="post"], button:has-text("Post")');

      // Wait for post to complete
      await this.page.waitForFunction(
        () => window.location.href.includes('/foryou') || window.location.href.includes('/@'),
        { timeout: 60000 }
      );

      // Get post URL
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

  /**
   * Set privacy settings
   */
  async setPrivacySettings(options) {
    const privacy = options.privacy || 'public';

    // Click privacy dropdown
    await this.page.waitForSelector('[class*="privacy"], [aria-label*="Who can view"]', {
      visible: true,
    });

    await this.page.click('[class*="privacy"], [aria-label*="Who can view"]');

    // Select privacy option
    const privacyMap = {
      'public': 'Everyone',
      'friends': 'Friends',
      'private': 'Only me',
    };

    const privacyText = privacyMap[privacy] || 'Everyone';
    await this.page.click(`text=${privacyText}`);
  }

  /**
   * Set interaction settings
   */
  async setInteractionSettings(options) {
    // Allow comments
    if (options.allowComments === false) {
      const commentsToggle = await this.page.$('[aria-label*="Allow comments"]');
      if (commentsToggle) {
        await commentsToggle.click();
      }
    }

    // Allow duet
    if (options.allowDuet === false) {
      const duetToggle = await this.page.$('[aria-label*="Allow Duet"]');
      if (duetToggle) {
        await duetToggle.click();
      }
    }

    // Allow stitch
    if (options.allowStitch === false) {
      const stitchToggle = await this.page.$('[aria-label*="Allow Stitch"]');
      if (stitchToggle) {
        await stitchToggle.click();
      }
    }
  }

  /**
   * Select cover image at specific time
   */
  async selectCoverImage(coverTime) {
    // Click edit cover button
    const editCoverButton = await this.page.$('[class*="cover"], [aria-label*="Edit cover"]');
    if (editCoverButton) {
      await editCoverButton.click();

      // Wait for cover editor
      await this.page.waitForSelector('[class*="timeline"], [class*="slider"]', {
        visible: true,
        timeout: 5000,
      });

      // Adjust timeline to specified time
      // This is simplified - actual implementation would need to calculate position
      await this.page.waitForTimeout(1000);

      // Confirm cover selection
      const confirmButton = await this.page.$('button:has-text("Confirm"), button:has-text("Save")');
      if (confirmButton) {
        await confirmButton.click();
      }
    }
  }

  /**
   * Wait for user confirmation
   */
  async waitForUserConfirmation() {
    console.log('Please review the video upload and press Enter to continue...');
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
  }

  /**
   * Get the URL of the latest post
   */
  async getLatestPostUrl() {
    // Navigate to profile
    await this.page.goto('https://www.tiktok.com/@me', {
      waitUntil: 'networkidle2',
    });

    // Get first video URL
    const postUrl = await this.page.evaluate(() => {
      const firstVideo = document.querySelector('a[href*="/video/"]');
      return firstVideo ? firstVideo.href : null;
    });

    return postUrl;
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

/**
 * TikTok API Client (for future official API integration)
 */
export class TikTokAPIClient {
  constructor(config) {
    this.config = config;
    this.accessToken = config.accessToken;
    this.apiUrl = 'https://open-api.tiktok.com';
  }

  /**
   * Upload video using official API (when available)
   */
  async uploadVideo(videoPath, caption, options = {}) {
    if (!this.accessToken) {
      return {
        success: false,
        error: 'TikTok API access token not configured'
      };
    }

    // This is a placeholder for future API implementation
    // TikTok's official API for posting is currently limited

    try {
      // Step 1: Initialize upload
      const initResponse = await fetch(`${this.apiUrl}/share/video/upload/init`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_size: (await fs.stat(videoPath)).size,
        }),
      });

      if (!initResponse.ok) {
        throw new Error(`Init failed: ${initResponse.status}`);
      }

      const { upload_url, video_id } = await initResponse.json();

      // Step 2: Upload video chunks
      const videoBuffer = await fs.readFile(videoPath);
      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        body: videoBuffer,
        headers: {
          'Content-Type': 'video/mp4',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      // Step 3: Publish video
      const publishResponse = await fetch(`${this.apiUrl}/share/video/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id,
          caption,
          privacy_level: options.privacy || 'public_to_everyone',
          allow_comments: options.allowComments !== false,
          allow_duet: options.allowDuet !== false,
          allow_stitch: options.allowStitch !== false,
        }),
      });

      if (!publishResponse.ok) {
        throw new Error(`Publish failed: ${publishResponse.status}`);
      }

      const result = await publishResponse.json();

      return {
        success: true,
        postId: result.item_id,
        postUrl: `https://www.tiktok.com/@${result.author_username}/video/${result.item_id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default { TikTokPoster, TikTokAPIClient };