import type { AllMiddlewareArgs, SlackShortcutMiddlewareArgs } from '@slack/bolt';
import { getClientFromChannel } from '../config/index.js';

// Modal view for ticket creation
export function getTicketModal(
  channelId: string,
  messageTs: string,
  messageText: string
): any {
  const client = getClientFromChannel(channelId);

  return {
    type: 'modal',
    callback_id: 'ticket_submission',
    title: {
      type: 'plain_text',
      text: 'Create Ticket'
    },
    submit: {
      type: 'plain_text',
      text: 'Submit'
    },
    close: {
      type: 'plain_text',
      text: 'Cancel'
    },
    private_metadata: JSON.stringify({
      channel_id: channelId,
      message_ts: messageTs
    }),
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Original Message:*\n>${messageText.slice(0, 200)}${messageText.length > 200 ? '...' : ''}`
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'input',
        block_id: 'summary_block',
        element: {
          type: 'plain_text_input',
          action_id: 'summary_input',
          placeholder: {
            type: 'plain_text',
            text: 'Brief description of the issue'
          },
          initial_value: messageText.slice(0, 150)
        },
        label: {
          type: 'plain_text',
          text: 'Summary'
        }
      },
      {
        type: 'input',
        block_id: 'platform_block',
        element: {
          type: 'static_select',
          action_id: 'platform_select',
          initial_option: { text: { type: 'plain_text', text: client }, value: client },
          options: [
            { text: { type: 'plain_text', text: 'DSLV' }, value: 'DSLV' },
            { text: { type: 'plain_text', text: 'MsAudreysHouse' }, value: 'MsAudreysHouse' },
            { text: { type: 'plain_text', text: 'Direct Cuts' }, value: 'Direct Cuts' },
            { text: { type: 'plain_text', text: 'Strata Noble' }, value: 'Strata Noble' },
            { text: { type: 'plain_text', text: 'Other' }, value: 'Other' }
          ]
        },
        label: {
          type: 'plain_text',
          text: 'Platform'
        }
      },
      {
        type: 'input',
        block_id: 'category_block',
        element: {
          type: 'static_select',
          action_id: 'category_select',
          options: [
            { text: { type: 'plain_text', text: 'Bug' }, value: 'Bug' },
            { text: { type: 'plain_text', text: 'Feature' }, value: 'Feature' },
            { text: { type: 'plain_text', text: 'Billing' }, value: 'Billing' },
            { text: { type: 'plain_text', text: 'Access/Auth' }, value: 'Access/Auth' },
            { text: { type: 'plain_text', text: 'Data' }, value: 'Data' },
            { text: { type: 'plain_text', text: 'UX' }, value: 'UX' },
            { text: { type: 'plain_text', text: 'Question' }, value: 'Question' }
          ]
        },
        label: {
          type: 'plain_text',
          text: 'Category'
        }
      },
      {
        type: 'input',
        block_id: 'severity_block',
        element: {
          type: 'static_select',
          action_id: 'severity_select',
          initial_option: { text: { type: 'plain_text', text: 'S3 Medium' }, value: 'S3 Medium' },
          options: [
            { text: { type: 'plain_text', text: 'S1 Critical' }, value: 'S1 Critical' },
            { text: { type: 'plain_text', text: 'S2 High' }, value: 'S2 High' },
            { text: { type: 'plain_text', text: 'S3 Medium' }, value: 'S3 Medium' },
            { text: { type: 'plain_text', text: 'S4 Low' }, value: 'S4 Low' }
          ]
        },
        label: {
          type: 'plain_text',
          text: 'Severity'
        }
      },
      {
        type: 'input',
        block_id: 'impact_block',
        element: {
          type: 'static_select',
          action_id: 'impact_select',
          initial_option: { text: { type: 'plain_text', text: '5 - Moderate' }, value: '5' },
          options: [
            { text: { type: 'plain_text', text: '1 - Minimal' }, value: '1' },
            { text: { type: 'plain_text', text: '2' }, value: '2' },
            { text: { type: 'plain_text', text: '3' }, value: '3' },
            { text: { type: 'plain_text', text: '4' }, value: '4' },
            { text: { type: 'plain_text', text: '5 - Moderate' }, value: '5' },
            { text: { type: 'plain_text', text: '6' }, value: '6' },
            { text: { type: 'plain_text', text: '7' }, value: '7' },
            { text: { type: 'plain_text', text: '8' }, value: '8' },
            { text: { type: 'plain_text', text: '9' }, value: '9' },
            { text: { type: 'plain_text', text: '10 - Critical' }, value: '10' }
          ]
        },
        label: {
          type: 'plain_text',
          text: 'Impact (1-10)'
        }
      },
      {
        type: 'input',
        block_id: 'urgency_block',
        element: {
          type: 'static_select',
          action_id: 'urgency_select',
          initial_option: { text: { type: 'plain_text', text: '5 - Medium' }, value: '5' },
          options: [
            { text: { type: 'plain_text', text: '1 - Low' }, value: '1' },
            { text: { type: 'plain_text', text: '2' }, value: '2' },
            { text: { type: 'plain_text', text: '3' }, value: '3' },
            { text: { type: 'plain_text', text: '4' }, value: '4' },
            { text: { type: 'plain_text', text: '5 - Medium' }, value: '5' },
            { text: { type: 'plain_text', text: '6' }, value: '6' },
            { text: { type: 'plain_text', text: '7' }, value: '7' },
            { text: { type: 'plain_text', text: '8' }, value: '8' },
            { text: { type: 'plain_text', text: '9' }, value: '9' },
            { text: { type: 'plain_text', text: '10 - Urgent' }, value: '10' }
          ]
        },
        label: {
          type: 'plain_text',
          text: 'Urgency (1-10)'
        }
      },
      {
        type: 'input',
        block_id: 'effort_block',
        optional: true,
        element: {
          type: 'plain_text_input',
          action_id: 'effort_input',
          placeholder: {
            type: 'plain_text',
            text: 'Estimated effort (hours or points)'
          }
        },
        label: {
          type: 'plain_text',
          text: 'Effort Estimate'
        }
      }
    ]
  };
}

export async function handleCreateTicketShortcut(
  args: AllMiddlewareArgs & SlackShortcutMiddlewareArgs
): Promise<void> {
  const { shortcut, ack, client } = args;

  await ack();

  if (shortcut.type !== 'message_action') {
    return;
  }

  const messageAction = shortcut as any;
  const channelId = messageAction.channel.id;
  const messageTs = messageAction.message.ts;
  const messageText = messageAction.message.text || '';

  await client.views.open({
    trigger_id: shortcut.trigger_id,
    view: getTicketModal(channelId, messageTs, messageText)
  });
}
