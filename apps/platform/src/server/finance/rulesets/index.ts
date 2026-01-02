/**
 * CFO Agent Rulesets
 *
 * Configurable threshold rules for alerts and anomaly detection.
 * Stored in finance.rulesets table.
 */

import type { Ruleset, RulesetRules, AlertSeverity, AlertCategory } from '../types';

// =============================================================================
// DEFAULT RULESET (v1)
// =============================================================================

export const DEFAULT_RULESET_V1: Ruleset = {
  rulesetKey: 'default_v1',
  description: 'Default CFO Agent ruleset with standard thresholds for STRATANOBLE ventures',
  version: 'v1',
  enabled: true,
  updatedAt: new Date(),
  rules: {
    cashRunway: {
      minMonthsCash: 1.0,
      runwayDropWoWPercent: 20,
      burnIncreaseMoMPercent: 15,
    },
    marketplaceHealth: {
      minContributionPerOrder: 4.0,
      maxRefundRatePercent: 3.0,
      maxDisputeRatePercent: 0.5,
    },
    saasHealth: {
      maxRevenueChurnIncreaseMoMPercent: 20,
      nrrWarningPercent: 90,
      nrrCriticalPercent: 80,
    },
    stripeOperational: {
      maxFailedPaymentIncreaseWoWPercent: 30,
      maxSyncLagMinutes: 60,
      maxBankSyncLagHours: 12,
    },
    dataQuality: {
      alertOnMissingAttribution: true,
    },
  },
};

// =============================================================================
// RULE EVALUATION
// =============================================================================

export interface RuleEvaluationResult {
  triggered: boolean;
  alertKey: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  currentValue: number;
  thresholdValue: number;
  thresholdTriggered: string;
}

/**
 * Evaluate cash and runway rules
 */
export function evaluateCashRunwayRules(
  rules: RulesetRules['cashRunway'],
  data: {
    cashMonths: number;
    runwayWoWChange: number;
    burnMoMChange: number;
  }
): RuleEvaluationResult[] {
  const results: RuleEvaluationResult[] = [];

  // Cash < minimum months
  if (data.cashMonths < rules.minMonthsCash) {
    results.push({
      triggered: true,
      alertKey: 'cash_below_minimum',
      category: 'cash_runway',
      severity: 'critical',
      title: 'Cash Below Minimum Threshold',
      description: `Cash reserves are below ${rules.minMonthsCash} months of trailing net burn`,
      currentValue: data.cashMonths,
      thresholdValue: rules.minMonthsCash,
      thresholdTriggered: `cashMonths < ${rules.minMonthsCash}`,
    });
  }

  // Runway drop > threshold WoW
  if (data.runwayWoWChange < -rules.runwayDropWoWPercent) {
    results.push({
      triggered: true,
      alertKey: 'runway_drop_wow',
      category: 'cash_runway',
      severity: 'high',
      title: 'Runway Dropped Significantly',
      description: `Runway dropped ${Math.abs(data.runwayWoWChange).toFixed(1)}% week-over-week`,
      currentValue: data.runwayWoWChange,
      thresholdValue: -rules.runwayDropWoWPercent,
      thresholdTriggered: `runwayWoWChange < -${rules.runwayDropWoWPercent}%`,
    });
  }

  // Burn increase > threshold MoM
  if (data.burnMoMChange > rules.burnIncreaseMoMPercent) {
    results.push({
      triggered: true,
      alertKey: 'burn_increase_mom',
      category: 'cash_runway',
      severity: 'high',
      title: 'Net Burn Increased Significantly',
      description: `Net burn increased ${data.burnMoMChange.toFixed(1)}% month-over-month`,
      currentValue: data.burnMoMChange,
      thresholdValue: rules.burnIncreaseMoMPercent,
      thresholdTriggered: `burnMoMChange > ${rules.burnIncreaseMoMPercent}%`,
    });
  }

  return results;
}

/**
 * Evaluate marketplace health rules
 */
export function evaluateMarketplaceHealthRules(
  rules: RulesetRules['marketplaceHealth'],
  data: {
    contributionPerOrder: number;
    refundRatePercent: number;
    disputeRatePercent: number;
  }
): RuleEvaluationResult[] {
  const results: RuleEvaluationResult[] = [];

  // Contribution per order too low
  if (data.contributionPerOrder < rules.minContributionPerOrder) {
    results.push({
      triggered: true,
      alertKey: 'low_contribution_per_order',
      category: 'marketplace_health',
      severity: 'high',
      title: 'Low Contribution Per Order',
      description: `Contribution per order ($${data.contributionPerOrder.toFixed(2)}) is below minimum threshold`,
      currentValue: data.contributionPerOrder,
      thresholdValue: rules.minContributionPerOrder,
      thresholdTriggered: `contributionPerOrder < $${rules.minContributionPerOrder}`,
    });
  }

  // Refund rate too high
  if (data.refundRatePercent > rules.maxRefundRatePercent) {
    results.push({
      triggered: true,
      alertKey: 'high_refund_rate',
      category: 'marketplace_health',
      severity: 'high',
      title: 'High Refund Rate',
      description: `Refund rate (${data.refundRatePercent.toFixed(2)}%) exceeds maximum threshold`,
      currentValue: data.refundRatePercent,
      thresholdValue: rules.maxRefundRatePercent,
      thresholdTriggered: `refundRate > ${rules.maxRefundRatePercent}%`,
    });
  }

  // Dispute rate too high
  if (data.disputeRatePercent > rules.maxDisputeRatePercent) {
    results.push({
      triggered: true,
      alertKey: 'high_dispute_rate',
      category: 'marketplace_health',
      severity: 'critical',
      title: 'High Dispute Rate',
      description: `Dispute rate (${data.disputeRatePercent.toFixed(2)}%) exceeds maximum threshold - risk of Stripe account issues`,
      currentValue: data.disputeRatePercent,
      thresholdValue: rules.maxDisputeRatePercent,
      thresholdTriggered: `disputeRate > ${rules.maxDisputeRatePercent}%`,
    });
  }

  return results;
}

/**
 * Evaluate SaaS health rules
 */
export function evaluateSaaSHealthRules(
  rules: RulesetRules['saasHealth'],
  data: {
    revenueChurnMoMChange: number;
    nrr: number;
  }
): RuleEvaluationResult[] {
  const results: RuleEvaluationResult[] = [];

  // Revenue churn increase too high
  if (data.revenueChurnMoMChange > rules.maxRevenueChurnIncreaseMoMPercent) {
    results.push({
      triggered: true,
      alertKey: 'revenue_churn_spike',
      category: 'saas_health',
      severity: 'high',
      title: 'Revenue Churn Spike',
      description: `Revenue churn increased ${data.revenueChurnMoMChange.toFixed(1)}% month-over-month`,
      currentValue: data.revenueChurnMoMChange,
      thresholdValue: rules.maxRevenueChurnIncreaseMoMPercent,
      thresholdTriggered: `revenueChurnMoMChange > ${rules.maxRevenueChurnIncreaseMoMPercent}%`,
    });
  }

  // NRR critical
  if (data.nrr < rules.nrrCriticalPercent) {
    results.push({
      triggered: true,
      alertKey: 'nrr_critical',
      category: 'saas_health',
      severity: 'critical',
      title: 'Net Revenue Retention Critical',
      description: `NRR (${data.nrr.toFixed(1)}%) is critically low`,
      currentValue: data.nrr,
      thresholdValue: rules.nrrCriticalPercent,
      thresholdTriggered: `nrr < ${rules.nrrCriticalPercent}%`,
    });
  } else if (data.nrr < rules.nrrWarningPercent) {
    // NRR warning
    results.push({
      triggered: true,
      alertKey: 'nrr_warning',
      category: 'saas_health',
      severity: 'warning',
      title: 'Net Revenue Retention Warning',
      description: `NRR (${data.nrr.toFixed(1)}%) is below warning threshold`,
      currentValue: data.nrr,
      thresholdValue: rules.nrrWarningPercent,
      thresholdTriggered: `nrr < ${rules.nrrWarningPercent}%`,
    });
  }

  return results;
}

/**
 * Evaluate Stripe operational rules
 */
export function evaluateStripeOperationalRules(
  rules: RulesetRules['stripeOperational'],
  data: {
    failedPaymentWoWChange: number;
    stripeSyncLagMinutes: number;
    bankSyncLagHours: number;
  }
): RuleEvaluationResult[] {
  const results: RuleEvaluationResult[] = [];

  // Failed payment spike
  if (data.failedPaymentWoWChange > rules.maxFailedPaymentIncreaseWoWPercent) {
    results.push({
      triggered: true,
      alertKey: 'failed_payment_spike',
      category: 'stripe_operational',
      severity: 'high',
      title: 'Failed Payment Spike',
      description: `Failed payment rate increased ${data.failedPaymentWoWChange.toFixed(1)}% week-over-week`,
      currentValue: data.failedPaymentWoWChange,
      thresholdValue: rules.maxFailedPaymentIncreaseWoWPercent,
      thresholdTriggered: `failedPaymentWoWChange > ${rules.maxFailedPaymentIncreaseWoWPercent}%`,
    });
  }

  // Stripe sync lag
  if (data.stripeSyncLagMinutes > rules.maxSyncLagMinutes) {
    results.push({
      triggered: true,
      alertKey: 'stripe_sync_lag',
      category: 'stripe_operational',
      severity: 'warning',
      title: 'Stripe Sync Lag',
      description: `Stripe data is ${data.stripeSyncLagMinutes} minutes behind`,
      currentValue: data.stripeSyncLagMinutes,
      thresholdValue: rules.maxSyncLagMinutes,
      thresholdTriggered: `stripeSyncLag > ${rules.maxSyncLagMinutes} minutes`,
    });
  }

  // Bank sync lag
  if (data.bankSyncLagHours > rules.maxBankSyncLagHours) {
    results.push({
      triggered: true,
      alertKey: 'bank_sync_lag',
      category: 'stripe_operational',
      severity: 'warning',
      title: 'Bank Sync Lag',
      description: `Bank data is ${data.bankSyncLagHours} hours behind`,
      currentValue: data.bankSyncLagHours,
      thresholdValue: rules.maxBankSyncLagHours,
      thresholdTriggered: `bankSyncLag > ${rules.maxBankSyncLagHours} hours`,
    });
  }

  return results;
}

/**
 * Evaluate data quality rules
 */
export function evaluateDataQualityRules(
  rules: RulesetRules['dataQuality'],
  data: {
    missingAttributionChannels: string[];
    cacIsNull: boolean;
  }
): RuleEvaluationResult[] {
  const results: RuleEvaluationResult[] = [];

  if (rules.alertOnMissingAttribution && data.missingAttributionChannels.length > 0) {
    results.push({
      triggered: true,
      alertKey: 'missing_attribution',
      category: 'data_quality',
      severity: 'warning',
      title: 'Missing Attribution Data',
      description: `CAC cannot be calculated - missing spend attribution for: ${data.missingAttributionChannels.join(', ')}`,
      currentValue: data.missingAttributionChannels.length,
      thresholdValue: 0,
      thresholdTriggered: 'missingAttributionChannels > 0',
    });
  }

  return results;
}

// =============================================================================
// EXPORTS
// =============================================================================

export const RulesetEngine = {
  DEFAULT_RULESET_V1,
  evaluateCashRunwayRules,
  evaluateMarketplaceHealthRules,
  evaluateSaaSHealthRules,
  evaluateStripeOperationalRules,
  evaluateDataQualityRules,
};
