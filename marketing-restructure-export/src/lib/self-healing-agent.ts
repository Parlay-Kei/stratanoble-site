/**
 * Self-Healing Agent
 *
 * Automated health monitoring and error resolution for StrataNoble infrastructure.
 * Runs health checks, detects issues, and applies automated fixes.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface HealthIssue {
  severity: 'critical' | 'warning' | 'info';
  service: string;
  issue: string;
  autoFixable: boolean;
  fix?: () => Promise<boolean>;
}

interface HealingReport {
  timestamp: string;
  issuesFound: number;
  issuesFixed: number;
  issuesFailed: number;
  details: {
    issue: string;
    service: string;
    severity: string;
    fixed: boolean;
    error?: string;
  }[];
}

export class SelfHealingAgent {
  private static instance: SelfHealingAgent;
  private healingInProgress = false;
  private lastHealingReport: HealingReport | null = null;

  private constructor() {}

  static getInstance(): SelfHealingAgent {
    if (!SelfHealingAgent.instance) {
      SelfHealingAgent.instance = new SelfHealingAgent();
    }
    return SelfHealingAgent.instance;
  }

  /**
   * Run complete health check and healing cycle
   */
  async runHealingCycle(): Promise<HealingReport> {
    if (this.healingInProgress) {
      console.log('[Self-Healing] Healing cycle already in progress, skipping...');
      return this.lastHealingReport || this.createEmptyReport();
    }

    this.healingInProgress = true;
    console.log('[Self-Healing] Starting healing cycle...');

    const report: HealingReport = {
      timestamp: new Date().toISOString(),
      issuesFound: 0,
      issuesFixed: 0,
      issuesFailed: 0,
      details: []
    };

    try {
      // Detect issues
      const issues = await this.detectIssues();
      report.issuesFound = issues.length;

      console.log(`[Self-Healing] Found ${issues.length} issues`);

      // Attempt to fix each issue
      for (const issue of issues) {
        if (issue.autoFixable && issue.fix) {
          try {
            console.log(`[Self-Healing] Attempting to fix: ${issue.issue}`);
            const fixed = await issue.fix();

            report.details.push({
              issue: issue.issue,
              service: issue.service,
              severity: issue.severity,
              fixed
            });

            if (fixed) {
              report.issuesFixed++;
              console.log(`[Self-Healing] ✓ Fixed: ${issue.issue}`);
            } else {
              report.issuesFailed++;
              console.log(`[Self-Healing] ✗ Failed to fix: ${issue.issue}`);
            }
          } catch (error) {
            report.issuesFailed++;
            report.details.push({
              issue: issue.issue,
              service: issue.service,
              severity: issue.severity,
              fixed: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error(`[Self-Healing] Error fixing ${issue.issue}:`, error);
          }
        } else {
          report.details.push({
            issue: issue.issue,
            service: issue.service,
            severity: issue.severity,
            fixed: false,
            error: 'Not auto-fixable'
          });
          console.log(`[Self-Healing] ⚠ Cannot auto-fix: ${issue.issue}`);
        }
      }

      this.lastHealingReport = report;
      console.log(`[Self-Healing] Cycle complete. Fixed ${report.issuesFixed}/${report.issuesFound} issues`);

      return report;
    } finally {
      this.healingInProgress = false;
    }
  }

  /**
   * Detect infrastructure issues
   */
  private async detectIssues(): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];

    // Check environment variables
    const envIssues = await this.checkEnvironmentVariables();
    issues.push(...envIssues);

    // Check service health
    const serviceIssues = await this.checkServiceHealth();
    issues.push(...serviceIssues);

    // Check file permissions
    const permissionIssues = await this.checkFilePermissions();
    issues.push(...permissionIssues);

    // Check disk space
    const diskIssues = await this.checkDiskSpace();
    issues.push(...diskIssues);

    return issues;
  }

  /**
   * Check for missing environment variables
   */
  private async checkEnvironmentVariables(): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];

    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'STRIPE_SECRET_KEY',
      'OPENAI_API_KEY',
      'TWILIO_AUTH_TOKEN'
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        issues.push({
          severity: 'critical',
          service: 'Environment',
          issue: `Missing environment variable: ${varName}`,
          autoFixable: false
        });
      }
    }

    return issues;
  }

  /**
   * Check service health via API
   */
  private async checkServiceHealth(): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/devops/health`);

      if (!response.ok) {
        issues.push({
          severity: 'critical',
          service: 'Health API',
          issue: 'Health check API endpoint not responding',
          autoFixable: true,
          fix: async () => this.restartDevServer()
        });
        return issues;
      }

      const data = await response.json();

      // Check each service
      for (const service of data.services) {
        if (service.status === 'down') {
          issues.push({
            severity: 'critical',
            service: service.name,
            issue: `Service ${service.name} is down`,
            autoFixable: false // Cannot auto-fix external services
          });
        } else if (service.status === 'degraded') {
          issues.push({
            severity: 'warning',
            service: service.name,
            issue: `Service ${service.name} is degraded`,
            autoFixable: false
          });
        }

        // Check response time
        if (service.responseTime > 5000) {
          issues.push({
            severity: 'warning',
            service: service.name,
            issue: `High response time for ${service.name}: ${service.responseTime}ms`,
            autoFixable: false
          });
        }
      }
    } catch (error) {
      issues.push({
        severity: 'critical',
        service: 'Health Check',
        issue: 'Failed to run health check',
        autoFixable: true,
        fix: async () => this.restartDevServer()
      });
    }

    return issues;
  }

  /**
   * Check file permissions
   */
  private async checkFilePermissions(): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];

    try {
      // Check if .env.local is readable
      const fs = await import('fs/promises');
      await fs.access('apps/website/.env.local', (await import('fs')).constants.R_OK);
    } catch (error) {
      issues.push({
        severity: 'critical',
        service: 'Filesystem',
        issue: '.env.local file not readable',
        autoFixable: false
      });
    }

    return issues;
  }

  /**
   * Check disk space
   */
  private async checkDiskSpace(): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];

    try {
      // On Windows, check C: drive space
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic logicaldisk where "DeviceID=\'C:\'" get FreeSpace,Size /value');
        const lines = stdout.split('\n').filter(line => line.trim());

        const freeSpace = parseInt(lines.find(l => l.startsWith('FreeSpace='))?.split('=')[1] || '0');
        const totalSpace = parseInt(lines.find(l => l.startsWith('Size='))?.split('=')[1] || '0');

        if (totalSpace > 0) {
          const freePercent = (freeSpace / totalSpace) * 100;

          if (freePercent < 10) {
            issues.push({
              severity: 'critical',
              service: 'Disk Space',
              issue: `Low disk space: ${freePercent.toFixed(1)}% free`,
              autoFixable: false
            });
          } else if (freePercent < 20) {
            issues.push({
              severity: 'warning',
              service: 'Disk Space',
              issue: `Disk space running low: ${freePercent.toFixed(1)}% free`,
              autoFixable: false
            });
          }
        }
      }
    } catch (error) {
      console.error('[Self-Healing] Failed to check disk space:', error);
    }

    return issues;
  }

  /**
   * Restart development server
   */
  private async restartDevServer(): Promise<boolean> {
    try {
      console.log('[Self-Healing] Attempting to restart dev server...');

      // Find and kill existing dev server process
      if (process.platform === 'win32') {
        await execAsync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq npm*"');
      } else {
        await execAsync('pkill -f "next dev"');
      }

      // Wait for process to die
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Note: We cannot actually restart the server from within the server itself
      // This would require an external orchestrator
      console.log('[Self-Healing] Server restart requires external orchestrator');
      return false;
    } catch (error) {
      console.error('[Self-Healing] Failed to restart dev server:', error);
      return false;
    }
  }

  /**
   * Get last healing report
   */
  getLastReport(): HealingReport | null {
    return this.lastHealingReport;
  }

  /**
   * Create empty report
   */
  private createEmptyReport(): HealingReport {
    return {
      timestamp: new Date().toISOString(),
      issuesFound: 0,
      issuesFixed: 0,
      issuesFailed: 0,
      details: []
    };
  }
}

/**
 * Start self-healing agent with scheduled checks
 */
export async function startSelfHealingAgent(intervalMinutes: number = 5): Promise<NodeJS.Timeout> {
  const agent = SelfHealingAgent.getInstance();

  console.log(`[Self-Healing] Starting agent with ${intervalMinutes}-minute checks`);

  // Run initial check
  await agent.runHealingCycle();

  // Schedule recurring checks
  const interval = setInterval(async () => {
    await agent.runHealingCycle();
  }, intervalMinutes * 60 * 1000);

  return interval;
}

/**
 * Get healing report API endpoint
 */
export async function getHealingReport(): Promise<HealingReport | null> {
  const agent = SelfHealingAgent.getInstance();
  return agent.getLastReport();
}
