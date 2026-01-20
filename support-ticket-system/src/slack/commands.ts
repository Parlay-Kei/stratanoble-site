import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getTicketModal } from './shortcuts.js';

export async function handleTicketCommand(
  args: AllMiddlewareArgs & SlackCommandMiddlewareArgs
): Promise<void> {
  const { command, ack, client } = args;

  await ack();

  const channelId = command.channel_id;
  const messageText = command.text || 'New ticket from /ticket command';

  // For slash command, we create a minimal context
  // In production, you might want to handle this differently
  await client.views.open({
    trigger_id: command.trigger_id,
    view: getTicketModal(channelId, '', messageText)
  });
}
