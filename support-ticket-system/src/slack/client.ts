import { WebClient } from '@slack/web-api';
import { appConfig } from '../config/index.js';

let slackClient: WebClient | null = null;

export function getSlackClient(): WebClient {
  if (!slackClient) {
    slackClient = new WebClient(appConfig.slackBotToken);
  }
  return slackClient;
}

export function getTriageChannelId(): string {
  return appConfig.slackOpsTriageChannelId;
}
