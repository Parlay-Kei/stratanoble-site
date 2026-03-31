# TASK-004: Solutions Architecture Page — Outcome-Based Packages

**Mission:** OCS-SN-SITE-REVAMP-001 — Phase 2, Item 4
**Priority:** P2
**Status:** READY
**Depends on:** TASK-001 (naming consistency)

---

## Objective

Replace the current Solutions page (which is a stale SaaS pricing page with Starter/Builder/Prosperity tiers at $0/$47/$97/mo) with an outcome-based solutions architecture page showing 3–5 packaged business outcomes.

The current `/solutions` page is completely wrong for the business — it sells subscription software tiers that don't exist. This is a full replacement.

---

## Current State

**File:** `apps/website/src/app/solutions/page.tsx`

The page currently shows:
- "Choose Your Path to Prosperity" hero
- 3 SaaS subscription tiers (Free, $47/mo Builder, $97/mo Prosperity)
- Feature checklists (AI idea validation, brand identity package, etc.)
- Links to `/auth/signup` and `/checkout?tier=builder`

**This entire page must be replaced.** None of the current content is relevant.

---

## Implementation

### Full rewrite of `apps/website/src/app/solutions/page.tsx`

Remove `'force-dynamic'` export. This is a static marketing page.

**Page structure:**

#### 1. Hero
- **Headline**: "Operational Control Systems for Service Businesses"
- **Subheadline**: "Every engagement delivers a specific operational outcome. Scoped, installed, and handed off."
- No pricing on this page — this is about outcomes, not tiers

#### 2. Solutions Grid — 5 Packaged Outcomes

Each solution card shows: icon, name, problem it solves, what gets installed, which Q Suite modules power it, and a CTA.

| # | Solution Name | Problem Statement | What Gets Installed | Powered By | CTA |
|---|--------------|-------------------|--------------------|-----------|----|
| 1 | **Lead Flow Control** | Leads arrive but nobody follows up in time. Prospects go cold. Revenue walks. | Intake capture, speed-to-lead routing, follow-up sequences, pipeline dashboard | Q-ICMS, Q-CC | "Start with Lead Rescue" → `/lead-rescue` |
| 2 | **Client Operations Control** | Client work is tracked in spreadsheets, Slack threads, and memory. No lifecycle visibility. | Client lifecycle tracking, engagement management, touchpoint logging, status dashboards | Q-ICMS | "Get Started" → `/contact` |
| 3 | **Receivables Control** | Invoices sent late, payments tracked manually, AR lives in Excel. Cash flow surprises every month. | Invoice tracking, payment status monitoring, AR dashboard, communications log | Q-ARI | "Get Started" → `/contact` |
| 4 | **Secure Business Operations** | Passwords in Slack, API keys in Google Docs, no audit trail on who has access to what. | Credential governance, access controls, audit trails, secure handoff vault | Q-VAULT | "Get Started" → `/contact` |
| 5 | **Executive Visibility** | The owner is the only person who knows what's going on. No weekly review rhythm, no operational dashboard. | Executive dashboard, weekly review cadence, activity feeds, delivery health metrics | Q-CC | "Get Started" → `/contact` |

**Card design spec:**
- Large cards, `grid-cols-1 lg:grid-cols-2` for solutions 1-4, solution 5 full-width or centered
- Each card: icon (Lucide), solution name (bold, large), problem statement (muted paragraph), "What gets installed" list (checkmarks), Q Suite module badges (small pills like in `OffersSection.tsx`), CTA link
- Solution 1 (Lead Flow Control) should be visually emphasized — this is the entry wedge
- Use `framer-motion` `whileInView` stagger animations

#### 3. How Delivery Works (brief)
- 4 steps inline: Discovery → Implementation → Handoff → Optional Support
- Reuse the same step pattern from `HowItWorksSection.tsx` (numbered circles with arrows)
- Keep brief — this is a reference, not the primary content

#### 4. Entry Points CTA
- **Headline**: "Start Where It Hurts Most"
- Two paths:
  - "48-Hour Lead Rescue — $997" → `/lead-rescue` (primary button)
  - "21-Day Pipeline Buildout — $4,997" → `/phase-3` (secondary button)
- Below: "Not sure which? Talk to us." → `/contact`

#### 5. Metadata

```typescript
export const metadata: Metadata = {
  title: 'Solutions | Strata Noble — Operational Control Systems',
  description: 'Packaged operational outcomes for service businesses. Lead flow control, client operations, receivables, security, and executive visibility.',
  alternates: { canonical: '/solutions' },
  openGraph: {
    title: 'Solutions | Strata Noble',
    description: 'Operational control systems for service businesses.',
    url: '/solutions',
  },
  // RE-ENABLE indexing — the old page had robots noindex
  robots: {
    index: true,
    follow: true,
  },
};
```

### Also delete: `apps/website/src/app/solutions/ServiceCard.tsx`

This companion component was for the old SaaS pricing cards. Remove it.

### Nav update

Consider adding "Solutions" to the SiteNav `navigation` array if not already present. Currently nav has: About, Contact, Tools. Solutions should be added:

**File:** `apps/website/src/components/site/SiteNav.tsx`

```typescript
const navigation = [
  { name: 'Solutions', href: '/solutions', description: 'What we install' },  // ADD
  { name: 'About', href: '/about', description: 'Who we are' },
  { name: 'Contact', href: '/contact', description: 'Get in touch' },
  { name: 'Tools', href: '/tools', description: 'Our products' },
];
```

---

## Design Tokens

- Card pattern: match existing `OffersSection.tsx` card style
- Q Suite badges: `bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium`
- Solution 1 emphasis: add `border-primary border-2` or `ring-2 ring-primary/20` to distinguish
- Section backgrounds alternate: `bg-white` → `bg-muted/30` → `bg-white`

---

## Validation

- [ ] Page shows 5 outcome-based solutions (not SaaS subscription tiers)
- [ ] No pricing tiers ($0/$47/$97) anywhere on page
- [ ] No links to `/auth/signup` or `/checkout?tier=`
- [ ] Each solution card shows: problem, what gets installed, Q Suite modules, CTA
- [ ] "Solutions" link added to SiteNav
- [ ] Robots meta allows indexing (not noindex)
- [ ] `ServiceCard.tsx` deleted
- [ ] Responsive: stacks on mobile, grid on desktop
- [ ] `pnpm build` succeeds
