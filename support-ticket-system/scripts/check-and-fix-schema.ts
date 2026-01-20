/**
 * Check and Fix Database Schema
 *
 * This script checks the current Notion database schema and adds missing properties.
 */

import { config } from 'dotenv';
import { Client } from '@notionhq/client';

config();

const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || '2e613b42-8aa7-813d-81d6-cd4e0f8377a7';

function getNotionClient(): Client {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error('NOTION_TOKEN environment variable is required');
  }
  return new Client({ auth: token });
}

async function main(): Promise<void> {
  const notion = getNotionClient();

  console.log('=== Checking Notion Database Schema ===\n');
  console.log(`Database ID: ${NOTION_DATABASE_ID}\n`);

  // Retrieve database schema
  const database = await notion.databases.retrieve({
    database_id: NOTION_DATABASE_ID
  });

  console.log('Database Title:', (database as any).title?.[0]?.plain_text || 'Untitled');
  console.log('\n--- Current Properties ---\n');

  const properties = database.properties;
  const propertyNames = Object.keys(properties);

  propertyNames.forEach(name => {
    const prop = properties[name];
    console.log(`${name}: ${prop.type}`);

    // Show options for select/multi-select/status properties
    if (prop.type === 'select' && (prop as any).select?.options) {
      const options = (prop as any).select.options.map((o: any) => o.name);
      console.log(`  Options: ${options.join(', ')}`);
    }
    if (prop.type === 'multi_select' && (prop as any).multi_select?.options) {
      const options = (prop as any).multi_select.options.map((o: any) => o.name);
      console.log(`  Options: ${options.join(', ')}`);
    }
    if (prop.type === 'status' && (prop as any).status?.options) {
      const options = (prop as any).status.options.map((o: any) => o.name);
      console.log(`  Options: ${options.join(', ')}`);
    }
  });

  // Check for missing required properties
  const requiredProperties = [
    'Ticket',     // title
    'Client',     // select
    'Status',     // status or select
    'Severity',   // select
    'Category',   // select
    'Platform',   // select
    'Impact',     // number
    'Urgency',    // number
    'Effort',     // number
    'Priority Score',  // formula
    'Owner',      // person
    'Intake Source',   // select
    'Slack Permalink', // url
    'Release Window',  // select
    'Due Date',   // date
    'Notes'       // rich_text
  ];

  console.log('\n--- Property Check ---\n');

  const missingProperties: string[] = [];
  requiredProperties.forEach(prop => {
    const exists = propertyNames.some(p => p.toLowerCase() === prop.toLowerCase());
    const status = exists ? 'FOUND' : 'MISSING';
    console.log(`${prop}: ${status}`);
    if (!exists) {
      missingProperties.push(prop);
    }
  });

  if (missingProperties.length > 0) {
    console.log('\n--- Adding Missing Properties ---\n');

    // Build properties update object
    const propertiesToAdd: any = {};

    if (missingProperties.includes('Status')) {
      // Note: We'll add as select since status type has restrictions
      propertiesToAdd['Status'] = {
        select: {
          options: [
            { name: 'New', color: 'gray' },
            { name: 'Triaged', color: 'blue' },
            { name: 'In Progress', color: 'yellow' },
            { name: 'Blocked', color: 'red' },
            { name: 'Waiting on Client', color: 'orange' },
            { name: 'Ready for Release', color: 'green' },
            { name: 'Released', color: 'green' },
            { name: "Won't Do", color: 'gray' }
          ]
        }
      };
      console.log('Adding Status property as select type...');
    }

    if (missingProperties.includes('Severity')) {
      propertiesToAdd['Severity'] = {
        select: {
          options: [
            { name: 'S1 Critical', color: 'red' },
            { name: 'S2 High', color: 'orange' },
            { name: 'S3 Medium', color: 'yellow' },
            { name: 'S4 Low', color: 'gray' }
          ]
        }
      };
      console.log('Adding Severity property...');
    }

    if (missingProperties.includes('Category')) {
      propertiesToAdd['Category'] = {
        select: {
          options: [
            { name: 'Bug', color: 'red' },
            { name: 'Feature', color: 'blue' },
            { name: 'Billing', color: 'purple' },
            { name: 'Access/Auth', color: 'yellow' },
            { name: 'Data', color: 'orange' },
            { name: 'UX', color: 'pink' },
            { name: 'Question', color: 'gray' }
          ]
        }
      };
      console.log('Adding Category property...');
    }

    if (missingProperties.includes('Platform')) {
      propertiesToAdd['Platform'] = {
        select: {
          options: [
            { name: 'DSLV', color: 'blue' },
            { name: 'MsAudreysHouse', color: 'purple' },
            { name: 'Direct Cuts', color: 'orange' },
            { name: 'Strata Noble', color: 'green' },
            { name: 'Other', color: 'gray' }
          ]
        }
      };
      console.log('Adding Platform property...');
    }

    if (missingProperties.includes('Impact')) {
      propertiesToAdd['Impact'] = { number: { format: 'number' } };
      console.log('Adding Impact property...');
    }

    if (missingProperties.includes('Urgency')) {
      propertiesToAdd['Urgency'] = { number: { format: 'number' } };
      console.log('Adding Urgency property...');
    }

    if (missingProperties.includes('Effort')) {
      propertiesToAdd['Effort'] = { number: { format: 'number' } };
      console.log('Adding Effort property...');
    }

    if (missingProperties.includes('Owner')) {
      propertiesToAdd['Owner'] = { people: {} };
      console.log('Adding Owner property...');
    }

    if (missingProperties.includes('Intake Source')) {
      propertiesToAdd['Intake Source'] = {
        select: {
          options: [
            { name: 'Slack', color: 'purple' },
            { name: 'Email', color: 'blue' },
            { name: 'Call', color: 'green' },
            { name: 'Form', color: 'orange' }
          ]
        }
      };
      console.log('Adding Intake Source property...');
    }

    if (missingProperties.includes('Slack Permalink')) {
      propertiesToAdd['Slack Permalink'] = { url: {} };
      console.log('Adding Slack Permalink property...');
    }

    if (missingProperties.includes('Release Window')) {
      propertiesToAdd['Release Window'] = {
        select: {
          options: [
            { name: 'Next Patch', color: 'green' },
            { name: 'This Week', color: 'blue' },
            { name: 'Next Week', color: 'yellow' },
            { name: 'Backlog', color: 'gray' }
          ]
        }
      };
      console.log('Adding Release Window property...');
    }

    if (missingProperties.includes('Due Date')) {
      propertiesToAdd['Due Date'] = { date: {} };
      console.log('Adding Due Date property...');
    }

    if (missingProperties.includes('Notes')) {
      propertiesToAdd['Notes'] = { rich_text: {} };
      console.log('Adding Notes property...');
    }

    // Note: Priority Score as a formula must be added manually in Notion UI
    // Formulas cannot be created via API
    if (missingProperties.includes('Priority Score')) {
      console.log('\nNOTE: Priority Score (formula) must be added manually in Notion.');
      console.log('Formula: prop("Impact") * prop("Urgency") / max(prop("Effort"), 1)');
    }

    if (Object.keys(propertiesToAdd).length > 0) {
      try {
        await notion.databases.update({
          database_id: NOTION_DATABASE_ID,
          properties: propertiesToAdd
        });
        console.log('\nProperties added successfully!');
      } catch (error: any) {
        console.error('\nError adding properties:', error.message);
      }
    }
  } else {
    console.log('\nAll required properties exist!');
  }

  // Now let's try creating a test ticket
  console.log('\n--- Creating Test Ticket ---\n');

  try {
    const testTicket = {
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        'Ticket': {
          title: [{ text: { content: '[TEST] System Verification' } }]
        },
        'Client': {
          select: { name: 'DSLV' }
        },
        'Status': {
          select: { name: 'New' }
        },
        'Severity': {
          select: { name: 'S4 Low' }
        },
        'Category': {
          select: { name: 'Question' }
        },
        'Platform': {
          select: { name: 'DSLV' }
        },
        'Impact': {
          number: 1
        },
        'Urgency': {
          number: 1
        },
        'Effort': {
          number: 1
        },
        'Intake Source': {
          select: { name: 'Slack' }
        },
        'Notes': {
          rich_text: [{
            text: {
              content: `System verification ticket created at ${new Date().toISOString()}. Safe to delete.`
            }
          }]
        }
      }
    };

    const response = await notion.pages.create(testTicket);
    console.log('Test ticket created successfully!');
    console.log(`URL: ${response.url}`);
    console.log(`Page ID: ${response.id}`);

  } catch (error: any) {
    console.error('Error creating test ticket:', error.message);

    // If error mentions status, retry without it
    if (error.message.includes('Status')) {
      console.log('\nRetrying without Status property...');
      try {
        const testTicketNoStatus = {
          parent: { database_id: NOTION_DATABASE_ID },
          properties: {
            'Ticket': {
              title: [{ text: { content: '[TEST] System Verification (No Status)' } }]
            },
            'Client': {
              select: { name: 'DSLV' }
            },
            'Severity': {
              select: { name: 'S4 Low' }
            },
            'Notes': {
              rich_text: [{
                text: {
                  content: `System verification ticket created at ${new Date().toISOString()}. Safe to delete.`
                }
              }]
            }
          }
        };

        const response = await notion.pages.create(testTicketNoStatus);
        console.log('Test ticket created (minimal properties)!');
        console.log(`URL: ${response.url}`);
      } catch (retryError: any) {
        console.error('Retry failed:', retryError.message);
      }
    }
  }

  console.log('\n=== Schema Check Complete ===');
}

main().catch(console.error);
