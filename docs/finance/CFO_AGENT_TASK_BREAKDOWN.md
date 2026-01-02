# CFO Agent Build Spec - Dev Team Task Breakdown

**Version:** 1.0.0
**Entity:** STRATANOBLE
**Created:** 2026-01-01

---

## Executive Summary

This document provides the complete task breakdown for building the CFO Agent (Economics Agent). The dev team can execute these deliverables in order.

---

## Project Structure

```
apps/platform/src/server/finance/
├── index.ts                 # Main exports
├── types.ts                 # Type definitions
├── policies/
│   └── index.ts            # Policy engine (P1, P2, P3)
├── rulesets/
│   └── index.ts            # Alert thresholds
├── econ/
│   ├── index.ts            # Economics service exports
│   ├── skills.ts           # CFO Agent skills (S1-S7)
│   ├── snapshot-composer.ts
│   ├── unit-economics.ts
│   ├── scenario-planner.ts
│   ├── alert-evaluator.ts
│   └── briefing-generator.ts
├── adapters/
│   ├── index.ts
│   ├── stripe-adapter.ts
│   ├── bank-adapter.ts
│   ├── internal-db-adapter.ts
│   └── accounting-adapter.ts
├── jobs/
│   ├── index.ts
│   ├── runner.ts
│   └── handlers.ts
└── accountant/             # Stub for future Accountant Agent

apps/website/src/app/api/finance/econ/
├── snapshot/route.ts
├── unit-econ/marketplace/route.ts
├── alerts/route.ts
├── scenario/route.ts
├── rulesets/route.ts
└── schedules/route.ts

supabase/migrations/
├── 20260101_finance_schema.sql
└── 20260101_finance_seed.sql

docs/finance/
├── FINANCE_POLICY_v1.md
└── CFO_AGENT_TASK_BREAKDOWN.md

.claude/agents/product/cfo-agent/
└── skill.md
```

---

## Deliverable D1: Finance Schema + Policies + Definitions

**Status:** ✅ Complete (scaffolded)

### Tasks

| Task | File | Status |
|------|------|--------|
| Create finance schema migration | `supabase/migrations/20260101_finance_schema.sql` | ✅ |
| Create seed data migration | `supabase/migrations/20260101_finance_seed.sql` | ✅ |
| Create policy documentation | `docs/finance/FINANCE_POLICY_v1.md` | ✅ |
| Create type definitions | `apps/platform/src/server/finance/types.ts` | ✅ |
| Implement policy engine | `apps/platform/src/server/finance/policies/index.ts` | ✅ |

### Acceptance Criteria

- [ ] Run migrations: `supabase db push`
- [ ] Verify finance.segments has Direct Cuts entry
- [ ] Verify finance.metric_definitions has all metrics
- [ ] Verify finance.rulesets has default_v1
- [ ] Verify finance.agent_schedules has all 5 jobs
- [ ] Unit test: `PolicyEngine.enforceRevenueRecognition()` returns take-only revenue
- [ ] Unit test: `PolicyEngine.classifyPromo()` routes correctly
- [ ] Unit test: `PolicyEngine.classifyPayout()` respects merchant_of_record

---

## Deliverable D2: CFO Agent Core Endpoints

**Status:** ✅ Complete (scaffolded)

### Tasks

| Task | File | Status |
|------|------|--------|
| Snapshot endpoint | `apps/website/src/app/api/finance/econ/snapshot/route.ts` | ✅ |
| Marketplace unit econ endpoint | `apps/website/src/app/api/finance/econ/unit-econ/marketplace/route.ts` | ✅ |
| Scenario endpoint | `apps/website/src/app/api/finance/econ/scenario/route.ts` | ✅ |
| Alerts endpoint | `apps/website/src/app/api/finance/econ/alerts/route.ts` | ✅ |
| Rulesets endpoint | `apps/website/src/app/api/finance/econ/rulesets/route.ts` | ✅ |
| Schedules endpoint | `apps/website/src/app/api/finance/econ/schedules/route.ts` | ✅ |

### Acceptance Criteria

- [ ] `POST /finance/econ/snapshot` writes to finance.metric_snapshots
- [ ] `POST /finance/econ/unit-econ/marketplace` returns correct unit economics
- [ ] `POST /finance/econ/scenario` persists to finance.scenario_runs
- [ ] `GET /finance/econ/alerts` returns grouped alerts by severity
- [ ] `PUT /finance/econ/rulesets` updates thresholds (admin only)
- [ ] `PUT /finance/econ/schedules` updates job schedules (admin only)

---

## Deliverable D3: Data Ingestion Adapters

**Status:** 🔶 Scaffolded (implementation pending)

### Tasks

| Task | File | Priority |
|------|------|----------|
| Implement Stripe adapter | `stripe-adapter.ts` | P1 |
| Implement Bank adapter (Plaid) | `bank-adapter.ts` | P1 |
| Implement Bank adapter (CSV) | `bank-adapter.ts` | P1 |
| Implement Internal DB adapter | `internal-db-adapter.ts` | P1 |
| Implement Accounting adapter | `accounting-adapter.ts` | P2 |

### Implementation Notes

**Stripe Adapter:**
```typescript
// Required methods to implement:
getCharges(startDate, endDate)
getRefunds(startDate, endDate)
getDisputes(startDate, endDate)
getBalanceTransactions(startDate, endDate)
getPayouts(startDate, endDate)
getFailedPayments(startDate, endDate)
getRollup(startDate, endDate)
```

**Bank Adapter:**
```typescript
// Phase 1: CSV import
getCashLedgerFromCSV(startDate, endDate)

// Phase 2: Plaid integration
getCashLedgerFromPlaid(startDate, endDate)
```

**Internal DB Adapter:**
```typescript
// Supabase queries for:
getSegment(segmentId)
getSegments()
getInternalMetrics(segmentId, startDate, endDate)
getGMVBreakdown(segmentId, startDate, endDate)
getCohortData(segmentId, cohortMonth)
```

### Acceptance Criteria

- [ ] Stripe adapter produces StripeRollup with all fields populated
- [ ] Bank adapter parses CSV correctly
- [ ] Internal DB adapter queries appointments/customers/promos
- [ ] Accounting adapter returns stub with confidence warnings when not connected
- [ ] Data quality section populated in snapshots
- [ ] Confidence reduced when sources missing

---

## Deliverable D4: Job Runner

**Status:** ✅ Complete (scaffolded)

### Tasks

| Task | File | Status |
|------|------|--------|
| Job runner core | `apps/platform/src/server/finance/jobs/runner.ts` | ✅ |
| Job handlers | `apps/platform/src/server/finance/jobs/handlers.ts` | ✅ |
| Cron endpoint | TBD | 🔶 |

### Required Jobs

| Job Key | Cadence | Handler |
|---------|---------|---------|
| stripe_rollup_refresh | Hourly | `handleStripeRollupRefresh` |
| daily_snapshot | Daily 08:00 PT | `handleDailySnapshot` |
| weekly_cohorts | Mon 09:00 PT | `handleWeeklyCohorts` |
| monthly_kpi_pack | 1st biz day 10:00 PT | `handleMonthlyKPIPack` |
| quarterly_policy_review | 1st week 10:00 PT | `handleQuarterlyPolicyReview` |

### Acceptance Criteria

- [ ] Jobs run locally with `npm run jobs:run <job_key>`
- [ ] Cron endpoint triggers due jobs
- [ ] Failed runs create critical alert
- [ ] last_run_at and next_run_at updated after each run
- [ ] Jobs respect timezone setting

---

## Deliverable D5: Drilldown Workflow

**Status:** 🔶 Pending

### Tasks

| Task | Priority |
|------|----------|
| Define Accountant Agent interface | P2 |
| Implement `/finance/accountant/request-drilldown` endpoint | P2 |
| Implement drilldown request creation in CFO Agent | P2 |
| Link drilldown responses to alert context | P2 |

### Acceptance Criteria

- [ ] CFO Agent can create drilldown request when anomaly detected
- [ ] Drilldown request stored in finance.drilldown_requests
- [ ] Response attached to alert context
- [ ] Status transitions: pending → in_progress → completed/failed

---

## Deliverable D6: Plain-Language Briefing

**Status:** 🔶 Scaffolded (content generation pending)

### Tasks

| Task | Priority |
|------|----------|
| Implement briefing generator logic | P1 |
| Create summary bullet generation | P1 |
| Create recommendation generation | P1 |
| Add drilldown request triggers | P2 |

### Briefing Output Format

```json
{
  "entity_id": "STRATANOBLE",
  "period": "2026-01",
  "generated_at": "2026-01-01T08:00:00Z",
  "policy_version": "v1",
  "confidence": "high",
  "summary": {
    "headline": "January 2026 Financial Summary",
    "key_changes": [
      "Platform revenue increased 15% MoM",
      "Refund rate stable at 2.1%"
    ],
    "why_it_matters": "Strong growth trajectory with healthy unit economics"
  },
  "alerts": [],
  "recommendations": [
    {
      "priority": 1,
      "action": "Consider 5% take rate increase for premium services",
      "rationale": "Contribution per order above threshold",
      "evidence": "Current: $6.50, Threshold: $4.00",
      "confidence": "high"
    }
  ],
  "assumptions": [],
  "drilldown_requests": [],
  "data_quality": {}
}
```

---

## Test Plan

### Unit Tests

| Test | Status |
|------|--------|
| GMV never counted as revenue | 🔶 |
| Promo classification: service discount → marketing expense | 🔶 |
| Promo classification: fee waiver → contra-revenue | 🔶 |
| Payout treatment: default → pass-through | 🔶 |
| Payout treatment: MoR → COGS | 🔶 |
| Unit econ calculations (known inputs → known outputs) | 🔶 |

### Integration Tests

| Test | Status |
|------|--------|
| Stripe rollup + snapshot generation | 🔶 |
| Alerts firing on synthetic spikes | 🔶 |
| Scenario run persistence | 🔶 |

### Data Drift Tests

| Test | Status |
|------|--------|
| metric_definitions required keys present | 🔶 |
| rulesets JSON schema validation | 🔶 |
| schedule job keys exist for required windows | 🔶 |

---

## Day 1 Checklist

- [x] Entity ID set to `STRATANOBLE`
- [x] Direct Cuts marketplace segment created
- [x] default_v1 ruleset with thresholds
- [x] All 5 agent schedules seeded
- [ ] Run migrations in Supabase
- [ ] Verify RLS policies applied
- [ ] Test API endpoints with curl/Postman
- [ ] Integrate with existing Stripe webhook data

---

## Agent Routing

The CFO Agent can be invoked by the Orchestrator:

```typescript
// Skill invocation from Orchestrator
import { CFOSkills } from '@/server/finance/econ/skills';

// S1: Compose snapshot
await CFOSkills.composeSnapshot('STRATANOBLE', 'direct_cuts_marketplace', '2026-01', 'monthly');

// S2: Compute unit economics
await CFOSkills.computeMarketplaceUnitEcon('direct_cuts_marketplace', '2026-01', inputs);

// S4: Run scenario
await CFOSkills.runScenario('STRATANOBLE', null, 'pricing_change', 'Test', inputs);

// S5: Evaluate alerts
await CFOSkills.evaluateAlerts(snapshot, ruleset);

// S6: Generate briefing
await CFOSkills.generateBriefing(snapshot, alerts);

// S7: Request drilldown
await CFOSkills.requestDrilldown('STRATANOBLE', 'Anomaly detected', '2026-01', accounts, need);
```

---

## Security Checklist

- [ ] Service role JWT for agent operations
- [ ] RLS policies on all finance.* tables
- [ ] Admin-only access for ruleset/schedule updates
- [ ] No public access to finance data
- [ ] Audit trail on all snapshots, alerts, scenarios

---

## Next Steps for Dev Team

1. **Run migrations** - Apply finance schema to Supabase
2. **Implement Stripe adapter** - Connect to existing Stripe integration
3. **Implement Internal DB adapter** - Query appointments/customers tables
4. **Add unit tests** - Verify policy enforcement
5. **Create cron endpoint** - Trigger scheduled jobs
6. **Build admin UI** - `/admin/finance` dashboard

---

## Questions for Product

1. Should we add attribution fields to appointments now or later?
2. What's the timeline for QuickBooks/Xero integration?
3. Do we need multi-currency support for Phase 1?
4. Should alerts send notifications (email/Slack)?
