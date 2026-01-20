# Production Monitoring Setup - Direct Cuts Barber Subscription System
**Environment: dskpfnjbgocieoqyiznf**
**Created: 2026-01-16**
**Version: 1.0**

## Overview

This document establishes comprehensive production monitoring for the Direct Cuts barber subscription system, focusing on critical business metrics including Stripe webhook processing, booking creation, authentication failures, and reward system operations.

## Architecture Overview

### Current Monitoring Infrastructure
- **Health Endpoint**: `/api/system/health` - Database connectivity and response time
- **Monitoring API**: `/api/system/monitoring` - Metrics collection and storage
- **Webhook Processing**: Supabase Edge Functions for Stripe events
- **Database**: PostgreSQL on Supabase with comprehensive audit trails

### Key Data Tables for Monitoring
```sql
-- Core monitoring tables
webhook_events              -- Stripe webhook processing logs
barber_subscriptions        -- Subscription status tracking
reward_accounts            -- Reward points balances
reward_transactions        -- Reward point movements
appointments              -- Booking status and payments
guest_identities          -- Guest user verification
```

## Critical Monitoring Metrics

### P0 - Business Critical (Immediate Response Required)

#### 1. Stripe Webhook Failure Rate
**Target**: <5% failure rate
**Alert Threshold**: >5% in last hour
**Critical Threshold**: >10% in last 30 minutes

```sql
-- Webhook failure monitoring query
SELECT
  COUNT(*) FILTER (WHERE metadata->>'error' IS NOT NULL) * 100.0 / NULLIF(COUNT(*), 0) as failure_rate_percent,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE metadata->>'error' IS NOT NULL) as failed_events,
  COUNT(*) FILTER (WHERE event_type = 'payment_intent.succeeded') as payment_successes,
  COUNT(*) FILTER (WHERE event_type = 'payment_intent.payment_failed') as payment_failures
FROM webhook_events
WHERE processed_at > NOW() - INTERVAL '1 hour';
```

**Expected Baseline**: 1-2% failure rate during normal operations

#### 2. Subscription Status Health
**Target**: >90% active/trialing subscriptions
**Alert Threshold**: <85% active subscriptions

```sql
-- Subscription health monitoring
SELECT
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM barber_subscriptions
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY status
ORDER BY count DESC;
```

#### 3. Booking Creation Failure Rate
**Target**: <10% failure rate
**Alert Threshold**: >10% in last hour
**Critical Threshold**: >25% in last 30 minutes

```sql
-- Booking failure monitoring
-- Note: This requires implementing booking attempt tracking
SELECT
  'booking_failures' as metric,
  COUNT(*) FILTER (WHERE status = 'cancelled' AND payment_status = 'failed') as failed_bookings,
  COUNT(*) as total_attempts,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'cancelled' AND payment_status = 'failed') / NULLIF(COUNT(*), 0), 2) as failure_rate_percent
FROM appointments
WHERE created_at > NOW() - INTERVAL '1 hour';
```

### P1 - High Priority (Response within 15 minutes)

#### 4. Authentication Error Spike
**Target**: <100 auth errors per hour
**Alert Threshold**: >100 401/403 responses in last hour

```sql
-- Note: Requires implementing API request logging
-- This is a placeholder for when request logging is implemented
CREATE TABLE IF NOT EXISTS api_request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  method text NOT NULL,
  path text NOT NULL,
  status_code int NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  response_time_ms int,
  user_agent text,
  ip_address inet
);

-- Auth error monitoring query (future implementation)
SELECT
  status_code,
  COUNT(*) as error_count,
  path,
  COUNT(DISTINCT ip_address) as unique_ips
FROM api_request_logs
WHERE timestamp > NOW() - INTERVAL '1 hour'
  AND status_code IN (401, 403, 409)
GROUP BY status_code, path
ORDER BY error_count DESC;
```

#### 5. Reward System Health
**Target**: Consistent reward crediting
**Alert Threshold**: No reward credits for >2 hours during business hours

```sql
-- Reward system monitoring
SELECT
  'reward_activity' as metric,
  COUNT(*) FILTER (WHERE points_delta > 0) as rewards_credited,
  SUM(points_delta) FILTER (WHERE points_delta > 0) as total_points_earned,
  COUNT(*) FILTER (WHERE points_delta < 0) as rewards_redeemed,
  COUNT(DISTINCT reward_account_id) as active_accounts
FROM reward_transactions
WHERE created_at > NOW() - INTERVAL '1 hour';
```

### P2 - Important (Response within 1 hour)

#### 6. System Health & Performance
```sql
-- Database performance monitoring
SELECT
  'system_health' as metric,
  COUNT(*) as active_sessions,
  AVG(EXTRACT(epoch FROM (now() - query_start)) * 1000)::int as avg_query_time_ms,
  COUNT(*) FILTER (WHERE state = 'active') as active_queries
FROM pg_stat_activity
WHERE state IS NOT NULL;
```

## Alert Configuration

### Monitoring Dashboard Queries

#### Real-time Health Check
```sql
-- Combined health dashboard query
WITH webhook_health AS (
  SELECT
    COUNT(*) FILTER (WHERE metadata->>'error' IS NOT NULL) * 100.0 / NULLIF(COUNT(*), 0) as webhook_failure_rate,
    COUNT(*) as webhook_events_last_hour
  FROM webhook_events
  WHERE processed_at > NOW() - INTERVAL '1 hour'
),
subscription_health AS (
  SELECT
    COUNT(*) FILTER (WHERE status IN ('trialing', 'active')) * 100.0 / NULLIF(COUNT(*), 0) as active_subscription_rate,
    COUNT(*) as total_subscriptions
  FROM barber_subscriptions
),
reward_health AS (
  SELECT
    COUNT(*) as reward_transactions_last_hour,
    SUM(points_delta) FILTER (WHERE points_delta > 0) as points_earned_last_hour
  FROM reward_transactions
  WHERE created_at > NOW() - INTERVAL '1 hour'
)
SELECT
  now() as check_time,
  wh.webhook_failure_rate,
  wh.webhook_events_last_hour,
  sh.active_subscription_rate,
  sh.total_subscriptions,
  rh.reward_transactions_last_hour,
  rh.points_earned_last_hour
FROM webhook_health wh, subscription_health sh, reward_health rh;
```

#### Error Investigation Query
```sql
-- Error investigation and trending
SELECT
  event_type,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE metadata->>'error' IS NOT NULL) as failed_events,
  array_agg(DISTINCT metadata->>'error') FILTER (WHERE metadata->>'error' IS NOT NULL) as error_types
FROM webhook_events
WHERE processed_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY failed_events DESC;
```

### Alert Thresholds & Actions

| Metric | Warning | Critical | Action |
|--------|---------|----------|---------|
| Webhook Failure Rate | >5% | >10% | Check Stripe dashboard, verify endpoint health |
| Booking Failures | >10% | >25% | Investigate payment processing, check Stripe status |
| Auth Errors | >50/hour | >100/hour | Check auth service, verify JWT configuration |
| 500 Errors | Any | >5 in 10min | Immediate investigation, check logs |
| Subscription Issues | >15% inactive | >25% inactive | Check billing flows, contact affected barbers |
| Reward Credits Stopped | >1 hour | >2 hours | Investigate trigger functions, check appointment flow |

## Runbook Procedures

### 1. Webhook Failure Spike Investigation

**Symptoms**: Webhook failure rate >5%
```bash
# Step 1: Check recent webhook events
SELECT * FROM webhook_events
WHERE processed_at > NOW() - INTERVAL '1 hour'
AND metadata->>'error' IS NOT NULL
ORDER BY processed_at DESC LIMIT 20;

# Step 2: Check Stripe service status
curl https://status.stripe.com/api/v2/status.json

# Step 3: Verify webhook endpoint is responding
curl -I https://dskpfnjbgocieoqyiznf.supabase.co/functions/v1/stripe-webhook

# Step 4: Check Supabase function logs
# (Access via Supabase dashboard > Edge Functions > stripe-webhook > Logs)
```

**Resolution Steps**:
1. Verify webhook endpoint is accessible
2. Check Supabase function deployment status
3. Validate environment variables (STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY)
4. Review error patterns for systematic issues
5. If needed, redeploy webhook function

### 2. Booking Creation Failures

**Symptoms**: Booking failure rate >10%
```sql
-- Investigate recent booking failures
SELECT
  a.id,
  a.status,
  a.payment_status,
  a.created_at,
  b.name as barber_name,
  a.stripe_payment_intent_id
FROM appointments a
JOIN barbers b ON a.barber_id = b.id
WHERE a.created_at > NOW() - INTERVAL '2 hours'
  AND a.status IN ('cancelled', 'failed')
ORDER BY a.created_at DESC;
```

**Resolution Steps**:
1. Check barber subscription status (subscription gating function)
2. Verify Stripe payment processing
3. Review guest identity verification flow
4. Check for database constraint violations
5. Validate booking capacity limits

### 3. Authentication Error Spike

**Symptoms**: >100 auth errors per hour
```bash
# Check auth configuration
curl -H "Authorization: Bearer invalid_token" https://your-domain.com/api/health

# Review JWT token validation
# Check Supabase Auth logs in dashboard
```

**Resolution Steps**:
1. Verify Supabase auth configuration
2. Check JWT token expiration settings
3. Review RLS policies for permission issues
4. Validate API key configuration
5. Check for DDoS or abuse patterns

### 4. Reward System Stoppage

**Symptoms**: No reward credits for >1 hour during business hours
```sql
-- Check recent appointment completions
SELECT COUNT(*)
FROM appointments
WHERE status = 'completed'
  AND updated_at > NOW() - INTERVAL '2 hours';

-- Check trigger function status
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_appointment_rewards';
```

**Resolution Steps**:
1. Verify appointment completion trigger is enabled
2. Check for database trigger errors
3. Test reward function manually
4. Validate reward account creation
5. Review appointment status transition logic

## Performance Baselines

### Normal Operation Metrics (Business Hours: 9 AM - 9 PM EST)

| Metric | Baseline Range | Peak Acceptable |
|--------|----------------|-----------------|
| Webhook Events/Hour | 10-50 | 150 |
| Booking Success Rate | 85-95% | 80% minimum |
| Database Response Time | <200ms | <500ms |
| Active Subscriptions | 90-95% | 85% minimum |
| Reward Transactions/Hour | 5-25 | 75 |
| Auth Success Rate | >98% | 95% minimum |

### Off-Hours Metrics (9 PM - 9 AM EST)

| Metric | Baseline Range | Peak Acceptable |
|--------|----------------|-----------------|
| Webhook Events/Hour | 1-5 | 25 |
| Booking Success Rate | 90-98% | 85% minimum |
| Database Response Time | <100ms | <300ms |
| Reward Transactions/Hour | 0-5 | 15 |

## Monitoring Implementation Checklist

### Phase 1: Basic Monitoring (Immediate)
- [ ] Implement webhook failure rate monitoring
- [ ] Set up subscription health checks
- [ ] Configure basic alerting (email/Slack)
- [ ] Create monitoring dashboard queries
- [ ] Document runbook procedures

### Phase 2: Advanced Monitoring (Week 2)
- [ ] Implement API request logging table
- [ ] Add authentication error tracking
- [ ] Create automated error investigation scripts
- [ ] Set up performance trend analysis
- [ ] Configure cascade failure detection

### Phase 3: Proactive Monitoring (Month 1)
- [ ] Implement predictive failure detection
- [ ] Add capacity planning metrics
- [ ] Create business intelligence dashboard
- [ ] Set up automated recovery procedures
- [ ] Configure A/B testing metrics

## Environment Configuration

### Required Environment Variables
```bash
# Monitoring configuration
MONITORING_WEBHOOK_URL=<slack_webhook_for_alerts>
MONITORING_EMAIL_ALERTS=<comma_separated_emails>
MONITORING_CHECK_INTERVAL=300  # 5 minutes

# Supabase monitoring
SUPABASE_MONITORING_TABLE=system_metrics
SUPABASE_ALERT_THRESHOLD_WEBHOOK_FAILURES=5
SUPABASE_ALERT_THRESHOLD_AUTH_ERRORS=100

# Stripe monitoring
STRIPE_MONITORING_ENABLED=true
STRIPE_WEBHOOK_MONITORING_WINDOW=3600  # 1 hour
```

### Monitoring Database Schema
```sql
-- System metrics tracking table
CREATE TABLE IF NOT EXISTS system_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text,
  tags jsonb,
  timestamp timestamptz NOT NULL DEFAULT now(),
  environment text DEFAULT 'production'
);

CREATE INDEX idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX idx_system_metrics_name ON system_metrics(metric_name);

-- Alert history table
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('warning', 'critical')),
  message text NOT NULL,
  resolved_at timestamptz,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

## Integration Points

### Supabase Dashboard Integration
- **Edge Functions**: Monitor stripe-webhook function performance
- **Database**: Use built-in query performance metrics
- **Auth**: Monitor authentication success rates

### Stripe Dashboard Integration
- **Webhook Events**: Cross-reference with internal webhook_events table
- **Payment Processing**: Monitor payment_intent success rates
- **Connect Accounts**: Track barber onboarding completion

### External Monitoring Services (Optional)
- **DataDog**: For advanced APM and infrastructure monitoring
- **Sentry**: For error tracking and performance monitoring
- **PagerDuty**: For escalated alert management

## Success Criteria

✅ **Monitoring is successful when:**
1. Alert response time <5 minutes for P0 issues
2. 99.5% system uptime maintained
3. <2% false positive alert rate
4. All critical business metrics tracked in real-time
5. Automated recovery for common issues

⚠️ **Monitoring requires attention when:**
1. Alert fatigue occurs (>10 alerts/day)
2. Manual intervention required for >50% of incidents
3. Performance baselines drift >20% from normal
4. Missing metrics for new business features

## Next Steps

1. **Immediate (Week 1)**: Deploy basic monitoring queries and set up alerting
2. **Short-term (Month 1)**: Implement API request logging and advanced monitoring
3. **Medium-term (Quarter 1)**: Add predictive monitoring and automated recovery
4. **Long-term (Year 1)**: Full observability suite with business intelligence

---

**Document Owner**: OpsWatch Agent
**Last Updated**: 2026-01-16
**Review Frequency**: Weekly during initial deployment, monthly thereafter
**Alert Contact**: production-alerts@directcuts.com