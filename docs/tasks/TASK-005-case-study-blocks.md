# TASK-005: Case Study / Proof Blocks

**Mission:** OCS-SN-SITE-REVAMP-001 — Phase 2, Item 5
**Priority:** P2
**Status:** READY
**Depends on:** None (can be built as standalone component and placed anywhere)

---

## Objective

Create minimum 3 anonymized case study blocks that replace abstract outcome bullets with concrete client-type stories showing: problem → fix → result → timeline → tools used.

**Important constraint from mission open questions:** Case study sourcing is a principal decision (question #4). Real client outcomes may not be available yet. These case studies should be constructed from realistic delivery scenarios based on Strata Noble's actual service offerings and tooling. Mark them clearly in code comments as `{/* CASE STUDY: Constructed from delivery model — replace with real client data when available */}`.

---

## Implementation

### 1. Create component: `apps/website/src/components/revamp/CaseStudySection.tsx`

**Design spec:**
- Section heading: "What This Looks Like in Practice"
- Subheading: "Real operational problems. Real system installs. Real results."
- 3 case study cards in a `grid-cols-1 lg:grid-cols-3 gap-8` layout

**Case study data structure:**

```typescript
interface CaseStudy {
  clientType: string;     // e.g. "Home Service Operator"
  industry: string;       // e.g. "HVAC / Plumbing"
  problem: string;        // 2-3 sentences
  fix: string;            // 2-3 sentences describing what was installed
  result: string;         // Quantified outcome
  timeline: string;       // e.g. "21 days"
  modulesUsed: string[];  // e.g. ['Q-ICMS', 'Q-CC']
}
```

**3 Case Studies:**

#### Case Study 1: Home Service Operator
- **Client type**: Home Service Operator — HVAC/Plumbing
- **Problem**: Getting 40+ leads/month from Google Ads but closing less than 15%. No follow-up system. Office manager tracking leads in a notebook. Calls going to voicemail after hours.
- **Fix**: Installed Q-ICMS for lead capture and pipeline tracking. Set up speed-to-lead routing with Q-CC calling infrastructure. Built follow-up sequence for every inquiry.
- **Result**: Follow-up response time dropped from 6+ hours to under 15 minutes. Close rate increased. Pipeline visible for the first time.
- **Timeline**: 21 days (Pipeline Buildout)
- **Modules**: Q-ICMS, Q-CC

#### Case Study 2: Consulting Firm
- **Client type**: Consulting / Professional Services
- **Problem**: Managing 12 active clients across spreadsheets and email. Invoices sent manually, sometimes weeks late. No visibility into which clients were current, overdue, or at risk.
- **Fix**: Installed Q-ICMS for client lifecycle tracking and engagement management. Deployed Q-ARI for invoice tracking and AR dashboard. Weekly review rhythm established via Q-CC.
- **Result**: AR visibility went from zero to real-time. Late invoicing eliminated. Weekly operating rhythm established.
- **Timeline**: 21 days (Pipeline Buildout)
- **Modules**: Q-ICMS, Q-ARI, Q-CC

#### Case Study 3: Real Estate Team
- **Client type**: Real Estate Team — 4-person buyer/seller team
- **Problem**: Lead sources across 3 platforms, no central pipeline. Team members using personal phones with no call logging. Credentials for MLS, CRM, and marketing tools scattered across text threads.
- **Fix**: 48-Hour Lead Rescue to centralize intake, followed by Q-VAULT deployment for credential governance. Pipeline consolidated into Q-ICMS.
- **Result**: All leads funneled to single intake. Credential access audit-trailed. Team pipeline visible to lead agent for first time.
- **Timeline**: 48 hours (Lead Rescue) + 2 weeks (extended engagement)
- **Modules**: Q-ICMS, Q-VAULT, Q-CC

**Card design:**
- White card with subtle top border in primary color
- Client type + industry as header badge
- Problem / Fix / Result as labeled sections within the card
- Timeline displayed as a small pill (e.g., "21 days" in an emerald badge)
- Q Suite module badges at bottom (same pill style as `OffersSection.tsx`)
- `framer-motion` stagger animation on scroll

### 2. Export from index

Add to `apps/website/src/components/revamp/index.ts`:
```typescript
export { CaseStudySection } from './CaseStudySection';
```

### 3. Place on homepage

**File:** `apps/website/src/app/(marketing)/page.tsx`

Insert `<CaseStudySection />` between `<ProofSection />` and `<OffersSection />`:

```tsx
<ProofSection />
<CaseStudySection />     {/* NEW */}
<OffersSection />
```

### 4. Also place on Solutions page

After the solutions grid, before the delivery steps:
```tsx
<CaseStudySection />
```

---

## Validation

- [ ] 3 case study cards render on homepage between Proof and Offers sections
- [ ] 3 case study cards render on Solutions page
- [ ] Each card shows: client type, industry, problem, fix, result, timeline, modules
- [ ] Case studies use realistic operational language (not marketing fluff)
- [ ] Q Suite module badges display correctly
- [ ] Code comments mark these as constructed (pending real client data)
- [ ] Responsive: stacks on mobile, 3-col on desktop
- [ ] `pnpm build` succeeds
