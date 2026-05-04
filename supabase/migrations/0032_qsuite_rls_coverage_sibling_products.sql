-- ============================================================================
-- Migration: 0032_qsuite_rls_coverage_sibling_products.sql
-- Ticket:    PLATOPS-QSUITE-RLS-COVERAGE-PER-PRODUCT-0091
-- Date:      2026-05-03
-- Description:
--   Enable RLS on the 19 Q-SUITE sibling-product tables that were skipped by
--   0064_rls_coverage.sql / 0089's to_regclass guards because they do not
--   exist in the Q-ARI canonical project.
--
--   Products covered:
--     Q-CC  : accounts, contacts, activities, pipelines, deals
--     Q-ICMS: incidents, case_notes, escalations
--     Q-REIL: properties, listings, inspections, valuations
--     Shared : organizations, organization_members, invitations, audit_logs,
--              integrations, webhooks, feature_flags
--
--   Pattern:
--     1. Create helper function user_organization_ids() if not present.
--     2. CREATE TABLE IF NOT EXISTS — idempotent, safe to re-run.
--     3. ENABLE ROW LEVEL SECURITY on each table.
--     4. At least one non-permissive policy per table using organization_id
--        scoping via user_organization_ids().
-- ============================================================================

-- ============================================================================
-- STEP 1: Helper — user_organization_ids()
-- Returns the set of organization UUIDs the current user belongs to.
-- Used as the RLS predicate so every policy is org-scoped automatically.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.user_organization_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    SELECT organization_id
    FROM public.organization_members
    WHERE user_id = auth.uid();
$$;

-- ============================================================================
-- STEP 2: Q-CC tables
-- ============================================================================

-- accounts
CREATE TABLE IF NOT EXISTS public.accounts (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    name            text NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "accounts: members can select own org" ON public.accounts;
CREATE POLICY "accounts: members can select own org"
    ON public.accounts
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "accounts: members can insert own org" ON public.accounts;
CREATE POLICY "accounts: members can insert own org"
    ON public.accounts
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "accounts: members can update own org" ON public.accounts;
CREATE POLICY "accounts: members can update own org"
    ON public.accounts
    FOR UPDATE
    USING (organization_id IN (SELECT public.user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "accounts: service role full access" ON public.accounts;
CREATE POLICY "accounts: service role full access"
    ON public.accounts
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- contacts
CREATE TABLE IF NOT EXISTS public.contacts (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    account_id      uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
    name            text NOT NULL,
    email           text,
    phone           text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts: members can select own org" ON public.contacts;
CREATE POLICY "contacts: members can select own org"
    ON public.contacts
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "contacts: members can insert own org" ON public.contacts;
CREATE POLICY "contacts: members can insert own org"
    ON public.contacts
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "contacts: members can update own org" ON public.contacts;
CREATE POLICY "contacts: members can update own org"
    ON public.contacts
    FOR UPDATE
    USING (organization_id IN (SELECT public.user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "contacts: service role full access" ON public.contacts;
CREATE POLICY "contacts: service role full access"
    ON public.contacts
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- activities
CREATE TABLE IF NOT EXISTS public.activities (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    contact_id      uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
    account_id      uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
    type            text NOT NULL,
    notes           text,
    occurred_at     timestamptz NOT NULL DEFAULT now(),
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activities: members can select own org" ON public.activities;
CREATE POLICY "activities: members can select own org"
    ON public.activities
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "activities: members can insert own org" ON public.activities;
CREATE POLICY "activities: members can insert own org"
    ON public.activities
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "activities: service role full access" ON public.activities;
CREATE POLICY "activities: service role full access"
    ON public.activities
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- pipelines
CREATE TABLE IF NOT EXISTS public.pipelines (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    name            text NOT NULL,
    stages          jsonb NOT NULL DEFAULT '[]',
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pipelines: members can select own org" ON public.pipelines;
CREATE POLICY "pipelines: members can select own org"
    ON public.pipelines
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "pipelines: members can insert own org" ON public.pipelines;
CREATE POLICY "pipelines: members can insert own org"
    ON public.pipelines
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "pipelines: members can update own org" ON public.pipelines;
CREATE POLICY "pipelines: members can update own org"
    ON public.pipelines
    FOR UPDATE
    USING (organization_id IN (SELECT public.user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "pipelines: service role full access" ON public.pipelines;
CREATE POLICY "pipelines: service role full access"
    ON public.pipelines
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- deals
CREATE TABLE IF NOT EXISTS public.deals (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    pipeline_id     uuid REFERENCES public.pipelines(id) ON DELETE SET NULL,
    contact_id      uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
    title           text NOT NULL,
    value           numeric(12,2),
    stage           text,
    status          text NOT NULL DEFAULT 'open',
    closed_at       timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deals: members can select own org" ON public.deals;
CREATE POLICY "deals: members can select own org"
    ON public.deals
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "deals: members can insert own org" ON public.deals;
CREATE POLICY "deals: members can insert own org"
    ON public.deals
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "deals: members can update own org" ON public.deals;
CREATE POLICY "deals: members can update own org"
    ON public.deals
    FOR UPDATE
    USING (organization_id IN (SELECT public.user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "deals: service role full access" ON public.deals;
CREATE POLICY "deals: service role full access"
    ON public.deals
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- STEP 3: Q-ICMS tables
-- ============================================================================

-- incidents
CREATE TABLE IF NOT EXISTS public.incidents (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    title           text NOT NULL,
    description     text,
    severity        text NOT NULL DEFAULT 'medium',
    status          text NOT NULL DEFAULT 'open',
    reported_at     timestamptz NOT NULL DEFAULT now(),
    resolved_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "incidents: members can select own org" ON public.incidents;
CREATE POLICY "incidents: members can select own org"
    ON public.incidents
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "incidents: members can insert own org" ON public.incidents;
CREATE POLICY "incidents: members can insert own org"
    ON public.incidents
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "incidents: members can update own org" ON public.incidents;
CREATE POLICY "incidents: members can update own org"
    ON public.incidents
    FOR UPDATE
    USING (organization_id IN (SELECT public.user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "incidents: service role full access" ON public.incidents;
CREATE POLICY "incidents: service role full access"
    ON public.incidents
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- case_notes
CREATE TABLE IF NOT EXISTS public.case_notes (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    incident_id     uuid REFERENCES public.incidents(id) ON DELETE CASCADE,
    author_id       uuid,
    body            text NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "case_notes: members can select own org" ON public.case_notes;
CREATE POLICY "case_notes: members can select own org"
    ON public.case_notes
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "case_notes: members can insert own org" ON public.case_notes;
CREATE POLICY "case_notes: members can insert own org"
    ON public.case_notes
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "case_notes: members can update own" ON public.case_notes;
CREATE POLICY "case_notes: members can update own"
    ON public.case_notes
    FOR UPDATE
    USING (organization_id IN (SELECT public.user_organization_ids()) AND author_id = (SELECT auth.uid()))
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "case_notes: service role full access" ON public.case_notes;
CREATE POLICY "case_notes: service role full access"
    ON public.case_notes
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- escalations
CREATE TABLE IF NOT EXISTS public.escalations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    incident_id     uuid REFERENCES public.incidents(id) ON DELETE CASCADE,
    escalated_to    uuid,
    reason          text NOT NULL,
    escalated_at    timestamptz NOT NULL DEFAULT now(),
    resolved_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "escalations: members can select own org" ON public.escalations;
CREATE POLICY "escalations: members can select own org"
    ON public.escalations
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "escalations: members can insert own org" ON public.escalations;
CREATE POLICY "escalations: members can insert own org"
    ON public.escalations
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "escalations: service role full access" ON public.escalations;
CREATE POLICY "escalations: service role full access"
    ON public.escalations
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- STEP 4: Q-REIL tables
-- ============================================================================

-- properties
CREATE TABLE IF NOT EXISTS public.properties (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    address         text NOT NULL,
    city            text,
    state           text,
    zip             text,
    property_type   text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "properties: members can select own org" ON public.properties;
CREATE POLICY "properties: members can select own org"
    ON public.properties
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "properties: members can insert own org" ON public.properties;
CREATE POLICY "properties: members can insert own org"
    ON public.properties
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "properties: members can update own org" ON public.properties;
CREATE POLICY "properties: members can update own org"
    ON public.properties
    FOR UPDATE
    USING (organization_id IN (SELECT public.user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "properties: service role full access" ON public.properties;
CREATE POLICY "properties: service role full access"
    ON public.properties
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- listings
CREATE TABLE IF NOT EXISTS public.listings (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    property_id     uuid REFERENCES public.properties(id) ON DELETE CASCADE,
    list_price      numeric(14,2),
    status          text NOT NULL DEFAULT 'active',
    listed_at       timestamptz NOT NULL DEFAULT now(),
    closed_at       timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listings: members can select own org" ON public.listings;
CREATE POLICY "listings: members can select own org"
    ON public.listings
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "listings: members can insert own org" ON public.listings;
CREATE POLICY "listings: members can insert own org"
    ON public.listings
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "listings: members can update own org" ON public.listings;
CREATE POLICY "listings: members can update own org"
    ON public.listings
    FOR UPDATE
    USING (organization_id IN (SELECT public.user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "listings: service role full access" ON public.listings;
CREATE POLICY "listings: service role full access"
    ON public.listings
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- inspections
CREATE TABLE IF NOT EXISTS public.inspections (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    property_id     uuid REFERENCES public.properties(id) ON DELETE CASCADE,
    inspector_name  text,
    scheduled_at    timestamptz,
    completed_at    timestamptz,
    result          text,
    notes           text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inspections: members can select own org" ON public.inspections;
CREATE POLICY "inspections: members can select own org"
    ON public.inspections
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "inspections: members can insert own org" ON public.inspections;
CREATE POLICY "inspections: members can insert own org"
    ON public.inspections
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "inspections: members can update own org" ON public.inspections;
CREATE POLICY "inspections: members can update own org"
    ON public.inspections
    FOR UPDATE
    USING (organization_id IN (SELECT public.user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "inspections: service role full access" ON public.inspections;
CREATE POLICY "inspections: service role full access"
    ON public.inspections
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- valuations
CREATE TABLE IF NOT EXISTS public.valuations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    property_id     uuid REFERENCES public.properties(id) ON DELETE CASCADE,
    estimated_value numeric(14,2) NOT NULL,
    valuation_date  date NOT NULL,
    method          text,
    appraiser_name  text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.valuations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "valuations: members can select own org" ON public.valuations;
CREATE POLICY "valuations: members can select own org"
    ON public.valuations
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "valuations: members can insert own org" ON public.valuations;
CREATE POLICY "valuations: members can insert own org"
    ON public.valuations
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "valuations: service role full access" ON public.valuations;
CREATE POLICY "valuations: service role full access"
    ON public.valuations
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- STEP 5: Q-Suite shared tables
-- ============================================================================

-- organizations (root anchor — no organization_id FK to self; uses id)
CREATE TABLE IF NOT EXISTS public.organizations (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text NOT NULL,
    slug       text UNIQUE NOT NULL,
    owner_id   uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations: members can select own" ON public.organizations;
CREATE POLICY "organizations: members can select own"
    ON public.organizations
    FOR SELECT
    USING (id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "organizations: owner can update" ON public.organizations;
CREATE POLICY "organizations: owner can update"
    ON public.organizations
    FOR UPDATE
    USING (owner_id = (SELECT auth.uid()))
    WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "organizations: service role full access" ON public.organizations;
CREATE POLICY "organizations: service role full access"
    ON public.organizations
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- organization_members (self-referential anchor for user_organization_ids())
CREATE TABLE IF NOT EXISTS public.organization_members (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id         uuid NOT NULL,
    role            text NOT NULL DEFAULT 'member',
    joined_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organization_members: members can select own org" ON public.organization_members;
CREATE POLICY "organization_members: members can select own org"
    ON public.organization_members
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "organization_members: service role full access" ON public.organization_members;
CREATE POLICY "organization_members: service role full access"
    ON public.organization_members
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- invitations
CREATE TABLE IF NOT EXISTS public.invitations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    invited_email   text NOT NULL,
    role            text NOT NULL DEFAULT 'member',
    token           text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
    accepted_at     timestamptz,
    expires_at      timestamptz NOT NULL DEFAULT now() + interval '7 days',
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invitations: members can select own org" ON public.invitations;
CREATE POLICY "invitations: members can select own org"
    ON public.invitations
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "invitations: members can insert own org" ON public.invitations;
CREATE POLICY "invitations: members can insert own org"
    ON public.invitations
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "invitations: service role full access" ON public.invitations;
CREATE POLICY "invitations: service role full access"
    ON public.invitations
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    actor_id        uuid,
    action          text NOT NULL,
    resource_type   text,
    resource_id     uuid,
    metadata        jsonb,
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs: members can select own org" ON public.audit_logs;
CREATE POLICY "audit_logs: members can select own org"
    ON public.audit_logs
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "audit_logs: service role full access" ON public.audit_logs;
CREATE POLICY "audit_logs: service role full access"
    ON public.audit_logs
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- integrations
CREATE TABLE IF NOT EXISTS public.integrations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    provider        text NOT NULL,
    config          jsonb NOT NULL DEFAULT '{}',
    enabled         boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "integrations: members can select own org" ON public.integrations;
CREATE POLICY "integrations: members can select own org"
    ON public.integrations
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "integrations: members can insert own org" ON public.integrations;
CREATE POLICY "integrations: members can insert own org"
    ON public.integrations
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "integrations: members can update own org" ON public.integrations;
CREATE POLICY "integrations: members can update own org"
    ON public.integrations
    FOR UPDATE
    USING (organization_id IN (SELECT public.user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "integrations: service role full access" ON public.integrations;
CREATE POLICY "integrations: service role full access"
    ON public.integrations
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- webhooks
CREATE TABLE IF NOT EXISTS public.webhooks (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    url             text NOT NULL,
    secret          text,
    events          text[] NOT NULL DEFAULT '{}',
    enabled         boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "webhooks: members can select own org" ON public.webhooks;
CREATE POLICY "webhooks: members can select own org"
    ON public.webhooks
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "webhooks: members can insert own org" ON public.webhooks;
CREATE POLICY "webhooks: members can insert own org"
    ON public.webhooks
    FOR INSERT
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "webhooks: members can update own org" ON public.webhooks;
CREATE POLICY "webhooks: members can update own org"
    ON public.webhooks
    FOR UPDATE
    USING (organization_id IN (SELECT public.user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "webhooks: service role full access" ON public.webhooks;
CREATE POLICY "webhooks: service role full access"
    ON public.webhooks
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- feature_flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL,
    flag_key        text NOT NULL,
    enabled         boolean NOT NULL DEFAULT false,
    config          jsonb NOT NULL DEFAULT '{}',
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (organization_id, flag_key)
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feature_flags: members can select own org" ON public.feature_flags;
CREATE POLICY "feature_flags: members can select own org"
    ON public.feature_flags
    FOR SELECT
    USING (organization_id IN (SELECT public.user_organization_ids()));

DROP POLICY IF EXISTS "feature_flags: service role full access" ON public.feature_flags;
CREATE POLICY "feature_flags: service role full access"
    ON public.feature_flags
    FOR ALL
    USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- STEP 6: Verify — confirm RLS is active on all 19 tables
-- ============================================================================

DO $$
DECLARE
    tbl text;
    rls_on boolean;
    tables_checked int := 0;
    tables_ok int := 0;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'accounts','contacts','activities','pipelines','deals',
        'incidents','case_notes','escalations',
        'properties','listings','inspections','valuations',
        'organizations','organization_members','invitations',
        'audit_logs','integrations','webhooks','feature_flags'
    ]) LOOP
        SELECT relrowsecurity INTO rls_on
        FROM pg_class
        WHERE relname = tbl AND relnamespace = 'public'::regnamespace;

        tables_checked := tables_checked + 1;
        IF rls_on THEN
            tables_ok := tables_ok + 1;
            RAISE NOTICE 'RLS OK: %', tbl;
        ELSE
            RAISE WARNING 'RLS NOT ENABLED: %', tbl;
        END IF;
    END LOOP;

    RAISE NOTICE '0091 verification: %/% tables have RLS enabled', tables_ok, tables_checked;
END $$;
