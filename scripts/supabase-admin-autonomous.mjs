#!/usr/bin/env node
/**
 * Autonomous Supabase Admin
 *
 * Complete autonomous security management:
 * 1. Run security audit
 * 2. Generate fixes
 * 3. Apply fixes automatically
 * 4. Verify fixes
 * 5. Report status
 *
 * Usage:
 *   node scripts/supabase-admin-autonomous.mjs
 *   AUTO_APPLY_FIXES=false node scripts/supabase-admin-autonomous.mjs
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration
const CONFIG = {
  projectRef: process.env.SUPABASE_PROJECT_REF || 'bvneqoevtwodyfqglpzi',
  autoApply: process.env.AUTO_APPLY_FIXES !== 'false', // Default: true
  notifyOnFailure: process.env.NOTIFY_ON_FAILURE !== 'false',
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  reportDir: join(projectRoot, 'reports', 'supabase'),
  slackWebhook: process.env.SLACK_WEBHOOK_URL,
  githubToken: process.env.GITHUB_TOKEN
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Autonomous Supabase Admin Class
 */
class SupabaseAutonomousAdmin {
  constructor(config) {
    this.config = config;
    this.report = {
      timestamp: new Date().toISOString(),
      projectRef: config.projectRef,
      version: '1.0.0',
      steps: [],
      issues: {
        total: 0,
        critical: 0,
        warnings: 0,
        resolved: 0
      },
      fixes: [],
      verifications: [],
      status: 'pending',
      duration: 0,
      exitCode: 0
    };
    this.startTime = Date.now();
  }

  log(step, status, message, details = null) {
    const entry = {
      step,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    this.report.steps.push(entry);

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      pending: '⏳',
      info: 'ℹ️',
      skipped: '⏭️'
    };

    const icon = icons[status] || '•';
    log(`${icon} [${step}] ${message}`, status === 'error' ? 'red' : status === 'success' ? 'green' : 'reset');

    if (details) {
      console.log(`   ${typeof details === 'string' ? details : JSON.stringify(details, null, 2)}`);
    }
  }

  /**
   * Execute command with error handling
   */
  execCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        encoding: 'utf-8',
        stdio: 'pipe',
        cwd: projectRoot,
        ...options
      });
      return { success: true, output: result.trim() };
    } catch (error) {
      return {
        success: false,
        output: error.stdout?.toString() || '',
        error: error.stderr?.toString() || error.message
      };
    }
  }

  /**
   * Step 1: Run security audit
   */
  async runSecurityAudit() {
    this.log('audit', 'pending', 'Running security audit...');

    try {
      // Run existing admin report script
      const result = this.execCommand('node scripts/supabase-admin-report.mjs', {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Parse generated report
      const reportPath = join(projectRoot, 'SUPABASE_ADMIN_REPORT.md');
      if (existsSync(reportPath)) {
        const reportContent = readFileSync(reportPath, 'utf-8');

        // Extract issue counts
        const criticalMatch = reportContent.match(/Critical Issues:\*\* (\d+)/);
        const warningsMatch = reportContent.match(/Warnings:\*\* (\d+)/);
        const totalMatch = reportContent.match(/Total Issues:\*\* (\d+)/);

        this.report.issues = {
          total: totalMatch ? parseInt(totalMatch[1]) : 0,
          critical: criticalMatch ? parseInt(criticalMatch[1]) : 0,
          warnings: warningsMatch ? parseInt(warningsMatch[1]) : 0,
          resolved: 0
        };

        this.log('audit', 'success',
          `Audit complete: ${this.report.issues.critical} critical, ${this.report.issues.warnings} warnings`,
          { reportPath }
        );

        return this.report.issues.critical > 0;
      } else {
        this.log('audit', 'warning', 'Audit report not generated');
        return false;
      }
    } catch (error) {
      this.log('audit', 'error', `Audit failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Step 2: Apply security fixes
   */
  async applyFixes() {
    if (!this.config.autoApply) {
      this.log('apply', 'skipped', 'Auto-apply disabled in configuration');
      return true;
    }

    this.log('apply', 'pending', 'Applying security fixes...');

    try {
      // Run SQL executor with auto-fix
      const result = this.execCommand('node scripts/supabase-sql-executor.mjs auto-fix', {
        env: {
          ...process.env,
          SUPABASE_PROJECT_REF: this.config.projectRef,
          SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
          SUPABASE_DB_URL: process.env.SUPABASE_DB_URL
        }
      });

      if (result.success) {
        // Parse applied fixes from output
        const fixMatches = result.output.match(/Apply migration: ([^\n]+)/g) || [];
        this.report.fixes = fixMatches.map(m => m.replace('Apply migration: ', ''));

        this.log('apply', 'success',
          `Applied ${this.report.fixes.length} fix(es)`,
          this.report.fixes
        );
        return true;
      } else {
        // Check if it was just "no fixes needed"
        if (result.output.includes('No pending fixes')) {
          this.log('apply', 'success', 'No pending fixes to apply');
          return true;
        }

        this.log('apply', 'error', 'Fix application failed', result.error);
        return false;
      }
    } catch (error) {
      this.log('apply', 'error', `Fix application failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Step 3: Verify fixes were applied
   */
  async verifyFixes() {
    this.log('verify', 'pending', 'Verifying security configuration...');

    try {
      const result = this.execCommand('node scripts/supabase-sql-executor.mjs verify', {
        env: {
          ...process.env,
          SUPABASE_PROJECT_REF: this.config.projectRef,
          SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
          SUPABASE_DB_URL: process.env.SUPABASE_DB_URL
        }
      });

      // Parse verification results
      const passedMatches = result.output.match(/PASSED/g) || [];
      const failedMatches = result.output.match(/FAILED|NEEDS ATTENTION/g) || [];

      this.report.verifications = {
        passed: passedMatches.length,
        failed: failedMatches.length,
        output: result.output
      };

      if (failedMatches.length === 0 && passedMatches.length > 0) {
        this.log('verify', 'success',
          `All ${passedMatches.length} security checks passed`
        );
        return true;
      } else if (failedMatches.length > 0) {
        this.log('verify', 'warning',
          `${failedMatches.length} verification(s) need attention`,
          { passed: passedMatches.length, failed: failedMatches.length }
        );
        return false;
      } else {
        this.log('verify', 'info', 'No verification results', result.output);
        return true;
      }
    } catch (error) {
      this.log('verify', 'error', `Verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Step 4: Send notifications
   */
  async sendNotifications() {
    const status = this.report.status;

    // Only notify on failure if configured
    if (status !== 'failed' && !this.report.issues.critical) {
      this.log('notify', 'skipped', 'No critical issues, skipping notifications');
      return;
    }

    this.log('notify', 'pending', 'Sending notifications...');

    // Slack notification
    if (this.config.slackWebhook) {
      await this.sendSlackNotification();
    }

    // GitHub Issue creation on failure
    if (this.config.githubToken && status === 'failed') {
      await this.createGitHubIssue();
    }

    this.log('notify', 'success', 'Notifications sent');
  }

  async sendSlackNotification() {
    const emoji = this.report.status === 'completed' ? ':white_check_mark:' : ':x:';
    const color = this.report.status === 'completed' ? 'good' : 'danger';

    const payload = {
      attachments: [{
        color,
        title: `${emoji} Supabase Security Audit - ${this.report.status.toUpperCase()}`,
        fields: [
          { title: 'Project', value: this.config.projectRef, short: true },
          { title: 'Critical Issues', value: String(this.report.issues.critical), short: true },
          { title: 'Fixes Applied', value: String(this.report.fixes.length), short: true },
          { title: 'Duration', value: `${this.report.duration}s`, short: true }
        ],
        footer: 'Supabase Autonomous Admin',
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    try {
      await fetch(this.config.slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      this.log('notify', 'warning', `Slack notification failed: ${error.message}`);
    }
  }

  async createGitHubIssue() {
    // This would create a GitHub issue on failure
    // Implemented via GitHub Actions workflow instead
    this.log('notify', 'info', 'GitHub issue creation delegated to workflow');
  }

  /**
   * Generate markdown summary report
   */
  generateSummary() {
    this.report.duration = Math.round((Date.now() - this.startTime) / 1000);

    const stepsTable = this.report.steps.map(s => {
      const icon = s.status === 'success' ? '✅' :
                   s.status === 'error' ? '❌' :
                   s.status === 'warning' ? '⚠️' :
                   s.status === 'skipped' ? '⏭️' : '⏳';
      return `| ${icon} | ${s.step} | ${s.message} | ${s.timestamp.split('T')[1].split('.')[0]} |`;
    }).join('\n');

    const summary = `# Autonomous Supabase Admin Report

**Generated:** ${new Date(this.report.timestamp).toLocaleString()}
**Project:** ${this.report.projectRef}
**Status:** ${this.report.status === 'completed' ? '✅ COMPLETED' : this.report.status === 'failed' ? '❌ FAILED' : '⚠️ ' + this.report.status.toUpperCase()}
**Duration:** ${this.report.duration} seconds
**Version:** ${this.report.version}

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Issues Found | ${this.report.issues.total} |
| Critical Issues | ${this.report.issues.critical} |
| Warnings | ${this.report.issues.warnings} |
| Fixes Applied | ${this.report.fixes.length} |
| Verifications Passed | ${this.report.verifications?.passed || 0} |
| Verifications Failed | ${this.report.verifications?.failed || 0} |

---

## Execution Steps

| Status | Step | Message | Time |
|--------|------|---------|------|
${stepsTable}

---

## Fixes Applied

${this.report.fixes.length > 0
  ? this.report.fixes.map(f => `- ✅ ${f}`).join('\n')
  : '- No fixes were applied (none needed or auto-apply disabled)'}

---

## Configuration

| Setting | Value |
|---------|-------|
| Project Reference | ${this.config.projectRef} |
| Auto-Apply Fixes | ${this.config.autoApply ? 'Enabled' : 'Disabled'} |
| Max Retries | ${this.config.maxRetries} |
| Slack Notifications | ${this.config.slackWebhook ? 'Configured' : 'Not configured'} |

---

## Next Steps

${this.report.status === 'completed' && this.report.issues.critical === 0
  ? `✅ All checks passed. No action required.`
  : `1. Review the security issues identified above
2. Apply any manual fixes if auto-apply failed
3. Run \`npm run supabase:verify\` to confirm fixes
4. Commit any generated migration files`}

---

## Environment

- **Node Version:** ${process.version}
- **Platform:** ${process.platform}
- **CI:** ${process.env.CI ? 'Yes' : 'No'}
- **GitHub Actions:** ${process.env.GITHUB_ACTIONS ? 'Yes' : 'No'}

---

*Report generated by Autonomous Supabase Admin v${this.report.version}*
*Timestamp: ${new Date().toISOString()}*
`;

    // Ensure reports directory exists
    if (!existsSync(this.config.reportDir)) {
      mkdirSync(this.config.reportDir, { recursive: true });
    }

    // Save dated report
    const datestamp = new Date().toISOString().split('T')[0];
    const reportPath = join(this.config.reportDir, `autonomous-report-${datestamp}.md`);
    writeFileSync(reportPath, summary, 'utf-8');

    // Also save to project root with standard name
    const rootReportPath = join(projectRoot, `SUPABASE_AUTONOMOUS_REPORT_${datestamp}.md`);
    writeFileSync(rootReportPath, summary, 'utf-8');

    log(`\n📄 Report saved: ${rootReportPath}`, 'cyan');

    return summary;
  }

  /**
   * Main execution workflow
   */
  async run() {
    console.log('\n' + '═'.repeat(60));
    log('🤖 Supabase Autonomous Admin Starting...', 'cyan');
    console.log('═'.repeat(60));
    console.log(`📦 Project: ${this.config.projectRef}`);
    console.log(`🔧 Auto-Apply: ${this.config.autoApply ? 'Enabled' : 'Disabled'}`);
    console.log(`📊 Max Retries: ${this.config.maxRetries}`);
    console.log('═'.repeat(60) + '\n');

    try {
      // Step 1: Run audit
      const hasIssues = await this.runSecurityAudit();

      // Step 2: Apply fixes if issues found
      if (hasIssues || this.config.autoApply) {
        const applied = await this.applyFixes();

        // Step 3: Verify fixes
        if (applied) {
          const verified = await this.verifyFixes();

          if (verified) {
            this.report.issues.resolved = this.report.fixes.length;
          }
        }
      }

      // Determine final status
      if (this.report.steps.some(s => s.status === 'error')) {
        this.report.status = 'failed';
        this.report.exitCode = 1;
      } else if (this.report.issues.critical > 0 && this.report.fixes.length === 0) {
        this.report.status = 'attention_needed';
        this.report.exitCode = 0; // Don't fail CI for unresolved issues
      } else {
        this.report.status = 'completed';
        this.report.exitCode = 0;
      }

      // Step 4: Send notifications
      await this.sendNotifications();

    } catch (error) {
      this.report.status = 'failed';
      this.report.exitCode = 1;
      this.log('system', 'error', `System error: ${error.message}`, error.stack);
    }

    // Generate summary
    this.generateSummary();

    // Print final status
    console.log('\n' + '═'.repeat(60));
    const statusEmoji = this.report.status === 'completed' ? '✅' :
                        this.report.status === 'failed' ? '❌' : '⚠️';
    log(`${statusEmoji} Autonomous admin ${this.report.status.toUpperCase()}`, this.report.status === 'completed' ? 'green' : 'yellow');
    console.log(`   Duration: ${this.report.duration}s`);
    console.log(`   Issues: ${this.report.issues.critical} critical, ${this.report.issues.warnings} warnings`);
    console.log(`   Fixes: ${this.report.fixes.length} applied`);
    console.log('═'.repeat(60) + '\n');

    return this.report.exitCode === 0;
  }
}

// Main execution
const admin = new SupabaseAutonomousAdmin(CONFIG);

admin.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
