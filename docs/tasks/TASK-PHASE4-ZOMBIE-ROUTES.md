# TASK: Phase 4 — Zombie Routes, Orphaned Page Clients & Component Root Final Pass

**Branch:** `feature/site-revamp-phase-4-zombies`  
**Base:** `main` (after Phase 3 PR is merged)  
**Context:** Phase 3 redirected `/solutions` → `/services` and `/platform` → `/q-suite` in `next.config.js` and deleted those route directories. But the redirect pattern was already in use for many other routes — and those routes still have physical page files and client components on disk. They inflate the build, confuse developers, and create maintenance drag.

---

## Problem Statement

`next.config.js` has 301 redirects for 12 routes. Phase 3 cleaned 2 of them (solutions, platform). The remaining 10 still have route directories and page files on disk — the redirect fires at runtime, but the build still compiles these files, their client components still exist in `components/pages/`, and they pollute the route manifest.

Additionally, the `components/` root has several files confirmed unused by any active route.

---

## 4A — Delete Zombie Route Directories

These routes have 301 permanent redirects in `next.config.js`. The physical route files are unreachable at runtime. Delete the route directories and their contents.

### Confirmed zombies (redirect exists, route dir still on disk)

| Route dir | Redirect target | Confidence |
|-----------|----------------|------------|
| `src/app/discovery/` | `/contact` | 100% — redirect in next.config.js |
| `src/app/get-started/` | `/contact` | 100% — redirect in next.config.js |
| `src/app/schedule/` | `/contact` | 100% — redirect in next.config.js |
| `src/app/cold-calling/` | `/proof` | 100% — redirect in next.config.js |
| `src/app/workshops/` (+ `thank-you/` subdir) | `/proof` | 100% — redirect in next.config.js |
| `src/app/pricing/` | `/services` | 100% — redirect in next.config.js, page.tsx is also a code-level redirect |

### Steps
1. Delete each directory listed above.
2. Run `npm run build` to confirm no broken imports.

### Commit
```bash
git commit -m "chore: delete zombie route dirs already handled by next.config.js 301 redirects"
```

---

## 4B — Delete Orphaned Page Client Components

After 4A, the following `components/pages/` client components have no importing route:

| Component | Was used by | Status |
|-----------|------------|--------|
| `DiscoveryPageClient.tsx` | `src/app/discovery/` (deleted 4A) | Dead |
| `GetStartedPageClient.tsx` | `src/app/get-started/` (deleted 4A) | Dead |
| `SchedulePageClient.tsx` | `src/app/schedule/` (deleted 4A) | Dead |
| `ColdCallingPageClient.tsx` | `src/app/cold-calling/` (deleted 4A) | Dead |

### Pre-delete verification
For each, confirm no other file imports it:
```bash
for comp in DiscoveryPageClient GetStartedPageClient SchedulePageClient ColdCallingPageClient; do
  echo "=== $comp ==="
  grep -rn "$comp" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
done
```
Each should return only its own file definition. If any returns an active import → do NOT delete.

### Remaining page clients — keep (still have active routes)
| Component | Route | Status |
|-----------|-------|--------|
| `AchieveryAuthPageClient.tsx` | `/achievery/auth` | Active |
| `AuthAchieveryPageClient.tsx` | `/auth/achievery` or similar | Verify — may duplicate above |
| `AuthSigninPageClient.tsx` | `/auth/signin` | Active |
| `AuthSignupPageClient.tsx` | `/auth/signup` | Active |
| `AdminVaultPageClient.tsx` | `/admin` or `/vault/admin` | Active (platform) |
| `DashboardAnalyticsPageClient.tsx` | `/dashboard/analytics` | Active (platform) |
| `DncPageClient.tsx` | `/dnc` | Active (calling infra) |
| `EarlyAccessPageClient.tsx` | `/early-access` | Verify — no redirect, but is this still needed? |
| `SuccessPageClient.tsx` | `/success` | Active (post-action) |
| `ThanksPageClient.tsx` | `/thanks` | Active (post-action) |
| `VaultPageClient.tsx` | `/vault` | Active (platform) |
| `VoiceTestPageClient.tsx` | `/voice-test` | Active (calling infra) |

### Ambiguous — agent must verify
- `AuthAchieveryPageClient.tsx` vs `AchieveryAuthPageClient.tsx` — check if both have importing routes or if one is a duplicate
- `EarlyAccessPageClient.tsx` — `/early-access` has no redirect but also no nav link. If it's a general waitlist page superseded by `/achievery-early-access`, consider redirecting `/early-access` → `/achievery-early-access` and deleting this client.

### Commit
```bash
git commit -m "chore: delete orphaned page client components for redirected routes"
```

---

## 4C — Component Root Final Pass

### Confirmed dead (delete)

| File | Reason |
|------|--------|
| `ContactPageClient.tsx` | Old elaborate contact page with Calendly, form, mobile carousel. Current `(marketing)/contact/page.tsx` renders inline — does NOT import this component. |
| `CustomHead.tsx` | Structured data + meta tags. Superseded by `src/app/layout.tsx` which has its own `organizationSchema` and full `metadata` export. |
| `Footer.tsx` | If still present — confirmed superseded by `site/SiteFooter.tsx` in Phase 2. (May already be deleted — verify.) |

### Pre-delete verification for each
```bash
grep -rn "ContactPageClient" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
grep -rn "CustomHead" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
grep -rn "from.*['\"].*Footer['\"]" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | grep -v "SiteFooter"
```
- If any returns an active import outside the component's own file → do NOT delete.

### Verify alive — these should stay

| File | Why |
|------|-----|
| `Logo.tsx` | Used everywhere |
| `Analytics.tsx` | Root layout |
| `ErrorBoundary.tsx` | Error handling |
| `SmartConsultingBar.tsx` | MarketingHomeShell |
| `NoupeChat.tsx` | NoupeChatWrapper dependency |
| `NoupeChatWrapper.tsx` | SiteShell |
| `CalendlyModal.tsx` | Used by ContactPageClient — **but if ContactPageClient is deleted, verify CalendlyModal still has importers** |
| `CalendlyWidget.tsx` | Verify — may only be imported by deleted ContactPageClient |
| `ContactFormClient.tsx` | Verify — may only be imported by deleted ContactPageClient |
| `CheckoutModal.tsx` | Checkout flow |
| `OfferingCard.tsx` | Verify — may be superseded by OfferLadder |
| `LeadLeakCalculator.tsx` | `/lead-rescue` page |
| `ReceiptsIncluded.tsx` | `/lead-rescue` and `/pipeline-buildout` |
| `RouteGuard.tsx` | Auth flows |
| `AccessDenied.tsx` | Auth flows |
| `MetricsEmptyState.tsx` | Dashboard |
| `SubscriptionManager.tsx` | Checkout/subscription flow |
| `WaitlistFallback.tsx` | Verify — may be dead if early-access is deprecated |
| `WaitlistModal.tsx` | Verify — imported by WaitlistFallback |

### Cascade check after ContactPageClient deletion
`ContactPageClient.tsx` imports:
- `ContactFormClient` from `@/components/ContactFormClient`
- `CalendlyModal`, `useCalendlyModal` from `@/components/CalendlyModal`
- `Container` from `@/components/ui/container`
- `CTA_LABELS` from `@/lib/cta-labels`

After deleting `ContactPageClient`, check if `ContactFormClient`, `CalendlyModal`, and `CalendlyWidget` have any OTHER importers:
```bash
grep -rn "ContactFormClient\|CalendlyModal\|CalendlyWidget" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | grep -v "ContactPageClient"
```
If any of these have zero remaining imports → delete them too.

Similarly for `OfferingCard`:
```bash
grep -rn "OfferingCard" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```

And for `WaitlistFallback` / `WaitlistModal`:
```bash
grep -rn "WaitlistFallback\|WaitlistModal" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```

### Commit
```bash
git commit -m "chore: remove dead components from root — ContactPageClient, CustomHead, cascaded orphans"
```

### Validation
- `npm run build` exit 0

---

## 4D — Unlinked Route Audit

**Goal:** Identify routes that exist on disk but are not linked from any nav, footer, or marketing page. These are invisible to visitors but still compile and may contain stale content.

### Known unlinked routes (not in SiteNav, not in SiteFooter, no inbound links from marketing pages)

| Route | Type | Recommendation |
|-------|------|---------------|
| `/resources` | Marketing — resource downloads with dummy links | No redirect, no nav link. Either add to nav in a future phase, redirect to `/tools`, or delete. **Decision needed from Steve.** |
| `/studio` | Marketing — project showcase with hardcoded case studies | Overlaps with `/proof` (stubbed). Either redirect `/studio` → `/proof` or keep as a distinct "portfolio" page. **Decision needed from Steve.** |
| `/archive/technical-excellence` | Archive content | No redirect. Either delete or add redirect to relevant page. |
| `/archive/technology` | Archive content | No redirect. Either delete or add redirect to `/q-suite`. |
| `/early-access` | Waitlist page | Separate from `/achievery-early-access`. Either redirect to `/achievery-early-access` or keep as generic waitlist. **Decision needed from Steve.** |
| `/achievery-early-access` | ACHIEVERY-specific early access | Likely still needed. Keep. |
| `/achievery-preview` | Redirected to `/tools` | Redirect exists — but does `/tools` make sense as destination? **Verify.** |
| `/test` | Test/debug page | Should not be in production build. Delete or gate behind auth. |

### Steps
1. For each route above, check contents and determine:
   - Does it have real, unique content worth keeping?
   - Should it redirect somewhere in the new IA?
   - Should it be deleted?
2. For routes needing Steve's decision, leave them in place and document the question in the commit message.
3. For clear-cut cases (`/archive/*`, `/test`), delete or redirect.

### Redirects to add to `next.config.js` (if decided)
```js
{ source: '/studio', destination: '/proof', permanent: true },
{ source: '/resources', destination: '/tools', permanent: true },
{ source: '/early-access', destination: '/achievery-early-access', permanent: true },
{ source: '/archive/:path*', destination: '/', permanent: true },
```

### Commit
```bash
git commit -m "chore: audit unlinked routes, add redirects for archive/studio/resources"
```

---

## Execution Order

```
4A (zombie route dirs) → 4B (orphaned page clients) → 4C (component root final) → 4D (unlinked route audit)
```

4A and 4B are safe to execute without decisions. 4C requires cascade verification. 4D requires Steve's input on 3 routes.

## Decisions needed from Steve (4D)
1. `/resources` — redirect to `/tools`, keep as-is, or delete?
2. `/studio` — redirect to `/proof`, keep as portfolio page, or delete?
3. `/early-access` — redirect to `/achievery-early-access` or keep as generic waitlist?

## NOT in scope
- Platform/app routes (`/dashboard`, `/vault`, `/admin`, `/auth`, etc.) — these are functional, not marketing
- API routes (`/api/...`)
- Calling infrastructure routes (`/dnc`, `/voice-test`, `/campaigns`, `/transcripts`) — these are internal tools
- `/proof` page build (truth gate)
- Content alignment (that's Phase 5)
