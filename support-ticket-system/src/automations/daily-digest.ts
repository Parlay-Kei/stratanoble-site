import { getSlackClient, getTriageChannelId } from '../slack/client.js';
import { generateDigestReport } from '../notion/tickets.js';
import type { DigestReport, Ticket } from '../notion/types.js';

export async function postDailyDigest(): Promise<void> {
  const slackClient = getSlackClient();
  const triageChannelId = getTriageChannelId();

  // Generate the report
  const report = await generateDigestReport();

  // Format and post
  const blocks = formatDigestBlocks(report);

  await slackClient.chat.postMessage({
    channel: triageChannelId,
    text: `Daily Triage Digest - ${report.date}`,
    blocks
  });

  console.log(`Daily digest posted to ${triageChannelId}`);
}

function formatDigestBlocks(report: DigestReport): any[] {
  const formattedDate = new Date(report.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Build new tickets by client section
  const newTicketsText = Object.entries(report.newTicketsByClient)
    .filter(([_, count]) => count > 0)
    .map(([client, count]) => `- ${client}: ${count}`)
    .join('\n') || '- No new tickets';

  // Build top priority tickets section
  const topTicketsText = report.topPriorityTickets.length > 0
    ? report.topPriorityTickets
        .map((t, i) => `${i + 1}. <${t.notionUrl}|${t.title}> - ${t.client} - ${t.severity} - Score: ${t.priorityScore}`)
        .join('\n')
    : '- No tickets in triage queue';

  // Build waiting on client section
  const waitingText = report.waitingOnClientOld.length > 0
    ? report.waitingOnClientOld
        .map(t => {
          const waitingSince = new Date(t.lastEditedTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return `- <${t.notionUrl}|${t.title}> - ${t.client} - Since ${waitingSince}`;
        })
        .join('\n')
    : '- None';

  // Build ready for release section
  const readyText = report.readyForRelease.length > 0
    ? report.readyForRelease
        .map(t => `- <${t.notionUrl}|${t.title}> - ${t.client}`)
        .join('\n')
    : '- None';

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `Daily Triage Digest - ${formattedDate}`,
        emoji: false
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*New Tickets by Client*\n${newTicketsText}`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Top 5 Priority Tickets*\n${topTicketsText}`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Waiting on Client (>3 days)*\n${waitingText}`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Ready for Release*\n${readyText}`
      }
    }
  ];
}

// Run directly if executed as script
if (import.meta.url === `file://${process.argv[1]}`) {
  postDailyDigest()
    .then(() => {
      console.log('Daily digest completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Daily digest failed:', error);
      process.exit(1);
    });
}
