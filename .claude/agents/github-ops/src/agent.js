/**
 * GitHub Operations Agent
 * Main agent orchestrator
 */

import WorkflowsTool from './tools/workflows.js';
import SecretsTool from './tools/secrets.js';
import ActionsTool from './tools/actions.js';
import RepositoryTool from './tools/repository.js';

export class GitHubOpsAgent {
  constructor(config = {}) {
    this.config = {
      token: config.token || process.env.GITHUB_TOKEN,
      owner: config.owner || process.env.GITHUB_OWNER,
      repo: config.repo || process.env.GITHUB_REPO
    };

    this.workflows = new WorkflowsTool(this.config);
    this.secrets = new SecretsTool(this.config);
    this.actions = new ActionsTool(this.config);
    this.repository = new RepositoryTool(this.config);
  }

  /**
   * Run a full diagnostic
   */
  async runDiagnostic() {
    const results = {
      timestamp: new Date().toISOString(),
      repository: `${this.config.owner}/${this.config.repo}`,
      checks: {}
    };

    // Check secrets
    const secretsAudit = await this.secrets.auditSecrets();
    results.checks.secrets = {
      status: secretsAudit.success && secretsAudit.summary.ready_for_deployment ? 'pass' : 'fail',
      configured: secretsAudit.summary?.total_configured || 0,
      missing: secretsAudit.summary?.total_missing || 0,
      details: secretsAudit.missing || []
    };

    // Check recent failures
    const failures = await this.actions.getRecentFailures({ limit: 10 });
    results.checks.workflows = {
      status: failures.success && failures.failures.length === 0 ? 'pass' : 'warn',
      recent_failures: failures.failures?.length || 0,
      patterns: failures.patterns?.insights || []
    };

    // Check repo health
    const health = await this.repository.getHealthStatus();
    results.checks.repository = {
      status: health.success && health.health.default_branch_status === 'success' ? 'pass' : 'warn',
      branch_status: health.health?.default_branch_status,
      open_prs: health.health?.open_prs || 0,
      checks_failing: health.health?.checks_failing || 0
    };

    // Overall status
    const statuses = Object.values(results.checks).map(c => c.status);
    results.overall_status = statuses.includes('fail') ? 'fail' : 
                             statuses.includes('warn') ? 'warn' : 'pass';

    return results;
  }

  /**
   * Handle a natural language request
   */
  async handleRequest(request) {
    const lower = request.toLowerCase();

    // Status queries
    if (lower.includes('status') || lower.includes('health')) {
      return this.actions.getQuickStatus();
    }

    // Failure queries
    if (lower.includes('fail') || lower.includes('error') || lower.includes('broken')) {
      return this.actions.getRecentFailures({ limit: 10 });
    }

    // Secrets queries
    if (lower.includes('secret') || lower.includes('credential')) {
      return this.secrets.auditSecrets();
    }

    // Workflow queries
    if (lower.includes('workflow') || lower.includes('action')) {
      return this.workflows.getWorkflowStatus();
    }

    // PR queries
    if (lower.includes('pr') || lower.includes('pull request')) {
      return this.repository.listPullRequests({ state: 'open' });
    }

    // Default to diagnostic
    return this.runDiagnostic();
  }
}

export default GitHubOpsAgent;

// Export tools for direct use
export { WorkflowsTool, SecretsTool, ActionsTool, RepositoryTool };
