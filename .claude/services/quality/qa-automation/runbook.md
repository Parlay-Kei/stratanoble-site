# QA Automation Service

**Type**: Service (V10)
**Operator**: QA Gatekeeper

---

## Purpose

Test automation harness.

## Test Types

| Type | Framework | Purpose |
|------|-----------|---------|
| Unit | Vitest | Component/function |
| Integration | Vitest | API/service |
| E2E | Playwright | User flows |
| Visual | Playwright | UI regression |

## Test Commands

```bash
# Unit tests
npm run test

# E2E tests
npx playwright test

# Full suite
npm run test:all

# Watch mode
npm run test:watch
```

## Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # API tests
├── e2e/           # Playwright tests
└── fixtures/      # Test data
```

## Coverage Targets

| Type | Target |
|------|--------|
| Unit | 80% |
| E2E | Critical paths |
| Integration | All APIs |

## CI Integration

```yaml
test:
  steps:
    - npm ci
    - npm run test:coverage
    - npx playwright test
    - Upload results
```

## Flaky Test Management

```
1. Detect (test fails inconsistently)
2. Quarantine (skip in CI)
3. Investigate (root cause)
4. Fix (add waits, mock, etc.)
5. Restore (re-enable)
```

## Test Data

| Env | Data Source |
|-----|-------------|
| Unit | Fixtures |
| Integration | Test database |
| E2E | Seeded data |

## Incidents

| Issue | Resolution |
|-------|------------|
| Tests timing out | Increase timeout, optimize |
| Env differences | Standardize test env |
| Data pollution | Isolate test data |
