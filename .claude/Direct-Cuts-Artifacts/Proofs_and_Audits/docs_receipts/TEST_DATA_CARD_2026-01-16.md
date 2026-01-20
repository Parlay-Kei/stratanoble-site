# TEST DATA CARD - E2E Actors
**Date**: 2026-01-16
**Environment**: Staging (wgxiiefnmaxfxfoqsbwl)
**Purpose**: Deterministic test actors for E2E validation

## Test Actors Reference

### 🟢 Barber A - ENTITLED
- **User ID**: `11111111-1111-1111-1111-111111111111`
- **Email**: `barber.a@staging.test`
- **Name**: Barber A Entitled
- **Status**: Active
- **Subscription**: ACTIVE
- **Stripe Customer**: `cus_test_barberA`
- **Stripe Subscription**: `sub_test_barberA`
- **Service ID**: `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`
- **Expected**: ✅ CAN ACCEPT BOOKINGS

### 🔴 Barber B - NOT ENTITLED
- **User ID**: `22222222-2222-2222-2222-222222222222`
- **Email**: `barber.b@staging.test`
- **Name**: Barber B NotEntitled
- **Status**: Active
- **Subscription**: NONE
- **Stripe Customer**: N/A
- **Stripe Subscription**: N/A
- **Service ID**: `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`
- **Expected**: ❌ BOOKINGS BLOCKED (no subscription)

### ⚫ Barber C - INACTIVE
- **User ID**: `33333333-3333-3333-3333-333333333333`
- **Email**: `barber.c@staging.test`
- **Name**: Barber C Inactive
- **Status**: INACTIVE (is_active = false)
- **Subscription**: Active (but irrelevant)
- **Stripe Customer**: `cus_test_barberC`
- **Stripe Subscription**: `sub_test_barberC`
- **Service ID**: `cccccccc-cccc-cccc-cccc-cccccccccccc`
- **Expected**: ❌ BOOKINGS BLOCKED (inactive)

### 👤 Guest G
- **Identity ID**: `44444444-4444-4444-4444-444444444444`
- **Phone**: `+15555551234`
- **Email**: `guest.g@staging.test`
- **Verified**: false (initially)
- **Test Code**: `123456`
- **Purpose**: Guest booking with verification

### 👥 Member M
- **User ID**: `55555555-5555-5555-5555-555555555555`
- **Email**: `member.m@staging.test`
- **Name**: Member M Test
- **Is Barber**: false
- **Purpose**: Rewards merge testing

## Database Verification Queries

### Check Subscription Status
```sql
SELECT
  b.id as barber_id,
  u.full_name,
  b.is_active,
  bs.status as subscription_status,
  CASE
    WHEN b.is_active = false THEN '❌ BLOCKED: Inactive'
    WHEN bs.status IN ('active', 'trialing') THEN '✅ CAN BOOK'
    WHEN bs.status IS NULL THEN '❌ BLOCKED: No subscription'
    ELSE '❌ BLOCKED: ' || bs.status
  END as booking_eligibility
FROM barbers b
JOIN users u ON b.id = u.id
LEFT JOIN barber_subscriptions bs ON b.id = bs.barber_id
WHERE b.id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
ORDER BY u.full_name;
```

### Expected Output
```
barber_id | full_name | is_active | subscription_status | booking_eligibility
----------|-----------|-----------|-------------------|--------------------
11111111  | Barber A  | true      | active           | ✅ CAN BOOK
22222222  | Barber B  | true      | NULL             | ❌ BLOCKED: No subscription
33333333  | Barber C  | false     | active           | ❌ BLOCKED: Inactive
```

## Test Flow Mapping

### Flow 1: Guest Booking
- **Guest**: Guest G (`44444444-4444-4444-4444-444444444444`)
- **Barber**: Barber A (`11111111-1111-1111-1111-111111111111`)
- **Verification Code**: `123456`

### Flow 2: Subscription Gating
- **Test A**: Book with Barber A → ✅ Success
- **Test B**: Book with Barber B → ❌ Fail (no subscription)
- **Test C**: Book with Barber C → ❌ Fail (inactive)

### Flow 3: Rewards on Completion
- **Customer**: Member M (`55555555-5555-5555-5555-555555555555`)
- **Barber**: Barber A (`11111111-1111-1111-1111-111111111111`)
- **Expected Reward**: 5% of booking amount

### Flow 4: Guest to Member Merge
- **Guest**: Guest G (`44444444-4444-4444-4444-444444444444`)
- **Member**: Member M (`55555555-5555-5555-5555-555555555555`)
- **Expected**: Rewards transfer from guest to member

## API Test Endpoints

### Subscription Check
```bash
# Should return true for Barber A
curl -X POST https://wgxiiefnmaxfxfoqsbwl.supabase.co/rest/v1/rpc/can_barber_accept_bookings \
  -H "apikey: [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"p_barber_id": "11111111-1111-1111-1111-111111111111"}'

# Should return false for Barber B
curl -X POST https://wgxiiefnmaxfxfoqsbwl.supabase.co/rest/v1/rpc/can_barber_accept_bookings \
  -H "apikey: [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"p_barber_id": "22222222-2222-2222-2222-222222222222"}'
```

## Setup Instructions

1. **Run Setup SQL**: Execute `TEST_DATA_SETUP_2026-01-16.sql` in Supabase SQL Editor
2. **Verify Data**: Run verification queries to confirm actors created
3. **Note IDs**: Use IDs from this card for E2E testing
4. **Clean Up After**: Delete test data when E2E complete

## Important Notes

- **Staging Only**: These IDs are for staging environment only
- **Deterministic**: Same IDs used for reproducible testing
- **Coverage**: Covers all subscription/activity states
- **Isolation**: UUIDs chosen to avoid collision

---

**Created**: 2026-01-16
**Valid For**: Staging E2E Testing
**Do Not Use In**: Production