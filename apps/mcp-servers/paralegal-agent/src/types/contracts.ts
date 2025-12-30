import type {
  DocumentType,
  ContractStatus,
  RiskProfile,
  PricingModel,
  IPModel,
  ClauseTopic,
  ChangeType,
} from './enums.js';

/**
 * Address structure for clients/parties
 */
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Contact information
 */
export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  title?: string;
}

/**
 * Milestone structure for SOW documents
 */
export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate?: string;
  paymentAmount?: number;
  deliverables: string[];
  acceptanceCriteria?: string[];
}

/**
 * Payment terms configuration
 */
export interface PaymentTerms {
  depositPercent?: number;
  depositAmount?: number;
  milestonePayments?: boolean;
  netDays: number;
  lateFeePercent?: number;
  currency: string;
  paymentMethods?: string[];
}

/**
 * Risk factor for deal assessment
 */
export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation?: string;
}

/**
 * Deal (intake data) structure
 */
export interface Deal {
  id: string;
  clientName: string;
  clientLegalName?: string;
  clientAddress?: Address;
  clientContact?: ContactInfo;
  governingLaw: string;
  servicesDescription?: string;
  deliverables?: string[];
  milestones?: Milestone[];
  pricingModel?: PricingModel;
  paymentTerms?: PaymentTerms;
  ipModel?: IPModel;
  startDate?: string;
  endDate?: string;
  renewalTerms?: string;
  specialTerms?: string;
  riskFactors?: RiskFactor[];
  metadata?: Record<string, unknown>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Contract section structure
 */
export interface ContractSection {
  id: string;
  title: string;
  order: number;
  content: string;
  clauses?: string[];
  isRequired?: boolean;
}

/**
 * Contract content structure (stored as JSONB)
 */
export interface ContractContent {
  sections: ContractSection[];
  variables: Record<string, string | number | boolean>;
  metadata?: Record<string, unknown>;
}

/**
 * Party to a contract
 */
export interface ContractParty {
  role: 'provider' | 'client' | 'third_party';
  name: string;
  legalName: string;
  address?: Address;
  signatory?: {
    name: string;
    title: string;
    email: string;
  };
}

/**
 * Signature record
 */
export interface Signature {
  party: string;
  signatoryName: string;
  title: string;
  signedAt: string;
  ipAddress?: string;
  signatureMethod?: string;
}

/**
 * Contract document structure
 */
export interface Contract {
  id: string;
  dealId?: string;
  documentType: DocumentType;
  title?: string;
  status: ContractStatus;
  version: number;
  content: ContractContent;
  renderedText?: string;
  metadata?: Record<string, unknown>;
  riskProfile: RiskProfile;
  jurisdiction: string;
  effectiveDate?: string;
  expirationDate?: string;
  parties?: ContractParty[];
  signatures?: Signature[];
  reviewNotes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Section change record for version tracking
 */
export interface SectionChange {
  sectionId: string;
  changeType: 'added' | 'removed' | 'modified';
  oldText?: string;
  newText?: string;
}

/**
 * Contract version record
 */
export interface ContractVersion {
  id: string;
  contractId: string;
  version: number;
  content: ContractContent;
  renderedText?: string;
  changesSummary?: string;
  changeType: ChangeType;
  changedSections?: SectionChange[];
  createdBy?: string;
  createdAt: string;
}

/**
 * Clause variable definition
 */
export interface ClauseVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  default?: string | number | boolean;
  description?: string;
  required?: boolean;
}

/**
 * Alternative clause reference
 */
export interface ClauseAlternative {
  clauseKey: string;
  whenToUse: string;
}

/**
 * Clause library entry
 */
export interface Clause {
  id: string;
  topic: ClauseTopic;
  clauseKey: string;
  clauseName: string;
  riskProfile: RiskProfile;
  jurisdiction?: string;
  whenToUse?: string;
  text: string;
  variables?: ClauseVariable[];
  alternatives?: ClauseAlternative[];
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Acceptable alternative position
 */
export interface AcceptableAlternative {
  position: string;
  conditions?: string;
  notes?: string;
}

/**
 * Unacceptable position
 */
export interface UnacceptablePosition {
  position: string;
  reason: string;
  hardStop: boolean;
}

/**
 * Playbook rule entry
 */
export interface PlaybookRule {
  id: string;
  topic: string;
  ruleKey: string;
  jurisdiction?: string;
  defaultPosition: string;
  acceptableAlternatives?: AcceptableAlternative[];
  unacceptablePositions?: UnacceptablePosition[];
  escalationRequired: boolean;
  escalationReason?: string;
  notesForAI?: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Template section definition
 */
export interface TemplateSection {
  id: string;
  title: string;
  order: number;
  required: boolean;
  defaultContent?: string;
}

/**
 * Contract template
 */
export interface ContractTemplate {
  id: string;
  documentType: DocumentType;
  templateKey: string;
  templateName: string;
  description?: string;
  version: string;
  riskProfile: RiskProfile;
  jurisdiction: string;
  content: string;
  sections?: TemplateSection[];
  variables?: ClauseVariable[];
  requiredClauses?: string[];
  optionalClauses?: string[];
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Diff result for contract comparison
 */
export interface DiffResult {
  baseVersion: number;
  comparisonVersion: number;
  changes: Array<{
    type: 'added' | 'removed' | 'unchanged';
    section?: string;
    value: string;
    count?: number;
  }>;
  riskImpactingChanges: Array<{
    section: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendation?: string;
  }>;
  summary: {
    addedLines: number;
    removedLines: number;
    modifiedSections: string[];
  };
}

/**
 * Human review checklist item
 */
export interface ReviewChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'pending' | 'completed' | 'not_applicable';
  notes?: string;
  severity: 'info' | 'warning' | 'critical';
}

/**
 * Generated contract output
 */
export interface GeneratedContract {
  contract: Contract;
  renderedMarkdown: string;
  reviewChecklist: ReviewChecklistItem[];
  warnings: string[];
  missingData: string[];
}
