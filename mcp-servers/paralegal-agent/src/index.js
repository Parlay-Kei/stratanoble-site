#!/usr/bin/env node

/**
 * Paralegal Contract Agent MCP Server
 *
 * Provides tools for autonomous contract drafting and review:
 * - get_contract_template: Fetch contract templates
 * - get_clauses: Retrieve reusable contract clauses
 * - get_playbook_rules: Get negotiation playbook rules
 * - get_deal_context: Retrieve deal intake data
 * - compare_contract_versions: Generate diff between versions
 * - save_contract: Persist contract to database
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { getContractTemplate } from './tools/template-library.js';
import { getClauses } from './tools/clause-library.js';
import { getPlaybookRules } from './tools/playbook.js';
import { getDealContext } from './tools/deal-context.js';
import { compareContractVersions } from './tools/diff-engine.js';
import { saveContract } from './tools/document-save.js';
import { SYSTEM_PROMPT, HUMAN_REVIEW_CHECKLIST } from './prompts/system-prompt.js';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Create MCP server instance
const server = new Server(
  {
    name: 'paralegal-contract-agent',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_contract_template',
        description: 'Fetch a contract template by document type, risk profile, and jurisdiction. Returns the template content with variables and structure.',
        inputSchema: {
          type: 'object',
          properties: {
            document_type: {
              type: 'string',
              enum: ['MSA', 'SOW', 'CHANGE_ORDER', 'NDA', 'IP_ADDENDUM', 'PAYMENT_POLICY', 'DPA', 'SECURITY_ADDENDUM', 'BETA_AGREEMENT', 'SUPPORT_SLA'],
              description: 'Type of contract document to retrieve'
            },
            risk_profile: {
              type: 'string',
              enum: ['standard', 'customer_friendly', 'vendor_friendly'],
              description: 'Risk profile variant (default: standard)',
              default: 'standard'
            },
            jurisdiction: {
              type: 'string',
              description: 'Jurisdiction code (default: US-NV)',
              default: 'US-NV'
            }
          },
          required: ['document_type']
        }
      },
      {
        name: 'get_clauses',
        description: 'Retrieve contract clauses by topic, risk profile, and jurisdiction. Returns a list of applicable clauses with their text and variables.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              enum: ['IP_OWNERSHIP', 'LICENSE_GRANT', 'CONFIDENTIALITY', 'LIMITATION_OF_LIABILITY', 'INDEMNITY', 'PAYMENT_TERMS', 'TERMINATION', 'DISPUTE_RESOLUTION', 'WARRANTY', 'FORCE_MAJEURE', 'DATA_PROTECTION', 'SUBCONTRACTORS', 'INSURANCE', 'NON_SOLICITATION', 'GOVERNING_LAW', 'NOTICES', 'ASSIGNMENT', 'ENTIRE_AGREEMENT'],
              description: 'Clause topic/category'
            },
            risk_profile: {
              type: 'string',
              enum: ['standard', 'customer_friendly', 'vendor_friendly'],
              description: 'Risk profile to filter by',
            },
            jurisdiction: {
              type: 'string',
              description: 'Jurisdiction to filter by'
            }
          },
          required: ['topic']
        }
      },
      {
        name: 'get_playbook_rules',
        description: 'Get negotiation playbook rules for a specific topic. Returns default positions, acceptable alternatives, and deal-breakers.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'Topic to get playbook rules for (e.g., "ip_ownership", "liability_caps", "payment_terms")'
            },
            jurisdiction: {
              type: 'string',
              description: 'Jurisdiction to filter by'
            }
          },
          required: ['topic']
        }
      },
      {
        name: 'get_deal_context',
        description: 'Retrieve deal intake data and client information by deal ID. Returns comprehensive deal context for contract generation.',
        inputSchema: {
          type: 'object',
          properties: {
            deal_id: {
              type: 'string',
              description: 'UUID of the deal to retrieve'
            }
          },
          required: ['deal_id']
        }
      },
      {
        name: 'compare_contract_versions',
        description: 'Compare two contract versions and generate a diff report. Identifies substantive changes, risk-impacting modifications, and provides detailed comparison.',
        inputSchema: {
          type: 'object',
          properties: {
            contract_id: {
              type: 'string',
              description: 'UUID of the contract'
            },
            version_a: {
              type: 'number',
              description: 'First version number to compare'
            },
            version_b: {
              type: 'number',
              description: 'Second version number to compare'
            }
          },
          required: ['contract_id', 'version_a', 'version_b']
        }
      },
      {
        name: 'save_contract',
        description: 'Save a contract to the database. Creates a new contract or version. Returns the contract ID and status.',
        inputSchema: {
          type: 'object',
          properties: {
            deal_id: {
              type: 'string',
              description: 'UUID of the associated deal'
            },
            document_type: {
              type: 'string',
              enum: ['MSA', 'SOW', 'CHANGE_ORDER', 'NDA', 'IP_ADDENDUM', 'PAYMENT_POLICY', 'DPA', 'SECURITY_ADDENDUM', 'BETA_AGREEMENT', 'SUPPORT_SLA'],
              description: 'Type of contract document'
            },
            title: {
              type: 'string',
              description: 'Contract title'
            },
            content: {
              type: 'object',
              description: 'Contract content (sections, variables, metadata)'
            },
            rendered_text: {
              type: 'string',
              description: 'Fully rendered contract text'
            },
            risk_profile: {
              type: 'string',
              enum: ['standard', 'customer_friendly', 'vendor_friendly'],
              description: 'Risk profile of the contract'
            },
            jurisdiction: {
              type: 'string',
              description: 'Governing jurisdiction'
            },
            parties: {
              type: 'array',
              description: 'Contract parties information'
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata'
            }
          },
          required: ['document_type', 'content']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_contract_template':
        return await getContractTemplate(args, supabase);

      case 'get_clauses':
        return await getClauses(args, supabase);

      case 'get_playbook_rules':
        return await getPlaybookRules(args, supabase);

      case 'get_deal_context':
        return await getDealContext(args, supabase);

      case 'compare_contract_versions':
        return await compareContractVersions(args, supabase);

      case 'save_contract':
        return await saveContract(args, supabase);

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

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'paralegal_system_prompt',
        description: 'System prompt with agent behavior, contract drafting guidelines, and StrataNoble-specific context',
      },
      {
        name: 'human_review_checklist',
        description: 'Checklist for human review before finalizing contracts',
      }
    ]
  };
});

// Get prompt content
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name } = request.params;

  switch (name) {
    case 'paralegal_system_prompt':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: SYSTEM_PROMPT
            }
          }
        ]
      };

    case 'human_review_checklist':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: HUMAN_REVIEW_CHECKLIST
            }
          }
        ]
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Paralegal Contract Agent MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
