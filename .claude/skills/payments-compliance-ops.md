---
name: payments-compliance-ops
description: Payments compliance operations - payment policy enforcement, compliance checks, audit trails
version: 1.0.0
level: 3
owner: A3
skillId: S10
triggers:
  - payment compliance
  - payout policy
  - payment audit
  - compliance check
  - payment rules
---

# payments-compliance-ops Skill

Enforce payment policies and compliance. Audit payment flows. Ensure regulatory compliance. Owned by CFO Agent (A3).

## Quick Commands

| Command | Action |
|---------|--------|
| `policy` | View/update payment policy |
| `check` | Check compliance status |
| `audit` | Audit payment records |
| `validate` | Validate payment request |
| `report` | Generate compliance report |
| `flags` | View/resolve compliance flags |

---

## Level 1: Policy Definition

### getPaymentPolicy()
```javascript
/**
 * Get current payment policy
 */
function getPaymentPolicy() {
  return {
    version: '1.0.0',
    effectiveDate: '2026-01-01',
    lastReview: '2026-01-15',

    payouts: {
      minimumAmount: 25,
      maximumDaily: 10000,
      maximumWeekly: 50000,
      processingDays: [1, 3, 5], // Mon, Wed, Fri
      holdPeriod: 7, // Days before first payout eligible
      instantPayoutFee: 0.01 // 1%
    },

    verification: {
      kycRequired: true,
      kycThreshold: 600, // Annual earnings threshold for 1099
      idVerificationRequired: true,
      bankVerificationRequired: true,
      backgroundCheckRequired: true // For Direct Cuts
    },

    compliance: {
      amlScreening: true,
      sanctionsCheck: true,
      velocityLimits: {
        transactions_per_day: 100,
        amount_per_day: 10000,
        unique_recipients_per_day: 50
      }
    },

    refunds: {
      maxRefundPeriod: 30, // Days
      requiresApproval: true,
      approvalThreshold: 100
    },

    reporting: {
      '1099Threshold': 600,
      generateAt: 'year_end',
      retain_records_years: 7
    },

    riskLevels: {
      low: { maxSingleTransaction: 1000, autoApprove: true },
      medium: { maxSingleTransaction: 5000, autoApprove: false },
      high: { maxSingleTransaction: 500, autoApprove: false, manualReview: true }
    }
  };
}
```

---

## Level 2: Compliance Checks

### validatePayment()
```javascript
/**
 * Validate a payment request against policy
 */
async function validatePayment(request) {
  const policy = getPaymentPolicy();

  const validation = {
    requestId: request.id,
    amount: request.amount,
    recipient: request.recipientId,
    timestamp: new Date().toISOString(),
    checks: [],
    passed: true,
    flags: [],
    requiresApproval: false
  };

  // Check 1: Minimum amount
  if (request.amount < policy.payouts.minimumAmount) {
    validation.checks.push({
      name: 'minimum_amount',
      passed: false,
      reason: `Amount $${request.amount} below minimum $${policy.payouts.minimumAmount}`
    });
    validation.passed = false;
  } else {
    validation.checks.push({ name: 'minimum_amount', passed: true });
  }

  // Check 2: Daily limit
  const dailyTotal = await getDailyTotal(request.recipientId);
  if (dailyTotal + request.amount > policy.payouts.maximumDaily) {
    validation.checks.push({
      name: 'daily_limit',
      passed: false,
      reason: `Would exceed daily limit of $${policy.payouts.maximumDaily}`
    });
    validation.passed = false;
  } else {
    validation.checks.push({ name: 'daily_limit', passed: true });
  }

  // Check 3: KYC verification
  const kycStatus = await getKYCStatus(request.recipientId);
  if (!kycStatus.verified && policy.verification.kycRequired) {
    validation.checks.push({
      name: 'kyc_verified',
      passed: false,
      reason: 'Recipient KYC not verified'
    });
    validation.passed = false;
  } else {
    validation.checks.push({ name: 'kyc_verified', passed: true });
  }

  // Check 4: Sanctions screening
  if (policy.compliance.sanctionsCheck) {
    const sanctionsResult = await checkSanctions(request.recipientId);
    if (sanctionsResult.flagged) {
      validation.checks.push({
        name: 'sanctions_screen',
        passed: false,
        reason: 'Sanctions screening flagged'
      });
      validation.passed = false;
      validation.flags.push({
        type: 'sanctions',
        severity: 'critical',
        details: sanctionsResult.reason
      });
    } else {
      validation.checks.push({ name: 'sanctions_screen', passed: true });
    }
  }

  // Check 5: Velocity limits
  const velocityCheck = await checkVelocity(request.recipientId, policy.compliance.velocityLimits);
  if (!velocityCheck.passed) {
    validation.checks.push({
      name: 'velocity_limit',
      passed: false,
      reason: velocityCheck.reason
    });
    validation.flags.push({
      type: 'velocity',
      severity: 'warning',
      details: velocityCheck.reason
    });
  } else {
    validation.checks.push({ name: 'velocity_limit', passed: true });
  }

  // Check 6: Risk level approval
  const riskLevel = await assessRiskLevel(request);
  const riskPolicy = policy.riskLevels[riskLevel];

  if (request.amount > riskPolicy.maxSingleTransaction) {
    validation.requiresApproval = true;
    validation.approver = 'A3';
  }
  if (!riskPolicy.autoApprove) {
    validation.requiresApproval = true;
  }
  if (riskPolicy.manualReview) {
    validation.flags.push({
      type: 'manual_review',
      severity: 'info',
      details: 'High risk transaction requires manual review'
    });
  }

  validation.riskLevel = riskLevel;

  return validation;
}

async function getDailyTotal(recipientId) {
  // Would query payment records
  return 0;
}

async function getKYCStatus(recipientId) {
  return { verified: true, level: 'full' };
}

async function checkSanctions(recipientId) {
  return { flagged: false };
}

async function checkVelocity(recipientId, limits) {
  return { passed: true };
}

async function assessRiskLevel(request) {
  if (request.amount > 5000) return 'high';
  if (request.amount > 1000) return 'medium';
  return 'low';
}
```

---

## Level 3: Audit Functions

### auditPayments()
```javascript
/**
 * Audit payment records
 */
async function auditPayments(criteria) {
  const { from, to, type, minAmount } = criteria;

  const audit = {
    id: `AUDIT-PAY-${Date.now()}`,
    criteria,
    startedAt: new Date().toISOString(),
    findings: [],
    summary: {
      totalTransactions: 0,
      totalAmount: 0,
      flaggedCount: 0,
      complianceScore: 100
    }
  };

  // Get payments in range
  const payments = await getPaymentsInRange(from, to, type);

  for (const payment of payments) {
    audit.summary.totalTransactions++;
    audit.summary.totalAmount += payment.amount;

    // Check for issues
    const issues = await checkPaymentIssues(payment);

    if (issues.length > 0) {
      audit.summary.flaggedCount++;
      audit.findings.push({
        paymentId: payment.id,
        amount: payment.amount,
        date: payment.date,
        issues
      });
    }
  }

  // Calculate compliance score
  if (audit.summary.totalTransactions > 0) {
    const compliant = audit.summary.totalTransactions - audit.summary.flaggedCount;
    audit.summary.complianceScore = Math.round((compliant / audit.summary.totalTransactions) * 100);
  }

  audit.completedAt = new Date().toISOString();

  return audit;
}

async function getPaymentsInRange(from, to, type) {
  // Would query payment database
  return [];
}

async function checkPaymentIssues(payment) {
  const issues = [];

  // Check for missing documentation
  if (!payment.receiptGenerated) {
    issues.push({ type: 'missing_receipt', severity: 'medium' });
  }

  // Check for unusual patterns
  if (payment.amount > 5000 && !payment.approvalId) {
    issues.push({ type: 'missing_approval', severity: 'high' });
  }

  // Check 1099 tracking
  if (payment.recipientYTD >= 600 && !payment.form1099Flagged) {
    issues.push({ type: '1099_not_flagged', severity: 'high' });
  }

  return issues;
}
```

### generateComplianceReport()
```javascript
/**
 * Generate compliance report
 */
function generateComplianceReport(audit) {
  return `# Payments Compliance Report

**Audit ID**: ${audit.id}
**Period**: ${audit.criteria.from} to ${audit.criteria.to}
**Generated**: ${audit.completedAt}

---

## Summary

| Metric | Value |
|--------|-------|
| Total Transactions | ${audit.summary.totalTransactions} |
| Total Amount | $${audit.summary.totalAmount.toLocaleString()} |
| Flagged Transactions | ${audit.summary.flaggedCount} |
| Compliance Score | ${audit.summary.complianceScore}% |

## Compliance Status

${audit.summary.complianceScore >= 95 ? '**COMPLIANT**' : audit.summary.complianceScore >= 80 ? '**NEEDS ATTENTION**' : '**NON-COMPLIANT**'}

## Findings

${audit.findings.length === 0 ? 'No issues found.' : audit.findings.map(f => `
### Payment ${f.paymentId}
- Amount: $${f.amount}
- Date: ${f.date}
- Issues:
${f.issues.map(i => `  - [${i.severity.toUpperCase()}] ${i.type}`).join('\n')}
`).join('\n')}

## Required Actions

${audit.summary.flaggedCount > 0 ? `
1. Review all flagged transactions
2. Generate missing receipts
3. Obtain missing approvals
4. Update 1099 tracking
` : 'No actions required'}

---

## Attestation

- [ ] Report reviewed by CFO Agent (A3)
- [ ] Issues addressed within 30 days
- [ ] Records retained per policy

---

*Generated by payments-compliance-ops skill*
`;
}
```

---

## Level 4: 1099 Management

### process1099()
```javascript
/**
 * Process 1099 reporting
 */
async function process1099(taxYear) {
  const threshold = 600;

  const report = {
    taxYear,
    processedAt: new Date().toISOString(),
    recipients: [],
    summary: {
      totalRecipients: 0,
      totalAmount: 0,
      above600: 0,
      formsSent: 0
    }
  };

  // Get all recipients with earnings
  const recipients = await getRecipientsWithEarnings(taxYear);

  for (const recipient of recipients) {
    report.recipients.push({
      id: recipient.id,
      name: recipient.name,
      ssn: recipient.ssnMasked,
      totalEarnings: recipient.totalEarnings,
      requires1099: recipient.totalEarnings >= threshold,
      form1099Sent: false
    });

    report.summary.totalRecipients++;
    report.summary.totalAmount += recipient.totalEarnings;

    if (recipient.totalEarnings >= threshold) {
      report.summary.above600++;
    }
  }

  return report;
}

async function getRecipientsWithEarnings(taxYear) {
  // Would query payment records grouped by recipient
  return [];
}
```

---

## MCP Tool Interface

```javascript
const paymentsComplianceTool = {
  name: 'payments_compliance',
  description: 'Enforce payment policies, audit transactions, manage compliance',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['policy', 'check', 'audit', 'validate', 'report', 'flags', '1099'],
        description: 'Compliance operation to perform'
      },
      paymentId: {
        type: 'string',
        description: 'Payment ID for validation'
      },
      period: {
        type: 'object',
        properties: {
          from: { type: 'string' },
          to: { type: 'string' }
        }
      }
    },
    required: ['action']
  }
};
```

---

## Usage Examples

```bash
# View payment policy
payments-compliance policy

# Validate a payment
payments-compliance validate --payment PAY-001

# Audit payments for period
payments-compliance audit --from 2026-01-01 --to 2026-01-31

# Generate compliance report
payments-compliance report --period monthly

# View active flags
payments-compliance flags

# Process 1099s
payments-compliance 1099 --year 2025
```

---

## Success Criteria

- 100% payment policy adherence
- Zero regulatory violations
- All 1099s filed on time
- Audit trail complete for all transactions
- Compliance score > 95%
