---
name: judge-spec-ops
description: Judge specification operations - define pass/fail criteria, render gate verdicts, acceptance authority
version: 1.0.0
level: 3
owner: A2
skillId: S7
triggers:
  - judge
  - verdict
  - gate check
  - acceptance
  - pass fail
  - quality gate
---

# judge-spec-ops Skill

Define pass/fail criteria. Render gate verdicts. Acceptance authority for deployments. Owned by QA Gatekeeper (A2).

## Quick Commands

| Command | Action |
|---------|--------|
| `criteria` | Define acceptance criteria |
| `verdict` | Render pass/fail verdict |
| `gate` | Run quality gate check |
| `accept` | Accept deliverable |
| `reject` | Reject with reasons |
| `report` | Generate gate report |

---

## Level 1: Criteria Definition

### defineCriteria()
```javascript
/**
 * Define acceptance criteria for a deliverable
 */
function defineCriteria(config) {
  const {
    ticketId,
    type,
    requirements,
    riskLevel = 'medium'
  } = config;

  const criteria = {
    id: `AC-${ticketId}`,
    ticketId,
    type,
    createdAt: new Date().toISOString(),
    mandatory: [],
    optional: [],
    thresholds: {}
  };

  // Standard mandatory criteria by type
  const mandatoryByType = {
    feature: [
      { id: 'M01', name: 'All requirements implemented', weight: 1.0 },
      { id: 'M02', name: 'Unit tests passing', weight: 1.0 },
      { id: 'M03', name: 'No P0/P1 bugs', weight: 1.0 },
      { id: 'M04', name: 'Code review approved', weight: 1.0 },
      { id: 'M05', name: 'Documentation updated', weight: 0.8 }
    ],
    bug: [
      { id: 'M01', name: 'Bug verified fixed', weight: 1.0 },
      { id: 'M02', name: 'Regression test added', weight: 1.0 },
      { id: 'M03', name: 'No new bugs introduced', weight: 1.0 }
    ],
    deploy: [
      { id: 'M01', name: 'All tests passing', weight: 1.0 },
      { id: 'M02', name: 'Security scan clear', weight: 1.0 },
      { id: 'M03', name: 'Performance within SLA', weight: 1.0 },
      { id: 'M04', name: 'Rollback plan documented', weight: 0.9 },
      { id: 'M05', name: 'Stakeholder sign-off', weight: 0.8 }
    ]
  };

  criteria.mandatory = mandatoryByType[type] || mandatoryByType.feature;

  // Thresholds by risk level
  const thresholdsByRisk = {
    high: {
      testPassRate: 100,
      codeCoverage: 80,
      maxP2Bugs: 0,
      maxP3Bugs: 2
    },
    medium: {
      testPassRate: 95,
      codeCoverage: 70,
      maxP2Bugs: 2,
      maxP3Bugs: 5
    },
    low: {
      testPassRate: 90,
      codeCoverage: 60,
      maxP2Bugs: 5,
      maxP3Bugs: 10
    }
  };

  criteria.thresholds = thresholdsByRisk[riskLevel];

  // Add requirement-specific criteria
  for (const req of requirements || []) {
    criteria.mandatory.push({
      id: `REQ-${req.id}`,
      name: `Requirement ${req.id}: ${req.title}`,
      weight: req.priority === 'high' ? 1.0 : 0.8
    });
  }

  return criteria;
}
```

---

## Level 2: Verdict Rendering

### renderVerdict()
```javascript
/**
 * Render pass/fail verdict based on criteria evaluation
 */
function renderVerdict(criteria, evidence) {
  const verdict = {
    criteriaId: criteria.id,
    ticketId: criteria.ticketId,
    timestamp: new Date().toISOString(),
    evaluations: [],
    summary: {
      passed: 0,
      failed: 0,
      skipped: 0,
      score: 0
    },
    verdict: 'pending',
    reasons: []
  };

  let totalWeight = 0;
  let earnedWeight = 0;

  // Evaluate mandatory criteria
  for (const criterion of criteria.mandatory) {
    const evaluation = evaluateCriterion(criterion, evidence);
    verdict.evaluations.push(evaluation);

    totalWeight += criterion.weight;

    if (evaluation.passed) {
      verdict.summary.passed++;
      earnedWeight += criterion.weight;
    } else if (evaluation.skipped) {
      verdict.summary.skipped++;
    } else {
      verdict.summary.failed++;
      verdict.reasons.push({
        criterion: criterion.name,
        reason: evaluation.reason
      });
    }
  }

  // Calculate score
  verdict.summary.score = Math.round((earnedWeight / totalWeight) * 100);

  // Check thresholds
  const thresholdFailures = checkThresholds(criteria.thresholds, evidence);
  for (const failure of thresholdFailures) {
    verdict.reasons.push(failure);
  }

  // Determine final verdict
  const hasBlockingFailure = verdict.evaluations.some(e =>
    !e.passed && !e.skipped && e.criterion?.weight === 1.0
  );

  if (hasBlockingFailure || thresholdFailures.length > 0) {
    verdict.verdict = 'FAIL';
  } else if (verdict.summary.score >= 90) {
    verdict.verdict = 'PASS';
  } else if (verdict.summary.score >= 70) {
    verdict.verdict = 'CONDITIONAL_PASS';
    verdict.conditions = verdict.reasons.filter(r => r.severity !== 'blocking');
  } else {
    verdict.verdict = 'FAIL';
  }

  return verdict;
}

function evaluateCriterion(criterion, evidence) {
  const evaluation = {
    criterion,
    passed: false,
    skipped: false,
    reason: null,
    evidence: null
  };

  // Look for matching evidence
  const evidenceKey = criterion.id.toLowerCase().replace(/-/g, '_');
  const relevantEvidence = evidence[evidenceKey] || evidence[criterion.name];

  if (relevantEvidence === undefined) {
    evaluation.skipped = true;
    evaluation.reason = 'No evidence provided';
    return evaluation;
  }

  // Evaluate based on evidence type
  if (typeof relevantEvidence === 'boolean') {
    evaluation.passed = relevantEvidence;
    evaluation.evidence = relevantEvidence ? 'Confirmed' : 'Not confirmed';
    if (!relevantEvidence) {
      evaluation.reason = `${criterion.name} not met`;
    }
  } else if (typeof relevantEvidence === 'number') {
    evaluation.passed = relevantEvidence >= (criterion.threshold || 0);
    evaluation.evidence = relevantEvidence;
    if (!evaluation.passed) {
      evaluation.reason = `${criterion.name}: ${relevantEvidence} below threshold`;
    }
  } else if (typeof relevantEvidence === 'object') {
    evaluation.passed = relevantEvidence.status === 'pass' || relevantEvidence.passed === true;
    evaluation.evidence = relevantEvidence;
    if (!evaluation.passed) {
      evaluation.reason = relevantEvidence.reason || `${criterion.name} failed`;
    }
  }

  return evaluation;
}

function checkThresholds(thresholds, evidence) {
  const failures = [];

  if (evidence.testPassRate !== undefined && evidence.testPassRate < thresholds.testPassRate) {
    failures.push({
      criterion: 'Test Pass Rate',
      reason: `${evidence.testPassRate}% < required ${thresholds.testPassRate}%`,
      severity: 'blocking'
    });
  }

  if (evidence.codeCoverage !== undefined && evidence.codeCoverage < thresholds.codeCoverage) {
    failures.push({
      criterion: 'Code Coverage',
      reason: `${evidence.codeCoverage}% < required ${thresholds.codeCoverage}%`,
      severity: 'warning'
    });
  }

  if (evidence.p2BugCount !== undefined && evidence.p2BugCount > thresholds.maxP2Bugs) {
    failures.push({
      criterion: 'P2 Bug Count',
      reason: `${evidence.p2BugCount} > max allowed ${thresholds.maxP2Bugs}`,
      severity: 'blocking'
    });
  }

  return failures;
}
```

---

## Level 3: Gate Execution

### runQualityGate()
```javascript
/**
 * Run full quality gate
 */
async function runQualityGate(config) {
  const { ticketId, type, environment = 'staging' } = config;

  const gate = {
    id: `GATE-${ticketId}-${Date.now()}`,
    ticketId,
    type,
    environment,
    startedAt: new Date().toISOString(),
    checks: [],
    status: 'running'
  };

  // Define gate checks
  const checks = [
    { name: 'lint', command: 'npm run lint', blocking: true },
    { name: 'typecheck', command: 'npm run typecheck', blocking: true },
    { name: 'unit-tests', command: 'npm test', blocking: true },
    { name: 'build', command: 'npm run build', blocking: true },
    { name: 'security-scan', command: 'npm audit --audit-level=high', blocking: false }
  ];

  // Execute checks
  for (const check of checks) {
    const result = await executeCheck(check);
    gate.checks.push(result);

    // Stop on blocking failure
    if (!result.passed && check.blocking) {
      gate.status = 'failed';
      gate.failedAt = check.name;
      break;
    }
  }

  // Determine final status
  if (gate.status !== 'failed') {
    const allPassed = gate.checks.every(c => c.passed);
    const blockingPassed = gate.checks
      .filter(c => c.blocking)
      .every(c => c.passed);

    gate.status = allPassed ? 'passed' : (blockingPassed ? 'passed_with_warnings' : 'failed');
  }

  gate.completedAt = new Date().toISOString();
  gate.duration = new Date(gate.completedAt) - new Date(gate.startedAt);

  return gate;
}

async function executeCheck(check) {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  const result = {
    name: check.name,
    command: check.command,
    blocking: check.blocking,
    startedAt: new Date().toISOString(),
    passed: false,
    output: null,
    error: null
  };

  try {
    const { stdout, stderr } = await execAsync(check.command, {
      timeout: 300000 // 5 minute timeout
    });
    result.passed = true;
    result.output = stdout.substring(0, 1000); // Truncate
  } catch (err) {
    result.passed = false;
    result.error = err.message;
    result.output = err.stdout?.substring(0, 1000);
  }

  result.completedAt = new Date().toISOString();
  result.duration = new Date(result.completedAt) - new Date(result.startedAt);

  return result;
}
```

---

## Level 4: Acceptance Actions

### accept()
```javascript
/**
 * Accept a deliverable
 */
async function accept(config) {
  const { ticketId, verdict, approver = 'A2', comments } = config;

  if (verdict.verdict === 'FAIL') {
    throw new Error('Cannot accept a failed verdict. Use reject() or override().');
  }

  const acceptance = {
    id: `ACC-${ticketId}-${Date.now()}`,
    ticketId,
    verdictId: verdict.criteriaId,
    status: 'accepted',
    approver,
    timestamp: new Date().toISOString(),
    comments,
    conditions: verdict.conditions || [],
    score: verdict.summary.score
  };

  // Generate acceptance receipt
  const receipt = generateAcceptanceReceipt(acceptance, verdict);

  // Store acceptance
  await storeAcceptance(acceptance, receipt);

  return {
    status: 'accepted',
    acceptance,
    receiptPath: receipt.path
  };
}

/**
 * Reject a deliverable
 */
async function reject(config) {
  const { ticketId, verdict, approver = 'A2', reasons, actionRequired } = config;

  const rejection = {
    id: `REJ-${ticketId}-${Date.now()}`,
    ticketId,
    verdictId: verdict.criteriaId,
    status: 'rejected',
    approver,
    timestamp: new Date().toISOString(),
    reasons: reasons || verdict.reasons,
    actionRequired,
    blockers: verdict.evaluations.filter(e => !e.passed && e.criterion?.weight === 1.0)
  };

  // Generate rejection receipt
  const receipt = generateRejectionReceipt(rejection, verdict);

  // Store rejection
  await storeRejection(rejection, receipt);

  return {
    status: 'rejected',
    rejection,
    receiptPath: receipt.path,
    requiredActions: actionRequired
  };
}

function generateAcceptanceReceipt(acceptance, verdict) {
  const content = `# Acceptance Receipt

**ID**: ${acceptance.id}
**Ticket**: ${acceptance.ticketId}
**Status**: ACCEPTED
**Timestamp**: ${acceptance.timestamp}
**Approver**: ${acceptance.approver}

---

## Verdict Summary

| Metric | Value |
|--------|-------|
| Score | ${acceptance.score}% |
| Passed Criteria | ${verdict.summary.passed} |
| Failed Criteria | ${verdict.summary.failed} |
| Verdict | ${verdict.verdict} |

## Conditions

${acceptance.conditions.length > 0
  ? acceptance.conditions.map(c => `- ${c.criterion}: ${c.reason}`).join('\n')
  : 'No conditions'}

## Comments

${acceptance.comments || 'No comments'}

---

*Approved by QA Gatekeeper (A2)*
`;

  return { content, path: `ACCEPT-${acceptance.id}.md` };
}

function generateRejectionReceipt(rejection, verdict) {
  const content = `# Rejection Receipt

**ID**: ${rejection.id}
**Ticket**: ${rejection.ticketId}
**Status**: REJECTED
**Timestamp**: ${rejection.timestamp}
**Approver**: ${rejection.approver}

---

## Rejection Reasons

${rejection.reasons.map(r => `- **${r.criterion}**: ${r.reason}`).join('\n')}

## Blockers

${rejection.blockers.map(b => `- ${b.criterion.name}: ${b.reason}`).join('\n') || 'None identified'}

## Required Actions

${rejection.actionRequired || 'Address all rejection reasons and resubmit'}

---

*Rejected by QA Gatekeeper (A2)*
`;

  return { content, path: `REJECT-${rejection.id}.md` };
}
```

---

## MCP Tool Interface

```javascript
const judgeSpecTool = {
  name: 'judge_spec',
  description: 'Define criteria, render verdicts, accept/reject deliverables',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['criteria', 'verdict', 'gate', 'accept', 'reject', 'report'],
        description: 'Judge operation to perform'
      },
      ticketId: {
        type: 'string',
        description: 'Ticket ID'
      },
      type: {
        type: 'string',
        enum: ['feature', 'bug', 'deploy'],
        description: 'Deliverable type'
      },
      evidence: {
        type: 'object',
        description: 'Evidence for verdict evaluation'
      }
    },
    required: ['action']
  }
};
```

---

## Usage Examples

```bash
# Define acceptance criteria
judge-spec criteria --ticket FEAT-001 --type feature --risk high

# Render verdict
judge-spec verdict --ticket FEAT-001 --evidence evidence.json

# Run quality gate
judge-spec gate --ticket FEAT-001 --env staging

# Accept deliverable
judge-spec accept --ticket FEAT-001 --comments "Looks good"

# Reject deliverable
judge-spec reject --ticket FEAT-001 --reasons "P1 bug found" --action "Fix bug BUG-123"
```

---

## Success Criteria

- All deployments pass quality gate
- Zero P0/P1 bugs escape to production
- Gate execution < 10 minutes
- 100% traceability on accept/reject decisions
- Clear, actionable rejection reasons
