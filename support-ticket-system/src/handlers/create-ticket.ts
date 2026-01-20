import type { AllMiddlewareArgs, SlackViewMiddlewareArgs } from '@slack/bolt';
import { createTicket } from '../notion/tickets.js';
import { getClientFromChannel } from '../config/index.js';
import type { CreateTicketInput } from '../notion/types.js';

interface ModalMetadata {
  channel_id: string;
  message_ts: string;
}

export async function handleTicketSubmission(
  args: AllMiddlewareArgs & SlackViewMiddlewareArgs
): Promise<void> {
  const { ack, view, client } = args;

  // Acknowledge immediately
  await ack();

  // Parse view state
  const values = view.state.values;
  const metadata: ModalMetadata = JSON.parse(view.private_metadata || '{}');

  // Extract form values
  const summary = values.summary_block?.summary_input?.value || '';
  const platform = values.platform_block?.platform_select?.selected_option?.value || 'Other';
  const category = values.category_block?.category_select?.selected_option?.value || 'Question';
  const severity = values.severity_block?.severity_select?.selected_option?.value || 'S3 Medium';
  const impact = parseInt(values.impact_block?.impact_select?.selected_option?.value || '5', 10);
  const urgency = parseInt(values.urgency_block?.urgency_select?.selected_option?.value || '5', 10);
  const effortStr = values.effort_block?.effort_input?.value || '0';
  const effort = parseInt(effortStr, 10) || 0;

  // Get client from channel
  const channelId = metadata.channel_id;
  const messageTs = metadata.message_ts;
  const ticketClient = getClientFromChannel(channelId);

  // Get Slack permalink if we have message info
  let slackPermalink: string | undefined;
  if (channelId && messageTs) {
    try {
      const result = await client.chat.getPermalink({
        channel: channelId,
        message_ts: messageTs
      });
      slackPermalink = result.permalink;
    } catch (e) {
      console.error('Failed to get permalink:', e);
    }
  }

  // Create ticket input
  const ticketInput: CreateTicketInput = {
    summary,
    client: ticketClient as any,
    platform: platform as any,
    category: category as any,
    severity: severity as any,
    impact,
    urgency,
    effort,
    slackPermalink
  };

  try {
    // Create ticket in Notion
    const ticket = await createTicket(ticketInput);

    // Post confirmation to Slack channel/thread
    if (channelId) {
      await client.chat.postMessage({
        channel: channelId,
        thread_ts: messageTs || undefined,
        text: `Ticket created: ${ticket.notionUrl}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Ticket created: <${ticket.notionUrl}|${ticket.title}>\n*Client:* ${ticket.client} | *Severity:* ${ticket.severity} | *Status:* ${ticket.status}`
            }
          }
        ]
      });

      // Add reaction to original message if we have it
      if (messageTs) {
        try {
          await client.reactions.add({
            channel: channelId,
            timestamp: messageTs,
            name: 'ticket'
          });
        } catch (e) {
          // Reaction may already exist or emoji not available
        }
      }
    }

    console.log(`Ticket created: ${ticket.id} - ${ticket.title}`);
  } catch (error) {
    console.error('Failed to create ticket:', error);

    // Notify user of failure
    if (channelId) {
      await client.chat.postMessage({
        channel: channelId,
        thread_ts: messageTs || undefined,
        text: `Failed to create ticket. Please try again or contact support.`
      });
    }
  }
}
