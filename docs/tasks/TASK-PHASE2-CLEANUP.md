# TASK: Phase 2 — Post-1D Cleanup & Merge

**Branch:** `feature/site-revamp-phase-2-cleanup`  
**Base:** `feature/site-revamp-phase-1d` (commit `be07313`)  
**Priority:** Do this before any new feature work  

---

## 2A — Merge 1D → main

**Goal:** Get the full Phase 1 stack live on production.

### Steps

1. Checkout `main`, pull latest.
2. Merge `feature/site-revamp-phase-1d` into `main`:
   ```bash
   cd C:\Dev\10_products\StrataNoble
   git checkout main
   git pull origin main
   git merge feature/site-revamp-phase-1d --no-ff -m "merge: Phase 1A-1D site revamp — new IA, offerings data layer, service/q-suite/achievery pages"
   ```
3. Run build verification:
   ```bash
   cd apps/website && npm run build
   ```
4. Push to trigger Vercel deploy:
   ```bash
   git push origin main
   ```
5. Verify production at https://stratanoble.com after deploy completes:
   - Homepage renders (`/`)
   - `/services` renders with OfferLadder, DeliveryProcess
   - `/q-suite` renders with ModuleShowcase, QSuitePricing
   - `/achievery` renders with AchieveryPricing, AchieveryIAP
   - `/proof` renders stub ("Coming soon")
   - SiteNav shows correct IA: Services | Q SUITE | ACHIEVERY | About | Proof | Contact
   - Mobile hamburger menu works, shows "Free Pipeline Diagnostic" CTA

### Validation
- `npm run build` exit 0
- All 5 marketing routes return 200
- SiteNav IA matches: Services, Q SUITE, ACHIEVERY, About, Proof, Contact

---

## 2B — Dead Code Removal

**Goal:** Remove header components and deprecated files that are no longer imported by any active route.

### Files to DELETE

These are confirmed unused — `SiteNav` (via `SiteShell`) is the sole header for all `(marketing)` routes; dashboard has its own inline nav; no other layout imports these:

```
src/components/HeaderFixed.tsx
src/components/HeaderSimple.tsx
src/components/Header.tsx
```

**Pre-delete verification (agent MUST confirm before deleting):**
Run a grep to triple-check no active imports exist:
```bash
cd C:\Dev\10_products\StrataNoble\apps\website
grep -rn "HeaderFixed\|HeaderSimple\|from.*['\"].*Header['\"]" src/app/ src/components/site/ src/components/homepage/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | grep -v "_deprecated" | grep -v "archive" | grep -v "backup"
```
- If results show ANY active imports → do NOT delete; flag for manual review.
- If clean → proceed with deletion.

### Directories to DELETE

These contain only superseded components with zero active imports:

```
src/components/_deprecated/    (5 files: BuiltInPublicSection, LazyLoadedSections, PrinciplesSection, RevampedHero, WhatWeInstallSection)
src/components/archive/        (2 files: HeroSection, MissionSection)
src/components/backup/         (6 files: CompactHeroSection, CtaSection, MarketRealitySection, MissionSection, page.tsx, UrgencyBar)
```

**Pre-delete verification:**
```bash
grep -rn "from.*_deprecated\|from.*archive\|from.*backup" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```
- If results show ANY active imports → do NOT delete that directory; flag for review.

### Feature flag cleanup

`src/lib/feature-flags.ts` — the `isRevampEnabled()` function is only consumed by `Header.tsx` (being deleted). After Header deletion:

1. Grep for remaining usage:
   ```bash
   grep -rn "isRevampEnabled\|NEXT_PUBLIC_REVAMP_ENABLED\|feature-flags" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
   ```
2. If no remaining imports → delete `src/lib/feature-flags.ts`
3. Remove `NEXT_PUBLIC_REVAMP_ENABLED` from `.env`, `.env.local`, `.env.example`, `.env.production` if present.

### Commit
```bash
git add -A
git commit -m "chore: remove dead headers, deprecated dirs, feature-flags — SiteNav is sole nav"
```

### Validation
- `npm run build` exit 0
- No `HeaderFixed`, `HeaderSimple`, `Header` imports in build output
- All marketing routes still render correctly

---

## 2C — Revamp Components Audit

**Goal:** Determine which `components/revamp/` files are still active vs. superseded.

### Known active
- `LeadLeakCheckSection` — imported in `(marketing)/page.tsx` (homepage)

### Likely superseded (verify before removing)
These were the pre-Phase-1 revamp components. Phase 1A-1D replaced them with `homepage/` and page-level modules:

```
src/components/revamp/OperationalHero.tsx      → replaced by homepage/HomepageHero.tsx?
src/components/revamp/HowItWorksSection.tsx    → replaced by homepage/HowItWorks.tsx?
src/components/revamp/QSuiteSection.tsx        → replaced by q-suite/QSuiteHero.tsx + ModuleShowcase?
src/components/revamp/ProofSection.tsx         → replaced by homepage/EcosystemProof.tsx?
src/components/revamp/OffersSection.tsx        → replaced by services/OfferLadder.tsx?
src/components/revamp/OfferLadderSection.tsx   → replaced by services/OfferLadder.tsx?
src/components/revamp/CaseStudySection.tsx     → no equivalent yet (future /proof page?)
src/components/revamp/ProblemAreasSection.tsx  → no equivalent (cut from new IA?)
```

### Steps
1. Grep each component name against `src/app/` and `src/components/` (excluding `revamp/index.ts`):
   ```bash
   for comp in OperationalHero HowItWorksSection QSuiteSection ProofSection OffersSection OfferLadderSection CaseStudySection ProblemAreasSection; do
     echo "=== $comp ==="
     grep -rn "$comp" src/app/ src/components/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | grep -v "revamp/index.ts"
   done
   ```
2. Any component with zero active imports → delete from `revamp/` and remove from `revamp/index.ts`
3. Any component still imported → leave in place, document in commit message
4. If `revamp/` is fully emptied except `LeadLeakCheckSection` → move `LeadLeakCheckSection.tsx` to `src/components/homepage/` (where it logically belongs), update import in `(marketing)/page.tsx`, delete `revamp/` directory.

### Commit
```bash
git commit -m "chore: audit revamp/ — remove superseded, relocate LeadLeakCheckSection"
```

### Validation
- `npm run build` exit 0
- Homepage still renders `LeadLeakCheckSection`

---

## 2D — Lint & Build Health (Optional but recommended)

**Goal:** Retire `--no-verify` and establish clean builds.

### Steps
1. Run full lint:
   ```bash
   cd apps/website
   npx eslint src/ --ext .ts,.tsx --max-warnings 0
   ```
2. Document warnings/errors. Categorize:
   - **Blocking:** Type errors, missing imports → fix immediately
   - **Noise:** Unused vars, any-type warnings → fix or suppress with targeted eslint-disable
3. Run Jest (if configured):
   ```bash
   npx jest --passWithNoTests
   ```
   - If Jest roots config is broken, either fix `jest.config.mjs` or add a `// TODO: fix Jest config` and move on.
4. Run `npm audit`:
   ```bash
   npm audit
   ```
   - Document critical/high vulns. Fix what's fixable via `npm audit fix`. Flag anything requiring major version bumps.

### Commit
```bash
git commit -m "chore: lint cleanup, retire --no-verify"
```

### Validation
- `npm run build` exit 0
- `git commit` succeeds WITHOUT `--no-verify`

---

## Execution Order

```
2A (merge + deploy) → 2B (dead code) → 2C (revamp audit) → 2D (lint health)
```

Each step is independently committable. Do not combine into one commit.

## NOT in scope
- `/proof` page build (blocked by truth gate — needs real Q Suite data)
- New feature pages
- Stripe integration for offerings.ts
- ACHIEVERY app/platform work
