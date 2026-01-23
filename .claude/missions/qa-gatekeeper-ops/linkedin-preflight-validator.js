#!/usr/bin/env node
/**
 * QA Gatekeeper - LinkedIn Preflight Validator v1.0
 * Mission 1: Validates content files and session directories
 */

import fs from 'fs/promises';
import path from 'path';

class LinkedInPreflightValidator {
  constructor(options = {}) {
    this.options = {
      contentDir: options.contentDir || 'C:\\Dev\\.claude-anx\\content',
      sessionDir: options.sessionDir || 'C:\\Dev\\.claude-anx\\sessions',
      contentFile: options.contentFile || null,
      minFileSize: options.minFileSize || 200,
      ...options
    };

    this.results = {
      timestamp: new Date().toISOString(),
      validationId: `QA-${Date.now().toString(36).toUpperCase()}`,
      phase: 'initialization',
      passed: false,
      checks: [],
      evidence: []
    };
  }

  /**
   * Run complete preflight validation
   */
  async runValidation() {
    console.log('🛡️ QA GATEKEEPER - LINKEDIN PREFLIGHT VALIDATION STARTING...');
    console.log(`Validation ID: ${this.results.validationId}\n`);

    try {
      // Check 1: Validate content file
      await this.validateContentFile();

      // Check 2: Validate session directory
      await this.validateSessionDirectory();

      // Check 3: Validate session bootstrap receipt
      await this.validateSessionBootstrap();

      // Check 4: Validate LinkedIn session structure
      await this.validateLinkedInSession();

      // Overall validation result
      this.results.passed = this.results.checks.every(check => check.passed);
      this.results.phase = this.results.passed ? 'passed' : 'failed';

      // Generate receipt
      await this.generateReceipt();

    } catch (error) {
      this.results.error = error.message;
      this.results.phase = 'error';
      console.error(`❌ Validation failed: ${error.message}`);
    }

    return this.results;
  }

  /**
   * Validate content file exists and meets requirements
   */
  async validateContentFile() {
    console.log('📄 Check 1: Content File Validation...');

    const check = {
      name: 'Content File Validation',
      passed: false,
      details: []
    };

    try {
      if (!this.options.contentFile) {
        throw new Error('Content file path not specified');
      }

      const contentPath = path.resolve(this.options.contentFile);

      // Check file exists
      try {
        await fs.access(contentPath);
        check.details.push({
          test: 'File exists',
          result: 'PASS',
          value: contentPath
        });
      } catch {
        throw new Error(`Content file not found: ${contentPath}`);
      }

      // Check file size
      const stats = await fs.stat(contentPath);
      const fileSizePass = stats.size >= this.options.minFileSize;

      check.details.push({
        test: 'File size minimum',
        result: fileSizePass ? 'PASS' : 'FAIL',
        value: `${stats.size} bytes`,
        required: `>= ${this.options.minFileSize} bytes`
      });

      // Check file content
      const content = await fs.readFile(contentPath, 'utf-8');
      const hasContent = content.trim().length > 0;

      check.details.push({
        test: 'File has content',
        result: hasContent ? 'PASS' : 'FAIL',
        value: `${content.length} characters`
      });

      // Create evidence - content preview
      const contentPreview = content.substring(0, 200) + (content.length > 200 ? '...' : '');
      const evidencePath = await this.createContentPreview(contentPath, contentPreview, stats);
      this.results.evidence.push(evidencePath);

      check.passed = fileSizePass && hasContent;
      console.log(check.passed ? '✅ Content file validation passed' : '❌ Content file validation failed');

    } catch (error) {
      check.error = error.message;
      check.passed = false;
      console.log(`❌ Content file validation failed: ${error.message}`);
    }

    this.results.checks.push(check);
  }

  /**
   * Validate session directory structure
   */
  async validateSessionDirectory() {
    console.log('📁 Check 2: Session Directory Validation...');

    const check = {
      name: 'Session Directory Validation',
      passed: false,
      details: []
    };

    try {
      // Check session directory exists
      try {
        await fs.access(this.options.sessionDir);
        check.details.push({
          test: 'Session directory exists',
          result: 'PASS',
          value: this.options.sessionDir
        });
      } catch {
        throw new Error(`Session directory not found: ${this.options.sessionDir}`);
      }

      // Check directory contents
      const sessionContents = await fs.readdir(this.options.sessionDir);
      check.details.push({
        test: 'Directory has contents',
        result: sessionContents.length > 0 ? 'PASS' : 'WARN',
        value: `${sessionContents.length} items`
      });

      // Look for LinkedIn-specific session files
      const linkedinDirs = sessionContents.filter(item =>
        item.toLowerCase().includes('linkedin') ||
        item.toLowerCase().includes('session')
      );

      check.details.push({
        test: 'LinkedIn session indicators',
        result: linkedinDirs.length > 0 ? 'PASS' : 'WARN',
        value: linkedinDirs.join(', ') || 'None found'
      });

      check.passed = sessionContents.length > 0;
      console.log(check.passed ? '✅ Session directory validation passed' : '❌ Session directory validation failed');

    } catch (error) {
      check.error = error.message;
      check.passed = false;
      console.log(`❌ Session directory validation failed: ${error.message}`);
    }

    this.results.checks.push(check);
  }

  /**
   * Validate session bootstrap receipt
   */
  async validateSessionBootstrap() {
    console.log('🧾 Check 3: Session Bootstrap Receipt...');

    const check = {
      name: 'Session Bootstrap Receipt',
      passed: false,
      details: []
    };

    try {
      const receiptPath = path.join(this.options.sessionDir, 'LINKEDIN_SESSION_BOOTSTRAP_RECEIPT.md');

      // Check receipt exists
      try {
        await fs.access(receiptPath);
        check.details.push({
          test: 'Bootstrap receipt exists',
          result: 'PASS',
          value: receiptPath
        });
      } catch {
        check.details.push({
          test: 'Bootstrap receipt exists',
          result: 'WARN',
          value: 'Not found - may need session setup'
        });
        check.passed = true; // Allow without receipt for first run
        console.log('⚠️  Bootstrap receipt not found - session may need setup');
        this.results.checks.push(check);
        return;
      }

      // Check receipt content
      const receiptContent = await fs.readFile(receiptPath, 'utf-8');
      const hasRequiredSections = [
        'Session Bootstrap',
        'LinkedIn',
        'timestamp'
      ].every(section => receiptContent.toLowerCase().includes(section.toLowerCase()));

      check.details.push({
        test: 'Receipt has required sections',
        result: hasRequiredSections ? 'PASS' : 'FAIL',
        value: hasRequiredSections ? 'All sections present' : 'Missing required sections'
      });

      // Check receipt age (should be relatively recent)
      const receiptStats = await fs.stat(receiptPath);
      const ageHours = (Date.now() - receiptStats.mtime.getTime()) / (1000 * 60 * 60);
      const recentEnough = ageHours <= 168; // 1 week

      check.details.push({
        test: 'Receipt age acceptable',
        result: recentEnough ? 'PASS' : 'WARN',
        value: `${ageHours.toFixed(1)} hours old`,
        note: recentEnough ? 'Recent' : 'May need session refresh'
      });

      check.passed = hasRequiredSections;
      console.log(check.passed ? '✅ Bootstrap receipt validation passed' : '❌ Bootstrap receipt validation failed');

    } catch (error) {
      check.error = error.message;
      check.passed = false;
      console.log(`❌ Bootstrap receipt validation failed: ${error.message}`);
    }

    this.results.checks.push(check);
  }

  /**
   * Validate LinkedIn session structure
   */
  async validateLinkedInSession() {
    console.log('🔐 Check 4: LinkedIn Session Structure...');

    const check = {
      name: 'LinkedIn Session Structure',
      passed: false,
      details: []
    };

    try {
      // Look for browser session directories
      const sessionContents = await fs.readdir(this.options.sessionDir);
      const browserDirs = sessionContents.filter(item =>
        ['chrome', 'chromium', 'playwright', 'browser'].some(browser =>
          item.toLowerCase().includes(browser)
        )
      );

      check.details.push({
        test: 'Browser session directories',
        result: browserDirs.length > 0 ? 'PASS' : 'WARN',
        value: browserDirs.join(', ') || 'None found'
      });

      // Check for session files
      for (const dir of browserDirs) {
        const browserPath = path.join(this.options.sessionDir, dir);
        try {
          const browserStats = await fs.stat(browserPath);
          if (browserStats.isDirectory()) {
            const browserContents = await fs.readdir(browserPath);
            check.details.push({
              test: `${dir} session files`,
              result: browserContents.length > 0 ? 'PASS' : 'WARN',
              value: `${browserContents.length} files`
            });
          }
        } catch {
          // Skip if can't read directory
        }
      }

      // Overall session validation
      check.passed = browserDirs.length > 0;
      console.log(check.passed ? '✅ LinkedIn session structure validated' : '⚠️  LinkedIn session may need setup');

    } catch (error) {
      check.error = error.message;
      check.passed = false;
      console.log(`❌ LinkedIn session structure validation failed: ${error.message}`);
    }

    this.results.checks.push(check);
  }

  /**
   * Create content preview evidence
   */
  async createContentPreview(contentPath, preview, stats) {
    const evidenceContent = `# CONTENT FILE PREVIEW - PREFLIGHT VALIDATION

**File**: ${contentPath}
**Size**: ${stats.size} bytes
**Modified**: ${stats.mtime.toISOString()}
**Validation ID**: ${this.results.validationId}

## Content Preview

\`\`\`
${preview}
\`\`\`

## File Stats

- **Size**: ${stats.size} bytes (minimum: ${this.options.minFileSize})
- **Created**: ${stats.birthtime.toISOString()}
- **Modified**: ${stats.mtime.toISOString()}
- **Accessed**: ${stats.atime.toISOString()}

## Validation Status

${stats.size >= this.options.minFileSize ? '✅' : '❌'} File meets minimum size requirement
${preview.trim().length > 0 ? '✅' : '❌'} File contains content

---
*Generated by QA Gatekeeper - LinkedIn Preflight Validator v1.0*
*Timestamp: ${new Date().toISOString()}*
`;

    const evidencePath = path.join(
      path.dirname(contentPath),
      `EVIDENCE_CONTENT_PREVIEW_${this.results.validationId}.md`
    );

    await fs.writeFile(evidencePath, evidenceContent);
    return evidencePath;
  }

  /**
   * Generate preflight validation receipt
   */
  async generateReceipt() {
    const receipt = `# RECEIPT_LINKEDIN_PRECHECK_V1

**Date**: ${this.results.timestamp}
**Validation ID**: ${this.results.validationId}
**Status**: ${this.results.passed ? 'PASS ✅' : 'FAIL ❌'}
**Phase**: ${this.results.phase}

## QA Gatekeeper Preflight Results

${this.results.checks.map(check => `
### ${check.name}
**Status**: ${check.passed ? 'PASS ✅' : 'FAIL ❌'}

| Test | Result | Value | Required | Note |
|------|--------|-------|----------|------|
${check.details.map(detail =>
  `| ${detail.test} | ${detail.result} | ${detail.value} | ${detail.required || '-'} | ${detail.note || '-'} |`
).join('\n')}

${check.error ? `**Error**: ${check.error}` : ''}
`).join('\n')}

## Validation Summary

${this.results.checks.map((check, index) =>
  `${index + 1}. **${check.name}**: ${check.passed ? '✅ PASS' : '❌ FAIL'}`
).join('\n')}

## Evidence Files

${this.results.evidence.map(evidence => `- ${evidence}`).join('\n')}

## Content File Details

- **Path**: ${this.options.contentFile || 'Not specified'}
- **Minimum Size**: ${this.options.minFileSize} bytes
- **Session Directory**: ${this.options.sessionDir}

## Pre-Publishing Checklist

- **Content Validated**: ${this.results.checks[0]?.passed ? '✅' : '❌'} Post content exists and meets requirements
- **Sessions Ready**: ${this.results.checks[1]?.passed ? '✅' : '❌'} Browser sessions directory exists
- **Bootstrap Receipt**: ${this.results.checks[2]?.passed ? '✅' : '❌'} Session setup documented
- **LinkedIn Session**: ${this.results.checks[3]?.passed ? '✅' : '❌'} LinkedIn-specific session files ready

## Next Steps

${this.results.passed ?
  '✅ **Preflight validation passed** - Ready for approval checkpoint' :
  '❌ **Preflight validation failed** - Address issues before proceeding'
}

${this.results.error ? `
## Validation Error

**Error**: ${this.results.error}
**Phase**: ${this.results.phase}
` : ''}

---
*QA Gatekeeper - LinkedIn Preflight Validator v1.0*
*Receipt generated: ${new Date().toISOString()}*
*Mission 1 of 5 - Content and session validation complete*
`;

    const receiptPath = 'C:\\Dev\\.claude-anx\\receipts\\RECEIPT_LINKEDIN_PRECHECK_V1.md';
    await fs.mkdir(path.dirname(receiptPath), { recursive: true });
    await fs.writeFile(receiptPath, receipt);

    console.log(`\n🧾 Preflight validation receipt: ${receiptPath}`);
    return receiptPath;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  const options = {
    contentFile: args.find(arg => arg.startsWith('--content='))?.split('=')[1],
    sessionDir: args.find(arg => arg.startsWith('--session-dir='))?.split('=')[1],
    minFileSize: parseInt(args.find(arg => arg.startsWith('--min-size='))?.split('=')[1] || '200')
  };

  if (!options.contentFile) {
    console.error('❌ Content file required. Use --content=/path/to/content.md');
    process.exit(1);
  }

  console.clear();
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║                   QA GATEKEEPER - MISSION 1                       ║
║                 LinkedIn Preflight Validator                      ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

  const validator = new LinkedInPreflightValidator(options);

  try {
    const results = await validator.runValidation();

    console.log(`\n🎯 PREFLIGHT RESULT: ${results.passed ? 'VALIDATION PASSED' : 'VALIDATION FAILED'}`);

    if (results.passed) {
      console.log(`
🚀 PREFLIGHT VALIDATION COMPLETE
   Ready for Mission 2: Approval Checkpoint
      `);
    } else {
      console.log(`
⚠️  PREFLIGHT VALIDATION INCOMPLETE
   Address validation issues before proceeding to approval checkpoint
      `);
    }

  } catch (error) {
    console.error('Preflight validation error:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default LinkedInPreflightValidator;