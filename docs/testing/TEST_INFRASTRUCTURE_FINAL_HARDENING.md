# Test Infrastructure: Final Hardening 🛡️

**Date:** January 2025  
**Status:** ✅ Complete - Last Realistic Failure Modes Addressed

---

## The Last Realistic Failure Modes - All Addressed ✅

### 1. ✅ Expanded Secret Scanning

**File:** `scripts/check-secrets.mjs` (updated)

**What it now covers:**
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (obvious)
- ✅ JWT-like strings (three base64url segments: `eyJ...`)
- ✅ Supabase anon keys (long and look "harmless")
- ✅ ElevenLabs API keys
- ✅ Twilio keys (AUTH_TOKEN, API_KEY)
- ✅ OpenAI keys (`sk-...` pattern)
- ✅ Generic long secrets (catch-all for 40+ chars)

**Enforcement:**
- ✅ Pre-commit check (blocks push)
- ✅ CI check (fails build)
- ✅ Git history scan (detects past exposures)
- ✅ **Rotation on detection**: Blocks push AND requires rotation

**Why it matters:**
- Secret scanning that only catches obvious patterns misses new formats
- Rotation is what actually ends the risk, not just blocking
- Catch-all patterns catch future API keys we don't know about yet

---

### 2. ✅ Hermetic Nuclear Button Test

**File:** `apps/website/src/lib/test/integration/nuclear-button-prevention.test.ts` (updated)

**What changed:**
- ✅ Snapshot environment at `beforeAll`
- ✅ Restore environment in `beforeEach` and `afterEach`
- ✅ Final restore in `afterAll`
- ✅ Can run with `--runInBand` if needed

**Why it matters:**
- Mutating `process.env` can contaminate other tests
- Flaky tests that randomly break other tests are a nightmare
- Hermetic tests are predictable and isolated

**Usage:**
```bash
# Run nuclear test in band (isolated)
RUN_NUCLEAR_TEST=true npm test -- nuclear-button-prevention
```

---

### 3. ✅ Table Drift Detection

**File:** `scripts/check-table-drift.mjs` (new)

**What it does:**
- Compares "tables in migrations" vs "tables in reset list"
- Fails if new tables are unaccounted for
- Forces conscious decision: truncate, preserve, or isolate

**Why it matters:**
- Explicit table enumeration will drift as new tables appear
- Without enforcement, tables get forgotten
- Forces a decision: is this table test data or protected?

**Decision matrix:**
1. **Truncate it**: Add to reset list in `db-reset.ts`
2. **Preserve it**: Add to `PROTECTED_TABLES` in check script
3. **Isolate it**: Use schema isolation for this table

**Enforcement:**
- ✅ Runs in CI before integration tests
- ✅ Fails build if drift detected
- ✅ Clear error message with decision options

---

### 4. ✅ Monthly Spike Test

**File:** `.github/workflows/integration-stress-test.yml` (updated)

**What it does:**
- Weekly rotation: `workers=2, 4, 6, 2` (normal stress test)
- Monthly spike: `workers=8` (catches weird issues)
- Runs first of month at 3 AM UTC

**Why it matters:**
- `maxWorkers=2` proves less than it feels like
- Parallel failures appear at 4+ workers
- Spike test catches pooling/search_path issues that don't show at 2/4/6
- Creates confidence curve at different scales

**Schedule:**
- **Weekly**: Monday 2 AM UTC (rotation: 2, 4, 6, 2)
- **Monthly**: 1st of month 3 AM UTC (spike: 8 workers)

---

### 5. ✅ Production-Grade Protection for db-reset.ts

**Files:**
- `.github/CODEOWNERS` - Code owners for critical files
- `.github/pull_request_template.md` - Changelog requirement

**What it does:**
- ✅ `db-reset.ts` requires review from `@strata-noble/security-team`
- ✅ PR template requires changelog entry for `db-reset.ts` changes
- ✅ Mandatory review before merge
- ✅ Documents impact and testing

**Why it matters:**
- `db-reset.ts` is the closest thing to a database detonator
- One mistake can wipe test data (or worse)
- Code owners ensure experts review changes
- Changelog forces conscious documentation

**Protected files:**
- `apps/website/src/lib/test/db-reset.ts`
- `apps/website/src/lib/test/integration/index.ts`
- `scripts/check-secrets.mjs`
- `scripts/check-table-drift.mjs`
- `supabase/migrations/`

---

## The Complete Protection Stack

### Layer 1: Foundation
- Production-safe `testReset()`
- Jest config (unit vs integration)
- CI always runs integration tests
- ESLint rules block raw cleanup

### Layer 2: Validation
- Integration contract test
- Hard reset in CI
- Migration validation
- Unit test boundaries

### Layer 3: Fort Knox
- Integration harness (one true door)
- Test metrics (prevent self-deception)
- Canary protection (validate correct DB)
- Weekly stress tests (catch drift)
- One-command bootstrap

### Layer 4: Final Hardening
- Secret scanning (pre-commit + CI)
- Log masking verification
- Nuclear button prevention test
- Metrics refinements
- Stress test worker rotation
- Explicit table enumeration
- One-screen documentation

### Layer 5: Last Realistic Failure Modes ← NEW
- ✅ Expanded secret scanning (JWT, anon keys, API keys)
- ✅ Hermetic nuclear button test (no env contamination)
- ✅ Table drift detection (forces conscious decisions)
- ✅ Monthly spike test (catches weird issues)
- ✅ Production-grade protection (code owners, changelog)

---

## Maintenance Rules

### For db-reset.ts Changes

**REQUIRED:**
1. Code owner review (`@strata-noble/security-team`)
2. Changelog entry in PR description
3. Impact documentation
4. Testing description

**Why:** This file is a database detonator. Treat it like production code.

### For New Tables

**REQUIRED:**
1. Add to reset list in `db-reset.ts` (if test data)
2. OR add to `PROTECTED_TABLES` in `check-table-drift.mjs` (if protected)
3. OR document schema isolation strategy (if isolated)

**Enforcement:** CI check fails if unaccounted for.

### For Secret Rotation

**REQUIRED:**
1. Generate new key in Supabase dashboard
2. Update environment variables (local, CI, dev machines)
3. Verify old key is revoked
4. Check git history: `node scripts/check-secrets.mjs`

**When:** Monthly, or immediately if exposed.

---

## The Terrarium Analogy

> "Your system is a terrarium with a self-locking lid—beautiful, controlled, and slightly unsettling when you remember it's alive."

**What this means:**
- The system monitors itself (immune system)
- It prevents its own failures (self-locking lid)
- It's beautiful and controlled (well-designed)
- It's slightly unsettling (complex, but necessary)
- It's alive (evolves, needs maintenance)

**What we've built:**
- Self-monitoring (metrics, stress tests, drift detection)
- Self-protecting (secret scanning, nuclear button test, canary)
- Self-documenting (one-screen doc, changelog requirements)
- Self-maintaining (table drift forces decisions, code owners ensure quality)

---

## Summary

✅ **Expanded secret scanning**: JWT patterns, anon keys, API keys  
✅ **Hermetic nuclear test**: No env contamination  
✅ **Table drift detection**: Forces conscious decisions  
✅ **Monthly spike test**: Catches weird issues at scale  
✅ **Production-grade protection**: Code owners, changelog, mandatory review  

**The infrastructure is now truly bulletproof.** 🎯

The last realistic failure modes are addressed:
- Secret scanning covers all patterns
- Nuclear test is hermetic
- Table drift is detected and forced
- Spike test catches scale issues
- Critical files are production-grade protected

The system is a terrarium with a self-locking lid. It's beautiful, controlled, and slightly unsettling—but that's exactly what you want for a database detonator.
