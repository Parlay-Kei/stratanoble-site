import { z } from 'zod';
import { getSupabaseClient, handleSupabaseError } from '../lib/supabase.js';
import type { Deal, Milestone, PaymentTerms, RiskFactor, Address, ContactInfo } from '../types/index.js';

/**
 * Input schema for the deal context tool
 */
export const dealContextInputSchema = z.object({
  deal_id: z.string().uuid().describe('UUID of the deal to retrieve'),
});

export type DealContextInput = z.infer<typeof dealContextInputSchema>;

/**
 * Deal context output with all related data
 */
interface DealContextOutput {
  deal: Deal;
  computedValues: {
    totalContractValue?: number;
    milestoneCount?: number;
    durationDays?: number;
    riskScore?: 'low' | 'medium' | 'high';
  };
  relatedContracts?: Array<{
    id: string;
    documentType: string;
    status: string;
    version: number;
    createdAt: string;
  }>;
  missingRequiredFields: string[];
  warnings: string[];
}

/**
 * Calculate risk score based on risk factors
 */
function calculateRiskScore(riskFactors?: RiskFactor[]): 'low' | 'medium' | 'high' {
  if (!riskFactors || riskFactors.length === 0) {
    return 'low';
  }

  const severityScores: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };

  const totalScore = riskFactors.reduce(
    (sum, factor) => sum + (severityScores[factor.severity] || 0),
    0
  );

  const avgScore = totalScore / riskFactors.length;

  if (avgScore >= 3) return 'high';
  if (avgScore >= 2) return 'medium';
  return 'low';
}

/**
 * Calculate total contract value from milestones or payment terms
 */
function calculateTotalValue(deal: Deal): number | undefined {
  if (deal.milestones && deal.milestones.length > 0) {
    const total = deal.milestones.reduce(
      (sum, m) => sum + (m.paymentAmount || 0),
      0
    );
    if (total > 0) return total;
  }

  if (deal.paymentTerms?.depositAmount) {
    // If deposit is a percentage of unknown total, we can't calculate
    return undefined;
  }

  return undefined;
}

/**
 * Calculate duration in days
 */
function calculateDuration(deal: Deal): number | undefined {
  if (!deal.startDate) return undefined;

  const start = new Date(deal.startDate);
  const end = deal.endDate ? new Date(deal.endDate) : new Date();

  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check for missing required fields
 */
function getMissingFields(deal: Deal): string[] {
  const missing: string[] = [];

  if (!deal.clientName) missing.push('clientName');
  if (!deal.clientLegalName) missing.push('clientLegalName');
  if (!deal.servicesDescription) missing.push('servicesDescription');
  if (!deal.startDate) missing.push('startDate');
  if (!deal.pricingModel) missing.push('pricingModel');
  if (!deal.ipModel) missing.push('ipModel');

  // Check for complete address
  if (!deal.clientAddress) {
    missing.push('clientAddress');
  } else {
    if (!deal.clientAddress.street1) missing.push('clientAddress.street1');
    if (!deal.clientAddress.city) missing.push('clientAddress.city');
    if (!deal.clientAddress.state) missing.push('clientAddress.state');
    if (!deal.clientAddress.postalCode) missing.push('clientAddress.postalCode');
    if (!deal.clientAddress.country) missing.push('clientAddress.country');
  }

  // Check for contact info
  if (!deal.clientContact) {
    missing.push('clientContact');
  } else {
    if (!deal.clientContact.name) missing.push('clientContact.name');
    if (!deal.clientContact.email) missing.push('clientContact.email');
  }

  // Check for milestones or payment info
  if (!deal.milestones || deal.milestones.length === 0) {
    if (!deal.paymentTerms) {
      missing.push('milestones or paymentTerms');
    }
  }

  return missing;
}

/**
 * Generate warnings for the deal
 */
function getWarnings(deal: Deal): string[] {
  const warnings: string[] = [];

  // Check for short engagement
  const duration = calculateDuration(deal);
  if (duration && duration < 14) {
    warnings.push('Very short engagement (< 2 weeks). Consider simplified contract structure.');
  }

  // Check for missing end date
  if (!deal.endDate) {
    warnings.push('No end date specified. Consider adding renewal/termination terms.');
  }

  // Check for high-risk factors
  if (deal.riskFactors) {
    const criticalFactors = deal.riskFactors.filter(f => f.severity === 'critical');
    if (criticalFactors.length > 0) {
      warnings.push(`${criticalFactors.length} critical risk factor(s) identified. Requires special attention.`);
    }
  }

  // Check for equity partnership
  if (deal.pricingModel === 'equity_partnership') {
    warnings.push('Equity partnership model requires additional legal review and separate equity documents.');
  }

  // Check for provider retains IP but client expects ownership
  if (deal.ipModel === 'client_owns') {
    warnings.push('Client owns all IP model selected. Ensure pre-existing IP carve-out is properly documented.');
  }

  return warnings;
}

/**
 * Deal context tool definition
 */
export const dealContextTool = {
  name: 'get_deal_context',
  description: `Retrieve structured intake data for a specific deal/engagement.

Returns comprehensive deal information including:
- Client details (name, legal name, address, contact)
- Engagement scope (services, deliverables, milestones)
- Commercial terms (pricing model, payment terms, IP model)
- Timeline (start/end dates, renewal terms)
- Risk factors and special terms
- Related contracts already generated
- Missing required fields
- Warnings and recommendations

This data is used to populate contract templates and make drafting decisions.`,

  inputSchema: {
    type: 'object',
    properties: {
      deal_id: {
        type: 'string',
        format: 'uuid',
        description: 'UUID of the deal to retrieve',
      },
    },
    required: ['deal_id'],
  },

  handler: async (input: DealContextInput): Promise<{
    success: boolean;
    data?: DealContextOutput;
    error?: string;
  }> => {
    try {
      const { deal_id } = dealContextInputSchema.parse(input);

      const supabase = getSupabaseClient();

      // Fetch deal data
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', deal_id)
        .single();

      if (dealError) {
        if (dealError.code === 'PGRST116') {
          return {
            success: false,
            error: `Deal not found: ${deal_id}`,
          };
        }
        handleSupabaseError(dealError, 'Failed to fetch deal');
      }

      // Map database fields to Deal type
      const deal: Deal = {
        id: dealData.id,
        clientName: dealData.client_name,
        clientLegalName: dealData.client_legal_name,
        clientAddress: dealData.client_address as Address | undefined,
        clientContact: dealData.client_contact as ContactInfo | undefined,
        governingLaw: dealData.governing_law || 'US-NV',
        servicesDescription: dealData.services_description,
        deliverables: dealData.deliverables as string[] | undefined,
        milestones: dealData.milestones as Milestone[] | undefined,
        pricingModel: dealData.pricing_model,
        paymentTerms: dealData.payment_terms as PaymentTerms | undefined,
        ipModel: dealData.ip_model,
        startDate: dealData.start_date,
        endDate: dealData.end_date,
        renewalTerms: dealData.renewal_terms,
        specialTerms: dealData.special_terms,
        riskFactors: dealData.risk_factors as RiskFactor[] | undefined,
        metadata: dealData.metadata as Record<string, unknown> | undefined,
        createdBy: dealData.created_by,
        createdAt: dealData.created_at,
        updatedAt: dealData.updated_at,
      };

      // Fetch related contracts
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts')
        .select('id, document_type, status, version, created_at')
        .eq('deal_id', deal_id)
        .order('created_at', { ascending: false });

      if (contractsError) {
        console.error('Failed to fetch related contracts:', contractsError.message);
      }

      const relatedContracts = contractsData?.map(c => ({
        id: c.id,
        documentType: c.document_type,
        status: c.status,
        version: c.version,
        createdAt: c.created_at,
      }));

      // Calculate computed values
      const computedValues = {
        totalContractValue: calculateTotalValue(deal),
        milestoneCount: deal.milestones?.length,
        durationDays: calculateDuration(deal),
        riskScore: calculateRiskScore(deal.riskFactors),
      };

      // Get missing fields and warnings
      const missingRequiredFields = getMissingFields(deal);
      const warnings = getWarnings(deal);

      return {
        success: true,
        data: {
          deal,
          computedValues,
          relatedContracts,
          missingRequiredFields,
          warnings,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};
