-- Seed data for offerings table
-- Using ON CONFLICT DO NOTHING for idempotent re-runs

INSERT INTO offerings (id, stripe_price_id, nickname, monthly_price)
VALUES
  ('lite',    'price_live_123', 'Dashboard Lite',  30000),
  ('growth',  'price_live_456', 'Growth Blueprint',200000),
  ('partner', 'price_live_789', 'Revenue Partner', 400000)
ON CONFLICT (id) DO NOTHING;