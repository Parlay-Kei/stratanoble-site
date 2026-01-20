# Database Migration Receipts
**Date**: 2026-01-16
**Migration**: `20260116000001_barber_subscription_guest_rewards.sql`
**Operator**: Claude Code

## Environment Status

### Local Development
```bash
$ supabase --version
2.67.1
A new version of Supabase CLI is available: v2.72.7 (currently installed v2.67.1)

$ supabase status
Error: Docker not running - Local Supabase requires Docker Desktop
failed to inspect container health: error during connect:
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.

$ supabase projects list
LINKED | ORG ID               | REFERENCE ID         | NAME
-------|----------------------|----------------------|------------------
   ●   | mhaugpcyrrvpbccwksvj | dskpfnjbgocieoqyiznf | Direct-Cuts (East US - Ohio)
```

### Staging Environment
**Status**: ⚠️ BLOCKER - No staging target provided
**Action Required**: Provide staging project reference ID or connection string

### Production Environment
**Project**: Direct-Cuts (dskpfnjbgocieoqyiznf)
**Region**: East US (Ohio)
**Status**: ✅ Linked and accessible

## Migration Execution

### Staging (BLOCKED)
```sql
-- Migration NOT executed - staging target not provided
-- File ready at: supabase/migrations/20260116000001_barber_subscription_guest_rewards.sql
```

### Production (PENDING)
```sql
-- Migration pending staging validation
-- Will apply after staging confirmation
```

## Schema Validation Queries

### Tables Check
```sql
-- Query to verify new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public'
  AND table_name IN (
    'barber_subscriptions',
    'guest_identities',
    'reward_accounts',
    'reward_transactions'
  );

-- Expected output (4 rows):
-- barber_subscriptions
-- guest_identities
-- reward_accounts
-- reward_transactions
```

### Functions Check
```sql
-- Query to verify new functions exist
SELECT proname
FROM pg_proc
JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
WHERE nspname='public'
  AND proname IN (
    'can_barber_accept_bookings',
    'merge_guest_rewards_to_member',
    'award_rewards_on_completion',
    'enforce_barber_subscription_gating'
  );

-- Expected output (4 rows):
-- can_barber_accept_bookings
-- merge_guest_rewards_to_member
-- award_rewards_on_completion
-- enforce_barber_subscription_gating
```

### Triggers Check
```sql
-- Query to verify appointment triggers
SELECT
  tgname as trigger_name,
  pg_proc.proname as function_name
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
WHERE pg_class.relname = 'appointments'
  AND NOT pg_trigger.tgisinternal;

-- Expected to include:
-- award_rewards_on_appointment_completion -> award_rewards_on_completion
```

### RLS Policies Check
```sql
-- Query to verify RLS policies
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname='public'
  AND tablename IN (
    'barber_subscriptions',
    'guest_identities',
    'reward_accounts',
    'reward_transactions'
  );

-- Expected policies per table:
-- barber_subscriptions: service role only, barbers read own
-- guest_identities: service role all, users read own
-- reward_accounts: users read own, service update
-- reward_transactions: users read own history
```

## RLS Behavior Tests

### Anonymous Access
```sql
-- Test: Anonymous users cannot access subscription data
SET ROLE anon;
SELECT * FROM barber_subscriptions LIMIT 1;
-- Expected: Permission denied

-- Test: Anonymous users cannot access rewards
SELECT * FROM reward_accounts LIMIT 1;
-- Expected: Permission denied
```

### Authenticated User Access
```sql
-- Test: Users can read their own rewards
SET ROLE authenticated;
SET request.jwt.claims.sub = 'test-user-id';
SELECT * FROM reward_accounts WHERE user_id = 'test-user-id';
-- Expected: Returns user's reward account (if exists)

-- Test: Users cannot read others' rewards
SELECT * FROM reward_accounts WHERE user_id != 'test-user-id';
-- Expected: Empty result set
```

### Service Role Access
```sql
-- Test: Service role has full access
SET ROLE service_role;
SELECT COUNT(*) FROM barber_subscriptions;
-- Expected: Returns count

SELECT COUNT(*) FROM reward_accounts;
-- Expected: Returns count
```

## Rollback Plan

If issues detected:
```sql
-- Rollback migration
DROP TABLE IF EXISTS reward_transactions CASCADE;
DROP TABLE IF EXISTS reward_accounts CASCADE;
DROP TABLE IF EXISTS guest_identities CASCADE;
DROP TABLE IF EXISTS barber_subscriptions CASCADE;

DROP FUNCTION IF EXISTS can_barber_accept_bookings CASCADE;
DROP FUNCTION IF EXISTS merge_guest_rewards_to_member CASCADE;
DROP FUNCTION IF EXISTS award_rewards_on_completion CASCADE;
DROP FUNCTION IF EXISTS enforce_barber_subscription_gating CASCADE;
```

## Notes

1. **Docker Dependency**: Local Supabase requires Docker Desktop to be running
2. **Staging Blocker**: No staging environment reference provided - cannot proceed with staging deployment
3. **CLI Version**: Current v2.67.1, latest v2.72.7 available (consider updating)
4. **Production Ready**: Migration file exists and production project is linked
5. **Execution Pending**: Awaiting staging validation before production deployment