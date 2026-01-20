import { WebClient } from '@slack/web-api';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Existing channels from your output
const EXISTING_CHANNELS = {
    DSLV: 'C0A833HKC5T',
    MsAudreysHouse: 'C0A80521RGT',
};

const CLIENTS = [
    { name: 'DSLV', channelId: 'C0A833HKC5T' },
    { name: 'MsAudreysHouse', channelId: 'C0A80521RGT' },
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

async function postChannelRules(channelId, clientName) {
    try {
        console.log(`\n📌 Posting rules to #support-${clientName.toLowerCase()}...`);

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

        // Create portal page - simplified, no properties that might cause issues
        const page = await notion.pages.create({
            parent: {
                type: 'page_id',
                page_id: supportDeskPageId,
            },
            properties: {
                title: {
                    title: [
                        {
                            type: 'text',
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
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [
                            {
                                type: 'text',
                                text: {
                                    content: 'To add your tickets here:',
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
                                    content: `Type /linked and select "Client Tickets"`,
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
                                    content: `Add filter: Client = ${client.name}`,
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
        console.error(`   ❌ Error creating portal page:`, error);
        console.error(`   Error details:`, error.body || error.message);
        return null;
    }
}

async function updateNotionClientOptions() {
    try {
        console.log(`\n🔄 Updating Client property options in Notion...`);

        const databaseId = process.env.NOTION_DATABASE_ID;

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

async function finishSetup() {
    console.log('🚀 Finishing setup for existing channels...\n');
    console.log('═'.repeat(60));

    const portalUrls = [];

    // Post rules to existing channels
    for (const client of CLIENTS) {
        await postChannelRules(client.channelId, client.name);
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Create portal pages
    for (const client of CLIENTS) {
        const portalPage = await createNotionPortalPage(client);

        if (portalPage) {
            portalUrls.push({
                client: client.name,
                url: portalPage.url,
            });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Update Notion client options
    await updateNotionClientOptions();

    // Print summary
    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('✅ SETUP COMPLETE!');
    console.log('═'.repeat(60));

    console.log('\n📋 Environment Variables to Add to .env:');
    console.log('─'.repeat(60));
    console.log(`SLACK_SUPPORT_CHANNEL_DSLV=${EXISTING_CHANNELS.DSLV}`);
    console.log(`SLACK_SUPPORT_CHANNEL_MSAUDREYSHOUSE=${EXISTING_CHANNELS.MsAudreysHouse}`);

    console.log('\n\n🔗 Portal URLs:');
    console.log('─'.repeat(60));
    portalUrls.forEach(({ client, url }) => {
        console.log(`${client}: ${url}`);
    });

    console.log('\n\n📝 Next Steps:');
    console.log('─'.repeat(60));
    console.log('1. Copy the environment variables above to your .env file');
    console.log('2. Restart your bot to pick up the new configuration');
    console.log('3. In each portal page, add a linked database view:');
    console.log('   - Type /linked → Select "Client Tickets"');
    console.log('   - Add filter: Client = [Client Name]');
    console.log('4. Test by posting in each support channel and creating a ticket');
    console.log('5. Share the portal URLs with each client (read-only)');
    console.log('6. Create Notion views manually (see MANUAL-SETUP-STEPS.md)');

    console.log('\n\n🎉 Your multi-client support system is ready!');
    console.log('═'.repeat(60));
}

// Run the setup
finishSetup().catch(error => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
});
