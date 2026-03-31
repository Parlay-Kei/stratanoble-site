# TASK-009: Vertical Landing Pages (2–4 Industries)

**Mission:** OCS-SN-SITE-REVAMP-001 — Phase 3, Item 9
**Priority:** P3
**Status:** READY
**Depends on:** TASK-004 (solutions page provides the outcome-based framework these pages reference)

---

## Objective

Create 2–4 buyer-specific landing pages targeting distinct verticals Strata Noble serves. Each page uses the same operational infrastructure messaging but translates it into the buyer's language, problems, and context.

---

## Verticals (from mission file)

1. **Consultants / Agencies** — `/solutions/consultants`
2. **Home Service Operators** — `/solutions/home-services`
3. **Real Estate Teams** — `/solutions/real-estate`
4. **Local Appointment Businesses** — `/solutions/appointment-businesses`

Route these under `/solutions/[vertical]` to keep the URL structure clean and semantically grouped.

---

## Implementation

### 1. Create route structure

```
apps/website/src/app/solutions/
├── page.tsx                      (existing — outcome-based solutions)
├── SolutionsPageClient.tsx       (existing)
├── layout.tsx                    (existing)
├── consultants/
│   └── page.tsx
├── home-services/
│   └── page.tsx
├── real-estate/
│   └── page.tsx
└── appointment-businesses/
    └── page.tsx
```

### 2. Shared page template

All 4 vertical pages follow the same structure. Create a shared client component or repeat the pattern per page (agent discretion — shared component is cleaner if the data structure is consistent).

**Page structure for each vertical:**

#### Hero
- **Headline**: Industry-specific. E.g., "Operational Infrastructure for [Vertical Name]"
- **Subheadline**: 1–2 sentences naming the specific pain points this vertical faces

#### Problem Block (3–4 pain points)
- Industry-specific versions of the generic problems from ProblemAreasSection
- Each pain point: icon + title + 1-sentence description
- Grid: `grid-cols-1 sm:grid-cols-2 gap-6`

#### What We Install (mapped to Q Suite modules)
- Reuse the "What gets installed" pattern from the solutions page cards
- Show only the modules relevant to this vertical
- Checkmark list with module badges

#### Case Study or Scenario Block
- If a matching case study exists in `CaseStudySection`, embed or reference it
- If not, create a brief inline scenario (same format: client type, problem, fix, result, timeline)

#### Offer Path
- Which offer tier is the recommended entry for this vertical?
- E.g., Home Services → Lead Rescue first, then Pipeline Buildout
- E.g., Consulting → Pipeline Buildout directly (they already have leads, need operations)

#### CTA
- Primary CTA for recommended entry offer
- Secondary CTA for contact/consultation

### 3. Vertical-specific content

#### Consultants / Agencies (`/solutions/consultants`)

**Headline**: "Operational Infrastructure for Consulting Firms and Agencies"
**Subheadline**: "You close deals, manage clients, and deliver work — but your operations run on spreadsheets, email, and memory. We install the systems that give you control."

**Pain points:**
1. Client lifecycle tracked across email threads, not a system
2. Invoices sent late because there's no AR process
3. No weekly operating rhythm — the founder *is* the dashboard
4. Credentials and client access shared via Slack or text

**Modules used:** Q-ICMS (client ops), Q-ARI (receivables), Q-CC (executive visibility), Q-VAULT (credentials)
**Recommended entry:** 21-Day Pipeline Buildout
**Case study reference:** Consulting firm scenario from CaseStudySection

---

#### Home Service Operators (`/solutions/home-services`)

**Headline**: "Operational Infrastructure for Home Service Businesses"
**Subheadline**: "Leads from Google, Yelp, and referrals — but no system to capture, follow up, or track them. We fix that."

**Pain points:**
1. Calls going to voicemail, leads never followed up
2. Office manager tracking leads on paper or in their head
3. No visibility into which jobs closed, which are pending, which fell off
4. Revenue surprises because invoicing is manual

**Modules used:** Q-ICMS (lead pipeline), Q-CC (calling infrastructure), Q-ARI (revenue tracking)
**Recommended entry:** 48-Hour Lead Rescue → then Pipeline Buildout
**Case study reference:** Home service operator scenario from CaseStudySection

---

#### Real Estate Teams (`/solutions/real-estate`)

**Headline**: "Operational Infrastructure for Real Estate Teams"
**Subheadline**: "Multiple lead sources, multiple agents, zero central pipeline. We consolidate your operation."

**Pain points:**
1. Leads coming from 3+ platforms with no central intake
2. Agents using personal phones — no call logging or follow-up tracking
3. Credentials for MLS, CRM, marketing tools scattered across text threads
4. Team lead has no visibility into individual agent pipelines

**Modules used:** Q-ICMS (pipeline consolidation), Q-CC (call tracking), Q-VAULT (credential governance)
**Recommended entry:** 48-Hour Lead Rescue → then Pipeline Buildout
**Case study reference:** Real estate team scenario from CaseStudySection

---

#### Local Appointment Businesses (`/solutions/appointment-businesses`)

**Headline**: "Operational Infrastructure for Appointment-Based Businesses"
**Subheadline**: "Bookings, no-shows, follow-ups, and reviews — running on disconnected tools. We install the system that ties it together."

**Pain points:**
1. Bookings across multiple platforms with no unified view
2. No-show follow-up is manual or doesn't happen
3. Review requests sent inconsistently or not at all
4. No visibility into booking-to-revenue conversion

**Modules used:** Q-ICMS (client tracking), Q-CC (follow-up infrastructure), Q-ARI (revenue from bookings)
**Recommended entry:** 48-Hour Lead Rescue
**Case study reference:** No existing case study — create a brief inline scenario (e.g., med spa or dental practice)

### 4. Metadata per page

Each vertical page gets unique metadata:
```typescript
export const metadata: Metadata = {
  title: '[Vertical Name] Solutions | Strata Noble',
  description: 'Operational infrastructure for [vertical]. [Key pain point]. [What we install].',
  alternates: { canonical: '/solutions/[slug]' },
  robots: { index: true, follow: true },
};
```

### 5. Cross-linking

- Solutions page (`/solutions`): Add a "By Industry" section or link block after the 5 outcome packages pointing to each vertical page
- Each vertical page links back to the main solutions page and to the relevant offer page

---

## Brand Rules

- **USE**: Industry-specific operator language — name their tools (MLS, Google Ads, Yelp, Zapier, Notion, Airtable), name their roles (office manager, team lead, agent), name their workflows (booking, follow-up, invoicing)
- **AVOID**: Generic "scaling" language, one-size-fits-all messaging, agency tone
- Each page should feel like it was written *for* that buyer — not like a template with a variable swapped

---

## Validation

- [ ] 4 vertical landing pages created under `/solutions/[vertical]`
- [ ] Each page has: hero, pain points, what gets installed, case study/scenario, offer path, CTA
- [ ] Pain points are industry-specific (not copied from generic ProblemAreasSection)
- [ ] Module badges show only relevant Q Suite modules per vertical
- [ ] Metadata unique per page with robots index:true
- [ ] Cross-links from main solutions page to verticals
- [ ] Each page inherits SiteShell via solutions layout
- [ ] No "Phase 3" language
- [ ] Responsive layout
- [ ] `pnpm build` succeeds
