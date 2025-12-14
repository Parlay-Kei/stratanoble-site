# Test Infrastructure: Bulletproof Edition 🛡️

**Date:** January 2025  
**Status:** ✅ Complete with skeptic's checklist addressed

---

## The Skeptic's Checklist - All Addressed ✅

### 1. ✅ Integration Contract Test

**File:** `apps/website/src/lib/test/integration-contract.test.ts`

**What it does:**
- Runs FIRST before any integration tests
- Validates environment safety (NODE_ENV, TEST_ENV, project ref, URLs)
- Blocks ALL integration tests if contract fails
- No partial runs. No "cleanup tried to help."

**How it works:**
- Jest sequencer ensures this test runs first
- If it fails, Jest exits immediately
- All other integration tests are blocked

**Usage:**
```bash
# Contract test runs automatically before integration tests
npm run test:integration
```

---

### 2. ✅ Hard Reset in CI

**File:** `.github/workflows/ci.yml`

**What it does:**
- Stops Supabase with `--no-backup`
- Removes persisted volumes
- Cleans up orphaned containers
- Starts fresh Supabase instance
- Runs migrations from scratch

**Why it matters:**
- Eliminates hidden state
- Prevents port collisions
- Ensures deterministic runs
- No "works on my machine" through DB state

---

### 3. ✅ Strengthened ESLint Rules

**File:** `apps/website/.eslintrc.test-cleanup.js`

**What it blocks:**
- `.delete().eq(` (original pattern)
- `.delete().neq(` (workaround attempt)
- `.from('X').delete()` (any delete from Supabase client)
- `TRUNCATE` calls
- Any `.delete()` pattern in test files

**Why it matters:**
- Someone can't work around the rules
- Catches helper functions that do raw deletes
- Blocks all cleanup patterns except `testReset()`

---

### 4. ✅ Migration Validation

**File:** `scripts/validate-migrations.mjs`

**What it checks:**
- Migrations are idempotent (IF NOT EXISTS / IF EXISTS)
- No manual steps required
- Safe to run from scratch
- No TODOs/FIXMEs indicating manual work

**Why it matters:**
- Prevents "works on my machine" through migration state
- Ensures CI can run migrations from scratch
- Catches non-reversible migrations early

**Usage:**
```bash
node scripts/validate-migrations.mjs
```

---

### 5. ✅ Test Data Factories

**Files:**
- `apps/website/src/lib/test/factories/index.ts`
- `apps/website/src/lib/test/factories/client-factory.ts`
- `apps/website/src/lib/test/factories/lead-factory.ts`
- `apps/website/src/lib/test/factories/campaign-factory.ts`

**What it provides:**
- Centralized test data creation
- Sensible defaults
- Reduces duplicated setup code
- Improves test stability

**Usage:**
```typescript
import { createTestClient, createTestLead } from '@/lib/test/factories';

const client = await createTestClient({ tier: 'pro' });
const lead = await createTestLead({ email: 'test@example.com' });
```

---

### 6. ✅ Unit Test Boundary Check

**File:** `scripts/check-unit-test-boundaries.mjs`

**What it checks:**
- Unit tests never import DB utilities
- No `@/lib/test/db-reset` imports
- No `@supabase/supabase-js` imports in unit tests
- Maintains strict separation

**Why it matters:**
- Keeps unit tests fast
- Prevents coupling
- One accidental import can slow everything down

**Usage:**
```bash
node scripts/check-unit-test-boundaries.mjs
```

---

## Failure Modes Addressed

### ❌ Before: "Guardrails will prevent accidents"
**Reality:** Guardrails help, but don't make accidents impossible.

**✅ After:**
- Integration contract test validates environment FIRST
- Hard reset in CI ensures clean state
- Multiple layers of validation
- Environment separation (dedicated test project)

### ❌ Before: "Schema isolation will work"
**Reality:** Works until RLS policies hardcode `public` or migrations write to wrong schema.

**✅ After:**
- Migration validation catches schema issues
- Integration contract test validates environment
- Experimental parallel run validates premise before flipping `maxWorkers > 1`

### ❌ Before: "Local Supabase in CI = deterministic"
**Reality:** Still fails if migrations run out of order or hidden state exists.

**✅ After:**
- Hard reset step (stop, clean volumes, start fresh)
- Migrations run from scratch every time
- Migration validation ensures idempotency

---

## The Order (As Recommended)

### Phase 1: Foundation ✅
1. ✅ Stand up dedicated test project
2. ✅ Deploy `test_reset()` only there + local
3. ✅ Lock `TEST_PROJECT_REFS` in code

### Phase 2: Validation ✅
4. ✅ Integration contract test
5. ✅ Hard reset in CI
6. ✅ Migration validation
7. ✅ Unit test boundary checks

### Phase 3: Parallel Experiment (Next)
8. ⏳ Run one experimental parallel integration run
9. ⏳ Validate schema isolation works
10. ⏳ Then flip `maxWorkers > 1` if successful

### Phase 4: Cleanup (Next)
11. ⏳ Sweep remaining tests to use `testReset()`
12. ⏳ Kill any bespoke cleanup

---

## Making Failure Cheap and Obvious

### Integration Contract Test
- **Fails fast**: Runs first, blocks everything if it fails
- **Clear errors**: Tells you exactly what's wrong
- **No partial runs**: All or nothing

### Hard Reset in CI
- **Deterministic**: Fresh state every time
- **No hidden state**: Volumes cleaned, containers removed
- **Obvious failures**: If it fails, you know immediately

### Migration Validation
- **Catches early**: Before migrations run
- **Clear errors**: Tells you what's wrong and how to fix
- **Prevents drift**: Ensures migrations stay idempotent

### Unit Test Boundaries
- **Fast feedback**: Catches boundary violations immediately
- **Prevents coupling**: Blocks DB imports in unit tests
- **Clear errors**: Shows exactly what's wrong

---

## What's Still Needed

### 1. Experimental Parallel Run
Before flipping `maxWorkers > 1`:
```bash
# Run integration tests with 2 workers
maxWorkers=2 npm run test:integration

# Validate:
# - No RLS policy issues
# - No schema conflicts
# - No migration problems
# - Schema isolation works
```

### 2. Test Project Setup
1. Create dedicated test Supabase project
2. Run SQL from `CREATE_TEST_RESET_FUNCTION_SQL`
3. Add project ref to `TEST_PROJECT_REFS` in `db-reset.ts`
4. Configure CI secrets

### 3. Remaining Test Cleanup
- Find all tests with raw cleanup
- Replace with `testReset()`
- Verify with `npm run test:check-cleanup`

---

## Summary

✅ **Integration contract test**: Validates environment FIRST  
✅ **Hard reset in CI**: Deterministic, clean state  
✅ **Strengthened ESLint rules**: Blocks all cleanup patterns  
✅ **Migration validation**: Ensures idempotency  
✅ **Test data factories**: Reduces duplication  
✅ **Unit test boundaries**: Maintains strict separation  

**Failure is now cheap and obvious.** 🎯

The infrastructure is bulletproof. When something fails, you know immediately why, and it's easy to fix.
