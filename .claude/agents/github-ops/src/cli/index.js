#!/usr/bin/env node

/**
 * GitHub Operations CLI
 * Command-line interface for GitHub operations
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { table } from 'table';
import dotenv from 'dotenv';

import WorkflowsTool from '../tools/workflows.js';
import SecretsTool from '../tools/secrets.js';
import ActionsTool from '../tools/actions.js';
import RepositoryTool from '../tools/repository.js';

// Load environment variables
dotenv.config();

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

// Helpers
function statusIcon(status, conclusion) {
  if (status === 'in_progress') return chalk.yellow('⏳');
  if (status === 'queued') return chalk.gray('⏸️');
  if (conclusion === 'success') return chalk.green('✅');
  if (conclusion === 'failure') return chalk.red('❌');
  if (conclusion === 'cancelled') return chalk.gray('⊘');
  if (conclusion === 'skipped') return chalk.gray('⊝');
  return chalk.gray('?');
}

function formatDuration(seconds) {
  if (!seconds) return '-';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Create CLI
const program = new Command();

program
  .name('github-ops')
  .description('GitHub Operations CLI - Manage workflows, actions, and secrets')
  .version('1.0.0');

// ============ Workflows Commands ============
const workflowsCmd = program.command('workflows').description('Manage GitHub Actions workflows');

workflowsCmd
  .command('list')
  .description('List all workflows')
  .action(async () => {
    const spinner = ora('Fetching workflows...').start();
    const result = await workflows.listWorkflows();
    spinner.stop();

    if (!result.success) {
      console.error(chalk.red(`Error: ${result.error}`));
      return;
    }

    console.log(chalk.bold(`\n📋 Workflows (${result.count})\n`));

    const data = [
      [chalk.bold('Name'), chalk.bold('State'), chalk.bold('Path')]
    ];

    for (const w of result.workflows) {
      data.push([
        w.name,
        w.state === 'active' ? chalk.green(w.state) : chalk.gray(w.state),
        chalk.gray(w.path)
      ]);
    }

    console.log(table(data));
  });

workflowsCmd
  .command('status')
  .description('Get status of all workflows')
  .action(async () => {
    const spinner = ora('Fetching workflow status...').start();
    const result = await workflows.getWorkflowStatus();
    spinner.stop();

    if (!result.success) {
      console.error(chalk.red(`Error: ${result.error}`));
      return;
    }

    console.log(chalk.bold('\n📊 Workflow Status Summary\n'));
    console.log(`  Total Workflows: ${result.summary.total_workflows}`);
    console.log(`  Active: ${result.summary.active_workflows}`);
    console.log(`  Currently Running: ${chalk.yellow(result.summary.currently_running)}`);
    console.log(`  Recent Failures: ${result.summary.recent_failures > 0 ? chalk.red(result.summary.recent_failures) : chalk.green(0)}`);
    console.log(`  Recent Successes: ${chalk.green(result.summary.recent_successes)}`);

    console.log(chalk.bold('\n📋 Per-Workflow Status\n'));

    const data = [
      [chalk.bold('Workflow'), chalk.bold('Status'), chalk.bold('Branch'), chalk.bold('Duration'), chalk.bold('Time')]
    ];

    for (const [name, info] of Object.entries(result.workflows)) {
      const run = info.latest_run;
      data.push([
        name.substring(0, 40),
        run ? statusIcon(run.status, run.conclusion) : chalk.gray('No runs'),
        run?.branch || '-',
        formatDuration(run?.duration_seconds),
        formatDate(run?.created_at)
      ]);
    }

    console.log(table(data));
  });

workflowsCmd
  .command('runs')
  .description('Get recent workflow runs')
  .option('-l, --limit <n>', 'Number of runs', '20')
  .option('-s, --status <status>', 'Filter by status')
  .option('-c, --conclusion <conclusion>', 'Filter by conclusion')
  .option('-b, --branch <branch>', 'Filter by branch')
  .action(async (opts) => {
    const spinner = ora('Fetching workflow runs...').start();
    const result = await workflows.getWorkflowRuns({
      limit: parseInt(opts.limit),
      status: opts.status,
      conclusion: opts.conclusion,
      branch: opts.branch
    });
    spinner.stop();

    if (!result.success) {
      console.error(chalk.red(`Error: ${result.error}`));
      return;
    }

    console.log(chalk.bold(`\n🔄 Recent Runs (${result.runs.length})\n`));

    const data = [
      [chalk.bold('ID'), chalk.bold('Workflow'), chalk.bold('Status'), chalk.bold('Branch'), chalk.bold('Duration'), chalk.bold('Time')]
    ];

    for (const run of result.runs) {
      data.push([
        run.id.toString(),
        run.name.substring(0, 30),
        statusIcon(run.status, run.conclusion),
        run.branch,
        formatDuration(run.duration_seconds),
        formatDate(run.created_at)
      ]);
    }

    console.log(table(data));
  });

workflowsCmd
  .command('trigger <workflow>')
  .description('Trigger a workflow')
  .option('-b, --branch <branch>', 'Branch to run on', 'main')
  .action(async (workflow, opts) => {
    const spinner = ora(`Triggering ${workflow}...`).start();
    const result = await workflows.triggerWorkflow(workflow, { branch: opts.branch });
    spinner.stop();

    if (result.success) {
      console.log(chalk.green(`✅ ${result.message}`));
      console.log(chalk.gray(result.note));
    } else {
      console.error(chalk.red(`Error: ${result.error}`));
    }
  });

workflowsCmd
  .command('cancel <runId>')
  .description('Cancel a workflow run')
  .action(async (runId) => {
    const spinner = ora('Cancelling...').start();
    const result = await workflows.cancelWorkflowRun(parseInt(runId));
    spinner.stop();

    if (result.success) {
      console.log(chalk.green(`✅ ${result.message}`));
    } else {
      console.error(chalk.red(`Error: ${result.error}`));
    }
  });

workflowsCmd
  .command('rerun <runId>')
  .description('Re-run a workflow')
  .option('-f, --failed-only', 'Only re-run failed jobs')
  .action(async (runId, opts) => {
    const spinner = ora('Re-running...').start();
    const result = await workflows.rerunWorkflow(parseInt(runId), { failedJobsOnly: opts.failedOnly });
    spinner.stop();

    if (result.success) {
      console.log(chalk.green(`✅ ${result.message}`));
    } else {
      console.error(chalk.red(`Error: ${result.error}`));
    }
  });

// ============ Actions Commands ============
const actionsCmd = program.command('actions').description('GitHub Actions analysis and diagnostics');

actionsCmd
  .command('failures')
  .description('List recent failures with analysis')
  .option('-l, --limit <n>', 'Number of failures', '10')
  .action(async (opts) => {
    const spinner = ora('Analyzing failures...').start();
    const result = await actions.getRecentFailures({ limit: parseInt(opts.limit) });
    spinner.stop();

    if (!result.success) {
      console.error(chalk.red(`Error: ${result.error}`));
      return;
    }

    if (result.failures.length === 0) {
      console.log(chalk.green('\n✅ No recent failures!\n'));
      return;
    }

    console.log(chalk.bold(`\n❌ Recent Failures (${result.failures.length})\n`));

    const data = [
      [chalk.bold('ID'), chalk.bold('Workflow'), chalk.bold('Branch'), chalk.bold('Duration'), chalk.bold('Time'), chalk.bold('Failed Jobs')]
    ];

    for (const f of result.failures) {
      data.push([
        f.id.toString(),
        f.name.substring(0, 25),
        f.branch,
        formatDuration(f.duration_seconds),
        formatDate(f.created_at),
        f.failed_jobs?.map(j => j.name).join(', ').substring(0, 30) || '-'
      ]);
    }

    console.log(table(data));

    // Show insights
    if (result.patterns?.insights?.length > 0) {
      console.log(chalk.bold('\n💡 Insights\n'));
      for (const insight of result.patterns.insights) {
        const color = insight.severity === 'high' ? chalk.red : chalk.yellow;
        console.log(`  ${color('•')} ${insight.message}`);
      }
      console.log();
    }
  });

actionsCmd
  .command('diagnose <runId>')
  .description('Diagnose why a workflow run failed')
  .action(async (runId) => {
    const spinner = ora('Diagnosing failure...').start();
    const result = await actions.diagnoseFailure(parseInt(runId));
    spinner.stop();

    if (!result.success) {
      console.error(chalk.red(`Error: ${result.error}`));
      return;
    }

    const d = result.diagnosis;

    console.log(chalk.bold('\n🔍 Failure Diagnosis\n'));
    console.log(`  Run ID: ${d.run_id}`);
    console.log(`  Workflow: ${d.workflow}`);
    console.log(`  Branch: ${d.branch}`);
    console.log(`  Event: ${d.event}`);
    console.log(`  Duration: ${formatDuration(d.duration_seconds)}`);

    if (d.likely_cause) {
      console.log(chalk.bold('\n🎯 Likely Cause\n'));
      console.log(`  Category: ${chalk.yellow(d.likely_cause.category)}`);
      console.log(`  Description: ${d.likely_cause.description}`);
      console.log(`  Confidence: ${d.likely_cause.confidence}`);
    }

    if (d.failed_jobs?.length > 0) {
      console.log(chalk.bold('\n❌ Failed Jobs\n'));
      for (const job of d.failed_jobs) {
        console.log(`  ${chalk.red('•')} ${job.name}`);
        console.log(`    Duration: ${formatDuration(job.duration_seconds)}`);
        if (job.failed_steps?.length > 0) {
          console.log(`    Failed Steps: ${job.failed_steps.join(', ')}`);
        }
      }
    }

    if (d.suggested_actions?.length > 0) {
      console.log(chalk.bold('\n💡 Suggested Actions\n'));
      for (const action of d.suggested_actions) {
        console.log(`  ${chalk.green('→')} ${action}`);
      }
    }

    if (d.quick_fix_available) {
      console.log(chalk.bold('\n⚡ Quick Fix Available\n'));
      console.log(`  Run: ${chalk.cyan('github-ops actions fix ' + d.run_id)}`);
    }

    console.log();
  });

// ============ Secrets Commands ============
const secretsCmd = program.command('secrets').description('Manage repository secrets');

secretsCmd
  .command('list')
  .description('List all repository secrets')
  .action(async () => {
    const spinner = ora('Fetching secrets...').start();
    const result = await secrets.listSecrets();
    spinner.stop();

    if (!result.success) {
      console.error(chalk.red(`Error: ${result.error}`));
      return;
    }

    console.log(chalk.bold(`\n🔐 Secrets (${result.count})\n`));

    const data = [
      [chalk.bold('Name'), chalk.bold('Updated')]
    ];

    for (const s of result.secrets) {
      data.push([s.name, formatDate(s.updated_at)]);
    }

    console.log(table(data));
  });

secretsCmd
  .command('audit')
  .description('Audit secrets against workflow requirements')
  .action(async () => {
    const spinner = ora('Auditing secrets...').start();
    const result = await secrets.auditSecrets();
    spinner.stop();

    if (!result.success) {
      console.error(chalk.red(`Error: ${result.error}`));
      return;
    }

    console.log(chalk.bold('\n🔍 Secrets Audit\n'));

    // Summary
    const ready = result.summary.ready_for_deployment;
    console.log(`  Status: ${ready ? chalk.green('✅ Ready for deployment') : chalk.red('❌ Missing required secrets')}`);
    console.log(`  Configured: ${chalk.green(result.summary.total_configured)}`);
    console.log(`  Missing: ${result.summary.total_missing > 0 ? chalk.red(result.summary.total_missing) : chalk.green(0)}`);

    // By service
    console.log(chalk.bold('\n📊 By Service\n'));
    for (const [service, info] of Object.entries(result.by_service)) {
      const status = info.missing.length === 0 ? chalk.green('✅') : chalk.red('❌');
      console.log(`  ${status} ${service}`);
      if (info.configured.length > 0) {
        console.log(chalk.gray(`     Configured: ${info.configured.join(', ')}`));
      }
      if (info.missing.length > 0) {
        console.log(chalk.red(`     Missing: ${info.missing.join(', ')}`));
      }
    }

    // Action required
    if (result.summary.total_missing > 0) {
      console.log(chalk.bold('\n⚠️  Action Required\n'));
      console.log(`  ${result.action_required}`);
      console.log(chalk.gray(`  Configure at: https://github.com/${config.owner}/${config.repo}/settings/secrets/actions`));
    }

    console.log();
  });

secretsCmd
  .command('check <name>')
  .description('Check if a secret exists')
  .action(async (name) => {
    const spinner = ora(`Checking ${name}...`).start();
    const result = await secrets.checkSecretExists(name);
    spinner.stop();

    if (!result.success) {
      console.error(chalk.red(`Error: ${result.error}`));
      return;
    }

    if (result.exists) {
      console.log(chalk.green(`✅ Secret "${name}" exists`));
    } else {
      console.log(chalk.red(`❌ Secret "${name}" does not exist`));
    }
  });

// ============ Repo Commands ============
const repoCmd = program.command('repo').description('Repository operations');

repoCmd
  .command('status')
  .description('Get repository health status')
  .action(async () => {
    const spinner = ora('Checking repository health...').start();
    const result = await repository.getHealthStatus();
    spinner.stop();

    if (!result.success) {
      console.error(chalk.red(`Error: ${result.error}`));
      return;
    }

    const h = result.health;

    console.log(chalk.bold('\n🏥 Repository Health\n'));
    console.log(`  Repository: ${h.repository?.name}`);
    console.log(`  Visibility: ${h.repository?.visibility}`);
    console.log(`  Default Branch: ${h.repository?.default_branch}`);
    console.log(`  Last Push: ${formatDate(h.repository?.last_push)}`);

    console.log(chalk.bold('\n📊 Status\n'));
    const branchStatus = h.default_branch_status === 'success' ? chalk.green('✅ Passing') :
                         h.default_branch_status === 'failure' ? chalk.red('❌ Failing') :
                         chalk.yellow('? Unknown');
    console.log(`  Default Branch Status: ${branchStatus}`);
    console.log(`  Checks Passing: ${chalk.green(h.checks_passing)}`);
    console.log(`  Checks Failing: ${h.checks_failing > 0 ? chalk.red(h.checks_failing) : chalk.green(0)}`);
    console.log(`  Open PRs: ${h.open_prs}`);
    console.log(`  Open Issues: ${h.open_issues}`);
    console.log(`  Branches: ${h.branches}`);

    console.log();
  });

repoCmd
  .command('info')
  .description('Get repository information')
  .action(async () => {
    const spinner = ora('Fetching repo info...').start();
    const result = await repository.getRepoInfo();
    spinner.stop();

    if (!result.success) {
      console.error(chalk.red(`Error: ${result.error}`));
      return;
    }

    const r = result.repo;

    console.log(chalk.bold('\n📁 Repository Information\n'));
    console.log(`  Name: ${r.full_name}`);
    console.log(`  Description: ${r.description || '-'}`);
    console.log(`  URL: ${r.url}`);
    console.log(`  Visibility: ${r.visibility}`);
    console.log(`  Default Branch: ${r.default_branch}`);
    console.log(`  Language: ${r.language}`);
    console.log(`  Size: ${Math.round(r.size / 1024)} MB`);
    console.log(`  Created: ${formatDate(r.created_at)}`);
    console.log(`  Last Push: ${formatDate(r.pushed_at)}`);

    if (r.topics?.length > 0) {
      console.log(`  Topics: ${r.topics.join(', ')}`);
    }

    console.log();
  });

repoCmd
  .command('prs')
  .description('List open pull requests')
  .option('-l, --limit <n>', 'Number of PRs', '10')
  .action(async (opts) => {
    const spinner = ora('Fetching pull requests...').start();
    const result = await repository.listPullRequests({ 
      state: 'open',
      limit: parseInt(opts.limit)
    });
    spinner.stop();

    if (!result.success) {
      console.error(chalk.red(`Error: ${result.error}`));
      return;
    }

    if (result.count === 0) {
      console.log(chalk.green('\n✅ No open pull requests!\n'));
      return;
    }

    console.log(chalk.bold(`\n📋 Open Pull Requests (${result.count})\n`));

    const data = [
      [chalk.bold('#'), chalk.bold('Title'), chalk.bold('Branch'), chalk.bold('State'), chalk.bold('Updated')]
    ];

    for (const pr of result.pull_requests) {
      const stateColor = pr.mergeable_state === 'clean' ? chalk.green : 
                         pr.mergeable_state === 'dirty' ? chalk.red : chalk.yellow;
      data.push([
        pr.number.toString(),
        pr.title.substring(0, 40),
        `${pr.head_branch} → ${pr.base_branch}`,
        stateColor(pr.mergeable_state || 'unknown'),
        formatDate(pr.updated_at)
      ]);
    }

    console.log(table(data));
    console.log();
  });

repoCmd
  .command('branches')
  .description('List branches')
  .option('-l, --limit <n>', 'Number of branches', '20')
  .action(async (opts) => {
    const spinner = ora('Fetching branches...').start();
    const result = await repository.listBranches({ limit: parseInt(opts.limit) });
    spinner.stop();

    if (!result.success) {
      console.error(chalk.red(`Error: ${result.error}`));
      return;
    }

    console.log(chalk.bold(`\n🌿 Branches (${result.count})\n`));

    const data = [
      [chalk.bold('Name'), chalk.bold('Protected'), chalk.bold('Last Commit')]
    ];

    for (const branch of result.branches) {
      data.push([
        branch.name === 'main' ? chalk.bold(branch.name) : branch.name,
        branch.protected ? chalk.green('Yes') : chalk.gray('No'),
        formatDate(branch.commit_date)
      ]);
    }

    console.log(table(data));
    console.log();
  });

// ============ Quick Commands ============
program
  .command('status')
  .description('Quick status check')
  .action(async () => {
    const spinner = ora('Getting status...').start();
    const result = await actions.getQuickStatus();
    spinner.stop();

    if (!result.success) {
      console.error(chalk.red(`Error: ${result.error}`));
      return;
    }

    const s = result.summary;

    console.log(chalk.bold('\n⚡ Quick Status\n'));
    console.log(`  Workflows: ${s.total_workflows} total, ${s.active_workflows} active`);
    console.log(`  Running: ${chalk.yellow(s.currently_running)}`);
    console.log(`  Recent Failures: ${s.recent_failures > 0 ? chalk.red(s.recent_failures) : chalk.green(0)}`);
    console.log(`  Recent Successes: ${chalk.green(s.recent_successes)}`);

    if (s.has_issues) {
      console.log(chalk.bold('\n⚠️  Issues Detected\n'));
      console.log(`  ${chalk.yellow(s.primary_issue)}`);
    } else {
      console.log(chalk.bold('\n✅ All Good!\n'));
    }

    if (result.quick_actions?.length > 0) {
      console.log(chalk.bold('Quick Actions:\n'));
      for (const action of result.quick_actions) {
        console.log(`  ${chalk.cyan('→')} ${action}`);
      }
    }

    console.log();
  });

program
  .command('diagnose')
  .description('Full diagnostic of GitHub Actions')
  .action(async () => {
    console.log(chalk.bold('\n🔧 Running Full Diagnostics...\n'));

    // Check environment
    console.log(chalk.bold('1. Environment Check'));
    if (!process.env.GITHUB_TOKEN) {
      console.log(chalk.red('   ❌ GITHUB_TOKEN not set'));
      return;
    }
    console.log(chalk.green('   ✅ GITHUB_TOKEN configured'));
    console.log(chalk.green(`   ✅ Repository: ${config.owner}/${config.repo}`));

    // Check secrets
    console.log(chalk.bold('\n2. Secrets Audit'));
    const secretsResult = await secrets.auditSecrets();
    if (secretsResult.success) {
      if (secretsResult.summary.ready_for_deployment) {
        console.log(chalk.green('   ✅ All required secrets configured'));
      } else {
        console.log(chalk.red(`   ❌ Missing ${secretsResult.summary.total_missing} required secrets`));
        for (const m of secretsResult.missing) {
          console.log(chalk.red(`      - ${m.name} (${m.service})`));
        }
      }
    }

    // Check recent failures
    console.log(chalk.bold('\n3. Recent Failures'));
    const failuresResult = await actions.getRecentFailures({ limit: 5 });
    if (failuresResult.success) {
      if (failuresResult.failures.length === 0) {
        console.log(chalk.green('   ✅ No recent failures'));
      } else {
        console.log(chalk.yellow(`   ⚠️  ${failuresResult.failures.length} recent failures`));
        for (const f of failuresResult.failures.slice(0, 3)) {
          console.log(chalk.yellow(`      - ${f.name} (${formatDate(f.created_at)})`));
        }
      }
    }

    // Check repo health
    console.log(chalk.bold('\n4. Repository Health'));
    const healthResult = await repository.getHealthStatus();
    if (healthResult.success) {
      const h = healthResult.health;
      console.log(`   Default branch status: ${h.default_branch_status === 'success' ? chalk.green('✅ Passing') : chalk.red('❌ Failing')}`);
      console.log(`   Open PRs: ${h.open_prs}`);
      console.log(`   Checks passing: ${h.checks_passing}, failing: ${h.checks_failing}`);
    }

    console.log(chalk.bold('\n✨ Diagnostics Complete\n'));
  });

// Parse arguments
program.parse();
