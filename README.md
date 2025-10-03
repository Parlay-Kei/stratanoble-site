# Strata Noble Monorepo

A pnpm-based workspace that powers the Strata Noble marketing site, ACHIEVERY platform, and shared libraries.

## Latest Update — October 3, 2025
- Website (Next.js 14 / React 18) now builds statically after moving analytics instrumentation to a client-only dynamic import.
- ACHIEVERY platform build fixed by removing a duplicate `apps/platform/app` tree and renaming JSX files to `.tsx`.
- ESLint/TypeScript checks restored; lint now runs warning-free (`pnpm --filter @strata-noble/website run lint`).

## Repository Layout
```
apps/
  website/            # Marketing site (Next.js 14)
  platform/           # ACHIEVERY platform (Next.js 15)
packages/
  ui/                 # Shared component library
  utils/              # Shared utilities
  eslint-config/      # Central ESLint ruleset
infra/                # Deployment and infrastructure assets
docs/                 # Product, audit, and process documentation
scripts/              # Automation helpers (tests, deploys)
```

## Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase CLI (database workflows)
- Optional: Expo / EAS CLI for the mobile app

## Installation
```bash
pnpm install
```

Create a local env file for the app you are working on (`apps/website/.env.local`, `apps/platform/.env.local`, etc.) using the provided examples in each package.

## Running Applications
```bash
# Website (localhost:3000)
pnpm --filter @strata-noble/website dev

# ACHIEVERY platform (localhost:3001)
pnpm --filter @strata-noble/platform dev

# Shared package watch mode
pnpm --filter @strata-noble/ui dev
```

## Quality Checks
```bash
# Website lint / type / build / test
pnpm --filter @strata-noble/website run lint
pnpm --filter @strata-noble/website run type-check
pnpm --filter @strata-noble/website run build
pnpm --filter @strata-noble/website run test:ci

# Platform build
pnpm --filter @strata-noble/platform run build
```

## Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for environment variables, third-party integrations, and production checklists.

## Contributing / Support
1. Install dependencies with pnpm.
2. Make changes in the relevant package.
3. Run lint/type-check/build before opening a PR.
4. Reference the deployment guide for production rollouts.

For questions or issues, open a GitHub issue or contact the core platform team.
