/**
 * Notion Setup Script for Client Ticket System
 *
 * This script:
 * 1. Verifies Notion connection and database access
 * 2. Creates standalone portal pages for DSLV and MsAudreysHouse
 * 3. Documents database views that need to be created manually
 *
 * Database ID: 2e613b42-8aa7-813d-81d6-cd4e0f8377a7
 */

import { config } from 'dotenv';
import { Client } from '@notionhq/client';

config();

const NOTION_DATABASE_ID = '2e613b42-8aa7-813d-81d6-cd4e0f8377a7';

interface SetupResult {
  databaseVerified: boolean;
  databaseParentId?: string;
  portalPages: {
    dslv?: { id: string; url: string };
    msAudreysHouse?: { id: string; url: string };
  };
  viewsToCreate: string[];
}

function getNotionClient(): Client {
  const token = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY;
  if (!token) {
    throw new Error('NOTION_TOKEN or NOTION_API_KEY environment variable is required');
  }
  return new Client({ auth: token });
}

async function verifyDatabase(notion: Client): Promise<{ verified: boolean; parentId?: string; parentType?: string }> {
  console.log('Verifying Notion database...');

  try {
    const database = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID,
    });

    console.log(`  Database: ${(database as any).title?.[0]?.plain_text || 'Untitled'}`);
    console.log(`  ID: ${database.id}`);

    // Get parent info for creating sibling pages
    const parent = (database as any).parent;
    let parentId: string | undefined;
    let parentType: string | undefined;

    if (parent.type === 'page_id') {
      parentId = parent.page_id;
      parentType = 'page';
      console.log(`  Parent Page ID: ${parentId}`);
    } else if (parent.type === 'workspace') {
      parentType = 'workspace';
      console.log(`  Parent: Workspace (root level)`);
    } else if (parent.type === 'block_id') {
      parentId = parent.block_id;
      parentType = 'block';
      console.log(`  Parent Block ID: ${parentId}`);
    }

    // List properties
    const properties = Object.keys((database as any).properties);
    console.log(`  Properties: ${properties.join(', ')}`);

    return { verified: true, parentId, parentType };
  } catch (error: any) {
    console.error(`  ERROR: ${error.message}`);
    return { verified: false };
  }
}

async function createPortalPage(
  notion: Client,
  clientName: string,
  parentPageId: string
): Promise<{ id: string; url: string }> {
  console.log(`\nCreating ${clientName} Portal page...`);

  const result = await notion.pages.create({
    parent: {
      type: 'page_id',
      page_id: parentPageId,
    },
    icon: {
      type: 'emoji',
      emoji: clientName === 'DSLV' ? '🏢' : '🏠',
    },
    properties: {
      title: {
        title: [
          {
            text: {
              content: `${clientName} Portal`,
            },
          },
        ],
      },
    },
    children: [
      {
        object: 'block',
        type: 'callout',
        callout: {
          icon: { type: 'emoji', emoji: '📋' },
          rich_text: [
            {
              type: 'text',
              text: {
                content: `Welcome to the ${clientName} Portal. Track your support tickets and request status here.`,
              },
            },
          ],
          color: 'blue_background',
        },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'How to Submit a Ticket' } }],
        },
      },
      {
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [
            { type: 'text', text: { content: 'Post your issue in the ' } },
            { type: 'text', text: { content: `#support-${clientName.toLowerCase()}` }, annotations: { code: true } },
            { type: 'text', text: { content: ' Slack channel' } },
          ],
        },
      },
      {
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [
            { type: 'text', text: { content: 'Use the ' } },
            { type: 'text', text: { content: '"Create Ticket"' }, annotations: { bold: true } },
            { type: 'text', text: { content: ' shortcut or ' } },
            { type: 'text', text: { content: '/ticket' }, annotations: { code: true } },
            { type: 'text', text: { content: ' command' } },
          ],
        },
      },
      {
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [
            { type: 'text', text: { content: 'Track your ticket status in this portal' } },
          ],
        },
      },
      {
        object: 'block',
        type: 'divider',
        divider: {},
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: `${clientName} Tickets` } }],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `Below is a linked view of all ${clientName} support tickets. After creating this page, add a linked database view filtered to Client = "${clientName}".`,
              },
              annotations: { italic: true, color: 'gray' },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          icon: { type: 'emoji', emoji: '⚠️' },
          rich_text: [
            {
              type: 'text',
              text: {
                content: `MANUAL STEP: Add a linked database view to "${NOTION_DATABASE_ID}" with filter: Client = "${clientName}"`,
              },
            },
          ],
          color: 'yellow_background',
        },
      },
      {
        object: 'block',
        type: 'divider',
        divider: {},
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Status Legend' } }],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            { type: 'text', text: { content: 'New' }, annotations: { bold: true } },
            { type: 'text', text: { content: ' - Ticket received, awaiting triage' } },
          ],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            { type: 'text', text: { content: 'Triaged' }, annotations: { bold: true } },
            { type: 'text', text: { content: ' - Assigned priority and scheduled for work' } },
          ],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            { type: 'text', text: { content: 'In Progress' }, annotations: { bold: true } },
            { type: 'text', text: { content: ' - Actively being worked on' } },
          ],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            { type: 'text', text: { content: 'Waiting on Client' }, annotations: { bold: true } },
            { type: 'text', text: { content: ' - We need information from you' } },
          ],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            { type: 'text', text: { content: 'Ready for Release' }, annotations: { bold: true } },
            { type: 'text', text: { content: ' - Fix complete, pending deployment' } },
          ],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            { type: 'text', text: { content: 'Released' }, annotations: { bold: true } },
            { type: 'text', text: { content: ' - Deployed to production' } },
          ],
        },
      },
    ],
  });

  const pageUrl = `https://notion.so/${result.id.replace(/-/g, '')}`;
  console.log(`  Created: ${pageUrl}`);

  return { id: result.id, url: pageUrl };
}

function printViewsToCreate(): string[] {
  const views = [
    {
      name: 'Inbox',
      filter: 'Status = "New"',
      sort: 'Created time descending',
    },
    {
      name: 'Triage Queue',
      filter: 'Status in ("New", "Triaged")',
      sort: 'Severity ascending, then Priority Score descending',
    },
    {
      name: 'This Week',
      filter: 'Release Window = "This Week" AND Status not in ("Released", "Won\'t Do")',
      sort: 'Priority Score descending',
    },
    {
      name: 'Waiting on Client',
      filter: 'Status = "Waiting on Client"',
      sort: 'Last Updated ascending',
    },
    {
      name: 'Blocked',
      filter: 'Status = "Blocked"',
      sort: 'Created time descending',
    },
    {
      name: 'Ready for Release',
      filter: 'Status = "Ready for Release"',
      sort: 'Priority Score descending',
    },
    {
      name: 'Released (Last 14 Days)',
      filter: 'Status = "Released" AND Released Date >= 14 days ago',
      sort: 'Released Date descending',
    },
    {
      name: 'Backlog',
      filter: 'Release Window = "Backlog" AND Status not in ("Released", "Won\'t Do")',
      sort: 'Priority Score descending',
    },
  ];

  console.log('\n=== DATABASE VIEWS TO CREATE MANUALLY ===\n');
  console.log('The Notion API does not support creating database views programmatically.');
  console.log('Please create these views in the Client Tickets database:\n');

  views.forEach((view, index) => {
    console.log(`${index + 1}. ${view.name}`);
    console.log(`   Filter: ${view.filter}`);
    console.log(`   Sort: ${view.sort}`);
    console.log('');
  });

  return views.map((v) => v.name);
}

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('NOTION SETUP - CLIENT TICKET SYSTEM');
  console.log('='.repeat(60));
  console.log(`\nDatabase ID: ${NOTION_DATABASE_ID}`);

  const result: SetupResult = {
    databaseVerified: false,
    portalPages: {},
    viewsToCreate: [],
  };

  try {
    const notion = getNotionClient();

    // Verify database and get parent
    const dbCheck = await verifyDatabase(notion);
    result.databaseVerified = dbCheck.verified;
    result.databaseParentId = dbCheck.parentId;

    if (!dbCheck.verified) {
      throw new Error('Database verification failed');
    }

    // Create portal pages if we have a parent page
    if (dbCheck.parentId && dbCheck.parentType === 'page') {
      console.log('\n=== CREATING PORTAL PAGES ===');

      try {
        result.portalPages.dslv = await createPortalPage(notion, 'DSLV', dbCheck.parentId);
      } catch (error: any) {
        console.error(`  ERROR creating DSLV Portal: ${error.message}`);
      }

      try {
        result.portalPages.msAudreysHouse = await createPortalPage(notion, 'MsAudreysHouse', dbCheck.parentId);
      } catch (error: any) {
        console.error(`  ERROR creating MsAudreysHouse Portal: ${error.message}`);
      }
    } else {
      console.log('\n=== CANNOT CREATE PORTAL PAGES ===');
      console.log('Database is at workspace root level or parent not accessible.');
      console.log('Portal pages must be created manually as siblings of the database.');
    }

    // Print views to create
    result.viewsToCreate = printViewsToCreate();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SETUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`\nDatabase Verified: ${result.databaseVerified ? 'YES' : 'NO'}`);

    if (result.portalPages.dslv) {
      console.log(`\nDSLV Portal:`);
      console.log(`  ID: ${result.portalPages.dslv.id}`);
      console.log(`  URL: ${result.portalPages.dslv.url}`);
    }

    if (result.portalPages.msAudreysHouse) {
      console.log(`\nMsAudreysHouse Portal:`);
      console.log(`  ID: ${result.portalPages.msAudreysHouse.id}`);
      console.log(`  URL: ${result.portalPages.msAudreysHouse.url}`);
    }

    console.log(`\nViews to Create Manually: ${result.viewsToCreate.length}`);
    result.viewsToCreate.forEach((v) => console.log(`  - ${v}`));

    console.log('\n' + '='.repeat(60));
    console.log('NEXT STEPS');
    console.log('='.repeat(60));
    console.log('\n1. Open the Client Tickets database in Notion');
    console.log('2. Create each view listed above using the filters specified');
    console.log('3. In each portal page, add a linked database view filtered by Client');
    console.log('4. Run the Slack channel setup: npm run setup:complete');
    console.log('');

  } catch (error: any) {
    console.error(`\n[ERROR] Setup failed: ${error.message}`);
    process.exit(1);
  }
}

main();
