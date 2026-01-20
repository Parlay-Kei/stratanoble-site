import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });

/**
 * Setup script to create the Client Tickets database in Notion
 * with all required properties, views, and templates
 */
async function setupNotionDatabase() {
    try {
        console.log('🚀 Starting Notion database setup...\n');

        const supportDeskPageId = process.env.NOTION_SUPPORT_DESK_PAGE_ID;

        if (!supportDeskPageId) {
            throw new Error('NOTION_SUPPORT_DESK_PAGE_ID not found in environment variables');
        }

        // Create the Client Tickets database
        console.log('📊 Creating Client Tickets database...');

        const database = await notion.databases.create({
            parent: {
                type: 'page_id',
                page_id: supportDeskPageId,
            },
            title: [
                {
                    type: 'text',
                    text: {
                        content: 'Client Tickets',
                    },
                },
            ],
            properties: {
                // Title property (required)
                'Ticket': {
                    title: {},
                },

                // Select properties
                'Client': {
                    select: {
                        options: [
                            { name: 'Client A', color: 'blue' },
                            { name: 'Client B', color: 'green' },
                            { name: 'Client C', color: 'purple' },
                            // Add more as needed
                        ],
                    },
                },
                'Platform': {
                    select: {
                        options: [
                            { name: 'Direct Cuts', color: 'blue' },
                            { name: 'DSLV', color: 'green' },
                            { name: 'Strata Noble', color: 'purple' },
                            { name: 'Other', color: 'gray' },
                        ],
                    },
                },
                'Category': {
                    select: {
                        options: [
                            { name: 'Bug', color: 'red' },
                            { name: 'Feature', color: 'blue' },
                            { name: 'Billing', color: 'yellow' },
                            { name: 'Access/Auth', color: 'orange' },
                            { name: 'Data', color: 'green' },
                            { name: 'UX', color: 'purple' },
                            { name: 'Question', color: 'gray' },
                        ],
                    },
                },
                'Severity': {
                    select: {
                        options: [
                            { name: 'S1 Critical', color: 'red' },
                            { name: 'S2 High', color: 'orange' },
                            { name: 'S3 Medium', color: 'yellow' },
                            { name: 'S4 Low', color: 'gray' },
                        ],
                    },
                },
                'Status': {
                    status: {},
                },
                'Priority': {
                    select: {
                        options: [
                            { name: 'P0', color: 'red' },
                            { name: 'P1', color: 'orange' },
                            { name: 'P2', color: 'yellow' },
                            { name: 'P3', color: 'gray' },
                        ],
                    },
                },
                'Release Window': {
                    select: {
                        options: [
                            { name: 'Next Patch', color: 'red' },
                            { name: 'This Week', color: 'orange' },
                            { name: 'Next Week', color: 'yellow' },
                            { name: 'Backlog', color: 'gray' },
                        ],
                    },
                },
                'Intake Source': {
                    select: {
                        options: [
                            { name: 'Slack', color: 'purple' },
                            { name: 'Email', color: 'blue' },
                            { name: 'Call', color: 'green' },
                            { name: 'Form', color: 'orange' },
                        ],
                    },
                },

                // Number properties
                'Impact': {
                    number: {
                        format: 'number',
                    },
                },
                'Urgency': {
                    number: {
                        format: 'number',
                    },
                },
                'Effort': {
                    number: {
                        format: 'number',
                    },
                },

                // Formula property
                'Priority Score': {
                    formula: {
                        expression: 'round((prop("Impact") * prop("Urgency")) / max(prop("Effort"), 1))',
                    },
                },

                // Person property
                'Owner': {
                    people: {},
                },

                // URL properties
                'Slack Thread': {
                    url: {},
                },
                'Message Permalink': {
                    url: {},
                },
                'Receipts / Proof Pack': {
                    url: {},
                },

                // Date property
                'Due Date': {
                    date: {},
                },

                // Files property
                'Attachments': {
                    files: {},
                },

                // Rich text property
                'Notes': {
                    rich_text: {},
                },
            },
        });

        console.log('✅ Database created successfully!');
        console.log(`📝 Database ID: ${database.id}`);
        console.log('\n⚠️  IMPORTANT: Add this to your .env file:');
        console.log(`NOTION_DATABASE_ID=${database.id}\n`);

        // Create Bug Report template
        console.log('📄 Creating Bug Report template...');
        await createBugReportTemplate(database.id);

        // Create Feature Request template
        console.log('📄 Creating Feature Request template...');
        await createFeatureRequestTemplate(database.id);

        console.log('\n✅ Setup complete!');
        console.log('\n📋 Next steps:');
        console.log('1. Add the NOTION_DATABASE_ID to your .env file');
        console.log('2. Create database views manually in Notion (Inbox, Triage Queue, etc.)');
        console.log('3. Configure your Slack app');
        console.log('4. Run the automation service');

    } catch (error) {
        console.error('❌ Error setting up database:', error);
        if (error.code === 'object_not_found') {
            console.error('\n💡 Make sure:');
            console.error('1. The NOTION_SUPPORT_DESK_PAGE_ID is correct');
            console.error('2. You have shared the page with your integration');
        }
        process.exit(1);
    }
}

async function createBugReportTemplate(databaseId) {
    // Note: Notion API doesn't directly support creating database templates
    // This would need to be done manually in the Notion UI
    // We'll create a sample page that can be used as a reference

    const page = await notion.pages.create({
        parent: {
            database_id: databaseId,
        },
        properties: {
            'Ticket': {
                title: [
                    {
                        text: {
                            content: '[TEMPLATE] Bug Report',
                        },
                    },
                ],
            },
            'Category': {
                select: {
                    name: 'Bug',
                },
            },
        },
        children: [
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'What happened' } }],
                },
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ type: 'text', text: { content: 'Describe the issue...' } }],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Expected behavior' } }],
                },
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ type: 'text', text: { content: 'What should have happened...' } }],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Steps to reproduce' } }],
                },
            },
            {
                object: 'block',
                type: 'numbered_list_item',
                numbered_list_item: {
                    rich_text: [{ type: 'text', text: { content: 'Step 1...' } }],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Environment' } }],
                },
            },
            {
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                    rich_text: [{ type: 'text', text: { content: 'Device: ' } }],
                },
            },
            {
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                    rich_text: [{ type: 'text', text: { content: 'Browser: ' } }],
                },
            },
            {
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                    rich_text: [{ type: 'text', text: { content: 'App version: ' } }],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Evidence' } }],
                },
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ type: 'text', text: { content: 'Screenshots, recordings, logs...' } }],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Impact statement' } }],
                },
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ type: 'text', text: { content: 'Who is affected and how...' } }],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Root cause (filled later)' } }],
                },
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Fix plan (filled later)' } }],
                },
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Release note (client-facing)' } }],
                },
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [],
                },
            },
        ],
    });

    console.log('✅ Bug Report template page created');
}

async function createFeatureRequestTemplate(databaseId) {
    const page = await notion.pages.create({
        parent: {
            database_id: databaseId,
        },
        properties: {
            'Ticket': {
                title: [
                    {
                        text: {
                            content: '[TEMPLATE] Feature Request',
                        },
                    },
                ],
            },
            'Category': {
                select: {
                    name: 'Feature',
                },
            },
        },
        children: [
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Problem to solve' } }],
                },
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ type: 'text', text: { content: 'What problem does this solve...' } }],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Desired outcome' } }],
                },
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ type: 'text', text: { content: 'What should users be able to do...' } }],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Who benefits' } }],
                },
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ type: 'text', text: { content: 'Which clients/users benefit...' } }],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Constraints' } }],
                },
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ type: 'text', text: { content: 'Technical or business constraints...' } }],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Acceptance criteria' } }],
                },
            },
            {
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                    rich_text: [{ type: 'text', text: { content: 'Criterion 1...' } }],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Estimate (Effort)' } }],
                },
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ type: 'text', text: { content: 'Estimated effort 1-5...' } }],
                },
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Release note (client-facing)' } }],
                },
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [],
                },
            },
        ],
    });

    console.log('✅ Feature Request template page created');
}

// Run the setup
setupNotionDatabase();
