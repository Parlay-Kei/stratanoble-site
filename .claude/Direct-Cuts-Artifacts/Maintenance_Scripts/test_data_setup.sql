-- Gate 3 Test Data Creation for RLS Testing
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/dskpfnjbgocieoqyiznf/sql/new

-- Step 1: Find existing customer users (non-barbers)
SELECT id, email, created_at
FROM auth.users
WHERE email NOT LIKE '%barber%'
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: If no customers exist, we'll use these barber IDs as customers for testing
-- This is just for testing purposes - in production, customers and barbers are separate

-- Step 3: Create test appointments
-- Replace <customer_uuid_1> and <customer_uuid_2> with actual customer IDs from Step 1

-- Barber A (03bcea41-8029-4adf-839f-4f4f270c829b) - Mobile appointment
INSERT INTO public.appointments (
  barber_id,
  customer_id,
  service_id,
  status,
  scheduled_start,
  scheduled_end,
  location_type,
  service_address_line1,
  service_address_city,
  service_address_state,
  service_address_zip,
  subtotal_cents,
  tip_percent,
  tip_amount_cents,
  total_cents,
  platform_fee_cents,
  net_payout_cents
) VALUES (
  '03bcea41-8029-4adf-839f-4f4f270c829b',
  '<customer_uuid_1>', -- Replace with actual customer UUID
  (SELECT id FROM services WHERE barber_id = '03bcea41-8029-4adf-839f-4f4f270c829b' LIMIT 1),
  'completed',
  NOW() - interval '2 days',
  NOW() - interval '2 days' + interval '1 hour',
  'mobile',
  '123 Mobile Service Lane',
  'Dallas',
  'TX',
  '75201',
  5000,  -- $50.00 subtotal
  20,    -- 20% tip
  1000,  -- $10.00 tip (20% of $50)
  6000,  -- $60.00 total
  600,   -- $6.00 platform fee (10%)
  5400   -- $54.00 net payout
);

-- Barber A (03bcea41-8029-4adf-839f-4f4f270c829b) - In-shop appointment
INSERT INTO public.appointments (
  barber_id,
  customer_id,
  service_id,
  status,
  scheduled_start,
  scheduled_end,
  location_type,
  service_address_line1,
  service_address_city,
  service_address_state,
  service_address_zip,
  subtotal_cents,
  tip_percent,
  tip_amount_cents,
  total_cents,
  platform_fee_cents,
  net_payout_cents
) VALUES (
  '03bcea41-8029-4adf-839f-4f4f270c829b',
  '<customer_uuid_2>', -- Replace with actual customer UUID
  (SELECT id FROM services WHERE barber_id = '03bcea41-8029-4adf-839f-4f4f270c829b' LIMIT 1),
  'completed',
  NOW() - interval '3 days',
  NOW() - interval '3 days' + interval '45 minutes',
  'in_shop',
  NULL, NULL, NULL, NULL,
  3500,  -- $35.00 subtotal
  15,    -- 15% tip
  525,   -- $5.25 tip (15% of $35)
  4025,  -- $40.25 total
  402,   -- $4.02 platform fee (10%)
  3623   -- $36.23 net payout
);

-- Barber B (7c9a3662-0831-4957-923d-0003848d4f35) - Mobile appointment
INSERT INTO public.appointments (
  barber_id,
  customer_id,
  service_id,
  status,
  scheduled_start,
  scheduled_end,
  location_type,
  service_address_line1,
  service_address_city,
  service_address_state,
  service_address_zip,
  subtotal_cents,
  tip_percent,
  tip_amount_cents,
  total_cents,
  platform_fee_cents,
  net_payout_cents
) VALUES (
  '7c9a3662-0831-4957-923d-0003848d4f35',
  '<customer_uuid_1>', -- Replace with actual customer UUID
  (SELECT id FROM services WHERE barber_id = '7c9a3662-0831-4957-923d-0003848d4f35' LIMIT 1),
  'completed',
  NOW() - interval '1 day',
  NOW() - interval '1 day' + interval '1 hour',
  'mobile',
  '456 Home Service Ave',
  'Fort Worth',
  'TX',
  '76102',
  4500,  -- $45.00 subtotal
  25,    -- 25% tip
  1125,  -- $11.25 tip (25% of $45)
  5625,  -- $56.25 total
  562,   -- $5.62 platform fee (10%)
  5063   -- $50.63 net payout
);

-- Barber B (7c9a3662-0831-4957-923d-0003848d4f35) - In-shop appointment
INSERT INTO public.appointments (
  barber_id,
  customer_id,
  service_id,
  status,
  scheduled_start,
  scheduled_end,
  location_type,
  service_address_line1,
  service_address_city,
  service_address_state,
  service_address_zip,
  subtotal_cents,
  tip_percent,
  tip_amount_cents,
  total_cents,
  platform_fee_cents,
  net_payout_cents
) VALUES (
  '7c9a3662-0831-4957-923d-0003848d4f35',
  '<customer_uuid_2>', -- Replace with actual customer UUID
  (SELECT id FROM services WHERE barber_id = '7c9a3662-0831-4957-923d-0003848d4f35' LIMIT 1),
  'completed',
  NOW() - interval '4 days',
  NOW() - interval '4 days' + interval '30 minutes',
  'in_shop',
  NULL, NULL, NULL, NULL,
  3000,  -- $30.00 subtotal
  0,     -- 0% tip (no tip)
  0,     -- $0.00 tip
  3000,  -- $30.00 total
  300,   -- $3.00 platform fee (10%)
  2700   -- $27.00 net payout
);

-- Step 4: Verify the created appointments
SELECT
  id,
  barber_id,
  customer_id,
  status,
  location_type,
  service_address_line1,
  service_address_city,
  subtotal_cents,
  tip_percent,
  tip_amount_cents,
  total_cents,
  created_at
FROM public.appointments
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Check the barber_transactions view for the test data
SELECT
  barber_id,
  location_type,
  transaction_count,
  total_revenue_cents,
  total_tips_cents
FROM public.barber_transactions
WHERE barber_id IN (
  '03bcea41-8029-4adf-839f-4f4f270c829b',
  '7c9a3662-0831-4957-923d-0003848d4f35'
)
ORDER BY barber_id, location_type;
