# TASK: Phase 5 — Content Alignment & CTA Consistency

**Branch:** `feature/site-revamp-phase-5-content`  
**Base:** `main` (after Phase 3 PR is merged)  
**Context:** The site now has a coherent IA, canonical data layer, clean component tree, and proper redirects. What remains is making sure every marketing page tells the same story and routes visitors through the same funnel. This phase is content surgery — no new pages, no new components, just precision alignment.

---

## Current State Summary

### Pages that are already aligned (no changes needed)
- **Homepage** — Links to `/services`, `/q-suite`, `/achievery`, `/contact?service=lead-rescue`. All correct.
- **`/services`** — Pulls from `offerings.ts`, links to `/q-suite` and `/achievery`. Correct.
- **`/q-suite`** — Links to `/services` and `/achievery`. Correct.
- **`/achievery`** — Self-contained pricing page. Correct.
- **`/lead-rescue`** — Comprehensive offer page, correct CTAs. Links to `/tools/sample-receipt` (valid).
- **`/pipeline-buildout`** — Comprehensive offer page, correct CTAs.
- **SiteNav** — Services | Q SUITE | ACHIEVERY | About | Proof | Contact. Correct.
- **SiteFooter** — Links to `/lead-rescue`, `/pipeline-buildout`, `/q-suite`, `/achievery`, `/about`, `/proof`, `/contact`. Correct.
- **`next.config.js` redirects** — `/solutions` → `/services`, `/platform` → `/q-suite`, `/pricing` → `/services`, `/discovery` → `/contact`, `/get-started` → `/contact`, `/schedule` → `/contact`, `/research` → `/proof`, `/workshops` → `/proof`. All 301 permanent. Correct.

### Pages that need content alignment

#### `/about` — Good content, minor CTA issues
**Issues found:**
1. Bottom CTA links to `/lead-rescue` and `/pipeline-buildout` directly. The new IA funnels through `/services` first (where all three offers are presented in the OfferLadder). Direct deep-links to individual offers skip the offer ladder and lose the context of the three-tier structure.
2. No mention of Q SUITE or ACHIEVERY anywhere on the page. The "What Strata Noble Is" section says "Every system we install runs on the same architecture we use internally" but doesn't name the products or link to them.
3. The "Infrastructure-First Delivery" section duplicates `/how-it-works` content (same 4 steps). Having it in both places is fine, but the `/about` version should link to `/how-it-works` more prominently (it does, but buried at the bottom of the section).
4. Missing `metadata` export — page is `'use client'` with no metadata. This hurts SEO.

**Changes:**
1. Replace bottom CTA from `/lead-rescue` + `/pipeline-buildout` to:
   - Primary: "See Our Services" → `/services`
   - Secondary: "Explore Q SUITE" → `/q-suite`
2. In the "What Strata Noble Is" section, after the paragraph about running on the same architecture, add a brief reference: "The system is called Q SUITE — a modular platform with five modules covering intake, client operations, revenue, execution, and security." Link "Q SUITE" to `/q-suite`.
3. Add a `metadata` export. The page must stop being `'use client'` at the top level, OR the metadata must be in a separate `layout.tsx` or a `generateMetadata` approach. Simplest fix: extract the page into a server component wrapper that provides metadata, rendering a `<AboutPageClient />` component.

   New `src/app/(marketing)/about/page.tsx`:
   ```tsx
   import { Metadata } from 'next';
   import { AboutPageClient } from './AboutPageClient';

   export const metadata: Metadata = {
     title: 'About | Strata Noble',
     description: 'Operator-led operational infrastructure firm. We install control systems for service businesses — scoped, documented, and transferable.',
   };

   export default function AboutPage() {
     return <AboutPageClient />;
   }
   ```
   Rename current `page.tsx` content to `AboutPageClient.tsx` with `export function AboutPageClient()`.

#### `/contact` — Functional but too narrow
**Issues found:**
1. Hero says "Ready to fix your pipeline?" and only offers Lead Rescue as the primary CTA. Visitors arriving from `/about`, `/q-suite`, or `/achievery` may not be here for a pipeline fix — they may want to discuss Q SUITE licensing, Operations Command, or a general inquiry.
2. No contact form — just phone/email/location. The `/lead-rescue` page has a proper `LeadRescueForm`, but `/contact` itself has no form.
3. Secondary CTA is Pipeline Buildout only — no mention of Operations Command or general inquiry.

**Changes:**
1. Update hero copy:
   - H1: "Let's talk" (or "Get in touch")
   - Subhead: "Whether you need a quick pipeline fix, a full system install, or want to discuss how Q SUITE fits your operation — start here."
   - Primary CTA: "Book a Call" → link to Calendly or `/contact?service=general` (keep `/contact?service=lead-rescue` as a query-param variant)
2. Add a simple engagement selector below the hero (not a full form — just links):
   - "I need a quick fix" → `/lead-rescue`
   - "I want a full pipeline" → `/pipeline-buildout`
   - "I want to discuss Q SUITE" → `/contact?service=q-suite`
   - "Something else" → shows phone/email
3. Keep the existing phone/email/location grid below.
4. Replace the bottom Pipeline Buildout CTA with a link to `/services` so visitors can see all options.

#### `/how-it-works` — Good content, minor alignment
**Issues found:**
1. The "Engagement types" table shows "Ongoing Support" with "Custom" pricing. `offerings.ts` now defines Operations Command at $1,497/month. The table should reflect this.
2. The "Ongoing Support" label should say "Operations Command" to match `offerings.ts` naming.
3. Bottom CTA links to `/lead-rescue` and `/pipeline-buildout` — should also mention Operations Command or link to `/services`.

**Changes:**
1. Update table: "Ongoing Support" → "Operations Command", "Custom" → "$1,497/month", add "3-month minimum" note.
2. Bottom CTA: replace with "View All Services" → `/services` as primary, keep individual offer links as secondary options.

---

## 5A — `/about` Content Alignment

### Steps
1. Create `src/app/(marketing)/about/AboutPageClient.tsx` — move current page.tsx content here (rename default export to `AboutPageClient`)
2. Rewrite `src/app/(marketing)/about/page.tsx` as server component with metadata + `<AboutPageClient />`
3. In `AboutPageClient.tsx`:
   - Add Q SUITE reference in "What Strata Noble Is" section (one sentence + link)
   - Replace bottom CTA hrefs: `/lead-rescue` → `/services`, `/pipeline-buildout` → `/q-suite`
   - Update CTA button labels accordingly

### Validation
- `npm run build` exit 0
- `/about` renders with metadata in `<head>`
- Q SUITE link visible in body copy
- Bottom CTA links to `/services` and `/q-suite`

### Commit
```bash
git commit -m "fix(about): add metadata, reference Q SUITE, align CTAs with services IA"
```

---

## 5B — `/contact` Content Alignment

### Steps
1. Update hero in `src/app/(marketing)/contact/page.tsx`:
   - H1: "Get in touch"
   - Subhead: broader positioning (not just pipeline-focused)
   - Primary CTA: keep Lead Rescue link but reframe as "Start with the Free Diagnostic"
2. Add engagement path selector section (simple link cards, not a form):
   - "My leads are leaking" → `/lead-rescue`
   - "I need a full system" → `/pipeline-buildout`
   - "I want ongoing support" → `/contact?service=operations-command`
   - "Tell me about Q SUITE" → `/q-suite`
3. Keep phone/email/location grid
4. Replace bottom Pipeline-only CTA with: "See all engagement options" → `/services`
5. Update metadata description to be broader than "pipeline infrastructure"

### Validation
- `npm run build` exit 0
- `/contact` hero reads broader than "fix your pipeline"
- All four engagement paths link correctly
- Bottom CTA goes to `/services`

### Commit
```bash
git commit -m "fix(contact): broaden hero, add engagement paths, align with full offer ladder"
```

---

## 5C — `/how-it-works` Pricing Table Update

### Steps
1. In `src/app/(marketing)/how-it-works/page.tsx`:
   - Rename "Ongoing Support" column header → "Operations Command"
   - Update price row: "Custom" → "$1,497/month"
   - Add row or note: "3-month minimum, month-to-month after"
   - Step 4 title: "Optional Ongoing Support" → "Operations Command (optional)"
2. Bottom CTA: Add "View All Services" → `/services` as tertiary link alongside the two existing offer CTAs
3. Extract metadata: same pattern as `/about` — the page is `'use client'`, so either:
   - Split into server wrapper + client component
   - Or add a `layout.tsx` in the `/how-it-works` directory with metadata

### Validation
- `npm run build` exit 0
- Table shows "$1,497/month" and "Operations Command"
- Metadata present in `<head>`

### Commit
```bash
git commit -m "fix(how-it-works): update pricing table to Operations Command, add metadata"
```

---

## 5D — Cross-page Link Verification

### Steps
1. After 5A–5C are complete, run a full link audit:
   ```bash
   grep -rn 'href="/' src/app/\(marketing\)/ --include="*.tsx" | grep -v "node_modules" | sort > /tmp/link-audit.txt
   ```
2. Verify every internal link points to a valid route (either a page that exists or a redirect in `next.config.js`)
3. Check for any remaining references to:
   - `/platform` (should not exist outside redirect file)
   - `/solutions` (only in `(marketing)/solutions/` verticals — acceptable)
   - `/discovery`, `/get-started`, `/schedule` (should not exist — redirects handle these)
4. Verify no page links to itself (e.g., `/about` linking to `/about`)
5. Spot-check: confirm `/tools/sample-receipt` exists and renders (linked from `/lead-rescue`)

### Commit
```bash
git commit -m "chore: verify all internal links after Phase 5 content alignment"
```

---

## Execution Order

```
5A (about) → 5B (contact) → 5C (how-it-works) → 5D (link verification)
```

Each step is independently committable.

## NOT in scope
- `/proof` page build (truth gate — blocked until real Q Suite data confirmed)
- New page creation
- Visual/design changes (colors, typography, spacing)
- `/lead-rescue` or `/pipeline-buildout` content rewrites (these are already well-built)
- Vertical solution pages content (these are correct as-is)
- ACHIEVERY marketing page content (correct as-is)
- Mobile responsiveness fixes
- Form functionality (Calendly integration, contact form, etc.)
