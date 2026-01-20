# Strata Noble CI/CD Configuration

## Project Structure

Strata Noble is a **monorepo** with:
- Root level: Workspace management, shared scripts, agent orchestration
- `apps/platform`: Main Next.js application
- `packages/ui`: Shared UI components
- `packages/utils`: Shared utilities

## Bash Commands

### Development
- `npm run dev`: Start platform development server (port 3001)
- `npm run build`: Build platform application
- `npm run start`: Start platform production server

### Testing
- `cd apps/platform && npm run test`: Run Vitest tests
- `cd apps/platform && npm run test:run`: Run tests once (CI mode)
- `cd apps/platform && npm run test:coverage`: Generate coverage report
- `cd apps/platform && npm run e2e`: Run Playwright E2E tests
- `cd apps/platform && npm run e2e:ui`: Run E2E with Playwright UI

### Code Quality
- `npm run validate`: Run pre-push validation (IMPORTANT - use before committing)
- `cd apps/platform && npm run type-check`: TypeScript checking
- `cd apps/platform && npm run lint`: ESLint checking
- `cd apps/platform && npm run lint:fix`: Auto-fix lint errors

### Contract & Brand Checks
- `npm run contract:check`: Verify API contracts
- `npm run contract:version-check`: Check contract versions
- `npm run brand:check`: Brand consistency validation

### Agent System
- `npm run agents:list`: List all autonomous agents
- `npm run agents:status`: Check agent status
- `npm run agents:logs`: Tail agent logs

## Code Style

IMPORTANT: This project has strict conventions:
- TypeScript strict mode enabled
- React 19 + Next.js 15 (App Router)
- Tailwind CSS for styling
- Lucide React for icons
- Server components by default

**File Organization:**
- Components in `apps/platform/src/components/`
- API routes in `apps/platform/src/app/api/`
- Utilities in `packages/utils/src/`
- UI components in `packages/ui/src/`

## Workflow

IMPORTANT CI Integration Steps:

1. **Pre-commit hook**:
   - Runs `npm run validate` (includes type-check, lint, tests)
   - Contract checking
   - Brand consistency check

2. **GitHub Actions on push**:
   - Install root dependencies
   - Install platform dependencies
   - Type check
   - Lint
   - Run tests
   - Build application
   - Contract verification
   - Brand consistency check

3. **On Pull Requests (additional)**:
   - Playwright E2E tests
   - Upload test artifacts
   - Security audit

4. **Manual verification**:
   ```bash
   npm run validate  # This runs everything needed
   ```

## Testing Strategy

- **Unit/Integration**: Vitest with React Testing Library
- **E2E**: Playwright for user journeys
- **Coverage**: Minimum 80% for critical paths
- Use `happy-dom` for fast DOM testing

## Build System

- Next.js 15 with App Router
- Build outputs to `apps/platform/.next`
- Port 3001 for development (avoids conflicts)
- Environment variables prefixed based on usage (NEXT_PUBLIC_ for client-side)

## Monorepo Management

IMPORTANT - Dependencies:
- Root `npm ci` installs workspace management
- Must also run `cd apps/platform && npm ci` for platform deps
- Packages are linked via workspace protocol

## Contract System

The project uses contract checking for API stability:
- Run `npm run contract:check` before breaking changes
- Version contracts with `npm run contract:version-check`
- CI fails if contracts break without version bump

## Brand Consistency

- Automated brand checking with `npm run brand:check`
- Validates colors, fonts, spacing, component usage
- CI enforces brand guidelines

## Security

- Supabase RLS policies strictly enforced
- Run `npm run supabase:verify` to check configuration
- Never commit `.env` or `.env.local` files
- Use `NEXT_PUBLIC_` prefix only for truly public vars

## Agent Integration

This project has autonomous agents that:
- Monitor code quality
- Run automated checks
- Generate reports
- Schedule maintenance tasks

Agents run via: `npm run agents:schedule`
Check status: `npm run agents:status`

## Common CI Failures

**Type errors in apps/platform:**
- Navigate to `apps/platform` directory first
- Run `npm run type-check` there
- Check for React 19/Next 15 breaking changes

**Test failures:**
- Run `cd apps/platform && npm run test` locally
- Check for environment variable requirements
- Ensure test database is seeded

**Build failures:**
- Verify all workspace dependencies are installed
- Check for missing environment variables
- Ensure Next.js config is valid

**Contract failures:**
- Review API changes that broke contracts
- Update contract version if intentional breaking change
- Coordinate with downstream consumers

## Documentation

- Docs managed by autonomous agent: `npm run docs:admin`
- Auto-generate TOC: `npm run docs:toc`
- Full doc audit: `npm run docs:full`

## Pre-Push Checklist

1. Run `npm run validate` from root
2. If E2E tests needed: `cd apps/platform && npm run e2e`
3. Check agent logs: `npm run agents:logs`
4. Verify contracts: `npm run contract:check`
5. Check brand: `npm run brand:check`

## Done Criteria

**No task is complete until:**

1. **Tests pass**
   ```bash
   npm run validate
   ```

2. **Manual verification performed** (if UI change)
   - Dev server: `npm run dev` → http://localhost:3001
   - Key routes: `/`, `/pricing`, `/dashboard`

3. **Changes documented** in response with validation evidence

**If verification not possible**, explicitly state:
```
⚠️ Unable to verify: [reason]
Recommend manual check of: [specific thing]
```

See `C:\Dev\.claude-anx\validation-protocol.md` for full protocol.

## User Preferences

- When the user mentions "staged changes", refer to VSCode Source Control panel
- Always use GitHub admin agent for commits, pushes, PRs
- When instructed to "add to memory", update this CLAUDE.md directly
- On startup: --dangerously-skip-permissions
