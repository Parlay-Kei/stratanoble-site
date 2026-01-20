a-- REVISED E2E TEST DATA SETUP FOR STAGING
-- Project: wgxiiefnmaxfxfoqsbwl (staging only)
-- Date: 2026-01-16
-- CRITICAL: Barber A subscription must be created via Stripe, NOT SQL

-- ================================================
-- IMPORTANT: DO NOT SQL-INJECT BARBER A SUBSCRIPTION
-- ================================================
-- Barber A's subscription MUST be created through the real pathway:
-- 1. Call barber-subscription-service edge function, OR
-- 2. Create in Stripe Dashboard (test mode) and let webhook sync
-- This ensures webhook-synced truth, not fake SQL rows

-- Clean up any existing test data first
DELETE FROM appointments WHERE barber_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);
DELETE FROM reward_transactions WHERE account_id IN (
  SELECT id FROM reward_accounts WHERE guest_identity_id = '44444444-4444-4444-4444-444444444444'
);
DELETE FROM reward_accounts WHERE user_id = '55555555-5555-5555-5555-555555555555'
  OR guest_identity_id = '44444444-4444-4444-4444-444444444444';
DELETE FROM guest_identities WHERE id = '44444444-4444-4444-4444-444444444444';
DELETE FROM barber_subscriptions WHERE barber_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);
DELETE FROM services WHERE barber_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);
DELETE FROM barbers WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);
DELETE FROM users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '55555555-5555-5555-5555-555555555555'
);

-- ================================================
-- BARBER A: User and Barber records ONLY
-- Subscription will be created via Stripe webhook
-- ================================================
INSERT INTO users (id, email, full_name, is_barber, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'barber.a@staging.test',
  'Barber A Entitled',
  true,
  NOW()
);

INSERT INTO barbers (id, is_active, shop_name, bio, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  true,
  'Barber A Shop',
  'Test barber - subscription via Stripe webhook',
  NOW()
);

-- Add a test service for Barber A
INSERT INTO services (id, barber_id, name, description, price, duration_minutes)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Test Haircut A',
  'Basic haircut service',
  30.00,
  30
);

-- DO NOT INSERT INTO barber_subscriptions for Barber A!
-- This will be done via Stripe webhook after creating subscription

-- ================================================
-- BARBER B: NOT ENTITLED (no subscription)
-- ================================================
INSERT INTO users (id, email, full_name, is_barber, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'barber.b@staging.test',
  'Barber B NotEntitled',
  true,
  NOW()
);

INSERT INTO barbers (id, is_active, shop_name, bio, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  true,
  'Barber B Shop',
  'Test barber WITHOUT subscription',
  NOW()
);

-- NO subscription record for Barber B = not entitled

-- Add a test service for Barber B (won't be bookable)
INSERT INTO services (id, barber_id, name, description, price, duration_minutes)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '22222222-2222-2222-2222-222222222222',
  'Test Haircut B',
  'Basic haircut service',
  30.00,
  30
);

-- ================================================
-- BARBER C: INACTIVE (is_active = false)
-- ================================================
INSERT INTO users (id, email, full_name, is_barber, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'barber.c@staging.test',
  'Barber C Inactive',
  true,
  NOW()
);

INSERT INTO barbers (id, is_active, shop_name, bio, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  false, -- INACTIVE
  'Barber C Shop',
  'Test barber who is INACTIVE',
  NOW()
);

-- Barber C can have a subscription but still blocked due to inactive
-- This tests that inactive overrides subscription status
INSERT INTO barber_subscriptions (
  barber_id,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  current_period_start,
  current_period_end,
  created_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'active',
  'cus_test_barberC',
  'sub_test_barberC',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW()
);

-- Add a test service for Barber C (won't be bookable due to inactive)
INSERT INTO services (id, barber_id, name, description, price, duration_minutes)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '33333333-3333-3333-3333-333333333333',
  'Test Haircut C',
  'Basic haircut service',
  30.00,
  30
);

-- ================================================
-- GUEST G: For verification testing
-- ================================================
INSERT INTO guest_identities (
  id,
  phone,
  email,
  verified,
  verification_code,
  verification_code_expires_at,
  created_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '+15555551234',
  'guest.g@staging.test',
  false, -- Not verified yet
  '123456', -- Test code
  NOW() + INTERVAL '10 minutes',
  NOW()
);

-- ================================================
-- MEMBER M: For merge testing
-- ================================================
INSERT INTO users (id, email, full_name, is_barber, created_at)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'member.m@staging.test',
  'Member M Test',
  false,
  NOW()
);

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check all barbers and their subscription status
SELECT
  b.id as barber_id,
  u.full_name,
  b.is_active,
  bs.status as subscription_status,
  bs.stripe_subscription_id,
  bs.created_at as subscription_created,
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

-- Check webhook events to confirm Barber A subscription came from webhook
SELECT
  stripe_event_id,
  event_type,
  event_data->>'object' as object_type,
  processed_at,
  error_message
FROM webhook_events
WHERE event_data::text LIKE '%11111111-1111-1111-1111-111111111111%'
  OR event_data::text LIKE '%barber.a@staging.test%'
ORDER BY processed_at DESC
LIMIT 5;

-- Verify guest and member exist
SELECT 'Guest' as type, id, email, phone, verified
FROM guest_identities
WHERE id = '44444444-4444-4444-4444-444444444444'
UNION ALL
SELECT 'Member' as type, id, email, phone, NULL as verified
FROM users
WHERE id = '55555555-5555-5555-5555-555555555555';