#!/usr/bin/env node

/**
 * Paralegal Contract Agent MCP Server
 *
 * An autonomous contract drafting and review system for StrataNoble.
 * Provides tools for template management, clause libraries, negotiation playbooks,
 * deal context, contract comparison, and document persistence.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { templateLibraryTool } from './tools/template-library.js';
import { clauseLibraryTool } from './tools/clause-library.js';
import { playbookTool } from './tools/playbook.js';
import { dealContextTool } from './tools/deal-context.js';
import { diffEngineTool } from './tools/diff-engine.js';
import { documentSaveTool } from './tools/document-save.js';
import { PARALEGAL_SYSTEM_PROMPT, getSystemPrompt } from './prompts/system-prompt.js';

// Server metadata
const SERVER_NAME = 'paralegal-agent';
const SERVER_VERSION = '1.0.0';

// Initialize MCP Server
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Log helper
function log(message: string, ...args: unknown[]): void {
  console.error(`[${SERVER_NAME}] ${message}`, ...args);
}

// Tool definitions with handlers
const toolRegistry = {
  get_contract_template: templateLibraryTool,
  get_clauses: clauseLibraryTool,
  get_playbook_rules: playbookTool,
  get_deal_context: dealContextTool,
  compare_contracts: diffEngineTool,
  save_contract_draft: documentSaveTool,
};

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.values(toolRegistry).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  log(`Tool call: ${name}`);

  try {
    const tool = toolRegistry[name as keyof typeof toolRegistry];

    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    const result = await tool.handler(args as Parameters<typeof tool.handler>[0]);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    log(`Tool ${name} error:`, error);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
          }),
        },
      ],
      isError: true,
    };
  }
});

// List available resources (system prompt and documentation)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'paralegal://system-prompt',
        name: 'Paralegal Agent System Prompt',
        description: 'The complete system prompt for the paralegal contract agent',
        mimeType: 'text/plain',
      },
      {
        uri: 'paralegal://document-types',
        name: 'Supported Document Types',
        description: 'List of contract document types the agent can generate',
        mimeType: 'application/json',
      },
      {
        uri: 'paralegal://clause-topics',
        name: 'Clause Topics',
        description: 'Available clause categories for the clause library',
        mimeType: 'application/json',
      },
    ],
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  log(`Resource read: ${uri}`);

  if (uri === 'paralegal://system-prompt') {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: PARALEGAL_SYSTEM_PROMPT,
        },
      ],
    };
  }

  if (uri === 'paralegal://document-types') {
    const documentTypes = [
      { type: 'MSA', name: 'Master Services Agreement', description: 'Framework agreement for ongoing engagements' },
      { type: 'SOW', name: 'Statement of Work', description: 'Specific project scope, deliverables, and timelines' },
      { type: 'CHANGE_ORDER', name: 'Change Order', description: 'Modifications to existing SOW' },
      { type: 'NDA', name: 'Non-Disclosure Agreement', description: 'Mutual confidentiality protection' },
      { type: 'IP_ADDENDUM', name: 'IP Addendum', description: 'Intellectual property ownership details' },
      { type: 'PAYMENT_POLICY', name: 'Payment Policy', description: 'Payment terms and procedures' },
      { type: 'DPA', name: 'Data Processing Agreement', description: 'GDPR/privacy compliance' },
      { type: 'SECURITY_ADDENDUM', name: 'Security Addendum', description: 'Security requirements and standards' },
      { type: 'BETA_AGREEMENT', name: 'Beta Agreement', description: 'Early access/beta testing terms' },
      { type: 'SUPPORT_SLA', name: 'Support SLA', description: 'Service level agreement for support' },
    ];

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(documentTypes, null, 2),
        },
      ],
    };
  }

  if (uri === 'paralegal://clause-topics') {
    const clauseTopics = [
      'IP_OWNERSHIP',
      'LICENSE_GRANT',
      'CONFIDENTIALITY',
      'LIMITATION_OF_LIABILITY',
      'INDEMNITY',
      'PAYMENT_TERMS',
      'TERMINATION',
      'DISPUTE_RESOLUTION',
      'WARRANTY',
      'FORCE_MAJEURE',
      'DATA_PROTECTION',
      'SUBCONTRACTORS',
      'INSURANCE',
      'NON_SOLICITATION',
      'GOVERNING_LAW',
      'NOTICES',
      'ASSIGNMENT',
      'ENTIRE_AGREEMENT',
    ];

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(clauseTopics, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Graceful shutdown handlers
process.on('SIGINT', () => {
  log('Shutting down (SIGINT)...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Shutting down (SIGTERM)...');
  process.exit(0);
});

// Start server
async function main(): Promise<void> {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    log('Paralegal Contract Agent MCP server running on stdio');
  } catch (error) {
    log('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  log('Fatal error:', error);
  process.exit(1);
});
