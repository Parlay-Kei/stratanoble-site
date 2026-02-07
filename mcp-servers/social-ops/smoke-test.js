/**
 * Social Ops MCP Server - Smoke Test
 * Tests all major functionality in dry-run mode
 */

import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
dotenv.config({ path: '.env' });
dotenv.config({ path: '../../apps/website/.env.local' });

// Force dry-run mode for testing
process.env.DRY_RUN_MODE = 'true';

// Import modules
import NotionContentTracker from './notion-integration.js';
import { SafetyControls, ApprovalGate } from './safety-controls.js';
import { LinkedInPoster } from './linkedin-poster.js';
import { TikTokPoster } from './tiktok-poster.js';

const config = {
  notion: {
    apiKey: process.env.NOTION_API_KEY,
    socialMediaDbId: process.env.NOTION_SOCIAL_MEDIA_DB_ID,
  },
  linkedin: {
    enabled: true,
    accountType: 'personal',
  },
  tiktok: {
    enabled: true,
    accountType: 'personal',
  },
  dryRun: true,
  rateLimitPerSecond: 2,
};

/**
 * Test Results Tracker
 */
class TestResults {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  record(testName, result, details = {}) {
    const test = {
      name: testName,
      result,
      details,
      timestamp: new Date().toISOString(),
    };

    this.tests.push(test);

    if (result === 'passed') {
      this.passed++;
      console.log(`✅ ${testName}`);
    } else {
      this.failed++;
      console.log(`❌ ${testName}: ${details.error || 'Failed'}`);
    }
  }

  getSummary() {
    return {
      total: this.tests.length,
      passed: this.passed,
      failed: this.failed,
      passRate: this.passed / this.tests.length,
      tests: this.tests,
    };
  }
}

/**
 * Run smoke tests
 */
async function runSmokeTests() {
  console.log('🚀 Starting Social Ops MCP Server Smoke Tests\n');
  console.log('Environment:');
  console.log(`- Dry Run Mode: ${config.dryRun}`);
  console.log(`- Notion Configured: ${!!config.notion.apiKey}`);
  console.log(`- LinkedIn Enabled: ${config.linkedin.enabled}`);
  console.log(`- TikTok Enabled: ${config.tiktok.enabled}`);
  console.log('\n' + '='.repeat(60) + '\n');

  const results = new TestResults();

  // Test 1: Safety Controls Initialization
  try {
    const safety = new SafetyControls(config);
    const status = safety.getStatus();
    results.record('Safety Controls Initialization', 'passed', { status });
  } catch (error) {
    results.record('Safety Controls Initialization', 'failed', { error: error.message });
  }

  // Test 2: Kill Switch Functionality
  try {
    const safety = new SafetyControls(config);
    const linkedinStatus = safety.toggleKillSwitch('linkedin', false);
    const tiktokStatus = safety.toggleKillSwitch('tiktok', false);

    if (linkedinStatus.enabled === false && tiktokStatus.enabled === false) {
      results.record('Kill Switch Toggle', 'passed', { linkedinStatus, tiktokStatus });
    } else {
      results.record('Kill Switch Toggle', 'failed', { message: 'Kill switches not properly disabled' });
    }
  } catch (error) {
    results.record('Kill Switch Toggle', 'failed', { error: error.message });
  }

  // Test 3: Rate Limiting
  try {
    const safety = new SafetyControls(config);
    let allPassed = true;

    // Test multiple rapid requests
    for (let i = 0; i < 3; i++) {
      const check = safety.checkRateLimit('linkedin');
      if (!check.allowed && i > 0) {
        allPassed = false;
      }
    }

    results.record('Rate Limiting Check', allPassed ? 'passed' : 'failed');
  } catch (error) {
    results.record('Rate Limiting Check', 'failed', { error: error.message });
  }

  // Test 4: Content Validation
  try {
    const safety = new SafetyControls(config);

    const validContent = 'Check out our new product launch! #Innovation #Tech';
    const validation1 = safety.validateContent(validContent, 'linkedin');

    const suspiciousContent = 'Get the api_key here: http://example.com/hack.exe';
    const validation2 = safety.validateContent(suspiciousContent, 'linkedin');

    if (validation1.valid && !validation2.valid) {
      results.record('Content Validation', 'passed', {
        validResult: validation1,
        suspiciousResult: validation2,
      });
    } else {
      results.record('Content Validation', 'failed', {
        message: 'Content validation not working correctly'
      });
    }
  } catch (error) {
    results.record('Content Validation', 'failed', { error: error.message });
  }

  // Test 5: Notion Integration (if configured)
  if (config.notion.apiKey) {
    try {
      const tracker = new NotionContentTracker(config);
      const posts = await tracker.fetchScheduledPosts('LinkedIn', 1);

      if (!posts.error) {
        results.record('Notion Fetch Scheduled Posts', 'passed', {
          postsFound: Array.isArray(posts) ? posts.length : 0,
        });
      } else {
        results.record('Notion Fetch Scheduled Posts', 'failed', { error: posts.error });
      }
    } catch (error) {
      results.record('Notion Fetch Scheduled Posts', 'failed', { error: error.message });
    }
  } else {
    results.record('Notion Fetch Scheduled Posts', 'skipped', {
      reason: 'Notion API key not configured'
    });
  }

  // Test 6: LinkedIn Poster Dry Run
  try {
    const linkedinPoster = new LinkedInPoster(config);
    const result = await linkedinPoster.post(
      'Test LinkedIn post from smoke test #Testing',
      {
        hashtags: ['SmokeTest', 'Automation'],
        visibility: 'public',
      }
    );

    if (result.success && result.dryRun) {
      results.record('LinkedIn Dry Run Post', 'passed', { result });
    } else {
      results.record('LinkedIn Dry Run Post', 'failed', { result });
    }
  } catch (error) {
    results.record('LinkedIn Dry Run Post', 'failed', { error: error.message });
  }

  // Test 7: TikTok Poster Dry Run
  try {
    // Create a mock video file for testing
    const testVideoPath = path.join(__dirname, 'test-video.mp4');
    await fs.writeFile(testVideoPath, Buffer.from('mock video content'));

    const tiktokPoster = new TikTokPoster(config);
    const result = await tiktokPoster.upload(
      testVideoPath,
      'Test TikTok upload from smoke test #Testing',
      {
        hashtags: ['SmokeTest', 'Automation'],
        privacy: 'private',
      }
    );

    // Clean up test file
    await fs.remove(testVideoPath);

    if (result.success && result.dryRun) {
      results.record('TikTok Dry Run Upload', 'passed', { result });
    } else {
      results.record('TikTok Dry Run Upload', 'failed', { result });
    }
  } catch (error) {
    results.record('TikTok Dry Run Upload', 'failed', { error: error.message });
  }

  // Test 8: Approval Request System
  try {
    const safety = new SafetyControls(config);
    const approvalRequest = await safety.requestApproval(
      'test-post-id',
      'Test content for approval',
      'LinkedIn'
    );

    if (approvalRequest.id && approvalRequest.status === 'pending') {
      // Grant approval
      const grantResult = safety.grantApproval(approvalRequest.id, 'smoke-test');

      if (grantResult.success) {
        // Check approval
        const checkResult = await safety.checkApproval(approvalRequest.id);

        if (checkResult.approved) {
          results.record('Approval System', 'passed', {
            request: approvalRequest,
            grant: grantResult,
            check: checkResult,
          });
        } else {
          results.record('Approval System', 'failed', {
            message: 'Approval not properly granted'
          });
        }
      } else {
        results.record('Approval System', 'failed', { grantResult });
      }
    } else {
      results.record('Approval System', 'failed', { approvalRequest });
    }
  } catch (error) {
    results.record('Approval System', 'failed', { error: error.message });
  }

  // Test 9: Receipt Generation
  try {
    const receiptsDir = path.join(__dirname, 'receipts');
    await fs.ensureDir(receiptsDir);

    const testReceipt = {
      id: Date.now().toString(),
      platform: 'test',
      action: 'smoke_test',
      timestamp: new Date().toISOString(),
      dryRun: true,
      data: { message: 'Smoke test receipt' },
    };

    const filename = `test_smoke_${testReceipt.id}.json`;
    await fs.writeJson(path.join(receiptsDir, filename), testReceipt, { spaces: 2 });

    // Verify receipt was written
    const exists = await fs.pathExists(path.join(receiptsDir, filename));

    if (exists) {
      results.record('Receipt Generation', 'passed', { filename });
      // Clean up test receipt
      await fs.remove(path.join(receiptsDir, filename));
    } else {
      results.record('Receipt Generation', 'failed', {
        message: 'Receipt file not created'
      });
    }
  } catch (error) {
    results.record('Receipt Generation', 'failed', { error: error.message });
  }

  // Test 10: Audit Logging
  try {
    const safety = new SafetyControls(config);
    const logEntry = await safety.logAction('smoke_test', 'all', {
      message: 'Smoke test audit log entry',
    });

    if (logEntry.timestamp && logEntry.action === 'smoke_test') {
      results.record('Audit Logging', 'passed', { logEntry });
    } else {
      results.record('Audit Logging', 'failed', { logEntry });
    }
  } catch (error) {
    results.record('Audit Logging', 'failed', { error: error.message });
  }

  // Generate summary
  console.log('\n' + '='.repeat(60) + '\n');
  const summary = results.getSummary();

  console.log('📊 Test Summary:');
  console.log(`- Total Tests: ${summary.total}`);
  console.log(`- Passed: ${summary.passed}`);
  console.log(`- Failed: ${summary.failed}`);
  console.log(`- Pass Rate: ${(summary.passRate * 100).toFixed(1)}%`);

  // Write results to file
  const resultsPath = path.join(__dirname, 'smoke-test-results.json');
  await fs.writeJson(resultsPath, summary, { spaces: 2 });
  console.log(`\n📁 Results saved to: ${resultsPath}`);

  // Exit with appropriate code
  process.exit(summary.failed > 0 ? 1 : 0);
}

// Run tests
runSmokeTests().catch(error => {
  console.error('Fatal error in smoke tests:', error);
  process.exit(1);
});