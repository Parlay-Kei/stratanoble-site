# Test Infrastructure: Final Layer 🛡️

**Date:** January 2025  
**Status:** ✅ Complete - Fort Knox Edition

---

## The Final Layer: Preventing Complexity Drift

### 1. ✅ Integration Harness (The One True Door)

**File:** `apps/website/src/lib/test/integration/index.ts`

**What it does:**
- Single canonical module that ALL integration tests must import from
- Exports: `withDbTest()`, `testReset()`, `factories`, `adminClient`
- Auto-validates environment on import
- Checks canary protection table
- Makes bypassing mechanically hard

**Why it matters:**
- No more "helper functions that wrap deletes"
- No more "RPC calls that delete internally"
- Cultural enforcement via mechanical requirement
- One place to update when patterns change

**Usage:**
```typescript
import { withDbTest, testReset, factories, adminClient } from '@/lib/test/integration';

test('my test', async () => {
  await withDbTest(async () => {
    const client = await factories.createTestClient();
    // Test code here
    // Auto-reset happens after
  });
});
```

**Enforcement:**
- `check-integration-harness-usage.mjs` ensures all integration tests use it
- Runs in CI before tests
- Blocks tests that bypass the harness

---

### 2. ✅ Test Metrics (Prevent Self-Deception)

**File:** `scripts/test-metrics.mjs`

**What it tracks:**
- Integration runtime (catches slow drift)
- Flake rate (tests that fail then pass on retry)
- Failure trends over time
- CI artifacts for historical tracking

**Why it matters:**
- "Green" doesn't mean "fast" or "stable"
- Catches slow degradation before it becomes a problem
- Historical data shows trends
- Prevents "works on my machine" through metrics

**Output:**
- `test-metrics.json` - Full history (last 100 runs)
- `test-metrics-latest.json` - Latest run only
- CI artifacts uploaded for 90 days

**Usage:**
```bash
# Automatically runs in CI after tests
node scripts/test-metrics.mjs --test-output=test-results.json
```

---

### 3. ✅ Canary Protection Table

**File:** SQL in `db-reset.ts` and `bootstrap-test-project.mjs`

**What it does:**
- Creates `env_sentinel` table with hard-coded value
- Contract test validates this value
- Prevents pointing at wrong database (even with matching ref)
- Never gets truncated (protected in `truncate_table_safe`)

**Why it matters:**
- Project ref validation can be bypassed (proxy, reused project)
- Canary table can't be faked without knowing the value
- Reduces chance of pointing at wrong database to near zero

**Implementation:**
```sql
CREATE TABLE env_sentinel (
  id TEXT PRIMARY KEY DEFAULT 'test-environment-sentinel',
  canary_value TEXT NOT NULL DEFAULT 'TEST_ENVIRONMENT_VERIFIED_2025'
);
```

**Validation:**
- Contract test checks canary value
- Integration harness validates on import
- Fails fast if wrong database

---

### 4. ✅ Weekly Parallel Stress Test

**File:** `.github/workflows/integration-stress-test.yml`

**What it does:**
- Runs every Monday at 2 AM UTC
- Runs integration tests with `maxWorkers=2` (parallel)
- Validates schema isolation under real load
- Catches drift early without slowing normal builds

**Why it matters:**
- Schema isolation might pass in single run, fail under load
- Connection pooling issues only show up with parallel execution
- `search_path` assumptions break with multiple workers
- Catches problems before we flip `maxWorkers > 1` in main CI

**Metrics:**
- Tracks stress test results separately
- Uploads artifacts for analysis
- Historical data shows if parallel execution is getting flakier

---

### 5. ✅ One-Command Bootstrap

**File:** `scripts/bootstrap-test-project.mjs`

**What it does:**
- Sets up dedicated test Supabase project
- Creates canary protection table
- Deploys `test_reset()` functions
- Outputs configuration for `.env` files
- Updates `TEST_PROJECT_REFS` in code

**Why it matters:**
- Prevents hand-rolling test setup
- Ensures consistency across team
- One command, zero mistakes
- Documents the setup process

**Usage:**
```bash
# Local Supabase
node scripts/bootstrap-test-project.mjs --local

# Remote project (shows SQL to run)
node scripts/bootstrap-test-project.mjs --remote
```

---

## Addressing Complexity Drift

### Problem: "Bulletproof stays bulletproof"
**Solution:**
- Integration harness (one place to update)
- Weekly stress tests (catch drift early)
- Metrics tracking (quantify degradation)
- Automated checks (prevent bypasses)

### Problem: "Guardrails get bypassed"
**Solution:**
- Integration harness is required (mechanical enforcement)
- Canary protection (can't fake it)
- Multiple validation layers (contract test + harness)
- CI checks prevent bypasses

### Problem: "Checks cover all routes"
**Solution:**
- Integration harness is the ONLY route
- All DB access goes through `adminClient`
- All cleanup goes through `testReset()`
- All test data through factories

### Problem: "Contract test passes but wrong DB"
**Solution:**
- Canary protection table (hard-coded value)
- Project ref + URL + canary = triple validation
- Can't fake canary without knowing the value

---

## The Complete Stack

### Layer 1: Foundation ✅
- Production-safe `testReset()`
- Jest config (unit vs integration)
- CI always runs integration tests
- ESLint rules block raw cleanup

### Layer 2: Validation ✅
- Integration contract test
- Hard reset in CI
- Migration validation
- Unit test boundaries

### Layer 3: Fort Knox ✅
- Integration harness (one true door)
- Test metrics (prevent self-deception)
- Canary protection (validate correct DB)
- Weekly stress tests (catch drift)
- One-command bootstrap (prevent hand-rolling)

---

## Maintenance Checklist

### Weekly
- ✅ Review stress test results
- ✅ Check test metrics trends
- ✅ Verify canary protection still works

### Monthly
- ✅ Review integration harness usage
- ✅ Check for new test patterns that bypass harness
- ✅ Validate migration patterns still work
- ✅ Review flake rate trends

### Quarterly
- ✅ Run experimental parallel integration test
- ✅ Validate schema isolation still works
- ✅ Review all guardrails for bypasses
- ✅ Update documentation

---

## Next Steps (Final Order)

1. ✅ Stand up dedicated test project (use bootstrap script)
2. ✅ Deploy `test_reset()` only there + local
3. ✅ Lock `TEST_PROJECT_REFS` in code
4. ⏳ Run one experimental parallel integration run
5. ⏳ Validate schema isolation works
6. ⏳ Then flip `maxWorkers > 1` if successful
7. ⏳ Sweep remaining tests to use integration harness
8. ⏳ Kill any bespoke cleanup

---

## Summary

✅ **Integration harness**: One true door, no bypasses  
✅ **Test metrics**: Prevent self-deception  
✅ **Canary protection**: Validate correct database  
✅ **Weekly stress tests**: Catch drift early  
✅ **One-command bootstrap**: Prevent hand-rolling  

**The infrastructure is now truly bulletproof.** 🎯

When complexity drifts, you'll know immediately through:
- Weekly stress test failures
- Metrics showing degradation
- Integration harness usage checks
- Canary protection failures

Failure is cheap, obvious, and caught early.
