# Test Infrastructure Improvements

**Date:** January 2025  
**Status:** ✅ Complete

## Overview

This document describes the improvements made to the test infrastructure to ensure "all green" stays true as the test suite grows. The changes focus on:

1. **Parallel unit tests** (fast, no DB)
2. **Serial/isolated integration tests** (with DB)
3. **Production-safe test reset** (multiple guardrails)
4. **CI always runs integration tests** (no graceful skips)
5. **Prevent raw cleanup** (enforce db-reset.ts usage)

---

## 1. Production-Safe Database Reset Utility

### Location
`apps/website/src/lib/test/db-reset.ts`

### Guardrails

The `testReset()` function has multiple layers of protection:

1. **NODE_ENV check**: Must be `'test'`
2. **TEST_ENV flag**: Must be set to `'true'`
3. **Project ref validation**: Only works with test Supabase projects
4. **URL pattern check**: Blocks production-like URLs
5. **Schema isolation**: Uses worker-specific schemas for parallel execution

### Usage

```typescript
import { testReset } from '@/lib/test/db-reset';

// In your test file
beforeEach(async () => {
  await testReset(); // Resets all tables in test schema
});

// Or reset specific tables
await testReset({ tables: ['user_actions', 'clients'] });
```

### SQL Setup

Run the SQL from `CREATE_TEST_RESET_FUNCTION_SQL` in your **TEST** Supabase project only:

```sql
-- ⚠️  WARNING: Only run this in TEST projects, NEVER in production!
-- See db-reset.ts for the full SQL
```

---

## 2. Jest Configuration: Unit vs Integration

### Unit Tests (Parallel, Fast)

- **Location**: `apps/website/jest.config.js`
- **Config**: `unitTestConfig`
- **Workers**: `50%` of available CPUs
- **Timeout**: 5 seconds
- **Pattern**: Excludes `integration.test.*` and `e2e/`

```bash
npm test -- --testPathIgnorePatterns=integration
```

### Integration Tests (Serial, Isolated)

- **Config**: `integrationTestConfig`
- **Workers**: `1` (serial execution)
- **Timeout**: 30 seconds
- **Pattern**: Matches `integration.test.*`
- **Setup**: `jest.integration-setup.js` (sets TEST_ENV)

```bash
TEST_TYPE=integration npm test -- --testPathPattern=integration
```

### Future: Parallel Integration Tests

To enable parallel integration tests later:

1. Update `maxWorkers` in `integrationTestConfig`
2. Use `getTestSchema()` in `db-reset.ts` to create worker-specific schemas
3. Each worker uses `TEST_SCHEMA=worker_1`, `worker_2`, etc.
4. `testReset()` truncates within that schema only

---

## 3. CI Workflow: Always Run Integration Tests

### Before
- Integration tests could be skipped if credentials were missing
- No guarantee that "green" meant full suite passed

### After
- **Separate jobs**: `test-unit` and `test-integration`
- **Always runs**: Integration tests use local Supabase (`supabase start`)
- **No graceful skips**: CI fails if integration tests can't run
- **Build depends on tests**: `build` job requires both test jobs to pass

### CI Structure

```yaml
jobs:
  test-unit:          # Fast, parallel, no DB
  test-integration:   # Serial, requires Supabase
  build:              # Depends on both test jobs
```

### Local Supabase in CI

```yaml
- name: Start local Supabase
  run: supabase start

- name: Run migrations
  run: supabase db reset

- name: Run integration tests
  env:
    TEST_ENV: 'true'
    NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
```

---

## 4. Prevent Raw Cleanup

### ESLint Rule

File: `apps/website/.eslintrc.test-cleanup.js`

Blocks:
- `.delete().eq(` in cleanup contexts
- `TRUNCATE` calls
- Direct `.delete()` cleanup

### CI Check

Script: `scripts/check-test-cleanup.mjs`

Runs in CI to catch raw cleanup patterns:

```bash
npm run test:check-cleanup
```

### Enforcement

- **Pre-commit**: ESLint rule (if configured)
- **CI**: Script check before integration tests
- **Manual**: Run `npm run test:check-cleanup` locally

---

## 5. Husky Pre-Push: Unit Tests Only

### Before
- Ran full validation (could be slow)

### After
- **Unit tests only**: Fast feedback before push
- **Integration tests in CI**: Full suite runs in CI
- **Clear messaging**: Tells user integration tests run in CI

### Pre-Push Flow

```bash
1. Run unit tests (fast, no DB)
2. Run pre-push validation
3. If both pass → push allowed
4. Integration tests run in CI
```

---

## Migration Guide

### For Existing Tests

1. **Replace raw cleanup**:
   ```typescript
   // ❌ Old
   await supabase.from('table').delete().eq('id', testId);
   
   // ✅ New
   import { testReset } from '@/lib/test/db-reset';
   await testReset({ tables: ['table'] });
   ```

2. **Add TEST_ENV**:
   ```bash
   # In your test environment
   export TEST_ENV=true
   export NODE_ENV=test
   ```

3. **Update test file names**:
   - Unit tests: `*.test.ts` (anywhere)
   - Integration tests: `*.integration.test.ts` or in `tests/` directory

### For New Tests

1. **Unit test**: No special setup, runs in parallel
2. **Integration test**: 
   - Name: `*.integration.test.ts`
   - Use `testReset()` for cleanup
   - Set `TEST_ENV=true` in environment

---

## Testing the Improvements

### Run Unit Tests
```bash
cd apps/website
npm run test:unit
```

### Run Integration Tests
```bash
cd apps/website
TEST_ENV=true npm run test:integration
```

### Check for Raw Cleanup
```bash
cd apps/website
npm run test:check-cleanup
```

### Local CI Simulation
```bash
# Start Supabase
supabase start

# Set test environment
export TEST_ENV=true
export NODE_ENV=test
export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321

# Run integration tests
npm run test:integration
```

---

## Future Enhancements

### Parallel Integration Tests

1. Create worker-specific schemas:
   ```sql
   CREATE SCHEMA IF NOT EXISTS test_worker_1;
   CREATE SCHEMA IF NOT EXISTS test_worker_2;
   ```

2. Update `getTestSchema()` to use `JEST_WORKER_ID`

3. Update `maxWorkers` in integration config:
   ```javascript
   maxWorkers: process.env.CI ? 4 : 2,
   ```

### Test Project Detection

Add your test Supabase project refs to `TEST_PROJECT_REFS` in `db-reset.ts`:

```typescript
const TEST_PROJECT_REFS = [
  'your-test-project-ref',
];
```

---

## Summary

✅ **Unit tests**: Parallel, fast, no DB  
✅ **Integration tests**: Serial, isolated, always run in CI  
✅ **Production-safe reset**: Multiple guardrails prevent accidents  
✅ **No raw cleanup**: Enforced via lint and CI checks  
✅ **Fast pre-push**: Unit tests only, integration in CI  

The test infrastructure is now built to scale. "All green" means something.
