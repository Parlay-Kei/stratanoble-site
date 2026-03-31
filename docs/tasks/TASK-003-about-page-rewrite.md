# TASK-003: About Page — Full Rewrite to Operator-Led Firm Positioning

**Mission:** OCS-SN-SITE-REVAMP-001 — Phase 1, Item 2
**Priority:** P1
**Status:** READY
**Depends on:** TASK-001 (CTA links must use correct naming)

---

## Objective

Rewrite the About page from the current "lead-to-customer pipeline shop" framing to an "operator-led operational control systems firm" positioning. Must communicate: founder credibility, infrastructure-first method, how SN delivery differs from agencies/freelancers/CRM consultants.

---

## Current State Problems

The existing `apps/website/src/app/(marketing)/about/page.tsx`:

1. **Framing is wrong**: "We build lead-to-customer pipelines" — too narrow, undersells the firm
2. **"No branding. No websites."** — defensive/reactive positioning instead of assertive
3. **"No ongoing retainers"** — blocks the third offer tier (Ongoing Operating Support) planned for Phase 2
4. **"Manual-First" section** — implies the real product doesn't exist yet
5. **"Built in Public"** — startup language, violates brand rules
6. **Bottom CTA** links to `/phase-3` with text "Apply for Phase 3" — naming issue (fixed by TASK-001 dependency)
7. **Quote block** has a design issue with the opening `"` character (big gold `"` above the quote)

---

## Implementation

### Full rewrite of `apps/website/src/app/(marketing)/about/page.tsx`

Keep the same file, same `'use client'` directive, same framer-motion patterns. Replace all section content.

**Page structure:**

#### 1. Hero Section
- **Headline**: "About Strata Noble"
- **Subheadline**: "We install operational control systems for service businesses. Scoped engagements. Delivered infrastructure. You own the result."

#### 2. The Firm — What We Are
- **Header**: "What Strata Noble Is"
- **Copy direction**: Strata Noble is an operational infrastructure firm. We deploy modular systems that control intake, revenue, execution, and security for service businesses between $500K and $5M in revenue. We're not an agency. We're not freelancers. We're not CRM consultants. We install operating systems.
- Key differentiator paragraph: "Every system we install runs on the same architecture we use internally. When we say 'we run on this' — we mean it. Our own intake, revenue tracking, client operations, and credential governance run through Q Suite."

#### 3. Founder Section
- **Header**: "Operator-Led"
- **Copy direction**: Built by an operator who has sat in the seat — someone who knows what it's like to lose deals in follow-up, chase invoices manually, and run a business on spreadsheets and memory. Strata Noble exists because the founder built the systems he needed, then made them deployable for others.
- **Note**: Do NOT name the founder explicitly unless Steve approves. Use "our founder" or "the operator behind Strata Noble" framing.

#### 4. How We Differ — Comparison Block
- **Header**: "How This Is Different"
- 3-column (desktop) or stacked (mobile) comparison:

| Agencies | CRM Consultants | Strata Noble |
|----------|----------------|--------------|
| Sell campaigns and creative | Configure a single tool | Install a complete operating system |
| Monthly retainers, scope creep | Per-project, single-tool focus | Scoped engagement, modular delivery |
| You get deliverables | You get a configured tool | You get infrastructure you own |
| No operational visibility | Partial pipeline view | Full intake → revenue → execution visibility |

- Design: Use card layout with subtle borders, primary color for the SN column highlight

#### 5. Method — How We Work
- **Header**: "Infrastructure-First Delivery"
- 4 steps (reuse the same pattern as `HowItWorksSection` but with more detail):
  1. **Discovery** — Map workflows, identify friction points, define scope
  2. **Implementation** — Deploy modules, configure pipelines, wire integrations
  3. **Handoff** — Documentation, training, proof pack delivery
  4. **Optional Ongoing Support** — Weekly rhythm, executive review, continuous tuning
- **Note on step 4**: Use tentative language — "For businesses that want it, we offer ongoing operational support to maintain the rhythm." This preserves room for the third offer tier without naming it or pricing it (blocked on principal decision).

#### 6. Social Proof Metrics
- Keep the 3-stat block but update labels:
  - `48hrs` → "Lead Rescue Delivery"
  - `21 days` → "Full System Buildout"
  - `100%` → "Client-Owned Infrastructure"

#### 7. Quote Block
- Replace current quote with: "We don't sell promises. We install systems, run them ourselves, and hand you the same architecture."
- Attribution: "The Strata Noble Method"
- Sub-attribution: "Proof Over Promise"
- Fix the design: the big gold `"` character should be smaller or replaced with a left-border accent pattern

#### 8. CTA Section
- **Headline**: "Ready to Install Operational Control?"
- **Subheadline**: "Start with the 48-Hour Lead Rescue or apply for a full system buildout."
- Two buttons:
  - Primary: "Get the Lead Rescue" → `/lead-rescue`
  - Secondary: "Apply for the 21-Day Pipeline Buildout" → `/phase-3`

---

## Design Tokens

- Reuse existing gradient patterns: `bg-gradient-to-br from-navy via-navy/95 to-emerald-900/20`
- Card patterns: `bg-white border border-gray-200 rounded-xl p-6 shadow-sm`
- Step indicators: `bg-gradient-to-r from-emerald-500/10 to-transparent border-l-4 border-emerald-500 rounded-lg p-6`
- Keep framer-motion `initial/whileInView` animations consistent with other marketing pages
- Responsive: mobile-first, stack on small, grid on large

---

## Brand Rules

- **USE**: Lived operator experience, infrastructure language, execution credibility
- **AVOID**: Generic scaling language, agency aesthetics, startup/motivational tone, feature-first framing
- **DO NOT**: Use "Built in Public" language, startup accelerator tone, or "we're building the future" framing
- **DO NOT**: Include "no ongoing retainers" as an absolute — leave room for the third tier
- **Positioning**: "We install operational control systems for service businesses"

---

## Validation

- [ ] Page reads as an operator-led infrastructure firm, not a pipeline shop
- [ ] No "Phase 3" text anywhere on page
- [ ] No "no ongoing retainers" absolute language
- [ ] No "Built in Public" or startup tone
- [ ] Comparison block clearly differentiates from agencies and CRM consultants
- [ ] Founder section establishes credibility without naming the founder
- [ ] Method section includes optional ongoing support (tentative language)
- [ ] CTA buttons link to `/lead-rescue` and `/phase-3` with correct labels
- [ ] Quote block styled without oversized `"` character
- [ ] Responsive layout works mobile → desktop
- [ ] framer-motion animations fire on scroll
- [ ] `pnpm build` succeeds
