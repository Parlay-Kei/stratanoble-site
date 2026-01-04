/**
 * GitHub Repository Tool
 * Repository-level operations - branches, PRs, commits, status
 */

import { Octokit } from '@octokit/rest';

export class RepositoryTool {
  constructor(config = {}) {
    this.octokit = new Octokit({
      auth: config.token || process.env.GITHUB_TOKEN
    });
    this.owner = config.owner || process.env.GITHUB_OWNER;
    this.repo = config.repo || process.env.GITHUB_REPO;
  }

  /**
   * Get repository information
   */
  async getRepoInfo() {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner: this.owner,
        repo: this.repo
      });

      return {
        success: true,
        repo: {
          name: data.name,
          full_name: data.full_name,
          description: data.description,
          private: data.private,
          default_branch: data.default_branch,
          visibility: data.visibility,
          url: data.html_url,
          clone_url: data.clone_url,
          created_at: data.created_at,
          updated_at: data.updated_at,
          pushed_at: data.pushed_at,
          size: data.size,
          language: data.language,
          topics: data.topics,
          has_issues: data.has_issues,
          has_projects: data.has_projects,
          has_wiki: data.has_wiki,
          open_issues_count: data.open_issues_count,
          forks_count: data.forks_count,
          stargazers_count: data.stargazers_count,
          watchers_count: data.watchers_count
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List repository branches
   */
  async listBranches(options = {}) {
    try {
      const { data } = await this.octokit.rest.repos.listBranches({
        owner: this.owner,
        repo: this.repo,
        per_page: options.limit || 30,
        protected: options.protected
      });

      return {
        success: true,
        count: data.length,
        branches: data.map(b => ({
          name: b.name,
          protected: b.protected,
          commit_sha: b.commit.sha.substring(0, 7)
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get branch details
   */
  async getBranch(branchName) {
    try {
      const { data } = await this.octokit.rest.repos.getBranch({
        owner: this.owner,
        repo: this.repo,
        branch: branchName
      });

      return {
        success: true,
        branch: {
          name: data.name,
          protected: data.protected,
          commit: {
            sha: data.commit.sha,
            message: data.commit.commit.message,
            author: data.commit.commit.author.name,
            date: data.commit.commit.author.date
          },
          protection: data.protection ? {
            enabled: true,
            required_status_checks: data.protection.required_status_checks,
            enforce_admins: data.protection.enforce_admins?.enabled
          } : null
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List open pull requests
   */
  async listPullRequests(options = {}) {
    try {
      const { data } = await this.octokit.rest.pulls.list({
        owner: this.owner,
        repo: this.repo,
        state: options.state || 'open',
        sort: options.sort || 'updated',
        direction: options.direction || 'desc',
        per_page: options.limit || 20
      });

      return {
        success: true,
        count: data.length,
        pull_requests: data.map(pr => ({
          number: pr.number,
          title: pr.title,
          state: pr.state,
          draft: pr.draft,
          user: pr.user.login,
          head_branch: pr.head.ref,
          base_branch: pr.base.ref,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          mergeable: pr.mergeable,
          mergeable_state: pr.mergeable_state,
          labels: pr.labels.map(l => l.name),
          url: pr.html_url
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get pull request details
   */
  async getPullRequest(prNumber) {
    try {
      const { data } = await this.octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });

      // Get PR checks
      const checks = await this.getCommitStatus(data.head.sha);

      return {
        success: true,
        pull_request: {
          number: data.number,
          title: data.title,
          body: data.body,
          state: data.state,
          draft: data.draft,
          user: data.user.login,
          head_branch: data.head.ref,
          head_sha: data.head.sha,
          base_branch: data.base.ref,
          created_at: data.created_at,
          updated_at: data.updated_at,
          merged: data.merged,
          merged_at: data.merged_at,
          merged_by: data.merged_by?.login,
          mergeable: data.mergeable,
          mergeable_state: data.mergeable_state,
          comments: data.comments,
          review_comments: data.review_comments,
          commits: data.commits,
          additions: data.additions,
          deletions: data.deletions,
          changed_files: data.changed_files,
          labels: data.labels.map(l => l.name),
          url: data.html_url,
          checks: checks.success ? checks.statuses : []
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get commit status/checks
   */
  async getCommitStatus(commitSha) {
    try {
      // Get combined status
      const { data: status } = await this.octokit.rest.repos.getCombinedStatusForRef({
        owner: this.owner,
        repo: this.repo,
        ref: commitSha
      });

      // Get check runs (may fail with 403 if token lacks permissions)
      let checks = { check_runs: [] };
      try {
        const checksResponse = await this.octokit.rest.checks.listForRef({
          owner: this.owner,
          repo: this.repo,
          ref: commitSha
        });
        checks = checksResponse.data;
      } catch (checksError) {
        // If we can't access checks, continue with status only
        if (checksError.status === 403) {
          // Token lacks checks:read permission, but we can still return status
          console.warn(`Warning: Cannot access check runs (403). Token may need 'checks:read' permission.`);
        } else {
          throw checksError;
        }
      }

      return {
        success: true,
        sha: commitSha.substring(0, 7),
        state: status.state || 'unknown',
        statuses: status.statuses?.map(s => ({
          context: s.context,
          state: s.state,
          description: s.description,
          target_url: s.target_url
        })) || [],
        check_runs: checks.check_runs?.map(c => ({
          name: c.name,
          status: c.status,
          conclusion: c.conclusion,
          started_at: c.started_at,
          completed_at: c.completed_at,
          url: c.html_url
        })) || []
      };
    } catch (error) {
      // Handle 403 errors gracefully - token may not have status:read permission
      if (error.status === 403) {
        return {
          success: false,
          error: 'Permission denied. Token may need "Statuses: Read" permission for commit status checks.',
          state: 'unknown',
          statuses: [],
          check_runs: []
        };
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Get recent commits
   */
  async getRecentCommits(options = {}) {
    try {
      const { data } = await this.octokit.rest.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        sha: options.branch || 'main',
        per_page: options.limit || 20
      });

      return {
        success: true,
        count: data.length,
        commits: data.map(c => ({
          sha: c.sha.substring(0, 7),
          message: c.commit.message.split('\n')[0],
          author: c.commit.author.name,
          date: c.commit.author.date,
          url: c.html_url
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List open issues
   */
  async listIssues(options = {}) {
    try {
      const { data } = await this.octokit.rest.issues.listForRepo({
        owner: this.owner,
        repo: this.repo,
        state: options.state || 'open',
        sort: options.sort || 'updated',
        direction: options.direction || 'desc',
        per_page: options.limit || 20,
        labels: options.labels
      });

      // Filter out PRs (they're also issues in GitHub API)
      const issues = data.filter(i => !i.pull_request);

      return {
        success: true,
        count: issues.length,
        issues: issues.map(i => ({
          number: i.number,
          title: i.title,
          state: i.state,
          user: i.user.login,
          labels: i.labels.map(l => l.name),
          assignees: i.assignees.map(a => a.login),
          created_at: i.created_at,
          updated_at: i.updated_at,
          comments: i.comments,
          url: i.html_url
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create an issue
   */
  async createIssue(options) {
    try {
      const { data } = await this.octokit.rest.issues.create({
        owner: this.owner,
        repo: this.repo,
        title: options.title,
        body: options.body,
        labels: options.labels,
        assignees: options.assignees
      });

      return {
        success: true,
        issue: {
          number: data.number,
          title: data.title,
          state: data.state,
          url: data.html_url
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get repository health/status summary
   */
  async getHealthStatus() {
    try {
      const [repo, branches, prs, issues] = await Promise.all([
        this.getRepoInfo(),
        this.listBranches({ limit: 10 }),
        this.listPullRequests({ limit: 10 }),
        this.listIssues({ limit: 10 })
      ]);

      // Get latest commit status on default branch
      const defaultBranch = repo.success ? repo.repo.default_branch : 'main';
      const branch = await this.getBranch(defaultBranch);
      let commitStatus = null;
      
      if (branch.success) {
        commitStatus = await this.getCommitStatus(branch.branch.commit.sha);
        // If status check failed due to permissions, try to get workflow runs instead
        if (!commitStatus.success && commitStatus.error?.includes('Permission denied')) {
          // Fallback: use workflow runs to determine branch status
          try {
            const { data: runs } = await this.octokit.rest.actions.listWorkflowRunsForRepo({
              owner: this.owner,
              repo: this.repo,
              branch: defaultBranch,
              per_page: 1
            });
            if (runs.workflow_runs.length > 0) {
              const latestRun = runs.workflow_runs[0];
              commitStatus = {
                success: true,
                state: latestRun.conclusion === 'success' ? 'success' : 
                       latestRun.conclusion === 'failure' ? 'failure' : 'pending',
                statuses: [],
                check_runs: []
              };
            }
          } catch (workflowError) {
            // If workflow check also fails, use unknown status
            commitStatus = {
              success: false,
              state: 'unknown',
              statuses: [],
              check_runs: []
            };
          }
        }
      }

      return {
        success: true,
        health: {
          repository: repo.success ? {
            name: repo.repo.name,
            visibility: repo.repo.visibility,
            default_branch: repo.repo.default_branch,
            last_push: repo.repo.pushed_at
          } : null,
          default_branch_status: commitStatus?.success ? commitStatus.state : 'unknown',
          open_prs: prs.success ? prs.count : 0,
          open_issues: issues.success ? issues.count : 0,
          branches: branches.success ? branches.count : 0,
          checks_passing: commitStatus?.success 
            ? commitStatus.check_runs.filter(c => c.conclusion === 'success').length
            : 0,
          checks_failing: commitStatus?.success
            ? commitStatus.check_runs.filter(c => c.conclusion === 'failure').length
            : 0
        },
        issues: {
          needs_attention: [
            ...(prs.success ? prs.pull_requests.filter(pr => pr.mergeable_state === 'dirty') : []),
          ]
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default RepositoryTool;
