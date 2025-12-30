import { z } from 'zod';
import { getSupabaseClient, handleSupabaseError } from '../lib/supabase.js';
import { ClauseTopic, RiskProfile, DEFAULT_JURISDICTION } from '../types/index.js';
import type { Clause, ClauseVariable, ClauseAlternative } from '../types/index.js';

/**
 * Input schema for the clause library tool
 */
export const clauseLibraryInputSchema = z.object({
  topic: z.enum([
    'IP_OWNERSHIP', 'LICENSE_GRANT', 'CONFIDENTIALITY',
    'LIMITATION_OF_LIABILITY', 'INDEMNITY', 'PAYMENT_TERMS',
    'TERMINATION', 'DISPUTE_RESOLUTION', 'WARRANTY', 'FORCE_MAJEURE',
    'DATA_PROTECTION', 'SUBCONTRACTORS', 'INSURANCE', 'NON_SOLICITATION',
    'GOVERNING_LAW', 'NOTICES', 'ASSIGNMENT', 'ENTIRE_AGREEMENT'
  ]).describe('Clause topic/category to retrieve'),
  risk_profile: z.enum(['standard', 'customer_friendly', 'vendor_friendly']).optional()
    .describe('Risk profile for clause selection'),
  jurisdiction: z.string().optional()
    .describe('Jurisdiction for clause selection'),
  clause_key: z.string().optional()
    .describe('Specific clause key to retrieve'),
});

export type ClauseLibraryInput = z.infer<typeof clauseLibraryInputSchema>;

/**
 * Clause library output type
 */
interface ClauseOutput {
  clauseKey: string;
  clauseName: string;
  topic: string;
  riskProfile: string;
  jurisdiction?: string;
  text: string;
  whenToUse?: string;
  variables?: ClauseVariable[];
  alternatives?: ClauseAlternative[];
}

/**
 * Default clauses when database is not available or empty
 */
const DEFAULT_CLAUSES: Record<string, ClauseOutput[]> = {
  IP_OWNERSHIP: [
    {
      clauseKey: 'ip_provider_retains_standard',
      clauseName: 'Provider Retains Pre-existing IP',
      topic: 'IP_OWNERSHIP',
      riskProfile: 'standard',
      text: `Provider retains all right, title, and interest in and to all Pre-existing IP,
including but not limited to methodologies, frameworks, tools, templates, and reusable
code components that exist prior to or are developed independently of this Agreement.
Client receives a perpetual, non-exclusive, royalty-free license to use Provider's
Pre-existing IP solely to the extent incorporated into the Deliverables.`,
      whenToUse: 'Standard engagement where provider uses existing tools and frameworks',
      variables: [],
      alternatives: [
        { clauseKey: 'ip_client_owns_standard', whenToUse: 'When client requires full IP ownership' },
        { clauseKey: 'ip_shared_standard', whenToUse: 'When creating jointly-owned innovations' },
      ],
    },
    {
      clauseKey: 'ip_client_owns_standard',
      clauseName: 'Client Owns All Deliverables',
      topic: 'IP_OWNERSHIP',
      riskProfile: 'customer_friendly',
      text: `Upon full payment of all fees due, Client shall own all right, title, and interest
in and to all Deliverables created specifically for Client under this Agreement, including
all intellectual property rights therein. Provider hereby assigns to Client all such rights
and agrees to execute any documents necessary to perfect Client's ownership.`,
      whenToUse: 'When client negotiates for full ownership of all work product',
    },
  ],
  LIMITATION_OF_LIABILITY: [
    {
      clauseKey: 'liability_cap_fees_paid',
      clauseName: 'Liability Cap - Fees Paid',
      topic: 'LIMITATION_OF_LIABILITY',
      riskProfile: 'standard',
      text: `IN NO EVENT SHALL EITHER PARTY'S TOTAL LIABILITY TO THE OTHER PARTY FOR ALL
DAMAGES, LOSSES, AND CAUSES OF ACTION EXCEED THE TOTAL FEES PAID BY CLIENT TO PROVIDER
UNDER THIS AGREEMENT DURING THE TWELVE (12) MONTHS PRECEDING THE CLAIM.

NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOST PROFITS, LOST DATA,
BUSINESS INTERRUPTION, OR LOSS OF GOODWILL, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.`,
      whenToUse: 'Standard limitation based on fees paid in prior 12 months',
      variables: [
        { name: 'LIABILITY_PERIOD_MONTHS', type: 'number', default: 12, description: 'Period for calculating liability cap' },
      ],
    },
  ],
  CONFIDENTIALITY: [
    {
      clauseKey: 'confidentiality_mutual',
      clauseName: 'Mutual Confidentiality',
      topic: 'CONFIDENTIALITY',
      riskProfile: 'standard',
      text: `Each party agrees to hold the other party's Confidential Information in strict
confidence and not to disclose such information to any third party without prior written
consent. "Confidential Information" means any non-public information disclosed by either
party that is designated as confidential or that reasonably should be understood to be
confidential given the nature of the information.

Confidential Information does not include information that: (a) is or becomes publicly
available through no fault of the receiving party; (b) was rightfully in the receiving
party's possession prior to disclosure; (c) is rightfully obtained from a third party
without restriction; or (d) is independently developed without use of the disclosing
party's Confidential Information.

This confidentiality obligation shall survive termination of this Agreement for a period
of {{CONFIDENTIALITY_YEARS}} years.`,
      whenToUse: 'Standard mutual confidentiality for most engagements',
      variables: [
        { name: 'CONFIDENTIALITY_YEARS', type: 'number', default: 3, description: 'Years confidentiality survives after termination' },
      ],
    },
  ],
  PAYMENT_TERMS: [
    {
      clauseKey: 'payment_milestone_deposit',
      clauseName: 'Milestone Payments with Deposit',
      topic: 'PAYMENT_TERMS',
      riskProfile: 'vendor_friendly',
      text: `Client shall pay an initial deposit of {{DEPOSIT_PERCENT}}% of the total
project fee upon execution of this Agreement. Remaining fees shall be paid according
to the milestone schedule set forth in the applicable Statement of Work.

All invoices are due and payable within {{NET_DAYS}} days of invoice date. Late payments
shall accrue interest at the rate of {{LATE_FEE_PERCENT}}% per month or the maximum rate
permitted by law, whichever is less.

Provider reserves the right to suspend work upon written notice if any payment is more
than {{SUSPENSION_DAYS}} days past due.`,
      whenToUse: 'When requiring upfront deposit and milestone-based payments',
      variables: [
        { name: 'DEPOSIT_PERCENT', type: 'number', default: 25, description: 'Upfront deposit percentage' },
        { name: 'NET_DAYS', type: 'number', default: 30, description: 'Days until payment is due' },
        { name: 'LATE_FEE_PERCENT', type: 'number', default: 1.5, description: 'Monthly late fee percentage' },
        { name: 'SUSPENSION_DAYS', type: 'number', default: 30, description: 'Days past due before work suspension' },
      ],
    },
  ],
  TERMINATION: [
    {
      clauseKey: 'termination_convenience_mutual',
      clauseName: 'Termination for Convenience',
      topic: 'TERMINATION',
      riskProfile: 'standard',
      text: `Either party may terminate this Agreement for convenience upon {{NOTICE_DAYS}}
days' prior written notice to the other party. Upon termination:

(a) Client shall pay Provider for all services performed and expenses incurred through
the effective date of termination;
(b) Provider shall deliver to Client all completed and in-progress Deliverables;
(c) Each party shall return or destroy the other party's Confidential Information;
(d) Any provisions that by their nature should survive termination shall so survive.`,
      whenToUse: 'Standard termination clause allowing either party to exit',
      variables: [
        { name: 'NOTICE_DAYS', type: 'number', default: 30, description: 'Days notice required for termination' },
      ],
    },
  ],
  DISPUTE_RESOLUTION: [
    {
      clauseKey: 'dispute_mediation_then_arbitration',
      clauseName: 'Mediation then Arbitration',
      topic: 'DISPUTE_RESOLUTION',
      riskProfile: 'standard',
      text: `Any dispute arising out of or relating to this Agreement shall first be
submitted to mediation before a mutually agreed mediator. If mediation is unsuccessful
within {{MEDIATION_DAYS}} days, the dispute shall be resolved by binding arbitration
administered by JAMS under its Comprehensive Arbitration Rules, with the arbitration
held in {{ARBITRATION_LOCATION}}. The arbitrator's decision shall be final and binding.

Each party shall bear its own costs and attorneys' fees, provided that the prevailing
party may recover reasonable attorneys' fees and costs from the non-prevailing party.`,
      whenToUse: 'Preferred dispute resolution avoiding litigation',
      variables: [
        { name: 'MEDIATION_DAYS', type: 'number', default: 60, description: 'Days allowed for mediation' },
        { name: 'ARBITRATION_LOCATION', type: 'string', default: 'Las Vegas, Nevada', description: 'Location for arbitration proceedings' },
      ],
    },
  ],
  GOVERNING_LAW: [
    {
      clauseKey: 'governing_law_nevada',
      clauseName: 'Nevada Governing Law',
      topic: 'GOVERNING_LAW',
      riskProfile: 'standard',
      jurisdiction: 'US-NV',
      text: `This Agreement shall be governed by and construed in accordance with the
laws of the State of Nevada, without regard to its conflict of laws principles. The
parties consent to the exclusive jurisdiction of the state and federal courts located
in Clark County, Nevada for any legal proceedings arising from this Agreement.`,
      whenToUse: 'Default for StrataNoble contracts (Nevada-based)',
    },
  ],
};

/**
 * Clause library tool definition
 */
export const clauseLibraryTool = {
  name: 'get_clauses',
  description: `Retrieve reusable contract clauses by topic and risk profile.

Available topics:
- IP_OWNERSHIP: Intellectual property ownership and licensing
- LICENSE_GRANT: License grants for IP and software
- CONFIDENTIALITY: NDA and confidentiality provisions
- LIMITATION_OF_LIABILITY: Liability caps and exclusions
- INDEMNITY: Indemnification obligations
- PAYMENT_TERMS: Payment schedules, late fees, deposits
- TERMINATION: Termination rights and procedures
- DISPUTE_RESOLUTION: Mediation, arbitration, litigation
- WARRANTY: Service warranties and disclaimers
- FORCE_MAJEURE: Force majeure provisions
- DATA_PROTECTION: Data privacy and GDPR compliance
- SUBCONTRACTORS: Subcontractor permissions
- INSURANCE: Insurance requirements
- NON_SOLICITATION: Non-hire/non-solicit provisions
- GOVERNING_LAW: Choice of law and venue
- NOTICES: Notice procedures
- ASSIGNMENT: Assignment restrictions
- ENTIRE_AGREEMENT: Integration clause

Risk profiles:
- standard: Balanced provisions
- vendor_friendly: Favors the service provider
- customer_friendly: Favors the client`,

  inputSchema: {
    type: 'object',
    properties: {
      topic: {
        type: 'string',
        enum: [
          'IP_OWNERSHIP', 'LICENSE_GRANT', 'CONFIDENTIALITY',
          'LIMITATION_OF_LIABILITY', 'INDEMNITY', 'PAYMENT_TERMS',
          'TERMINATION', 'DISPUTE_RESOLUTION', 'WARRANTY', 'FORCE_MAJEURE',
          'DATA_PROTECTION', 'SUBCONTRACTORS', 'INSURANCE', 'NON_SOLICITATION',
          'GOVERNING_LAW', 'NOTICES', 'ASSIGNMENT', 'ENTIRE_AGREEMENT'
        ],
        description: 'Clause topic/category to retrieve',
      },
      risk_profile: {
        type: 'string',
        enum: ['standard', 'customer_friendly', 'vendor_friendly'],
        description: 'Risk profile for clause selection',
      },
      jurisdiction: {
        type: 'string',
        description: 'Jurisdiction for clause selection',
      },
      clause_key: {
        type: 'string',
        description: 'Specific clause key to retrieve',
      },
    },
    required: ['topic'],
  },

  handler: async (input: ClauseLibraryInput): Promise<{
    success: boolean;
    clauses?: ClauseOutput[];
    error?: string;
  }> => {
    try {
      const { topic, risk_profile, jurisdiction, clause_key } = clauseLibraryInputSchema.parse(input);

      // Try to fetch from database first
      const supabase = getSupabaseClient();

      let query = supabase
        .from('clause_library')
        .select('*')
        .eq('topic', topic)
        .eq('is_active', true);

      if (risk_profile) {
        query = query.eq('risk_profile', risk_profile);
      }

      if (jurisdiction) {
        query = query.or(`jurisdiction.eq.${jurisdiction},jurisdiction.is.null`);
      }

      if (clause_key) {
        query = query.eq('clause_key', clause_key);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database query failed, using default clauses:', error.message);
      }

      let clauses: ClauseOutput[] = [];

      if (data && data.length > 0) {
        // Map database results to output format
        clauses = data.map((clause: Clause) => ({
          clauseKey: clause.clauseKey,
          clauseName: clause.clauseName,
          topic: clause.topic,
          riskProfile: clause.riskProfile,
          jurisdiction: clause.jurisdiction,
          text: clause.text,
          whenToUse: clause.whenToUse,
          variables: clause.variables,
          alternatives: clause.alternatives,
        }));
      } else {
        // Fall back to default clauses
        const defaultsForTopic = DEFAULT_CLAUSES[topic] || [];

        clauses = defaultsForTopic.filter(clause => {
          if (risk_profile && clause.riskProfile !== risk_profile) {
            return false;
          }
          if (jurisdiction && clause.jurisdiction && clause.jurisdiction !== jurisdiction) {
            return false;
          }
          if (clause_key && clause.clauseKey !== clause_key) {
            return false;
          }
          return true;
        });
      }

      if (clauses.length === 0) {
        return {
          success: true,
          clauses: [],
          error: `No clauses found for topic: ${topic}`,
        };
      }

      return {
        success: true,
        clauses,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};
