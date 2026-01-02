# CFO Agent (Economics Agent)

**Version:** 1.0.0
**Entity:** STRATANOBLE
**Type:** Finance Intelligence Agent

## Mission

Deliver decision-grade financial intelligence for STRATANOBLE and its products by turning reconciled ledgers + product telemetry into:
- KPIs (MRR, LTV, CAC, payback, churn, runway, gross and contribution margin by segment)
- Scenario planning (pricing, hiring, marketing, feature launches)
- Real-time risk monitoring (cash, receivables, Stripe anomalies)
- Plain-language recommendations and action prompts

## Trigger Phrases

- "check finances"
- "run CFO agent"
- "financial snapshot"
- "unit economics"
- "run scenario"
- "finance alerts"
- "CFO briefing"
- "check runway"
- "marketplace metrics"
- "SaaS metrics"

## Capabilities (Skills)

### S1: Metrics Composer
Compose metric snapshots from multiple data sources with policy enforcement.

```typescript
import { composeSnapshot } from '@/server/finance/econ/skills';

const result = await composeSnapshot(
  'STRATANOBLE',
  'direct_cuts_marketplace',
  '2026-01',
  'monthly'
);
```

### S2: Unit Economics Engine
Compute marketplace and SaaS unit economics.

```typescript
import { computeMarketplaceUnitEcon, computeSaaSUnitEcon } from '@/server/finance/econ/skills';

// Marketplace
const mpResult = await computeMarketplaceUnitEcon('direct_cuts_marketplace', '2026-01', {
  gmv: 100000,
  platformTake: 15000,
  completedOrders: 500,
  refunds: 2000,
  disputes: 100,
  processorFees: 450,
  serviceDiscounts: 1000,
  feeWaivers: 500,
});

// SaaS
const saasResult = await computeSaaSUnitEcon('reilq_saas', '2026-01', {
  mrr: 50000,
  activeSubscriptions: 100,
  revenueChurn: 2000,
  expansion: 5000,
  cogs: 10000,
});
```

### S3: Cohort and LTV Engine
Calculate cohort retention and LTV metrics.

### S4: Scenario Planner
Run financial scenarios for decision support.

```typescript
import { runScenario } from '@/server/finance/econ/skills';

const scenario = await runScenario(
  'STRATANOBLE',
  'direct_cuts_marketplace',
  'pricing_change',
  'Take Rate Increase Test',
  {
    pricingChange: {
      percentageChange: 10,
      affectedServices: ['haircut', 'beard_trim'],
    },
  }
);
```

### S5: Alerts and Anomaly Detection
Evaluate alerts against ruleset thresholds.

```typescript
import { evaluateAlerts } from '@/server/finance/econ/skills';

const alerts = await evaluateAlerts(snapshot, ruleset);
```

### S6: CFO Briefing Generator
Generate plain-language briefings with recommendations.

```typescript
import { generateBriefing } from '@/server/finance/econ/skills';

const briefing = await generateBriefing(snapshot, alerts);
```

### S7: Drilldown Requestor
Create drilldown requests to the Accountant Agent.

```typescript
import { requestDrilldown } from '@/server/finance/econ/skills';

const request = await requestDrilldown(
  'STRATANOBLE',
  'Unusual refund spike detected',
  '2026-01',
  ['revenue', 'refunds', 'disputes'],
  'Investigate root cause of 150% refund increase'
);
```

## Non-Negotiable Policies

All computations enforce these policies:

### P1: Marketplace Revenue Recognition
- Revenue = Platform Take ONLY
- GMV = Operating metric (never P&L revenue)

### P2: Promo Classification
- Default: Marketing Expense
- Fee waivers: Contra-revenue

### P3: Payout Treatment
- Default: Pass-through Liability Clearing
- Merchant of Record: COGS

## Data Sources

| Source | Adapter | Status |
|--------|---------|--------|
| Stripe | StripeAdapter | Pending |
| Bank (Plaid/CSV) | BankAdapter | Pending |
| Internal DB | InternalDBAdapter | Pending |
| Accounting (QBO/Xero) | AccountingAdapter | Stub |

## Required Update Windows

| Job | Cadence | Time | Purpose |
|-----|---------|------|---------|
| stripe_rollup_refresh | Hourly | - | Stripe data sync |
| daily_snapshot | Daily | 08:00 PT | Metrics snapshot |
| weekly_cohorts | Weekly | Mon 09:00 PT | Cohort refresh |
| monthly_kpi_pack | Monthly | 1st biz day 10:00 PT | KPI pack |
| quarterly_policy_review | Quarterly | 1st week 10:00 PT | Policy review |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/finance/econ/snapshot` | GET/POST | Get or create metric snapshot |
| `/finance/econ/unit-econ/marketplace` | POST | Compute marketplace unit economics |
| `/finance/econ/unit-econ/saas` | POST | Compute SaaS unit economics |
| `/finance/econ/scenario` | POST | Run scenario simulation |
| `/finance/econ/alerts` | GET | Get active alerts |
| `/finance/econ/briefing` | GET | Get CFO briefing |
| `/finance/econ/rulesets` | GET/PUT | Manage rulesets |
| `/finance/econ/schedules` | GET/PUT | Manage schedules |

## Database Schema

```
finance.segments          - Segment configuration
finance.metric_definitions - Metric definitions
finance.metric_snapshots  - Immutable snapshots
finance.alert_events      - Alert history
finance.scenario_runs     - Scenario simulations
finance.drilldown_requests - Accountant Agent requests
finance.agent_schedules   - Job schedules
finance.rulesets          - Alert thresholds
finance.cfo_briefings     - Generated briefings
```

## Security

- READ-ONLY: Never writes to external systems (Stripe, QBO, banks)
- Service role JWT required for all operations
- RLS policies enforce access control
- All actions audited with policy and ruleset versions

## Integration with Orchestrator

The CFO Agent can be invoked by the Orchestrator for:
1. Scheduled financial snapshots
2. On-demand financial analysis
3. Scenario planning for business decisions
4. Alert investigation and resolution

## Example Orchestrator Routing

```typescript
// In orchestrator task handling
if (task.type === 'finance_snapshot') {
  return await CFOSkills.composeSnapshot(
    task.entityId,
    task.segmentId,
    task.period,
    task.periodType
  );
}

if (task.type === 'unit_economics') {
  return await CFOSkills.computeMarketplaceUnitEcon(
    task.segmentId,
    task.period,
    task.inputs
  );
}
```
