/**
 * Check Slack Bot Scopes
 * Checks what permissions the bot currently has
 */

import { config } from 'dotenv';
import { WebClient } from '@slack/web-api';

config();

async function main() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error('SLACK_BOT_TOKEN not set');
    process.exit(1);
  }

  const slack = new WebClient(token);

  try {
    // Test auth
    const auth = await slack.auth.test();
    console.log('=== Slack Bot Info ===');
    console.log(`Bot User: ${auth.user}`);
    console.log(`Bot ID: ${auth.user_id}`);
    console.log(`Team: ${auth.team}`);
    console.log(`Team ID: ${auth.team_id}`);

    // Try to list channels to check read access
    console.log('\n=== Testing Permissions ===');

    try {
      const channels = await slack.conversations.list({
        types: 'public_channel',
        limit: 5,
      });
      console.log(`[OK] Can list channels (found ${channels.channels?.length || 0})`);
    } catch (e: any) {
      console.log(`[FAIL] Cannot list channels: ${e.data?.error || e.message}`);
    }

    // Try to get a specific channel
    const triageChannelId = process.env.SLACK_OPS_TRIAGE_CHANNEL_ID || 'C0A8451R1B8';
    try {
      const info = await slack.conversations.info({ channel: triageChannelId });
      console.log(`[OK] Can access channel info: #${(info.channel as any)?.name}`);
    } catch (e: any) {
      console.log(`[FAIL] Cannot get channel info: ${e.data?.error || e.message}`);
    }

    // Check if we can join channels
    try {
      // Try joining the triage channel (should work if already in or if we have permissions)
      await slack.conversations.join({ channel: triageChannelId });
      console.log(`[OK] Can join channels`);
    } catch (e: any) {
      if (e.data?.error === 'already_in_channel') {
        console.log(`[OK] Can join channels (already in triage channel)`);
      } else {
        console.log(`[FAIL] Cannot join channels: ${e.data?.error || e.message}`);
      }
    }

    // Check if we can post messages
    try {
      // We won't actually post, just check auth
      console.log(`[INFO] Message posting requires chat:write scope`);
    } catch (e: any) {
      console.log(`[FAIL] ${e.message}`);
    }

    console.log('\n=== Required Scopes for Full Functionality ===');
    console.log('The bot needs these scopes to create channels:');
    console.log('  - channels:manage (create/archive public channels)');
    console.log('  - channels:join (join public channels)');
    console.log('  - channels:read (view basic channel info)');
    console.log('  - chat:write (post messages)');
    console.log('  - pins:write (pin messages)');
    console.log('');
    console.log('To add scopes, go to:');
    console.log('  https://api.slack.com/apps -> Your App -> OAuth & Permissions');
    console.log('');
    console.log('After adding scopes, reinstall the app to your workspace.');

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

main();
