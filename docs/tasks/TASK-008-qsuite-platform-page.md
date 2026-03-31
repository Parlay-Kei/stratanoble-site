# TASK-008: Q Suite / Platform Page (Light)

**Mission:** OCS-SN-SITE-REVAMP-001 — Phase 3, Item 8
**Priority:** P3
**Status:** READY
**Depends on:** Principal decision #1 (Q Suite public brand name) — see notes
**Blocked:** PARTIALLY — can build structure with "Q Suite" as working name; swap if decision changes

---

## Objective

Replace the current Platform page (which is a stale "Built in Public" roadmap with Phase 0–7 milestones) with a light Q Suite page that explains the modular operating framework powering Strata Noble's work. This page *supports* the consulting sales story — it does not replace it.

**Principal decision note:** The mission's open question #1 asks whether "Q Suite" is the client-facing name or carries a different public identity. This task uses "Q Suite" as the working name. If the decision changes the name, it's a find-and-replace — the page structure and content remain the same.

---

## Current State Problems

**File:** `apps/website/src/app/platform/page.tsx`

1. **"Built in Public" framing** — hero says "Built in Public" with a roadmap of Phase 0–7. This is startup language that violates brand rules.
2. **Phase numbering** — shows Phases 0–7 with "Complete / In Progress / Planned" status badges. This is internal project management, not client-facing content.
3. **"What You Get Now vs Later"** — implies the product isn't ready and clients are buying a future promise.
4. **No Q Suite module explanation** — doesn't explain Q-CC, Q-ICMS, Q-ARI, Q-VAULT, Q-REIL.
5. **Layout is outside marketing group** — lives at `apps/website/src/app/platform/` (not inside `(marketing)`), so it doesn't inherit `SiteShell` nav/footer via the marketing layout. It has its own layout with `robots: noindex`.

---

## Implementation

### 1. Move page into marketing group (or add SiteShell)

**Option A (recommended):** Keep at `/platform` route but update `layout.tsx` to wrap content in `SiteShell` (same pattern used by the new solutions layout):

```tsx
// apps/website/src/app/platform/layout.tsx
import { Metadata } from 'next';
import { SiteShell } from '@/components/site';

export const metadata: Metadata = {
  title: 'Q Suite — Our Operating Framework | Strata Noble',
  description: 'Our work is powered by Q Suite, a modular operating framework. Q-CC, Q-ICMS, Q-ARI, Q-VAULT, Q-REIL.',
  alternates: { canonical: '/platform' },
  openGraph: {
    title: 'Q Suite | Strata Noble',
    description: 'Modular operating framework for service businesses.',
    url: '/platform',
  },
  robots: {
    index: true,   // RE-ENABLE indexing
    follow: true,
  },
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
```

### 2. Full rewrite of `apps/website/src/app/platform/page.tsx`

Replace the Phase 0–7 roadmap with a Q Suite explainer page. Use `'use client'` for framer-motion, metadata handled in layout.

**Page structure:**

#### Hero
- **Headline**: "Our Work Is Powered by a Modular Operating Framework"
- **Subheadline**: "Q Suite is the system behind every engagement. We run on it. We deploy it. You own the result."
- No "Built in Public" badge. No roadmap language.

#### What Q Suite Is (brief explainer)
- **Header**: "What Is Q Suite?"
- 2–3 paragraphs max:
  - "Q Suite is a modular operating system built for service businesses. It controls intake, client operations, revenue tracking, execution visibility, and credential security through five integrated modules."
  - "We don't sell Q Suite as standalone software. We configure and deploy it as part of scoped engagements — the same way a contractor installs electrical, plumbing, and HVAC as part of building a house."
  - "Every module is independently useful but designed to work together. Your engagement might use two modules or all five, depending on what your operation needs."

#### Module Cards (5 modules)
- Grid layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (2 top row of 3, bottom row centered or full-width for 5th)
- Reuse the same card pattern and Lucide icons from `QSuiteSection.tsx` but with expanded descriptions

| Module | Name | Icon | Description |
|--------|------|------|-------------|
| **Q-CC** | Command Center | `LayoutDashboard` | Executive visibility into your operation. Weekly review dashboards, activity feeds, and delivery health metrics — so you know what's working, what's stuck, and what needs attention. |
| **Q-ICMS** | Client Operations | `Users` | Lead pipeline, client lifecycle tracking, engagement management, and touchpoint logging. From first inquiry to ongoing relationship — every interaction tracked. |
| **Q-ARI** | Revenue Intelligence | `DollarSign` | Invoice tracking, accounts receivable dashboard, payment status monitoring, and communications log. Know exactly who owes what, when, and what's been said about it. |
| **Q-VAULT** | Secure Storage | `Shield` | Credential governance, API key management, audit trails, and access controls. No more passwords in Slack threads or API keys in shared Google Docs. |
| **Q-REIL** | *(fifth module)* | `Cog` or `Layers` | Include if there's a public-ready description. If not, use placeholder: "Operational execution and governance layer. Details coming." Mark with "In Development" badge. |

**Card design:**
- Match `QSuiteSection.tsx` card style: icon + label + name + description
- Add expanded description (2–3 sentences per module vs 1 line in homepage section)
- Q-REIL card gets `border-dashed border-gray-300` if in-development

#### How It Connects to Your Engagement
- Brief section (3–4 sentences):
- "When you engage Strata Noble, we scope which Q Suite modules your operation needs. We configure them, deploy them into your workflows, and hand them off with documentation and training."
- "You don't need to understand the architecture. You just need to know that every system we install is modular, documented, and designed to work together."
- CTA: "See what we install →" → `/solutions`

#### Bottom CTA
- **Headline**: "Ready to See This in Your Business?"
- Two buttons: Lead Rescue, Pipeline Buildout

### 3. Add "Platform" or "Q Suite" to nav (optional — agent discretion)

Currently the nav has: Solutions, About, Contact, Tools. Consider adding "Q Suite" or "Platform" to nav if it fits without overcrowding. If 5 nav items feels heavy, skip — the page is linked from the tools page, solutions page, and homepage Q Suite section.

### 4. Delete stale content

Remove the `PhaseCard` component and all Phase 0–7 data from the page. Remove the "What You Get Now vs Later" section. Remove the "Built in Public" badge.

---

## Brand Rules

- **USE**: Infrastructure language, modular framework, operator credibility
- **AVOID**: "Built in Public", roadmap/phase language, startup tone, feature-first framing
- **Frame**: Q Suite supports the consulting story. Visitors should think "these people have a system" — not "these people are selling software."
- **Truth gate**: Use cautious/transitional language per the mission's truth gate principle. The QSuiteSection on the homepage already has the italic disclaimer: "Strata Noble is transitioning its own operations onto the same Q Suite framework used in client delivery." Include similar on this page.

---

## Validation

- [ ] No "Built in Public" language
- [ ] No Phase 0–7 roadmap or milestone tracking
- [ ] No "What You Get Now vs Later" framing
- [ ] 5 Q Suite modules explained with business-value descriptions
- [ ] Q-REIL marked as in-development if no public description available
- [ ] Page wrapped in SiteShell (nav + footer visible)
- [ ] Robots meta allows indexing
- [ ] Transitional/cautious language included (truth gate)
- [ ] Page supports consulting story, doesn't try to sell software
- [ ] Responsive layout
- [ ] `pnpm build` succeeds
