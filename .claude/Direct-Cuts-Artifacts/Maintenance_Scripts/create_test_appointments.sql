-- Gate 3 Test Data - Auto-create with dynamic customer selection
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/dskpfnjbgocieoqyiznf/sql/new

DO $$
DECLARE
  customer_1 UUID;
  customer_2 UUID;
  barber_a_service UUID;
  barber_b_service UUID;
BEGIN
  -- Find or use existing customer IDs
  -- First, try to find actual customers (non-barbers)
  SELECT id INTO customer_1 FROM auth.users WHERE email NOT LIKE '%barber%' LIMIT 1;
  SELECT id INTO customer_2 FROM auth.users WHERE email NOT LIKE '%barber%' LIMIT 1 OFFSET 1;

  -- If no customers found, use some existing barber IDs as customers for testing
  IF customer_1 IS NULL THEN
    customer_1 := '243e2de1-d5ec-4f31-aca2-f1fb56ba1b40';
  END IF;

  IF customer_2 IS NULL THEN
    customer_2 := '460837a2-e0ea-47bf-9e04-c2f1c9dde200';
  END IF;

  -- Get service IDs for each barber
  SELECT id INTO barber_a_service FROM services WHERE barber_id = '03bcea41-8029-4adf-839f-4f4f270c829b' LIMIT 1;
  SELECT id INTO barber_b_service FROM services WHERE barber_id = '7c9a3662-0831-4957-923d-0003848d4f35' LIMIT 1;

  -- Barber A - Mobile appointment
  INSERT INTO public.appointments (
    barber_id, customer_id, service_id, status,
    scheduled_start, scheduled_end,
    location_type,
    service_address_line1, service_address_city, service_address_state, service_address_zip,
    subtotal_cents, tip_percent, tip_amount_cents, total_cents,
    platform_fee_cents, net_payout_cents
  ) VALUES (
    '03bcea41-8029-4adf-839f-4f4f270c829b', customer_1, barber_a_service, 'completed',
    NOW() - interval '2 days', NOW() - interval '2 days' + interval '1 hour',
    'mobile',
    '123 Mobile Service Lane', 'Dallas', 'TX', '75201',
    5000, 20, 1000, 6000, 600, 5400
  );

  -- Barber A - In-shop appointment
  INSERT INTO public.appointments (
    barber_id, customer_id, service_id, status,
    scheduled_start, scheduled_end,
    location_type,
    service_address_line1, service_address_city, service_address_state, service_address_zip,
    subtotal_cents, tip_percent, tip_amount_cents, total_cents,
    platform_fee_cents, net_payout_cents
  ) VALUES (
    '03bcea41-8029-4adf-839f-4f4f270c829b', customer_2, barber_a_service, 'completed',
    NOW() - interval '3 days', NOW() - interval '3 days' + interval '45 minutes',
    'in_shop',
    NULL, NULL, NULL, NULL,
    3500, 15, 525, 4025, 402, 3623
  );

  -- Barber B - Mobile appointment
  INSERT INTO public.appointments (
    barber_id, customer_id, service_id, status,
    scheduled_start, scheduled_end,
    location_type,
    service_address_line1, service_address_city, service_address_state, service_address_zip,
    subtotal_cents, tip_percent, tip_amount_cents, total_cents,
    platform_fee_cents, net_payout_cents
  ) VALUES (
    '7c9a3662-0831-4957-923d-0003848d4f35', customer_1, barber_b_service, 'completed',
    NOW() - interval '1 day', NOW() - interval '1 day' + interval '1 hour',
    'mobile',
    '456 Home Service Ave', 'Fort Worth', 'TX', '76102',
    4500, 25, 1125, 5625, 562, 5063
  );

  -- Barber B - In-shop appointment
  INSERT INTO public.appointments (
    barber_id, customer_id, service_id, status,
    scheduled_start, scheduled_end,
    location_type,
    service_address_line1, service_address_city, service_address_state, service_address_zip,
    subtotal_cents, tip_percent, tip_amount_cents, total_cents,
    platform_fee_cents, net_payout_cents
  ) VALUES (
    '7c9a3662-0831-4957-923d-0003848d4f35', customer_2, barber_b_service, 'completed',
    NOW() - interval '4 days', NOW() - interval '4 days' + interval '30 minutes',
    'in_shop',
    NULL, NULL, NULL, NULL,
    3000, 0, 0, 3000, 300, 2700
  );

  RAISE NOTICE 'Created 4 test appointments using customer_1: %, customer_2: %', customer_1, customer_2;
END $$;

-- Verify the created appointments
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

-- Check barber_transactions view
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
