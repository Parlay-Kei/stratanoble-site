# DEV TASK: Q Suite Internal Dogfood Rollout + Website Repositioning

**Mission ID:** `OCS-SN-INTERNAL-QSUITE-DOGFOOD-ROLLOUT-0001`  
**Priority:** P0  
**Codebase:** `C:\Dev\10_products\StrataNoble` (website) + `C:\Dev\10_products\Q SUITE` (modules)  
**Production:** StrataNoble.com  

---

## CONTEXT

StrataNoble sells operational infrastructure but does not yet run on its own flagship system (Q Suite). This creates a credibility gap. The fix is two-fold:

1. **Internal Dogfood** — StrataNoble operates on Q Suite modules (Q-CC, Q-ICMS, Q-ARI, Q-VAULT)
2. **Website Repositioning** — The site shifts from "we build pipelines" to "we run our business on this system and deploy it for clients"

The current site positions StrataNoble as a pipeline installation shop. The new positioning is: **operator-led digital infrastructure firm running on its own modular business OS.**

---

## CURRENT STATE ASSESSMENT

### StrataNoble Website (`apps/website`)
- **Stack:** Next.js 15, Tailwind, Framer Motion, Supabase, Stripe
- **Homepage:** `src/app/(marketing)/page.tsx` — RevampedHero → LeadLeakCheck → WhatWeInstall → Principles → BuiltInPublic
- **Current messaging:** "Lead-to-customer pipelines for service businesses" / "No branding. No website builds. Pipeline infrastructure only."
- **Service pages:** `/lead-rescue` (48-hour fix, $997), `/phase-3` (21-day buildout), `/solutions` (Starter/Builder/Prosperity tiers — STALE, still references old CaaS model)
- **Brand tokens:** navy (#003366), emerald (#047857), accent-gold (#f1c095), accent-cream (#fae9d7), accent-red (#d55053), dark-purple (#30232d)
- **Fonts:** Inter (sans), Bitter (serif)

### Q Suite Modules (`C:\Dev\10_products\Q SUITE`)
| Module | Dir | Has App | Has Supabase | Maturity |
|--------|-----|---------|-------------|----------|
| Q-CC | `apps/q-cc` | ✅ Next.js app with admin, quote-approval | ✅ | **Medium** — needs exec dashboard, weekly review, activity feed |
| Q-ICMS | `Q-ICMS/` | ✅ Full Next.js app (CRM, intake, ICMS routes) | ✅ (Prisma) | **Strongest** — has clients, engagements, contacts, comms, finance dirs |
| Q-ARI | `Q-ARI/apps/web` | ✅ Next.js app (receivables, ledger, approvals, tranches) | ✅ | **Medium** — has AR aging, evidence, companies; needs comms log per invoice |
| Q-VAULT | `apps/q-vault` | ✅ Next.js app (admin, API) | Unclear | **Early** — has types/lib but needs credential CRUD, audit log, access controls |
| Q-REIL | `Q-REIL/` | ✅ | ✅ | **Exclude** from internal deployment — no real internal use case |

---

## PHASE 1: WEBSITE REPOSITIONING

### TASK 1.1 — New Homepage Messaging & Structure

**File:** `apps/website/src/app/(marketing)/page.tsx`

Replace the current homepage composition. New section order:

```
<SmartConsultingBar />  ← keep
<main>
  <OperationalHero />        ← NEW (replaces RevampedHero)
  <HowItWorksSection />      ← NEW (replaces WhatWeInstallSection)
  <QSuiteSection />           ← NEW (the "runs us, can run you" section)
  <ProofSection />            ← NEW (replaces BuiltInPublicSection)
  <OffersSection />           ← NEW (ties services to Q Suite layers)
  <LeadLeakCheckSection />    ← KEEP (still a valid lead capture mechanism)
</main>
```

### TASK 1.2 — OperationalHero Component

**Create:** `apps/website/src/components/revamp/OperationalHero.tsx`

Replace current hero copy. New messaging:

| Element | Old | New |
|---------|-----|-----|
| Headline | "Lead-to-customer pipelines for service businesses." | "Operational infrastructure for service businesses." |
| Subhead | "Intake, follow-up automation, and deal tracking..." | "We build the systems that control intake, revenue, and execution — and we run our own company on the same architecture." |
| Primary CTA | "Start the 48-Hour Lead Rescue" → `/lead-rescue` | **Keep** (Lead Rescue is still the entry offer) |
| Secondary CTA | "Apply for the 21-Day Pipeline Buildout" → `/phase-3` | "See What We Run On" → `#q-suite` (anchor scroll) |
| Trust line | "Installed fast. Scope capped. You own it." | "We run on Q Suite. We deploy Q Suite. You own the result." |
| Bullets | Pipeline installation • Follow-up automation • Deal tracking dashboard | Intake & pipeline control • Revenue & receivables visibility • Execution & delivery governance |
| Micro-constraint | "No branding. No website builds. Pipeline infrastructure only." | "Not branding. Not websites. Operational infrastructure." |

**Implementation notes:**
- Keep the existing animation patterns (framer-motion, gradient backgrounds)
- Keep the proof strip stats (21× qualification rate, ~38% answered calls) — these are still valid
- Keep brand tokens: `bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20`
- Use `text-accent-gold` for the emphasis span

### TASK 1.3 — HowItWorksSection Component

**Create:** `apps/website/src/components/revamp/HowItWorksSection.tsx`

Replaces `WhatWeInstallSection`. New 4-step model (was 5 steps about pipeline):

| Step | Title | Description |
|------|-------|-------------|
| 1 | Diagnose | Map the workflow, find the friction |
| 2 | Install | Deploy the operating system |
| 3 | Run the Rhythm | Weekly review, execution cadence |
| 4 | Measure | Revenue visibility, delivery health |

- Keep the same visual pattern (numbered circles, arrow connectors, responsive mobile/desktop layout)
- Section heading: "How We Work" (matches existing `PrinciplesSection` heading — retire that component)

### TASK 1.4 — QSuiteSection Component

**Create:** `apps/website/src/components/revamp/QSuiteSection.tsx`

This is the new "what runs us, what can run you" section. Anchor ID: `q-suite`.

**Layout:** 2-column grid on desktop (intro left, module cards right). Full-width stack on mobile.

**Left column copy:**
- Section heading: "Built on Q Suite"
- Body: "Strata Noble runs its own operations on Q Suite — the same modular system we configure and deploy for clients. This isn't a demo. It's our actual operating environment."
- Subtext: "Strata Noble is transitioning its own operations onto the same Q Suite framework used in client delivery." (honest transitional language per the strategic doc)

**Right column — Module cards (4 cards):**

| Module | Label | One-liner | Icon suggestion |
|--------|-------|-----------|-----------------|
| Q-CC | Command Center | Executive visibility, weekly review, activity feed | `LayoutDashboard` from lucide |
| Q-ICMS | Client Operations | Lead pipeline, engagement lifecycle, touchpoints | `Users` from lucide |
| Q-ARI | Revenue Intelligence | Invoices, AR tracking, payment status, comms log | `DollarSign` from lucide |
| Q-VAULT | Secure Storage | Credentials, API keys, audit trails, access governance | `Shield` from lucide |

**Styling:**
- Cards: `bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md`
- Module label: `text-primary font-bold text-lg`
- One-liner: `text-muted-foreground text-sm`
- Do NOT create a bloated feature list. Keep it tight.

### TASK 1.5 — ProofSection Component

**Create:** `apps/website/src/components/revamp/ProofSection.tsx`

Replaces `BuiltInPublicSection`. New proof format:

**Section heading:** "Proof, Not Promises"

**Proof items (grid of 3):**
1. **Operating rhythm** — "Weekly executive review run through Q-CC using real business data"
2. **Client visibility** — "Active clients and engagements managed in Q-ICMS with full lifecycle tracking"
3. **Revenue control** — "Every invoice tracked in Q-ARI with corresponding communications log"

Each item: icon + title + one-line description. Same card pattern as PrinciplesSection but with updated content.

**Bottom text:** "Every pipeline install includes ProofLoop receipts and ANX Vault delivery." + link to `/tools`

### TASK 1.6 — OffersSection Component

**Create:** `apps/website/src/components/revamp/OffersSection.tsx`

Ties each service offer to the Q Suite layer underneath.

**Section heading:** "What We Deploy"

| Offer | Description | Powered by |
|-------|-------------|------------|
| Lead Rescue | Stop the leak, ship receipts, 48 hours | Q-ICMS + Q-CC |
| Revenue Control | AR cleanup, invoice tracking, payment visibility | Q-ARI |
| Operations Visibility | Executive dashboard, weekly review rhythm | Q-CC |
| Secure Infrastructure | Credential governance, audit trails | Q-VAULT |

**Each card layout:**
- Offer name (bold, `text-primary`)
- One-line description
- "Powered by" badge row showing module names in small pills (`bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full`)
- CTA link to appropriate page (`/lead-rescue`, `/contact`, etc.)

### TASK 1.7 — Retire Stale Components

**Delete or archive these files:**
- `src/components/revamp/PrinciplesSection.tsx` — replaced by HowItWorksSection
- `src/components/revamp/WhatWeInstallSection.tsx` — replaced by HowItWorksSection
- `src/components/revamp/BuiltInPublicSection.tsx` — replaced by ProofSection

**Update LazyLoadedSections:**
- **File:** `src/components/LazyLoadedSections.tsx`
- Remove lazy imports for `SmartConsultingBar`, `WhatWeInstallSection`, `PrinciplesSection`
- Add lazy imports for new components if needed (or import directly — they're small)

### TASK 1.8 — Update Layout Metadata

**File:** `apps/website/src/app/layout.tsx`

Update the metadata description:
```typescript
description: 'Operational infrastructure for service businesses. Intake, revenue visibility, and execution control — built on the same Q Suite system we run internally.',
keywords: [
  'operational infrastructure',
  'business operating system',
  'service business automation',
  'revenue visibility',
  'intake automation',
  'Q Suite',
],
```

### TASK 1.9 — Update /solutions Page

**File:** `apps/website/src/app/solutions/page.tsx`

This page is stale (still references CaaS model with Starter/Builder/Prosperity tiers at $0/$47/$97). Options:

**Option A (recommended):** Redirect `/solutions` to homepage. Add a `redirect` in `next.config.js`:
```javascript
async redirects() {
  return [{ source: '/solutions', destination: '/', permanent: false }];
}
```

**Option B:** Rewrite as a service catalog tied to Q Suite modules (more work, defer to Phase 2).

---

## PHASE 2: INTERNAL DATA MIGRATION PREP

> These tasks prepare Q Suite modules to receive real StrataNoble operational data. They do NOT change the website.

### TASK 2.1 — Q-ICMS: StrataNoble Tenant Setup

**Codebase:** `C:\Dev\10_products\Q SUITE\Q-ICMS`

Verify/create:
- StrataNoble org record in the database
- Lead pipeline stages: `new → qualified → proposal → active → closed-won → closed-lost`
- Client lifecycle stages: `prospect → onboarding → active → maintenance → churned`
- Engagement types: `lead-rescue`, `pipeline-buildout`, `managed-ops`, `custom`

**Acceptance:** A coding agent can run the app locally, log in as SN admin, and see an empty but correctly configured pipeline.

### TASK 2.2 — Q-CC: Executive Dashboard Scaffold

**Codebase:** `C:\Dev\10_products\Q SUITE\apps\q-cc`

The Q-CC app currently has `admin`, `admin-login`, `quote-approval` routes. It needs:

- `/dashboard` route — executive overview page with placeholder widgets:
  - Active leads count (pulls from Q-ICMS API or shared Supabase)
  - Active engagements count
  - Revenue this month (pulls from Q-ARI)
  - Weekly review checklist (static for now)
- `/review` route — weekly review page with:
  - Date picker for review week
  - Sections: Pipeline health, Delivery status, Revenue snapshot, Action items
  - All sections can be placeholder/static initially

**Acceptance:** Dashboard route renders with placeholder data. Weekly review page renders with empty sections.

### TASK 2.3 — Q-ARI: Communications Log Per Invoice

**Codebase:** `C:\Dev\10_products\Q SUITE\Q-ARI`

The strategic doc requires: "every invoice needs a corresponding communications log entry."

- Add `comms_log` table/model linked to invoices (if not exists)
- Add comms log UI on the invoice detail view (`/receivables/[id]` or equivalent)
- Fields: `date`, `type` (email/call/note), `summary`, `linked_invoice_id`, `author`

**Acceptance:** An agent can create an invoice and attach a comms log entry to it.

### TASK 2.4 — Q-VAULT: Credential CRUD + Audit Log

**Codebase:** `C:\Dev\10_products\Q SUITE\apps\q-vault`

Current state is early (has types/lib but minimal UI). Needs:

- `/credentials` route — list view of stored credentials
- `/credentials/new` route — create form: `name`, `type` (API key / login / token / other), `value` (encrypted at rest), `service`, `notes`, `expires_at`
- `/audit` route — read-only log of all credential access events
- Credential values must NEVER be returned in full to the UI after creation (show masked version only)

**Acceptance:** An agent can create a credential, see it listed (masked), and see the creation event in the audit log.

---

## PHASE 3: PROOF PACK GENERATION

> Only begin after Phase 2 tasks are complete and real SN data is loaded.

### TASK 3.1 — Screenshot/Receipt Generation

Once StrataNoble is running on Q Suite modules:

- Capture screenshots of real Q-CC dashboard with SN data
- Capture screenshots of Q-ICMS with at least one real client engagement
- Capture screenshots of Q-ARI with at least one real invoice + comms log
- Capture screenshot of Q-VAULT credential list (with masked values)

### TASK 3.2 — Website Messaging Upgrade (Truth Gate)

Once proof pack exists and internal adoption is verified:

**Update QSuiteSection transitional language:**
- **Remove:** "Strata Noble is transitioning its own operations onto the same Q Suite framework..."
- **Replace with:** "Strata Noble runs its own company on Q Suite. Every lead, every client, every invoice, every credential — managed through the same modules we deploy for clients."

This change ONLY ships after the acceptance criteria in Phase 2 are all met.

---

## FILE MANIFEST

### New Files
| File | Phase |
|------|-------|
| `src/components/revamp/OperationalHero.tsx` | 1.2 |
| `src/components/revamp/HowItWorksSection.tsx` | 1.3 |
| `src/components/revamp/QSuiteSection.tsx` | 1.4 |
| `src/components/revamp/ProofSection.tsx` | 1.5 |
| `src/components/revamp/OffersSection.tsx` | 1.6 |

### Modified Files
| File | Phase | Change |
|------|-------|--------|
| `src/app/(marketing)/page.tsx` | 1.1 | Replace section composition |
| `src/components/LazyLoadedSections.tsx` | 1.7 | Remove retired component imports |
| `src/app/layout.tsx` | 1.8 | Update metadata |
| `next.config.js` | 1.9 | Add /solutions redirect |

### Retired Files
| File | Phase |
|------|-------|
| `src/components/revamp/PrinciplesSection.tsx` | 1.7 |
| `src/components/revamp/WhatWeInstallSection.tsx` | 1.7 |
| `src/components/revamp/BuiltInPublicSection.tsx` | 1.7 |

### Q Suite Module Files (Phase 2)
| Module | Key Changes |
|--------|-------------|
| Q-ICMS | Tenant config, pipeline stages |
| Q-CC (`apps/q-cc`) | `/dashboard`, `/review` routes |
| Q-ARI (`Q-ARI/apps/web`) | `comms_log` model + UI on invoice detail |
| Q-VAULT (`apps/q-vault`) | `/credentials`, `/credentials/new`, `/audit` routes |

---

## EXECUTION ORDER

```
Phase 1 (Website) — Can start immediately
  1.2 → 1.3 → 1.4 → 1.5 → 1.6  (new components, parallel-safe)
  1.1 (depends on 1.2-1.6 complete)
  1.7 → 1.8 → 1.9 (cleanup, sequential)

Phase 2 (Q Suite Modules) — Can start in parallel with Phase 1
  2.1 (Q-ICMS) — no dependencies
  2.2 (Q-CC) — no dependencies
  2.3 (Q-ARI) — no dependencies
  2.4 (Q-VAULT) — no dependencies

Phase 3 (Proof Pack) — Blocked on Phase 2 completion
  3.1 → 3.2 (sequential)
```

---

## NON-NEGOTIABLE GATES

1. **No fake completeness** — Transitional language on the website until real data is in Q Suite
2. **Q-REIL excluded** — No internal deployment unless a real use case is verified
3. **Credential security** — Q-VAULT must encrypt at rest and never return full values after creation
4. **Brand consistency** — All new components use existing Tailwind config tokens (navy, emerald, accent-gold, accent-cream). No new color definitions.
5. **No new dependencies** — Use lucide-react (already available), framer-motion (already available). No additional UI libraries.
