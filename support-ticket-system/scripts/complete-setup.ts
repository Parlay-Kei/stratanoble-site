/**
 * Complete Setup Script
 *
 * This script completes the support ticket system setup by:
 * 1. Creating client-specific support channels in Slack
 * 2. Inviting the bot to the new channels
 * 3. Posting and pinning channel rules
 * 4. Creating portal pages in Notion
 *
 * Prerequisites:
 * - SLACK_BOT_TOKEN with channels:manage, channels:write, pins:write scopes
 * - NOTION_TOKEN with page creation permissions
 * - Existing Notion database: 2e613b42-8aa7-813d-81d6-cd4e0f8377a7
 *
 * DO NOT run this script multiple times - it will create duplicate resources.
 * Run verify-setup.ts after to confirm everything is configured.
 */

import { config } from 'dotenv';
import { WebClient } from '@slack/web-api';
import { Client } from '@notionhq/client';

config();

// Configuration
const NOTION_DATABASE_ID = '2e613b42-8aa7-813d-81d6-cd4e0f8377a7';
const EXISTING_OPS_TRIAGE_CHANNEL = 'C0A8451R1B8';

interface CreatedResources {
  slackChannels: {
    dslv?: { id: string; name: string };
    msAudreysHouse?: { id: string; name: string };
  };
  slackPins: {
    dslv?: { ts: string };
    msAudreysHouse?: { ts: string };
  };
  notionPortals: {
    dslv?: { id: string; url: string };
    msAudreysHouse?: { id: string; url: string };
  };
}

const createdResources: CreatedResources = {
  slackChannels: {},
  slackPins: {},
  notionPortals: {},
};

function getSlackClient(): WebClient {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw new Error('SLACK_BOT_TOKEN environment variable is required');
  }
  return new WebClient(token);
}

function getNotionClient(): Client {
  const token = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY;
  if (!token) {
    throw new Error('NOTION_TOKEN or NOTION_API_KEY environment variable is required');
  }
  return new Client({ auth: token });
}

function getChannelRulesMessage(portalUrl: string): string {
  return `Support Channel Rules

- This channel is for issue intake only
- Post one issue per message
- Use the "Create Ticket" shortcut (hover message > More actions)
- Or use /ticket command
- No troubleshooting in DMs
- Track status in Notion: ${portalUrl}`;
}

async function createSlackChannel(slack: WebClient, channelName: string): Promise<{ id: string; name: string }> {
  console.log(`Creating Slack channel: #${channelName}...`);

  try {
    const result = await slack.conversations.create({
      name: channelName,
      is_private: false,
    });

    if (!result.channel?.id) {
      throw new Error('Channel creation returned no channel ID');
    }

    console.log(`  Created channel: #${result.channel.name} (${result.channel.id})`);
    return {
      id: result.channel.id,
      name: result.channel.name || channelName,
    };
  } catch (error: any) {
    // Handle case where channel already exists
    if (error.data?.error === 'name_taken') {
      console.log(`  Channel #${channelName} already exists, looking up ID...`);

      // Find the existing channel
      const listResult = await slack.conversations.list({
        types: 'public_channel',
        limit: 1000,
      });

      const existingChannel = listResult.channels?.find(
        (ch) => ch.name === channelName
      );

      if (existingChannel?.id) {
        console.log(`  Found existing channel: ${existingChannel.id}`);
        return {
          id: existingChannel.id,
          name: existingChannel.name || channelName,
        };
      }
      throw new Error(`Channel ${channelName} exists but could not find its ID`);
    }
    throw error;
  }
}

async function inviteBotToChannel(slack: WebClient, channelId: string): Promise<void> {
  console.log(`  Inviting bot to channel ${channelId}...`);

  try {
    // Get bot user ID
    const authResult = await slack.auth.test();
    const botUserId = authResult.user_id;

    if (!botUserId) {
      throw new Error('Could not determine bot user ID');
    }

    // Join the channel (for bots, this is the equivalent of being invited)
    await slack.conversations.join({
      channel: channelId,
    });

    console.log(`  Bot joined channel successfully`);
  } catch (error: any) {
    // Ignore if already in channel
    if (error.data?.error === 'already_in_channel') {
      console.log(`  Bot is already in channel`);
      return;
    }
    throw error;
  }
}

async function postAndPinRules(
  slack: WebClient,
  channelId: string,
  portalUrl: string
): Promise<{ ts: string }> {
  console.log(`  Posting channel rules...`);

  const rulesMessage = getChannelRulesMessage(portalUrl);

  // Post the message
  const postResult = await slack.chat.postMessage({
    channel: channelId,
    text: rulesMessage,
    mrkdwn: true,
  });

  if (!postResult.ts) {
    throw new Error('Message post returned no timestamp');
  }

  console.log(`  Posted rules message (ts: ${postResult.ts})`);

  // Pin the message
  await slack.pins.add({
    channel: channelId,
    timestamp: postResult.ts,
  });

  console.log(`  Pinned rules message`);

  return { ts: postResult.ts };
}

async function createNotionPortalPage(
  notion: Client,
  clientName: string,
  databaseId: string
): Promise<{ id: string; url: string }> {
  console.log(`Creating Notion portal page: "${clientName} Portal"...`);

  // Create a page in the workspace (not in the database)
  // The portal page will link to the database for ticket tracking
  const result = await notion.pages.create({
    parent: {
      type: 'database_id',
      database_id: databaseId,
    },
    properties: {
      // Using "Ticket" as the title property based on the verify-setup.ts schema check
      Ticket: {
        title: [
          {
            text: {
              content: `${clientName} Portal`,
            },
          },
        ],
      },
      Client: {
        select: {
          name: clientName,
        },
      },
      Status: {
        status: {
          name: 'Backlog',
        },
      },
      Category: {
        select: {
          name: 'Question',
        },
      },
      Severity: {
        select: {
          name: 'S4 Low',
        },
      },
    },
    children: [
      {
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `${clientName} Portal`,
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `Welcome to the ${clientName} Portal. This page provides access to your support tickets and resources.`,
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'How to Submit a Ticket',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Post your issue in the designated Slack support channel',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Use the "Create Ticket" shortcut or /ticket command',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Track your ticket status in this portal',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Your Tickets',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `View all ${clientName} tickets in the Client Tickets database filtered by Client = "${clientName}".`,
              },
            },
          ],
        },
      },
    ],
  });

  const pageUrl = `https://notion.so/${result.id.replace(/-/g, '')}`;
  console.log(`  Created portal page: ${pageUrl}`);

  return {
    id: result.id,
    url: pageUrl,
  };
}

async function setupSlackChannels(slack: WebClient): Promise<void> {
  console.log('\n=== Setting Up Slack Channels ===\n');

  // Create DSLV support channel
  const dslvChannel = await createSlackChannel(slack, 'support-dslv');
  createdResources.slackChannels.dslv = dslvChannel;
  await inviteBotToChannel(slack, dslvChannel.id);

  // Create MsAudreysHouse support channel
  const msAudreysChannel = await createSlackChannel(slack, 'support-msaudreyshouse');
  createdResources.slackChannels.msAudreysHouse = msAudreysChannel;
  await inviteBotToChannel(slack, msAudreysChannel.id);

  console.log('\nSlack channels created successfully');
}

async function setupNotionPortals(notion: Client): Promise<void> {
  console.log('\n=== Setting Up Notion Portals ===\n');

  // Create DSLV portal
  const dslvPortal = await createNotionPortalPage(notion, 'DSLV', NOTION_DATABASE_ID);
  createdResources.notionPortals.dslv = dslvPortal;

  // Create MsAudreysHouse portal
  const msAudreysPortal = await createNotionPortalPage(notion, 'MsAudreysHouse', NOTION_DATABASE_ID);
  createdResources.notionPortals.msAudreysHouse = msAudreysPortal;

  console.log('\nNotion portals created successfully');
}

async function postChannelRules(slack: WebClient): Promise<void> {
  console.log('\n=== Posting Channel Rules ===\n');

  // Post rules to DSLV channel
  if (createdResources.slackChannels.dslv && createdResources.notionPortals.dslv) {
    console.log('Posting rules to #support-dslv...');
    const dslvPins = await postAndPinRules(
      slack,
      createdResources.slackChannels.dslv.id,
      createdResources.notionPortals.dslv.url
    );
    createdResources.slackPins.dslv = dslvPins;
  }

  // Post rules to MsAudreysHouse channel
  if (createdResources.slackChannels.msAudreysHouse && createdResources.notionPortals.msAudreysHouse) {
    console.log('Posting rules to #support-msaudreyshouse...');
    const msAudreysPins = await postAndPinRules(
      slack,
      createdResources.slackChannels.msAudreysHouse.id,
      createdResources.notionPortals.msAudreysHouse.url
    );
    createdResources.slackPins.msAudreysHouse = msAudreysPins;
  }

  console.log('\nChannel rules posted and pinned successfully');
}

function printSummary(): void {
  console.log('\n');
  console.log('='.repeat(60));
  console.log('SETUP COMPLETE - RESOURCE SUMMARY');
  console.log('='.repeat(60));

  console.log('\n--- Slack Channels ---');
  if (createdResources.slackChannels.dslv) {
    console.log(`DSLV Support Channel:`);
    console.log(`  Channel ID: ${createdResources.slackChannels.dslv.id}`);
    console.log(`  Channel Name: #${createdResources.slackChannels.dslv.name}`);
  }
  if (createdResources.slackChannels.msAudreysHouse) {
    console.log(`MsAudreysHouse Support Channel:`);
    console.log(`  Channel ID: ${createdResources.slackChannels.msAudreysHouse.id}`);
    console.log(`  Channel Name: #${createdResources.slackChannels.msAudreysHouse.name}`);
  }

  console.log('\n--- Notion Portals ---');
  if (createdResources.notionPortals.dslv) {
    console.log(`DSLV Portal:`);
    console.log(`  Page ID: ${createdResources.notionPortals.dslv.id}`);
    console.log(`  URL: ${createdResources.notionPortals.dslv.url}`);
  }
  if (createdResources.notionPortals.msAudreysHouse) {
    console.log(`MsAudreysHouse Portal:`);
    console.log(`  Page ID: ${createdResources.notionPortals.msAudreysHouse.id}`);
    console.log(`  URL: ${createdResources.notionPortals.msAudreysHouse.url}`);
  }

  console.log('\n--- Pinned Messages ---');
  if (createdResources.slackPins.dslv) {
    console.log(`DSLV Rules Message TS: ${createdResources.slackPins.dslv.ts}`);
  }
  if (createdResources.slackPins.msAudreysHouse) {
    console.log(`MsAudreysHouse Rules Message TS: ${createdResources.slackPins.msAudreysHouse.ts}`);
  }

  console.log('\n--- Environment Variables to Add ---');
  console.log('Add these to your .env file:\n');
  if (createdResources.slackChannels.dslv) {
    console.log(`SLACK_SUPPORT_DSLV_CHANNEL_ID=${createdResources.slackChannels.dslv.id}`);
  }
  if (createdResources.slackChannels.msAudreysHouse) {
    console.log(`SLACK_SUPPORT_MSAUDREYS_CHANNEL_ID=${createdResources.slackChannels.msAudreysHouse.id}`);
  }
  console.log(`SLACK_OPS_TRIAGE_CHANNEL_ID=${EXISTING_OPS_TRIAGE_CHANNEL}`);
  if (createdResources.notionPortals.dslv) {
    console.log(`NOTION_DSLV_PORTAL_URL=${createdResources.notionPortals.dslv.url}`);
  }
  if (createdResources.notionPortals.msAudreysHouse) {
    console.log(`NOTION_MSAUDREYS_PORTAL_URL=${createdResources.notionPortals.msAudreysHouse.url}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Run "npm run verify:setup" to confirm configuration');
  console.log('='.repeat(60) + '\n');
}

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('SUPPORT TICKET SYSTEM - COMPLETE SETUP');
  console.log('='.repeat(60));
  console.log('\nThis script will create:');
  console.log('  1. Slack channels: #support-dslv, #support-msaudreyshouse');
  console.log('  2. Notion portal pages: DSLV Portal, MsAudreysHouse Portal');
  console.log('  3. Pinned channel rules in each support channel');
  console.log('\nUsing Notion Database: ' + NOTION_DATABASE_ID);
  console.log('Existing Ops Triage Channel: ' + EXISTING_OPS_TRIAGE_CHANNEL);

  try {
    const slack = getSlackClient();
    const notion = getNotionClient();

    // Verify connections first
    console.log('\n--- Verifying Connections ---');
    const slackAuth = await slack.auth.test();
    console.log(`Slack: Connected as ${slackAuth.user} in ${slackAuth.team}`);

    const notionUser = await notion.users.me({});
    console.log(`Notion: Connected as ${notionUser.name || 'Integration'}`);

    // Execute setup steps
    await setupSlackChannels(slack);
    await setupNotionPortals(notion);
    await postChannelRules(slack);

    // Print summary
    printSummary();

  } catch (error: any) {
    console.error('\n[ERROR] Setup failed:', error.message);
    console.error('\nPartial resources created:');
    console.error(JSON.stringify(createdResources, null, 2));
    console.error('\nYou may need to manually clean up the above resources.');
    process.exit(1);
  }
}

main();
