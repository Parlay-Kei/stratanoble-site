import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';

dotenv.config();

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

const CHANNELS = [
    { name: 'DSLV', id: 'C0A833HKC5T' },
    { name: 'MsAudreysHouse', id: 'C0A80521RGT' },
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

async function postAndPinRules() {
    console.log('📌 Posting and pinning channel rules...\n');

    for (const channel of CHANNELS) {
        try {
            console.log(`Processing #support-${channel.name.toLowerCase()}...`);

            // Post the rules message
            const result = await slack.chat.postMessage({
                channel: channel.id,
                text: CHANNEL_RULES,
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: `${channel.name} Support Channel`,
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

            console.log(`  ✅ Rules posted (ts: ${result.ts})`);

            // Pin the message
            await slack.pins.add({
                channel: channel.id,
                timestamp: result.ts,
            });

            console.log(`  ✅ Message pinned`);
            console.log();

        } catch (error) {
            console.error(`  ❌ Error for ${channel.name}:`, error.message);
            console.log();
        }
    }

    console.log('✅ All done! Channel rules posted and pinned.');
}

postAndPinRules().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
