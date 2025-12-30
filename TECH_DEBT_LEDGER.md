# TECH DEBT LEDGER

*Strata Noble - Ranked by Risk × Interest Cost*

## Top 3 Priority Items (Week 1 Focus)

### 1. **Zero Test Coverage on Critical Flows** ✅ **PAID OFF - 2025-12-29 (platform scope)**
**Principal**: 16 hours (implement test harness + 3 critical tests) → **PAID: 16 hours**
**Interest**: 8 hours/week (debugging time without tests) → **ELIMINATED (platform)**
**Risk**: Critical (silent auth/dashboard failures in production) → **MITIGATED (platform)**
**Trigger Event**: Any feature deployment or auth change
**Business Impact**: Cannot ship safely, user trust erosion from broken features

**✅ PAYOFF COMPLETED (apps/platform only)**:
- Test suites: 4 files, 28 tests passing
- Auth domain tests: 9 tests (validation, sessions, password strength)
- Onboarding integration tests: 2 tests (status handler)
- Middleware redirect tests: 14 tests (all gating scenarios)
- Auth login integration tests: 3 tests (success, failure, validation)
- **CI Gate**: Tests run on every push (`npm run test:run`)
- **Build verification**: `npm run build` passes with zero TypeScript errors
- **Scope limitation**: packages/ui, packages/utils not covered (see #11)
- **Command receipts**:
  ```
  cd apps/platform && npm run test:run → 28 passed (4 files, 1.10s)
  cd apps/platform && npm run build → Compiled successfully, 16 routes generated
  ```

### 2. **No Observability Infrastructure** ✅ **PAID OFF - 2025-12-29**
**Principal**: 8 hours (Sentry + structured logging setup) → **PAID: 8 hours**
**Interest**: 12 hours/week (production debugging becomes archaeology) → **ELIMINATED**
**Risk**: Critical (cannot diagnose or fix production issues) → **MITIGATED**
**Trigger Event**: First user reports bug or system goes down
**Business Impact**: Lost revenue from undiagnosed issues, developer burnout

**✅ PAYOFF COMPLETED**:
- Request IDs generated per request (`req_<timestamp>_<random>`)
- `x-request-id` header set on all API responses
- JSON error responses include `requestId`
- Sentry integration with Next.js (`@sentry/nextjs`)
- Server-side Sentry instrumentation (`instrumentation.ts`)
- Request ID tagged on all Sentry events
- Pino logger for structured JSON logs
- **Observability files**:
  - `apps/platform/src/lib/sentry.ts` - client config with replay
  - `apps/platform/src/lib/sentry.server.ts` - server config
  - `apps/platform/instrumentation.ts` - Next.js server init
  - `apps/platform/src/lib/logger.ts` - Pino structured logger

### 3. **Incomplete Contract Runtime Validation**
**Principal**: 12 hours (middleware + event validation)
**Interest**: 4 hours/week (contract drift causes integration bugs)
**Risk**: High (API changes break integrations silently)
**Trigger Event**: Adding new module or changing existing contracts
**Business Impact**: Integration failures between services, cascading bugs

## Foundation Debt (Address Week 2-3)

### 4. **High Configuration Churn**
**Principal**: 6 hours (dependency policy + stabilization)
**Interest**: 3 hours/week (merge conflicts + deploy issues)
**Risk**: Medium (deployment instability, CI flakes)
**Trigger Event**: Adding new dependencies or deployment issues
**Business Impact**: Slowed development velocity, unreliable deployments

### 5. **Missing Runtime Boundary Enforcement**
**Principal**: 8 hours (ESLint rules + custom boundary checker)
**Interest**: 2 hours/week (accidental coupling increases complexity)
**Risk**: Medium (architecture drift, harder maintenance)
**Trigger Event**: New feature development or refactoring
**Business Impact**: Increasing complexity, slower feature development

### 6. **Low Contract Coverage (1/8 modules)**
**Principal**: 20 hours (contracts for dashboard/narratives/trust-ledger)
**Interest**: 3 hours/week (API inconsistencies, breaking changes)
**Risk**: Medium (integration issues, API versioning problems)
**Trigger Event**: Adding features to incomplete modules
**Business Impact**: Integration bugs, breaking API changes

## Operational Debt (Address Week 4-6)

### 7. **No Performance Monitoring**
**Principal**: 6 hours (query monitoring + basic APM)
**Interest**: 2 hours/week (performance issues discovered late)
**Risk**: Medium (scaling problems, poor user experience)
**Trigger Event**: User load increases or performance complaints
**Business Impact**: Poor user experience, scaling limitations

### 8. **Missing Error Tracking Standardization**
**Principal**: 4 hours (consistent error shapes across modules)
**Interest**: 1 hour/week (inconsistent error handling)
**Risk**: Low-Medium (poor error messages, debugging difficulty)
**Trigger Event**: Error handling in new features
**Business Impact**: Poor developer experience, harder debugging

### 9. **Incomplete Module Documentation**
**Principal**: 10 hours (ownership records for all modules)
**Interest**: 1 hour/week (unclear module boundaries during development)
**Risk**: Low (slower onboarding, unclear ownership)
**Trigger Event**: New developer onboarding or feature ownership questions
**Business Impact**: Development slowdown, unclear accountability

### 10. **Test Data Management** ✅ **PAID OFF - 2025-12-29**
**Principal**: 8 hours (test fixtures + seeding strategy) → **PAID: 8 hours**
**Interest**: 2 hours/week (flaky tests, hard to reproduce issues) → **ELIMINATED**
**Risk**: Low-Medium (unreliable test suite, false confidence) → **MITIGATED**
**Trigger Event**: Adding new tests or debugging test failures
**Business Impact**: Unreliable CI, wasted developer time on test issues

**✅ PAYOFF COMPLETED**:
- Created idempotent E2E seed script (`apps/platform/scripts/seed-e2e.ts`)
- Separate E2E Supabase project for deterministic test state
- Seeded accounts: completed user + incomplete user (for onboarding flow)
- CI/CD integration: seeds run before every E2E test
- E2E tests updated to use seeded credentials
- Documentation: `.env.e2e.example` with setup instructions
- **Result**: Deterministic test state, no more "dirty test user" debugging

### 11. **packages/ui Workspace Health** 🔴 OPEN
**Principal**: ~4 hours (package-scoped TS config, deps alignment, CI gate)
**Interest**: ~1 hour/week (noise + hidden errors → slower debugging later)
**Risk**: Medium (type failures masked; breaks surface late in consuming apps)
**Trigger Event**: Any change inside packages/ui or any app that imports it
**Business Impact**: Build instability, runtime breakage from bad exports/types, false confidence from "green" platform checks

**Current State**:
- packages/ui excluded from `apps/platform/tsconfig.json` via `../../packages` exclusion
- packages/ui does not have a verified standalone `tsconfig.json` + typecheck script
- Dependencies in packages/ui may be missing, mismatched, or not aligned with workspace versions
- CI does not run a packages/ui typecheck gate
- Exclusion was applied to unblock platform work because packages/ui errors were flooding tsc output

**Why This Exists**:
This is not "optional cleanup." This is debt created by intentionally narrowing validation scope to ship platform changes. The repo currently reports "TypeScript clean" only for the platform slice.

**Payoff Definition** (Debt #11 is paid when ALL are true):
- [ ] **Package-local TypeScript works**: `cd packages/ui && npx tsc --noEmit` returns zero errors
- [ ] **Tooling is explicit**: `packages/ui/tsconfig.json` exists and is the canonical config for that package
- [ ] **Dependencies are correct**: `packages/ui/package.json` declares required deps/peerDeps and matches workspace versions (no implicit reliance on app deps)
- [ ] **CI gate exists**: PRs fail if packages/ui typecheck fails
- [ ] **Platform exclude removed**: once above is true, remove `../../packages` from platform exclude (or replace with tightly-scoped exclusion list with rationale)

**Verification Commands**:
```bash
cd packages/ui && npm ci  # or workspace equivalent
cd packages/ui && npx tsc --noEmit
# CI: run same command in dedicated job
```

### 12. **Auth Session Consistency Window** 🟡 OPEN (Documented)
**Principal**: 1–6 hours (depends on chosen option)
**Interest**: 0.5–1 hour/week (edge-case auth support, "why am I still logged in?")
**Risk**: Medium (revoked sessions may remain "valid" until cookie expiry)
**Trigger Event**: Manual session revocation, password reset, account disable, compromised account response
**Business Impact**: Slower incident containment, inconsistent user experience

**Current Behavior (As Built)**:
- Middleware authorizes based on platform `auth-session` cookie only
- Supabase session revocation is not checked on each request
- Result: session revocations may take effect at next cookie expiry or logout

**Decision**: Chosen **Option A** (Eventual consistency). Constraint is deliberate and documented.

**Revocation Window (Current)**: Up to **7 days** (Supabase session default) or until explicit logout. This is the max time a revoked session remains "valid" in middleware.

**Options (Upgrade Paths)**:

| Option | Enforcement | Revocation Latency | Perf Cost | Complexity | Test Evidence |
|--------|-------------|-------------------|-----------|------------|---------------|
| **A** | Cookie-only (7-day TTL) | Up to 7 days | None | Low | Manual verification |
| **A+** | Short TTL + rolling refresh + kill switch | 1–4 hours | Cookie refresh on activity | Low-Medium | E2E: session expires after TTL without activity |
| **B** | Short TTL + server refresh endpoint | 15–60 min | ~1 API call/interval | Medium | E2E: session expires after TTL without activity |
| **C** | Strict validation | Immediate | 1 Supabase call/protected request | High | E2E: revoke → next request redirects to /auth |

**Option A+ Details** (Recommended Next Step):
- Shorten platform cookie TTL to 1–4 hours (not 7 days)
- Rolling refresh: re-issue cookie with fresh expiry on authenticated requests
- Kill switch: encode `forceLogoutAt` timestamp in cookie at login; check on dashboard load
- Result: Revocation window drops from 7 days to hours without per-request Supabase calls

**Payoff Definition** (When #12 is "Paid Off"):
- [ ] Option A+, B, or C implemented and verified
- [ ] **Test spec implemented**: `E2E: revoke session server-side → within 5 minutes, next request to /dashboard redirects to /auth`
- [ ] Documentation updated to reflect final enforcement model

**Mandatory Upgrade Triggers** (at least Option A+ required if ANY are true):
- [ ] Admin "disable account" feature is implemented
- [ ] Security incident response SLA < 24 hours is required
- [ ] Compliance requirement mandates session revocation capability
- [ ] Multi-device session management feature is added

**Why Option A is acceptable for now**:
- Consumer app risk profile (no sensitive financial/health data)
- No admin session revocation feature currently exists
- No "disable account" workflow exists
- Cookie TTL derived from Supabase session expiry (not arbitrary)
- Explicit logout clears cookie immediately
- **Acknowledged trade-off**: We chose convenience over containment. A compromised account could access the app for up to 7 days post-revocation unless user logs out.
- **Recommended**: Implement Option A+ as quick win to reduce window to hours.

---

## Debt Payment Strategy

### Week 1: Critical Risk Reduction
**Budget**: 24 hours (16 + 8)
**Focus**: Test harness + observability
**Goal**: Platform becomes behavior-verifiable

### Week 2: Foundation Strengthening
**Budget**: 20 hours (12 + 6 + 2)
**Focus**: Contract validation + boundary enforcement
**Goal**: Prevent architectural drift

### Week 3: Coverage Completion
**Budget**: 20 hours (20 + 0 carryover)
**Focus**: Full contract coverage
**Goal**: All modules have defined boundaries

### Week 4-6: Operational Excellence
**Budget**: 28 hours (6 + 4 + 10 + 8)
**Focus**: Performance, error handling, documentation
**Goal**: Production-ready operational posture

---

## Success Metrics

### By End of Week 1
- ✅ Test harness runs in CI
- ✅ 3 critical flow tests passing
- ✅ Error tracking captures unhandled errors
- ✅ Structured logging with request IDs

### By End of Week 2
- ✅ Runtime contract validation on all APIs
- ✅ Boundary enforcement blocks violations
- ✅ Configuration churn reduced by 50%
- ✅ All critical flows have smoke tests

### By End of Week 6
- ✅ All 10 debt items addressed
- ✅ Debt score improved from 45/100 to 75/100
- ✅ Mean time to debug reduced by 60%
- ✅ Deployment success rate > 95%

---

## Weekly Tracking

**Week 1 Target**: Address items 1-2 (24 hours)
**Actual Hours**: 24 hours
**Items Completed**:
- ✅ #1 Test Coverage (16h)
- ✅ #2 Observability (8h)
- ✅ #10 Test Data Management (8h)
- ✅ Resolver drift fixed (tsconfig/vitest alignment)
- ✅ Onboarding gating with middleware tests
**New Debt Discovered**:
- Deprecated `app/` directory (moved to `_deprecated_app/`)
- packages/ui needs own tsconfig and dependencies

**Week 2 Target**: Address items 3-5 (20 hours)
**Actual Hours**: [ ]
**Items Completed**: [ ]
**New Debt Discovered**: [ ]

**Week 3 Target**: Address item 6 (20 hours)
**Actual Hours**: [ ]
**Items Completed**: [ ]
**New Debt Discovered**: [ ]

**Week 4-6 Target**: Address items 7-10 (28 hours)
**Actual Hours**: [ ]
**Items Completed**: [ ]
**New Debt Discovered**: [ ]
