---
name: test-spec-ops
description: Test specification operations - create test plans, define regression requirements, manage test coverage
version: 1.0.0
level: 3
owner: A2
skillId: S6
triggers:
  - test spec
  - test plan
  - test cases
  - regression
  - coverage
  - qa plan
---

# test-spec-ops Skill

Create test specifications and plans. Define regression requirements. Track test coverage. Owned by QA Gatekeeper (A2).

## Quick Commands

| Command | Action |
|---------|--------|
| `spec` | Generate test spec from requirements |
| `plan` | Create test plan |
| `cases` | List test cases |
| `coverage` | Check coverage status |
| `regression` | Define regression suite |
| `matrix` | Generate test matrix |

---

## Level 1: Test Case Generation

### generateTestSpec()
```javascript
/**
 * Generate test specification from requirements
 */
function generateTestSpec(requirements) {
  const testCases = [];

  for (const req of requirements) {
    // Generate positive test cases
    testCases.push({
      id: `TC-${req.id}-POS-01`,
      requirement: req.id,
      type: 'positive',
      title: `Verify ${req.title} works correctly`,
      preconditions: req.preconditions || [],
      steps: generateStepsFromRequirement(req, 'positive'),
      expectedResult: req.expectedBehavior,
      priority: req.priority || 'medium'
    });

    // Generate negative test cases
    testCases.push({
      id: `TC-${req.id}-NEG-01`,
      requirement: req.id,
      type: 'negative',
      title: `Verify ${req.title} handles invalid input`,
      preconditions: req.preconditions || [],
      steps: generateStepsFromRequirement(req, 'negative'),
      expectedResult: 'Appropriate error handling',
      priority: req.priority || 'medium'
    });

    // Generate boundary test cases
    if (req.hasBoundaries) {
      testCases.push({
        id: `TC-${req.id}-BND-01`,
        requirement: req.id,
        type: 'boundary',
        title: `Verify ${req.title} boundary conditions`,
        preconditions: req.preconditions || [],
        steps: generateStepsFromRequirement(req, 'boundary'),
        expectedResult: 'Correct boundary handling',
        priority: 'high'
      });
    }
  }

  return {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    requirementCount: requirements.length,
    testCaseCount: testCases.length,
    testCases
  };
}

function generateStepsFromRequirement(req, type) {
  const baseSteps = [
    'Navigate to the relevant screen/endpoint',
    'Ensure preconditions are met'
  ];

  switch (type) {
    case 'positive':
      return [
        ...baseSteps,
        `Enter valid data for ${req.title}`,
        'Execute the action',
        'Verify expected outcome'
      ];
    case 'negative':
      return [
        ...baseSteps,
        `Enter invalid/malformed data for ${req.title}`,
        'Execute the action',
        'Verify error handling'
      ];
    case 'boundary':
      return [
        ...baseSteps,
        `Enter minimum boundary value`,
        'Verify handling',
        `Enter maximum boundary value`,
        'Verify handling',
        `Enter value just outside boundary`,
        'Verify rejection'
      ];
    default:
      return baseSteps;
  }
}
```

---

## Level 2: Test Plan Creation

### createTestPlan()
```javascript
/**
 * Create comprehensive test plan
 */
function createTestPlan(config) {
  const {
    ticketId,
    title,
    scope,
    requirements,
    riskLevel = 'medium'
  } = config;

  const testSpec = generateTestSpec(requirements);

  const plan = {
    id: `TP-${ticketId}`,
    title,
    ticketId,
    createdAt: new Date().toISOString(),
    status: 'draft',

    scope: {
      inScope: scope.inScope || [],
      outOfScope: scope.outOfScope || [],
      assumptions: scope.assumptions || []
    },

    strategy: {
      approach: determineApproach(riskLevel),
      types: determineTestTypes(requirements),
      environments: ['local', 'staging', 'production'],
      automationTarget: calculateAutomationTarget(requirements)
    },

    resources: {
      estimatedHours: estimateTestingHours(testSpec.testCaseCount, riskLevel),
      requiredEnvironments: ['staging'],
      testData: identifyTestDataNeeds(requirements)
    },

    schedule: {
      phases: [
        { name: 'Test Design', durationDays: 1 },
        { name: 'Test Execution', durationDays: 2 },
        { name: 'Bug Fixes', durationDays: 1 },
        { name: 'Regression', durationDays: 1 }
      ]
    },

    criteria: {
      entry: [
        'Code complete',
        'Unit tests passing',
        'Build successful',
        'Test environment available'
      ],
      exit: [
        'All P0/P1 bugs fixed',
        'Test pass rate > 95%',
        'No critical regression',
        'Performance within SLA'
      ]
    },

    testCases: testSpec.testCases,
    metrics: {
      totalCases: testSpec.testCaseCount,
      byPriority: countByPriority(testSpec.testCases),
      byType: countByType(testSpec.testCases)
    }
  };

  return plan;
}

function determineApproach(riskLevel) {
  switch (riskLevel) {
    case 'high':
      return 'Full regression + exploratory testing + performance testing';
    case 'medium':
      return 'Targeted regression + functional testing';
    case 'low':
      return 'Smoke testing + critical path verification';
    default:
      return 'Standard functional testing';
  }
}

function determineTestTypes(requirements) {
  const types = ['functional', 'regression'];

  const hasUI = requirements.some(r => r.type === 'ui' || r.title?.includes('UI'));
  const hasAPI = requirements.some(r => r.type === 'api' || r.title?.includes('API'));
  const hasSecurity = requirements.some(r => r.title?.toLowerCase().includes('auth') || r.title?.toLowerCase().includes('security'));
  const hasPerformance = requirements.some(r => r.title?.toLowerCase().includes('performance') || r.title?.toLowerCase().includes('load'));

  if (hasUI) types.push('ui', 'accessibility');
  if (hasAPI) types.push('api', 'contract');
  if (hasSecurity) types.push('security');
  if (hasPerformance) types.push('performance', 'load');

  return types;
}

function calculateAutomationTarget(requirements) {
  // Higher automation for stable, well-defined requirements
  const stable = requirements.filter(r => r.stability === 'stable').length;
  return Math.round((stable / requirements.length) * 100);
}

function estimateTestingHours(caseCount, riskLevel) {
  const hoursPerCase = { high: 0.5, medium: 0.3, low: 0.2 };
  return Math.ceil(caseCount * hoursPerCase[riskLevel]);
}

function identifyTestDataNeeds(requirements) {
  const needs = [];
  for (const req of requirements) {
    if (req.title?.toLowerCase().includes('user')) needs.push('Test user accounts');
    if (req.title?.toLowerCase().includes('payment')) needs.push('Test payment methods');
    if (req.title?.toLowerCase().includes('booking')) needs.push('Test booking data');
  }
  return [...new Set(needs)];
}

function countByPriority(cases) {
  return cases.reduce((acc, c) => {
    acc[c.priority] = (acc[c.priority] || 0) + 1;
    return acc;
  }, {});
}

function countByType(cases) {
  return cases.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});
}
```

---

## Level 3: Coverage Analysis

### analyzeCoverage()
```javascript
/**
 * Analyze test coverage
 */
function analyzeCoverage(testPlan, executionResults) {
  const coverage = {
    requirements: {
      total: 0,
      covered: 0,
      percentage: 0
    },
    testCases: {
      total: testPlan.testCases.length,
      executed: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0
    },
    byType: {},
    gaps: []
  };

  // Count requirement coverage
  const coveredReqs = new Set();
  for (const tc of testPlan.testCases) {
    coveredReqs.add(tc.requirement);
  }
  coverage.requirements.total = new Set(testPlan.testCases.map(tc => tc.requirement)).size;
  coverage.requirements.covered = coveredReqs.size;
  coverage.requirements.percentage = Math.round((coveredReqs.size / coverage.requirements.total) * 100);

  // Analyze execution results
  for (const result of executionResults) {
    coverage.testCases.executed++;
    switch (result.status) {
      case 'passed': coverage.testCases.passed++; break;
      case 'failed': coverage.testCases.failed++; break;
      case 'blocked': coverage.testCases.blocked++; break;
      case 'skipped': coverage.testCases.skipped++; break;
    }

    // Track by type
    const tc = testPlan.testCases.find(t => t.id === result.testCaseId);
    if (tc) {
      if (!coverage.byType[tc.type]) {
        coverage.byType[tc.type] = { total: 0, passed: 0, failed: 0 };
      }
      coverage.byType[tc.type].total++;
      if (result.status === 'passed') coverage.byType[tc.type].passed++;
      if (result.status === 'failed') coverage.byType[tc.type].failed++;
    }
  }

  // Calculate pass rate
  coverage.passRate = coverage.testCases.executed > 0
    ? Math.round((coverage.testCases.passed / coverage.testCases.executed) * 100)
    : 0;

  // Identify gaps
  const executedIds = new Set(executionResults.map(r => r.testCaseId));
  for (const tc of testPlan.testCases) {
    if (!executedIds.has(tc.id)) {
      coverage.gaps.push({
        testCaseId: tc.id,
        reason: 'Not executed',
        priority: tc.priority
      });
    }
  }

  return coverage;
}
```

---

## Level 4: Regression Suite

### defineRegressionSuite()
```javascript
/**
 * Define regression test suite
 */
function defineRegressionSuite(config) {
  const { scope, criticalPaths, previousBugs } = config;

  const suite = {
    id: `REG-${Date.now()}`,
    createdAt: new Date().toISOString(),
    scope,
    categories: {
      smoke: [],
      critical: [],
      full: []
    }
  };

  // Smoke tests - fast sanity check
  suite.categories.smoke = [
    { id: 'SMOKE-001', name: 'Application loads', maxDuration: '30s' },
    { id: 'SMOKE-002', name: 'User can login', maxDuration: '30s' },
    { id: 'SMOKE-003', name: 'Main navigation works', maxDuration: '30s' },
    { id: 'SMOKE-004', name: 'API health check passes', maxDuration: '10s' }
  ];

  // Critical path tests - core user journeys
  for (const path of criticalPaths) {
    suite.categories.critical.push({
      id: `CRIT-${path.id}`,
      name: path.name,
      steps: path.steps,
      priority: 'P0'
    });
  }

  // Bug regression - verify previous bugs stay fixed
  for (const bug of previousBugs) {
    suite.categories.full.push({
      id: `BUGREG-${bug.id}`,
      name: `Regression: ${bug.title}`,
      originalBug: bug.id,
      verificationSteps: bug.reproSteps,
      priority: bug.severity === 'critical' ? 'P0' : 'P1'
    });
  }

  // Calculate estimated run time
  suite.estimatedRunTime = {
    smoke: '5 minutes',
    critical: `${suite.categories.critical.length * 3} minutes`,
    full: `${(suite.categories.smoke.length + suite.categories.critical.length + suite.categories.full.length) * 2} minutes`
  };

  return suite;
}
```

---

## MCP Tool Interface

```javascript
const testSpecTool = {
  name: 'test_spec',
  description: 'Generate test specifications, plans, and coverage analysis',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['spec', 'plan', 'cases', 'coverage', 'regression', 'matrix'],
        description: 'Test spec operation to perform'
      },
      ticketId: {
        type: 'string',
        description: 'Ticket ID for test plan'
      },
      requirements: {
        type: 'array',
        description: 'Requirements to generate tests from'
      },
      riskLevel: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Risk level for test depth'
      }
    },
    required: ['action']
  }
};
```

---

## Usage Examples

```bash
# Generate test spec from requirements
test-spec spec --requirements requirements.json

# Create test plan
test-spec plan --ticket FEAT-001 --risk high

# List test cases
test-spec cases --ticket FEAT-001

# Check coverage
test-spec coverage --plan TP-FEAT-001 --results execution.json

# Define regression suite
test-spec regression --scope "booking flow"
```

---

## Output Format: Test Plan Markdown

```markdown
# Test Plan: TP-FEAT-001

**Ticket**: FEAT-001
**Risk Level**: High
**Created**: 2026-01-20

## Scope

### In Scope
- User booking flow
- Payment processing
- Confirmation emails

### Out of Scope
- Admin dashboard
- Reporting

## Test Cases

| ID | Type | Title | Priority |
|----|------|-------|----------|
| TC-001-POS-01 | Positive | Verify booking creation | High |
| TC-001-NEG-01 | Negative | Verify invalid input handling | High |

## Exit Criteria

- [ ] All P0/P1 bugs fixed
- [ ] Pass rate > 95%
- [ ] No critical regressions
```

---

## Success Criteria

- Test specs generated within 15 minutes of requirements
- 100% requirement coverage in test plans
- Regression suite runs in < 30 minutes
- Pass rate > 95% for releases
- Zero critical bugs escape to production
