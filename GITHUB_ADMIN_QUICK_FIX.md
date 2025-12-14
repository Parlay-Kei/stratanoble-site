# GitHub Admin - Quick Fix Instructions
**Date:** 2025-12-14
**Issue:** CI Pipeline Failing - ESLint Version Conflict

## Immediate Action Required

Your CI pipeline is failing because ESLint 9.x is incompatible with the installed plugins.

### Root Cause
```json
// apps/website/package.json line 117
"eslint": "^9.30.1"  // ❌ WRONG - plugins need 8.x
```

All ESLint plugins (@typescript-eslint, eslint-plugin-react, etc.) require ESLint 8.x.

---

## Quick Fix (5 minutes)

### Step 1: Downgrade ESLint
```bash
cd c:\Dev\StrataNoble\apps\website
npm install --save-dev eslint@8.57.0
```

This will update `package.json` line 117 to:
```json
"eslint": "^8.57.0"  // ✅ Correct - compatible with plugins
```

### Step 2: Update Lockfile
```bash
cd c:\Dev\StrataNoble
npm install --legacy-peer-deps
```

### Step 3: Verify Fix
```bash
cd apps\website
npm run lint
```

If this succeeds with only warnings (not errors), the fix worked!

### Step 4: Commit the Fix
```bash
cd c:\Dev\StrataNoble
git add apps/website/package.json package-lock.json
git commit -m "fix(ci): downgrade ESLint to v8.57.0 for plugin compatibility

All ESLint plugins require ESLint 8.x, but v9.30.1 was installed causing
CI pipeline failures. Downgrading to v8.57.0 resolves the conflict.

- Fix: apps/website/package.json - eslint 9.30.1 → 8.57.0
- Update: package-lock.json for dependency tree

This unblocks CI and allows merging PRs. Migration to ESLint 9.x flat
config should be done separately after Next.js 16 migration.

Fixes CI run failures:
- Run 20203068764 (failed 1m 9s)
- Run 20202998378 (failed 1m 13s)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Step 5: Push and Verify
```bash
git push origin main
```

Then watch the CI run:
```bash
gh run watch
```

---

## Expected Results

### Before Fix
```
npm error code ELSPROBLEMS
npm error invalid: eslint@8.57.0
```

### After Fix
```
✅ 191 warnings (style issues - not blocking)
✅ Build succeeds
✅ CI passes
```

---

## Next Steps (After CI Passes)

1. **Fix Lint Warnings** (optional, improves code quality):
   ```bash
   cd apps\website
   npm run lint:fix
   ```

2. **Commit Current Refactoring Work**:
   - Follow instructions in GITHUB_ADMIN_REPORT_2025-12-14.md
   - Create feature branch: `fix/next-15-static-generation`
   - Commit all the client component wrapper changes
   - Create PR for review

3. **Review Dependabot PRs**:
   ```bash
   gh pr list
   gh pr view 20  # actions/checkout v4 → v6
   gh pr view 19  # actions/upload-artifact v4 → v5
   gh pr view 18  # actions/setup-node v4 → v6
   ```

4. **Plan ESLint 9 Migration** (separate PR, after Next.js 16):
   ```bash
   # Future work - not now
   npx @next/codemod@canary next-lint-to-eslint-cli .
   ```

---

## Why Not Upgrade to ESLint 9?

**Short Answer:** Too risky right now, better as separate effort.

**Long Answer:**
- Next.js 15 uses deprecated `next lint` command
- Next.js 16 will require ESLint CLI migration
- ESLint 9 requires flat config (`eslint.config.js`)
- All plugins need to be migrated or replaced
- Current priority: Unblock CI and merge refactoring work

**Timeline:**
- Now: Fix CI with ESLint 8.x ⬅️ DO THIS
- Later: Migrate to Next.js 16 (when released)
- Then: Migrate to ESLint 9.x flat config

---

## Validation Checklist

Run these commands after the fix:

```bash
# ✅ ESLint version should be 8.57.0
cd apps/website
npm list eslint

# ✅ Lint should run with warnings only
npm run lint

# ✅ Build should succeed
npm run build

# ✅ Type check should pass
npm run type-check
```

Expected output:
```
eslint@8.57.0
✔ No ESLint errors found
✔ Compiled successfully
✔ No type errors
```

---

## If Something Goes Wrong

### Problem: npm install fails
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps
```

### Problem: Still getting ESLint errors
```bash
# Clear node_modules and reinstall
cd apps/website
rm -rf node_modules
rm -rf ../../node_modules
cd ../..
npm install --legacy-peer-deps
```

### Problem: CI still fails after push
```bash
# Check the specific error
gh run view --log-failed
```

Then check GITHUB_ADMIN_REPORT_2025-12-14.md for debugging steps.

---

**Time to Fix:** ~5 minutes
**Impact:** Unblocks CI, enables PR merging
**Risk:** Very low (reverting to known-good ESLint version)
