import { Client } from '@notionhq/client';
import { appConfig } from '../config/index.js';

let notionClient: Client | null = null;

export function getNotionClient(): Client {
  if (!notionClient) {
    notionClient = new Client({
      auth: appConfig.notionToken,
    });
  }
  return notionClient;
}

export function getDatabaseId(): string {
  return appConfig.notionDatabaseId;
}
