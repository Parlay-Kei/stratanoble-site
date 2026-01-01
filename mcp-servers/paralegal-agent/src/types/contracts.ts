/**
 * Type definitions for Paralegal Contract Agent System
 */

import { DocumentType, ContractStatus, RiskProfile, PricingModel, IPModel, ClauseTopic, ChangeType } from './enums.js';

export interface Deal {
  id?: string;
  client_name: string;
  client_legal_name?: string;
  client_address?: Record<string, any>;
  client_contact?: Record<string, any>;
  governing_law?: string;
  services_description?: string;
  deliverables?: Record<string, any>[];
  milestones?: Milestone[];
  pricing_model?: PricingModel;
  payment_terms?: PaymentTerms;
  ip_model?: IPModel;
  start_date?: string;
  end_date?: string;
  renewal_terms?: string;
  special_terms?: string;
  risk_factors?: RiskFactor[];
  metadata?: Record<string, any>;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Milestone {
  name: string;
  description?: string;
  due_date?: string;
  payment_amount?: number;
  deliverables?: string[];
}

export interface PaymentTerms {
  deposit_percent?: number;
  milestone_payments?: boolean;
  net_days?: number;
  late_fee_percent?: number;
  payment_method?: string;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation?: string;
}

export interface Contract {
  id?: string;
  deal_id?: string;
  document_type: DocumentType;
  title?: string;
  status?: ContractStatus;
  version?: number;
  content: ContractContent;
  rendered_text?: string;
  metadata?: Record<string, any>;
  risk_profile?: RiskProfile;
  jurisdiction?: string;
  effective_date?: string;
  expiration_date?: string;
  parties?: Party[];
  signatures?: Signature[];
  review_notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContractContent {
  sections: ContractSection[];
  variables: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ContractSection {
  id: string;
  title: string;
  content: string;
  clauses?: string[];
  order?: number;
}

export interface Party {
  role: 'provider' | 'client';
  name: string;
  legal_name?: string;
  address?: string;
  signatory?: string;
  title?: string;
}

export interface Signature {
  party: string;
  signatory_name: string;
  title?: string;
  signed_at?: string;
  ip_address?: string;
}

export interface ContractVersion {
  id?: string;
  contract_id: string;
  version: number;
  content: ContractContent;
  rendered_text?: string;
  changes_summary?: string;
  change_type?: ChangeType;
  changed_sections?: ChangedSection[];
  created_by?: string;
  created_at?: string;
}

export interface ChangedSection {
  section_id: string;
  change_type: 'added' | 'modified' | 'deleted';
  old_text?: string;
  new_text?: string;
}

export interface Clause {
  id?: string;
  topic: ClauseTopic;
  clause_key: string;
  clause_name: string;
  risk_profile?: RiskProfile;
  jurisdiction?: string;
  when_to_use?: string;
  text: string;
  variables?: ClauseVariable[];
  alternatives?: AlternativeClause[];
  metadata?: Record<string, any>;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClauseVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  default?: any;
  description?: string;
}

export interface AlternativeClause {
  clause_key: string;
  when_to_use: string;
}

export interface PlaybookRule {
  id?: string;
  topic: string;
  rule_key: string;
  jurisdiction?: string;
  default_position: string;
  acceptable_alternatives?: AcceptableAlternative[];
  unacceptable_positions?: UnacceptablePosition[];
  escalation_required?: boolean;
  escalation_reason?: string;
  notes_for_ai?: string;
  priority?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AcceptableAlternative {
  position: string;
  conditions?: string;
  notes?: string;
}

export interface UnacceptablePosition {
  position: string;
  reason: string;
  hard_stop: boolean;
}

export interface ContractTemplate {
  id?: string;
  document_type: DocumentType;
  template_key: string;
  template_name: string;
  description?: string;
  version?: string;
  risk_profile?: RiskProfile;
  jurisdiction?: string;
  content: string;
  sections?: TemplateSection[];
  variables?: TemplateVariable[];
  required_clauses?: string[];
  optional_clauses?: string[];
  metadata?: Record<string, any>;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  order: number;
  required: boolean;
  default_content?: string;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  default?: any;
  required: boolean;
  description?: string;
}

export interface DiffResult {
  has_changes: boolean;
  added_lines: number;
  removed_lines: number;
  changed_sections: ChangedSection[];
  risk_impacting_changes: RiskImpactingChange[];
  full_diff: string;
}

export interface RiskImpactingChange {
  section: string;
  type: 'liability' | 'payment' | 'ip' | 'termination' | 'warranty' | 'indemnity' | 'confidentiality';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  requires_review: boolean;
}
