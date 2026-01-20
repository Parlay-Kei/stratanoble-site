/**
 * Add MsAudreysHouse to Platform property options
 */

import { config } from 'dotenv';
import { Client } from '@notionhq/client';

config();

const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || '2e613b42-8aa7-813d-81d6-cd4e0f8377a7';

async function main() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  console.log('Adding MsAudreysHouse to Platform options...');

  const database = await notion.databases.retrieve({
    database_id: NOTION_DATABASE_ID
  });

  const platformProp = database.properties['Platform'] as any;
  const currentOptions = platformProp?.select?.options || [];

  const hasOption = currentOptions.some((opt: any) => opt.name === 'MsAudreysHouse');

  if (hasOption) {
    console.log('MsAudreysHouse already exists in Platform options');
    return;
  }

  const updatedOptions = [
    ...currentOptions.map((opt: any) => ({ name: opt.name, color: opt.color })),
    { name: 'MsAudreysHouse', color: 'purple' }
  ];

  await notion.databases.update({
    database_id: NOTION_DATABASE_ID,
    properties: {
      'Platform': {
        select: {
          options: updatedOptions
        }
      }
    }
  });

  console.log('MsAudreysHouse added to Platform options successfully!');
}

main().catch(console.error);
