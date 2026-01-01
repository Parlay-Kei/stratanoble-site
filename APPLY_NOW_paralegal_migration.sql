-- ============================================================================
-- Migration: 0025_paralegal_contract_tables.sql
-- Date: 2025-12-28
-- Description: Creates tables for Paralegal Contract Agent System
--              - deals: Client engagement intake data
--              - contracts: Generated contract documents
--              - contract_versions: Version history for diff tracking
--              - clause_library: Reusable contract clauses
--              - playbook_rules: Negotiation policy rules
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Deals table (intake data for client engagements)
-- ============================================================================
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_legal_name TEXT,
  client_address JSONB,
  client_contact JSONB,
  governing_law TEXT DEFAULT 'US-NV',
  services_description TEXT,
  deliverables JSONB,
  milestones JSONB,
  pricing_model TEXT CHECK (pricing_model IN (
    'fixed_fee', 'time_materials', 'retainer',
    'equity_partnership', 'blended'
  )),
  payment_terms JSONB,
  ip_model TEXT CHECK (ip_model IN (
    'client_owns', 'provider_retains', 'shared'
  )),
  start_date DATE,
  end_date DATE,
  renewal_terms TEXT,
  special_terms TEXT,
  risk_factors JSONB,
  metadata JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Contracts table (generated contract documents)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'MSA', 'SOW', 'CHANGE_ORDER', 'NDA',
    'IP_ADDENDUM', 'PAYMENT_POLICY', 'DPA',
    'SECURITY_ADDENDUM', 'BETA_AGREEMENT', 'SUPPORT_SLA'
  )),
  title TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'review', 'approved', 'signed', 'active', 'terminated', 'expired'
  )),
  version INTEGER DEFAULT 1,
  content JSONB NOT NULL,
  rendered_text TEXT,
  metadata JSONB,
  risk_profile TEXT DEFAULT 'standard' CHECK (risk_profile IN (
    'standard', 'customer_friendly', 'vendor_friendly'
  )),
  jurisdiction TEXT DEFAULT 'US-NV',
  effective_date DATE,
  expiration_date DATE,
  parties JSONB,
  signatures JSONB,
  review_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Contract versions (for diff tracking and audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contract_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content JSONB NOT NULL,
  rendered_text TEXT,
  changes_summary TEXT,
  change_type TEXT CHECK (change_type IN (
    'initial', 'revision', 'negotiation', 'approval', 'amendment'
  )),
  changed_sections JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contract_id, version)
);

-- ============================================================================
-- Clause library (reusable contract clauses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS clause_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL CHECK (topic IN (
    'IP_OWNERSHIP', 'LICENSE_GRANT', 'CONFIDENTIALITY',
    'LIMITATION_OF_LIABILITY', 'INDEMNITY', 'PAYMENT_TERMS',
    'TERMINATION', 'DISPUTE_RESOLUTION', 'WARRANTY', 'FORCE_MAJEURE',
    'DATA_PROTECTION', 'SUBCONTRACTORS', 'INSURANCE', 'NON_SOLICITATION',
    'GOVERNING_LAW', 'NOTICES', 'ASSIGNMENT', 'ENTIRE_AGREEMENT'
  )),
  clause_key TEXT UNIQUE NOT NULL,
  clause_name TEXT NOT NULL,
  risk_profile TEXT DEFAULT 'standard' CHECK (risk_profile IN (
    'standard', 'customer_friendly', 'vendor_friendly'
  )),
  jurisdiction TEXT,
  when_to_use TEXT,
  text TEXT NOT NULL,
  variables JSONB,
  alternatives JSONB,
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Playbook rules (negotiation policy decisions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS playbook_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  rule_key TEXT UNIQUE NOT NULL,
  jurisdiction TEXT,
  default_position TEXT NOT NULL,
  acceptable_alternatives JSONB,
  unacceptable_positions JSONB,
  escalation_required BOOLEAN DEFAULT FALSE,
  escalation_reason TEXT,
  notes_for_ai TEXT,
  priority INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Contract templates (base templates for document generation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_type TEXT NOT NULL CHECK (document_type IN (
    'MSA', 'SOW', 'CHANGE_ORDER', 'NDA',
    'IP_ADDENDUM', 'PAYMENT_POLICY', 'DPA',
    'SECURITY_ADDENDUM', 'BETA_AGREEMENT', 'SUPPORT_SLA'
  )),
  template_key TEXT UNIQUE NOT NULL,
  template_name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0',
  risk_profile TEXT DEFAULT 'standard' CHECK (risk_profile IN (
    'standard', 'customer_friendly', 'vendor_friendly'
  )),
  jurisdiction TEXT DEFAULT 'US-NV',
  content TEXT NOT NULL,
  sections JSONB,
  variables JSONB,
  required_clauses JSONB,
  optional_clauses JSONB,
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

-- Deals indexes
CREATE INDEX IF NOT EXISTS idx_deals_client_name ON deals(client_name);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_created_by ON deals(created_by);

-- Contracts indexes
CREATE INDEX IF NOT EXISTS idx_contracts_deal ON contracts(deal_id);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(document_type);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_created_by ON contracts(created_by);
CREATE INDEX IF NOT EXISTS idx_contracts_jurisdiction ON contracts(jurisdiction);

-- Contract versions indexes
CREATE INDEX IF NOT EXISTS idx_contract_versions_contract ON contract_versions(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_versions_created_at ON contract_versions(created_at DESC);

-- Clause library indexes
CREATE INDEX IF NOT EXISTS idx_clause_library_topic ON clause_library(topic);
CREATE INDEX IF NOT EXISTS idx_clause_library_risk_profile ON clause_library(risk_profile);
CREATE INDEX IF NOT EXISTS idx_clause_library_jurisdiction ON clause_library(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_clause_library_active ON clause_library(is_active) WHERE is_active = TRUE;

-- Playbook rules indexes
CREATE INDEX IF NOT EXISTS idx_playbook_rules_topic ON playbook_rules(topic);
CREATE INDEX IF NOT EXISTS idx_playbook_rules_active ON playbook_rules(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_playbook_rules_priority ON playbook_rules(priority DESC);

-- Contract templates indexes
CREATE INDEX IF NOT EXISTS idx_contract_templates_type ON contract_templates(document_type);
CREATE INDEX IF NOT EXISTS idx_contract_templates_active ON contract_templates(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clause_library_updated_at ON clause_library;
CREATE TRIGGER update_clause_library_updated_at
  BEFORE UPDATE ON clause_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_playbook_rules_updated_at ON playbook_rules;
CREATE TRIGGER update_playbook_rules_updated_at
  BEFORE UPDATE ON playbook_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contract_templates_updated_at ON contract_templates;
CREATE TRIGGER update_contract_templates_updated_at
  BEFORE UPDATE ON contract_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clause_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for server-side operations)
CREATE POLICY "service_role_deals_policy" ON deals
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_contracts_policy" ON contracts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_contract_versions_policy" ON contract_versions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_clause_library_policy" ON clause_library
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_playbook_rules_policy" ON playbook_rules
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_contract_templates_policy" ON contract_templates
  FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can read clause library and templates
CREATE POLICY "authenticated_clause_library_read" ON clause_library
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

CREATE POLICY "authenticated_playbook_rules_read" ON playbook_rules
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

CREATE POLICY "authenticated_contract_templates_read" ON contract_templates
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Users can read their own deals and contracts
CREATE POLICY "users_own_deals_read" ON deals
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "users_own_contracts_read" ON contracts
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "users_own_contract_versions_read" ON contract_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = contract_versions.contract_id
      AND c.created_by = auth.uid()
    )
  );

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE deals IS 'Client engagement intake data for contract generation';
COMMENT ON TABLE contracts IS 'Generated contract documents with versioning';
COMMENT ON TABLE contract_versions IS 'Version history for contract diff tracking and audit trail';
COMMENT ON TABLE clause_library IS 'Reusable contract clauses organized by topic and risk profile';
COMMENT ON TABLE playbook_rules IS 'Negotiation policy rules and acceptable positions';
COMMENT ON TABLE contract_templates IS 'Base templates for document generation';

COMMENT ON COLUMN deals.pricing_model IS 'Engagement pricing: fixed_fee, time_materials, retainer, equity_partnership, blended';
COMMENT ON COLUMN deals.ip_model IS 'IP ownership model: client_owns, provider_retains, shared';
COMMENT ON COLUMN deals.milestones IS 'JSONB: [{name, description, due_date, payment_amount, deliverables}]';
COMMENT ON COLUMN deals.payment_terms IS 'JSONB: {deposit_percent, milestone_payments, net_days, late_fee_percent}';
COMMENT ON COLUMN deals.risk_factors IS 'JSONB: [{factor, severity, mitigation}]';

COMMENT ON COLUMN contracts.document_type IS 'Contract type: MSA, SOW, CHANGE_ORDER, NDA, IP_ADDENDUM, etc.';
COMMENT ON COLUMN contracts.content IS 'JSONB: {sections: [{id, title, content, clauses}], variables: {}, metadata: {}}';
COMMENT ON COLUMN contracts.risk_profile IS 'Risk stance: standard, customer_friendly, vendor_friendly';
COMMENT ON COLUMN contracts.parties IS 'JSONB: [{role, name, legal_name, address, signatory}]';
COMMENT ON COLUMN contracts.signatures IS 'JSONB: [{party, signatory_name, title, signed_at, ip_address}]';

COMMENT ON COLUMN contract_versions.change_type IS 'Type of change: initial, revision, negotiation, approval, amendment';
COMMENT ON COLUMN contract_versions.changed_sections IS 'JSONB: [{section_id, change_type, old_text, new_text}]';

COMMENT ON COLUMN clause_library.topic IS 'Clause category: IP_OWNERSHIP, CONFIDENTIALITY, LIABILITY, etc.';
COMMENT ON COLUMN clause_library.variables IS 'JSONB: [{name, type, default, description}]';
COMMENT ON COLUMN clause_library.alternatives IS 'JSONB: [{clause_key, when_to_use}] - alternative clauses';

COMMENT ON COLUMN playbook_rules.acceptable_alternatives IS 'JSONB: [{position, conditions, notes}]';
COMMENT ON COLUMN playbook_rules.unacceptable_positions IS 'JSONB: [{position, reason, hard_stop}]';
COMMENT ON COLUMN playbook_rules.escalation_required IS 'TRUE if human review required before accepting';
COMMENT ON COLUMN playbook_rules.priority IS 'Rule priority (higher = more important)';

COMMENT ON COLUMN contract_templates.sections IS 'JSONB: [{id, title, order, required, default_content}]';
COMMENT ON COLUMN contract_templates.variables IS 'JSONB: [{name, type, default, required, description}]';
COMMENT ON COLUMN contract_templates.required_clauses IS 'JSONB: [clause_keys] - must include these clauses';
COMMENT ON COLUMN contract_templates.optional_clauses IS 'JSONB: [clause_keys] - may include these clauses';
