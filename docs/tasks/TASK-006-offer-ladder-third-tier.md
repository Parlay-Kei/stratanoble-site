# TASK-006: Offer Ladder — Add Third Tier (Ongoing Operating Support)

**Mission:** OCS-SN-SITE-REVAMP-001 — Phase 2, Item 6
**Priority:** P2
**Status:** READY (with constraints — see notes)
**Depends on:** TASK-001 (naming), TASK-003 (about page no longer blocks third tier)

---

## Objective

Update the offer structure sitewide to show 3 tiers instead of 2:
1. **Lead Rescue** ($997) — 48-hour sprint
2. **21-Day Pipeline Buildout** ($4,997) — full system install
3. **Ongoing Operating Support** (pricing TBD) — recurring operational partnership

**Critical constraint from mission open questions:**
- Question #2: Public name and price point for third tier is a principal decision — **not yet made**
- Question #3: Whether to retire/qualify "no ongoing retainers" language — **not yet decided**

**Therefore:** This task adds the third tier with **tentative language only**. No price displayed. Name uses "Ongoing Operating Support" as placeholder. Copy frames it as "for businesses that want continued operational partnership" without contradicting existing "no retainers" language on the Lead Rescue and Pipeline Buildout pages.

---

## Implementation

### 1. Update `apps/website/src/components/revamp/OffersSection.tsx`

Current state: 4 cards (Lead Rescue, Revenue Control, Operations Visibility, Secure Infrastructure). These are deployment types, not the offer ladder.

**Decision:** The `OffersSection` currently shows "What We Deploy" — deployment categories. The offer ladder (Rescue → Buildout → Ongoing) is a different concept. Two options:

**Option A (recommended):** Create a NEW component `OfferLadderSection.tsx` that shows the 3-tier offer ladder, and keep `OffersSection.tsx` as the deployment categories.

**Option B:** Replace `OffersSection.tsx` with the 3-tier ladder and move deployment categories to the Solutions page.

**Go with Option A.**

### 2. Create component: `apps/website/src/components/revamp/OfferLadderSection.tsx`

**Design spec:**
- Section heading: "How to Work With Us"
- 3 cards in a horizontal layout: `grid-cols-1 md:grid-cols-3 gap-8`
- Visual hierarchy: Card 2 (Pipeline Buildout) should be slightly elevated/emphasized as the "recommended" path

**Card content:**

#### Tier 1: Lead Rescue
- **Name**: "48-Hour Lead Rescue"
- **Price**: "$997"
- **Tagline**: "Stop the leak. Get receipts."
- **Description**: "We audit your lead flow, plug the biggest gaps, and deliver proof of the fix — all within 48 hours."
- **Includes**: Lead flow audit, intake capture fix, follow-up sequence, ProofLoop receipt pack
- **CTA**: "Start Lead Rescue" → `/lead-rescue`
- **Badge**: None

#### Tier 2: 21-Day Pipeline Buildout
- **Name**: "21-Day Pipeline Buildout"
- **Price**: "Starting at $4,997"
- **Tagline**: "Full operational system install."
- **Description**: "Complete pipeline infrastructure: intake, CRM, automations, dashboards, and training. You own it. We hand it off."
- **Includes**: Custom CRM setup, email sequences, 2 automation workflows, milestone dashboard, documentation, training
- **CTA**: "Apply for the Buildout" → `/phase-3`
- **Badge**: "Most Popular" or "Recommended"

#### Tier 3: Ongoing Operating Support
- **Name**: "Ongoing Operating Support"
- **Price**: "Custom" (no dollar amount — blocked on principal decision)
- **Tagline**: "Keep the rhythm. Keep the visibility."
- **Description**: "For businesses that want continued operational partnership after the buildout. Weekly reviews, system tuning, and executive visibility — maintained for you."
- **Includes**: Weekly executive review, system monitoring, ongoing configuration, priority support
- **CTA**: "Contact Us" → `/contact`
- **Badge**: "Coming Soon" or leave blank
- **Design**: Slightly muted compared to Tiers 1–2 (use dashed border or muted background to signal "available but not primary")

**Visual design:**
- Cards follow existing pattern: `bg-white border rounded-xl p-8 shadow-sm`
- Tier 2 gets: `border-primary border-2 shadow-lg` + "Recommended" badge
- Tier 3 gets: `border-dashed border-gray-300` or similar tentative styling
- Each card shows price (large, bold), tagline, description, includes list (checkmarks), CTA button
- `framer-motion` stagger animations

### 3. Export from index

Add to `apps/website/src/components/revamp/index.ts`:
```typescript
export { OfferLadderSection } from './OfferLadderSection';
```

### 4. Place on homepage

**File:** `apps/website/src/app/(marketing)/page.tsx`

Insert `<OfferLadderSection />` after `<OffersSection />` (or replace — agent discretion based on flow):

```tsx
<OffersSection />
<OfferLadderSection />    {/* NEW */}
<LeadLeakCheckSection />
```

### 5. Update Phase-3 page "What happens after" FAQ

**File:** `apps/website/src/app/(marketing)/phase-3/page.tsx`

In the `Phase3FAQ` component, update the "What happens after the 21 days?" answer:

**Current:** "You own the system. We provide full documentation and training. If you need ongoing support, we can discuss a support package, but it's not required."

**New:** "You own the system. We provide full documentation and training. For businesses that want continued operational partnership, we offer Ongoing Operating Support — weekly reviews, system tuning, and maintained visibility. It's optional, not required."

### 6. DO NOT update these pages (yet)

- **Lead Rescue page** — keep existing language intact, no mention of third tier
- **About page** — handled by TASK-003, which already uses tentative third-tier language
- **Any page with "no ongoing retainers"** — do not remove this language. It stays until the principal decision is made. The third tier is additive, not contradictory.

---

## Validation

- [ ] 3-tier offer ladder renders on homepage
- [ ] Tier 1 shows $997 with CTA → `/lead-rescue`
- [ ] Tier 2 shows $4,997 with CTA → `/phase-3`, has "Recommended" emphasis
- [ ] Tier 3 shows "Custom" pricing with CTA → `/contact`, visually tentative
- [ ] No absolute price on Tier 3
- [ ] "No ongoing retainers" language NOT removed from any existing page
- [ ] Phase-3 FAQ updated with optional ongoing support mention
- [ ] Cards responsive: stack on mobile, 3-col on desktop
- [ ] `pnpm build` succeeds
