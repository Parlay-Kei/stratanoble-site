#!/usr/bin/env node
/**
 * Notion Operations MCP Server
 * Enables agentic creation and management of Notion databases and pages
 * for the Strata Noble 30-day system
 *
 * Features:
 * - create_database(parent_page_id, title, properties)
 * - add_property(database_id, property_spec)
 * - create_page(database_id, row_payload)
 * - update_page(page_id, fields)
 * - bulk_create_pages(database_id, rows)
 * - create_view(database_id, view_spec) [limited by API]
 *
 * Safety Features:
 * - Environment variable token storage only
 * - Dry-run mode support
 * - Rate limiting with retry logic
 * - Input validation and sanitization
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

// Load environment variables from multiple possible locations
dotenv.config({ path: '.env' });
dotenv.config({ path: '../../apps/website/.env.local' });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_SOCIAL_MEDIA_HQ_PAGE_ID = process.env.NOTION_SOCIAL_MEDIA_HQ_PAGE_ID;
const DRY_RUN_MODE = process.env.DRY_RUN_MODE === 'true';
const RATE_LIMIT_RPS = parseInt(process.env.RATE_LIMIT_REQUESTS_PER_SECOND) || 3;

// Rate limiting state
let lastRequestTime = 0;
const minRequestInterval = 1000 / RATE_LIMIT_RPS; // ms between requests

/**
 * Rate limiting helper
 */
async function rateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < minRequestInterval) {
    const waitTime = minRequestInterval - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

/**
 * Initialize Notion client with error handling
 */
function initializeNotionClient() {
  if (!NOTION_API_KEY) {
    throw new Error('NOTION_API_KEY environment variable is required');
  }

  return new Client({
    auth: NOTION_API_KEY,
  });
}

const notion = initializeNotionClient();

/**
 * Safe Notion API call with rate limiting and retry logic
 */
async function safeNotionCall(operation, maxRetries = 3) {
  if (DRY_RUN_MODE) {
    return {
      success: true,
      message: `DRY RUN: Would execute ${operation.name}`,
      data: operation.dryRunResult || {}
    };
  }

  await rateLimit();

  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      lastError = error;

      // If rate limited, wait longer and retry
      if (error.status === 429) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Don't retry other errors
      break;
    }
  }

  throw new Error(`Notion API call failed after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Validate database properties schema
 */
function validateDatabaseProperties(properties) {
  const validPropertyTypes = [
    'title', 'rich_text', 'number', 'select', 'multi_select',
    'date', 'person', 'file', 'checkbox', 'url', 'email',
    'phone_number', 'formula', 'relation', 'rollup', 'status'
  ];

  for (const [name, config] of Object.entries(properties)) {
    if (!config.type || !validPropertyTypes.includes(config.type)) {
      throw new Error(`Invalid property type for ${name}: ${config.type}`);
    }
  }
}

/**
 * Create a new database in Notion
 */
async function createDatabase(parentPageId, title, properties = {}) {
  validateDatabaseProperties(properties);

  // Default properties for Strata Noble tracker
  const defaultProperties = {
    'Name': {
      title: {}
    },
    'Status': {
      select: {
        options: [
          { name: 'Not Started', color: 'gray' },
          { name: 'In Progress', color: 'yellow' },
          { name: 'Complete', color: 'green' },
          { name: 'On Hold', color: 'red' }
        ]
      }
    },
    'Priority': {
      select: {
        options: [
          { name: 'Critical', color: 'red' },
          { name: 'High', color: 'orange' },
          { name: 'Medium', color: 'yellow' },
          { name: 'Low', color: 'gray' }
        ]
      }
    },
    'Due Date': {
      date: {}
    },
    'Tags': {
      multi_select: {
        options: [
          { name: 'Social Media', color: 'blue' },
          { name: 'Content', color: 'green' },
          { name: 'Strategy', color: 'purple' },
          { name: 'Analytics', color: 'orange' }
        ]
      }
    }
  };

  const finalProperties = { ...defaultProperties, ...properties };

  const operation = async () => {
    return await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: parentPageId
      },
      title: [
        {
          type: 'text',
          text: {
            content: title
          }
        }
      ],
      properties: finalProperties
    });
  };

  operation.name = 'createDatabase';
  operation.dryRunResult = {
    id: 'dry-run-database-id',
    title: title,
    properties: finalProperties
  };

  return await safeNotionCall(operation);
}

/**
 * Add a property to an existing database
 */
async function addProperty(databaseId, propertyName, propertySpec) {
  validateDatabaseProperties({ [propertyName]: propertySpec });

  const operation = async () => {
    return await notion.databases.update({
      database_id: databaseId,
      properties: {
        [propertyName]: propertySpec
      }
    });
  };

  operation.name = 'addProperty';
  operation.dryRunResult = {
    id: databaseId,
    property_added: propertyName,
    spec: propertySpec
  };

  return await safeNotionCall(operation);
}

/**
 * Create a page in a database
 */
async function createPage(databaseId, rowPayload) {
  const operation = async () => {
    return await notion.pages.create({
      parent: {
        database_id: databaseId
      },
      properties: rowPayload
    });
  };

  operation.name = 'createPage';
  operation.dryRunResult = {
    id: 'dry-run-page-id',
    database_id: databaseId,
    properties: rowPayload
  };

  return await safeNotionCall(operation);
}

/**
 * Update an existing page
 */
async function updatePage(pageId, fields) {
  const operation = async () => {
    return await notion.pages.update({
      page_id: pageId,
      properties: fields
    });
  };

  operation.name = 'updatePage';
  operation.dryRunResult = {
    id: pageId,
    updated_properties: fields
  };

  return await safeNotionCall(operation);
}

/**
 * Bulk create pages with batch processing
 */
async function bulkCreatePages(databaseId, rows) {
  const results = [];
  const batchSize = 5; // Conservative batch size to avoid rate limits

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const batchPromises = batch.map(row => createPage(databaseId, row));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Small delay between batches
    if (i + batchSize < rows.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return {
    success: true,
    created_count: results.length,
    results: results
  };
}

/**
 * Get database schema for validation
 */
async function getDatabaseSchema(databaseId) {
  const operation = async () => {
    return await notion.databases.retrieve({
      database_id: databaseId
    });
  };

  operation.name = 'getDatabaseSchema';
  operation.dryRunResult = {
    id: databaseId,
    properties: {}
  };

  return await safeNotionCall(operation);
}

// Initialize the MCP server
const server = new Server(
  {
    name: 'notion-ops',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_database',
        description: 'Create a new Notion database with specified properties',
        inputSchema: {
          type: 'object',
          properties: {
            parent_page_id: {
              type: 'string',
              description: 'ID of the parent page where database will be created'
            },
            title: {
              type: 'string',
              description: 'Title of the new database'
            },
            properties: {
              type: 'object',
              description: 'Database properties schema (optional, defaults provided)'
            }
          },
          required: ['parent_page_id', 'title']
        }
      },
      {
        name: 'add_property',
        description: 'Add a new property to an existing database',
        inputSchema: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'ID of the target database'
            },
            property_name: {
              type: 'string',
              description: 'Name of the new property'
            },
            property_spec: {
              type: 'object',
              description: 'Property configuration (type, options, etc.)'
            }
          },
          required: ['database_id', 'property_name', 'property_spec']
        }
      },
      {
        name: 'create_page',
        description: 'Create a single page/row in a database',
        inputSchema: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'ID of the target database'
            },
            row_payload: {
              type: 'object',
              description: 'Page properties data'
            }
          },
          required: ['database_id', 'row_payload']
        }
      },
      {
        name: 'update_page',
        description: 'Update properties of an existing page',
        inputSchema: {
          type: 'object',
          properties: {
            page_id: {
              type: 'string',
              description: 'ID of the page to update'
            },
            fields: {
              type: 'object',
              description: 'Updated properties'
            }
          },
          required: ['page_id', 'fields']
        }
      },
      {
        name: 'bulk_create_pages',
        description: 'Create multiple pages/rows in batch with rate limiting',
        inputSchema: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'ID of the target database'
            },
            rows: {
              type: 'array',
              description: 'Array of page property objects'
            }
          },
          required: ['database_id', 'rows']
        }
      },
      {
        name: 'get_database_schema',
        description: 'Retrieve database properties schema for validation',
        inputSchema: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'ID of the database to inspect'
            }
          },
          required: ['database_id']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'create_database':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await createDatabase(
                args.parent_page_id,
                args.title,
                args.properties
              ), null, 2)
            }
          ]
        };

      case 'add_property':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await addProperty(
                args.database_id,
                args.property_name,
                args.property_spec
              ), null, 2)
            }
          ]
        };

      case 'create_page':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await createPage(
                args.database_id,
                args.row_payload
              ), null, 2)
            }
          ]
        };

      case 'update_page':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await updatePage(
                args.page_id,
                args.fields
              ), null, 2)
            }
          ]
        };

      case 'bulk_create_pages':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await bulkCreatePages(
                args.database_id,
                args.rows
              ), null, 2)
            }
          ]
        };

      case 'get_database_schema':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getDatabaseSchema(
                args.database_id
              ), null, 2)
            }
          ]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log configuration on startup
  console.error('🚀 Notion Operations MCP Server started');
  console.error(`📋 Configuration:`);
  console.error(`   - Dry Run Mode: ${DRY_RUN_MODE}`);
  console.error(`   - Rate Limit: ${RATE_LIMIT_RPS} requests/second`);
  console.error(`   - API Key: ${NOTION_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.error(`   - Social Media HQ Page: ${NOTION_SOCIAL_MEDIA_HQ_PAGE_ID ? '✅ Configured' : '⚠️  Not set'}`);
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});