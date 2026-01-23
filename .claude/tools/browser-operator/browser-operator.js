#!/usr/bin/env node
/**
 * Browser Operator v1.0
 * Main executor for browser-operator-ops skill
 * Handles authenticated admin operations with proof capture
 */

import { BrowserExecutor } from './browser-executor.js';
import { SessionHandler } from './session-handler.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class BrowserOperator {
  constructor() {
    this.executor = null;
    this.sessionHandler = null;
    this.config = null;
  }

  /**
   * Initialize operator
   */
  async initialize(config = {}) {
    // Load config
    this.config = {
      headless: config.headless ?? false,
      slowMo: config.slowMo ?? 100,
      debug: config.debug ?? false,
      ...config
    };

    // Initialize session handler
    this.sessionHandler = new SessionHandler();
    await this.sessionHandler.initialize();

    // Initialize browser executor
    this.executor = new BrowserExecutor(this.config);
  }

  /**
   * Execute Shopify admin operation
   */
  async executeShopifyOperation(operation) {
    const { action, credentials, target, changes } = operation;

    try {
      // Start browser session
      const sessionId = await this.executor.initialize('shopify');

      // Try to recover existing session
      const recovered = await this.sessionHandler.recoverSession(
        'shopify',
        credentials.store,
        this.executor.context
      );

      let needsLogin = true;

      if (recovered.recovered) {
        // Navigate to admin and check if still logged in
        await this.executor.navigate(`https://${credentials.store}.myshopify.com/admin`);

        // Check for login page
        needsLogin = await this.executor.page.isVisible('input[name="account[email]"]', { timeout: 3000 })
          .catch(() => false);
      }

      if (needsLogin) {
        // Navigate to login
        await this.executor.navigate(`https://${credentials.store}.myshopify.com/admin`);

        // Perform login
        await this.executor.login({
          username: credentials.email,
          password: credentials.password,
          mfaCode: credentials.mfaCode
        }, {
          username: 'input[name="account[email]"]',
          password: 'input[name="account[password]"]',
          submit: 'button[type="submit"]'
        });

        // Save session
        const cookies = await this.executor.context.cookies();
        await this.sessionHandler.storeCookies(sessionId, cookies);
      }

      // Navigate to target
      if (target.type === 'page') {
        await this.navigateToPage(target);
      } else if (target.type === 'product') {
        await this.navigateToProduct(target);
      } else if (target.type === 'collection') {
        await this.navigateToCollection(target);
      }

      // Capture before state
      await this.executor.captureProof('before_change', {
        target: target.name,
        action: action
      });

      // Execute changes
      const changeResults = await this.executeChanges(changes);

      // Capture after state
      await this.executor.captureProof('after_change', {
        target: target.name,
        changes: changeResults
      });

      // Save changes if needed
      if (action === 'edit' || action === 'create') {
        await this.saveChanges();
      }

      // Navigate to public site for verification
      await this.verifyOnPublicSite(credentials.store, target);

      // Generate proof pack
      const proofPack = await this.executor.generateProofPack(
        `Shopify Admin: ${action} ${target.name}`,
        `OCS-BO-${Date.now()}`
      );

      return {
        success: true,
        proofPack: proofPack.markdown,
        sessionId,
        changes: changeResults
      };

    } catch (error) {
      await this.executor.captureProof('error', {
        error: error.message,
        stack: error.stack
      });

      const proofPack = await this.executor.generateProofPack(
        `Shopify Admin: ${action} ${target.name} (FAILED)`,
        `OCS-BO-${Date.now()}`
      );

      return {
        success: false,
        error: error.message,
        proofPack: proofPack.markdown
      };

    } finally {
      if (this.executor) {
        await this.executor.close();
      }
    }
  }

  /**
   * Navigate to Shopify page
   */
  async navigateToPage(target) {
    const { store, pageId, pageHandle } = target;

    if (pageId) {
      await this.executor.navigate(
        `https://${store}.myshopify.com/admin/online-store/pages/${pageId}`
      );
    } else if (pageHandle) {
      // First go to pages list
      await this.executor.navigate(
        `https://${store}.myshopify.com/admin/online-store/pages`
      );

      // Search for page
      await this.executor.executeAction('fill', 'input[placeholder*="Search"]', {
        value: pageHandle
      });

      await this.executor.page.waitForTimeout(1000);

      // Click on page
      await this.executor.executeAction('click', `a:has-text("${pageHandle}")`);
    }
  }

  /**
   * Navigate to Shopify product
   */
  async navigateToProduct(target) {
    const { store, productId, productHandle } = target;

    if (productId) {
      await this.executor.navigate(
        `https://${store}.myshopify.com/admin/products/${productId}`
      );
    } else if (productHandle) {
      await this.executor.navigate(
        `https://${store}.myshopify.com/admin/products`
      );

      await this.executor.executeAction('fill', 'input[placeholder*="Search"]', {
        value: productHandle
      });

      await this.executor.page.waitForTimeout(1000);

      await this.executor.executeAction('click', `a:has-text("${productHandle}")`);
    }
  }

  /**
   * Navigate to Shopify collection
   */
  async navigateToCollection(target) {
    const { store, collectionId, collectionHandle } = target;

    if (collectionId) {
      await this.executor.navigate(
        `https://${store}.myshopify.com/admin/collections/${collectionId}`
      );
    } else if (collectionHandle) {
      await this.executor.navigate(
        `https://${store}.myshopify.com/admin/collections`
      );

      await this.executor.executeAction('fill', 'input[placeholder*="Search"]', {
        value: collectionHandle
      });

      await this.executor.page.waitForTimeout(1000);

      await this.executor.executeAction('click', `a:has-text("${collectionHandle}")`);
    }
  }

  /**
   * Execute changes on page
   */
  async executeChanges(changes) {
    const results = [];

    for (const change of changes) {
      const { field, value, action = 'fill' } = change;

      try {
        // Wait for field to be visible
        await this.executor.page.waitForSelector(field, { state: 'visible' });

        // Execute action based on type
        let result;
        if (action === 'fill' || action === 'type') {
          // Clear field first if it's a text input
          await this.executor.page.fill(field, '');
          result = await this.executor.executeAction('fill', field, { value });

        } else if (action === 'select') {
          result = await this.executor.executeAction('select', field, { value });

        } else if (action === 'check' || action === 'uncheck') {
          result = await this.executor.executeAction(action, field);

        } else if (action === 'click') {
          result = await this.executor.executeAction('click', field);

        } else if (action === 'richtext') {
          // Handle rich text editor (like Shopify's)
          const editorFrame = this.executor.page.frameLocator(field);
          if (editorFrame) {
            await editorFrame.locator('body').fill(value);
            result = { richtext: true, value };
          } else {
            // Fallback to regular fill
            result = await this.executor.executeAction('fill', field, { value });
          }
        }

        results.push({
          field,
          action,
          value,
          success: true,
          result
        });

      } catch (error) {
        results.push({
          field,
          action,
          value,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Save changes in Shopify
   */
  async saveChanges() {
    // Look for save button
    const saveSelectors = [
      'button:has-text("Save")',
      'button[aria-label*="Save"]',
      'button[type="submit"]:has-text("Save")',
      'button.Polaris-Button--primary:has-text("Save")'
    ];

    for (const selector of saveSelectors) {
      try {
        const saveButton = await this.executor.page.waitForSelector(selector, {
          state: 'visible',
          timeout: 2000
        });

        if (saveButton) {
          await this.executor.executeAction('click', selector);

          // Wait for save to complete
          await this.executor.page.waitForLoadState('networkidle');

          // Look for success toast/banner
          await this.executor.page.waitForSelector(
            'div:has-text("saved"), div:has-text("updated"), div[role="status"]',
            { timeout: 5000 }
          ).catch(() => {});

          await this.executor.captureProof('after_save', {
            saved: true,
            timestamp: new Date().toISOString()
          });

          return true;
        }
      } catch (error) {
        // Try next selector
      }
    }

    throw new Error('Could not find save button');
  }

  /**
   * Verify changes on public site
   */
  async verifyOnPublicSite(store, target) {
    // Open new page for public site
    const publicPage = await this.executor.context.newPage();

    let publicUrl;
    if (target.type === 'page' && target.pageHandle) {
      publicUrl = `https://${store}.myshopify.com/pages/${target.pageHandle}`;
    } else if (target.type === 'product' && target.productHandle) {
      publicUrl = `https://${store}.myshopify.com/products/${target.productHandle}`;
    } else if (target.type === 'collection' && target.collectionHandle) {
      publicUrl = `https://${store}.myshopify.com/collections/${target.collectionHandle}`;
    } else {
      publicUrl = `https://${store}.myshopify.com`;
    }

    await publicPage.goto(publicUrl, { waitUntil: 'networkidle' });

    // Take screenshot of public site
    const screenshotPath = path.join(
      this.executor.config.screenshotDir,
      this.executor.sessionId,
      'screenshots',
      `public_verification_${Date.now()}.png`
    );

    await publicPage.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    this.executor.proofCaptures.push({
      eventName: 'public_verification',
      timestamp: new Date().toISOString(),
      screenshotPath,
      screenshotName: path.basename(screenshotPath),
      pageInfo: {
        url: publicPage.url(),
        title: await publicPage.title()
      },
      metadata: {
        verificationType: 'public_site',
        targetType: target.type,
        targetName: target.name
      }
    });

    await publicPage.close();
  }

  /**
   * Execute generic browser operation
   */
  async executeOperation(config) {
    const { platform, operation } = config;

    switch (platform) {
      case 'shopify':
        return await this.executeShopifyOperation(operation);

      case 'notion':
        // To be implemented
        throw new Error('Notion operations not yet implemented');

      case 'google':
        // To be implemented
        throw new Error('Google Admin operations not yet implemented');

      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: browser-operator <config-file.json>');
    process.exit(1);
  }

  const configFile = args[0];

  try {
    // Load configuration
    const configContent = await fs.readFile(configFile, 'utf-8');
    const config = JSON.parse(configContent);

    // Initialize operator
    const operator = new BrowserOperator();
    await operator.initialize(config.settings || {});

    // Execute operation
    const result = await operator.executeOperation(config);

    // Output result
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log(`\nProof pack generated: ${result.proofPack}`);
      process.exit(0);
    } else {
      console.error(`\nOperation failed: ${result.error}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(2);
  }
}

// Export for module use
export { BrowserOperator, BrowserExecutor, SessionHandler };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}