/**
 * Metrics Composer (Skill S1)
 *
 * Composes metric snapshots from multiple data sources.
 * Enforces policies P1-P3 at computation time.
 */

import type { MetricSnapshot, MetricValue, DataQualityReport, Segment } from '../types';
import { PolicyEngine, getCurrentPolicyVersion } from '../policies';
import { StripeAdapter } from '../adapters/stripe-adapter';
import { BankAdapter } from '../adapters/bank-adapter';
import { InternalDBAdapter } from '../adapters/internal-db-adapter';
import { AccountingAdapter } from '../adapters/accounting-adapter';

export interface SnapshotComposerConfig {
  stripeAdapter: StripeAdapter;
  bankAdapter: BankAdapter;
  internalDBAdapter: InternalDBAdapter;
  accountingAdapter: AccountingAdapter;
}

export interface ComposerResult {
  snapshot: MetricSnapshot | null;
  success: boolean;
  error?: string;
  policiesApplied: string[];
  warnings: string[];
}

/**
 * Compose a complete metrics snapshot for a segment
 */
export async function composeMetricSnapshot(
  config: SnapshotComposerConfig,
  segment: Segment,
  period: string,
  periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly',
  entityId: string = 'STRATANOBLE'
): Promise<ComposerResult> {
  const warnings: string[] = [];
  const policiesApplied: string[] = [];
  const metrics: Record<string, MetricValue> = {};

  try {
    // Parse period dates
    const [startDate, endDate] = parsePeriodDates(period, periodType);

    // Fetch data from all sources in parallel
    const [stripeRollup, cashLedger, internalMetrics, accountingData] = await Promise.all([
      config.stripeAdapter.getRollup(startDate, endDate),
      config.bankAdapter.getCashLedger(startDate, endDate),
      config.internalDBAdapter.getInternalMetrics(segment.segmentId, startDate, endDate),
      config.accountingAdapter.getAccountingData(startDate, endDate),
    ]);

    // Track data quality
    const dataQuality: DataQualityReport = {
      stripeSyncLagMinutes: stripeRollup.lagMinutes,
      bankSyncLagHours: cashLedger.lagHours,
      accountingSyncLagHours: accountingData.lagHours,
      missingFeeds: [],
      warnings: [],
    };

    // Check for missing feeds
    if (!stripeRollup.success) {
      dataQuality.missingFeeds.push('stripe');
      warnings.push(`Stripe data unavailable: ${stripeRollup.error}`);
    }
    if (!cashLedger.success) {
      dataQuality.missingFeeds.push('bank');
      warnings.push(`Bank data unavailable: ${cashLedger.error}`);
    }
    if (!internalMetrics.success) {
      dataQuality.missingFeeds.push('internal');
      warnings.push(`Internal metrics unavailable: ${internalMetrics.error}`);
    }
    if (accountingData.isStub) {
      dataQuality.missingFeeds.push('accounting');
      dataQuality.warnings.push(...accountingData.warnings);
    }

    // Compute marketplace metrics if applicable
    if (segment.type === 'marketplace' && internalMetrics.success && internalMetrics.data) {
      const internal = internalMetrics.data;

      // P1: Revenue recognition
      const { revenue, gmv, policyApplied: p1Applied } = PolicyEngine.enforceRevenueRecognition(
        internal.appointments.gmv,
        internal.appointments.platformTake
      );
      policiesApplied.push(p1Applied);

      metrics.gmv = {
        value: gmv,
        unit: 'USD',
        source: 'internal_db',
        freshnessMinutes: internalMetrics.lagMinutes,
        warnings: [],
      };

      metrics.platform_revenue = {
        value: revenue,
        unit: 'USD',
        source: 'internal_db',
        freshnessMinutes: internalMetrics.lagMinutes,
        warnings: [],
      };

      // P2: Promo classification
      const serviceDiscountResult = PolicyEngine.classifyPromo(
        'service_discount',
        internal.promos.serviceDiscounts
      );
      const feeWaiverResult = PolicyEngine.classifyPromo(
        'fee_waiver',
        internal.promos.feeWaivers
      );
      policiesApplied.push(serviceDiscountResult.policyApplied);
      policiesApplied.push(feeWaiverResult.policyApplied);

      metrics.promo_marketing_expense = {
        value: serviceDiscountResult.marketingExpense,
        unit: 'USD',
        source: 'internal_db',
        freshnessMinutes: internalMetrics.lagMinutes,
        warnings: [],
      };

      metrics.promo_contra_revenue = {
        value: feeWaiverResult.contraRevenue,
        unit: 'USD',
        source: 'internal_db',
        freshnessMinutes: internalMetrics.lagMinutes,
        warnings: [],
      };

      // Completed orders
      metrics.completed_orders = {
        value: internal.appointments.completed,
        unit: 'count',
        source: 'internal_db',
        freshnessMinutes: internalMetrics.lagMinutes,
        warnings: [],
      };

      // Take rate
      const takeRate = gmv > 0 ? (revenue / gmv) * 100 : 0;
      metrics.take_rate = {
        value: takeRate,
        unit: 'percent',
        source: 'computed',
        freshnessMinutes: internalMetrics.lagMinutes,
        warnings: [],
      };
    }

    // Add Stripe metrics if available
    if (stripeRollup.success && stripeRollup.data) {
      const stripe = stripeRollup.data;

      metrics.refunds = {
        value: stripe.refunds,
        unit: 'USD',
        source: 'stripe',
        freshnessMinutes: stripeRollup.lagMinutes,
        warnings: [],
      };

      metrics.disputes = {
        value: stripe.disputes,
        unit: 'USD',
        source: 'stripe',
        freshnessMinutes: stripeRollup.lagMinutes,
        warnings: [],
      };

      metrics.processor_fees = {
        value: stripe.fees,
        unit: 'USD',
        source: 'stripe',
        freshnessMinutes: stripeRollup.lagMinutes,
        warnings: [],
      };

      metrics.failed_payments = {
        value: stripe.failedPayments,
        unit: 'USD',
        source: 'stripe',
        freshnessMinutes: stripeRollup.lagMinutes,
        warnings: [],
      };
    }

    // Add cash metrics if available
    if (cashLedger.success && cashLedger.data) {
      const cash = cashLedger.data;

      metrics.cash_balance = {
        value: cash.closingBalance,
        unit: 'USD',
        source: cashLedger.source,
        freshnessMinutes: cashLedger.lagHours * 60,
        warnings: [],
      };
    }

    // Validate policy compliance
    const validation = PolicyEngine.validatePolicyCompliance(
      {
        gmv: metrics.gmv?.value ?? undefined,
        revenue: metrics.platform_revenue?.value ?? undefined,
        promoMarketingExpense: metrics.promo_marketing_expense?.value ?? undefined,
        promoContraRevenue: metrics.promo_contra_revenue?.value ?? undefined,
      },
      segment
    );

    if (!validation.valid) {
      warnings.push(...validation.violations);
    }

    // Determine confidence level
    let confidence: 'high' | 'medium' | 'low' = 'high';
    if (dataQuality.missingFeeds.length > 0) {
      confidence = dataQuality.missingFeeds.length >= 2 ? 'low' : 'medium';
    }

    // Create snapshot
    const snapshot: MetricSnapshot = {
      id: crypto.randomUUID(),
      entityId,
      segmentId: segment.segmentId,
      period,
      periodType,
      metrics,
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: 'v1',
      dataQuality,
      isClosed: false,
      confidence,
      createdAt: new Date(),
      createdBy: 'cfo_agent',
    };

    return {
      snapshot,
      success: true,
      policiesApplied: [...new Set(policiesApplied)],
      warnings,
    };
  } catch (error) {
    return {
      snapshot: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      policiesApplied,
      warnings,
    };
  }
}

/**
 * Parse period string into start and end dates
 */
function parsePeriodDates(
  period: string,
  periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly'
): [Date, Date] {
  const now = new Date();

  if (period.includes('/')) {
    // Range format: "2026-01-01/2026-01-31"
    const [start, end] = period.split('/');
    return [new Date(start), new Date(end)];
  }

  // Single date/month format
  const baseDate = new Date(period);

  switch (periodType) {
    case 'daily':
      return [baseDate, baseDate];
    case 'weekly':
      const weekEnd = new Date(baseDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return [baseDate, weekEnd];
    case 'monthly':
      const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      return [monthStart, monthEnd];
    case 'quarterly':
      const quarter = Math.floor(baseDate.getMonth() / 3);
      const quarterStart = new Date(baseDate.getFullYear(), quarter * 3, 1);
      const quarterEnd = new Date(baseDate.getFullYear(), (quarter + 1) * 3, 0);
      return [quarterStart, quarterEnd];
    default:
      return [baseDate, now];
  }
}
