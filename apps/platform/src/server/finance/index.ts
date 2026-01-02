/**
 * CFO Agent (Economics Agent) - Finance Module
 *
 * Mission: Deliver decision-grade financial intelligence for STRATANOBLE and its products
 * by turning reconciled ledgers + product telemetry into KPIs, scenarios, alerts, and recommendations.
 *
 * Architecture:
 * - READ-ONLY: Never writes to external systems (Stripe, QBO, banks)
 * - POLICY-ENFORCED: All calculations go through the policy engine
 * - SKILL-BASED: Modular skills for Orchestrator routing
 *
 * @version 1.0.0
 * @entity STRATANOBLE
 */

// Core exports
export * from './policies';
export * from './rulesets';
export * from './econ';
export * from './adapters';
export * from './jobs';

// Types
export type {
  FinancePolicy,
  PolicyVersion,
  Segment,
  MetricSnapshot,
  AlertEvent,
  ScenarioRun,
  DrilldownRequest,
  Ruleset,
  AgentSchedule,
} from './types';

// Constants
export const ENTITY_ID = 'STRATANOBLE' as const;
export const FINANCE_POLICY_VERSION = 'v1' as const;
export const DEFAULT_RULESET = 'default_v1' as const;
export const DEFAULT_TIMEZONE = 'America/Los_Angeles' as const;
