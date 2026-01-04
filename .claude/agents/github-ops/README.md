# GitHub Operations Agent

AI-powered agent for managing GitHub repositories, workflows, actions, and secrets.

## Features

- **Workflow Management**: List, trigger, cancel, and diagnose GitHub Actions workflows
- **Failure Analysis**: Automatic analysis of workflow failures with remediation suggestions
- **Secrets Audit**: Verify required secrets are configured, identify missing/expired secrets
- **Repository Operations**: Branch management, PR operations, issue tracking
- **MCP Server**: Model Context Protocol server for Claude Desktop integration

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your GitHub token

# Run CLI
npm run cli -- workflows status

# Start MCP server (for Claude Desktop)
npm start
```

## Environment Variables

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=Parlay-Kei
GITHUB_REPO=datasolutions
```

**Getting a GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)" or use fine-grained tokens
3. For classic tokens, select scopes: `repo`, `workflow`
4. For fine-grained tokens, grant repository access with Actions and Secrets read permissions
5. Copy the token and add to `.env`

**Testing Your Token:**
```bash
npm run test-token
```

This will validate your token and check all required permissions.

## CLI Commands

```bash
# Workflow Operations
github-ops workflows list              # List all workflows
github-ops workflows status            # Get status of recent runs
github-ops workflows trigger <name>    # Trigger a workflow
github-ops workflows cancel <run-id>   # Cancel a running workflow
github-ops workflows logs <run-id>     # Get logs for a run

# Failure Analysis
github-ops actions failures            # List recent failures
github-ops actions diagnose <run-id>   # Diagnose a specific failure
github-ops actions fix <run-id>        # Attempt auto-remediation

# Secrets Management
github-ops secrets list                # List configured secrets
github-ops secrets audit               # Audit secrets vs. workflow requirements
github-ops secrets check <name>        # Check if a secret exists

# Repository Operations
github-ops repo status                 # Repository health check
github-ops branches list               # List branches
github-ops prs list                    # List open PRs
```

## MCP Server

Add to Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "github-ops": {
      "command": "node",
      "args": ["C:/Dev/.claude-anx/agents/github-ops/src/mcp/server.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxx",
        "GITHUB_OWNER": "stratanoble",
        "GITHUB_REPO": "dslv"
      }
    }
  }
}
```

## Troubleshooting

If you encounter authentication errors (401) or permission issues (403):

1. **Test your token:**
   ```bash
   npm run test-token
   ```

2. **Check the troubleshooting guide:**
   See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.

3. **Common issues:**
   - Token expired or revoked → Generate a new token
   - Missing permissions → Update token scopes
   - Wrong repository → Check `.env` file

## Architecture

```
github-ops/
├── src/
│   ├── agent.js           # Main agent orchestrator
│   ├── mcp/
│   │   └── server.js      # MCP server for Claude Desktop
│   ├── tools/
│   │   ├── workflows.js   # Workflow operations
│   │   ├── secrets.js     # Secrets management
│   │   ├── actions.js     # Actions/runs operations
│   │   └── repository.js  # Repo operations
│   ├── workflows/
│   │   ├── analyzer.js    # Failure analysis
│   │   └── remediator.js  # Auto-fix capabilities
│   └── cli/
│       └── index.js       # CLI interface
└── package.json
```

## Tool Capabilities

### Workflow Tools
- `list_workflows` - List all repository workflows
- `get_workflow_runs` - Get recent workflow runs with status
- `trigger_workflow` - Manually trigger a workflow
- `cancel_workflow_run` - Cancel an in-progress run
- `get_workflow_run_logs` - Retrieve logs for analysis
- `rerun_workflow` - Re-run a failed workflow

### Secrets Tools
- `list_secrets` - List configured repository secrets
- `check_secret_exists` - Verify a specific secret exists
- `audit_secrets` - Compare required vs. configured secrets
- `create_secret` - Create/update a repository secret

### Analysis Tools
- `diagnose_failure` - Analyze why a workflow failed
- `get_failure_patterns` - Identify recurring failure patterns
- `suggest_remediation` - Get fix suggestions for failures

### Repository Tools
- `get_repo_info` - Repository metadata and health
- `list_branches` - List all branches
- `list_pull_requests` - List open PRs
- `get_commit_status` - Check status of a commit
