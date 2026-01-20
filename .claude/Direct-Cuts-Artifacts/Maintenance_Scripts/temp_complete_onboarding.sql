-- Complete onboarding for mr.steve.hubbard@outlook.com
-- User ID: b22e6ff6-96bc-47f3-bfd9-1bbbbf14c17d

DO $$
DECLARE
  v_barber_id uuid := 'b22e6ff6-96bc-47f3-bfd9-1bbbbf14c17d';
BEGIN
  -- 1. Update barbers table - mark as verified and onboarding complete
  UPDATE public.barbers
  SET
    is_verified = true,
    onboarding_complete = true,
    updated_at = now()
  WHERE id = v_barber_id;

  -- 2. Update or insert onboarding progress
  INSERT INTO public.barber_onboarding_progress (
    barber_id, current_phase, phase_progress, completion_score,
    profile_data, portfolio_data, services_data, verification_data, availability_data
  ) VALUES (
    v_barber_id,
    5,
    '{"1": 100, "2": 100, "3": 100, "4": 100, "5": 100}'::jsonb,
    100,
    '{"businessName": "Steve''s Cuts", "bio": "Professional barber", "experienceLevel": "experienced", "signatureStyles": ["Fades", "Tapers", "Beard Trims"]}'::jsonb,
    '{"imageCount": 3, "hasBeforeAfter": true}'::jsonb,
    '{"selectedTemplates": ["haircut", "fade", "beard"], "pricingComplete": true}'::jsonb,
    '{"licenseVerified": true, "licenseNumber": "NV-BARBER-12345", "licenseState": "NV", "licenseExpiry": "2026-12-31"}'::jsonb,
    '{"schedule": {"monday": {"isAvailable": true}, "tuesday": {"isAvailable": true}, "wednesday": {"isAvailable": true}, "thursday": {"isAvailable": true}, "friday": {"isAvailable": true}}, "isMobile": false}'::jsonb
  )
  ON CONFLICT (barber_id) DO UPDATE SET
    current_phase = 5,
    phase_progress = '{"1": 100, "2": 100, "3": 100, "4": 100, "5": 100}'::jsonb,
    completion_score = 100,
    profile_data = EXCLUDED.profile_data,
    portfolio_data = EXCLUDED.portfolio_data,
    services_data = EXCLUDED.services_data,
    verification_data = EXCLUDED.verification_data,
    availability_data = EXCLUDED.availability_data;

  -- 3. Create or update verification status
  INSERT INTO public.barber_verification_status (
    barber_id, license_number, license_state, license_expiry,
    license_status, license_verified_at, insurance_provided, insurance_status
  ) VALUES (
    v_barber_id,
    'NV-BARBER-12345',
    'NV',
    '2026-12-31',
    'verified',
    now(),
    true,
    'verified'
  )
  ON CONFLICT (barber_id) DO UPDATE SET
    license_number = 'NV-BARBER-12345',
    license_state = 'NV',
    license_expiry = '2026-12-31',
    license_status = 'verified',
    license_verified_at = now(),
    insurance_provided = true,
    insurance_status = 'verified';

  -- 4. Add specialties if none exist
  INSERT INTO public.barber_specialties (barber_id, specialty_name, is_signature, sort_order)
  SELECT v_barber_id, specialty_name, is_signature, sort_order
  FROM (VALUES
    ('Fades', true, 0),
    ('Tapers', true, 1),
    ('Beard Sculpting', false, 2),
    ('Line-ups', false, 3)
  ) AS t(specialty_name, is_signature, sort_order)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.barber_specialties WHERE barber_id = v_barber_id
  );

  -- 5. Add services if none exist
  INSERT INTO public.services (barber_id, name, description, price, duration_minutes)
  SELECT v_barber_id, name, description, price, duration_minutes
  FROM (VALUES
    ('Classic Haircut', 'Traditional haircut with clippers and scissors', 25.00, 30),
    ('Fade', 'Precision fade from skin to length', 30.00, 45),
    ('Beard Trim', 'Shape and trim beard', 15.00, 20),
    ('Haircut + Beard', 'Full haircut with beard trim', 40.00, 60)
  ) AS t(name, description, price, duration_minutes)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.services WHERE barber_id = v_barber_id
  );

  RAISE NOTICE 'Onboarding completed for barber %', v_barber_id;
END $$;
