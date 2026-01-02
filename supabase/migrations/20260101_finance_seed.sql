-- =============================================================================
-- CFO Agent Finance Schema Seed Data
-- =============================================================================
-- Entity: STRATANOBLE
-- Version: 1.0.0
--
-- Day 1 configuration for Direct Cuts marketplace
-- =============================================================================

-- =============================================================================
-- SEED SEGMENTS
-- =============================================================================

insert into finance.segments (segment_id, type, merchant_of_record, finance_policy_version, currency, enabled)
values
  ('direct_cuts_marketplace', 'marketplace', false, 'v1', 'USD', true),
  ('reilq_saas', 'saas', false, 'v1', 'USD', false),
  ('stratanoble_services', 'services', false, 'v1', 'USD', false)
on conflict (segment_id) do update
set type = excluded.type,
    merchant_of_record = excluded.merchant_of_record,
    finance_policy_version = excluded.finance_policy_version,
    currency = excluded.currency,
    enabled = excluded.enabled,
    updated_at = now();

-- =============================================================================
-- SEED METRIC DEFINITIONS
-- =============================================================================

-- Marketplace metrics
insert into finance.metric_definitions (metric_key, display_name, description, unit, formula, segment_types, policy_dependencies)
values
  ('gmv', 'Gross Merchandise Value', 'Total transaction value before platform take', 'USD', 'SUM(appointment.price)', '{"marketplace"}', '{"P1:gmv_operating_metric"}'),
  ('platform_revenue', 'Platform Revenue', 'Platform take only (commissions + booking fees)', 'USD', 'SUM(appointment.platform_take)', '{"marketplace"}', '{"P1:revenue_take_only"}'),
  ('take_rate', 'Take Rate', 'Platform revenue as percentage of GMV', 'percent', 'platform_revenue / gmv * 100', '{"marketplace"}', '{"P1:revenue_take_only"}'),
  ('contribution_per_order', 'Contribution Per Order', 'Net contribution per completed appointment', 'USD', '(platform_revenue - processor_fees - promos) / completed_orders', '{"marketplace"}', '{"P1:revenue_take_only", "P2:promo_classification"}'),
  ('refund_rate', 'Refund Rate', 'Refunds as percentage of GMV', 'percent', 'refunds / gmv * 100', '{"marketplace"}', '{}'),
  ('dispute_rate', 'Dispute Rate', 'Disputes as percentage of GMV', 'percent', 'disputes / gmv * 100', '{"marketplace"}', '{}'),
  ('processor_fee_rate', 'Processor Fee Rate', 'Stripe fees as percentage of charges', 'percent', 'processor_fees / charges * 100', '{"marketplace"}', '{}'),
  ('promo_marketing_expense', 'Promo Marketing Expense', 'Service discounts classified as marketing expense', 'USD', 'SUM(promo WHERE type=service_discount)', '{"marketplace"}', '{"P2:promo_classification"}'),
  ('promo_contra_revenue', 'Promo Contra-Revenue', 'Fee waivers classified as contra-revenue', 'USD', 'SUM(promo WHERE type=fee_waiver)', '{"marketplace"}', '{"P2:promo_classification"}')
on conflict (metric_key) do update
set display_name = excluded.display_name,
    description = excluded.description,
    unit = excluded.unit,
    formula = excluded.formula,
    segment_types = excluded.segment_types,
    policy_dependencies = excluded.policy_dependencies,
    updated_at = now();

-- SaaS metrics
insert into finance.metric_definitions (metric_key, display_name, description, unit, formula, segment_types, policy_dependencies)
values
  ('mrr', 'Monthly Recurring Revenue', 'Total monthly subscription revenue', 'USD', 'SUM(subscription.monthly_amount)', '{"saas"}', '{}'),
  ('arr', 'Annual Recurring Revenue', 'MRR * 12', 'USD', 'mrr * 12', '{"saas"}', '{}'),
  ('arpu', 'Average Revenue Per User', 'MRR / active subscribers', 'USD', 'mrr / active_subscriptions', '{"saas"}', '{}'),
  ('revenue_churn', 'Revenue Churn', 'Lost MRR from cancellations', 'USD', 'SUM(cancelled_subscription.monthly_amount)', '{"saas"}', '{}'),
  ('revenue_churn_rate', 'Revenue Churn Rate', 'Revenue churn as percentage of MRR', 'percent', 'revenue_churn / mrr * 100', '{"saas"}', '{}'),
  ('nrr', 'Net Revenue Retention', 'Revenue from existing customers vs prior period', 'percent', '(mrr_existing + expansion - churn) / mrr_prior * 100', '{"saas"}', '{}'),
  ('gross_margin', 'Gross Margin', 'Revenue minus COGS as percentage', 'percent', '(revenue - cogs) / revenue * 100', '{"saas"}', '{}'),
  ('ltv', 'Lifetime Value', 'Expected revenue from a customer over their lifetime', 'USD', 'arpu * gross_margin / churn_rate', '{"saas"}', '{}'),
  ('cac', 'Customer Acquisition Cost', 'Marketing + sales spend per new customer', 'USD', 'marketing_spend / new_customers', '{"saas"}', '{}'),
  ('payback_months', 'CAC Payback', 'Months to recover acquisition cost', 'months', 'cac / (arpu * gross_margin)', '{"saas"}', '{}')
on conflict (metric_key) do update
set display_name = excluded.display_name,
    description = excluded.description,
    unit = excluded.unit,
    formula = excluded.formula,
    segment_types = excluded.segment_types,
    policy_dependencies = excluded.policy_dependencies,
    updated_at = now();

-- Cash and runway metrics
insert into finance.metric_definitions (metric_key, display_name, description, unit, formula, segment_types, policy_dependencies)
values
  ('cash_balance', 'Cash Balance', 'Current bank balance', 'USD', 'bank.closing_balance', '{"marketplace", "saas", "services"}', '{}'),
  ('net_burn', 'Net Burn', 'Cash outflow minus inflow', 'USD', 'cash_out - cash_in', '{"marketplace", "saas", "services"}', '{}'),
  ('runway_months', 'Runway', 'Months until cash runs out at current burn', 'months', 'cash_balance / net_burn', '{"marketplace", "saas", "services"}', '{}'),
  ('gross_burn', 'Gross Burn', 'Total cash outflow', 'USD', 'SUM(cash_out)', '{"marketplace", "saas", "services"}', '{}')
on conflict (metric_key) do update
set display_name = excluded.display_name,
    description = excluded.description,
    unit = excluded.unit,
    formula = excluded.formula,
    segment_types = excluded.segment_types,
    policy_dependencies = excluded.policy_dependencies,
    updated_at = now();

-- =============================================================================
-- SEED RULESETS
-- =============================================================================

insert into finance.rulesets (ruleset_key, description, rules, version, enabled)
values (
  'default_v1',
  'Default CFO Agent ruleset with standard thresholds for STRATANOBLE ventures',
  '{
    "cashRunway": {
      "minMonthsCash": 1.0,
      "runwayDropWoWPercent": 20,
      "burnIncreaseMoMPercent": 15
    },
    "marketplaceHealth": {
      "minContributionPerOrder": 4.0,
      "maxRefundRatePercent": 3.0,
      "maxDisputeRatePercent": 0.5
    },
    "saasHealth": {
      "maxRevenueChurnIncreaseMoMPercent": 20,
      "nrrWarningPercent": 90,
      "nrrCriticalPercent": 80
    },
    "stripeOperational": {
      "maxFailedPaymentIncreaseWoWPercent": 30,
      "maxSyncLagMinutes": 60,
      "maxBankSyncLagHours": 12
    },
    "dataQuality": {
      "alertOnMissingAttribution": true
    }
  }',
  'v1',
  true
)
on conflict (ruleset_key) do update
set description = excluded.description,
    rules = excluded.rules,
    version = excluded.version,
    enabled = excluded.enabled,
    updated_at = now();

-- =============================================================================
-- SEED AGENT SCHEDULES
-- =============================================================================

insert into finance.agent_schedules (job_key, cadence, run_at_time, timezone, enabled)
values
  ('stripe_rollup_refresh', 'hourly', null, 'America/Los_Angeles', true),
  ('daily_snapshot', 'daily', '08:00', 'America/Los_Angeles', true),
  ('weekly_cohorts', 'weekly', '09:00', 'America/Los_Angeles', true),
  ('monthly_kpi_pack', 'monthly', '10:00', 'America/Los_Angeles', true),
  ('quarterly_policy_review', 'quarterly', '10:00', 'America/Los_Angeles', true)
on conflict (job_key) do update
set cadence = excluded.cadence,
    run_at_time = excluded.run_at_time,
    timezone = excluded.timezone,
    enabled = excluded.enabled,
    updated_at = now();
