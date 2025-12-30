# E2E Test Data Seeding - Setup Guide

## Overview

This document describes the deterministic E2E test data seeding system that ensures reliable, repeatable end-to-end tests without bypass paths or dirty test state.

## Why Seeded Test Accounts?

**Before**: Tests relied on manually created accounts or "Skip to Dashboard" bypass buttons that:
- Created inconsistent test state
- Led to "missing profile data" bugs
- Required production-like workarounds in test environments
- Wasted debugging time on flaky tests

**After**: Idempotent seed script creates deterministic test users:
- ✅ Completed user (onboarding done) → tests dashboard access
- ✅ Incomplete user (no onboarding) → tests onboarding flow
- ✅ Runs before every E2E test in CI
- ✅ Safe to run locally multiple times
- ✅ No bypass paths, no weird states

## Architecture

### Separate E2E Supabase Project (RECOMMENDED)

We use a **separate Supabase project** for E2E testing:
- Keeps production data clean
- Allows unlimited resets without risk
- Makes seed script deterministic (no conflicts)
- Clear separation of concerns

### Tables Seeded

The seed script manages these tables for test accounts:

```
auth.users
  - Creates/updates test users with deterministic passwords

user_profiles (auto-created by trigger)
  - Basic profile info (email, role, status)

user_platform_settings
  - Completed user: onboarding_completed = true
  - Incomplete user: NO record (triggers onboarding)

user_dreams
  - Completed user: One active dream with phase + actions
  - Incomplete user: NO dreams (clean slate)
```

## Setup Instructions

### 1. Create Separate E2E Supabase Project

1. Go to https://supabase.com/dashboard
2. Create a new project: `stratanoble-e2e` or similar
3. Wait for project provisioning (2-3 minutes)

### 2. Run Migrations

In your E2E Supabase project SQL editor, run all migrations:

```bash
# Copy migrations from your main project
supabase/migrations/0001_init_core_tables.sql
supabase/migrations/0002_core_indexes.sql
...
supabase/migrations/0019_user_profiles_table.sql
# etc.
```

Or use the Supabase CLI:
```bash
# Point to E2E project
supabase link --project-ref your-e2e-project-ref
supabase db push
```

### 3. Get Service Role Key

1. In E2E Supabase project: Settings > API
2. Copy the `service_role` key (secret, never commit!)
3. This key has admin access for user creation

### 4. Set Up Local Environment

```bash
cd apps/platform

# Copy the example file
cp .env.e2e.example .env.e2e

# Edit .env.e2e with your E2E project values
```

Example `.env.e2e`:
```bash
E2E_SUPABASE_URL=https://your-e2e-project.supabase.co
E2E_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... # Your service key

E2E_COMPLETED_EMAIL=e2e.completed@achievery.test
E2E_COMPLETED_PASSWORD=ChangeMe-Completed-123!

E2E_INCOMPLETE_EMAIL=e2e.incomplete@achievery.test
E2E_INCOMPLETE_PASSWORD=ChangeMe-Incomplete-123!
```

### 5. Run Seed Script Locally

```bash
cd apps/platform
npm run seed:e2e
```

You should see:
```
🌱 E2E Test Data Seeder
══════════════════════════════════════════════════
📍 Supabase URL: https://your-e2e-project.supabase.co
📧 Completed user: e2e.completed@achievery.test
📧 Incomplete user: e2e.incomplete@achievery.test
══════════════════════════════════════════════════
  ✓ User exists: e2e.completed@achievery.test (uuid...)
  ✓ Password reset for: e2e.completed@achievery.test
  ✓ User exists: e2e.incomplete@achievery.test (uuid...)
  ✓ Password reset for: e2e.incomplete@achievery.test

📦 Seeding COMPLETED user: e2e.completed@achievery.test
  ✓ Platform settings: onboarding_completed = true
  ✓ Active dream created: "Build a repeatable income engine..."
  ✓ Profile upserted for: e2e.completed@achievery.test

📦 Seeding INCOMPLETE user: e2e.incomplete@achievery.test
  ✓ Dreams cleared
  ✓ Platform settings cleared
  ✓ Profile upserted for: e2e.incomplete@achievery.test

✅ E2E seed complete!
```

### 6. Set Up CI/CD (GitHub Secrets)

Add these secrets in your GitHub repository:

**Settings > Secrets and variables > Actions > New repository secret**

```
E2E_SUPABASE_URL
E2E_SUPABASE_SERVICE_ROLE_KEY
E2E_COMPLETED_EMAIL
E2E_COMPLETED_PASSWORD
E2E_INCOMPLETE_EMAIL
E2E_INCOMPLETE_PASSWORD
E2E_APP_BASE_URL (your deployed E2E app URL)
```

The CI workflow (`.github/workflows/e2e.yml`) will automatically:
1. Install dependencies
2. Run `npm run seed:e2e` (creates/resets test users)
3. Run `npm run e2e` (Playwright tests)

## Usage in Tests

### Completed User (Dashboard Tests)

Use this account for testing features that require completed onboarding:

```typescript
test('existing user: dashboard access', async ({ page }) => {
  const email = process.env.E2E_COMPLETED_EMAIL || 'e2e.completed@achievery.test';
  const password = process.env.E2E_COMPLETED_PASSWORD || 'ChangeMe-Completed-123!';

  await page.goto('/auth');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Should go directly to dashboard
  await page.waitForURL(/dashboard/);
  await expect(page.getByText('ACHIEVERY Analytics')).toBeVisible();
});
```

### Incomplete User (Onboarding Tests)

Use this account for testing the onboarding flow:

```typescript
test('new user: onboarding flow', async ({ page }) => {
  const email = process.env.E2E_INCOMPLETE_EMAIL || 'e2e.incomplete@achievery.test';
  const password = process.env.E2E_INCOMPLETE_PASSWORD || 'ChangeMe-Incomplete-123!';

  await page.goto('/auth');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Should redirect to onboarding
  await page.waitForURL(/onboarding/);
  await expect(page.getByText('What do you dream of doing?')).toBeVisible();
});
```

## Idempotency Guarantees

The seed script is **safe to run multiple times**:

✅ **User exists?** → Updates password to match env vars
✅ **Settings exist?** → Upserts (updates or inserts)
✅ **Dreams exist?** → Deactivates old, creates new active dream
✅ **Profile exists?** → Upserts to ensure consistency

**Result**: Every run produces the exact same state.

## Troubleshooting

### "Missing E2E_SUPABASE_URL or E2E_SUPABASE_SERVICE_ROLE_KEY"

- Ensure `.env.e2e` exists in `apps/platform/`
- Check that values are set correctly
- For CI: verify GitHub Secrets are configured

### "User not found after creation"

- Check E2E Supabase project is accessible
- Verify service role key has admin permissions
- Ensure migrations have been run in E2E project

### "Tests fail with 'user not found'"

- Run `npm run seed:e2e` locally first
- Check that app is pointing to E2E Supabase URL
- Verify credentials match between seed script and tests

### "Onboarding state is wrong"

The seed script ensures:
- **Completed user**: Has `user_platform_settings` with `onboarding_completed = true`
- **Incomplete user**: Has NO `user_platform_settings` record

If state is wrong, re-run: `npm run seed:e2e`

## Files Created

```
apps/platform/
├── scripts/
│   └── seed-e2e.ts              # Main seeding script
├── .env.e2e.example              # Template for local setup
├── E2E_SEED_SETUP.md            # This file
├── package.json                  # Added "seed:e2e" script
└── e2e/
    └── onboarding.spec.ts        # Updated to use seeded accounts

.github/workflows/
└── e2e.yml                       # Updated to run seed before tests
```

## Next Steps

1. **Local Development**:
   - Run `npm run seed:e2e` whenever E2E test data is corrupted
   - Tests use deterministic credentials

2. **CI/CD**:
   - Seed runs automatically before every E2E test
   - No manual intervention needed

3. **Production**:
   - NO skip buttons or bypass paths
   - All users must complete onboarding
   - Clean separation between test and production data

## Tech Debt Payoff

**Item #10: Test Data Management** ✅ COMPLETED

- **Principal Paid**: 8 hours
- **Interest Eliminated**: 2 hours/week (flaky tests, debugging)
- **Result**: Deterministic test state, reliable CI, no more "dirty test user" issues

---

**Questions?** Check the seed script: `apps/platform/scripts/seed-e2e.ts`
**Issues?** Verify all migrations are applied to E2E Supabase project
