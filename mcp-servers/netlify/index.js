#!/usr/bin/env node
/**
 * Netlify MCP Server
 * Provides direct access to Netlify API for environment variable management and deployments
 *
 * Features:
 * - List all environment variables
 * - Verify required environment variables
 * - Add/update environment variables
 * - Delete environment variables
 * - List recent deployments
 * - Trigger new deployment
 * - Clear cache and deploy
 * - Get site information
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env.local' });

const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN;
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;
const NETLIFY_API_BASE = 'https://api.netlify.com/api/v1';

/**
 * Netlify API helper function
 */
async function netlifyAPI(endpoint, options = {}) {
  const url = `${NETLIFY_API_BASE}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${NETLIFY_API_TOKEN}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Netlify API Error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * List all environment variables for the site
 */
async function listEnvVariables() {
  const envVars = await netlifyAPI(`/accounts/{account_slug}/env?site_id=${NETLIFY_SITE_ID}`);
  return envVars.map(env => ({
    key: env.key,
    scopes: env.scopes,
    values: env.values.map(v => ({
      context: v.context,
      value: env.key.includes('SECRET') || env.key.includes('KEY')
        ? '***' + (v.value?.slice(-4) || '***')
        : v.value?.substring(0, 50) + (v.value?.length > 50 ? '...' : '')
    }))
  }));
}

/**
 * Verify required environment variables exist
 */
async function verifyEnvVariables(requiredVars) {
  const envVars = await netlifyAPI(`/accounts/{account_slug}/env?site_id=${NETLIFY_SITE_ID}`);
  const existingKeys = new Set(envVars.map(v => v.key));

  const missing = [];
  const present = [];

  for (const varName of requiredVars) {
    if (existingKeys.has(varName)) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  }

  return {
    total: requiredVars.length,
    present: present.length,
    missing: missing.length,
    missingVariables: missing,
    presentVariables: present
  };
}

/**
 * Get specific environment variable value
 */
async function getEnvVariable(key) {
  const envVars = await netlifyAPI(`/accounts/{account_slug}/env/${key}?site_id=${NETLIFY_SITE_ID}`);
  return {
    key: envVars.key,
    scopes: envVars.scopes,
    values: envVars.values,
    updated_at: envVars.updated_at
  };
}

/**
 * Set environment variable
 */
async function setEnvVariable(key, value, context = 'all', isSecret = false) {
  const body = {
    key,
    scopes: ['builds', 'functions', 'runtime', 'post_processing'],
    values: [{
      context,
      value
    }],
    is_secret: isSecret
  };

  return await netlifyAPI(`/accounts/{account_slug}/env?site_id=${NETLIFY_SITE_ID}`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

/**
 * Update environment variable
 */
async function updateEnvVariable(key, value, context = 'all') {
  const body = {
    context,
    value
  };

  return await netlifyAPI(`/accounts/{account_slug}/env/${key}/value/${context}?site_id=${NETLIFY_SITE_ID}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
}

/**
 * Delete environment variable
 */
async function deleteEnvVariable(key) {
  return await netlifyAPI(`/accounts/{account_slug}/env/${key}?site_id=${NETLIFY_SITE_ID}`, {
    method: 'DELETE'
  });
}

/**
 * List recent deployments
 */
async function listDeployments(limit = 10) {
  const deploys = await netlifyAPI(`/sites/${NETLIFY_SITE_ID}/deploys?per_page=${limit}`);
  return deploys.map(d => ({
    id: d.id,
    state: d.state,
    created_at: d.created_at,
    published_at: d.published_at,
    deploy_time: d.deploy_time,
    branch: d.branch,
    commit_ref: d.commit_ref,
    commit_url: d.commit_url,
    deploy_url: d.deploy_url,
    error_message: d.error_message
  }));
}

/**
 * Get site information
 */
async function getSiteInfo() {
  const site = await netlifyAPI(`/sites/${NETLIFY_SITE_ID}`);
  return {
    id: site.id,
    name: site.name,
    url: site.url,
    ssl_url: site.ssl_url,
    custom_domain: site.custom_domain,
    created_at: site.created_at,
    updated_at: site.updated_at,
    account_name: site.account_name,
    build_settings: {
      repo_url: site.build_settings?.repo_url,
      repo_branch: site.build_settings?.repo_branch,
      cmd: site.build_settings?.cmd,
      dir: site.build_settings?.dir
    }
  };
}

/**
 * Trigger new deployment
 */
async function triggerDeploy(clearCache = false) {
  const body = clearCache ? { clear_cache: true } : {};

  return await netlifyAPI(`/sites/${NETLIFY_SITE_ID}/builds`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

/**
 * Get deployment status
 */
async function getDeployStatus(deployId) {
  const deploy = await netlifyAPI(`/sites/${NETLIFY_SITE_ID}/deploys/${deployId}`);
  return {
    id: deploy.id,
    state: deploy.state,
    created_at: deploy.created_at,
    published_at: deploy.published_at,
    deploy_time: deploy.deploy_time,
    error_message: deploy.error_message,
    deploy_url: deploy.deploy_url,
    build_log_url: `https://app.netlify.com/sites/${NETLIFY_SITE_ID}/deploys/${deployId}`
  };
}

/**
 * Create MCP Server
 */
const server = new Server(
  {
    name: 'netlify-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'netlify_list_env_variables',
        description: 'List all environment variables configured in Netlify for the site',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'netlify_verify_env_variables',
        description: 'Verify that required environment variables exist in Netlify. Returns missing and present variables.',
        inputSchema: {
          type: 'object',
          properties: {
            required_variables: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of required environment variable names to verify'
            }
          },
          required: ['required_variables'],
        },
      },
      {
        name: 'netlify_get_env_variable',
        description: 'Get detailed information about a specific environment variable',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Environment variable key name'
            }
          },
          required: ['key'],
        },
      },
      {
        name: 'netlify_set_env_variable',
        description: 'Create or update an environment variable in Netlify',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Environment variable key name'
            },
            value: {
              type: 'string',
              description: 'Environment variable value'
            },
            context: {
              type: 'string',
              enum: ['all', 'production', 'deploy-preview', 'branch-deploy', 'dev'],
              description: 'Context where the variable should be available (default: all)',
              default: 'all'
            },
            is_secret: {
              type: 'boolean',
              description: 'Mark as secret to hide value in UI (default: false)',
              default: false
            }
          },
          required: ['key', 'value'],
        },
      },
      {
        name: 'netlify_delete_env_variable',
        description: 'Delete an environment variable from Netlify',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Environment variable key name to delete'
            }
          },
          required: ['key'],
        },
      },
      {
        name: 'netlify_list_deployments',
        description: 'List recent deployments with their status and details',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of deployments to retrieve (default: 10, max: 100)',
              default: 10,
              minimum: 1,
              maximum: 100
            }
          },
        },
      },
      {
        name: 'netlify_get_site_info',
        description: 'Get detailed information about the Netlify site',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'netlify_trigger_deploy',
        description: 'Trigger a new deployment, optionally clearing the cache first',
        inputSchema: {
          type: 'object',
          properties: {
            clear_cache: {
              type: 'boolean',
              description: 'Whether to clear the build cache before deploying (default: false)',
              default: false
            }
          },
        },
      },
      {
        name: 'netlify_get_deploy_status',
        description: 'Get the current status of a specific deployment',
        inputSchema: {
          type: 'object',
          properties: {
            deploy_id: {
              type: 'string',
              description: 'Deployment ID to check status for'
            }
          },
          required: ['deploy_id'],
        },
      },
    ],
  };
});

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Check for required environment variables
    if (!NETLIFY_API_TOKEN) {
      throw new Error('NETLIFY_API_TOKEN environment variable is required');
    }
    if (!NETLIFY_SITE_ID) {
      throw new Error('NETLIFY_SITE_ID environment variable is required');
    }

    let result;

    switch (name) {
      case 'netlify_list_env_variables':
        result = await listEnvVariables();
        break;

      case 'netlify_verify_env_variables':
        result = await verifyEnvVariables(args.required_variables);
        break;

      case 'netlify_get_env_variable':
        result = await getEnvVariable(args.key);
        break;

      case 'netlify_set_env_variable':
        result = await setEnvVariable(
          args.key,
          args.value,
          args.context || 'all',
          args.is_secret || false
        );
        break;

      case 'netlify_delete_env_variable':
        result = await deleteEnvVariable(args.key);
        break;

      case 'netlify_list_deployments':
        result = await listDeployments(args.limit || 10);
        break;

      case 'netlify_get_site_info':
        result = await getSiteInfo();
        break;

      case 'netlify_trigger_deploy':
        result = await triggerDeploy(args.clear_cache || false);
        break;

      case 'netlify_get_deploy_status':
        result = await getDeployStatus(args.deploy_id);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Netlify MCP Server running on stdio');
  console.error(`Site ID: ${NETLIFY_SITE_ID || 'Not configured'}`);
  console.error(`API Token: ${NETLIFY_API_TOKEN ? '✓ Configured' : '✗ Missing'}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
