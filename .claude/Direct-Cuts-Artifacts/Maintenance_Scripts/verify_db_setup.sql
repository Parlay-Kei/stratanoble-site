-- Check tables exist (should return 6)
SELECT COUNT(*) as table_count FROM information_schema.tables
WHERE table_name IN ('barber_onboarding_progress', 'barber_specialties',
  'barber_portfolio_images', 'barber_verification_status',
  'service_templates', 'market_pricing_data');

-- Check seed data
SELECT COUNT(*) as service_template_count FROM service_templates;
SELECT COUNT(*) as market_pricing_count FROM market_pricing_data;
