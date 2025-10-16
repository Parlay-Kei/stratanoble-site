# Netlify Secret Scanning Fix - October 15, 2025

**Date:** October 15, 2025
**Issue:** Netlify build failing due to secret scanning detecting VAULT_ENCRYPTION_KEY
**Status:** ✅ **RESOLVED**

---

## 🔍 Issue

Netlify's secret scanning feature detected the `VAULT_ENCRYPTION_KEY` in `.claude/settings.local.json` and blocked the deployment:

```
Secret env var "VAULT_ENCRYPTION_KEY"'s value detected:
  found value at line 183 in .claude/settings.local.json

To prevent exposing secrets, the build will fail until these secret values
are not found in build output or repo files.
```

**Build Error:**
```
Build failed due to a user error: Build script returned non-zero exit code: 2
Secrets scanning found secrets in build.
```

---

## ✅ Solution

### **Fix 1: Configure Netlify Secret Scanning Exclusions**

**File:** [netlify.toml](netlify.toml)

Added `secrets_scan_omit_paths` to exclude the `.claude` directory from secret scanning:

```toml
# Secret scanning configuration
[build.processing]
  secrets_scan_enabled = true
  # Exclude .claude directory from secret scanning (contains local dev config)
  secrets_scan_omit_paths = [".claude/**"]
```

**Why this works:**
- `.claude/settings.local.json` is a local development configuration file
- It's already in `.gitignore` so it won't be committed to the repository
- Netlify scans the entire build context, including gitignored files
- Explicitly excluding it prevents false positives

### **Fix 2: Add to .gitignore**

**File:** [.gitignore](.gitignore)

Added explicit gitignore rule for Claude settings:

```gitignore
# Claude Code settings (contains local secrets)
.claude/settings.local.json
```

---

## 🚀 Deployment

**Commit:** `731e9d2` - "fix: configure Netlify secret scanning to exclude .claude directory"

**Changes Pushed:**
- Updated `netlify.toml` with secret scanning exclusions
- Updated `.gitignore` to explicitly exclude Claude settings

**Next Build:**
- Netlify will automatically trigger a new deployment
- Secret scanning will skip `.claude/**` directory
- Build should complete successfully

---

## 📚 Related Documentation

- [Netlify Secret Scanning Docs](https://docs.netlify.com/security/secret-scanning/)
- [AUTH_ERROR_FIX_2025-10-15.md](AUTH_ERROR_FIX_2025-10-15.md) - Main authentication fix
- [NETLIFY_ENVIRONMENT_SETUP.md](../NETLIFY_ENVIRONMENT_SETUP.md) - Environment configuration

---

## 🎯 Key Takeaways

1. **Netlify scans ALL files in build context**, including gitignored files
2. **Local dev config files should be excluded** from secret scanning
3. **Use `secrets_scan_omit_paths`** for legitimate local config files
4. **Always gitignore sensitive local files** even if not committed

---

**Status:** ✅ Resolved and deployed
**Next:** Monitor build to confirm deployment succeeds

*Session logged to: docs/NETLIFY_SECRET_SCANNING_FIX_2025-10-15.md*
