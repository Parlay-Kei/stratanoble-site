# TASK-010: "How It Works" Section or Page

**Mission:** OCS-SN-SITE-REVAMP-001 — Phase 3, Item 10
**Priority:** P3
**Status:** READY
**Depends on:** None

---

## Objective

Create a dedicated "How It Works" page (or expanded section) that explains Strata Noble's 4-step delivery model in detail: Discovery → Implementation → Handoff → Optional Ongoing Support.

---

## Current State

The homepage already has `HowItWorksSection.tsx` with a 4-step summary (Diagnose, Install, Run the Rhythm, Measure). The about page has the "Infrastructure-First Delivery" section with 4 steps. The solutions page has a delivery strip.

**Problem:** These are brief references — none of them give a buyer enough detail to understand *what actually happens* when they engage Strata Noble.

**Decision: Page vs Section.** The mission says "section or page." Given that Phases 1–2 already added brief references in 3 places, this task should create a **dedicated page** at `/how-it-works` that serves as the definitive explainer. The existing sections stay as summaries that link to this page.

---

## Implementation

### 1. Create page

```
apps/website/src/app/(marketing)/how-it-works/
└── page.tsx
```

Since this is inside the `(marketing)` route group, it automatically inherits `SiteShell` (nav/footer).

### 2. Page structure

#### Hero
- **Headline**: "How We Work"
- **Subheadline**: "Every engagement follows the same proven delivery model. Scoped, documented, and transferable."

#### 4-Step Delivery Model (detailed)

Each step gets its own visual block — not a summary card, but a full section with detail.

**Step 1: Discovery**
- **Visual**: Number badge + title + border accent
- **What happens**: "We map your current workflows, identify friction points, and define a bounded scope for the engagement. Discovery is typically a 60-minute kickoff call plus async review of your existing tools and processes."
- **What you provide**: "Access to your current tools, a walkthrough of your process, and clarity on which problems hurt most."
- **What we deliver**: "A scoped engagement plan with specific deliverables, timeline, and acceptance criteria."
- **Timeline**: "Same-day for Lead Rescue. Days 1–3 for Pipeline Buildout."

**Step 2: Implementation**
- **What happens**: "We deploy modules, configure pipelines, wire integrations, and build the operating infrastructure specified in the engagement plan. We work inside your environment — not a sandbox."
- **What you provide**: "Admin access to relevant tools. Responsive availability for questions (async is fine)."
- **What we deliver**: "Working systems configured for your business. Every module tested with real data."
- **Timeline**: "48 hours for Lead Rescue. Days 3–18 for Pipeline Buildout."

**Step 3: Handoff**
- **What happens**: "Documentation, training walkthrough, proof pack delivery. We hand you everything — credentials, configurations, video walkthroughs, written docs — stored in your ANX Vault."
- **What you provide**: "Time for a training walkthrough (typically 45–60 minutes)."
- **What we deliver**: "Complete handoff package: documentation, video walkthroughs, ProofLoop verification receipts, and vault access."
- **Timeline**: "Included in the 48-hour window for Lead Rescue. Days 18–21 for Pipeline Buildout."

**Step 4: Optional Ongoing Support**
- **What happens**: "For businesses that want continued operational partnership, we maintain the rhythm — weekly executive reviews, system tuning, configuration updates, and priority support."
- **What you provide**: "Recurring time for weekly review (30 minutes)."
- **What we deliver**: "Ongoing operational visibility, system health monitoring, and continuous tuning."
- **Timeline**: "Ongoing, post-handoff. Not required."
- **Note**: Use tentative language. No pricing. Link to contact page. (Pending principal decision on third tier naming/pricing.)

**Design per step:**
- Left: large step number (1–4) in a `w-16 h-16 rounded-full bg-primary text-white` circle
- Right: title + 4 blocks (What happens, What you provide, What we deliver, Timeline)
- Alternating visual pattern or consistent left-aligned layout
- Connecting line or arrow between steps (vertical on mobile, horizontal or stepped on desktop)
- Step 4 gets muted/tentative styling (dashed border, `bg-gray-50`)

#### Engagement Types (brief comparison)

Small comparison block showing the two (or three) engagement types:

| | Lead Rescue | Pipeline Buildout | Ongoing Support |
|--|------------|-------------------|-----------------|
| Duration | 48 hours | 21 days | Ongoing |
| Price | $997 | Starting at $4,997 | Custom |
| Scope | Lead flow audit + fix | Full system install | Maintenance + rhythm |
| Handoff | Receipt pack | Full proof suite | Weekly reviews |

- Lead Rescue and Pipeline Buildout get solid borders; Ongoing Support gets dashed

#### CTA
- **Headline**: "Ready to Get Started?"
- Primary: "Start the 48-Hour Lead Rescue" → `/lead-rescue`
- Secondary: "Apply for the 21-Day Pipeline Buildout" → `/phase-3`
- Tertiary text: "Not sure which? Talk to us." → `/contact`

### 3. Metadata

```typescript
export const metadata: Metadata = {
  title: 'How It Works | Strata Noble',
  description: 'Our 4-step delivery model: Discovery, Implementation, Handoff, and Optional Ongoing Support. Scoped engagements for service businesses.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How It Works | Strata Noble',
    description: 'Scoped operational infrastructure delivery in 4 steps.',
    url: '/how-it-works',
  },
  robots: { index: true, follow: true },
};
```

### 4. Update existing "How It Works" references to link to this page

Add "Learn more →" links from:

**a) `apps/website/src/components/revamp/HowItWorksSection.tsx`** — Add a link below the 4-step strip:
```tsx
<Link href="/how-it-works" className="text-primary font-semibold text-sm hover:underline">
  See the full delivery model →
</Link>
```

**b) `apps/website/src/app/(marketing)/about/page.tsx`** — In the "Infrastructure-First Delivery" section, add a link after the 4 steps:
```tsx
<Link href="/how-it-works" className="text-primary font-semibold hover:underline">
  See the full delivery model →
</Link>
```

**c) Solutions page delivery strip** — Same pattern.

### 5. Nav consideration

Add "How It Works" to the SiteNav `navigation` array if the page warrants top-level visibility:

```typescript
const navigation = [
  { name: 'Solutions', href: '/solutions', description: 'What we install' },
  { name: 'How It Works', href: '/how-it-works', description: 'Our delivery model' },  // ADD
  { name: 'About', href: '/about', description: 'Who we are' },
  { name: 'Contact', href: '/contact', description: 'Get in touch' },
  { name: 'Tools', href: '/tools', description: 'Our products' },
];
```

**Agent discretion:** If 5 text links + 2 CTA buttons feels crowded in the desktop nav, consider dropping "Tools" from the top nav (it's linked from the footer, solutions page, and homepage) and replacing with "How It Works". Or keep "Tools" and skip adding "How It Works" to nav — it's linked from the homepage and about page inline.

---

## Validation

- [ ] Dedicated `/how-it-works` page exists inside `(marketing)` route group
- [ ] 4 steps explained in detail (not just titles + one-liners)
- [ ] Each step shows: what happens, what the client provides, what SN delivers, timeline
- [ ] Step 4 uses tentative language, no pricing, muted styling
- [ ] Engagement comparison table shows Lead Rescue vs Pipeline Buildout vs Ongoing
- [ ] "Learn more" links added to HowItWorksSection, about page, and solutions delivery strip
- [ ] Metadata with robots index:true
- [ ] No "Phase 3" language
- [ ] Responsive layout
- [ ] `pnpm build` succeeds
