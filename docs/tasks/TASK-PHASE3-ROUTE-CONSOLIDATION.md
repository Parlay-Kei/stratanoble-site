# TASK: Phase 3 — Route Consolidation & Legacy Cleanup

**Branch:** `feature/site-revamp-phase-3-routes`  
**Base:** `main` (after Phase 2 cleanup PR is merged)  
**Context:** Phase 1 established the new IA (Services, Q SUITE, ACHIEVERY, About, Proof, Contact). Phase 2 cleaned dead headers, deprecated dirs, and the revamp/ barrel. Phase 3 resolves the split between old routes and new routes so visitors see one coherent site regardless of entry point.

---

## Current State

### New IA routes (inside `(marketing)` group, wrapped by `SiteShell`)
```
/              → homepage (HomepageHero, ThreeSurfaces, HowItWorks, EcosystemProof, LeadLeakCheckSection, HomepageCTA)
/services      → ServicesHero, OfferLadder, DeliveryProcess
/q-suite       → QSuiteHero, ModuleShowcase, QSuitePricing
/achievery     → AchieveryHero, AchieveryPricing, AchieveryIAP
/proof         → stub ("Coming soon")
/about         → full page (pre-Phase-1, needs link audit)
/contact       → full page (pre-Phase-1, needs link audit)
/how-it-works  → full page (pre-Phase-1, needs link audit)
/lead-rescue   → full page with LeadRescueForm, LeadLeakCalculator, ReceiptsIncluded
/pipeline-buildout → full page with PipelineBuildoutApplicationForm
/privacy, /terms, /cookies, /accessibility → legal pages
/tools, /research → unknown status (check if content exists)
```

### Legacy routes (outside `(marketing)` group, independently wrapped)
```
/solutions           → SolutionsPageClient (has own layout.tsx with SiteShell)
/solutions/consultants, /home-services, /real-estate, /appointment-businesses → VerticalSolutionPageClient
/platform            → PlatformPageClient (has own layout.tsx with SiteShell)
/pricing             → redirect to /services (already handled)
```

### App/platform routes (NOT marketing — leave alone)
```
/achievery/auth      → ACHIEVERY auth flow
/achievery-early-access, /achievery-preview → ACHIEVERY pre-launch
/admin, /admin-login → admin panel
/dashboard           → analytics dashboard (own layout, own nav)
/vault               → Q-VAULT interface
/checkout            → Stripe checkout flow
/auth                → auth flow
/cold-calling, /dnc, /voice-test → calling infrastructure
/discovery, /early-access, /get-started, /schedule → intake/onboarding flows
/campaigns, /studio, /transcripts, /workshops → platform features
/success, /thanks    → post-action confirmation pages
/403, /test          → utility pages
```

---

## 3A — Redirect Legacy Marketing Routes

**Goal:** `/solutions` and `/platform` still render but they're not in the nav, not in the footer, and represent an old IA. Visitors arriving from cached Google results, old bookmarks, or backlinks should land somewhere useful — not a dead-end with outdated content.

**Decision:** Redirect, don't delete yet. The content in `/solutions` and `/platform` is high quality and may be partially reusable. But having two versions of "here's what we do" confuses visitors and dilutes SEO.

### Steps

1. **`/platform` → `/q-suite`** (direct replacement — same content, better page)

   Replace `src/app/platform/page.tsx`:
   ```tsx
   import { redirect } from 'next/navigation';
   export default function PlatformPage() {
     redirect('/q-suite');
   }
   ```
   Delete: `src/app/platform/PlatformPageClient.tsx`, `src/app/platform/layout.tsx`

2. **`/solutions` → `/services`** (the new IA equivalent of the solutions overview)

   Replace `src/app/solutions/page.tsx`:
   ```tsx
   import { redirect } from 'next/navigation';
   export default function SolutionsPage() {
     redirect('/services');
   }
   ```
   Delete: `src/app/solutions/SolutionsPageClient.tsx`, `src/app/solutions/layout.tsx`

3. **Vertical pages decision:** `/solutions/consultants`, `/solutions/home-services`, `/solutions/real-estate`, `/solutions/appointment-businesses` are well-built vertical landing pages with real content. They are NOT duplicated in the new IA. Two options:

   **Option A (recommended):** Keep them alive for now but move them into the `(marketing)` route group so they get SiteShell. They already have `SiteShell` via their parent layout, but that parent layout is getting deleted in step 2. Create a new layout:

   ```
   src/app/(marketing)/solutions/consultants/page.tsx
   src/app/(marketing)/solutions/home-services/page.tsx
   src/app/(marketing)/solutions/real-estate/page.tsx
   src/app/(marketing)/solutions/appointment-businesses/page.tsx
   ```

   Each page imports `VerticalSolutionPageClient` with the appropriate slug. Move `verticalContent.ts` and `VerticalSolutionPageClient.tsx` into the new location.

   **Option B (faster):** Redirect all verticals to `/services` and archive the content for later use.

   **Agent: implement Option A unless Steve explicitly says Option B.**

4. **`/pricing`** — already redirects to `/services`. Leave as-is.

5. **`CaseStudySection` dependency:** `SolutionsPageClient` (being deleted) imports `CaseStudySection` from `revamp/`. After `SolutionsPageClient` deletion, check if anything else imports `CaseStudySection`:
   ```bash
   grep -rn "CaseStudySection" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | grep -v "revamp/index.ts"
   ```
   - If only `SolutionsPageClient` imported it → delete `src/components/revamp/CaseStudySection.tsx` and `src/components/revamp/index.ts`, then delete `src/components/revamp/` directory.
   - If verticals also import it (check `VerticalSolutionPageClient.tsx`) → keep it, move to a shared location if relocating verticals.

### Commit
```bash
git commit -m "feat: redirect /solutions → /services, /platform → /q-suite, relocate verticals to (marketing)"
```

### Validation
- `npm run build` exit 0
- Browser: `/solutions` redirects to `/services`
- Browser: `/platform` redirects to `/q-suite`
- Browser: `/solutions/consultants` renders with SiteNav and SiteFooter
- No broken imports

---

## 3B — Loose Component Root Audit

**Goal:** The `src/components/` root has ~30 loose `.tsx` files. Many are likely dead (superseded by Phase 1 modules). Identify and remove.

### Suspected dead (verify each with grep before deleting)

```
CompactHeroSection.tsx       — likely replaced by homepage/HomepageHero
HeroSection.tsx              — likely replaced by homepage/HomepageHero
HeroSectionAligned.tsx       — likely replaced by homepage/HomepageHero
HeroSectionOptimized.tsx     — likely replaced by homepage/HomepageHero
MissionSection.tsx           — likely replaced (was in archive/ too)
MarketRealitySection.tsx     — likely replaced (was in backup/ too)
InnovativeServicesGrid.tsx   — likely replaced by services/OfferLadder
ServicesSection.tsx          — likely replaced by services/ module
WhyStrataNobleGrid.tsx       — likely replaced by homepage/ThreeSurfaces or EcosystemProof
WhatWeDoFlow.tsx             — likely replaced by homepage/HowItWorks
WhatIsStrataNoble.tsx        — likely replaced by /about page
TransformationFlow.tsx       — likely replaced
CtaSection.tsx               — likely replaced by homepage/HomepageCTA
UrgencyBar.tsx               — likely replaced (was in backup/ too)
OpportunityInsightSection.tsx— unknown
DocumentationAuthority.tsx   — unknown
EnterpriseDevelopmentMethodology.tsx — unknown
TechnologyStack.tsx          — unknown
ClientLogoStrip.tsx          — unknown
ArchitectureDiagram.tsx      — unknown
Footer.tsx                   — superseded by SiteFooter (confirmed: "Legacy Footer" comment)
```

### Suspected alive (likely still imported)
```
Logo.tsx                     — used everywhere
Analytics.tsx                — used in root layout
ErrorBoundary.tsx            — likely used
SmartConsultingBar.tsx       — imported by MarketingHomeShell
NoupeChat.tsx                — imported by NoupeChatWrapper
NoupeChatWrapper.tsx         — imported by SiteShell
CalendlyModal.tsx            — may be imported by contact/schedule pages
CalendlyWidget.tsx           — may be imported by contact/schedule pages
CheckoutModal.tsx            — may be imported by checkout flow
SubscriptionManager.tsx      — may be imported by platform routes
ContactFormClient.tsx        — may be imported by contact page
ContactPageClient.tsx        — may be imported by contact page
OfferingCard.tsx             — may be imported by new pages
LeadLeakCalculator.tsx       — imported by /lead-rescue page
ReceiptsIncluded.tsx         — imported by /lead-rescue and /pipeline-buildout
OptimizedImage.tsx           — utility, may be used anywhere
RouteGuard.tsx               — may be used in auth flows
AccessDenied.tsx             — may be used in auth flows
LazyComponents.tsx           — may be used for code splitting
MetricsEmptyState.tsx        — may be used in dashboard
WaitlistFallback.tsx         — may be used in early-access
WaitlistModal.tsx            — may be used in early-access
FounderCard.tsx              — may be used in /about
TestimonialCard.tsx          — unknown
WorkshopCard.tsx             — unknown
```

### Steps

1. For each file in the "suspected dead" list, run:
   ```bash
   COMPONENT="CompactHeroSection"  # repeat for each
   grep -rn "$COMPONENT" src/app/ src/components/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
   ```

2. If zero imports outside its own file → delete.

3. If imported → leave in place, note which page/component uses it.

4. For the "suspected alive" list, confirm imports exist. If not → move to dead list.

5. After all deletions, also delete `Footer.tsx` (confirmed superseded by `SiteFooter`).

### Commit
```bash
git commit -m "chore: remove dead loose components from components/ root"
```

### Validation
- `npm run build` exit 0

---

## 3C — Content Link Audit

**Goal:** Pages built before Phase 1 (`/about`, `/contact`, `/how-it-works`, `/lead-rescue`, `/pipeline-buildout`) may contain internal links to old routes (`/platform`, `/solutions`, `/discovery`) or CTAs that don't match the new IA.

### Steps

1. Grep for all internal links across `(marketing)` pages:
   ```bash
   grep -rn "href=\"/" src/app/\(marketing\)/ --include="*.tsx" | grep -v "node_modules" | sort
   ```

2. Flag any links pointing to:
   - `/platform` → should be `/q-suite`
   - `/solutions` → should be `/services`
   - `/discovery` → evaluate: is this still a valid route? If not, redirect or change link
   - Any route not in the new IA that doesn't have a redirect

3. Fix links in-place. Do NOT rewrite page content — only update `href` values.

4. Check `src/app/layout.tsx` structured data for stale references:
   - `organizationSchema.services` references "48-Hour Lead Rescue" and "21-Day Pipeline Buildout" — these are correct
   - Verify no references to `/platform` or `/solutions`

### Specific known issues from code review

- `/about` page links to `/lead-rescue` and `/pipeline-buildout` (correct) and `/how-it-works` (correct)
- `/contact` page links to `/lead-rescue` and `/pipeline-buildout` (correct)
- `/how-it-works` page links to `/lead-rescue`, `/pipeline-buildout`, `/contact` (correct)
- `/lead-rescue` page links to `/tools/sample-receipt` — verify this route exists
- `SiteFooter` links are already updated to new IA (confirmed)
- `SiteNav` links are already updated to new IA (confirmed)

### Commit
```bash
git commit -m "fix: update internal links to match new IA routes"
```

### Validation
- `npm run build` exit 0
- Grep confirms no remaining links to `/platform` or `/solutions` (except redirect files)

---

## 3D — Verify `/tools` and `/research` Routes

**Goal:** These are in the `(marketing)` group but their status is unknown. Check if they have real content or are stubs.

### Steps
1. Read `src/app/(marketing)/tools/page.tsx` and `src/app/(marketing)/research/page.tsx`
2. If stub or empty → either delete or convert to "Coming soon" with proper metadata
3. If `/lead-rescue` links to `/tools/sample-receipt` and that route doesn't exist → remove or stub that link
4. Document status in commit message

### Commit
```bash
git commit -m "chore: audit /tools and /research route status"
```

---

## Execution Order

```
3A (redirects + vertical relocation) → 3B (component audit) → 3C (link audit) → 3D (tools/research check)
```

Each step is independently committable. 3A is the highest priority — it resolves the split-brain problem where visitors see different sites depending on which URL they hit.

## NOT in scope
- `/proof` page build (truth gate)
- Rewriting `/about`, `/contact`, `/how-it-works` content (Phase 5 if needed)
- Any app/platform route changes (`/dashboard`, `/vault`, `/admin`, etc.)
- ACHIEVERY platform work
- Q Suite deployment work
- `--no-verify` / audit cleanup (separate ticket)
