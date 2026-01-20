import pkg from '@slack/bolt';
const { App } = pkg;
import { Client } from '@notionhq/client';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Initialize Slack app
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.PORT || 3000,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const SUPPORT_CHANNEL_ID = process.env.SLACK_SUPPORT_CHANNEL_ID;
const TRIAGE_CHANNEL_ID = process.env.SLACK_TRIAGE_CHANNEL_ID;

/**
 * Create a ticket in Notion from Slack data
 */
async function createNotionTicket(ticketData) {
    try {
        const page = await notion.pages.create({
            parent: {
                database_id: DATABASE_ID,
            },
            properties: {
                'Ticket': {
                    title: [
                        {
                            text: {
                                content: ticketData.summary || 'Untitled Ticket',
                            },
                        },
                    ],
                },
                'Client': ticketData.client ? {
                    select: {
                        name: ticketData.client,
                    },
                } : undefined,
                'Platform': ticketData.platform ? {
                    select: {
                        name: ticketData.platform,
                    },
                } : undefined,
                'Category': ticketData.category ? {
                    select: {
                        name: ticketData.category,
                    },
                } : undefined,
                'Severity': ticketData.severity ? {
                    select: {
                        name: ticketData.severity,
                    },
                } : undefined,
                'Status': {
                    status: {
                        name: 'New',
                    },
                },
                'Impact': ticketData.impact ? {
                    number: parseInt(ticketData.impact),
                } : undefined,
                'Urgency': ticketData.urgency ? {
                    number: parseInt(ticketData.urgency),
                } : undefined,
                'Effort': ticketData.effort ? {
                    number: parseInt(ticketData.effort),
                } : undefined,
                'Intake Source': {
                    select: {
                        name: 'Slack',
                    },
                },
                'Message Permalink': ticketData.permalink ? {
                    url: ticketData.permalink,
                } : undefined,
                'Slack Thread': ticketData.threadTs ? {
                    url: ticketData.permalink,
                } : undefined,
                'Release Window': {
                    select: {
                        name: 'Next Patch',
                    },
                },
            },
        });

        return page;
    } catch (error) {
        console.error('Error creating Notion ticket:', error);
        throw error;
    }
}

/**
 * Message shortcut: Create Ticket
 * Triggered when user uses the "Create Ticket" message action
 */
app.shortcut('create_ticket', async ({ shortcut, ack, client }) => {
    await ack();

    try {
        // Get the message permalink
        const permalink = await client.chat.getPermalink({
            channel: shortcut.channel.id,
            message_ts: shortcut.message_ts,
        });

        // Open modal for ticket details
        await client.views.open({
            trigger_id: shortcut.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'ticket_modal',
                private_metadata: JSON.stringify({
                    channel: shortcut.channel.id,
                    messageTs: shortcut.message_ts,
                    permalink: permalink.permalink,
                    messageText: shortcut.message.text || '',
                }),
                title: {
                    type: 'plain_text',
                    text: 'Create Support Ticket',
                },
                submit: {
                    type: 'plain_text',
                    text: 'Create',
                },
                blocks: [
                    {
                        type: 'input',
                        block_id: 'summary',
                        element: {
                            type: 'plain_text_input',
                            action_id: 'summary_input',
                            placeholder: {
                                type: 'plain_text',
                                text: 'Brief one-sentence summary',
                            },
                        },
                        label: {
                            type: 'plain_text',
                            text: 'Summary',
                        },
                    },
                    {
                        type: 'input',
                        block_id: 'client',
                        element: {
                            type: 'static_select',
                            action_id: 'client_select',
                            placeholder: {
                                type: 'plain_text',
                                text: 'Select client',
                            },
                            options: [
                                { text: { type: 'plain_text', text: 'Client A' }, value: 'Client A' },
                                { text: { type: 'plain_text', text: 'Client B' }, value: 'Client B' },
                                { text: { type: 'plain_text', text: 'Client C' }, value: 'Client C' },
                                // Add more clients as needed
                            ],
                        },
                        label: {
                            type: 'plain_text',
                            text: 'Client',
                        },
                    },
                    {
                        type: 'input',
                        block_id: 'platform',
                        element: {
                            type: 'static_select',
                            action_id: 'platform_select',
                            placeholder: {
                                type: 'plain_text',
                                text: 'Select platform',
                            },
                            options: [
                                { text: { type: 'plain_text', text: 'Direct Cuts' }, value: 'Direct Cuts' },
                                { text: { type: 'plain_text', text: 'DSLV' }, value: 'DSLV' },
                                { text: { type: 'plain_text', text: 'Strata Noble' }, value: 'Strata Noble' },
                                { text: { type: 'plain_text', text: 'Other' }, value: 'Other' },
                            ],
                        },
                        label: {
                            type: 'plain_text',
                            text: 'Platform',
                        },
                    },
                    {
                        type: 'input',
                        block_id: 'category',
                        element: {
                            type: 'static_select',
                            action_id: 'category_select',
                            placeholder: {
                                type: 'plain_text',
                                text: 'Select category',
                            },
                            options: [
                                { text: { type: 'plain_text', text: 'Bug' }, value: 'Bug' },
                                { text: { type: 'plain_text', text: 'Feature' }, value: 'Feature' },
                                { text: { type: 'plain_text', text: 'Billing' }, value: 'Billing' },
                                { text: { type: 'plain_text', text: 'Access/Auth' }, value: 'Access/Auth' },
                                { text: { type: 'plain_text', text: 'Data' }, value: 'Data' },
                                { text: { type: 'plain_text', text: 'UX' }, value: 'UX' },
                                { text: { type: 'plain_text', text: 'Question' }, value: 'Question' },
                            ],
                        },
                        label: {
                            type: 'plain_text',
                            text: 'Category',
                        },
                    },
                    {
                        type: 'input',
                        block_id: 'severity',
                        element: {
                            type: 'static_select',
                            action_id: 'severity_select',
                            placeholder: {
                                type: 'plain_text',
                                text: 'Select severity',
                            },
                            options: [
                                { text: { type: 'plain_text', text: 'S1 Critical' }, value: 'S1 Critical' },
                                { text: { type: 'plain_text', text: 'S2 High' }, value: 'S2 High' },
                                { text: { type: 'plain_text', text: 'S3 Medium' }, value: 'S3 Medium' },
                                { text: { type: 'plain_text', text: 'S4 Low' }, value: 'S4 Low' },
                            ],
                        },
                        label: {
                            type: 'plain_text',
                            text: 'Severity',
                        },
                    },
                    {
                        type: 'input',
                        block_id: 'impact',
                        element: {
                            type: 'static_select',
                            action_id: 'impact_select',
                            placeholder: {
                                type: 'plain_text',
                                text: 'Select impact (1-5)',
                            },
                            options: [
                                { text: { type: 'plain_text', text: '1 - Minimal' }, value: '1' },
                                { text: { type: 'plain_text', text: '2 - Low' }, value: '2' },
                                { text: { type: 'plain_text', text: '3 - Medium' }, value: '3' },
                                { text: { type: 'plain_text', text: '4 - High' }, value: '4' },
                                { text: { type: 'plain_text', text: '5 - Critical' }, value: '5' },
                            ],
                        },
                        label: {
                            type: 'plain_text',
                            text: 'Impact',
                        },
                    },
                    {
                        type: 'input',
                        block_id: 'urgency',
                        element: {
                            type: 'static_select',
                            action_id: 'urgency_select',
                            placeholder: {
                                type: 'plain_text',
                                text: 'Select urgency (1-5)',
                            },
                            options: [
                                { text: { type: 'plain_text', text: '1 - Can wait' }, value: '1' },
                                { text: { type: 'plain_text', text: '2 - Low urgency' }, value: '2' },
                                { text: { type: 'plain_text', text: '3 - Moderate' }, value: '3' },
                                { text: { type: 'plain_text', text: '4 - Urgent' }, value: '4' },
                                { text: { type: 'plain_text', text: '5 - Immediate' }, value: '5' },
                            ],
                        },
                        label: {
                            type: 'plain_text',
                            text: 'Urgency',
                        },
                    },
                    {
                        type: 'input',
                        block_id: 'effort',
                        element: {
                            type: 'static_select',
                            action_id: 'effort_select',
                            placeholder: {
                                type: 'plain_text',
                                text: 'Select effort (1-5)',
                            },
                            options: [
                                { text: { type: 'plain_text', text: '1 - Trivial' }, value: '1' },
                                { text: { type: 'plain_text', text: '2 - Small' }, value: '2' },
                                { text: { type: 'plain_text', text: '3 - Medium' }, value: '3' },
                                { text: { type: 'plain_text', text: '4 - Large' }, value: '4' },
                                { text: { type: 'plain_text', text: '5 - Very Large' }, value: '5' },
                            ],
                        },
                        label: {
                            type: 'plain_text',
                            text: 'Effort',
                        },
                    },
                ],
            },
        });
    } catch (error) {
        console.error('Error opening modal:', error);
    }
});

/**
 * Handle ticket modal submission
 */
app.view('ticket_modal', async ({ ack, body, view, client }) => {
    await ack();

    try {
        const metadata = JSON.parse(view.private_metadata);
        const values = view.state.values;

        const ticketData = {
            summary: values.summary.summary_input.value,
            client: values.client.client_select.selected_option?.value,
            platform: values.platform.platform_select.selected_option?.value,
            category: values.category.category_select.selected_option?.value,
            severity: values.severity.severity_select.selected_option?.value,
            impact: values.impact.impact_select.selected_option?.value,
            urgency: values.urgency.urgency_select.selected_option?.value,
            effort: values.effort.effort_select.selected_option?.value,
            permalink: metadata.permalink,
            threadTs: metadata.messageTs,
        };

        // Create ticket in Notion
        const notionPage = await createNotionTicket(ticketData);

        // Post confirmation in Slack
        await client.chat.postMessage({
            channel: metadata.channel,
            thread_ts: metadata.messageTs,
            text: `✅ Ticket created: ${notionPage.url}`,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `✅ *Ticket Created*\n*Summary:* ${ticketData.summary}\n*Platform:* ${ticketData.platform}\n*Severity:* ${ticketData.severity}`,
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `<${notionPage.url}|View in Notion →>`,
                    },
                },
            ],
        });

        console.log(`✅ Ticket created: ${notionPage.id}`);
    } catch (error) {
        console.error('Error creating ticket:', error);

        // Notify user of error
        await client.chat.postEphemeral({
            channel: body.user.id,
            user: body.user.id,
            text: `❌ Error creating ticket: ${error.message}`,
        });
    }
});

/**
 * Slash command: /ticket
 * Alternative lightweight intake method
 */
app.command('/ticket', async ({ command, ack, client }) => {
    await ack();

    try {
        // Open the same modal as the shortcut
        await client.views.open({
            trigger_id: command.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'ticket_modal',
                private_metadata: JSON.stringify({
                    channel: command.channel_id,
                    messageTs: null,
                    permalink: null,
                    messageText: command.text || '',
                }),
                title: {
                    type: 'plain_text',
                    text: 'Create Support Ticket',
                },
                submit: {
                    type: 'plain_text',
                    text: 'Create',
                },
                blocks: [
                    // Same blocks as shortcut modal
                    {
                        type: 'input',
                        block_id: 'summary',
                        element: {
                            type: 'plain_text_input',
                            action_id: 'summary_input',
                            placeholder: {
                                type: 'plain_text',
                                text: 'Brief one-sentence summary',
                            },
                            initial_value: command.text || '',
                        },
                        label: {
                            type: 'plain_text',
                            text: 'Summary',
                        },
                    },
                    // ... (rest of the blocks same as above)
                ],
            },
        });
    } catch (error) {
        console.error('Error handling /ticket command:', error);
    }
});

/**
 * Daily triage digest
 * Posts summary of new tickets and items needing attention
 */
async function sendDailyDigest() {
    try {
        console.log('📊 Generating daily triage digest...');

        // Query Notion for new tickets
        const newTickets = await notion.databases.query({
            database_id: DATABASE_ID,
            filter: {
                property: 'Status',
                status: {
                    equals: 'New',
                },
            },
        });

        // Query for tickets waiting on client > 3 days
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const waitingTickets = await notion.databases.query({
            database_id: DATABASE_ID,
            filter: {
                property: 'Status',
                status: {
                    equals: 'Waiting on Client',
                },
            },
        });

        // Query for ready for release
        const readyTickets = await notion.databases.query({
            database_id: DATABASE_ID,
            filter: {
                property: 'Status',
                status: {
                    equals: 'Ready for Release',
                },
            },
        });

        // Build digest message
        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '📋 Daily Triage Digest',
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*New Tickets:* ${newTickets.results.length}`,
                },
            },
        ];

        // Add top 5 new tickets
        if (newTickets.results.length > 0) {
            blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*Top Priority New Tickets:*',
                },
            });

            newTickets.results.slice(0, 5).forEach((ticket) => {
                const title = ticket.properties.Ticket?.title?.[0]?.text?.content || 'Untitled';
                const severity = ticket.properties.Severity?.select?.name || 'N/A';
                const platform = ticket.properties.Platform?.select?.name || 'N/A';

                blocks.push({
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `• <${ticket.url}|${title}> - ${severity} - ${platform}`,
                    },
                });
            });
        }

        // Add waiting on client section
        if (waitingTickets.results.length > 0) {
            blocks.push(
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*⏳ Waiting on Client:* ${waitingTickets.results.length} tickets`,
                    },
                }
            );
        }

        // Add ready for release section
        if (readyTickets.results.length > 0) {
            blocks.push(
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*🚀 Ready for Release:* ${readyTickets.results.length} tickets`,
                    },
                }
            );
        }

        // Send to triage channel
        await app.client.chat.postMessage({
            channel: TRIAGE_CHANNEL_ID,
            text: 'Daily Triage Digest',
            blocks,
        });

        console.log('✅ Daily digest sent');
    } catch (error) {
        console.error('Error sending daily digest:', error);
    }
}

/**
 * Weekly shipped summary
 * Posts list of tickets released this week
 */
async function sendWeeklySummary() {
    try {
        console.log('📦 Generating weekly shipped summary...');

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const releasedTickets = await notion.databases.query({
            database_id: DATABASE_ID,
            filter: {
                property: 'Status',
                status: {
                    equals: 'Released',
                },
            },
        });

        // Group by platform
        const byPlatform = {};
        releasedTickets.results.forEach((ticket) => {
            const platform = ticket.properties.Platform?.select?.name || 'Other';
            if (!byPlatform[platform]) {
                byPlatform[platform] = [];
            }
            byPlatform[platform].push(ticket);
        });

        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: '🎉 Weekly Shipped Summary',
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Total Released:* ${releasedTickets.results.length} tickets`,
                },
            },
        ];

        // Add tickets by platform
        Object.keys(byPlatform).forEach((platform) => {
            blocks.push(
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*${platform}*`,
                    },
                }
            );

            byPlatform[platform].forEach((ticket) => {
                const title = ticket.properties.Ticket?.title?.[0]?.text?.content || 'Untitled';
                blocks.push({
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `• <${ticket.url}|${title}>`,
                    },
                });
            });
        });

        await app.client.chat.postMessage({
            channel: TRIAGE_CHANNEL_ID,
            text: 'Weekly Shipped Summary',
            blocks,
        });

        console.log('✅ Weekly summary sent');
    } catch (error) {
        console.error('Error sending weekly summary:', error);
    }
}

/**
 * Schedule automated digests
 */
function scheduleAutomations() {
    // Daily digest - weekday mornings at 9 AM
    const dailyCron = process.env.DAILY_DIGEST_CRON || '0 9 * * 1-5';
    cron.schedule(dailyCron, sendDailyDigest, {
        timezone: process.env.TIMEZONE || 'America/Los_Angeles',
    });
    console.log(`📅 Daily digest scheduled: ${dailyCron}`);

    // Weekly summary - Friday afternoons at 4 PM
    const weeklyCron = process.env.WEEKLY_SUMMARY_CRON || '0 16 * * 5';
    cron.schedule(weeklyCron, sendWeeklySummary, {
        timezone: process.env.TIMEZONE || 'America/Los_Angeles',
    });
    console.log(`📅 Weekly summary scheduled: ${weeklyCron}`);
}

/**
 * Start the app
 */
(async () => {
    try {
        await app.start();
        console.log('⚡️ Support Ticket Bot is running!');

        // Schedule automations
        scheduleAutomations();

        console.log('\n✅ System ready:');
        console.log('  - Message shortcut: "Create Ticket"');
        console.log('  - Slash command: /ticket');
        console.log('  - Daily digest scheduled');
        console.log('  - Weekly summary scheduled');
    } catch (error) {
        console.error('❌ Error starting app:', error);
        process.exit(1);
    }
})();

// Export for testing
export { createNotionTicket, sendDailyDigest, sendWeeklySummary };
