-- ============================================================================
-- Migration: 0030_rls_initplan_performance_fixes.sql
-- Date: 2026-01-07
-- Description: Fix RLS policy performance by wrapping auth functions in (select)
--              This prevents re-evaluation of auth.role() and auth.uid() for each row
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
--
-- NOTE: Only service_role policies are included here as they don't depend on
-- table column structures. User-specific policies should be reviewed separately.
-- ============================================================================

-- ============================================================================
-- SERVICE ROLE POLICIES (auth.role() only - no column dependencies)
-- ============================================================================

-- LEADS
DROP POLICY IF EXISTS "Service role can access all leads" ON public.leads;
CREATE POLICY "Service role can access all leads" ON public.leads
    FOR ALL USING ((select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Service role can insert leads" ON public.leads;
CREATE POLICY "Service role can insert leads" ON public.leads
    FOR INSERT WITH CHECK ((select auth.role()) = 'service_role');

-- SYSTEM_HEARTBEAT
DROP POLICY IF EXISTS "Authenticated can read system_heartbeat" ON public.system_heartbeat;
CREATE POLICY "Authenticated can read system_heartbeat" ON public.system_heartbeat
    FOR SELECT USING ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Service role can access all heartbeats" ON public.system_heartbeat;
CREATE POLICY "Service role can access all heartbeats" ON public.system_heartbeat
    FOR ALL USING ((select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Service role can manage system_heartbeat" ON public.system_heartbeat;
CREATE POLICY "Service role can manage system_heartbeat" ON public.system_heartbeat
    FOR ALL USING ((select auth.role()) = 'service_role');

-- METRIC_FEED
DROP POLICY IF EXISTS "Service role can access all metric_feed" ON public.metric_feed;
CREATE POLICY "Service role can access all metric_feed" ON public.metric_feed
    FOR ALL USING ((select auth.role()) = 'service_role');

-- METRIC_SUMMARY
DROP POLICY IF EXISTS "Service role can access all metric_summary" ON public.metric_summary;
CREATE POLICY "Service role can access all metric_summary" ON public.metric_summary
    FOR ALL USING ((select auth.role()) = 'service_role');

-- ONBOARDING_STATUS
DROP POLICY IF EXISTS "Service role can access all onboarding_status" ON public.onboarding_status;
CREATE POLICY "Service role can access all onboarding_status" ON public.onboarding_status
    FOR ALL USING ((select auth.role()) = 'service_role');

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Service role can access all subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can access all subscriptions" ON public.subscriptions
    FOR ALL USING ((select auth.role()) = 'service_role');

-- CLIENTS
DROP POLICY IF EXISTS "Service role can access all clients" ON public.clients;
CREATE POLICY "Service role can access all clients" ON public.clients
    FOR ALL USING ((select auth.role()) = 'service_role');

-- LEADINTAKE
DROP POLICY IF EXISTS "Service role can access all LeadIntake" ON public."LeadIntake";
CREATE POLICY "Service role can access all LeadIntake" ON public."LeadIntake"
    FOR ALL USING ((select auth.role()) = 'service_role')
    WITH CHECK ((select auth.role()) = 'service_role');

-- CALL_EVALUATIONS
DROP POLICY IF EXISTS "Service role can access all call_evaluations" ON public.call_evaluations;
CREATE POLICY "Service role can access all call_evaluations" ON public.call_evaluations
    FOR ALL USING ((select auth.role()) = 'service_role')
    WITH CHECK ((select auth.role()) = 'service_role');

-- CALL_SCHEDULES
DROP POLICY IF EXISTS "Service role can access all call_schedules" ON public.call_schedules;
CREATE POLICY "Service role can access all call_schedules" ON public.call_schedules
    FOR ALL USING ((select auth.role()) = 'service_role')
    WITH CHECK ((select auth.role()) = 'service_role');

-- CAMPAIGNS
DROP POLICY IF EXISTS "Service role can access all campaigns" ON public.campaigns;
CREATE POLICY "Service role can access all campaigns" ON public.campaigns
    FOR ALL USING ((select auth.role()) = 'service_role')
    WITH CHECK ((select auth.role()) = 'service_role');

-- CONTACT_SUBMISSIONS
DROP POLICY IF EXISTS "Service role can access all contact submissions" ON public.contact_submissions;
CREATE POLICY "Service role can access all contact submissions" ON public.contact_submissions
    FOR ALL USING ((select auth.role()) = 'service_role');

-- CUSTOMERS
DROP POLICY IF EXISTS "Service role can access all customers" ON public.customers;
CREATE POLICY "Service role can access all customers" ON public.customers
    FOR ALL USING ((select auth.role()) = 'service_role');

-- EMAIL_LOGS
DROP POLICY IF EXISTS "Service role can access all email logs" ON public.email_logs;
CREATE POLICY "Service role can access all email logs" ON public.email_logs
    FOR ALL USING ((select auth.role()) = 'service_role');

-- ORDERS
DROP POLICY IF EXISTS "Service role can access all orders" ON public.orders;
CREATE POLICY "Service role can access all orders" ON public.orders
    FOR ALL USING ((select auth.role()) = 'service_role');

-- STRIPE_EVENT_LOG
DROP POLICY IF EXISTS "Service role can access all stripe_event_log" ON public.stripe_event_log;
CREATE POLICY "Service role can access all stripe_event_log" ON public.stripe_event_log
    FOR ALL USING ((select auth.role()) = 'service_role');

-- WEBHOOK_LOGS
DROP POLICY IF EXISTS "Service role can access all webhook logs" ON public.webhook_logs;
CREATE POLICY "Service role can access all webhook logs" ON public.webhook_logs
    FOR ALL USING ((select auth.role()) = 'service_role');

-- VAULT_ACCESS_LOG
DROP POLICY IF EXISTS "Service role can access vault_access_log" ON public.vault_access_log;
CREATE POLICY "Service role can access vault_access_log" ON public.vault_access_log
    FOR SELECT USING ((select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Service role can insert access log" ON public.vault_access_log;
CREATE POLICY "Service role can insert access log" ON public.vault_access_log
    FOR INSERT WITH CHECK ((select auth.role()) = 'service_role');

-- VAULT_CREDENTIALS
DROP POLICY IF EXISTS "Service role can access vault_credentials" ON public.vault_credentials;
CREATE POLICY "Service role can access vault_credentials" ON public.vault_credentials
    FOR ALL USING ((select auth.role()) = 'service_role');

-- WORKSHOP_TESTIMONIALS
DROP POLICY IF EXISTS "Service role can access workshop_testimonials" ON public.workshop_testimonials;
CREATE POLICY "Service role can access workshop_testimonials" ON public.workshop_testimonials
    FOR ALL USING ((select auth.role()) = 'service_role');

-- AUTOMATION_EVENTS
DROP POLICY IF EXISTS "Service role can manage events" ON public.automation_events;
CREATE POLICY "Service role can manage events" ON public.automation_events
    FOR ALL USING ((select auth.role()) = 'service_role');

-- USER_JOURNEYS
DROP POLICY IF EXISTS "Service role can manage journeys" ON public.user_journeys;
CREATE POLICY "Service role can manage journeys" ON public.user_journeys
    FOR ALL USING ((select auth.role()) = 'service_role');

-- WORKSHOP_SIGNUPS
DROP POLICY IF EXISTS "Service role can manage signups" ON public.workshop_signups;
CREATE POLICY "Service role can manage signups" ON public.workshop_signups
    FOR ALL USING ((select auth.role()) = 'service_role');

-- USER_ACCESS
DROP POLICY IF EXISTS "Service role can manage user access" ON public.user_access;
CREATE POLICY "Service role can manage user access" ON public.user_access
    FOR ALL USING ((select auth.role()) = 'service_role');

-- WORKSHOP_WAITLIST
DROP POLICY IF EXISTS "Service role can read waitlist" ON public.workshop_waitlist;
CREATE POLICY "Service role can read waitlist" ON public.workshop_waitlist
    FOR SELECT USING ((select auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Service role can manage waitlist" ON public.workshop_waitlist;
CREATE POLICY "Service role can manage waitlist" ON public.workshop_waitlist
    FOR ALL USING ((select auth.role()) = 'service_role')
    WITH CHECK ((select auth.role()) = 'service_role');

-- CLAUSE_LIBRARY
DROP POLICY IF EXISTS "authenticated_clause_library_read" ON public.clause_library;
CREATE POLICY "authenticated_clause_library_read" ON public.clause_library
    FOR SELECT USING ((select auth.role()) = 'authenticated');

-- CONTRACT_TEMPLATES
DROP POLICY IF EXISTS "authenticated_contract_templates_read" ON public.contract_templates;
CREATE POLICY "authenticated_contract_templates_read" ON public.contract_templates
    FOR SELECT USING ((select auth.role()) = 'authenticated');

-- NEGOTIATION_PLAYBOOKS (table may not exist - skipping)
-- DROP POLICY IF EXISTS "authenticated_negotiation_playbooks_read" ON public.negotiation_playbooks;

-- USER_PLATFORM_SETTINGS (table may not exist - skipping)
-- DROP POLICY IF EXISTS "service_role_full_access" ON public.user_platform_settings;

-- USER_DREAMS (table may not exist - skipping)
-- DROP POLICY IF EXISTS "service_role_full_access" ON public.user_dreams;

-- DEALS (table may not exist - skipping)
-- DROP POLICY IF EXISTS "Service role can access deals" ON public.deals;

-- ============================================================================
-- TABLES WITH RLS ENABLED BUT NO POLICIES (INFO level suggestions)
-- ============================================================================

-- CREDENTIAL_ROTATION_LOG
DROP POLICY IF EXISTS "Service role can access credential_rotation_log" ON public.credential_rotation_log;
CREATE POLICY "Service role can access credential_rotation_log" ON public.credential_rotation_log
    FOR ALL USING ((select auth.role()) = 'service_role');

-- CREDENTIAL_SERVICE_MAPPING
DROP POLICY IF EXISTS "Service role can access credential_service_mapping" ON public.credential_service_mapping;
CREATE POLICY "Service role can access credential_service_mapping" ON public.credential_service_mapping
    FOR ALL USING ((select auth.role()) = 'service_role');
