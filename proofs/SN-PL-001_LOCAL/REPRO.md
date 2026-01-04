# Reproduction Steps - SN-PL-001

## Repo
```
c:\Dev\StrataNoble
```

## Prerequisites
- Node v20.18.0+
- npm 10.8.2+

## Commands (exact sequence)

```bash
# From repo root
cd apps/platform

# Install
npm install

# Type check
npm run type-check

# Lint
npm run lint

# Unit tests
npm run test:run

# Production build
npm run build
```

## Expected Results
| Command | Expected |
|---------|----------|
| npm install | 0 errors |
| npm run type-check | 0 errors |
| npm run lint | 0 errors, ≤4 warnings |
| npm run test:run | 36/36 pass |
| npm run build | Success, 16 pages |

## Runtime Smoke Tests

```bash
# Start dev server
npm run dev

# In another terminal, verify endpoints
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/      # Expect: 302
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/auth  # Expect: 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/dashboard  # Expect: 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/onboarding/status  # Expect: 200
```

## Live Auth Smoke Tests (requires Supabase connection)

These tests require `.env.local` with valid Supabase credentials:

1. **Signup** - POST to /api/auth with new email
2. **Confirm Email** - Click link in email, verify redirect
3. **Login** - POST credentials, verify session cookie set
4. **Password Reset** - Request reset, click link, set new password
5. **Session Persistence** - Refresh page, verify still logged in
6. **SSR Session Read** - Load /dashboard, verify server reads session

Run E2E suite for automated verification:
```bash
npm run e2e
```

## Secrets Scan
```bash
git grep -nE "(sk-|shpat_|AKIA|AIza|BEGIN PRIVATE KEY|xoxb-)"
```
Expected: Only `.example` patterns, no live secrets.

## Vulnerability Check
```bash
npm audit --omit=dev
```
Expected: 0 vulnerabilities in production dependencies.
