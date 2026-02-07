/**
 * LinkedIn Posting Module
 * Handles browser-based LinkedIn posting with safety controls
 */

import puppeteer from 'puppeteer';
import fs from 'fs-extra';

export class LinkedInPoster {
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize browser with LinkedIn session
   */
  async initialize() {
    if (this.config.dryRun) {
      return { success: true, message: 'DRY RUN: Browser initialization skipped' };
    }

    try {
      this.browser = await puppeteer.launch({
        headless: false, // Show browser for user verification
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      this.page = await this.browser.newPage();

      // Set cookies if provided
      if (this.config.sessionCookies) {
        const cookies = JSON.parse(this.config.sessionCookies);
        await this.page.setCookie(...cookies);
      }

      await this.page.goto('https://www.linkedin.com/feed/', {
        waitUntil: 'networkidle2',
      });

      // Check if logged in
      const isLoggedIn = await this.page.evaluate(() => {
        return !window.location.href.includes('/login');
      });

      if (!isLoggedIn) {
        throw new Error('Not logged into LinkedIn. Please provide valid session cookies.');
      }

      return { success: true, message: 'LinkedIn session initialized' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Format content for LinkedIn post
   */
  formatContent(content, options = {}) {
    let formatted = content;

    // Add hashtags if provided
    if (options.hashtags && Array.isArray(options.hashtags)) {
      formatted += '\n\n' + options.hashtags.map(tag => `#${tag}`).join(' ');
    }

    // Add mentions if provided
    if (options.mentions && Array.isArray(options.mentions)) {
      options.mentions.forEach(mention => {
        formatted = formatted.replace(
          new RegExp(`@${mention.name}`, 'g'),
          `@${mention.id}`
        );
      });
    }

    return formatted;
  }

  /**
   * Post to LinkedIn with approval gate
   */
  async post(content, options = {}) {
    if (!this.config.linkedin.enabled) {
      return { success: false, error: 'LinkedIn posting disabled' };
    }

    if (this.config.dryRun) {
      return {
        success: true,
        dryRun: true,
        preview: {
          content: this.formatContent(content, options),
          imageUrl: options.imageUrl,
          visibility: options.visibility || 'public',
        },
      };
    }

    try {
      if (!this.page) {
        await this.initialize();
      }

      // Navigate to LinkedIn feed
      await this.page.goto('https://www.linkedin.com/feed/', {
        waitUntil: 'networkidle2',
      });

      // Click "Start a post" button
      await this.page.waitForSelector('[aria-label*="Start a post"], .share-box__trigger', {
        visible: true,
        timeout: 10000,
      });

      await this.page.click('[aria-label*="Start a post"], .share-box__trigger');

      // Wait for modal to open
      await this.page.waitForSelector('.share-creation-state__text-editor', {
        visible: true,
        timeout: 10000,
      });

      // Type the content
      const formattedContent = this.formatContent(content, options);
      await this.page.type('.share-creation-state__text-editor .ql-editor', formattedContent);

      // Add image if provided
      if (options.imageUrl) {
        await this.addImage(options.imageUrl);
      }

      // Set visibility
      if (options.visibility) {
        await this.setVisibility(options.visibility);
      }

      // Wait for user confirmation before posting
      if (!options.skipConfirmation) {
        await this.waitForUserConfirmation();
      }

      // Click post button
      await this.page.waitForSelector('[aria-label*="Post"], button:has-text("Post")', {
        visible: true,
      });

      await this.page.click('[aria-label*="Post"], button:has-text("Post")');

      // Wait for post to complete
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });

      // Get post URL
      const postUrl = await this.getLatestPostUrl();

      return {
        success: true,
        postUrl,
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
   * Add image to post
   */
  async addImage(imageUrl) {
    // Click add image button
    await this.page.waitForSelector('[aria-label*="Add a photo"]', { visible: true });
    await this.page.click('[aria-label*="Add a photo"]');

    // Handle file upload
    const inputFile = await this.page.$('input[type="file"]');

    if (imageUrl.startsWith('http')) {
      // Download image first
      const imagePath = `/tmp/linkedin_image_${Date.now()}.jpg`;
      // Download logic here
      await inputFile.uploadFile(imagePath);
      await fs.remove(imagePath);
    } else {
      // Local file
      await inputFile.uploadFile(imageUrl);
    }

    // Wait for image to upload
    await this.page.waitForTimeout(2000);
  }

  /**
   * Set post visibility
   */
  async setVisibility(visibility) {
    // Click visibility dropdown
    await this.page.waitForSelector('[aria-label*="visibility"]', { visible: true });
    await this.page.click('[aria-label*="visibility"]');

    // Select visibility option
    const visibilityMap = {
      'public': 'Anyone',
      'connections': 'Connections only',
      'private': 'Only me',
    };

    const visibilityText = visibilityMap[visibility] || 'Anyone';
    await this.page.click(`text=${visibilityText}`);
  }

  /**
   * Wait for user to confirm post
   */
  async waitForUserConfirmation() {
    console.log('Please review the post and press Enter to continue...');
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
  }

  /**
   * Get the URL of the latest post
   */
  async getLatestPostUrl() {
    await this.page.goto('https://www.linkedin.com/in/me/recent-activity/all/', {
      waitUntil: 'networkidle2',
    });

    const postUrl = await this.page.evaluate(() => {
      const firstPost = document.querySelector('.feed-shared-update-v2 a[href*="/posts/"]');
      return firstPost ? firstPost.href : null;
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
 * LinkedIn API-based posting (for future when official API access is available)
 */
export class LinkedInAPIClient {
  constructor(config) {
    this.config = config;
    this.accessToken = config.accessToken;
    this.apiUrl = 'https://api.linkedin.com/v2';
  }

  /**
   * Post using official API
   */
  async post(content, options = {}) {
    if (!this.accessToken) {
      return {
        success: false,
        error: 'LinkedIn API access token not configured'
      };
    }

    // LinkedIn API v2 share endpoint
    const shareData = {
      author: `urn:li:person:${options.authorId || 'me'}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: options.imageUrl ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility':
          options.visibility?.toUpperCase() || 'PUBLIC',
      },
    };

    // Add media if provided
    if (options.imageUrl) {
      shareData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        description: {
          text: options.imageDescription || '',
        },
        media: options.imageUrl,
      }];
    }

    try {
      const response = await fetch(`${this.apiUrl}/ugcPosts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(shareData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        postId: result.id,
        postUrl: `https://www.linkedin.com/feed/update/${result.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default { LinkedInPoster, LinkedInAPIClient };