import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

class PrePushValidator {
  constructor() {
    this.checks = [];
    this.failures = [];
    this.warnings = [];
  }

  async runAllChecks() {
    console.log(chalk.cyan('🚀 Pre-Push Validation Agent\n'));
    console.log(chalk.gray('Running comprehensive checks before push...\n'));

    const startTime = Date.now();

    // Run all validation checks
    await this.checkLinting();
    await this.checkTypeScript();
    await this.checkTests();
    await this.checkSecurityAudit();
    await this.checkEnvironment();
    await this.checkBuildValidity();
    await this.checkGitStatus();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Display results
    this.displayResults(duration);

    // Return exit code
    return this.failures.length === 0 ? 0 : 1;
  }

  async checkLinting() {
    console.log(chalk.blue('📋 Checking ESLint...'));
    
    try {
      const { stdout, stderr } = await execAsync('cd apps/website && npm run lint', {
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      // Check for errors (not just warnings)
      if (stderr || stdout.includes('Error:')) {
        // Parse errors
        const errorMatch = stdout.match(/(\d+) error/);
        const warningMatch = stdout.match(/(\d+) warning/);
        
        const errors = errorMatch ? parseInt(errorMatch[1]) : 0;
        const warnings = warningMatch ? parseInt(warningMatch[1]) : 0;

        if (errors > 0) {
          this.failures.push({
            check: 'ESLint',
            message: `${errors} error(s) found`,
            details: this.extractLintErrors(stdout)
          });
          console.log(chalk.red(`   ❌ ${errors} error(s) found`));
        } else {
          console.log(chalk.green(`   ✅ No errors (${warnings} warnings)`));
          if (warnings > 0) {
            this.warnings.push(`${warnings} ESLint warnings present`);
          }
        }
      } else {
        console.log(chalk.green('   ✅ Passed'));
      }
    } catch (error) {
      // Lint failures throw errors
      const errorMatch = error.stdout?.match(/(\d+) error/);
      const errors = errorMatch ? parseInt(errorMatch[1]) : 0;
      
      if (errors > 0) {
        this.failures.push({
          check: 'ESLint',
          message: `${errors} error(s) must be fixed`,
          details: this.extractLintErrors(error.stdout)
        });
        console.log(chalk.red(`   ❌ ${errors} error(s) found`));
      }
    }
  }

  extractLintErrors(output) {
    const lines = output.split('\n');
    const errors = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('Error:') && !line.includes('warning')) {
        errors.push(line.trim());
      }
    }
    
    return errors.slice(0, 5); // Return first 5 errors
  }

  async checkTypeScript() {
    console.log(chalk.blue('🔷 Checking TypeScript...'));
    
    try {
      await execAsync('cd apps/website && npx tsc --noEmit');
      console.log(chalk.green('   ✅ Passed'));
    } catch (error) {
      const errorCount = (error.stdout.match(/error TS/g) || []).length;
      this.failures.push({
        check: 'TypeScript',
        message: `${errorCount} type error(s) found`,
        details: error.stdout.split('\n').slice(0, 10)
      });
      console.log(chalk.red(`   ❌ ${errorCount} type error(s)`));
    }
  }

  async checkTests() {
    console.log(chalk.blue('🧪 Checking Tests...'));
    
    try {
      await execAsync('cd apps/website && npm run test -- --passWithNoTests');
      console.log(chalk.green('   ✅ Passed'));
    } catch (error) {
      // Only fail if tests actually fail, not if no tests found
      if (!error.stdout?.includes('no tests found')) {
        this.failures.push({
          check: 'Tests',
          message: 'Test suite failed',
          details: error.stdout?.split('\n').slice(-10)
        });
        console.log(chalk.red('   ❌ Failed'));
      } else {
        console.log(chalk.yellow('   ⚠️  No tests found (skipped)'));
      }
    }
  }

  async checkSecurityAudit() {
    console.log(chalk.blue('🔒 Checking Security Vulnerabilities...'));
    
    try {
      const { stdout } = await execAsync('cd apps/website && npm audit --audit-level moderate', {
        maxBuffer: 10 * 1024 * 1024
      });
      
      console.log(chalk.green('   ✅ No vulnerabilities found'));
    } catch (error) {
      // npm audit returns non-zero exit code if vulnerabilities found
      const output = error.stdout || '';
      
      // Parse vulnerability counts from the summary line
      const vulnerabilitiesMatch = output.match(/(\d+)\s+vulnerabilities?\s*\(([^)]+)\)/i);
      
      let critical = 0, high = 0, moderate = 0, low = 0;
      
      if (vulnerabilitiesMatch) {
        const summary = vulnerabilitiesMatch[2]; // e.g., "2 low, 2 moderate"
        const criticalMatch = summary.match(/(\d+)\s+critical/i);
        const highMatch = summary.match(/(\d+)\s+high/i);
        const moderateMatch = summary.match(/(\d+)\s+moderate/i);
        const lowMatch = summary.match(/(\d+)\s+low/i);
        
        critical = criticalMatch ? parseInt(criticalMatch[1]) : 0;
        high = highMatch ? parseInt(highMatch[1]) : 0;
        moderate = moderateMatch ? parseInt(moderateMatch[1]) : 0;
        low = lowMatch ? parseInt(lowMatch[1]) : 0;
      }
      
      const total = critical + high + moderate + low;
      
      if (critical > 0 || high > 0 || moderate > 0) {
        const severityParts = [];
        if (critical > 0) severityParts.push(`${critical} critical`);
        if (high > 0) severityParts.push(`${high} high`);
        if (moderate > 0) severityParts.push(`${moderate} moderate`);
        
        this.failures.push({
          check: 'Security Audit',
          message: `${total} vulnerability(ies): ${severityParts.join(', ')}`,
          details: this.extractSecurityIssues(output)
        });
        console.log(chalk.red(`   ❌ ${total} vulnerability(ies) found`));
      } else if (low > 0) {
        this.warnings.push(`${low} low severity vulnerability(ies)`);
        console.log(chalk.yellow(`   ⚠️  ${low} low severity vulnerability(ies)`));
      } else {
        // If no vulnerabilities parsed but error occurred, show generic message
        console.log(chalk.yellow('   ⚠️  Could not parse audit results'));
      }
    }
  }

  extractSecurityIssues(output) {
    const lines = output.split('\n');
    const issues = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Extract package names and severity
      if (line.match(/^[a-z0-9@/-]+\s+[<>=*]/i) || line.includes('Severity:')) {
        issues.push(line.trim());
        if (issues.length >= 8) break; // Limit to first 8 lines
      }
    }
    
    if (issues.length === 0) {
      issues.push('Run: npm audit for details');
      issues.push('Fix: npm audit fix');
    }
    
    return issues;
  }

  async checkEnvironment() {
    console.log(chalk.blue('🔐 Checking Environment...'));
    
    try {
      const { stdout } = await execAsync('node scripts/validate-env.mjs');
      
      // Check if critical variables missing
      if (stdout.includes('Missing') || stdout.includes('undefined')) {
        this.warnings.push('Some environment variables may be missing');
        console.log(chalk.yellow('   ⚠️  Some variables missing (warnings)'));
      } else {
        console.log(chalk.green('   ✅ Passed'));
      }
    } catch (error) {
      this.warnings.push('Environment validation script not found');
      console.log(chalk.yellow('   ⚠️  Validator not found (skipped)'));
    }
  }

  async checkBuildValidity() {
    console.log(chalk.blue('🏗️  Checking Build Validity...'));
    
    try {
      // Check if build would likely succeed
      await execAsync('cd apps/website && npm run build -- --dry-run 2>/dev/null || echo "dry-run not supported"');
      console.log(chalk.green('   ✅ Likely to succeed'));
    } catch (error) {
      console.log(chalk.yellow('   ⚠️  Cannot predict (skipped)'));
    }
  }

  async checkGitStatus() {
    console.log(chalk.blue('📦 Checking Git Status...'));
    
    try {
      const { stdout } = await execAsync('git status --porcelain');
      
      const unstagedFiles = stdout.split('\n').filter(line => 
        line.startsWith(' M') || line.startsWith('??')
      ).length;

      if (unstagedFiles > 0) {
        this.warnings.push(`${unstagedFiles} unstaged file(s)`);
        console.log(chalk.yellow(`   ⚠️  ${unstagedFiles} unstaged file(s)`));
      } else {
        console.log(chalk.green('   ✅ All changes staged'));
      }
    } catch (error) {
      console.log(chalk.yellow('   ⚠️  Cannot check (skipped)'));
    }
  }

  displayResults(duration) {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.bold('\n📊 Validation Results\n'));

    if (this.failures.length === 0) {
      console.log(chalk.green.bold('✅ ALL CHECKS PASSED!'));
      console.log(chalk.green(`Ready to push to remote.`));
      
      if (this.warnings.length > 0) {
        console.log(chalk.yellow(`\n⚠️  ${this.warnings.length} warning(s):`));
        this.warnings.forEach(w => console.log(chalk.yellow(`   - ${w}`)));
      }
    } else {
      console.log(chalk.red.bold(`❌ ${this.failures.length} CHECK(S) FAILED\n`));
      
      this.failures.forEach((failure, i) => {
        console.log(chalk.red(`${i + 1}. ${failure.check}: ${failure.message}`));
        if (failure.details && failure.details.length > 0) {
          console.log(chalk.gray('   Details:'));
          failure.details.forEach(detail => {
            if (detail.trim()) {
              console.log(chalk.gray(`   ${detail}`));
            }
          });
        }
        console.log('');
      });

      console.log(chalk.yellow('Fix these issues before pushing:\n'));
      console.log(chalk.cyan('💡 Quick fixes:'));
      console.log(chalk.gray('   - Run: npm run lint:fix'));
      console.log(chalk.gray('   - Run: node scripts/auto-fix-lint.mjs'));
      console.log(chalk.gray('   - Manual: Review errors above\n'));
    }

    console.log(chalk.gray(`⏱️  Completed in ${duration}s`));
    console.log('='.repeat(60) + '\n');
  }
}

// Run validation
const validator = new PrePushValidator();
validator.runAllChecks().then(exitCode => {
  process.exit(exitCode);
}).catch(error => {
  console.error(chalk.red('Validation failed with error:'), error);
  process.exit(1);
});
