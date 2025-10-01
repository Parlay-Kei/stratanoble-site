# Monorepo Migration Plan - pnpm Workspaces

**Created:** October 1, 2025
**Status:** Ready for Implementation
**Estimated Time:** 2-3 hours
**Risk Level:** Medium (requires testing after migration)

---

## Problem Analysis

### Root Cause
The current npm-based monorepo creates multiple React instances across packages, causing "Invalid hook call" errors:

```
apps/website/node_modules/react (v18.3.1)
packages/ui/node_modules/react (v18.3.1) ← DUPLICATE
packages/utils/node_modules/react (v18.3.1) ← DUPLICATE
```

**Why This Happens:**
- npm doesn't properly hoist peerDependencies to root
- Each package resolves React independently
- Webpack bundles multiple React instances
- Next.js App Router requires single React instance
- React hooks fail when multiple instances exist

### Failed Attempts (4+ hours debugging)
1. ❌ React 19.1.1 + Next.js 15.5.2
2. ❌ React 19.1.1 + Next.js 15.0.3
3. ❌ React 18.3.1 + Next.js 15.0.3
4. ❌ React 18.3.1 + Next.js 14.2.18
5. ❌ Webpack resolve.alias configuration
6. ❌ transpilePackages configuration
7. ❌ Moving React to peerDependencies

**Conclusion:** npm fundamentally cannot solve this in complex monorepos.

---

## Solution: pnpm Workspaces

### Why pnpm?
- **Proper Hoisting:** All shared dependencies go to root `node_modules`
- **Symlinks:** Packages reference single React instance via symlinks
- **Fast:** 2x faster installs than npm
- **Disk Efficient:** Uses content-addressable storage
- **Strict:** Prevents phantom dependencies

### Architecture Change
```
Before (npm):                    After (pnpm):
├── node_modules/               ├── node_modules/
├── apps/                       │   └── .pnpm/
│   ├── website/                │       └── [all packages]
│   │   └── node_modules/       ├── apps/
│   │       └── react ❌         │   ├── website/
│   └── platform/               │   │   └── node_modules/
│       └── node_modules/       │   │       └── react → ../../../node_modules/react ✅
└── packages/                   │   └── platform/
    ├── ui/                     │       └── node_modules/
    │   └── node_modules/       │           └── react → ../../../node_modules/react ✅
    │       └── react ❌         └── packages/
    └── utils/                      ├── ui/
        └── node_modules/           │   └── node_modules/
            └── react ❌             │       └── react → ../../../node_modules/react ✅
                                    └── utils/
                                        └── node_modules/
                                            └── react → ../../../node_modules/react ✅
```

---

## Implementation Plan

### Phase 1: Backup & Preparation (5 minutes)
```bash
# 1. Create git branch for safety
git checkout -b feature/pnpm-migration
git add .
git commit -m "Checkpoint before pnpm migration"

# 2. Backup current state
cp package.json package.json.npm.backup
cp package-lock.json package-lock.json.backup

# 3. Document current working state
npm list react react-dom --depth=0 > npm-versions-backup.txt
```

### Phase 2: Install pnpm (2 minutes)
```bash
# Install pnpm globally
npm install -g pnpm@latest

# Verify installation
pnpm --version  # Should show 8.x or 9.x
```

### Phase 3: Create Workspace Configuration (5 minutes)
Create `pnpm-workspace.yaml` at project root:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Update root `package.json`:
```json
{
  "name": "strata-noble-monorepo",
  "private": true,
  "scripts": {
    "dev:website": "pnpm --filter @strata-noble/website dev",
    "dev:platform": "pnpm --filter @strata-noble/platform dev",
    "build:website": "pnpm --filter @strata-noble/website build",
    "build:platform": "pnpm --filter @strata-noble/platform build",
    "build:packages": "pnpm --filter @strata-noble/ui build && pnpm --filter @strata-noble/utils build",
    "clean": "pnpm -r exec rm -rf node_modules .next dist",
    "install:all": "pnpm install"
  }
}
```

### Phase 4: Clean Existing Installation (10 minutes)
```bash
# Remove all node_modules and lock files
rm -rf node_modules
rm -rf apps/website/node_modules
rm -rf apps/platform/node_modules
rm -rf packages/ui/node_modules
rm -rf packages/utils/node_modules
rm -rf apps/achievery-mobile/node_modules

# Remove npm lock files
rm package-lock.json
rm apps/website/package-lock.json
rm apps/platform/package-lock.json

# Remove pnpm lock if exists
rm pnpm-lock.yaml

# Clean build artifacts
rm -rf apps/website/.next
rm -rf apps/platform/.next
rm -rf packages/ui/dist
rm -rf packages/utils/dist
```

### Phase 5: Install with pnpm (15 minutes)
```bash
# Install all dependencies with pnpm
pnpm install

# Verify React is in root only
pnpm list react --depth=0
# Should show: react 18.3.1 (from root)

# Build shared packages
pnpm --filter @strata-noble/utils build
pnpm --filter @strata-noble/ui build
```

### Phase 6: Update Package Scripts (10 minutes)
Update `apps/website/package.json`:
```json
{
  "scripts": {
    "dev": "pnpm exec cross-env PORT=3000 next dev",
    "build": "pnpm exec next build",
    "start": "pnpm exec next start"
  }
}
```

Update `apps/platform/package.json`:
```json
{
  "scripts": {
    "dev": "pnpm exec cross-env PORT=3001 next dev",
    "build": "pnpm exec next build",
    "start": "pnpm exec next start"
  }
}
```

### Phase 7: Test Everything (30 minutes)
```bash
# Test website
cd apps/website
rm -rf .next
pnpm dev

# In another terminal, test platform
cd apps/platform
rm -rf .next
pnpm dev

# Test builds
cd apps/website
pnpm build

cd apps/platform
pnpm build
```

### Phase 8: Verify & Document (10 minutes)
```bash
# Verify single React instance
pnpm why react
# Should show only root installation

# Check symlinks
ls -la apps/website/node_modules/react
# Should show symlink to root

# Document success
git add .
git commit -m "feat: migrate to pnpm workspaces - resolve React duplication issue"
```

---

## Expected Results

### Before (npm)
- ❌ Website: 500 errors
- ❌ Multiple React instances (3-4 copies)
- ❌ "Invalid hook call" errors
- ❌ `_reactdom.default.preload is not a function`

### After (pnpm)
- ✅ Website: Homepage loads successfully
- ✅ Single React instance at root
- ✅ All React hooks work correctly
- ✅ Proper module resolution
- ✅ Faster installs (~2x speed improvement)
- ✅ Reduced disk usage (~40% less space)

---

## Rollback Plan

If pnpm migration fails:
```bash
# Restore npm setup
git checkout main
git branch -D feature/pnpm-migration

# Reinstall with npm
rm -rf node_modules pnpm-lock.yaml
npm install

# Or restore from backup
cp package.json.npm.backup package.json
cp package-lock.json.backup package-lock.json
npm install
```

---

## Configuration Files to Create

### 1. `pnpm-workspace.yaml` (root)
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 2. `.npmrc` (root)
```
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

### 3. Update `.gitignore`
```
# pnpm
pnpm-lock.yaml
.pnpm-store/
node_modules/
```

---

## Benefits Beyond React Fix

1. **Performance:** 2x faster installs, parallel execution
2. **Disk Space:** 40% reduction via content-addressable storage
3. **Reliability:** Strict dependency resolution prevents bugs
4. **Modern:** Industry standard for monorepos (Next.js, Vue, etc.)
5. **Developer Experience:** Better error messages, faster feedback

---

## Alternative: If pnpm Fails

**Plan B - Duplicate Shared Code:**
If pnpm doesn't resolve the issue, we can:
1. Copy `packages/ui/src` → `apps/website/src/components/shared`
2. Copy `packages/utils/src` → `apps/website/src/lib/shared`
3. Remove packages from monorepo
4. Accept code duplication for stability

**Pros:**
- Guaranteed to work
- No monorepo complexity
- Simpler dependency management

**Cons:**
- Code duplication
- Manual sync between apps
- Larger bundle sizes

---

## Post-Migration Tasks

After successful migration:
1. Update CI/CD pipelines to use pnpm
2. Update README with pnpm commands
3. Train team on pnpm workflows
4. Document pnpm-specific commands
5. Update deployment scripts
6. Monitor bundle sizes

---

## Timeline

| Phase | Duration | Can Fail? |
|-------|----------|-----------|
| Backup | 5 min | No |
| Install pnpm | 2 min | No |
| Config files | 5 min | No |
| Clean install | 10 min | No |
| pnpm install | 15 min | Yes* |
| Update scripts | 10 min | No |
| Testing | 30 min | Yes* |
| Documentation | 10 min | No |
| **Total** | **~90 min** | |

*If fails, rollback and use Plan B

---

## Success Criteria

✅ Website loads at `http://localhost:3000`
✅ Homepage returns 200 OK (not 500)
✅ No "Invalid hook call" errors
✅ No "multiple React" warnings
✅ ACHIEVERY preview page works
✅ Header component renders correctly
✅ Navigation works properly
✅ Build succeeds without errors
✅ Platform still works at `localhost:3001`

---

## Notes

- pnpm is used by Next.js, Turborepo, Vue, Vite, etc.
- This is the proper solution, not a workaround
- Should have been pnpm from the start
- npm is not designed for complex monorepos
