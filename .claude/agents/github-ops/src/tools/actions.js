/**
 * GitHub Actions Tool
 * Higher-level operations for GitHub Actions - failure analysis, diagnostics
 */

import { Octokit } from '@octokit/rest';
import WorkflowsTool from './workflows.js';

export class ActionsTool {
  constructor(config = {}) {
    this.octokit = new Octokit({
      auth: config.token || process.env.GITHUB_TOKEN
    });
    this.owner = config.owner || process.env.GITHUB_OWNER;
    this.repo = config.repo || process.env.GITHUB_REPO;
    this.workflows = new WorkflowsTool(config);
  }

  /**
   * Get recent failures with analysis
   */
  async getRecentFailures(options = {}) {
    try {
      const runs = await this.workflows.getFailedRuns({
        limit: options.limit || 20
      });

      if (!runs.success) return runs;

      // Enrich with job details for failed runs
      const enrichedRuns = await Promise.all(
        runs.runs.slice(0, 10).map(async (run) => {
          const jobs = await this.workflows.getWorkflowJobs(run.id);
          const failedJobs = jobs.success 
            ? jobs.jobs.filter(j => j.conclusion === 'failure')
            : [];

          return {
            ...run,
            failed_jobs: failedJobs.map(j => ({
              name: j.name,
              duration_seconds: j.duration_seconds,
              failed_steps: j.steps?.filter(s => s.conclusion === 'failure').map(s => s.name) || []
            }))
          };
        })
      );

      // Analyze patterns
      const patterns = this.analyzeFailurePatterns(enrichedRuns);

      return {
        success: true,
        count: runs.count,
        failures: enrichedRuns,
        patterns
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze a specific workflow run failure
   */
  async diagnoseFailure(runId) {
    try {
      // Get run details
      const run = await this.workflows.getWorkflowRun(runId);
      if (!run.success) return run;

      // Get jobs
      const jobs = await this.workflows.getWorkflowJobs(runId);
      if (!jobs.success) return jobs;

      // Find failed jobs and steps
      const failedJobs = jobs.jobs.filter(j => j.conclusion === 'failure');
      
      // Analyze failure types
      const diagnosis = {
        run_id: runId,
        workflow: run.run.name,
        branch: run.run.branch,
        event: run.run.event,
        status: run.run.conclusion,
        duration_seconds: Math.round(
          (new Date(run.run.updated_at) - new Date(run.run.run_started_at)) / 1000
        ),
        failed_jobs: [],
        likely_cause: null,
        suggested_actions: [],
        quick_fix_available: false
      };

      for (const job of failedJobs) {
        const failedSteps = job.steps?.filter(s => s.conclusion === 'failure') || [];
        
        const jobDiagnosis = {
          name: job.name,
          duration_seconds: job.duration_seconds,
          failed_steps: failedSteps.map(s => s.name),
          failure_analysis: this.analyzeJobFailure(job)
        };

        diagnosis.failed_jobs.push(jobDiagnosis);
      }

      // Determine overall cause
      if (diagnosis.failed_jobs.length > 0) {
        const analyses = diagnosis.failed_jobs.map(j => j.failure_analysis);
        diagnosis.likely_cause = this.determineLikelyCause(analyses, run.run);
        diagnosis.suggested_actions = this.getSuggestedActions(diagnosis.likely_cause);
        diagnosis.quick_fix_available = this.canAutoFix(diagnosis.likely_cause);
      }

      return {
        success: true,
        diagnosis
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze patterns across multiple failures
   */
  analyzeFailurePatterns(failures) {
    const patterns = {
      by_workflow: {},
      by_job: {},
      by_step: {},
      by_branch: {},
      timing: {
        avg_duration_before_failure: 0,
        failures_under_10s: 0,
        failures_under_60s: 0
      }
    };

    let totalDuration = 0;

    for (const failure of failures) {
      // By workflow
      patterns.by_workflow[failure.name] = (patterns.by_workflow[failure.name] || 0) + 1;

      // By branch
      patterns.by_branch[failure.branch] = (patterns.by_branch[failure.branch] || 0) + 1;

      // Timing
      if (failure.duration_seconds) {
        totalDuration += failure.duration_seconds;
        if (failure.duration_seconds < 10) patterns.timing.failures_under_10s++;
        if (failure.duration_seconds < 60) patterns.timing.failures_under_60s++;
      }

      // By job and step
      for (const job of failure.failed_jobs || []) {
        patterns.by_job[job.name] = (patterns.by_job[job.name] || 0) + 1;
        for (const step of job.failed_steps || []) {
          patterns.by_step[step] = (patterns.by_step[step] || 0) + 1;
        }
      }
    }

    patterns.timing.avg_duration_before_failure = failures.length > 0 
      ? Math.round(totalDuration / failures.length) 
      : 0;

    // Insights
    patterns.insights = [];
    
    if (patterns.timing.failures_under_10s > failures.length * 0.5) {
      patterns.insights.push({
        type: 'early_failure',
        message: 'Most failures happen within 10 seconds - likely configuration/secrets issue',
        severity: 'high'
      });
    }

    const topWorkflow = Object.entries(patterns.by_workflow)
      .sort((a, b) => b[1] - a[1])[0];
    if (topWorkflow && topWorkflow[1] > 3) {
      patterns.insights.push({
        type: 'recurring_workflow',
        message: `Workflow "${topWorkflow[0]}" has ${topWorkflow[1]} recent failures`,
        severity: 'medium'
      });
    }

    return patterns;
  }

  /**
   * Analyze why a specific job failed
   */
  analyzeJobFailure(job) {
    const analysis = {
      category: 'unknown',
      confidence: 'low',
      details: []
    };

    // Fast failure (< 10s) usually means config/secrets issue
    if (job.duration_seconds && job.duration_seconds < 10) {
      analysis.category = 'configuration';
      analysis.confidence = 'high';
      analysis.details.push('Job failed very quickly - likely missing secrets or configuration');
    }

    // Check step names for hints
    const stepNames = job.steps?.map(s => s.name.toLowerCase()) || [];
    const failedStepNames = job.steps?.filter(s => s.conclusion === 'failure')
      .map(s => s.name.toLowerCase()) || [];

    // Common failure patterns
    if (failedStepNames.some(s => s.includes('checkout'))) {
      analysis.category = 'git';
      analysis.confidence = 'high';
      analysis.details.push('Git checkout failed - check repository permissions');
    }

    if (failedStepNames.some(s => s.includes('install') || s.includes('npm ci'))) {
      analysis.category = 'dependencies';
      analysis.confidence = 'high';
      analysis.details.push('Dependency installation failed - check package.json and lockfile');
    }

    if (failedStepNames.some(s => s.includes('build'))) {
      analysis.category = 'build';
      analysis.confidence = 'high';
      analysis.details.push('Build step failed - check for compilation errors');
    }

    if (failedStepNames.some(s => s.includes('test'))) {
      analysis.category = 'tests';
      analysis.confidence = 'high';
      analysis.details.push('Tests failed - review test output');
    }

    if (failedStepNames.some(s => s.includes('deploy'))) {
      analysis.category = 'deployment';
      analysis.confidence = 'high';
      analysis.details.push('Deployment failed - check deployment credentials and target');
    }

    if (failedStepNames.some(s => s.includes('secret') || s.includes('token') || s.includes('auth'))) {
      analysis.category = 'authentication';
      analysis.confidence = 'high';
      analysis.details.push('Authentication/secrets issue - verify credentials are configured');
    }

    return analysis;
  }

  /**
   * Determine the likely root cause across all failed jobs
   */
  determineLikelyCause(analyses, run) {
    // Count categories
    const categories = {};
    for (const analysis of analyses) {
      categories[analysis.category] = (categories[analysis.category] || 0) + 1;
    }

    // Most common category
    const sortedCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1]);

    if (sortedCategories.length === 0) {
      return {
        category: 'unknown',
        description: 'Unable to determine failure cause',
        confidence: 'low'
      };
    }

    const topCategory = sortedCategories[0][0];
    
    const causeDescriptions = {
      configuration: 'Missing or invalid configuration (likely secrets not set)',
      git: 'Git/repository access issue',
      dependencies: 'Package installation failure (npm/yarn)',
      build: 'Application build failure',
      tests: 'Test suite failure',
      deployment: 'Deployment target issue',
      authentication: 'Missing or expired credentials'
    };

    return {
      category: topCategory,
      description: causeDescriptions[topCategory] || 'Unknown failure type',
      confidence: analyses.find(a => a.category === topCategory)?.confidence || 'medium',
      all_categories: sortedCategories
    };
  }

  /**
   * Get suggested actions based on failure cause
   */
  getSuggestedActions(cause) {
    const actions = {
      configuration: [
        'Run `github-ops secrets audit` to check for missing secrets',
        'Verify all required environment variables are set in repository settings',
        'Check workflow file for typos in secret names'
      ],
      git: [
        'Verify repository exists and is accessible',
        'Check if GITHUB_TOKEN has required permissions',
        'Ensure branch exists and is not protected'
      ],
      dependencies: [
        'Run `npm ci` locally to verify lockfile is valid',
        'Check for peer dependency conflicts',
        'Clear npm cache and regenerate lockfile'
      ],
      build: [
        'Run `npm run build` locally to see detailed errors',
        'Check for TypeScript type errors',
        'Verify all required environment variables are available at build time'
      ],
      tests: [
        'Run `npm test` locally to see which tests fail',
        'Check if tests depend on external services that may be unavailable',
        'Review test timeouts'
      ],
      deployment: [
        'Verify deployment credentials (VERCEL_TOKEN, RAILWAY_TOKEN, etc.)',
        'Check deployment target is accessible',
        'Review deployment logs for specific error messages'
      ],
      authentication: [
        'Regenerate and update expired tokens',
        'Verify secret names match workflow references',
        'Check token scopes/permissions'
      ]
    };

    return actions[cause.category] || [
      'Review workflow logs for specific error messages',
      'Run the workflow locally using `act` for debugging',
      'Check recent commits for breaking changes'
    ];
  }

  /**
   * Check if we can auto-fix this failure type
   */
  canAutoFix(cause) {
    const autoFixable = ['configuration'];
    return autoFixable.includes(cause.category);
  }

  /**
   * Get quick summary for CLI/chat
   */
  async getQuickStatus() {
    try {
      const status = await this.workflows.getWorkflowStatus();
      if (!status.success) return status;

      const failures = await this.getRecentFailures({ limit: 10 });

      return {
        success: true,
        summary: {
          ...status.summary,
          has_issues: status.summary.recent_failures > 0,
          primary_issue: failures.patterns?.insights?.[0]?.message || 'No major issues detected'
        },
        quick_actions: status.summary.recent_failures > 0 ? [
          'Run `github-ops actions diagnose` on failed runs',
          'Run `github-ops secrets audit` to check configuration'
        ] : []
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default ActionsTool;
