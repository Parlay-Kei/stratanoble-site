# TASK-002: Homepage — Add Problem Area Blocks Beneath Hero

**Mission:** OCS-SN-SITE-REVAMP-001 — Phase 1, Item 1
**Priority:** P1
**Status:** READY
**Depends on:** None (independent of TASK-001)

---

## Objective

Add a second layer to the homepage between `OperationalHero` and `HowItWorksSection` that communicates the 5–6 core problem areas Strata Noble solves. This creates the "operating systems firm" positioning layer the mission requires.

The current homepage jumps from the hero straight into "How We Work" — there's no section that says "here are the specific business problems we fix."

---

## Context — Current homepage component order

```
<OperationalHero />        ← hero with CTAs (good, keep)
<HowItWorksSection />      ← 4-step process (keep, but should come after problems)
<QSuiteSection />          ← Q Suite module cards (keep)
<ProofSection />           ← proof items (keep)
<OffersSection />          ← 4 deployment offers (keep)
<LeadLeakCheckSection />   ← lead leak check form (keep)
```

---

## Implementation

### 1. Create new component: `apps/website/src/components/revamp/ProblemAreasSection.tsx`

**Design spec:**
- Section with `bg-white` background, `py-16`
- Section header: "What We Fix" or "Operational Problems We Solve"
- Subheader: "Service businesses lose revenue to the same 5–6 operational failures. We install the systems that eliminate them."
- Grid layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`, max-w-6xl centered
- Each problem card:
  - Icon (use Lucide icons consistent with existing components)
  - Problem title (bold, `text-lg`)
  - 1–2 sentence description
  - Subtle border + hover shadow (match existing card patterns in `OffersSection.tsx`)
- Use `framer-motion` `whileInView` animations consistent with other revamp sections

**Problem areas (6 cards):**

| # | Title | Description | Icon suggestion |
|---|-------|-------------|-----------------|
| 1 | Lead Leakage | Inquiries arrive but nobody follows up within the window. Leads go cold. Revenue walks. | `PhoneOff` or `UserMinus` |
| 2 | Pipeline Blindness | No visibility into where deals stand. The pipeline lives in someone's head or a spreadsheet. | `EyeOff` or `BarChart3` |
| 3 | Revenue Gaps | Invoices sent late, payments tracked manually, AR sits in an Excel file. Cash flow surprises. | `DollarSign` or `TrendingDown` |
| 4 | Execution Drift | Work gets done but nobody reviews it. No weekly rhythm, no delivery health check. | `Clock` or `AlertTriangle` |
| 5 | Credential Chaos | Passwords in Slack threads, API keys in Google Docs, no audit trail on who accessed what. | `ShieldOff` or `KeyRound` |
| 6 | Tool Sprawl | Six tools that don't talk to each other. Data lives in silos. Every handoff is manual. | `Blocks` or `Unplug` |

**Brand rules (from mission file):**
- USE: lived operator experience, infrastructure language, execution credibility
- AVOID: generic scaling language, agency aesthetics, startup/motivational tone

### 2. Export from index

Add to `apps/website/src/components/revamp/index.ts`:
```typescript
export { ProblemAreasSection } from './ProblemAreasSection';
```

### 3. Update homepage

**File:** `apps/website/src/app/(marketing)/page.tsx`

Insert `<ProblemAreasSection />` between `<OperationalHero />` and `<HowItWorksSection />`:

```tsx
import { ProblemAreasSection } from '@/components/revamp/ProblemAreasSection';

export default function HomePage() {
  return (
    <>
      <SmartConsultingBar />
      <main className="min-h-screen relative overflow-hidden">
        <OperationalHero />
        <ProblemAreasSection />    {/* NEW */}
        <HowItWorksSection />
        <QSuiteSection />
        <ProofSection />
        <OffersSection />
        <LeadLeakCheckSection />
      </main>
    </>
  );
}
```

---

## Design Tokens (from `tailwind.config.js`)

- Primary (navy): `#003366` → use `text-primary`, `bg-primary/10`
- Emerald: `#047857` → use for accent/success indicators
- Gold: `#f1c095` → use sparingly for emphasis
- Font: Inter (sans), Bitter (serif)
- Card pattern: `bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`

---

## Validation

- [ ] 6 problem area cards render on homepage between hero and "How We Work"
- [ ] Cards are responsive: 1-col mobile, 2-col tablet, 3-col desktop
- [ ] `framer-motion` scroll animations work (staggered `whileInView`)
- [ ] Section follows brand rules: operator language, no agency/startup tone
- [ ] Cards don't link anywhere — they're descriptive, not navigational
- [ ] Site builds without errors: `pnpm build`
- [ ] No hydration errors (component is `'use client'` with proper imports)
