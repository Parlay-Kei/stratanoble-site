import { WebClient } from '@slack/web-api';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const notion = new Client({ auth: process.env.NOTION_TOKEN });

/**
 * Complete setup script for multi-client support
 * Creates channels, portal pages, and configures everything
 */

const CLIENTS = [
    {
        name: 'DSLV',
        channelName: 'support-dslv',
        description: 'DSLV client support tickets',
    },
    {
        name: 'MsAudreysHouse',
        channelName: 'support-msaudreyshouse',
        description: 'Ms Audrey\'s House client support tickets',
    },
    {
        name: 'StrataNoble',
        channelName: 'support-stratanoble',
        description: 'Strata Noble client support tickets',
    },
];

const CHANNEL_RULES = `📋 *Support Channel Rules*

1. *Report Issues Here* - Post any bugs, questions, or feature requests
2. *Use /ticket* - Convert your message to a tracked ticket with \`/ticket\`
3. *Or Use Shortcut* - Click ⋮ on any message → "Create Ticket"
4. *No Troubleshooting in Threads* - All status updates happen in Notion
5. *Check Status* - View your ticket status in the Notion portal (link pinned)

*How It Works:*
• Post your issue → Create ticket → Get Notion link
• We triage daily and update status in Notion
• You get notified when resolved

*Need urgent help?* Tag @channel for critical issues only.`;

async function createSlackChannel(client) {
    try {
        console.log(`\n📱 Creating Slack channel: #${client.channelName}...`);

        // Check if channel already exists
        const existingChannels = await slack.conversations.list({
            types: 'public_channel,private_channel',
        });

        const existing = existingChannels.channels?.find(
            ch => ch.name === client.channelName
        );

        if (existing) {
            console.log(`   ✅ Channel already exists: ${existing.id}`);
            return existing.id;
        }

        // Create new channel
        const result = await slack.conversations.create({
            name: client.channelName,
            is_private: false,
        });

        console.log(`   ✅ Created channel: ${result.channel.id}`);

        // Set channel topic
        await slack.conversations.setTopic({
            channel: result.channel.id,
            topic: client.description,
        });

        // Invite bot to channel
        await slack.conversations.join({
            channel: result.channel.id,
        });

        console.log(`   ✅ Bot joined channel`);

        return result.channel.id;

    } catch (error) {
        console.error(`   ❌ Error creating channel:`, error.message);
        return null;
    }
}

async function postChannelRules(channelId, clientName) {
    try {
        console.log(`\n📌 Posting rules to channel...`);

        const result = await slack.chat.postMessage({
            channel: channelId,
            text: CHANNEL_RULES,
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: `${clientName} Support Channel`,
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: CHANNEL_RULES,
                    },
                },
            ],
        });

        // Pin the message
        await slack.pins.add({
            channel: channelId,
            timestamp: result.ts,
        });

        console.log(`   ✅ Rules posted and pinned`);

    } catch (error) {
        console.error(`   ❌ Error posting rules:`, error.message);
    }
}

async function createNotionPortalPage(client) {
    try {
        console.log(`\n📄 Creating Notion portal page for ${client.name}...`);

        const supportDeskPageId = process.env.NOTION_SUPPORT_DESK_PAGE_ID;

        // Create portal page
        const page = await notion.pages.create({
            parent: {
                page_id: supportDeskPageId,
            },
            properties: {
                title: {
                    title: [
                        {
                            text: {
                                content: `${client.name} Support Portal`,
                            },
                        },
                    ],
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
                                    content: `${client.name} Support Portal`,
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
                                    content: 'View the status of your support tickets below.',
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
                                    content: 'Current Tickets',
                                },
                            },
                        ],
                    },
                },
            ],
        });

        console.log(`   ✅ Portal page created: ${page.id}`);
        console.log(`   🔗 URL: ${page.url}`);

        return page;

    } catch (error) {
        console.error(`   ❌ Error creating portal page:`, error.message);
        return null;
    }
}

async function updateNotionClientOptions() {
    try {
        console.log(`\n🔄 Updating Client property options in Notion...`);

        const databaseId = process.env.NOTION_DATABASE_ID;

        // Get current database
        const database = await notion.databases.retrieve({
            database_id: databaseId,
        });

        // Update Client property with new options
        const clientOptions = CLIENTS.map(client => ({
            name: client.name,
            color: 'blue',
        }));

        await notion.databases.update({
            database_id: databaseId,
            properties: {
                'Client': {
                    select: {
                        options: clientOptions,
                    },
                },
            },
        });

        console.log(`   ✅ Client options updated`);

    } catch (error) {
        console.error(`   ❌ Error updating client options:`, error.message);
    }
}

async function completeSetup() {
    console.log('🚀 Starting complete multi-client setup...\n');
    console.log('═'.repeat(60));

    const envVars = [];
    const portalUrls = [];

    for (const client of CLIENTS) {
        console.log(`\n\n📦 Setting up ${client.name}...`);
        console.log('─'.repeat(60));

        // Create Slack channel
        const channelId = await createSlackChannel(client);

        if (channelId) {
            // Post and pin rules
            await postChannelRules(channelId, client.name);

            // Store env var
            const envVarName = `SLACK_SUPPORT_CHANNEL_${client.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
            envVars.push(`${envVarName}=${channelId}`);
        }

        // Create Notion portal page
        const portalPage = await createNotionPortalPage(client);

        if (portalPage) {
            portalUrls.push({
                client: client.name,
                url: portalPage.url,
            });
        }

        // Wait a bit between clients to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Update Notion client options
    await updateNotionClientOptions();

    // Print summary
    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('✅ SETUP COMPLETE!');
    console.log('═'.repeat(60));

    console.log('\n📋 Environment Variables to Add:');
    console.log('─'.repeat(60));
    envVars.forEach(envVar => console.log(envVar));

    console.log('\n\n🔗 Portal URLs:');
    console.log('─'.repeat(60));
    portalUrls.forEach(({ client, url }) => {
        console.log(`${client}: ${url}`);
    });

    console.log('\n\n📝 Next Steps:');
    console.log('─'.repeat(60));
    console.log('1. Copy the environment variables above to your .env file');
    console.log('2. Restart your bot to pick up the new configuration');
    console.log('3. Test by posting in each support channel and creating a ticket');
    console.log('4. Share the portal URLs with each client (read-only)');
    console.log('5. Create Notion views manually (Inbox, Triage Queue, etc.)');

    console.log('\n\n🎉 Your multi-client support system is ready!');
    console.log('═'.repeat(60));
}

// Run the setup
completeSetup().catch(error => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
});
