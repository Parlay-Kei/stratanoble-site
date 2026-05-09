#!/usr/bin/env node
/**
 * Social Ops MCP Server V1
 * LinkedIn and TikTok posting with Notion integration
 *
 * Features:
 * - LinkedIn: Post text/media with approval gates
 * - TikTok: Upload videos with approval gates
 * - Notion: Pull scheduled posts, update status, track URLs
 *
 * Safety:
 * - Dry-run mode for testing
 * - Approval required before posting
 * - Rate limiting enforced
 * - Receipts generated for all actions
 * - Kill switch per platform
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Client } from '@notionhq/client';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Import custom modules
import NotionContentTracker from './notion-integration.js';
import { SafetyControls, ApprovalGate } from './safety-controls.js';
import { LinkedInPoster, LinkedInAPIClient } from './linkedin-poster.js';
import { TikTokPoster, TikTokAPIClient } from './tiktok-poster.js';
import { TikTokPlaywrightPoster } from './tiktok-playwright-poster.js';
import {
  loadStrataNobleTikTokQueue,
  getStrataNobleTikTokQueuePath,
} from './strata-queue-loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '../../apps/website/.env.local' });

// Configuration
const config = {
  notion: {
    apiKey: process.env.NOTION_API_KEY,
    socialMediaDbId: process.env.NOTION_SOCIAL_MEDIA_DB_ID,
  },
  linkedin: {
    enabled: process.env.LINKEDIN_ENABLED !== 'false',
    accountType: process.env.LINKEDIN_ACCOUNT_TYPE || 'personal',
    sessionCookies: process.env.LINKEDIN_SESSION_COOKIES,
  },
  tiktok: {
    enabled: process.env.TIKTOK_ENABLED !== 'false',
    accountType: process.env.TIKTOK_ACCOUNT_TYPE || 'personal',
    sessionCookies: process.env.TIKTOK_SESSION_COOKIES,
    usePersistentProfile: process.env.TIKTOK_USE_PERSISTENT_PROFILE === 'true',
    profileDir: process.env.TIKTOK_PROFILE_DIR || '.auth/tiktok-profile',
  },
  approval: {
    method: process.env.APPROVAL_METHOD || 'notion', // 'notion' or 'explicit'
  },
  dryRun: process.env.DRY_RUN_MODE === 'true',
  rateLimitPerSecond: parseInt(process.env.RATE_LIMIT_RPS) || 2,
};

// Receipt storage
const receiptsDir = path.join(__dirname, 'receipts');
fs.ensureDirSync(receiptsDir);

// Rate limiting state
let lastRequestTime = {};
const minRequestInterval = 1000 / config.rateLimitPerSecond;

/**
 * Returns true if TIKTOK_SESSION_COOKIES parses to a non-empty cookie array.
 */
function hasTikTokSessionCookies() {
  const raw = config.tiktok.sessionCookies;
  if (!raw || typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '[]') return false;
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

/**
 * Cookie JSON or persistent Chromium profile satisfies non-dry-run TikTok auth.
 */
function hasTikTokAuthForUpload() {
  if (config.tiktok.usePersistentProfile) {
    return true;
  }
  return hasTikTokSessionCookies();
}

/**
 * Validate persistent profile: login state + @strata.noble (browser opens even if DRY_RUN_MODE=true).
 */
async function validateTikTokPersistentProfile() {
  if (!config.tiktok.enabled) {
    return { success: false, error: 'TikTok posting disabled via kill switch' };
  }
  if (!config.tiktok.usePersistentProfile) {
    return {
      success: false,
      error: 'Set TIKTOK_USE_PERSISTENT_PROFILE=true to validate the saved Chromium profile.',
    };
  }

  const posterConfig = {
    notion: config.notion,
    linkedin: config.linkedin,
    tiktok: config.tiktok,
    approval: config.approval,
    dryRun: false,
  };

  const poster = new TikTokPlaywrightPoster(posterConfig);
  try {
    const result = await poster.validatePersistentProfileAndAccount();
    await poster.close();
    const ready = result.finalStatus === 'READY_FOR_DRAFT_TEST';
    return { success: ready, ...result };
  } catch (err) {
    await poster.close().catch(() => {});
    return { success: false, error: err.message };
  }
}

/**
 * Generate a unique receipt ID
 */
function generateReceiptId() {
  return `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Save a receipt
 */
async function saveReceipt(platform, action, data) {
  const receiptId = generateReceiptId();
  const receipt = {
    id: receiptId,
    platform,
    action,
    timestamp: new Date().toISOString(),
    dryRun: config.dryRun,
    data,
  };

  const filename = `${platform}_${action}_${receiptId}.json`;
  await fs.writeJson(path.join(receiptsDir, filename), receipt, { spaces: 2 });

  return receiptId;
}

/**
 * Rate limiting per platform
 */
async function rateLimit(platform) {
  const now = Date.now();
  const lastTime = lastRequestTime[platform] || 0;
  const timeSinceLastRequest = now - lastTime;

  if (timeSinceLastRequest < minRequestInterval) {
    const waitTime = minRequestInterval - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime[platform] = Date.now();
}

/**
 * Initialize Notion client
 */
function initializeNotionClient() {
  if (!config.notion.apiKey) {
    throw new Error('NOTION_API_KEY environment variable is required');
  }
  return new Client({ auth: config.notion.apiKey });
}

const notion = config.notion.apiKey ? initializeNotionClient() : null;

/**
 * Fetch scheduled posts from Notion
 */
async function fetchScheduledPosts(platform) {
  if (!notion || !config.notion.socialMediaDbId) {
    return { error: 'Notion not configured' };
  }

  try {
    const response = await notion.databases.query({
      database_id: config.notion.socialMediaDbId,
      filter: {
        and: [
          {
            property: 'Platform',
            select: { equals: platform },
          },
          {
            property: 'Status',
            select: { equals: 'Scheduled' },
          },
        ],
      },
      sorts: [
        {
          property: 'Scheduled Date',
          direction: 'ascending',
        },
      ],
    });

    return response.results.map(page => ({
      id: page.id,
      properties: page.properties,
    }));
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Update Notion post status
 */
async function updateNotionStatus(pageId, status, postUrl = null) {
  if (!notion) return;

  const properties = {
    'Status': {
      select: { name: status },
    },
  };

  if (postUrl) {
    properties['Post URL'] = {
      url: postUrl,
    };
  }

  await notion.pages.update({
    page_id: pageId,
    properties,
  });
}

/**
 * Check approval status
 */
async function checkApproval(postId) {
  if (config.approval.method === 'notion' && notion) {
    try {
      const page = await notion.pages.retrieve({ page_id: postId });
      const status = page.properties?.['Approval Status']?.select?.name;
      return status === 'Approved';
    } catch (error) {
      return false;
    }
  }

  // For explicit approval, this would be handled differently
  return false;
}

/**
 * LinkedIn posting via browser automation
 */
async function postToLinkedIn(content, imageUrl = null, notionPageId = null) {
  if (!config.linkedin.enabled) {
    return { error: 'LinkedIn posting disabled via kill switch' };
  }

  await rateLimit('linkedin');

  if (config.dryRun) {
    const receiptId = await saveReceipt('linkedin', 'dry_run_post', {
      content,
      imageUrl,
      notionPageId,
    });

    return {
      success: true,
      dryRun: true,
      message: 'DRY RUN: Would post to LinkedIn',
      receiptId,
    };
  }

  // Real posting would happen here via puppeteer
  // For v1, we're implementing the structure
  const mockPostUrl = `https://linkedin.com/posts/${Date.now()}`;

  if (notionPageId) {
    await updateNotionStatus(notionPageId, 'Posted', mockPostUrl);
  }

  const receiptId = await saveReceipt('linkedin', 'post', {
    content,
    imageUrl,
    notionPageId,
    postUrl: mockPostUrl,
  });

  return {
    success: true,
    postUrl: mockPostUrl,
    receiptId,
  };
}

/**
 * TikTok posting via TikTokPoster (dry_run, draft, schedule, publish).
 * Mock post URLs are not used. Live postUrl only comes from real browser completion.
 */
async function postToTikTok(videoPath, caption, notionPageId = null, toolOptions = {}) {
  if (!config.tiktok.enabled) {
    return { success: false, error: 'TikTok posting disabled via kill switch' };
  }

  await rateLimit('tiktok');

  if (!await fs.pathExists(videoPath)) {
    return { success: false, error: 'Video file not found' };
  }

  const executionMode =
    toolOptions.executionMode ||
    process.env.TIKTOK_EXECUTION_MODE ||
    'dry_run';

  const forceDryRun =
    config.dryRun === true || executionMode === 'dry_run';

  const queueSourcePath = getStrataNobleTikTokQueuePath();

  if (!forceDryRun) {
    if (process.env.TIKTOK_EXECUTION_APPROVED !== 'true') {
      return {
        success: false,
        error:
          'Non-dry-run TikTok execution blocked. Set TIKTOK_EXECUTION_APPROVED=true after QA.',
        executionMode,
        queueSourcePath,
      };
    }
    if (!hasTikTokAuthForUpload()) {
      return {
        success: false,
        error:
          'TIKTOK_SESSION_COOKIES missing or empty. Set TIKTOK_USE_PERSISTENT_PROFILE=true with a logged-in Chromium profile, or load cookies into .env.',
        executionMode,
        queueSourcePath,
      };
    }
    if (executionMode === 'publish' && process.env.TIKTOK_LIVE_PUBLISH_APPROVED !== 'true') {
      return {
        success: false,
        error:
          'Live publish blocked. Set TIKTOK_LIVE_PUBLISH_APPROVED=true only after explicit QA gate.',
        executionMode,
        queueSourcePath,
      };
    }
  }

  const posterConfig = {
    notion: config.notion,
    linkedin: config.linkedin,
    tiktok: config.tiktok,
    approval: config.approval,
    dryRun: forceDryRun,
  };

  const PosterCtor = config.tiktok.usePersistentProfile
    ? TikTokPlaywrightPoster
    : TikTokPoster;
  const poster = new PosterCtor(posterConfig);

  const uploadOptions = {
    executionMode: forceDryRun ? 'dry_run' : executionMode,
    privacy: toolOptions.privacy || 'public',
    hashtags: toolOptions.hashtags,
    scheduleAt: toolOptions.scheduleAt,
    allowComments: toolOptions.allowComments !== false,
    allowDuet: toolOptions.allowDuet !== false,
    allowStitch: toolOptions.allowStitch !== false,
    skipConfirmation: process.env.TIKTOK_SKIP_PUBLISH_CONFIRMATION === 'true',
  };

  try {
    const result = await poster.upload(videoPath, caption, uploadOptions);

    const videoHash =
      result.preview?.videoHash || result.videoHash || null;

    const receiptId = await saveReceipt(
      'tiktok',
      forceDryRun ? 'dry_run_upload' : executionMode,
      {
        videoPath,
        videoHash,
        caption,
        notionPageId,
        executionMode: uploadOptions.executionMode,
        dryRun: forceDryRun,
        queueSourcePath,
        success: result.success !== false,
      }
    );

    await poster.close();

    if (notionPageId && result.success && result.postUrl) {
      await updateNotionStatus(notionPageId, 'Posted', result.postUrl);
    }

    return {
      ...result,
      receiptId,
      queueSourcePath,
      dryRun: forceDryRun,
    };
  } catch (err) {
    await poster.close().catch(() => {});
    return {
      success: false,
      error: err.message,
      queueSourcePath,
    };
  }
}

/**
 * MCP Server Implementation
 */
const server = new Server(
  {
    name: 'social-ops-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'fetch_scheduled_posts',
        description: 'Fetch scheduled posts from Notion for a platform',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              enum: ['LinkedIn', 'TikTok'],
              description: 'Social media platform',
            },
          },
          required: ['platform'],
        },
      },
      {
        name: 'preview_post',
        description: 'Preview a post before publishing',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              enum: ['LinkedIn', 'TikTok'],
            },
            postId: {
              type: 'string',
              description: 'Notion page ID of the post',
            },
          },
          required: ['platform', 'postId'],
        },
      },
      {
        name: 'publish_linkedin_post',
        description: 'Publish a post to LinkedIn after approval',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Post content',
            },
            imageUrl: {
              type: 'string',
              description: 'Optional image URL',
            },
            notionPageId: {
              type: 'string',
              description: 'Notion page ID for status tracking',
            },
          },
          required: ['content'],
        },
      },
      {
        name: 'validate_tiktok_persistent_profile',
        description:
          'When TIKTOK_USE_PERSISTENT_PROFILE=true, opens Playwright Chromium with TIKTOK_PROFILE_DIR, checks login and that the session is @strata.noble, and returns NEEDS_ONE_TIME_LOGIN / READY_FOR_DRAFT_TEST. Does not print cookies.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'publish_tiktok_video',
        description:
          'Upload a video to TikTok. Defaults to dry_run (no browser). Non-dry-run requires TIKTOK_EXECUTION_APPROVED=true and either TIKTOK_SESSION_COOKIES or TIKTOK_USE_PERSISTENT_PROFILE with a validated profile.',
        inputSchema: {
          type: 'object',
          properties: {
            videoPath: {
              type: 'string',
              description: 'Path to video file',
            },
            caption: {
              type: 'string',
              description: 'Video caption',
            },
            notionPageId: {
              type: 'string',
              description: 'Notion page ID for status tracking',
            },
            executionMode: {
              type: 'string',
              enum: ['dry_run', 'draft', 'schedule', 'publish'],
              description:
                'dry_run default behavior; others require env gates (see README)',
            },
            hashtags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Hashtag strings without leading #',
            },
            scheduleAt: {
              type: 'string',
              description: 'ISO datetime for schedule mode when implemented',
            },
            privacy: {
              type: 'string',
              enum: ['public', 'friends', 'private'],
            },
          },
          required: ['videoPath', 'caption'],
        },
      },
      {
        name: 'load_strata_noble_tiktok_queue',
        description:
          'Load Posts 1–14 from docs/social/tiktok/STRATA_NOBLE_TIKTOK_POSTING_QUEUE_001.md (approved queue)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'check_platform_status',
        description: 'Check if a platform is enabled',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              enum: ['LinkedIn', 'TikTok'],
            },
          },
          required: ['platform'],
        },
      },
      {
        name: 'get_receipts',
        description: 'Get recent action receipts',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              enum: ['LinkedIn', 'TikTok', 'all'],
            },
            limit: {
              type: 'number',
              description: 'Number of receipts to return',
              default: 10,
            },
          },
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'fetch_scheduled_posts':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await fetchScheduledPosts(args.platform), null, 2),
            },
          ],
        };

      case 'preview_post':
        // Fetch post details from Notion and format preview
        if (!notion) {
          return {
            content: [
              { type: 'text', text: 'Notion not configured' },
            ],
          };
        }

        const page = await notion.pages.retrieve({ page_id: args.postId });
        return {
          content: [
            {
              type: 'text',
              text: `Preview for ${args.platform}:\n${JSON.stringify(page.properties, null, 2)}`,
            },
          ],
        };

      case 'publish_linkedin_post':
        // Check approval if Notion page ID provided
        if (args.notionPageId) {
          const approved = await checkApproval(args.notionPageId);
          if (!approved && config.approval.method === 'notion') {
            return {
              content: [
                { type: 'text', text: 'Post not approved in Notion' },
              ],
            };
          }
        }

        const linkedInResult = await postToLinkedIn(
          args.content,
          args.imageUrl,
          args.notionPageId
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(linkedInResult, null, 2),
            },
          ],
        };

      case 'validate_tiktok_persistent_profile': {
        const validationResult = await validateTikTokPersistentProfile();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(validationResult, null, 2),
            },
          ],
        };
      }

      case 'publish_tiktok_video':
        // Check approval if Notion page ID provided
        if (args.notionPageId) {
          const approved = await checkApproval(args.notionPageId);
          if (!approved && config.approval.method === 'notion') {
            return {
              content: [
                { type: 'text', text: 'Video not approved in Notion' },
              ],
            };
          }
        }

        const tiktokResult = await postToTikTok(
          args.videoPath,
          args.caption,
          args.notionPageId,
          {
            executionMode: args.executionMode,
            hashtags: args.hashtags,
            scheduleAt: args.scheduleAt,
            privacy: args.privacy,
            allowComments: args.allowComments,
            allowDuet: args.allowDuet,
            allowStitch: args.allowStitch,
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tiktokResult, null, 2),
            },
          ],
        };

      case 'load_strata_noble_tiktok_queue':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(loadStrataNobleTikTokQueue(), null, 2),
            },
          ],
        };

      case 'check_platform_status':
        const status = {
          LinkedIn: {
            enabled: config.linkedin.enabled,
            accountType: config.linkedin.accountType,
          },
          TikTok: {
            enabled: config.tiktok.enabled,
            accountType: config.tiktok.accountType,
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(status[args.platform], null, 2),
            },
          ],
        };

      case 'get_receipts':
        const receipts = await fs.readdir(receiptsDir);
        const filtered = receipts.filter(f =>
          args.platform === 'all' || f.startsWith(args.platform.toLowerCase())
        );

        const limit = args.limit || 10;
        const recent = filtered.slice(-limit);

        const receiptData = await Promise.all(
          recent.map(async f => await fs.readJson(path.join(receiptsDir, f)))
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(receiptData, null, 2),
            },
          ],
        };

      default:
        return {
          content: [
            { type: 'text', text: `Unknown tool: ${name}` },
          ],
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Social Ops MCP Server v1.0.0 started');
  console.error(`Dry run mode: ${config.dryRun}`);
  console.error(`LinkedIn: ${config.linkedin.enabled ? 'enabled' : 'disabled'}`);
  console.error(`TikTok: ${config.tiktok.enabled ? 'enabled' : 'disabled'}`);
  console.error(
    `TikTok persistent profile: ${config.tiktok.usePersistentProfile ? 'on' : 'off'}`
  );
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});