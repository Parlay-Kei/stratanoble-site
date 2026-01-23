---
name: qa-gatekeeper-ops
description: QA Gatekeeper operations skill for testing, quality gates, proof validation, and acceptance checking. Core operational capability for QA Gatekeeper agent.
version: 1.0.0
level: 3
triggers:
  - run tests
  - quality gate
  - validate proof
  - acceptance check
  - test suite
  - lint check
  - type check
---

# qa-gatekeeper-ops Skill

Quality assurance operations for testing, validation, and acceptance. Enables QA Gatekeeper to enforce quality standards and gate deployments.

## Quick Commands

| Command | Action |
|---------|--------|
| `test` | Run test suite |
| `lint` | Run linting checks |
| `types` | Run TypeScript type check |
| `gate` | Run full quality gate |
| `proof` | Validate proof pack |
| `accept` | Run acceptance criteria check |
| `report` | Generate QA report |

---

## Level 1: Basic Checks

### runTests()
```bash
#!/bin/bash
# Run test suite
run_tests() {
  local scope="${1:-all}"

  case "$scope" in
    unit)
      npm run test:unit
      ;;
    integration)
      npm run test:integration
      ;;
    e2e)
      npm run test:e2e
      ;;
    all)
      npm test
      ;;
  esac

  return $?
}
```

### runLint()
```bash
#!/bin/bash
# Run linting
run_lint() {
  npm run lint

  if [ $? -eq 0 ]; then
    echo "LINT: PASS"
    return 0
  else
    echo "LINT: FAIL"
    return 1
  fi
}
```

### runTypeCheck()
```bash
#!/bin/bash
# Run TypeScript type check
run_typecheck() {
  npx tsc --noEmit

  if [ $? -eq 0 ]; then
    echo "TYPES: PASS"
    return 0
  else
    echo "TYPES: FAIL"
    return 1
  fi
}
```

---

## Level 2: Quality Gates

### runQualityGate()
```javascript
/**
 * Run full quality gate - all checks must pass
 */
async function runQualityGate(options = {}) {
  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    passed: true
  };

  // 1. Lint check
  const lint = await runCheck('lint', 'npm run lint');
  results.checks.push(lint);
  if (!lint.passed) results.passed = false;

  // 2. Type check
  const types = await runCheck('types', 'npx tsc --noEmit');
  results.checks.push(types);
  if (!types.passed) results.passed = false;

  // 3. Unit tests
  const unit = await runCheck('unit-tests', 'npm run test:unit');
  results.checks.push(unit);
  if (!unit.passed) results.passed = false;

  // 4. Build check
  const build = await runCheck('build', 'npm run build');
  results.checks.push(build);
  if (!build.passed) results.passed = false;

  // 5. Security audit (warning only)
  const security = await runCheck('security', 'npm audit --audit-level=high');
  security.blocking = false;
  results.checks.push(security);

  return results;
}

async function runCheck(name, command) {
  const start = Date.now();
  try {
    const { exec } = require('child_process');
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) reject({ stdout, stderr });
        else resolve({ stdout, stderr });
      });
    });

    return {
      name,
      passed: true,
      duration: Date.now() - start,
      blocking: true
    };
  } catch (error) {
    return {
      name,
      passed: false,
      duration: Date.now() - start,
      error: error.stderr || error.message,
      blocking: true
    };
  }
}
```

---

## Level 3: Proof Validation

### validateProofPack()
```javascript
/**
 * Validate a proof pack against requirements
 */
async function validateProofPack(proofPackPath) {
  const fs = require('fs').promises;
  const content = await fs.readFile(proofPackPath, 'utf-8');

  const validation = {
    path: proofPackPath,
    valid: true,
    errors: [],
    warnings: []
  };

  // Required sections
  const requiredSections = [
    'Ticket Reference',
    'Summary',
    'Acceptance Criteria',
    'Evidence',
    'Verification'
  ];

  for (const section of requiredSections) {
    if (!content.includes(`## ${section}`) && !content.includes(`# ${section}`)) {
      validation.errors.push(`Missing required section: ${section}`);
      validation.valid = false;
    }
  }

  // Must have at least one evidence item
  if (!content.includes('- [') && !content.includes('- ✅')) {
    validation.warnings.push('No evidence items found');
  }

  // Must have ticket ID
  const ticketRegex = /OCS-[A-Z]+-\d{4}/;
  if (!ticketRegex.test(content)) {
    validation.errors.push('No valid ticket ID found');
    validation.valid = false;
  }

  // Must have timestamp
  const dateRegex = /\d{4}-\d{2}-\d{2}/;
  if (!dateRegex.test(content)) {
    validation.warnings.push('No date/timestamp found');
  }

  return validation;
}
```

### validateAcceptanceCriteria()
```javascript
/**
 * Check if acceptance criteria are met
 */
async function validateAcceptanceCriteria(ticketPath, proofPath) {
  const fs = require('fs').promises;

  const ticket = await fs.readFile(ticketPath, 'utf-8');
  const proof = await fs.readFile(proofPath, 'utf-8');

  // Extract acceptance criteria from ticket
  const acMatch = ticket.match(/## Acceptance Criteria\n([\s\S]*?)(?=\n##|$)/);
  if (!acMatch) {
    return {
      valid: false,
      error: 'No acceptance criteria found in ticket'
    };
  }

  const criteria = acMatch[1]
    .split('\n')
    .filter(line => line.trim().startsWith('- '))
    .map(line => line.replace(/^- \[.\] /, '').trim());

  // Check each criterion against proof
  const results = criteria.map(criterion => {
    // Simple keyword matching (could be enhanced with AI)
    const keywords = criterion.split(' ').filter(w => w.length > 4);
    const found = keywords.some(kw =>
      proof.toLowerCase().includes(kw.toLowerCase())
    );

    return {
      criterion,
      verified: found,
      confidence: found ? 'medium' : 'low'
    };
  });

  const allMet = results.every(r => r.verified);

  return {
    valid: allMet,
    criteria: results,
    summary: `${results.filter(r => r.verified).length}/${results.length} criteria verified`
  };
}
```

---

## Level 4: Reporting

### generateQAReport()
```javascript
/**
 * Generate comprehensive QA report
 */
async function generateQAReport(options = {}) {
  const gate = await runQualityGate();
  const timestamp = new Date().toISOString();

  const report = `# QA Report

**Generated**: ${timestamp}
**Status**: ${gate.passed ? 'PASS' : 'FAIL'}

## Quality Gate Results

| Check | Status | Duration |
|-------|--------|----------|
${gate.checks.map(c =>
  `| ${c.name} | ${c.passed ? '✅ PASS' : '❌ FAIL'} | ${c.duration}ms |`
).join('\n')}

## Summary

- Total Checks: ${gate.checks.length}
- Passed: ${gate.checks.filter(c => c.passed).length}
- Failed: ${gate.checks.filter(c => !c.passed).length}

${gate.passed ? '## ✅ Ready for Deployment' : '## ❌ Not Ready - Fix Issues Above'}

## Errors

${gate.checks.filter(c => !c.passed).map(c => `
### ${c.name}
\`\`\`
${c.error || 'No error details'}
\`\`\`
`).join('\n') || 'None'}

---
*QA Gatekeeper - Automated Quality Report*
`;

  return {
    report,
    passed: gate.passed,
    gate
  };
}
```

---

## MCP Tool Interface

```javascript
// MCP tool definition for qa-gatekeeper-ops
const qaGatekeeperTool = {
  name: 'qa_gatekeeper',
  description: 'Run tests, quality gates, and validate proofs',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['test', 'lint', 'types', 'gate', 'proof', 'accept', 'report'],
        description: 'QA operation to perform'
      },
      scope: {
        type: 'string',
        enum: ['unit', 'integration', 'e2e', 'all'],
        description: 'Test scope (for test action)'
      },
      proofPath: {
        type: 'string',
        description: 'Path to proof pack (for proof/accept actions)'
      },
      ticketPath: {
        type: 'string',
        description: 'Path to ticket (for accept action)'
      }
    },
    required: ['action']
  }
};
```

---

## Usage Examples

```bash
# Run all tests
qa-gatekeeper-ops test

# Run unit tests only
qa-gatekeeper-ops test unit

# Run lint check
qa-gatekeeper-ops lint

# Run type check
qa-gatekeeper-ops types

# Run full quality gate
qa-gatekeeper-ops gate

# Validate proof pack
qa-gatekeeper-ops proof ./proofs/OCS-DC-0001_proof_pack.md

# Check acceptance criteria
qa-gatekeeper-ops accept --ticket ./tickets/OCS-DC-0001.md --proof ./proofs/OCS-DC-0001_proof_pack.md

# Generate QA report
qa-gatekeeper-ops report
```

---

## Gate Verdicts

| Verdict | Meaning | Action |
|---------|---------|--------|
| PASS | All checks passed | Proceed to deploy |
| FAIL | Blocking check failed | Fix before deploy |
| WARN | Non-blocking issue | Deploy with caution |
| SKIP | Check skipped | Manual review needed |

---

## Success Criteria

- All blocking checks pass before deployment
- Proof packs contain required sections
- Acceptance criteria are verifiable
- Reports are generated within 60 seconds
- Zero false negatives (missed issues)
