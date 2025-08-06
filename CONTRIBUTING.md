# Contributing to Strata Noble

## Repository Structure

This monorepo uses PNPM workspaces and follows a clean, phase-gated layout:

```
strata-noble/
├── apps/                    # Executable applications
│   ├── website/             # Next.js marketing/public site
│   └── platform/            # Future internal app (Next.js + Supabase)
├── packages/                # Shared libraries & design system
│   ├── ui/                  # shadcn-based component library
│   ├── utils/               # TypeScript utilities
│   └── eslint-config/       # Central lint rules
├── infra/                   # Infrastructure as Code & deployment
│   ├── netlify/             # Netlify TOML, build hooks, edge functions
│   ├── supabase/            # SQL migrations & edge functions
│   └── github/              # Actions workflows, Dependabot, CODEOWNERS
├── docs/                    # Documentation
├── tests/                   # End-to-end & unit tests
```

## Development Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start development server:
   ```bash
   pnpm dev
   ```

3. Run tests:
   ```bash
   pnpm test
   ```

## Branch Strategy

- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `chore/*` - Maintenance/restructure branches
- `hotfix/*` - Emergency fixes

## Commit Conventions

We use Conventional Commits with scopes:

- `feat(website):` - New features for the website app
- `feat(platform):` - New features for the platform app  
- `feat(ui):` - New UI components
- `fix(infra):` - Infrastructure fixes
- `docs:` - Documentation updates
- `chore:` - Maintenance tasks

## Code Quality

All PRs must pass:
- ESLint checks
- TypeScript compilation
- Unit tests
- Build verification

## Release Flow

1. Create feature branch from `develop`
2. Implement changes with tests
3. Open PR to `develop`
4. After approval and CI pass, merge to `develop`
5. Deploy to staging for testing
6. Merge `develop` to `main` for production deployment