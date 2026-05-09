# SN-SITE-SHAPE-UP-0001: Receipt

**Mission:** Bring Strata Noble Into Full Commercial Alignment  
**Date:** 2026-05-09  
**Final status:** PASS

## Objective

Unify public offer architecture (SN-BCA-001 / `offerings.ts`), canonical routes, deployment redirects, homepage and services narrative, conversion paths, and trust polish on `apps/website`.

## What changed

1. **Canonical routes**
   - Public entry engagements live at `/systems-audit` and `/operations-buildout`.
   - Permanent redirects: `/lead-rescue` → `/systems-audit`, `/pipeline-buildout` → `/operations-buildout` (Next.js `redirects`; legacy bookmarks and search hits consolidate).
   - `next.config.js` cache header regex and `data-analysis` redirect target updated; `phase-3` now targets `/operations-buildout`.

2. **Messaging**
   - Homepage hero and FAQ align with north star: operational systems, Q SUITE, ProofLoop, ANX Vault, ACHIEVERY.
   - Services, contact, how-it-works, tools, proof, solutions verticals, about, footer, nav, and JSON-LD graph updated to Systems Audit / Operations Buildout / Sprint / Operations Command naming.
   - `achievery-preview` tier pricing aligned with `offerings.ts` (removed stale $47 / $97 / $197 product grid).

3. **Conversion**
   - Primary hero CTA remains free diagnostic at `/contact?service=diagnostic`.
   - Operations Buildout form POSTs to `/api/intake/operations-buildout` (re-export of existing pipeline handler). Systems Audit form still POSTs to `/api/intake/lead-rescue` (stable intake enum `LEAD_RESCUE`).

4. **Deployment authority**
   - `netlify.toml` cache headers updated for `/systems-audit` and `/operations-buildout`.

## Files touched (summary)

- Routes: `src/app/(marketing)/systems-audit/`, `operations-buildout/` (new); removed legacy `lead-rescue/` and `pipeline-buildout/` route folders.
- Config: `apps/website/next.config.js`, root `netlify.toml`.
- API: `src/app/api/intake/operations-buildout/route.ts`.
- Copy and SEO: homepage components, contact, services, tools, proof, about, sitemap, `json-ld.ts`, Playwright tests under `tests/revamp/`, `achievery-preview/page.tsx`.

## Validation

| Check | Result |
|--------|--------|
| `npm run type-check` (apps/website) | PASS |
| `npm run build` (apps/website) | PASS |
| `npm run test:ci` (apps/website) | PASS (48 tests) |
| ESLint in build | Skipped by project (`eslint.ignoreDuringBuilds`) |

## Known limitations / follow-up

- **Search Console (Track 6):** After production deploy, submit `https://stratanoble.com/sitemap.xml` and request reindexing for retired URLs so snippets retire cleanly. Not executed from this environment.
- **Lint gate:** Full `next lint` not run as part of build; run locally if you need a lint report for merge.
- **Internal intake labels:** Prisma `IntakeSource` still uses `LEAD_RESCUE` / pipeline source codes for backward compatibility; only public URLs and copy changed.

## Mission success statement

StrataNoble.com public IA now presents one consulting ladder (audit, sprint, buildout, command), separates Q SUITE and ACHIEVERY, routes legacy URLs forward, and sends first-screen visitors into a clear diagnostic path without mixed-era campaign language on primary surfaces.
