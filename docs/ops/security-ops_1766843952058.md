---
name: security-ops
description: Elite security operations skill for the saas-security-auditor agent. Provides advanced capabilities for threat modeling, vulnerability scanning, secure code review, compliance auditing, and security automation at Vercel/Supabase/Amazon scale.
version: 1.0.0
level: 3
triggers:
  - security audit
  - threat model
  - vulnerability scan
  - security review
  - rls audit
  - owasp check
  - compliance audit
  - security plan
  - penetration test
  - secure code review
---

# security-ops Skill

Elite security operations for high-velocity teams. This skill enables the saas-security-auditor agent to operate as a proactive security champion.

## Quick Commands

| Command | Action |
|---------|--------|
| `scan` | Full security scan of codebase |
| `audit` | Deep analysis with SECURITY PLAN |
| `threat-model` | Generate threat model for feature/component |
| `rls` | Audit Supabase RLS policies |
| `owasp` | OWASP Top 10 vulnerability check |
| `deps` | Dependency vulnerability scan (npm audit) |
| `secrets` | Scan for hardcoded secrets |
| `compliance` | SOC 2/ISO 27001/GDPR compliance check |
| `report` | Generate full security audit report |

---

## Level 1: Basic Operations

### scanSecrets()
```typescript
/**
 * Scan codebase for hardcoded secrets and credentials
 */
async function scanSecrets(path: string = './'): Promise<SecretsScanResult> {
  const patterns = [
    /(?:api[_-]?key|apikey)\s*[:=]\s*['"][^'"]{20,}['"]/gi,
    /(?:secret|password|passwd|pwd)\s*[:=]\s*['"][^'"]+['"]/gi,
    /(?:bearer|token)\s+[a-zA-Z0-9_-]{20,}/gi,
    /-----BEGIN (?:RSA |DSA |EC )?PRIVATE KEY-----/g,
    /sk_(?:live|test)_[a-zA-Z0-9]{24,}/g,  // Stripe
    /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,  // JWT
    /supabase.*anon.*key.*[:=]\s*['"][^'"]+['"]/gi,
    /SUPABASE_SERVICE_ROLE_KEY/g
  ];

  const files = await glob(`${path}/**/*.{ts,tsx,js,jsx,json,env*}`, {
    ignore: ['**/node_modules/**', '**/.git/**']
  });

  const findings = [];
  for (const file of files) {
    const content = await read(file);
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        findings.push({
          file,
          pattern: pattern.source,
          matches: matches.length,
          severity: 'CRITICAL',
          recommendation: 'Move to environment variables'
        });
      }
    }
  }

  return {
    scanned: files.length,
    findings,
    clean: findings.length === 0
  };
}
```

### auditDependencies()
```typescript
/**
 * Audit npm dependencies for known vulnerabilities
 */
async function auditDependencies(): Promise<DependencyAuditResult> {
  const result = await exec('npm audit --json');
  const audit = JSON.parse(result.stdout);

  return {
    totalVulnerabilities: audit.metadata.vulnerabilities.total,
    critical: audit.metadata.vulnerabilities.critical,
    high: audit.metadata.vulnerabilities.high,
    moderate: audit.metadata.vulnerabilities.moderate,
    low: audit.metadata.vulnerabilities.low,
    advisories: Object.values(audit.advisories || {}).map(a => ({
      module: a.module_name,
      severity: a.severity,
      title: a.title,
      recommendation: a.recommendation,
      cwe: a.cwe
    })),
    shipReady: audit.metadata.vulnerabilities.critical === 0 &&
               audit.metadata.vulnerabilities.high === 0
  };
}
```

### validateInputs()
```typescript
/**
 * Check for proper input validation patterns
 */
async function validateInputs(path: string = './src'): Promise<InputValidationResult> {
  const files = await glob(`${path}/**/*.{ts,tsx}`);
  const findings = [];

  const dangerousPatterns = [
    { pattern: /dangerouslySetInnerHTML/g, risk: 'XSS', severity: 'HIGH' },
    { pattern: /eval\s*\(/g, risk: 'Code Injection', severity: 'CRITICAL' },
    { pattern: /new Function\s*\(/g, risk: 'Code Injection', severity: 'CRITICAL' },
    { pattern: /innerHTML\s*=/g, risk: 'XSS', severity: 'HIGH' },
    { pattern: /document\.write/g, risk: 'XSS', severity: 'HIGH' },
    { pattern: /\.raw\s*`/g, risk: 'SQL Injection', severity: 'HIGH' },
    { pattern: /exec\s*\(\s*[`'"]/g, risk: 'Command Injection', severity: 'CRITICAL' }
  ];

  for (const file of files) {
    const content = await read(file);
    for (const { pattern, risk, severity } of dangerousPatterns) {
      if (pattern.test(content)) {
        findings.push({ file, risk, severity, pattern: pattern.source });
      }
    }
  }

  // Check for Zod validation usage
  const hasZod = await grep('from.*zod', path);
  const zodCoverage = hasZod.length > 0 ? 'PARTIAL' : 'NONE';

  return {
    findings,
    zodCoverage,
    recommendation: zodCoverage === 'NONE'
      ? 'Implement Zod schemas for all user inputs'
      : 'Verify all API endpoints use Zod validation'
  };
}
```

---

## Level 2: Advanced Operations

### generateThreatModel()
```typescript
/**
 * Generate STRIDE threat model for a component
 */
async function generateThreatModel(
  component: string,
  context: ThreatContext
): Promise<ThreatModel> {
  const threats = {
    spoofing: [],
    tampering: [],
    repudiation: [],
    informationDisclosure: [],
    denialOfService: [],
    elevationOfPrivilege: []
  };

  // Analyze component for each STRIDE category
  const analysis = await analyzeComponent(component);

  // Spoofing
  if (analysis.hasAuth) {
    threats.spoofing.push({
      threat: 'Session hijacking via token theft',
      likelihood: 'medium',
      impact: 'high',
      mitigation: 'Implement secure cookie flags, token rotation'
    });
  }

  // Tampering
  if (analysis.hasDataInput) {
    threats.tampering.push({
      threat: 'Data manipulation via parameter tampering',
      likelihood: 'high',
      impact: 'high',
      mitigation: 'Server-side validation with Zod, integrity checks'
    });
  }

  // Information Disclosure
  if (analysis.hasApiCalls) {
    threats.informationDisclosure.push({
      threat: 'Sensitive data exposure in API responses',
      likelihood: 'medium',
      impact: 'critical',
      mitigation: 'Response filtering, RLS policies, field-level security'
    });
  }

  // Denial of Service
  threats.denialOfService.push({
    threat: 'Resource exhaustion via unthrottled requests',
    likelihood: 'high',
    impact: 'medium',
    mitigation: 'Rate limiting via Vercel Edge, request throttling'
  });

  // Elevation of Privilege
  if (analysis.hasRoles) {
    threats.elevationOfPrivilege.push({
      threat: 'Privilege escalation via role manipulation',
      likelihood: 'medium',
      impact: 'critical',
      mitigation: 'Server-side role validation, RLS policy enforcement'
    });
  }

  return {
    component,
    context,
    threats,
    riskScore: calculateRiskScore(threats),
    mitigationPlan: generateMitigationPlan(threats)
  };
}
```

### auditRLSPolicies()
```typescript
/**
 * Audit Supabase Row Level Security policies
 */
async function auditRLSPolicies(): Promise<RLSAuditResult> {
  // Read migration files for RLS definitions
  const migrations = await glob('./supabase/migrations/*.sql');
  const policies = [];
  const issues = [];

  for (const migration of migrations) {
    const content = await read(migration);

    // Extract RLS policy definitions
    const policyMatches = content.matchAll(
      /CREATE POLICY\s+"([^"]+)"\s+ON\s+(\w+)\s+FOR\s+(\w+)/gi
    );

    for (const match of policyMatches) {
      policies.push({
        name: match[1],
        table: match[2],
        operation: match[3],
        file: migration
      });
    }

    // Check for tables without RLS
    const tableMatches = content.matchAll(/CREATE TABLE\s+(\w+)/gi);
    for (const match of tableMatches) {
      const tableName = match[1];
      if (!content.includes(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`)) {
        issues.push({
          table: tableName,
          issue: 'RLS not enabled',
          severity: 'CRITICAL',
          recommendation: `Add: ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`
        });
      }
    }
  }

  // Check for missing policy coverage
  const operations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
  const tables = [...new Set(policies.map(p => p.table))];

  for (const table of tables) {
    const tablePolicies = policies.filter(p => p.table === table);
    for (const op of operations) {
      if (!tablePolicies.some(p => p.operation === op)) {
        issues.push({
          table,
          issue: `Missing ${op} policy`,
          severity: op === 'DELETE' ? 'HIGH' : 'MEDIUM',
          recommendation: `Add ${op} policy for table ${table}`
        });
      }
    }
  }

  return {
    totalPolicies: policies.length,
    policies,
    issues,
    coverage: calculateCoverage(policies, tables),
    shipReady: issues.filter(i => i.severity === 'CRITICAL').length === 0
  };
}
```

### checkOWASPTop10()
```typescript
/**
 * Check for OWASP Top 10 vulnerabilities
 */
async function checkOWASPTop10(path: string = './src'): Promise<OWASPCheckResult> {
  const results = {
    A01_BrokenAccessControl: await checkAccessControl(path),
    A02_CryptographicFailures: await checkCrypto(path),
    A03_Injection: await checkInjection(path),
    A04_InsecureDesign: await checkDesign(path),
    A05_SecurityMisconfiguration: await checkConfig(path),
    A06_VulnerableComponents: await auditDependencies(),
    A07_AuthenticationFailures: await checkAuth(path),
    A08_DataIntegrityFailures: await checkIntegrity(path),
    A09_LoggingFailures: await checkLogging(path),
    A10_SSRF: await checkSSRF(path)
  };

  const summary = Object.entries(results).map(([category, result]) => ({
    category,
    status: result.issues?.length === 0 ? 'PASS' : 'FAIL',
    issueCount: result.issues?.length || 0,
    criticalCount: result.issues?.filter(i => i.severity === 'CRITICAL').length || 0
  }));

  return {
    results,
    summary,
    overallScore: calculateOWASPScore(summary),
    shipReady: summary.every(s => s.criticalCount === 0)
  };
}
```

---

## Level 3: Elite Operations

### generateSecurityPlan()
```typescript
/**
 * Generate comprehensive security plan in YAML format
 */
async function generateSecurityPlan(
  feature: string,
  scope: SecurityScope
): Promise<SecurityPlan> {
  const threatModel = await generateThreatModel(feature, scope);
  const codeAnalysis = await analyzeSecurityPatterns(scope.path);
  const rlsAudit = await auditRLSPolicies();
  const owaspCheck = await checkOWASPTop10(scope.path);

  const plan = `
SECURITY_PLAN:
  feature: "${feature}"
  date: "${new Date().toISOString()}"
  auditor: "security-ops"

  context:
    scope: "${scope.path}"
    stack: ["TypeScript", "React", "Supabase", "Vercel"]
    data_sensitivity: "${scope.dataSensitivity || 'medium'}"

  threat_model:
${threatModel.threats.map(t => `
    - threat: "${t.threat}"
      category: "${t.category}"
      likelihood: "${t.likelihood}"
      impact: "${t.impact}"
      mitigation: "${t.mitigation}"
`).join('')}

  invariants:
    - "All user inputs validated with Zod schemas"
    - "RLS policies enforce data isolation"
    - "No secrets in code or client bundles"
    - "All API endpoints rate-limited"
    - "Authentication required for protected routes"

  current_state:
    owasp_score: ${owaspCheck.overallScore}
    rls_coverage: ${rlsAudit.coverage}%
    critical_issues: ${countCritical(owaspCheck, rlsAudit)}
    high_issues: ${countHigh(owaspCheck, rlsAudit)}

  fixes:
${generateFixes(codeAnalysis, rlsAudit, owaspCheck)}

  validation:
    - "Run npm audit --fix"
    - "Execute security test suite"
    - "Verify RLS policies in Supabase dashboard"
    - "Test authentication flows"

  ship_ready: ${determineShipReady(owaspCheck, rlsAudit)}
`;

  return {
    yaml: plan,
    threatModel,
    owaspCheck,
    rlsAudit,
    recommendations: generateRecommendations(codeAnalysis, rlsAudit, owaspCheck)
  };
}
```

### runSecurityTests()
```typescript
/**
 * Generate and run security test suite
 */
async function runSecurityTests(config: SecurityTestConfig): Promise<TestResults> {
  const tests = [];

  // Authentication tests
  tests.push({
    name: 'Auth: Unauthenticated access blocked',
    test: async () => {
      const response = await fetch(`${config.baseUrl}/api/protected`, {
        method: 'GET'
      });
      return response.status === 401;
    }
  });

  // RLS tests
  tests.push({
    name: 'RLS: Cross-user data access prevented',
    test: async () => {
      const user1Data = await fetchAsUser(config.user1, '/api/data');
      const user2Attempt = await fetchAsUser(config.user2, `/api/data/${user1Data.id}`);
      return user2Attempt.status === 403 || user2Attempt.status === 404;
    }
  });

  // XSS tests
  tests.push({
    name: 'XSS: Script injection sanitized',
    test: async () => {
      const payload = '<script>alert("xss")</script>';
      const response = await submitForm(config.baseUrl, { input: payload });
      return !response.body.includes('<script>');
    }
  });

  // SQL injection tests
  tests.push({
    name: 'SQLi: Parameterized queries used',
    test: async () => {
      const payload = "'; DROP TABLE users; --";
      const response = await fetch(`${config.baseUrl}/api/search?q=${encodeURIComponent(payload)}`);
      return response.status !== 500;
    }
  });

  // Rate limiting tests
  tests.push({
    name: 'Rate Limit: Excessive requests blocked',
    test: async () => {
      const requests = Array(100).fill(null).map(() =>
        fetch(`${config.baseUrl}/api/endpoint`)
      );
      const responses = await Promise.all(requests);
      return responses.some(r => r.status === 429);
    }
  });

  // Execute tests
  const results = [];
  for (const test of tests) {
    try {
      const passed = await test.test();
      results.push({ name: test.name, passed, error: null });
    } catch (error) {
      results.push({ name: test.name, passed: false, error: error.message });
    }
  }

  return {
    total: tests.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results,
    shipReady: results.every(r => r.passed)
  };
}
```

### generateComplianceReport()
```typescript
/**
 * Generate compliance audit report
 */
async function generateComplianceReport(
  frameworks: ComplianceFramework[]
): Promise<ComplianceReport> {
  const report = {
    date: new Date().toISOString(),
    frameworks: {},
    overallCompliance: 0,
    gaps: [],
    recommendations: []
  };

  for (const framework of frameworks) {
    const controls = getControlsForFramework(framework);
    const results = [];

    for (const control of controls) {
      const status = await evaluateControl(control);
      results.push({
        id: control.id,
        name: control.name,
        status: status.compliant ? 'COMPLIANT' : 'GAP',
        evidence: status.evidence,
        gap: status.gap
      });

      if (!status.compliant) {
        report.gaps.push({
          framework,
          control: control.id,
          description: control.name,
          gap: status.gap,
          remediation: control.remediation
        });
      }
    }

    const compliance = (results.filter(r => r.status === 'COMPLIANT').length / results.length) * 100;
    report.frameworks[framework] = {
      controls: results,
      compliance: Math.round(compliance),
      status: compliance >= 80 ? 'PASSING' : 'NEEDS_WORK'
    };
  }

  report.overallCompliance = Math.round(
    Object.values(report.frameworks).reduce((sum, f) => sum + f.compliance, 0) / frameworks.length
  );

  return report;
}
```

### integrateCI()
```typescript
/**
 * Generate CI/CD security integration config
 */
async function integrateCI(platform: 'github' | 'vercel'): Promise<CIConfig> {
  if (platform === 'github') {
    return {
      file: '.github/workflows/security.yml',
      content: `
name: Security Checks

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Dependency audit
        run: npm audit --audit-level=high

      - name: Secret scanning
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main

      - name: SAST scan
        run: npx eslint . --ext .ts,.tsx --config eslint-security.config.js

      - name: Type check
        run: npm run typecheck

      - name: Security tests
        run: npm run test:security
        env:
          SUPABASE_URL: \${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: \${{ secrets.SUPABASE_ANON_KEY }}
`
    };
  }

  return {
    file: 'vercel.json',
    content: `
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" }
      ]
    }
  ]
}
`
  };
}
```

---

## SECURITY PLAN Template

```yaml
SECURITY_PLAN:
  feature: "[feature/component being analyzed]"
  date: "${DATE}"
  auditor: "security-ops"

  context:
    scope: "[files/directories in scope]"
    stack: ["TypeScript", "React", "Supabase", "Vercel"]
    data_sensitivity: "high|medium|low"

  threat_model:
    - threat: "[threat description]"
      category: "STRIDE category"
      likelihood: "high|medium|low"
      impact: "critical|high|medium|low"
      mitigation: "[specific fix]"

  invariants:
    - "[security invariant that must hold]"

  current_state:
    owasp_score: ${SCORE}
    rls_coverage: ${PERCENT}%
    critical_issues: ${COUNT}
    high_issues: ${COUNT}

  fixes:
    - priority: P0|P1|P2
      file: "[path/to/file]"
      line: ${LINE}
      issue: "[vulnerability description]"
      action: "[specific code change]"
      effort: S|M|L

  validation:
    - "[test to verify fix]"

  residual_risks:
    - "[any remaining concerns]"

  human_review_needed: Y|N
  reason: "[why human review needed]"

  ship_ready: Y|N
```

---

## Integration Commands

```bash
# Full security audit
security-ops audit

# Quick vulnerability scan
security-ops scan

# Generate threat model
security-ops threat-model --component auth

# Audit RLS policies
security-ops rls

# OWASP Top 10 check
security-ops owasp

# Dependency audit
security-ops deps

# Secret scanning
security-ops secrets

# Compliance check
security-ops compliance --framework soc2

# Generate CI config
security-ops ci --platform github

# Run security tests
security-ops test

# Full report
security-ops report --output SECURITY_AUDIT.md
```

---

## Agent Coordination

| Agent | Coordination Purpose |
|-------|---------------------|
| `code-quality-testing` | TypeScript security patterns, type safety |
| `backend-qa-automation-tester` | Security test execution |
| `web-automation-tester` | Vulnerability scanning, XSS testing |
| `pre-deployment-quality-auditor` | Security gates before deploy |
| `infra-deployment-specialist` | Secure deployment configs |
| `supabase-admin` | RLS policy creation/validation |

---

## Success Criteria

- 0 critical vulnerabilities
- 0 hardcoded secrets
- 100% RLS coverage on sensitive tables
- npm audit clean (no high/critical)
- OWASP Top 10 score > 90%
- All security tests passing
- Security headers configured
- CI/CD security gates active

**Ship fast. Ship secure. Always.**
