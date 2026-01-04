/**
 * GitHub Workflows Tool
 * Manage GitHub Actions workflows - list, trigger, cancel, get status
 */

import { Octokit } from '@octokit/rest';

export class WorkflowsTool {
  constructor(config = {}) {
    this.octokit = new Octokit({
      auth: config.token || process.env.GITHUB_TOKEN
    });
    this.owner = config.owner || process.env.GITHUB_OWNER;
    this.repo = config.repo || process.env.GITHUB_REPO;
  }

  /**
   * List all workflows in the repository
   */
  async listWorkflows() {
    try {
      const { data } = await this.octokit.actions.listRepoWorkflows({
        owner: this.owner,
        repo: this.repo
      });

      return {
        success: true,
        count: data.total_count,
        workflows: data.workflows.map(w => ({
          id: w.id,
          name: w.name,
          path: w.path,
          state: w.state,
          url: w.html_url,
          badge_url: w.badge_url
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get recent workflow runs with status
   */
  async getWorkflowRuns(options = {}) {
    try {
      const params = {
        owner: this.owner,
        repo: this.repo,
        per_page: options.limit || 20
      };

      if (options.workflowId) {
        params.workflow_id = options.workflowId;
      }
      if (options.branch) {
        params.branch = options.branch;
      }
      if (options.status) {
        params.status = options.status; // queued, in_progress, completed
      }
      if (options.conclusion) {
        params.conclusion = options.conclusion; // success, failure, cancelled, skipped
      }

      const { data } = await this.octokit.actions.listWorkflowRunsForRepo(params);

      return {
        success: true,
        count: data.total_count,
        runs: data.workflow_runs.map(run => ({
          id: run.id,
          name: run.name,
          workflow_id: run.workflow_id,
          status: run.status,
          conclusion: run.conclusion,
          branch: run.head_branch,
          commit_sha: run.head_sha?.substring(0, 7),
          commit_message: run.head_commit?.message?.split('\n')[0],
          event: run.event,
          created_at: run.created_at,
          updated_at: run.updated_at,
          run_started_at: run.run_started_at,
          url: run.html_url,
          duration_seconds: run.run_started_at 
            ? Math.round((new Date(run.updated_at) - new Date(run.run_started_at)) / 1000)
            : null
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get failed workflow runs
   */
  async getFailedRuns(options = {}) {
    return this.getWorkflowRuns({
      ...options,
      conclusion: 'failure'
    });
  }

  /**
   * Get a specific workflow run
   */
  async getWorkflowRun(runId) {
    try {
      const { data } = await this.octokit.actions.getWorkflowRun({
        owner: this.owner,
        repo: this.repo,
        run_id: runId
      });

      return {
        success: true,
        run: {
          id: data.id,
          name: data.name,
          workflow_id: data.workflow_id,
          status: data.status,
          conclusion: data.conclusion,
          branch: data.head_branch,
          commit_sha: data.head_sha,
          commit_message: data.head_commit?.message,
          event: data.event,
          triggering_actor: data.triggering_actor?.login,
          created_at: data.created_at,
          updated_at: data.updated_at,
          run_started_at: data.run_started_at,
          url: data.html_url,
          jobs_url: data.jobs_url,
          logs_url: data.logs_url
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get jobs for a workflow run
   */
  async getWorkflowJobs(runId) {
    try {
      const { data } = await this.octokit.actions.listJobsForWorkflowRun({
        owner: this.owner,
        repo: this.repo,
        run_id: runId
      });

      return {
        success: true,
        count: data.total_count,
        jobs: data.jobs.map(job => ({
          id: job.id,
          name: job.name,
          status: job.status,
          conclusion: job.conclusion,
          started_at: job.started_at,
          completed_at: job.completed_at,
          duration_seconds: job.started_at && job.completed_at
            ? Math.round((new Date(job.completed_at) - new Date(job.started_at)) / 1000)
            : null,
          steps: job.steps?.map(step => ({
            name: step.name,
            status: step.status,
            conclusion: step.conclusion,
            number: step.number
          })),
          url: job.html_url
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger a workflow dispatch
   */
  async triggerWorkflow(workflowId, options = {}) {
    try {
      await this.octokit.actions.createWorkflowDispatch({
        owner: this.owner,
        repo: this.repo,
        workflow_id: workflowId,
        ref: options.ref || options.branch || 'main',
        inputs: options.inputs || {}
      });

      return {
        success: true,
        message: `Workflow ${workflowId} triggered on ${options.ref || 'main'}`,
        note: 'Check workflow runs in a few seconds for the new run'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel a workflow run
   */
  async cancelWorkflowRun(runId) {
    try {
      await this.octokit.actions.cancelWorkflowRun({
        owner: this.owner,
        repo: this.repo,
        run_id: runId
      });

      return {
        success: true,
        message: `Workflow run ${runId} cancelled`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Re-run a failed workflow
   */
  async rerunWorkflow(runId, options = {}) {
    try {
      if (options.failedJobsOnly) {
        await this.octokit.actions.reRunWorkflowFailedJobs({
          owner: this.owner,
          repo: this.repo,
          run_id: runId
        });
      } else {
        await this.octokit.actions.reRunWorkflow({
          owner: this.owner,
          repo: this.repo,
          run_id: runId
        });
      }

      return {
        success: true,
        message: `Workflow run ${runId} re-run triggered`,
        failedJobsOnly: options.failedJobsOnly || false
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Download workflow run logs
   */
  async getWorkflowLogs(runId) {
    try {
      const { data } = await this.octokit.actions.downloadWorkflowRunLogs({
        owner: this.owner,
        repo: this.repo,
        run_id: runId
      });

      return {
        success: true,
        logs: data,
        note: 'Logs returned as zip archive'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get workflow run usage/billing
   */
  async getWorkflowUsage(runId) {
    try {
      const { data } = await this.octokit.actions.getWorkflowRunUsage({
        owner: this.owner,
        repo: this.repo,
        run_id: runId
      });

      return {
        success: true,
        usage: {
          billable: data.billable,
          run_duration_ms: data.run_duration_ms
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get quick status summary of all workflows
   */
  async getWorkflowStatus() {
    try {
      // Get workflows
      const workflows = await this.listWorkflows();
      if (!workflows.success) return workflows;

      // Get recent runs
      const runs = await this.getWorkflowRuns({ limit: 50 });
      if (!runs.success) return runs;

      // Group runs by workflow
      const statusByWorkflow = {};
      for (const workflow of workflows.workflows) {
        const workflowRuns = runs.runs.filter(r => r.workflow_id === workflow.id);
        const latestRun = workflowRuns[0];
        
        statusByWorkflow[workflow.name] = {
          id: workflow.id,
          path: workflow.path,
          state: workflow.state,
          latest_run: latestRun ? {
            id: latestRun.id,
            status: latestRun.status,
            conclusion: latestRun.conclusion,
            branch: latestRun.branch,
            created_at: latestRun.created_at,
            duration_seconds: latestRun.duration_seconds
          } : null,
          recent_failures: workflowRuns.filter(r => r.conclusion === 'failure').length,
          recent_successes: workflowRuns.filter(r => r.conclusion === 'success').length
        };
      }

      // Summary stats
      const allLatest = Object.values(statusByWorkflow).map(w => w.latest_run).filter(Boolean);
      const summary = {
        total_workflows: workflows.count,
        active_workflows: workflows.workflows.filter(w => w.state === 'active').length,
        currently_running: allLatest.filter(r => r.status === 'in_progress').length,
        recent_failures: allLatest.filter(r => r.conclusion === 'failure').length,
        recent_successes: allLatest.filter(r => r.conclusion === 'success').length
      };

      return {
        success: true,
        summary,
        workflows: statusByWorkflow
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default WorkflowsTool;
