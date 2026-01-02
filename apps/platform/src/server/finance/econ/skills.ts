/**
 * CFO Agent Skills
 *
 * Callable functions for Orchestrator routing.
 * Each skill stamps: policy version, ruleset version, data freshness, and warnings.
 */

import type {
  MetricSnapshot,
  MarketplaceUnitEcon,
  SaaSUnitEcon,
  ScenarioRun,
  ScenarioInputs,
  AlertEvent,
  CFOBriefing,
  DrilldownRequest,
  Segment,
  Ruleset,
} from '../types';
import { PolicyEngine, getCurrentPolicyVersion } from '../policies';
import { RulesetEngine } from '../rulesets';

// =============================================================================
// SKILL RESULT TYPE
// =============================================================================

export interface SkillResult<T> {
  data: T | null;
  success: boolean;
  error?: string;
  policyVersion: string;
  rulesetVersion: string;
  dataFreshness: {
    stripeLagMinutes: number | null;
    bankLagHours: number | null;
    accountingLagHours: number | null;
  };
  warnings: string[];
  executedAt: Date;
}

// =============================================================================
// SKILL S1: METRICS COMPOSER
// =============================================================================

/**
 * Skill S1: Compose a metrics snapshot for a segment and period
 *
 * Inputs: trial balance, P&L, cash ledger, Stripe rollups, internal DB usage
 * Output: MetricsSnapshot stored in finance.metric_snapshots
 * Enforces: Policies P1-P3
 */
export async function composeSnapshot(
  entityId: string,
  segmentId: string,
  period: string,
  periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly'
): Promise<SkillResult<MetricSnapshot>> {
  const warnings: string[] = [];

  try {
    // TODO: Implement actual data fetching from adapters
    // const stripe = await stripeAdapter.getRollup(startDate, endDate);
    // const bank = await bankAdapter.getCashLedger(startDate, endDate);
    // const internal = await internalDBAdapter.getInternalMetrics(segmentId, startDate, endDate);
    // const accounting = await accountingAdapter.getAccountingData(startDate, endDate);

    // Placeholder snapshot
    const snapshot: MetricSnapshot = {
      id: crypto.randomUUID(),
      entityId,
      segmentId,
      period,
      periodType,
      metrics: {},
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: RulesetEngine.DEFAULT_RULESET_V1.version,
      dataQuality: {
        stripeSyncLagMinutes: null,
        bankSyncLagHours: null,
        accountingSyncLagHours: null,
        missingFeeds: ['stripe', 'bank', 'accounting'],
        warnings: ['Adapters not yet implemented - placeholder data'],
      },
      isClosed: false,
      confidence: 'low',
      createdAt: new Date(),
      createdBy: 'cfo_agent',
    };

    warnings.push('Snapshot composed with placeholder data - adapters pending implementation');

    return {
      data: snapshot,
      success: true,
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: RulesetEngine.DEFAULT_RULESET_V1.version,
      dataFreshness: {
        stripeLagMinutes: null,
        bankLagHours: null,
        accountingLagHours: null,
      },
      warnings,
      executedAt: new Date(),
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: RulesetEngine.DEFAULT_RULESET_V1.version,
      dataFreshness: {
        stripeLagMinutes: null,
        bankLagHours: null,
        accountingLagHours: null,
      },
      warnings,
      executedAt: new Date(),
    };
  }
}

// =============================================================================
// SKILL S2: UNIT ECONOMICS ENGINE
// =============================================================================

/**
 * Skill S2: Compute marketplace unit economics
 *
 * Metrics: contribution per order, take rate, refund rate, promo impact, processor fee rate
 * Enforces: Policies P1-P3
 */
export async function computeMarketplaceUnitEcon(
  segmentId: string,
  period: string,
  inputs: {
    gmv: number;
    platformTake: number;
    completedOrders: number;
    refunds: number;
    disputes: number;
    processorFees: number;
    serviceDiscounts: number;
    feeWaivers: number;
  }
): Promise<SkillResult<MarketplaceUnitEcon>> {
  const warnings: string[] = [];

  try {
    // Enforce P1: Revenue recognition
    const { revenue, gmv: gmvMetric } = PolicyEngine.enforceRevenueRecognition(
      inputs.gmv,
      inputs.platformTake
    );

    // Enforce P2: Promo classification
    const serviceDiscountResult = PolicyEngine.classifyPromo('service_discount', inputs.serviceDiscounts);
    const feeWaiverResult = PolicyEngine.classifyPromo('fee_waiver', inputs.feeWaivers);

    // Calculate unit economics
    const takeRate = inputs.gmv > 0 ? (inputs.platformTake / inputs.gmv) * 100 : 0;
    const refundRate = inputs.gmv > 0 ? (inputs.refunds / inputs.gmv) * 100 : 0;
    const disputeRate = inputs.gmv > 0 ? (inputs.disputes / inputs.gmv) * 100 : 0;
    const processorFeeRate = inputs.platformTake > 0
      ? (inputs.processorFees / inputs.platformTake) * 100
      : 0;

    // Contribution per order
    const netRevenue = revenue - feeWaiverResult.contraRevenue;
    const contribution = netRevenue - inputs.processorFees - serviceDiscountResult.marketingExpense;
    const contributionPerOrder = inputs.completedOrders > 0
      ? contribution / inputs.completedOrders
      : 0;

    const unitEcon: MarketplaceUnitEcon = {
      period,
      segmentId,
      gmv: gmvMetric,
      platformRevenue: revenue,
      takeRate,
      completedOrders: inputs.completedOrders,
      contributionPerOrder,
      refundRate,
      disputeRate,
      processorFeeRate,
      promoImpact: {
        marketingExpense: serviceDiscountResult.marketingExpense,
        contraRevenue: feeWaiverResult.contraRevenue,
      },
      policyVersion: getCurrentPolicyVersion(),
    };

    return {
      data: unitEcon,
      success: true,
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: RulesetEngine.DEFAULT_RULESET_V1.version,
      dataFreshness: {
        stripeLagMinutes: 0,
        bankLagHours: null,
        accountingLagHours: null,
      },
      warnings,
      executedAt: new Date(),
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: RulesetEngine.DEFAULT_RULESET_V1.version,
      dataFreshness: {
        stripeLagMinutes: null,
        bankLagHours: null,
        accountingLagHours: null,
      },
      warnings,
      executedAt: new Date(),
    };
  }
}

/**
 * Skill S2: Compute SaaS unit economics
 *
 * Metrics: MRR, ARR, churn, NRR, ARPU, gross margin, LTV, CAC, payback
 */
export async function computeSaaSUnitEcon(
  segmentId: string,
  period: string,
  inputs: {
    mrr: number;
    activeSubscriptions: number;
    revenueChurn: number;
    expansion: number;
    cogs: number;
    marketingSpend?: number;
    newCustomers?: number;
    priorPeriodMRR?: number;
  }
): Promise<SkillResult<SaaSUnitEcon>> {
  const warnings: string[] = [];

  try {
    const arr = inputs.mrr * 12;
    const arpu = inputs.activeSubscriptions > 0
      ? inputs.mrr / inputs.activeSubscriptions
      : 0;

    const grossMargin = inputs.mrr > 0
      ? ((inputs.mrr - inputs.cogs) / inputs.mrr) * 100
      : 0;

    // NRR calculation
    let nrr = 100;
    if (inputs.priorPeriodMRR && inputs.priorPeriodMRR > 0) {
      const existingMRR = inputs.mrr - (inputs.marketingSpend ? 0 : 0); // Simplified
      nrr = ((existingMRR + inputs.expansion - inputs.revenueChurn) / inputs.priorPeriodMRR) * 100;
    }

    // Churn rate (monthly)
    const churnRate = inputs.mrr > 0
      ? (inputs.revenueChurn / inputs.mrr) * 100
      : 0;

    // LTV (gross margin based)
    const ltv = churnRate > 0
      ? (arpu * (grossMargin / 100)) / (churnRate / 100)
      : 0;

    // CAC and payback (if marketing data available)
    let cac: number | null = null;
    let paybackMonths: number | null = null;

    if (inputs.marketingSpend !== undefined && inputs.newCustomers !== undefined && inputs.newCustomers > 0) {
      cac = inputs.marketingSpend / inputs.newCustomers;
      const monthlyContribution = arpu * (grossMargin / 100);
      paybackMonths = monthlyContribution > 0 ? cac / monthlyContribution : null;
    } else {
      warnings.push('CAC and payback cannot be calculated - missing marketing spend or new customer data');
    }

    const unitEcon: SaaSUnitEcon = {
      period,
      segmentId,
      mrr: inputs.mrr,
      arr,
      activeSubscriptions: inputs.activeSubscriptions,
      arpu,
      revenueChurn: inputs.revenueChurn,
      nrr,
      grossMargin,
      ltv,
      cac,
      paybackMonths,
      policyVersion: getCurrentPolicyVersion(),
    };

    return {
      data: unitEcon,
      success: true,
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: RulesetEngine.DEFAULT_RULESET_V1.version,
      dataFreshness: {
        stripeLagMinutes: 0,
        bankLagHours: null,
        accountingLagHours: null,
      },
      warnings,
      executedAt: new Date(),
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: RulesetEngine.DEFAULT_RULESET_V1.version,
      dataFreshness: {
        stripeLagMinutes: null,
        bankLagHours: null,
        accountingLagHours: null,
      },
      warnings,
      executedAt: new Date(),
    };
  }
}

// =============================================================================
// SKILL S4: SCENARIO PLANNER
// =============================================================================

/**
 * Skill S4: Run a scenario simulation
 *
 * Types: pricing changes, marketing spend, hiring, feature launches
 */
export async function runScenario(
  entityId: string,
  segmentId: string | null,
  scenarioType: ScenarioRun['scenarioType'],
  name: string,
  inputs: ScenarioInputs,
  baselineSnapshotId?: string
): Promise<SkillResult<ScenarioRun>> {
  const warnings: string[] = [];

  try {
    // TODO: Implement actual scenario calculations based on type
    const scenarioRun: ScenarioRun = {
      id: crypto.randomUUID(),
      entityId,
      segmentId,
      scenarioType,
      name,
      description: `${scenarioType} scenario: ${name}`,
      inputs,
      outputs: {
        projectedRevenue: [],
        projectedCosts: [],
        projectedMargin: [],
        runwayMonths: 0,
        paybackMonths: null,
        breakEvenMonth: null,
        sensitivityAnalysis: {},
      },
      assumptions: {},
      baselineSnapshot: baselineSnapshotId || '',
      policyVersion: getCurrentPolicyVersion(),
      createdAt: new Date(),
      createdBy: 'cfo_agent',
    };

    warnings.push('Scenario planner not fully implemented - placeholder outputs');

    return {
      data: scenarioRun,
      success: true,
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: RulesetEngine.DEFAULT_RULESET_V1.version,
      dataFreshness: {
        stripeLagMinutes: null,
        bankLagHours: null,
        accountingLagHours: null,
      },
      warnings,
      executedAt: new Date(),
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: RulesetEngine.DEFAULT_RULESET_V1.version,
      dataFreshness: {
        stripeLagMinutes: null,
        bankLagHours: null,
        accountingLagHours: null,
      },
      warnings,
      executedAt: new Date(),
    };
  }
}

// =============================================================================
// SKILL S5: ALERT EVALUATOR
// =============================================================================

/**
 * Skill S5: Evaluate alerts against a snapshot using ruleset thresholds
 */
export async function evaluateAlerts(
  snapshot: MetricSnapshot,
  ruleset: Ruleset
): Promise<SkillResult<AlertEvent[]>> {
  const warnings: string[] = [];
  const alerts: AlertEvent[] = [];

  try {
    // TODO: Extract metric values from snapshot and evaluate each rule category
    // For now, return empty alerts with warning

    warnings.push('Alert evaluation requires implemented metrics in snapshot');

    return {
      data: alerts,
      success: true,
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: ruleset.version,
      dataFreshness: {
        stripeLagMinutes: snapshot.dataQuality.stripeSyncLagMinutes,
        bankLagHours: snapshot.dataQuality.bankSyncLagHours,
        accountingLagHours: snapshot.dataQuality.accountingSyncLagHours,
      },
      warnings,
      executedAt: new Date(),
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: ruleset.version,
      dataFreshness: {
        stripeLagMinutes: null,
        bankLagHours: null,
        accountingLagHours: null,
      },
      warnings,
      executedAt: new Date(),
    };
  }
}

// =============================================================================
// SKILL S6: BRIEFING GENERATOR
// =============================================================================

/**
 * Skill S6: Generate a plain-language CFO briefing
 *
 * Outputs: "what changed, why it matters, what to do next"
 * Includes: evidence numbers, confidence level, assumptions, drilldown requests
 */
export async function generateBriefing(
  snapshot: MetricSnapshot,
  alerts: AlertEvent[]
): Promise<SkillResult<CFOBriefing>> {
  const warnings: string[] = [];

  try {
    const briefing: CFOBriefing = {
      entityId: snapshot.entityId,
      period: snapshot.period,
      generatedAt: new Date(),
      policyVersion: snapshot.policyVersion,
      confidence: snapshot.confidence,
      summary: {
        headline: `${snapshot.periodType} financial summary for ${snapshot.segmentId}`,
        keyChanges: [],
        whyItMatters: 'Data sources pending connection for meaningful analysis',
      },
      alerts: alerts.map((a) => ({
        alertId: a.id,
        severity: a.severity,
        title: a.title,
        action: 'Review and acknowledge',
      })),
      recommendations: [],
      assumptions: [
        'Placeholder briefing - adapters pending implementation',
      ],
      drilldownRequests: [],
      dataQuality: snapshot.dataQuality,
    };

    warnings.push('Briefing generated with placeholder content');

    return {
      data: briefing,
      success: true,
      policyVersion: snapshot.policyVersion,
      rulesetVersion: snapshot.rulesetVersion,
      dataFreshness: {
        stripeLagMinutes: snapshot.dataQuality.stripeSyncLagMinutes,
        bankLagHours: snapshot.dataQuality.bankSyncLagHours,
        accountingLagHours: snapshot.dataQuality.accountingSyncLagHours,
      },
      warnings,
      executedAt: new Date(),
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      policyVersion: snapshot.policyVersion,
      rulesetVersion: snapshot.rulesetVersion,
      dataFreshness: {
        stripeLagMinutes: null,
        bankLagHours: null,
        accountingLagHours: null,
      },
      warnings,
      executedAt: new Date(),
    };
  }
}

// =============================================================================
// SKILL S7: DRILLDOWN REQUESTOR
// =============================================================================

/**
 * Skill S7: Create a drilldown request to the Accountant Agent
 */
export async function requestDrilldown(
  entityId: string,
  reason: string,
  period: string,
  accounts: string[],
  need: string,
  alertEventId?: string
): Promise<SkillResult<DrilldownRequest>> {
  const warnings: string[] = [];

  try {
    const request: DrilldownRequest = {
      id: crypto.randomUUID(),
      entityId,
      alertEventId: alertEventId || null,
      reason,
      period,
      accounts,
      need,
      status: 'pending',
      response: null,
      createdAt: new Date(),
      completedAt: null,
    };

    // TODO: Call /finance/accountant/request-drilldown endpoint
    warnings.push('Drilldown request created - Accountant Agent endpoint pending');

    return {
      data: request,
      success: true,
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: RulesetEngine.DEFAULT_RULESET_V1.version,
      dataFreshness: {
        stripeLagMinutes: null,
        bankLagHours: null,
        accountingLagHours: null,
      },
      warnings,
      executedAt: new Date(),
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      policyVersion: getCurrentPolicyVersion(),
      rulesetVersion: RulesetEngine.DEFAULT_RULESET_V1.version,
      dataFreshness: {
        stripeLagMinutes: null,
        bankLagHours: null,
        accountingLagHours: null,
      },
      warnings,
      executedAt: new Date(),
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const CFOSkills = {
  composeSnapshot,
  computeMarketplaceUnitEcon,
  computeSaaSUnitEcon,
  runScenario,
  evaluateAlerts,
  generateBriefing,
  requestDrilldown,
};
