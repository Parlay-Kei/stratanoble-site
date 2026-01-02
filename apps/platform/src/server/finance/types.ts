/**
 * CFO Agent Type Definitions
 *
 * Canonical data model for the finance schema
 */

// =============================================================================
// POLICY TYPES
// =============================================================================

export type SegmentType = 'marketplace' | 'saas' | 'services';

export type PromoClassification = 'marketing_expense' | 'contra_revenue';

export type PayoutTreatment = 'pass_through_liability' | 'cogs';

export interface FinancePolicy {
  version: string;
  revenueRecognition: {
    marketplaceRevenue: 'platform_take_only';
    gmvTreatment: 'operating_metric_only';
  };
  promoClassification: {
    default: PromoClassification;
    platformFeeWaiver: PromoClassification;
    servicePriceDiscount: PromoClassification;
  };
  payoutTreatment: {
    default: PayoutTreatment;
    merchantOfRecord: PayoutTreatment;
  };
}

export interface PolicyVersion {
  version: string;
  effectiveDate: string;
  description: string;
  backfillRequired: boolean;
}

// =============================================================================
// SEGMENT TYPES
// =============================================================================

export interface Segment {
  segmentId: string;
  type: SegmentType;
  merchantOfRecord: boolean;
  financePolicyVersion: string;
  currency: string;
  enabled: boolean;
  updatedAt: Date;
}

// =============================================================================
// METRIC TYPES
// =============================================================================

export interface MetricDefinition {
  metricKey: string;
  displayName: string;
  description: string;
  unit: string;
  formula: string;
  segmentTypes: SegmentType[];
  policyDependencies: string[];
  version: string;
  updatedAt: Date;
}

export interface MetricSnapshot {
  id: string;
  entityId: string;
  segmentId: string;
  period: string; // YYYY-MM-DD or YYYY-MM
  periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  metrics: Record<string, MetricValue>;
  policyVersion: string;
  rulesetVersion: string;
  dataQuality: DataQualityReport;
  isClosed: boolean;
  confidence: 'high' | 'medium' | 'low';
  createdAt: Date;
  createdBy: string;
}

export interface MetricValue {
  value: number | null;
  unit: string;
  source: string;
  freshnessMinutes: number;
  warnings: string[];
}

export interface DataQualityReport {
  stripeSyncLagMinutes: number | null;
  bankSyncLagHours: number | null;
  accountingSyncLagHours: number | null;
  missingFeeds: string[];
  warnings: string[];
}

// =============================================================================
// ALERT TYPES
// =============================================================================

export type AlertSeverity = 'critical' | 'high' | 'warning' | 'info';

export type AlertCategory =
  | 'cash_runway'
  | 'marketplace_health'
  | 'saas_health'
  | 'stripe_operational'
  | 'data_quality';

export interface AlertEvent {
  id: string;
  entityId: string;
  segmentId: string | null;
  alertKey: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  evidence: Record<string, unknown>;
  thresholdTriggered: string;
  currentValue: number;
  thresholdValue: number;
  rulesetVersion: string;
  policyVersion: string;
  acknowledgedAt: Date | null;
  acknowledgedBy: string | null;
  resolvedAt: Date | null;
  drilldownRequestId: string | null;
  createdAt: Date;
}

// =============================================================================
// SCENARIO TYPES
// =============================================================================

export type ScenarioType =
  | 'pricing_change'
  | 'marketing_spend'
  | 'hiring'
  | 'feature_launch';

export interface ScenarioRun {
  id: string;
  entityId: string;
  segmentId: string | null;
  scenarioType: ScenarioType;
  name: string;
  description: string;
  inputs: ScenarioInputs;
  outputs: ScenarioOutputs;
  assumptions: Record<string, unknown>;
  baselineSnapshot: string;
  policyVersion: string;
  createdAt: Date;
  createdBy: string;
}

export interface ScenarioInputs {
  pricingChange?: {
    percentageChange: number;
    affectedServices: string[];
  };
  marketingSpend?: {
    additionalSpend: number;
    channel: string;
    expectedCACMultiplier: number;
  };
  hiring?: {
    headcount: number;
    averageSalary: number;
    startMonth: string;
  };
  featureLaunch?: {
    conversionLiftPercent: number;
    retentionLiftPercent: number;
  };
}

export interface ScenarioOutputs {
  projectedRevenue: number[];
  projectedCosts: number[];
  projectedMargin: number[];
  runwayMonths: number;
  paybackMonths: number | null;
  breakEvenMonth: string | null;
  sensitivityAnalysis: Record<string, number>;
}

// =============================================================================
// DRILLDOWN TYPES
// =============================================================================

export type DrilldownStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface DrilldownRequest {
  id: string;
  entityId: string;
  alertEventId: string | null;
  reason: string;
  period: string;
  accounts: string[];
  need: string;
  status: DrilldownStatus;
  response: DrilldownResponse | null;
  createdAt: Date;
  completedAt: Date | null;
}

export interface DrilldownResponse {
  findings: string[];
  recommendations: string[];
  attachments: string[];
  respondedBy: string;
  respondedAt: Date;
}

// =============================================================================
// RULESET TYPES
// =============================================================================

export interface Ruleset {
  rulesetKey: string;
  description: string;
  rules: RulesetRules;
  version: string;
  enabled: boolean;
  updatedAt: Date;
}

export interface RulesetRules {
  cashRunway: {
    minMonthsCash: number;
    runwayDropWoWPercent: number;
    burnIncreaseMoMPercent: number;
  };
  marketplaceHealth: {
    minContributionPerOrder: number;
    maxRefundRatePercent: number;
    maxDisputeRatePercent: number;
  };
  saasHealth: {
    maxRevenueChurnIncreaseMoMPercent: number;
    nrrWarningPercent: number;
    nrrCriticalPercent: number;
  };
  stripeOperational: {
    maxFailedPaymentIncreaseWoWPercent: number;
    maxSyncLagMinutes: number;
    maxBankSyncLagHours: number;
  };
  dataQuality: {
    alertOnMissingAttribution: boolean;
  };
}

// =============================================================================
// SCHEDULE TYPES
// =============================================================================

export type JobCadence =
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'on_demand';

export interface AgentSchedule {
  id: string;
  jobKey: string;
  cadence: JobCadence;
  runAtTime: string | null;
  timezone: string;
  enabled: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  updatedAt: Date;
}

// =============================================================================
// BRIEFING TYPES
// =============================================================================

export interface CFOBriefing {
  entityId: string;
  period: string;
  generatedAt: Date;
  policyVersion: string;
  confidence: 'high' | 'medium' | 'low';
  summary: BriefingSummary;
  alerts: AlertSummary[];
  recommendations: Recommendation[];
  assumptions: string[];
  drilldownRequests: string[];
  dataQuality: DataQualityReport;
}

export interface BriefingSummary {
  headline: string;
  keyChanges: string[];
  whyItMatters: string;
}

export interface AlertSummary {
  alertId: string;
  severity: AlertSeverity;
  title: string;
  action: string;
}

export interface Recommendation {
  priority: number;
  action: string;
  rationale: string;
  evidence: string;
  confidence: 'high' | 'medium' | 'low';
}

// =============================================================================
// ADAPTER TYPES
// =============================================================================

export interface StripeRollup {
  period: string;
  charges: number;
  chargeCount: number;
  refunds: number;
  refundCount: number;
  disputes: number;
  disputeCount: number;
  fees: number;
  netAmount: number;
  payouts: number;
  payoutCount: number;
  failedPayments: number;
  failedPaymentCount: number;
  syncedAt: Date;
}

export interface CashLedger {
  period: string;
  openingBalance: number;
  deposits: number;
  withdrawals: number;
  closingBalance: number;
  source: 'plaid' | 'csv' | 'manual';
  syncedAt: Date;
}

export interface InternalMetrics {
  period: string;
  appointments: {
    completed: number;
    cancelled: number;
    noShow: number;
    gmv: number;
    platformTake: number;
  };
  customers: {
    new: number;
    returning: number;
    churned: number;
  };
  promos: {
    serviceDiscounts: number;
    feeWaivers: number;
    totalValue: number;
  };
  syncedAt: Date;
}

export interface AccountingData {
  period: string;
  trialBalance: Record<string, number>;
  pnlSummary: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    netIncome: number;
  };
  balanceSheet: {
    assets: number;
    liabilities: number;
    equity: number;
  };
  arAging: Record<string, number>;
  apAging: Record<string, number>;
  source: 'quickbooks' | 'xero' | 'manual' | 'stub';
  syncedAt: Date | null;
}

// =============================================================================
// UNIT ECONOMICS TYPES
// =============================================================================

export interface MarketplaceUnitEcon {
  period: string;
  segmentId: string;
  gmv: number;
  platformRevenue: number;
  takeRate: number;
  completedOrders: number;
  contributionPerOrder: number;
  refundRate: number;
  disputeRate: number;
  processorFeeRate: number;
  promoImpact: {
    marketingExpense: number;
    contraRevenue: number;
  };
  policyVersion: string;
}

export interface SaaSUnitEcon {
  period: string;
  segmentId: string;
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  arpu: number;
  revenueChurn: number;
  nrr: number;
  grossMargin: number;
  ltv: number;
  cac: number | null;
  paybackMonths: number | null;
  policyVersion: string;
}

export interface CohortMetrics {
  cohortMonth: string;
  segmentId: string;
  cohortSize: number;
  retention: {
    day7: number;
    day30: number;
    day90: number;
  };
  ltv: {
    contribution: number;
    grossMargin: number;
  };
  paybackMonths: number | null;
  acquisitionChannel: string | null;
}
