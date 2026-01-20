import { App } from '@slack/bolt';
import cron from 'node-cron';
import { appConfig } from './config/index.js';
import { handleCreateTicketShortcut } from './slack/shortcuts.js';
import { handleTicketCommand } from './slack/commands.js';
import { handleTicketSubmission } from './handlers/create-ticket.js';
import { postDailyDigest } from './automations/daily-digest.js';

// Initialize Slack Bolt app
const app = new App({
  token: appConfig.slackBotToken,
  signingSecret: appConfig.slackSigningSecret,
  ...(appConfig.slackAppToken && {
    socketMode: true,
    appToken: appConfig.slackAppToken,
  }),
});

// Register message shortcut handler
app.shortcut('create_ticket', handleCreateTicketShortcut);

// Register slash command handler
app.command('/ticket', handleTicketCommand);

// Register view submission handler
app.view('ticket_submission', handleTicketSubmission);

// Schedule daily digest (weekdays at 9:00 AM)
// Cron format: minute hour day-of-month month day-of-week
cron.schedule('0 9 * * 1-5', async () => {
  console.log('Running daily digest...');
  try {
    await postDailyDigest();
    console.log('Daily digest completed');
  } catch (error) {
    console.error('Daily digest failed:', error);
  }
});

// Start the app
async function start() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  await app.start(port);
  console.log(`Support Ticket System running on port ${port}`);
  console.log('Daily digest scheduled for weekdays at 9:00 AM');
}

start().catch((error) => {
  console.error('Failed to start:', error);
  process.exit(1);
});
