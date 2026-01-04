#!/usr/bin/env node

/**
 * GitHub Operations MCP Server
 * Exposes GitHub tools to Claude Desktop via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import WorkflowsTool from '../tools/workflows.js';
import SecretsTool from '../tools/secrets.js';
import ActionsTool from '../tools/actions.js';
import RepositoryTool from '../tools/repository.js';

// Initialize tools
const config = {
  token: process.env.GITHUB_TOKEN,
  owner: process.env.GITHUB_OWNER,
  repo: process.env.GITHUB_REPO
};

const workflows = new WorkflowsTool(config);
const secrets = new SecretsTool(config);
const actions = new ActionsTool(config);
const repository = new RepositoryTool(config);

// Tool definitions
const TOOLS = [
  // ============ Workflow Tools ============
  {
    name: 'github_list_workflows',
    description: 'List all GitHub Actions workflows in the repository',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'github_get_workflow_runs',
    description: 'Get recent workflow runs with status. Can filter by workflow, branch, status, or conclusion',
    inputSchema: {
      type: 'object',
      properties: {
        workflow_id: { type: 'string', description: 'Filter by workflow ID or filename' },
        branch: { type: 'string', description: 'Filter by branch name' },
        status: { type: 'string', enum: ['queued', 'in_progress', 'completed'], description: 'Filter by status' },
        conclusion: { type: 'string', enum: ['success', 'failure', 'cancelled', 'skipped'], description: 'Filter by conclusion' },
        limit: { type: 'number', description: 'Number of runs to return (default 20)' }
      },
      required: []
    }
  },
  {
    name: 'github_get_workflow_status',
    description: 'Get a quick status summary of all workflows including recent successes/failures',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'github_trigger_workflow',
    description: 'Manually trigger a workflow dispatch event',
    inputSchema: {
      type: 'object',
      properties: {
        workflow_id: { type: 'string', description: 'Workflow ID or filename (e.g., "deploy.yml")' },
        branch: { type: 'string', description: 'Branch to run on (default: main)' },
        inputs: { type: 'object', description: 'Workflow inputs as key-value pairs' }
      },
      required: ['workflow_id']
    }
  },
  {
    name: 'github_cancel_workflow_run',
    description: 'Cancel an in-progress workflow run',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'number', description: 'The workflow run ID to cancel' }
      },
      required: ['run_id']
    }
  },
  {
    name: 'github_rerun_workflow',
    description: 'Re-run a workflow, optionally only failed jobs',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'number', description: 'The workflow run ID to re-run' },
        failed_jobs_only: { type: 'boolean', description: 'Only re-run failed jobs (default: false)' }
      },
      required: ['run_id']
    }
  },
  {
    name: 'github_get_workflow_jobs',
    description: 'Get the jobs and steps for a specific workflow run',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'number', description: 'The workflow run ID' }
      },
      required: ['run_id']
    }
  },

  // ============ Actions/Failure Tools ============
  {
    name: 'github_get_recent_failures',
    description: 'Get recent workflow failures with analysis of failure patterns',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of failures to analyze (default 20)' }
      },
      required: []
    }
  },
  {
    name: 'github_diagnose_failure',
    description: 'Diagnose why a specific workflow run failed and get suggested fixes',
    inputSchema: {
      type: 'object',
      properties: {
        run_id: { type: 'number', description: 'The workflow run ID to diagnose' }
      },
      required: ['run_id']
    }
  },
  {
    name: 'github_quick_status',
    description: 'Get a quick health check of GitHub Actions status',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },

  // ============ Secrets Tools ============
  {
    name: 'github_list_secrets',
    description: 'List all repository secrets (names only - values are never exposed)',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'github_check_secret',
    description: 'Check if a specific secret exists in the repository',
    inputSchema: {
      type: 'object',
      properties: {
        secret_name: { type: 'string', description: 'Name of the secret to check' }
      },
      required: ['secret_name']
    }
  },
  {
    name: 'github_audit_secrets',
    description: 'Audit secrets against known workflow requirements. Shows missing, configured, and extra secrets',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'github_create_secret',
    description: 'Create or update a repository secret',
    inputSchema: {
      type: 'object',
      properties: {
        secret_name: { type: 'string', description: 'Name of the secret' },
        secret_value: { type: 'string', description: 'Value of the secret' }
      },
      required: ['secret_name', 'secret_value']
    }
  },
  {
    name: 'github_list_variables',
    description: 'List repository variables (non-secret configuration)',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },

  // ============ Repository Tools ============
  {
    name: 'github_repo_info',
    description: 'Get repository information and metadata',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'github_repo_health',
    description: 'Get repository health status including branch status, open PRs/issues, and check status',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'github_list_branches',
    description: 'List repository branches',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of branches to return' },
        protected: { type: 'boolean', description: 'Filter to only protected branches' }
      },
      required: []
    }
  },
  {
    name: 'github_list_prs',
    description: 'List pull requests',
    inputSchema: {
      type: 'object',
      properties: {
        state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'PR state filter' },
        limit: { type: 'number', description: 'Number of PRs to return' }
      },
      required: []
    }
  },
  {
    name: 'github_get_pr',
    description: 'Get details for a specific pull request including checks status',
    inputSchema: {
      type: 'object',
      properties: {
        pr_number: { type: 'number', description: 'Pull request number' }
      },
      required: ['pr_number']
    }
  },
  {
    name: 'github_list_issues',
    description: 'List repository issues',
    inputSchema: {
      type: 'object',
      properties: {
        state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'Issue state filter' },
        labels: { type: 'string', description: 'Comma-separated list of labels to filter by' },
        limit: { type: 'number', description: 'Number of issues to return' }
      },
      required: []
    }
  },
  {
    name: 'github_create_issue',
    description: 'Create a new issue in the repository',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Issue title' },
        body: { type: 'string', description: 'Issue body/description' },
        labels: { type: 'array', items: { type: 'string' }, description: 'Labels to add' },
        assignees: { type: 'array', items: { type: 'string' }, description: 'Users to assign' }
      },
      required: ['title']
    }
  },
  {
    name: 'github_commit_status',
    description: 'Get status checks for a specific commit',
    inputSchema: {
      type: 'object',
      properties: {
        commit_sha: { type: 'string', description: 'Commit SHA (full or short)' }
      },
      required: ['commit_sha']
    }
  },
  {
    name: 'github_recent_commits',
    description: 'Get recent commits on a branch',
    inputSchema: {
      type: 'object',
      properties: {
        branch: { type: 'string', description: 'Branch name (default: main)' },
        limit: { type: 'number', description: 'Number of commits to return' }
      },
      required: []
    }
  }
];

// Tool handler
async function handleTool(name, args) {
  switch (name) {
    // Workflow tools
    case 'github_list_workflows':
      return workflows.listWorkflows();
    case 'github_get_workflow_runs':
      return workflows.getWorkflowRuns({
        workflowId: args.workflow_id,
        branch: args.branch,
        status: args.status,
        conclusion: args.conclusion,
        limit: args.limit
      });
    case 'github_get_workflow_status':
      return workflows.getWorkflowStatus();
    case 'github_trigger_workflow':
      return workflows.triggerWorkflow(args.workflow_id, {
        branch: args.branch,
        inputs: args.inputs
      });
    case 'github_cancel_workflow_run':
      return workflows.cancelWorkflowRun(args.run_id);
    case 'github_rerun_workflow':
      return workflows.rerunWorkflow(args.run_id, {
        failedJobsOnly: args.failed_jobs_only
      });
    case 'github_get_workflow_jobs':
      return workflows.getWorkflowJobs(args.run_id);

    // Actions tools
    case 'github_get_recent_failures':
      return actions.getRecentFailures({ limit: args.limit });
    case 'github_diagnose_failure':
      return actions.diagnoseFailure(args.run_id);
    case 'github_quick_status':
      return actions.getQuickStatus();

    // Secrets tools
    case 'github_list_secrets':
      return secrets.listSecrets();
    case 'github_check_secret':
      return secrets.checkSecretExists(args.secret_name);
    case 'github_audit_secrets':
      return secrets.auditSecrets();
    case 'github_create_secret':
      return secrets.createSecret(args.secret_name, args.secret_value);
    case 'github_list_variables':
      return secrets.listVariables();

    // Repository tools
    case 'github_repo_info':
      return repository.getRepoInfo();
    case 'github_repo_health':
      return repository.getHealthStatus();
    case 'github_list_branches':
      return repository.listBranches({
        limit: args.limit,
        protected: args.protected
      });
    case 'github_list_prs':
      return repository.listPullRequests({
        state: args.state,
        limit: args.limit
      });
    case 'github_get_pr':
      return repository.getPullRequest(args.pr_number);
    case 'github_list_issues':
      return repository.listIssues({
        state: args.state,
        labels: args.labels,
        limit: args.limit
      });
    case 'github_create_issue':
      return repository.createIssue({
        title: args.title,
        body: args.body,
        labels: args.labels,
        assignees: args.assignees
      });
    case 'github_commit_status':
      return repository.getCommitStatus(args.commit_sha);
    case 'github_recent_commits':
      return repository.getRecentCommits({
        branch: args.branch,
        limit: args.limit
      });

    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'github-ops',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await handleTool(name, args || {});
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            stack: process.env.DEBUG ? error.stack : undefined
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// Start server
async function main() {
  // Validate environment
  if (!process.env.GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }
  if (!process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
    console.error('❌ GITHUB_OWNER and GITHUB_REPO environment variables are required');
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error(`🚀 GitHub Ops MCP Server started`);
  console.error(`   Repository: ${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
