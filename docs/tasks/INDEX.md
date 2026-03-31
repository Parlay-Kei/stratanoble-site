# Site Revamp Dev Tasks — OCS-SN-SITE-REVAMP-001

**Mission:** OCS-SN-SITE-REVAMP-001
**Generated:** 2026-03-29
**Codebase:** `C:\Dev\10_products\StrataNoble\apps\website`

---

## Phase 1 — Foundation ✅ COMPLETE

| Task | File | Description | Status |
|------|------|-------------|--------|
| [TASK-001](./TASK-001-phase3-naming-cleanup.md) | Nav, Footer, Phase-3 page, About + others | Kill "Phase 3" from all public copy | ✅ Done |
| [TASK-002](./TASK-002-homepage-problem-areas.md) | New component + homepage | Add 6 problem area blocks beneath hero | ✅ Done |
| [TASK-003](./TASK-003-about-page-rewrite.md) | About page | Full rewrite to operator-led firm positioning | ✅ Done |

## Phase 2 — Architecture ✅ COMPLETE

| Task | File | Description | Status |
|------|------|-------------|--------|
| [TASK-004](./TASK-004-solutions-page-rebuild.md) | Solutions page + nav | Replace SaaS tiers with 5 outcome-based solutions | ✅ Done |
| [TASK-005](./TASK-005-case-study-blocks.md) | New component + homepage + solutions | 3 anonymized case study proof blocks | ✅ Done |
| [TASK-006](./TASK-006-offer-ladder-third-tier.md) | New component + homepage + phase-3 FAQ | Add 3-tier offer ladder with tentative third tier | ✅ Done |

## Phase 3 — Platform & Expansion ✅ COMPLETE

| Task | File | Description | Status |
|------|------|-------------|--------|
| [TASK-007](./TASK-007-tools-page-reframe.md) | Tools page | Reframe around business value, separate live vs in-dev | ✅ Done |
| [TASK-008](./TASK-008-qsuite-platform-page.md) | Platform page | Replace stale roadmap with Q Suite explainer | ✅ Done |
| [TASK-009](./TASK-009-vertical-landing-pages.md) | 4 new pages under /solutions/ | Industry-specific landing pages | ✅ Done |
| [TASK-010](./TASK-010-how-it-works-page.md) | New page + cross-links | Detailed 4-step delivery model page | ✅ Done |

## Flagged Items ✅ COMPLETE

| Task | File | Description | Status |
|------|------|-------------|--------|
| [TASK-011](./TASK-011-footer-copy-update.md) | SiteFooter.tsx | Update footer copy to match new positioning | ✅ Done |

---

## Summary — All 11 tasks delivered

**New pages created:** `/how-it-works`, `/platform` (rewritten), `/solutions/consultants`, `/solutions/home-services`, `/solutions/real-estate`, `/solutions/appointment-businesses`

**Pages rewritten:** About, Solutions (main), Tools, Platform

**Components created:** ProblemAreasSection, CaseStudySection, OfferLadderSection, ToolsPageClient, PlatformPageClient, VerticalSolutionPageClient, HowItWorksPage

**Shared data:** verticalContent.ts (4 verticals with typed content)

**Cross-links added:** HowItWorksSection → /how-it-works, About → /how-it-works, Solutions delivery strip → /how-it-works, QSuiteSection → /platform, Solutions "By Industry" block → 4 vertical pages

**Nav updated:** Solutions, How It Works, About, Contact, Tools + 2 CTA buttons

**Footer updated:** Positioning copy aligned, bottom tagline aligned

---

## Open Principal Decisions (affect final copy polish, not structure)

1. **Q Suite public brand name** — Is "Q Suite" the client-facing name? (Affects `/platform` final copy)
2. **Ongoing support tier pricing/naming** — Public name and price for third tier (Affects offer ladder tier 3, how-it-works step 4)
3. **"No ongoing retainers" language** — Retire, qualify, or keep on current offer pages?
4. **Case study sourcing** — Real client outcomes vs constructed from delivery history? (Case study blocks are marked with constructed comments, ready for swap)

See mission file: `C:\Dev\00_core\StrataNoble-OPS\docs\OCS-SN-SITE-REVAMP-001.md`
