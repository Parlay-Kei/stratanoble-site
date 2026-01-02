/**
 * CFO Agent Job Runner
 *
 * Reads finance.agent_schedules and executes jobs at scheduled times.
 * Writes last_run_at and next_run_at for tracking.
 * Creates critical alerts on job failures.
 */

import type { AgentSchedule, AlertEvent } from '../types';
import { handleStripeRollupRefresh } from './handlers';
import { handleDailySnapshot } from './handlers';
import { handleWeeklyCohorts } from './handlers';
import { handleMonthlyKPIPack } from './handlers';
import { handleQuarterlyPolicyReview } from './handlers';

// =============================================================================
// JOB HANDLERS REGISTRY
// =============================================================================

export type JobHandler = () => Promise<JobResult>;

export interface JobResult {
  success: boolean;
  error?: string;
  data?: unknown;
  warnings: string[];
  executedAt: Date;
}

const JOB_HANDLERS: Record<string, JobHandler> = {
  stripe_rollup_refresh: handleStripeRollupRefresh,
  daily_snapshot: handleDailySnapshot,
  weekly_cohorts: handleWeeklyCohorts,
  monthly_kpi_pack: handleMonthlyKPIPack,
  quarterly_policy_review: handleQuarterlyPolicyReview,
};

// =============================================================================
// JOB RUNNER
// =============================================================================

export interface RunnerConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  entityId?: string;
  timezone?: string;
}

export interface RunnerResult {
  jobKey: string;
  success: boolean;
  error?: string;
  executedAt: Date;
  nextRunAt: Date | null;
}

/**
 * Execute a single job by key
 */
export async function executeJob(
  jobKey: string,
  config: RunnerConfig
): Promise<RunnerResult> {
  const handler = JOB_HANDLERS[jobKey];

  if (!handler) {
    return {
      jobKey,
      success: false,
      error: `Unknown job key: ${jobKey}`,
      executedAt: new Date(),
      nextRunAt: null,
    };
  }

  try {
    // TODO: Update job status to 'running' in DB
    // await updateJobStatus(jobKey, 'running', config);

    const result = await handler();

    if (!result.success) {
      // Create critical alert for job failure
      await createJobFailureAlert(jobKey, result.error || 'Unknown error', config);

      return {
        jobKey,
        success: false,
        error: result.error,
        executedAt: result.executedAt,
        nextRunAt: null,
      };
    }

    // TODO: Update job status and timestamps in DB
    // await updateJobCompletion(jobKey, result.executedAt, config);

    return {
      jobKey,
      success: true,
      executedAt: result.executedAt,
      nextRunAt: calculateNextRun(jobKey),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Create critical alert for job failure
    await createJobFailureAlert(jobKey, errorMessage, config);

    return {
      jobKey,
      success: false,
      error: errorMessage,
      executedAt: new Date(),
      nextRunAt: null,
    };
  }
}

/**
 * Run all due jobs
 */
export async function runDueJobs(config: RunnerConfig): Promise<RunnerResult[]> {
  const results: RunnerResult[] = [];

  // TODO: Fetch due jobs from DB
  // const dueJobs = await getDueJobs(config);

  // For now, just return empty results
  return results;
}

/**
 * Get all scheduled jobs with status
 */
export async function getScheduleStatus(
  config: RunnerConfig
): Promise<AgentSchedule[]> {
  // TODO: Fetch from DB
  return [];
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate next run time for a job
 */
function calculateNextRun(jobKey: string): Date {
  const now = new Date();
  const next = new Date(now);

  // Default schedules
  switch (jobKey) {
    case 'stripe_rollup_refresh':
      next.setHours(next.getHours() + 1);
      break;
    case 'daily_snapshot':
      next.setDate(next.getDate() + 1);
      next.setHours(8, 0, 0, 0);
      break;
    case 'weekly_cohorts':
      // Next Monday at 09:00
      const daysUntilMonday = (8 - next.getDay()) % 7 || 7;
      next.setDate(next.getDate() + daysUntilMonday);
      next.setHours(9, 0, 0, 0);
      break;
    case 'monthly_kpi_pack':
      // First business day of next month at 10:00
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(10, 0, 0, 0);
      // Skip weekends
      while (next.getDay() === 0 || next.getDay() === 6) {
        next.setDate(next.getDate() + 1);
      }
      break;
    case 'quarterly_policy_review':
      // First week of next quarter
      const currentQuarter = Math.floor(next.getMonth() / 3);
      const nextQuarterMonth = (currentQuarter + 1) * 3;
      next.setMonth(nextQuarterMonth);
      next.setDate(1);
      next.setHours(10, 0, 0, 0);
      break;
    default:
      next.setDate(next.getDate() + 1);
  }

  return next;
}

/**
 * Create an alert for job failure
 */
async function createJobFailureAlert(
  jobKey: string,
  errorMessage: string,
  config: RunnerConfig
): Promise<void> {
  // TODO: Insert into finance.alert_events
  const alert: Partial<AlertEvent> = {
    entityId: config.entityId || 'STRATANOBLE',
    alertKey: `job_failure_${jobKey}`,
    category: 'data_quality',
    severity: 'critical',
    title: `CFO Agent Job Failed: ${jobKey}`,
    description: `Scheduled job "${jobKey}" failed with error: ${errorMessage}`,
    evidence: { jobKey, error: errorMessage },
    thresholdTriggered: 'job_execution_failure',
    currentValue: 1,
    thresholdValue: 0,
    rulesetVersion: 'v1',
    policyVersion: 'v1',
    createdAt: new Date(),
  };

  console.error(`[CFO Agent] Job failure alert created:`, alert);
}

// =============================================================================
// CRON INTEGRATION
// =============================================================================

/**
 * Handler for cron-triggered job execution
 * Call this from your cron endpoint (e.g., /api/cron/finance-jobs)
 */
export async function handleCronTrigger(
  config: RunnerConfig
): Promise<{
  success: boolean;
  jobsExecuted: number;
  results: RunnerResult[];
}> {
  try {
    const results = await runDueJobs(config);

    return {
      success: true,
      jobsExecuted: results.length,
      results,
    };
  } catch (error) {
    return {
      success: false,
      jobsExecuted: 0,
      results: [],
    };
  }
}
