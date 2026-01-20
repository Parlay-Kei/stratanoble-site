import { config } from 'dotenv';
import { z } from 'zod';

config();

const ConfigSchema = z.object({
  // Notion
  notionToken: z.string().min(1),
  notionDatabaseId: z.string().min(1),
  notionDslvPortalUrl: z.string().url().optional(),
  notionMsAudreysPortalUrl: z.string().url().optional(),
  notionSupportDeskUrl: z.string().url().optional(),

  // Slack
  slackBotToken: z.string().min(1),
  slackSigningSecret: z.string().min(1),
  slackAppToken: z.string().optional(),

  // Slack Channels
  slackSupportDslvChannelId: z.string().min(1),
  slackSupportMsAudreysChannelId: z.string().min(1),
  slackOpsTriageChannelId: z.string().min(1),
});

export type Config = z.infer<typeof ConfigSchema>;

function loadConfig(): Config {
  const rawConfig = {
    notionToken: process.env.NOTION_TOKEN,
    notionDatabaseId: process.env.NOTION_DATABASE_ID,
    notionDslvPortalUrl: process.env.NOTION_DSLV_PORTAL_URL,
    notionMsAudreysPortalUrl: process.env.NOTION_MSAUDREYS_PORTAL_URL,
    notionSupportDeskUrl: process.env.NOTION_SUPPORT_DESK_URL,
    slackBotToken: process.env.SLACK_BOT_TOKEN,
    slackSigningSecret: process.env.SLACK_SIGNING_SECRET,
    slackAppToken: process.env.SLACK_APP_TOKEN,
    slackSupportDslvChannelId: process.env.SLACK_SUPPORT_DSLV_CHANNEL_ID,
    slackSupportMsAudreysChannelId: process.env.SLACK_SUPPORT_MSAUDREYS_CHANNEL_ID,
    slackOpsTriageChannelId: process.env.SLACK_OPS_TRIAGE_CHANNEL_ID,
  };

  return ConfigSchema.parse(rawConfig);
}

export const appConfig = loadConfig();

// Channel to Client mapping
export const CHANNEL_CLIENT_MAP: Record<string, string> = {
  [appConfig.slackSupportDslvChannelId]: 'DSLV',
  [appConfig.slackSupportMsAudreysChannelId]: 'MsAudreysHouse',
};

export function getClientFromChannel(channelId: string): string {
  return CHANNEL_CLIENT_MAP[channelId] || 'Other';
}

export function getPortalUrl(client: string): string {
  switch (client) {
    case 'DSLV':
      return appConfig.notionDslvPortalUrl || '';
    case 'MsAudreysHouse':
      return appConfig.notionMsAudreysPortalUrl || '';
    default:
      return appConfig.notionSupportDeskUrl || '';
  }
}
