# Quality Auditor Service

**Type**: Service (V9)
**Operator**: QA Gatekeeper

---

## Purpose

Quality audit system and reporting.

## Audit Types

| Type | Frequency | Scope |
|------|-----------|-------|
| Code quality | Per PR | Changed files |
| Full codebase | Weekly | All files |
| Pre-release | Per release | Critical paths |

## Quality Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Test coverage | >80% | Jest |
| TypeScript errors | 0 | tsc |
| Lint errors | 0 | ESLint |
| Complexity | <15 | ESLint |

## Audit Commands

```bash
# Full audit
npm run audit:full

# Quick check
npm run typecheck && npm run lint && npm run test

# Coverage report
npm run test:coverage
```

## Quality Report Template

```markdown
## Quality Audit - [Date]

### Summary
| Metric | Score | Target | Status |
|--------|-------|--------|--------|
| Coverage | X% | 80% | PASS/FAIL |
| Type errors | N | 0 | PASS/FAIL |
| Lint errors | N | 0 | PASS/FAIL |

### Issues Found
1. [Issue - file:line]

### Recommendations
1. [Recommendation]

### Verdict
PASS / FAIL
```

## Failure Handling

| Issue | Action |
|-------|--------|
| Coverage drop | Block merge until fixed |
| Type errors | Block merge |
| Lint errors | Auto-fix or block |
| Complexity | Flag for review |

## Integration

- Runs on every PR
- Blocks merge on failure
- Reports to QA Gatekeeper
- Tracked over time

## Incidents

| Issue | Resolution |
|-------|------------|
| Flaky tests | Stabilize or quarantine |
| Slow audit | Optimize, parallelize |
| False positives | Adjust rules |
