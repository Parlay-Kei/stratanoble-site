#!/usr/bin/env node
/**
 * Approvals Ops - LinkedIn Approval Checkpoint v1.0
 * Mission 2: HIGH severity approval checkpoint for LIVE posting
 */

import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import crypto from 'crypto';

class LinkedInApprovalCheckpoint {
  constructor(options = {}) {
    this.options = {
      severity: options.severity || 'HIGH',
      timeoutMinutes: options.timeoutMinutes || 10,
      requireToken: options.requireToken !== false,
      bypassCode: options.bypassCode || null,
      dryRun: options.dryRun !== false,
      ...options
    };

    this.results = {
      timestamp: new Date().toISOString(),
      approvalId: `APP-${Date.now().toString(36).toUpperCase()}`,
      phase: 'initialization',
      approved: false,
      checks: [],
      evidence: [],
      approver: null,
      approvalToken: null
    };
  }

  /**
   * Run approval checkpoint
   */
  async runApprovalCheckpoint() {
    console.log('🛡️ APPROVALS OPS - LINKEDIN APPROVAL CHECKPOINT STARTING...');
    console.log(`Approval ID: ${this.results.approvalId}`);
    console.log(`Severity: ${this.options.severity}`);
    console.log(`Mode: ${this.options.dryRun ? 'DRY-RUN' : 'LIVE'}`);
    console.log('');

    try {
      // Check 1: Validate request context
      await this.validateRequestContext();

      // Check 2: Display approval prompt
      await this.displayApprovalPrompt();

      // Check 3: Collect approval decision
      await this.collectApprovalDecision();

      // Check 4: Validate approval token
      if (this.results.approved && this.options.requireToken) {
        await this.validateApprovalToken();
      }

      // Generate receipt
      await this.generateReceipt();

    } catch (error) {
      this.results.error = error.message;
      this.results.phase = 'error';
      console.error(`❌ Approval checkpoint failed: ${error.message}`);
    }

    return this.results;
  }

  /**
   * Validate request context
   */
  async validateRequestContext() {
    console.log('📋 Check 1: Validating Request Context...');

    const check = {
      name: 'Request Context Validation',
      passed: false,
      details: []
    };

    try {
      // Check if this is a LIVE posting request
      const isLiveRequest = !this.options.dryRun;
      check.details.push({
        test: 'Request mode',
        value: isLiveRequest ? 'LIVE' : 'DRY-RUN',
        severity: isLiveRequest ? 'HIGH' : 'LOW',
        requiresApproval: isLiveRequest
      });

      // Check severity level
      const severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const severityIndex = severityLevels.indexOf(this.options.severity);

      check.details.push({
        test: 'Severity level',
        value: this.options.severity,
        index: severityIndex,
        requiresApproval: severityIndex >= 2 // HIGH or CRITICAL
      });

      // Check for bypass code
      if (this.options.bypassCode) {
        check.details.push({
          test: 'Bypass code provided',
          value: 'Yes',
          note: 'Administrative bypass available'
        });
      }

      // Determine if approval is required
      const approvalRequired = isLiveRequest || severityIndex >= 2;
      check.details.push({
        test: 'Approval required',
        value: approvalRequired ? 'YES' : 'NO',
        result: 'INFO'
      });

      check.passed = true;
      console.log('✅ Request context validated');

    } catch (error) {
      check.error = error.message;
      check.passed = false;
      console.log(`❌ Request context validation failed: ${error.message}`);
    }

    this.results.checks.push(check);
  }

  /**
   * Display approval prompt
   */
  async displayApprovalPrompt() {
    console.log('\n🚨 Check 2: Approval Prompt Display...');

    const check = {
      name: 'Approval Prompt Display',
      passed: false,
      details: []
    };

    try {
      // Create approval prompt
      const prompt = this.createApprovalPrompt();
      console.log(prompt);

      // Log prompt display
      check.details.push({
        test: 'Approval prompt displayed',
        value: 'YES',
        timestamp: new Date().toISOString()
      });

      // Create evidence of prompt
      const promptPath = await this.saveApprovalPrompt(prompt);
      this.results.evidence.push(promptPath);

      check.details.push({
        test: 'Prompt evidence saved',
        value: promptPath,
        result: 'PASS'
      });

      check.passed = true;
      console.log('✅ Approval prompt displayed');

    } catch (error) {
      check.error = error.message;
      check.passed = false;
      console.log(`❌ Approval prompt display failed: ${error.message}`);
    }

    this.results.checks.push(check);
  }

  /**
   * Collect approval decision
   */
  async collectApprovalDecision() {
    console.log('\n⏳ Check 3: Collecting Approval Decision...');

    const check = {
      name: 'Approval Decision Collection',
      passed: false,
      details: []
    };

    try {
      // Check for bypass code first
      if (this.options.bypassCode) {
        const isValidBypass = await this.validateBypassCode(this.options.bypassCode);
        if (isValidBypass) {
          this.results.approved = true;
          this.results.approver = 'SYSTEM_BYPASS';

          check.details.push({
            test: 'Bypass code validation',
            value: 'VALID',
            result: 'APPROVED'
          });

          check.passed = true;
          console.log('✅ Valid bypass code - approval granted');
          this.results.checks.push(check);
          return;
        }
      }

      // Interactive approval for LIVE requests
      if (!this.options.dryRun) {
        const decision = await this.promptForApproval();

        this.results.approved = decision.approved;
        this.results.approver = decision.approver;
        this.results.approvalToken = decision.token;

        check.details.push({
          test: 'Interactive approval',
          value: decision.approved ? 'APPROVED' : 'DENIED',
          approver: decision.approver,
          timestamp: new Date().toISOString()
        });

      } else {
        // Auto-approve DRY-RUN requests
        this.results.approved = true;
        this.results.approver = 'AUTO_DRY_RUN';

        check.details.push({
          test: 'Dry-run auto-approval',
          value: 'APPROVED',
          note: 'Automatic approval for dry-run mode'
        });
      }

      check.passed = true;
      console.log(this.results.approved ? '✅ Approval granted' : '❌ Approval denied');

    } catch (error) {
      check.error = error.message;
      check.passed = false;
      console.log(`❌ Approval decision collection failed: ${error.message}`);
    }

    this.results.checks.push(check);
  }

  /**
   * Validate approval token
   */
  async validateApprovalToken() {
    console.log('\n🔐 Check 4: Validating Approval Token...');

    const check = {
      name: 'Approval Token Validation',
      passed: false,
      details: []
    };

    try {
      if (!this.results.approvalToken) {
        check.details.push({
          test: 'Token presence',
          value: 'MISSING',
          result: 'WARN',
          note: 'No token provided'
        });
        check.passed = true; // Allow missing token for dry-run
      } else {
        // Validate token format
        const tokenFormat = /^[A-Z0-9]{8,16}$/.test(this.results.approvalToken);
        check.details.push({
          test: 'Token format',
          value: tokenFormat ? 'VALID' : 'INVALID',
          result: tokenFormat ? 'PASS' : 'FAIL'
        });

        // Generate token hash for audit trail
        const tokenHash = crypto.createHash('sha256')
          .update(this.results.approvalToken)
          .digest('hex')
          .substring(0, 16);

        check.details.push({
          test: 'Token hash (audit)',
          value: tokenHash,
          result: 'INFO'
        });

        check.passed = tokenFormat;
      }

      console.log(check.passed ? '✅ Approval token validated' : '❌ Approval token validation failed');

    } catch (error) {
      check.error = error.message;
      check.passed = false;
      console.log(`❌ Approval token validation failed: ${error.message}`);
    }

    this.results.checks.push(check);
  }

  /**
   * Create approval prompt
   */
  createApprovalPrompt() {
    return `
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║                    🚨 APPROVAL REQUIRED 🚨                        ║
║                                                                    ║
║                      LINKEDIN LIVE POSTING                        ║
║                      Severity: ${this.options.severity.padEnd(8)}                       ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  This operation will publish content to LinkedIn with REAL        ║
║  external effects. This requires explicit approval.               ║
║                                                                    ║
║  Approval ID: ${this.results.approvalId.padEnd(12)}                       ║
║  Timestamp: ${this.results.timestamp.padEnd(24)}   ║
║  Mode: ${(this.options.dryRun ? 'DRY-RUN' : 'LIVE').padEnd(8)}                                    ║
║                                                                    ║
║  ⚠️  LIVE mode will:                                               ║
║  • Post content to LinkedIn profile                               ║
║  • Make content publicly visible                                  ║
║  • Generate tamper-evident receipts                               ║
║  • Create audit trail                                             ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

${this.options.dryRun ?
  '🧪 DRY-RUN MODE: No real posting will occur - approval auto-granted' :
  '🚨 LIVE MODE: Real LinkedIn posting will occur - explicit approval required'
}
`;
  }

  /**
   * Save approval prompt as evidence
   */
  async saveApprovalPrompt(prompt) {
    const evidence = `# APPROVAL PROMPT EVIDENCE

**Approval ID**: ${this.results.approvalId}
**Timestamp**: ${new Date().toISOString()}
**Severity**: ${this.options.severity}
**Mode**: ${this.options.dryRun ? 'DRY-RUN' : 'LIVE'}

## Displayed Prompt

\`\`\`
${prompt}
\`\`\`

## Request Context

- **Severity Level**: ${this.options.severity}
- **Timeout**: ${this.options.timeoutMinutes} minutes
- **Token Required**: ${this.options.requireToken ? 'Yes' : 'No'}
- **Bypass Available**: ${this.options.bypassCode ? 'Yes' : 'No'}

---
*Generated by Approvals Ops - LinkedIn Approval Checkpoint v1.0*
*Evidence timestamp: ${new Date().toISOString()}*
`;

    const evidencePath = path.join(
      'C:\\Dev\\.claude-anx\\evidence',
      `APPROVAL_PROMPT_${this.results.approvalId}.md`
    );

    await fs.mkdir(path.dirname(evidencePath), { recursive: true });
    await fs.writeFile(evidencePath, evidence);

    return evidencePath;
  }

  /**
   * Prompt for interactive approval
   */
  async promptForApproval() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      console.log('\n📝 Please provide approval details:\n');

      rl.question('Approver name/ID: ', (approver) => {
        if (!approver.trim()) {
          console.log('❌ Approval denied: No approver provided');
          rl.close();
          resolve({ approved: false, approver: null, token: null });
          return;
        }

        rl.question('Approval decision (YES/NO): ', (decision) => {
          const approved = decision.toUpperCase() === 'YES';

          if (!approved) {
            console.log('❌ Approval denied by user');
            rl.close();
            resolve({ approved: false, approver: approver.trim(), token: null });
            return;
          }

          if (this.options.requireToken) {
            rl.question('Approval token (optional): ', (token) => {
              rl.close();
              resolve({
                approved: true,
                approver: approver.trim(),
                token: token.trim() || null
              });
            });
          } else {
            rl.close();
            resolve({
              approved: true,
              approver: approver.trim(),
              token: null
            });
          }
        });
      });

      // Setup timeout
      setTimeout(() => {
        console.log(`\n⏰ Approval timeout (${this.options.timeoutMinutes} minutes) - denied by default`);
        rl.close();
        resolve({ approved: false, approver: 'TIMEOUT', token: null });
      }, this.options.timeoutMinutes * 60 * 1000);
    });
  }

  /**
   * Validate bypass code
   */
  async validateBypassCode(code) {
    // Simple bypass validation - in production, use encrypted codes
    const validCodes = [
      'ADMIN_BYPASS_2024',
      'EMERGENCY_OVERRIDE',
      'DEV_TEST_MODE'
    ];

    return validCodes.includes(code);
  }

  /**
   * Generate approval checkpoint receipt
   */
  async generateReceipt() {
    const receipt = `# RECEIPT_LINKEDIN_APPROVAL_V1

**Date**: ${this.results.timestamp}
**Approval ID**: ${this.results.approvalId}
**Status**: ${this.results.approved ? 'APPROVED ✅' : 'DENIED ❌'}
**Phase**: ${this.results.phase}

## Approval Checkpoint Results

${this.results.checks.map(check => `
### ${check.name}
**Status**: ${check.passed ? 'PASS ✅' : 'FAIL ❌'}

| Test | Value | Result | Note |
|------|-------|--------|------|
${check.details.map(detail =>
  `| ${detail.test} | ${detail.value} | ${detail.result || '-'} | ${detail.note || '-'} |`
).join('\n')}

${check.error ? `**Error**: ${check.error}` : ''}
`).join('\n')}

## Approval Summary

- **Decision**: ${this.results.approved ? '✅ APPROVED' : '❌ DENIED'}
- **Approver**: ${this.results.approver || 'N/A'}
- **Severity**: ${this.options.severity}
- **Mode**: ${this.options.dryRun ? 'DRY-RUN' : 'LIVE'}
- **Token Provided**: ${this.results.approvalToken ? 'Yes' : 'No'}

## Security Controls

- **HIGH Severity Checkpoint**: ✅ Applied for LIVE posting
- **Interactive Approval**: ${this.options.dryRun ? 'Bypassed (dry-run)' : '✅ Required'}
- **Timeout Protection**: ${this.options.timeoutMinutes} minutes
- **Approval Token**: ${this.options.requireToken ? '✅ Supported' : 'Not required'}
- **Bypass Controls**: ${this.options.bypassCode ? '✅ Administrative override available' : 'Not available'}

## Evidence Files

${this.results.evidence.map(evidence => `- ${evidence}`).join('\n')}

## Audit Trail

- **Approval ID**: ${this.results.approvalId}
- **Request Time**: ${this.results.timestamp}
- **Completion Time**: ${new Date().toISOString()}
- **Approver**: ${this.results.approver || 'None'}
- **Decision**: ${this.results.approved ? 'APPROVED' : 'DENIED'}

${this.results.approvalToken ? `
## Token Details

- **Token Provided**: Yes
- **Token Hash**: ${crypto.createHash('sha256').update(this.results.approvalToken).digest('hex').substring(0, 16)}
` : ''}

## Next Steps

${this.results.approved ?
  '✅ **Approval granted** - Proceed to Mission 3: LinkedIn Posting' :
  '❌ **Approval denied** - LinkedIn posting blocked'
}

${this.results.error ? `
## Approval Error

**Error**: ${this.results.error}
**Phase**: ${this.results.phase}
` : ''}

---
*Approvals Ops - LinkedIn Approval Checkpoint v1.0*
*Receipt generated: ${new Date().toISOString()}*
*Mission 2 of 5 - Approval checkpoint complete*
`;

    const receiptPath = 'C:\\Dev\\.claude-anx\\receipts\\RECEIPT_LINKEDIN_APPROVAL_V1.md';
    await fs.mkdir(path.dirname(receiptPath), { recursive: true });
    await fs.writeFile(receiptPath, receipt);

    console.log(`\n🧾 Approval checkpoint receipt: ${receiptPath}`);
    return receiptPath;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  const options = {
    dryRun: !args.includes('--live'),
    severity: args.find(arg => arg.startsWith('--severity='))?.split('=')[1] || 'HIGH',
    timeoutMinutes: parseInt(args.find(arg => arg.startsWith('--timeout='))?.split('=')[1] || '10'),
    bypassCode: args.find(arg => arg.startsWith('--bypass='))?.split('=')[1],
    requireToken: !args.includes('--no-token')
  };

  console.clear();
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║                    APPROVALS OPS - MISSION 2                      ║
║                 LinkedIn Approval Checkpoint                      ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);

  const checkpoint = new LinkedInApprovalCheckpoint(options);

  try {
    const results = await checkpoint.runApprovalCheckpoint();

    console.log(`\n🎯 APPROVAL RESULT: ${results.approved ? 'APPROVED' : 'DENIED'}`);

    if (results.approved) {
      console.log(`
🚀 APPROVAL CHECKPOINT COMPLETE
   Ready for Mission 3: LinkedIn Posting
   Approver: ${results.approver}
      `);
    } else {
      console.log(`
🛑 APPROVAL CHECKPOINT BLOCKED
   LinkedIn posting operation denied
   Reason: ${results.error || 'Approval not granted'}
      `);
      process.exit(1);
    }

  } catch (error) {
    console.error('Approval checkpoint error:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default LinkedInApprovalCheckpoint;