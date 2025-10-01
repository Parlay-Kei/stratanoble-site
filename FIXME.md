# FIXME - Critical Issues & Action Items

**Last Updated:** October 1, 2025 - 22:10

## 🚨 CRITICAL - Website Down (npm Monorepo Architecture Issue)

**Priority:** P0 - BLOCKING
**Status:** ✅ ROOT CAUSE IDENTIFIED - Solution Ready
**Affected:** `apps/website` - Marketing site and ACHIEVERY preview pages
**Estimated Fix Time:** 1.5 hours

### Problem
Website returns 500 errors due to **npm's fundamental inability to properly hoist React in complex monorepos**. Multiple React instances exist despite all attempted fixes.

### Root Cause (After 4+ Hours Debugging)
Tested ALL combinations - ALL failed:
- ❌ React 19.1.1 + Next.js 15.5.2
- ❌ React 19.1.1 + Next.js 15.0.3
- ❌ React 18.3.1 + Next.js 15.0.3
- ❌ React 18.3.1 + Next.js 14.2.18
- ❌ Webpack resolve.alias
- ❌ transpilePackages configuration
- ❌ peerDependencies configuration

**Conclusion:** npm cannot solve this - need proper monorepo package manager

### Errors
```
TypeError: Cannot read properties of null (reading 'useContext')
Invalid hook call - You might have more than one copy of React
_reactdom.default.preload is not a function
```

### ✅ SOLUTION: Migrate to pnpm Workspaces

**📋 See Complete Implementation Plan:** [MONOREPO_MIGRATION_PLAN.md](MONOREPO_MIGRATION_PLAN.md)

**Option 1: pnpm Workspaces (RECOMMENDED - Proper Architecture Fix)**
```bash
# Revert to last working state
cd apps/website
git checkout HEAD~20 package.json
npm install react@^18.3.1 react-dom@^18.3.1 @types/react@^18.3.24 @types/react-dom@^18.3.7
cd ../../packages/ui
npm install react@^18.3.1 react-dom@^18.3.1 --save-peer
cd ../utils
npm install react@^18.3.1 --save-peer
cd ../../apps/website
rm -rf .next && npm run dev
```

**Option 2: Fix Monorepo Structure (PROPER FIX - Longer)**
1. Install pnpm globally: `npm install -g pnpm`
2. Convert to pnpm workspaces
3. Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```
4. Delete all `node_modules` and `package-lock.json`
5. Run `pnpm install` from root
6. Update scripts to use `pnpm`

**Option 3: Downgrade Next.js to 14.x**
```bash
cd apps/website
npm install next@^14.2.0 eslint-config-next@^14.2.0
```

### Files to Revert
- `apps/website/package.json` - React version
- `apps/website/next.config.js` - Remove webpack aliases if reverting
- `packages/ui/package.json` - React peerDependencies
- `packages/utils/package.json` - React peerDependencies

---

## TODO - High Priority

### 1. Test Website After React Fix
**Priority:** P0
**Depends On:** React issue resolution
- [ ] Verify homepage loads (`localhost:3000`)
- [ ] Test ACHIEVERY preview page (`/achievery-preview`)
- [ ] Verify all marketing pages load correctly
- [ ] Check navigation and Header component
- [ ] Test responsive design on mobile

### 2. Deploy ACHIEVERY Preview Page
**Priority:** P1
**Blocked By:** Website React issue
- [ ] Test preview page locally after fix
- [ ] Run production build: `npm run build`
- [ ] Deploy to Netlify/Vercel
- [ ] Update production environment variables
- [ ] Verify production URLs work

### 3. Complete Debugging Documentation
**Priority:** P2
- [ ] Archive today's debugging session to `docs/development-history/`
- [ ] Document React 19 compatibility findings
- [ ] Create runbook for monorepo React issues
- [ ] Update `.env.example` if needed

---

## TODO - Medium Priority

### 4. Mobile App Navigation
**Priority:** P2
**Estimated Time:** 2-3 hours
- [ ] Install React Navigation dependencies
- [ ] Configure Supabase for mobile
- [ ] Test authentication flow
- [ ] Deploy to Expo Go for testing

### 5. A/B Testing Framework
**Priority:** P2
**Estimated Time:** 4-6 hours
- [ ] Research A/B testing tools (Posthog, Split.io, etc.)
- [ ] Implement conversion tracking
- [ ] Set up analytics dashboard
- [ ] Test with ACHIEVERY preview page

### 6. Code Quality Improvements
**Priority:** P3
- [ ] Fix TypeScript errors (currently ignored in build)
- [ ] Fix ESLint errors (currently ignored in build)
- [ ] Remove unused dependencies
- [ ] Update outdated packages

---

## DONE - Completed Today

- ✅ ACHIEVERY Platform fully operational at `localhost:3001`
- ✅ All platform dependencies resolved
- ✅ Platform routes verified (auth, dashboard, onboarding)
- ✅ Middleware authentication working
- ✅ Debugging infrastructure added (`npm run dev:debug`)
- ✅ Comprehensive debugging documentation created

---

## Notes

### Why React 19 Failed
The monorepo architecture with shared packages creates a fundamental module resolution problem:
- Each package has its own `node_modules` even with peerDependencies
- Webpack cannot dedupe React across package boundaries in this setup
- Next.js App Router Server Components require a single React instance
- npm workspaces don't properly hoist React to root level

### Alternative: Duplicate Shared Code
If monorepo continues to cause issues, consider:
- Copy shared UI components directly into each app
- Use code generation instead of shared packages
- Accept some duplication for reliability

### Long-term: Migrate to Turborepo
For proper monorepo management:
- Better caching
- Proper dependency hoisting
- Parallel task execution
- Built-in dev tools
