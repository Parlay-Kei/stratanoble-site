# AGENTS.md — Strata Noble (Website + Platform)

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS + PostCSS
- **Backend:** Supabase (auth, DB, Edge Functions, storage)
- **Payments:** Stripe
- **Icons:** Lucide React, Heroicons
- **Monitoring:** Sentry (org: strata-noble, project: website)
- **Analytics:** Plausible
- **Testing:** Vitest + React Testing Library (unit), Playwright (E2E)
- **CI/CD:** GitHub Actions → Vercel (prod)
- **Node:** >=20.0.0, npm >=10.0.0
- **Module system:** ESM (`"type": "module"`)
- **Monorepo:** npm workspaces

## Folder Rules

```
apps/
├── platform/         # Main Next.js application (port 3001)
│   └── src/
│       ├── app/          # App Router pages + API routes
│       ├── components/   # UI components
│       ├── lib/          # Utilities, Supabase client, helpers
│       ├── server/       # Server-side logic
│       ├── types/        # TypeScript types
│       └── __tests__/    # Unit/integration tests
├── mobile/           # ACHIEVERY mobile companion (canonical mobile app)
├── website/          # Marketing site (if separate from platform)
└── mcp-servers/      # Custom MCP servers
packages/
├── ui/               # Shared UI components (@strata-noble/ui)
└── utils/            # Shared utilities (@strata-noble/utils)
supabase/
├── functions/        # Edge Functions (Deno)
└── migrations/       # SQL migrations
```

**Path aliases:** `@/*` → `./src/*`

**Monorepo install sequence:**
```bash
npm ci                          # Root workspace
cd apps/platform && npm ci      # Platform deps (MUST run both)
```

## Build Commands

```bash
# From root:
npm run dev           # Start platform dev server (port 3001)
npm run build         # Build platform
npm run validate      # Pre-push validation (type-check + lint + tests)

# From apps/platform:
npm run type-check    # TypeScript check
npm run lint          # ESLint
npm run lint:fix      # Auto-fix lint errors
npm run test          # Vitest (watch mode)
npm run test:run      # Vitest (run once, CI mode)
npm run test:coverage
npm run e2e           # Playwright E2E
npm run e2e:ui        # Playwright with UI

# Quality gates:
npm run contract:check         # API contract verification
npm run brand:check            # Brand consistency validation
```

**Full CI verification:**
```bash
npm run validate   # Runs everything needed before push
```

## Hard Limits

1. **Entity separation:** This is Strata Noble (SN) — never mix with Direct Cuts (DC) code, docs, or deployments.
2. **Server components by default.** Add `'use client'` only when hooks or browser APIs are needed.
3. **Port 3001** for dev — avoids conflicts with other projects.
4. **Environment variables:** `NEXT_PUBLIC_` prefix for client-side only.
5. **Never commit `.env` or `.env.local`.**
6. **Supabase project ID:** `elcsezhfetezkafsiyye`.
7. **Lean release path:** Work from the canonical repo, keep changes narrow, commit directly to `main` when Steve authorizes it, push, and verify the live site. Use a PR only when Steve asks for one or the change is high-risk enough to need review before release.
8. **Offer architecture:** Keep public positioning simple and practical for owner-led small businesses. The current ladder is AI Fit Call, AI Operations Review, First AI Workday Setup, AI Workday Expansion, and Quarterly AI Tune-Up. Do not invent pricing or reintroduce enterprise/platform-first language without Steve's approval.
9. **CSP headers** are enforced in `next.config.js` — update when adding new external domains.
10. **TypeScript/ESLint errors ignored in dev builds** (`ignoreBuildErrors` / `ignoreDuringBuilds` in dev mode) but enforced in production builds and CI.
11. **Canonical codebase (OCS-STRATA-NOBLE-REPO-AUTHORITY-CLEANUP-0001):** Strata Noble work must use `C:\Dev\10_products\StrataNoble` only. Legacy archive: `C:\Dev\00_core\_archive\stratanoble-site_LEGACY_DO_NOT_USE` (quarantined; see `CANONICAL_REPO.md` and `proofs/strata-noble/REPO-AUTHORITY-CLEANUP-0001/CLOSEOUT_ADDENDUM.md`). Do not write product code, docs, or deploy config there unless OCS authorizes legacy recovery.
12. **Supabase Edge Functions are Deno** — different runtime from Node.
