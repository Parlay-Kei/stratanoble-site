#!/usr/bin/env node

/**
 * Auto-Remediation Tool for Governance Drift
 * Mission: PLATOPS-DRIFT-AUTO-REMEDIATE-0005
 *
 * Safely applies remediation recipes for easy misconfig repositories
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutoRemediateDrift {
  constructor() {
    this.mode = 'dry-run'; // dry-run, apply, rollback
    this.targetClass = 'EASY_MISCONFIG';
    this.ledgerPath = path.join('C:\\Dev\\.claude-anx\\governance\\DRIFT_ROLLOUT_LEDGER.json');
    this.results = {
      timestamp: new Date().toISOString(),
      mode: null,
      targeted: [],
      processed: [],
      succeeded: [],
      failed: [],
      skipped: [],
      receipts: [],
      rollbackPlans: [],
      summary: {
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0
      }
    };
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args) {
    const validModes = ['dry-run', 'apply', 'rollback-plan'];
    const mode = args[0] || 'dry-run';

    if (!validModes.includes(mode)) {
      console.error(`Invalid mode: ${mode}`);
      console.error(`Valid modes: ${validModes.join(', ')}`);
      process.exit(1);
    }

    this.mode = mode;
    this.results.mode = mode;

    // Optional: specific repos
    if (args[1]) {
      this.targetRepos = args.slice(1);
    }
  }

  /**
   * Load rollout ledger to get target repositories
   */
  loadLedger() {
    if (!fs.existsSync(this.ledgerPath)) {
      throw new Error(`Ledger not found at ${this.ledgerPath}`);
    }

    const content = fs.readFileSync(this.ledgerPath, 'utf8');
    return JSON.parse(content);
  }

  /**
   * Filter repositories for easy misconfig
   */
  filterTargetRepos(ledger) {
    const targets = ledger.repositories.filter(repo => {
      // Filter by drift class
      if (repo.driftClass !== this.targetClass) return false;

      // Filter by status (only FAIL repos need remediation)
      if (repo.status !== 'FAIL') return false;

      // Filter by remediation status (skip already completed)
      if (repo.remediationStatus === 'COMPLETED') return false;

      // If specific repos requested, filter by name
      if (this.targetRepos && !this.targetRepos.includes(repo.repository)) {
        return false;
      }

      return true;
    });

    return targets;
  }

  /**
   * Validate repository before remediation
   */
  validateRepo(repo) {
    const validation = {
      valid: true,
      issues: [],
      warnings: []
    };

    // Check if path exists
    if (!fs.existsSync(repo.path)) {
      validation.valid = false;
      validation.issues.push(`Repository path does not exist: ${repo.path}`);
      return validation;
    }

    // Check if already has pointer
    const pointerPath = path.join(repo.path, 'ANX_ROOT.pointer');
    if (fs.existsSync(pointerPath)) {
      validation.warnings.push('ANX_ROOT.pointer already exists');

      // Check content
      const content = fs.readFileSync(pointerPath, 'utf8').trim();
      if (content === '../.claude-anx') {
        validation.warnings.push('Pointer already correct - skipping');
        validation.valid = false;
      }
    }

    // Check for local governance that might conflict
    const localGovPath = path.join(repo.path, '.claude', 'governance');
    if (fs.existsSync(localGovPath)) {
      validation.warnings.push('Local governance directory exists - may need additional cleanup');
    }

    // Check if it's a git repo
    const gitPath = path.join(repo.path, '.git');
    if (!fs.existsSync(gitPath)) {
      validation.warnings.push('Not a git repository - version control unavailable');
    }

    return validation;
  }

  /**
   * Generate rollback plan for a repository
   */
  generateRollbackPlan(repo) {
    const pointerPath = path.join(repo.path, 'ANX_ROOT.pointer');

    const rollback = {
      repository: repo.repository,
      timestamp: new Date().toISOString(),
      actions: [],
      commands: []
    };

    // Check if pointer existed before
    if (fs.existsSync(pointerPath)) {
      const backupPath = `${pointerPath}.backup`;
      if (fs.existsSync(backupPath)) {
        rollback.actions.push('Restore original pointer from backup');
        rollback.commands.push(`move "${backupPath}" "${pointerPath}"`);
      } else {
        rollback.actions.push('Remove created pointer file');
        rollback.commands.push(`del "${pointerPath}"`);
      }
    }

    // Git-based rollback
    rollback.actions.push('Alternative: Use git to revert changes');
    rollback.commands.push(`cd "${repo.path}" && git checkout -- ANX_ROOT.pointer`);

    return rollback;
  }

  /**
   * Apply remediation to a repository
   */
  applyRemediation(repo) {
    const receipt = {
      repository: repo.repository,
      path: repo.path,
      timestamp: new Date().toISOString(),
      mode: this.mode,
      actions: [],
      status: 'PENDING',
      validation: null,
      error: null
    };

    try {
      // Validate first
      const validation = this.validateRepo(repo);
      receipt.validation = validation;

      if (!validation.valid) {
        receipt.status = 'SKIPPED';
        receipt.error = validation.issues.join('; ');
        return receipt;
      }

      const pointerPath = path.join(repo.path, 'ANX_ROOT.pointer');

      if (this.mode === 'dry-run') {
        // Dry run - just report what would be done
        receipt.actions.push({
          action: 'would-create-pointer',
          path: pointerPath,
          content: '../.claude-anx',
          command: `echo "../.claude-anx" > "${pointerPath}"`
        });
        receipt.status = 'DRY_RUN';
      } else if (this.mode === 'apply') {
        // Backup existing if present
        if (fs.existsSync(pointerPath)) {
          const backupPath = `${pointerPath}.backup`;
          fs.copyFileSync(pointerPath, backupPath);
          receipt.actions.push({
            action: 'backup-existing',
            from: pointerPath,
            to: backupPath
          });
        }

        // Create pointer file
        fs.writeFileSync(pointerPath, '../.claude-anx\n');
        receipt.actions.push({
          action: 'create-pointer',
          path: pointerPath,
          content: '../.claude-anx',
          success: true
        });

        // Verify the fix
        if (fs.existsSync(pointerPath)) {
          const content = fs.readFileSync(pointerPath, 'utf8').trim();
          if (content === '../.claude-anx') {
            receipt.status = 'SUCCESS';
            receipt.actions.push({
              action: 'verification',
              result: 'Pointer correctly created and verified'
            });
          } else {
            receipt.status = 'FAILED';
            receipt.error = 'Pointer created but content incorrect';
          }
        } else {
          receipt.status = 'FAILED';
          receipt.error = 'Pointer creation failed';
        }
      } else if (this.mode === 'rollback-plan') {
        // Generate rollback plan only
        const rollbackPlan = this.generateRollbackPlan(repo);
        receipt.actions.push({
          action: 'rollback-plan-generated',
          plan: rollbackPlan
        });
        receipt.status = 'ROLLBACK_PLAN';
        this.results.rollbackPlans.push(rollbackPlan);
      }

    } catch (error) {
      receipt.status = 'ERROR';
      receipt.error = error.message;
    }

    return receipt;
  }

  /**
   * Process all target repositories
   */
  async processRepositories(targets) {
    console.log(`\n📋 Processing ${targets.length} repositories in ${this.mode} mode\n`);

    for (const repo of targets) {
      console.log(`Processing ${repo.repository}...`);

      const receipt = this.applyRemediation(repo);
      this.results.receipts.push(receipt);
      this.results.processed.push(repo.repository);

      if (receipt.status === 'SUCCESS') {
        this.results.succeeded.push(repo.repository);
        console.log(`  ✅ SUCCESS - Remediation applied`);
      } else if (receipt.status === 'DRY_RUN') {
        console.log(`  🔍 DRY RUN - Would apply remediation`);
      } else if (receipt.status === 'SKIPPED') {
        this.results.skipped.push(repo.repository);
        console.log(`  ⏭️  SKIPPED - ${receipt.error || 'Already compliant'}`);
      } else if (receipt.status === 'ROLLBACK_PLAN') {
        console.log(`  📝 ROLLBACK - Plan generated`);
      } else {
        this.results.failed.push(repo.repository);
        console.log(`  ❌ FAILED - ${receipt.error}`);
      }
    }

    // Update summary
    this.results.summary.total = targets.length;
    this.results.summary.processed = this.results.processed.length;
    this.results.summary.succeeded = this.results.succeeded.length;
    this.results.summary.failed = this.results.failed.length;
    this.results.summary.skipped = this.results.skipped.length;
  }

  /**
   * Save results and receipts
   */
  saveResults() {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const outputDir = path.join('C:\\Dev\\StrataNoble\\proofs\\auto-remediation');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save main results
    const resultsPath = path.join(outputDir, `remediation-results-${timestamp}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Results saved: ${resultsPath}`);

    // Save individual receipts
    const receiptsDir = path.join(outputDir, 'receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    for (const receipt of this.results.receipts) {
      const receiptPath = path.join(receiptsDir, `${receipt.repository}-${timestamp}.json`);
      fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
    }
    console.log(`📄 ${this.results.receipts.length} receipts saved in ${receiptsDir}`);

    // Generate summary report
    this.generateSummaryReport(outputDir, timestamp);

    return outputDir;
  }

  /**
   * Generate markdown summary report
   */
  generateSummaryReport(outputDir, timestamp) {
    const lines = [];

    lines.push('# Auto-Remediation Report');
    lines.push(`Generated: ${this.results.timestamp}`);
    lines.push(`Mode: ${this.results.mode.toUpperCase()}`);
    lines.push('');

    lines.push('## Summary');
    lines.push(`- **Total Targeted**: ${this.results.summary.total}`);
    lines.push(`- **Processed**: ${this.results.summary.processed}`);
    lines.push(`- **Succeeded**: ${this.results.summary.succeeded}`);
    lines.push(`- **Failed**: ${this.results.summary.failed}`);
    lines.push(`- **Skipped**: ${this.results.summary.skipped}`);
    lines.push('');

    if (this.results.succeeded.length > 0) {
      lines.push('## Successfully Remediated');
      for (const repo of this.results.succeeded) {
        lines.push(`- ✅ ${repo}`);
      }
      lines.push('');
    }

    if (this.results.failed.length > 0) {
      lines.push('## Failed Remediation');
      for (const repo of this.results.failed) {
        const receipt = this.results.receipts.find(r => r.repository === repo);
        lines.push(`- ❌ ${repo}: ${receipt?.error || 'Unknown error'}`);
      }
      lines.push('');
    }

    if (this.results.skipped.length > 0) {
      lines.push('## Skipped');
      for (const repo of this.results.skipped) {
        const receipt = this.results.receipts.find(r => r.repository === repo);
        lines.push(`- ⏭️  ${repo}: ${receipt?.error || 'Already compliant'}`);
      }
      lines.push('');
    }

    if (this.mode === 'apply') {
      lines.push('## Next Steps');
      lines.push('1. Run drift scanner to verify improvements');
      lines.push('2. Check git status in remediated repos');
      lines.push('3. Commit changes if satisfied');
      lines.push('4. Use rollback plans if needed');
    }

    const reportPath = path.join(outputDir, `remediation-report-${timestamp}.md`);
    fs.writeFileSync(reportPath, lines.join('\n'));
    console.log(`📄 Summary report: ${reportPath}`);
  }

  /**
   * Main execution
   */
  async run(args) {
    console.log('🔧 Auto-Remediation Tool v1.0.0');
    console.log('Mission: PLATOPS-DRIFT-AUTO-REMEDIATE-0005');
    console.log('=========================================\n');

    try {
      // Parse arguments
      this.parseArgs(args);
      console.log(`Mode: ${this.mode.toUpperCase()}`);

      // Load ledger
      console.log('\n📊 Loading drift rollout ledger...');
      const ledger = this.loadLedger();

      // Filter target repos
      const targets = this.filterTargetRepos(ledger);
      this.results.targeted = targets.map(r => r.repository);

      console.log(`✅ Found ${targets.length} ${this.targetClass} repositories to process`);

      if (targets.length === 0) {
        console.log('\nNo repositories need remediation.');
        return;
      }

      // Show targets
      console.log('\nTarget repositories:');
      for (const repo of targets) {
        console.log(`  - ${repo.repository} (${repo.owner})`);
      }

      // Confirm in apply mode
      if (this.mode === 'apply') {
        console.log('\n⚠️  WARNING: Apply mode will modify files!');
        console.log('Proceeding with remediation...\n');
        // In production, add user confirmation here
      }

      // Process repositories
      await this.processRepositories(targets);

      // Save results
      const outputDir = this.saveResults();

      // Final report
      console.log('\n=========================================');
      console.log('Auto-Remediation Complete');
      console.log(`Mode: ${this.mode.toUpperCase()}`);
      console.log(`Success Rate: ${Math.round((this.results.summary.succeeded / this.results.summary.total) * 100)}%`);

      if (this.mode === 'apply' && this.results.summary.succeeded > 0) {
        console.log('\n✅ Remediation applied successfully!');
        console.log('Run drift scanner to verify improvements.');
      } else if (this.mode === 'dry-run') {
        console.log('\n🔍 Dry run complete. Review results and run with "apply" to remediate.');
      } else if (this.mode === 'rollback-plan') {
        console.log('\n📝 Rollback plans generated for all repositories.');
      }

      console.log('=========================================');

    } catch (error) {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const tool = new AutoRemediateDrift();
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log('Usage: auto-remediate-drift.js <mode> [repos...]');
    console.log('');
    console.log('Modes:');
    console.log('  dry-run       - Show what would be done (default)');
    console.log('  apply         - Apply remediation to repositories');
    console.log('  rollback-plan - Generate rollback plans');
    console.log('');
    console.log('Examples:');
    console.log('  auto-remediate-drift.js dry-run');
    console.log('  auto-remediate-drift.js apply');
    console.log('  auto-remediate-drift.js apply anx-audit-test CREA');
    process.exit(0);
  }

  tool.run(args);
}

module.exports = AutoRemediateDrift;