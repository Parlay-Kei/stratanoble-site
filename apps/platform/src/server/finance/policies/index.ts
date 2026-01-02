/**
 * Finance Policy Engine
 *
 * Non-negotiable finance policies enforced at the metrics layer.
 * All calculations MUST go through this module.
 *
 * Policy Version: v1
 */

import type {
  FinancePolicy,
  Segment,
  PromoClassification,
  PayoutTreatment,
} from '../types';

// =============================================================================
// POLICY DEFINITIONS
// =============================================================================

export const FINANCE_POLICY_V1: FinancePolicy = {
  version: 'v1',
  revenueRecognition: {
    marketplaceRevenue: 'platform_take_only',
    gmvTreatment: 'operating_metric_only',
  },
  promoClassification: {
    default: 'marketing_expense',
    platformFeeWaiver: 'contra_revenue',
    servicePriceDiscount: 'marketing_expense',
  },
  payoutTreatment: {
    default: 'pass_through_liability',
    merchantOfRecord: 'cogs',
  },
};

// =============================================================================
// POLICY ENFORCEMENT FUNCTIONS
// =============================================================================

/**
 * Policy P1: Marketplace Revenue Recognition
 *
 * Revenue = platform take ONLY
 * GMV = operating metric only (NEVER P&L revenue)
 */
export function enforceRevenueRecognition(
  gmv: number,
  platformTake: number
): { revenue: number; gmv: number; policyApplied: string } {
  return {
    revenue: platformTake, // Only platform take is revenue
    gmv: gmv, // GMV is separate operating metric
    policyApplied: 'P1:marketplace_revenue_recognition',
  };
}

/**
 * Policy P2: Promo Classification
 *
 * Default: Marketing Expense
 * Platform fee waiver (commission/booking fee discount): Contra-revenue
 * Service price discount: Marketing Expense
 */
export function classifyPromo(
  promoType: 'service_discount' | 'fee_waiver' | 'other',
  amount: number
): {
  classification: PromoClassification;
  marketingExpense: number;
  contraRevenue: number;
  policyApplied: string;
} {
  if (promoType === 'fee_waiver') {
    return {
      classification: 'contra_revenue',
      marketingExpense: 0,
      contraRevenue: amount,
      policyApplied: 'P2:promo_classification:fee_waiver',
    };
  }

  // Default: marketing expense (including service_discount and other)
  return {
    classification: 'marketing_expense',
    marketingExpense: amount,
    contraRevenue: 0,
    policyApplied: 'P2:promo_classification:marketing_expense',
  };
}

/**
 * Policy P3: Payout Treatment
 *
 * Default: Pass-through liability clearing
 * Merchant of Record: COGS
 */
export function classifyPayout(
  segment: Segment,
  payoutAmount: number
): {
  treatment: PayoutTreatment;
  liabilityClearing: number;
  cogs: number;
  policyApplied: string;
} {
  if (segment.merchantOfRecord) {
    return {
      treatment: 'cogs',
      liabilityClearing: 0,
      cogs: payoutAmount,
      policyApplied: 'P3:payout_treatment:merchant_of_record',
    };
  }

  return {
    treatment: 'pass_through_liability',
    liabilityClearing: payoutAmount,
    cogs: 0,
    policyApplied: 'P3:payout_treatment:pass_through',
  };
}

// =============================================================================
// POLICY VALIDATION
// =============================================================================

/**
 * Validate that a calculation result complies with policies
 */
export function validatePolicyCompliance(
  result: {
    gmv?: number;
    revenue?: number;
    promoMarketingExpense?: number;
    promoContraRevenue?: number;
    payoutCogs?: number;
    payoutLiability?: number;
  },
  segment: Segment
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  // P1: GMV should never equal revenue for marketplace
  if (
    segment.type === 'marketplace' &&
    result.gmv !== undefined &&
    result.revenue !== undefined &&
    result.gmv === result.revenue &&
    result.gmv > 0
  ) {
    violations.push('P1_VIOLATION: GMV equals revenue - GMV should be separate operating metric');
  }

  // P3: Non-MoR segments should not have COGS payouts
  if (!segment.merchantOfRecord && result.payoutCogs && result.payoutCogs > 0) {
    violations.push('P3_VIOLATION: Non-MoR segment has COGS payout - should be liability clearing');
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

// =============================================================================
// POLICY VERSION MANAGEMENT
// =============================================================================

export function getCurrentPolicyVersion(): string {
  return FINANCE_POLICY_V1.version;
}

export function getPolicy(version: string): FinancePolicy | null {
  if (version === 'v1') {
    return FINANCE_POLICY_V1;
  }
  return null;
}

/**
 * Check if a policy version change requires backfill
 */
export function requiresBackfill(fromVersion: string, toVersion: string): boolean {
  // V1 is the only version, no backfill needed yet
  // Future: implement version comparison logic
  return fromVersion !== toVersion;
}

// =============================================================================
// EXPORTS
// =============================================================================

export const PolicyEngine = {
  enforceRevenueRecognition,
  classifyPromo,
  classifyPayout,
  validatePolicyCompliance,
  getCurrentPolicyVersion,
  getPolicy,
  requiresBackfill,
};
