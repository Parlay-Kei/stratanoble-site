# How to Run Tests

**One-screen reference for running tests in this codebase.**

---

## Quick Reference

### Pre-Push (Local)
```bash
# Runs automatically via Husky
# - Unit tests only (fast, no DB)
# - Pre-push validation
```

**What runs:** Unit tests only  
**Time:** ~30 seconds  
**Requires:** Nothing (no DB, no setup)

---

### CI (GitHub Actions)
```bash
# Runs automatically on push/PR
# - Unit tests (parallel)
# - Integration tests (serial, with Supabase)
# - Build validation
```

**What runs:** Full suite  
**Time:** ~5-10 minutes  
**Requires:** Supabase (starts locally in CI)

---

## Bootstrap Test Project

### One Command Setup
```bash
# Local Supabase
node scripts/bootstrap-test-project.mjs --local

# Remote project (shows SQL to run)
node scripts/bootstrap-test-project.mjs --remote
```

**What it does:**
- Creates canary protection table
- Deploys `test_reset()` functions
- Outputs `.env` configuration
- Updates `TEST_PROJECT_REFS` in code

**When:** First time setup, or when rotating test project

---

## Running Tests Locally

### Unit Tests (Fast, No DB)
```bash
cd apps/website
npm run test:unit
```

**Time:** ~10 seconds  
**Requires:** Nothing

### Integration Tests (Requires Supabase)
```bash
# Start Supabase
cd apps/website
supabase start

# Set environment
export TEST_ENV=true
export NODE_ENV=test
export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
export SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Run tests
npm run test:integration
```

**Time:** ~2-5 minutes  
**Requires:** Local Supabase running

---

## Adding a New Integration Test

### The Rule: Use Integration Harness Only

```typescript
// ✅ CORRECT
import { withDbTest, factories, adminClient } from '@/lib/test/integration';

test('my test', async () => {
  await withDbTest(async () => {
    const client = await factories.createTestClient();
    // Your test code
  });
});

// ❌ WRONG - Don't do this
import { createClient } from '@supabase/supabase-js';
import { testReset } from '@/lib/test/db-reset';
```

**Why:** Integration harness is the one true door. All DB access goes through it.

**Enforcement:** CI checks for harness usage. Tests that bypass it will fail.

---

## Rotating Service Role Keys

### When to Rotate
- Monthly (recommended)
- If key was committed to git history
- If key was exposed in logs
- If team member leaves

### How to Rotate

1. **Generate new key in Supabase dashboard**
   - Test project → Settings → API
   - Generate new service role key

2. **Update environment variables**
   - Local: `.env.local`
   - CI: GitHub Secrets
   - Dev machines: `.env.local`

3. **Verify old key is revoked**
   - Test that old key no longer works
   - Check git history for exposed keys: `node scripts/check-secrets.mjs`

4. **Update test project bootstrap**
   - If using remote test project, update key in bootstrap script

---

## Test Metrics

### View Metrics
```bash
# Latest run
cat apps/website/test-metrics-latest.json

# Full history
cat apps/website/test-metrics.json
```

**What's tracked:**
- Runtime (mean and 95th percentile)
- Flake rate (fails once, passes on retry)
- Failure trends
- Historical data (last 100 runs)

**Where:** CI artifacts uploaded automatically

---

## Troubleshooting

### "Integration contract test failed"
**Fix:** Set `TEST_ENV=true` and `NODE_ENV=test`

### "Canary protection check failed"
**Fix:** Run bootstrap script to create canary table

### "Service role key not found"
**Fix:** Set `SUPABASE_SERVICE_ROLE_KEY` in environment

### "Unit test imports DB utility"
**Fix:** Remove DB imports from unit tests. Use mocks instead.

### "Integration test bypasses harness"
**Fix:** Import from `@/lib/test/integration` only

---

## Weekly Stress Test

**When:** Every Monday at 2 AM UTC (automatic)  
**What:** Runs integration tests with parallel workers (rotates: 2, 4, 6, 2)  
**Why:** Catches drift early, validates schema isolation  
**Manual trigger:** GitHub Actions → Integration Stress Test → Run workflow

---

## Secret Protection

### Pre-Commit Check
```bash
# Runs automatically via Husky
node scripts/check-secrets.mjs
```

**What it checks:**
- Service role keys in code
- Keys in git history
- Potential log exposures

**If it fails:** Rotate the key immediately

---

## Nuclear Button Prevention

**What:** Test that verifies guardrails actually guard  
**When:** Runs in CI and locally  
**Why:** Guarantees `testReset()` refuses invalid environments  

**Location:** `apps/website/src/lib/test/integration/nuclear-button-prevention.test.ts`

---

## Summary

| Task | Command | Time | Requires |
|------|---------|------|----------|
| Unit tests | `npm run test:unit` | ~10s | Nothing |
| Integration tests | `npm run test:integration` | ~2-5m | Supabase |
| Bootstrap project | `node scripts/bootstrap-test-project.mjs --local` | ~1m | Supabase CLI |
| Check secrets | `node scripts/check-secrets.mjs` | ~5s | Nothing |
| View metrics | `cat test-metrics-latest.json` | Instant | Nothing |

**Remember:** Integration harness is the one true door. Use it.
