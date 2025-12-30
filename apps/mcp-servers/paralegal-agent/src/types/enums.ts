/**
 * Document types supported by the paralegal agent
 */
export const DocumentType = {
  MSA: 'MSA',
  SOW: 'SOW',
  CHANGE_ORDER: 'CHANGE_ORDER',
  NDA: 'NDA',
  IP_ADDENDUM: 'IP_ADDENDUM',
  PAYMENT_POLICY: 'PAYMENT_POLICY',
  DPA: 'DPA',
  SECURITY_ADDENDUM: 'SECURITY_ADDENDUM',
  BETA_AGREEMENT: 'BETA_AGREEMENT',
  SUPPORT_SLA: 'SUPPORT_SLA',
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

/**
 * Contract status values
 */
export const ContractStatus = {
  DRAFT: 'draft',
  REVIEW: 'review',
  APPROVED: 'approved',
  SIGNED: 'signed',
  ACTIVE: 'active',
  TERMINATED: 'terminated',
  EXPIRED: 'expired',
} as const;

export type ContractStatus = (typeof ContractStatus)[keyof typeof ContractStatus];

/**
 * Risk profile levels
 */
export const RiskProfile = {
  STANDARD: 'standard',
  CUSTOMER_FRIENDLY: 'customer_friendly',
  VENDOR_FRIENDLY: 'vendor_friendly',
} as const;

export type RiskProfile = (typeof RiskProfile)[keyof typeof RiskProfile];

/**
 * Pricing models for engagements
 */
export const PricingModel = {
  FIXED_FEE: 'fixed_fee',
  TIME_MATERIALS: 'time_materials',
  RETAINER: 'retainer',
  EQUITY_PARTNERSHIP: 'equity_partnership',
  BLENDED: 'blended',
} as const;

export type PricingModel = (typeof PricingModel)[keyof typeof PricingModel];

/**
 * IP ownership models
 */
export const IPModel = {
  CLIENT_OWNS: 'client_owns',
  PROVIDER_RETAINS: 'provider_retains',
  SHARED: 'shared',
} as const;

export type IPModel = (typeof IPModel)[keyof typeof IPModel];

/**
 * Clause topics for the clause library
 */
export const ClauseTopic = {
  IP_OWNERSHIP: 'IP_OWNERSHIP',
  LICENSE_GRANT: 'LICENSE_GRANT',
  CONFIDENTIALITY: 'CONFIDENTIALITY',
  LIMITATION_OF_LIABILITY: 'LIMITATION_OF_LIABILITY',
  INDEMNITY: 'INDEMNITY',
  PAYMENT_TERMS: 'PAYMENT_TERMS',
  TERMINATION: 'TERMINATION',
  DISPUTE_RESOLUTION: 'DISPUTE_RESOLUTION',
  WARRANTY: 'WARRANTY',
  FORCE_MAJEURE: 'FORCE_MAJEURE',
  DATA_PROTECTION: 'DATA_PROTECTION',
  SUBCONTRACTORS: 'SUBCONTRACTORS',
  INSURANCE: 'INSURANCE',
  NON_SOLICITATION: 'NON_SOLICITATION',
  GOVERNING_LAW: 'GOVERNING_LAW',
  NOTICES: 'NOTICES',
  ASSIGNMENT: 'ASSIGNMENT',
  ENTIRE_AGREEMENT: 'ENTIRE_AGREEMENT',
} as const;

export type ClauseTopic = (typeof ClauseTopic)[keyof typeof ClauseTopic];

/**
 * Contract version change types
 */
export const ChangeType = {
  INITIAL: 'initial',
  REVISION: 'revision',
  NEGOTIATION: 'negotiation',
  APPROVAL: 'approval',
  AMENDMENT: 'amendment',
} as const;

export type ChangeType = (typeof ChangeType)[keyof typeof ChangeType];

/**
 * Default jurisdiction
 */
export const DEFAULT_JURISDICTION = 'US-NV';
