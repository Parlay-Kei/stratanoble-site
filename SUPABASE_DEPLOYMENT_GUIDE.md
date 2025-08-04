# Supabase SaaS Integration Deployment Guide

This guide walks you through deploying the complete Supabase integration for your SaaS metrics platform.

## Pre-requisites

- [ ] Supabase project created
- [ ] Stripe account with webhook endpoint configured
- [ ] YouTube API key (optional)
- [ ] TikTok API credentials (optional)
- [ ] Postmark account for emails
- [ ] QStash account for job scheduling

## Step 1: Database Setup

1. **Run the main schema**:
   ```bash
   # Copy the contents of database/schema.sql and run in Supabase SQL Editor
   cat database/schema.sql
   ```

2. **Run the monitoring setup**:
   ```bash
   # Copy the contents of monitoring/heartbeat.sql and run in Supabase SQL Editor
   cat monitoring/heartbeat.sql
   ```

3. **Verify tables were created**:
   - clients
   - subscriptions
   - offerings
   - metric_feed
   - metric_summary
   - stripe_event_log
   - onboarding_status
   - system_heartbeat

## Step 2: Configure Environment Variables

### In Supabase Dashboard → Project Settings → Secrets

Add these secrets to your Supabase project:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_SIGNING_SECRET=whsec_...

# External APIs
YOUTUBE_API_KEY=your_youtube_api_key
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token

# QStash
QSTASH_TOKEN=your_qstash_token
QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key

# Email
POSTMARK_API_TOKEN=your_postmark_token
```

### In your application .env files

Update your `.env.local` and `.env.production`:

```bash
# Copy from .env.example and fill in your values
cp .env.example .env.local
```

## Step 3: Deploy Edge Functions

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login and link project**:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. **Deploy functions**:
   ```bash
   supabase functions deploy fetch-metrics
   supabase functions deploy summarise-metrics
   supabase functions deploy provision
   supabase functions deploy health-check
   ```

## Step 4: Configure Scheduled Jobs

### In Supabase Dashboard → Database → Cron Jobs

1. **Metrics Fetching (every 6 hours)**:
   ```sql
   SELECT cron.schedule(
     'fetch-metrics-job',
     '0 */6 * * *',
     'SELECT net.http_post(
       url:=''https://your-project.supabase.co/functions/v1/fetch-metrics'',
       headers:=''{"Authorization": "Bearer your-service-role-key"}''::jsonb
     );'
   );
   ```

2. **Metrics Summarization (daily at 3 AM UTC)**:
   ```sql
   SELECT cron.schedule(
     'summarise-metrics-job',
     '0 3 * * *',
     'SELECT net.http_post(
       url:=''https://your-project.supabase.co/functions/v1/summarise-metrics'',
       headers:=''{"Authorization": "Bearer your-service-role-key"}''::jsonb
     );'
   );
   ```

3. **Health Check (every 5 minutes)**:
   ```sql
   SELECT cron.schedule(
     'health-check-job',
     '*/5 * * * *',
     'SELECT net.http_post(
       url:=''https://your-project.supabase.co/functions/v1/health-check'',
       headers:=''{"Authorization": "Bearer your-service-role-key"}''::jsonb
     );'
   );
   ```

## Step 5: Configure Storage (Optional)

If you want to store brand assets:

1. **Create bucket**:
   ```sql
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('brand-assets', 'brand-assets', true);
   ```

2. **Set bucket policy**:
   ```sql
   CREATE POLICY "Users can upload their own brand assets" ON storage.objects
     FOR INSERT WITH CHECK (
       bucket_id = 'brand-assets' AND 
       auth.uid()::text = (storage.foldername(name))[1]
     );

   CREATE POLICY "Public read access to brand assets" ON storage.objects
     FOR SELECT USING (bucket_id = 'brand-assets');
   ```

## Step 6: Update Stripe Webhook URL

In your Stripe dashboard, update the webhook endpoint to include SaaS events:

**Endpoint URL**: `https://your-domain.com/api/stripe/webhook`

**Events to send**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `checkout.session.completed` (existing)
- `payment_intent.succeeded` (existing)

## Step 7: Test the Integration

1. **Run the integration test script**:
   ```bash
   node scripts/test-supabase-integration.js
   ```

2. **Manual testing checklist**:
   - [ ] Create a test subscription via Stripe
   - [ ] Verify client record is created in Supabase
   - [ ] Check that onboarding email is sent
   - [ ] Verify metrics fetching works (if API keys configured)
   - [ ] Test the dashboard access with RLS policies

## Step 8: Monitor and Observe

1. **Set up UptimeRobot** to monitor:
   - `https://your-project.supabase.co/functions/v1/health-check`
   - Your main application endpoints

2. **Enable Logflare integration** in Supabase for Edge Function logs

3. **Configure PgBouncer** if expecting >100 concurrent connections

## Step 9: Production Readiness

### Security Checklist
- [ ] All RLS policies are enabled and tested
- [ ] Service role key is only used server-side
- [ ] Webhook secrets are properly validated
- [ ] All sensitive data is properly encrypted

### Performance Checklist
- [ ] Database indexes are created for frequent queries
- [ ] Connection pooling is configured
- [ ] Metrics cleanup job removes old data (>30 days)
- [ ] Edge Functions have appropriate timeouts

### Monitoring Checklist
- [ ] Health checks are running every 5 minutes
- [ ] Heartbeat table is populated by all services
- [ ] Error logs are forwarded to your monitoring system
- [ ] Alerts are configured for service downtime

## Troubleshooting

### Common Issues

1. **Edge Functions not deploying**:
   - Check Supabase CLI version: `supabase --version`
   - Verify project linking: `supabase status`

2. **RLS policies blocking queries**:
   - Test with service role key first
   - Verify `auth.uid()` matches expected values

3. **Webhook events not processing**:
   - Check QStash logs in dashboard
   - Verify webhook signature validation
   - Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

4. **Metrics not being fetched**:
   - Verify API keys are set in Supabase secrets
   - Check Edge Function logs in Supabase dashboard
   - Test manual function invocation

### Support

If you encounter issues:

1. Check Supabase logs in Dashboard → Logs
2. Review Edge Function logs
3. Test individual components with the integration script
4. Verify all environment variables are properly set

## Next Steps

After successful deployment:

1. **Set up monitoring dashboards** using the `service_health_summary` view
2. **Configure backup strategies** for critical data
3. **Implement rate limiting** for Edge Functions if needed
4. **Add custom metrics** specific to your business needs
5. **Set up automated alerts** for system health issues

---

🎉 **Congratulations!** Your Supabase SaaS integration is now live and ready to serve as the backbone of your metrics platform.