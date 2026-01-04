# GitHub Operations Agent

## Agent Definition

**Name:** GitHub Operations Agent (`github-ops`)

**Purpose:** Automate GitHub repository management, workflow monitoring, failure diagnosis, and secrets auditing.

**Capabilities:**
- Monitor GitHub Actions workflows in real-time
- Diagnose workflow failures and suggest fixes
- Audit repository secrets against workflow requirements  
- Trigger, cancel, and re-run workflows
- Track pull requests, issues, and commits
- Provide repository health status

## Integration Methods

### 1. MCP Server (Claude Desktop)

Add to `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "github-ops": {
      "command": "node",
      "args": ["C:/Dev/.claude-anx/agents/github-ops/src/mcp/server.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here",
        "GITHUB_OWNER": "stratanoble",
        "GITHUB_REPO": "dslv"
      }
    }
  }
}
```

### 2. CLI

```bash
cd C:/Dev/.claude-anx/agents/github-ops
npm install
npm run cli -- status
npm run cli -- workflows status
npm run cli -- secrets audit
npm run cli -- actions failures
npm run cli -- diagnose
```

### 3. Programmatic (Node.js)

```javascript
import { GitHubOpsAgent } from './src/agent.js';

const agent = new GitHubOpsAgent({
  token: process.env.GITHUB_TOKEN,
  owner: 'stratanoble',
  repo: 'dslv'
});

const diagnostic = await agent.runDiagnostic();
console.log(diagnostic);
```

## Available Tools

### Workflow Tools
| Tool | Description |
|------|-------------|
| `github_list_workflows` | List all workflows |
| `github_get_workflow_runs` | Get recent runs with filtering |
| `github_get_workflow_status` | Quick status of all workflows |
| `github_trigger_workflow` | Manually trigger a workflow |
| `github_cancel_workflow_run` | Cancel running workflow |
| `github_rerun_workflow` | Re-run failed workflow |
| `github_get_workflow_jobs` | Get jobs for a run |

### Analysis Tools
| Tool | Description |
|------|-------------|
| `github_get_recent_failures` | Get failures with pattern analysis |
| `github_diagnose_failure` | Deep diagnosis of specific failure |
| `github_quick_status` | Fast health check |

### Secrets Tools
| Tool | Description |
|------|-------------|
| `github_list_secrets` | List configured secrets |
| `github_check_secret` | Check if secret exists |
| `github_audit_secrets` | Compare required vs configured |
| `github_create_secret` | Create/update secret |

### Repository Tools
| Tool | Description |
|------|-------------|
| `github_repo_info` | Repository metadata |
| `github_repo_health` | Health status summary |
| `github_list_branches` | List branches |
| `github_list_prs` | List pull requests |
| `github_get_pr` | PR details with checks |
| `github_list_issues` | List issues |
| `github_create_issue` | Create new issue |

## Example Conversations

**User:** "Why are my GitHub Actions failing?"

**Agent:** Uses `github_get_recent_failures` and `github_diagnose_failure` to:
1. List recent failures
2. Identify patterns (e.g., "Most failures happen within 10 seconds")
3. Determine likely cause (e.g., "Missing secrets")
4. Suggest specific fixes

**User:** "Check if I have all the secrets configured"

**Agent:** Uses `github_audit_secrets` to:
1. List all configured secrets
2. Compare against known requirements
3. Identify missing secrets by service
4. Provide link to configure missing secrets

**User:** "Re-run the failed deploy workflow"

**Agent:** Uses `github_get_recent_failures` then `github_rerun_workflow` to:
1. Find the most recent failed deploy run
2. Re-run it (optionally only failed jobs)
3. Report the new run ID

## Required GitHub Token Scopes

For full functionality, the GitHub Personal Access Token needs:

- `repo` - Full repository access
- `workflow` - Update GitHub Action workflows
- `admin:repo_hook` - Manage hooks (optional)

## Error Handling

The agent returns structured responses:

```json
{
  "success": true,
  "data": { ... }
}
```

Or on error:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Maintenance

- Token expiration: Regenerate GitHub token if 401 errors occur
- Rate limits: GitHub API has rate limits (5000 requests/hour for authenticated)
- Webhook integration: Consider adding webhook receiver for real-time failure alerts
