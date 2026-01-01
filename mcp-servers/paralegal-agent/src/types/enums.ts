/**
 * Enums for Paralegal Contract Agent System
 */

export enum DocumentType {
  MSA = 'MSA',
  SOW = 'SOW',
  CHANGE_ORDER = 'CHANGE_ORDER',
  NDA = 'NDA',
  IP_ADDENDUM = 'IP_ADDENDUM',
  PAYMENT_POLICY = 'PAYMENT_POLICY',
  DPA = 'DPA',
  SECURITY_ADDENDUM = 'SECURITY_ADDENDUM',
  BETA_AGREEMENT = 'BETA_AGREEMENT',
  SUPPORT_SLA = 'SUPPORT_SLA'
}

export enum ContractStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  SIGNED = 'signed',
  ACTIVE = 'active',
  TERMINATED = 'terminated',
  EXPIRED = 'expired'
}

export enum RiskProfile {
  STANDARD = 'standard',
  CUSTOMER_FRIENDLY = 'customer_friendly',
  VENDOR_FRIENDLY = 'vendor_friendly'
}

export enum PricingModel {
  FIXED_FEE = 'fixed_fee',
  TIME_MATERIALS = 'time_materials',
  RETAINER = 'retainer',
  EQUITY_PARTNERSHIP = 'equity_partnership',
  BLENDED = 'blended'
}

export enum IPModel {
  CLIENT_OWNS = 'client_owns',
  PROVIDER_RETAINS = 'provider_retains',
  SHARED = 'shared'
}

export enum ClauseTopic {
  IP_OWNERSHIP = 'IP_OWNERSHIP',
  LICENSE_GRANT = 'LICENSE_GRANT',
  CONFIDENTIALITY = 'CONFIDENTIALITY',
  LIMITATION_OF_LIABILITY = 'LIMITATION_OF_LIABILITY',
  INDEMNITY = 'INDEMNITY',
  PAYMENT_TERMS = 'PAYMENT_TERMS',
  TERMINATION = 'TERMINATION',
  DISPUTE_RESOLUTION = 'DISPUTE_RESOLUTION',
  WARRANTY = 'WARRANTY',
  FORCE_MAJEURE = 'FORCE_MAJEURE',
  DATA_PROTECTION = 'DATA_PROTECTION',
  SUBCONTRACTORS = 'SUBCONTRACTORS',
  INSURANCE = 'INSURANCE',
  NON_SOLICITATION = 'NON_SOLICITATION',
  GOVERNING_LAW = 'GOVERNING_LAW',
  NOTICES = 'NOTICES',
  ASSIGNMENT = 'ASSIGNMENT',
  ENTIRE_AGREEMENT = 'ENTIRE_AGREEMENT'
}

export enum ChangeType {
  INITIAL = 'initial',
  REVISION = 'revision',
  NEGOTIATION = 'negotiation',
  APPROVAL = 'approval',
  AMENDMENT = 'amendment'
}
