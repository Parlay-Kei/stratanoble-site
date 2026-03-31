# TASK-007: Tools Page — Reframe Around Business Value

**Mission:** OCS-SN-SITE-REVAMP-001 — Phase 3, Item 7
**Priority:** P3
**Status:** READY
**Depends on:** None

---

## Objective

Rewrite the Tools page so each tool leads with the business problem it solves — not operational mechanics or internal naming. Visually separate live tools (ProofLoop, ANX Vault) from in-development tools (ACHIEVERY). Keep all product names.

---

## Current State Problems

**File:** `apps/website/src/app/(marketing)/tools/page.tsx`

1. **Operational framing** — descriptions explain *how* the tools work, not *why a buyer cares*. "Build integrity receipts" means nothing to a service business owner.
2. **No visual separation** between shipped tools (ProofLoop, ANX Vault) and in-development (ACHIEVERY). All three are displayed identically in a 3-col grid.
3. **Hero still uses narrow framing** — "Tools Included With Every Install" is accurate but misses the business-value opportunity.
4. **"Coming Soon" in tagline** — ACHIEVERY's tagline is "Operator scorecard (Coming Soon)" — the parenthetical belongs on a badge, not in the tagline itself.
5. **No connection to Q Suite** — tools page doesn't reference the module architecture that powers these tools.

---

## Implementation

### Full rewrite of `apps/website/src/app/(marketing)/tools/page.tsx`

Keep as server component (metadata export). Add `'use client'` wrapper component if framer-motion animations are needed (follow the same pattern used in solutions page: `page.tsx` exports metadata + renders a client component).

**Page structure:**

#### 1. Hero
- **Headline**: "Operational Tools That Ship With Every Engagement"
- **Subheadline**: "These aren't add-ons. They're how we prove the work, secure the handoff, and give you visibility into your operation."

#### 2. Live Tools Section
- **Section heading**: "Included With Every Install"
- **Visual treatment**: Full-width cards, slightly elevated compared to the in-dev section. Use `bg-white border border-gray-200 rounded-xl shadow-sm` with a subtle green/emerald accent to signal "live."

**ProofLoop — reframed:**

| Field | Current | New |
|-------|---------|-----|
| Tagline | "Trust engine for every delivery" | "Verified proof that the work was done right" |
| Description | Internal mechanics about build passes and auth flow verification | "Every engagement includes a proof pack — documented evidence that your system was built, tested, and delivered as specified. No guesswork. No 'trust me.' Receipts." |
| Features label | "What You Get" | "What's in the proof pack" |
| Features | Build integrity receipts, Auth flow verification, Deployment proof pack, Handoff documentation | "System build verification", "Flow testing results", "Deployment confirmation", "Complete handoff documentation" |
| Included line | Keep but reword: "Lead Rescue includes a receipt pack. Pipeline Buildout includes the full verification suite." |

**ANX Vault — reframed:**

| Field | Current | New |
|-------|---------|-----|
| Tagline | "Your delivery folder" | "Every credential, asset, and document — secured and handed off" |
| Description | Internal mechanics about storage | "All deliverables from your engagement — credentials, configurations, video walkthroughs, documentation — stored in a private vault. You own it. Access is governed and audit-trailed." |
| Features | Keep, but reword to business value: "Private asset vault", "Governed credential access", "Video walkthroughs of your system", "Complete handoff package" |
| Included line | "Every engagement includes vault access with all deliverables." |

#### 3. In Development Section
- **Section heading**: "In Development"
- **Visual treatment**: Visually distinct from live tools. Use `bg-gray-50 border border-dashed border-gray-300 rounded-xl` or similar muted/tentative styling. Badge with "In Development" label.
- **Section intro line**: "We build tools as we need them. These are next on the roadmap."

**ACHIEVERY — reframed:**

| Field | Current | New |
|-------|---------|-----|
| Tagline | "Operator scorecard (Coming Soon)" | "Operator scorecard for service businesses" |
| Description | Current is fine but add business context: "Track daily progress, pipeline health, and team execution in one view. Built for operators who want to see what moved, what stalled, and what needs attention — without digging through dashboards." |
| Status badge | Move "In Development" to a badge on the card header (not in the tagline) |
| Features | Keep current list, reword: "Daily progress tracking", "Pipeline health scoring", "Team execution visibility", "Milestone and alert system" |
| Included line | "Early access included with Pipeline Buildout engagements." |
| **Note** | ACHIEVERY is a web component and mobile app within the StrataNoble platform — make sure copy doesn't imply it's a separate product. It's part of the Strata Noble ecosystem. |

#### 4. Q Suite Connection Block (new, brief)
- Small block between live tools and in-dev section, or at bottom before CTA
- **Copy**: "All Strata Noble tools are powered by the Q Suite modular framework — the same operating architecture we deploy for clients."
- Link: "See our solutions →" → `/solutions`
- Keeps it light — not a full Q Suite page (that's TASK-008)

#### 5. CTA Section
- **Headline**: "Need operational infrastructure?"
- **Subheadline**: "These tools ship as part of your engagement. Start with the 48-Hour Lead Rescue."
- Two buttons: Lead Rescue (primary), Contact Us (secondary)

---

## Validation

- [ ] ProofLoop and ANX Vault lead with business value, not internal mechanics
- [ ] ACHIEVERY is visually separated with muted/tentative styling
- [ ] "Coming Soon" is NOT in ACHIEVERY's tagline — it's a badge only
- [ ] ACHIEVERY copy does not imply it's a separate platform
- [ ] Q Suite connection block present
- [ ] No "Phase 3" references
- [ ] Responsive: stacks on mobile, grid on desktop
- [ ] `pnpm build` succeeds
