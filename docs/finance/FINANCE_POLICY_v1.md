# Finance Policy v1

**Entity:** STRATANOBLE
**Version:** v1
**Effective Date:** 2026-01-01
**Owner:** CFO Agent
**Status:** Active

---

## Overview

This document defines the non-negotiable finance policies enforced by the CFO Agent at the metrics layer. These policies ensure consistent treatment of revenue, promos, and payouts across all STRATANOBLE ventures.

The CFO Agent enforces these policies at computation time. The Accountant Agent is expected to apply the same classifications in the books.

---

## Policy P1: Marketplace Revenue Recognition

### Rule
- **Revenue = Platform Take Only**
- **GMV = Operating Metric Only (never P&L revenue)**

### Rationale
As a marketplace, STRATANOBLE facilitates transactions between service providers and customers. The platform does not own the inventory or provide the service directly. Therefore:
- Only the platform commission and booking fees are recognized as revenue
- The gross transaction value (GMV) is tracked as an operating metric for volume analysis
- GMV never flows to the P&L as revenue

### Application
```
Revenue = SUM(platform_commission) + SUM(booking_fees)
GMV = SUM(appointment.price)  // Operating metric only
```

### Validation
- CFO Agent verifies: `revenue != gmv` for marketplace segments
- P&L rollups must never include GMV as revenue
- Violation triggers: `P1_VIOLATION` alert

---

## Policy P2: Promo Classification

### Rule
- **Default:** Promos are classified as **Marketing Expense**
- **Exception:** Platform fee waivers are **Contra-revenue**

### Decision Tree
```
IF promo.type == 'fee_waiver' (commission or booking fee discount)
  THEN classify as Contra-revenue
  ELSE classify as Marketing Expense
```

### Rationale
- **Service price discounts** (e.g., "$10 off your haircut") are customer acquisition costs and belong in Marketing Expense
- **Fee waivers** (e.g., "No booking fee this month") reduce the platform's take and should reduce revenue, not inflate expenses

### Application
| Promo Type | Classification | P&L Impact |
|------------|---------------|------------|
| Service discount ($X off appointment) | Marketing Expense | OpEx |
| Percentage off service | Marketing Expense | OpEx |
| Commission waiver | Contra-revenue | Reduces Revenue |
| Booking fee waiver | Contra-revenue | Reduces Revenue |
| Free trial (SaaS) | Marketing Expense | OpEx |

### Validation
- CFO Agent enforces classification at snapshot time
- Tests verify routing for both promo types

---

## Policy P3: Payout Treatment

### Rule
- **Default:** Payouts are **Pass-through Liability Clearing**
- **Exception:** If segment is `merchant_of_record = true`, payouts are **COGS**

### Rationale
In a marketplace model, funds collected from customers are held temporarily as a liability until paid out to service providers. This is not a cost to the platform.

Only when the platform acts as merchant of record (owns the inventory, sets the price) do payouts become a true cost of goods sold.

### Application
```
IF segment.merchant_of_record == true
  THEN classify payout as COGS
  ELSE classify payout as Liability Clearing (no P&L impact)
```

### Current Segment Configuration

| Segment | Type | Merchant of Record | Payout Treatment |
|---------|------|-------------------|------------------|
| direct_cuts_marketplace | marketplace | false | Pass-through |
| reilq_saas | saas | false | Pass-through |
| stratanoble_services | services | false | Pass-through |

### Validation
- CFO Agent checks segment config before computing payouts
- Non-MoR segments with COGS payouts trigger `P3_VIOLATION` alert

---

## Policy Version Management

### Version Format
`v{major}.{minor}`
- Major: Breaking changes requiring backfill decision
- Minor: Non-breaking clarifications or additions

### Change Process
1. **Propose** change with rationale
2. **Version bump** (v1 → v1.1 or v2)
3. **Update** metric definitions if affected
4. **Backfill decision**: Recompute historical metrics or grandfather existing
5. **Notify** Accountant Agent of classification changes
6. **Update** this document

### Backfill Rules
| Change Type | Backfill Required |
|-------------|-------------------|
| New metric added | No |
| Existing metric formula change | Yes |
| Classification rule change | Decision required |
| Threshold change (rulesets) | No |

---

## Integration with CFO Agent

### Policy Enforcement Layer
```typescript
import { PolicyEngine } from '@/server/finance/policies';

// P1: Revenue recognition
const { revenue, gmv } = PolicyEngine.enforceRevenueRecognition(gmv, platformTake);

// P2: Promo classification
const { classification, marketingExpense, contraRevenue } =
  PolicyEngine.classifyPromo(promoType, amount);

// P3: Payout treatment
const { treatment, liabilityClearing, cogs } =
  PolicyEngine.classifyPayout(segment, payoutAmount);
```

### Snapshot Stamping
Every metric snapshot includes:
- `policy_version`: The version in effect (e.g., "v1")
- `policies_applied`: Array of policy codes applied (e.g., ["P1", "P2", "P3"])

---

## Audit Trail

All policy applications are logged:
- Metric snapshots store `policy_version`
- Alert events reference `policy_version`
- Scenario runs capture policy assumptions

---

## Appendix: Policy Quick Reference

| Policy | Short Name | Rule |
|--------|-----------|------|
| P1 | Revenue Recognition | Revenue = take only, GMV = operating metric |
| P2 | Promo Classification | Default to marketing expense, fee waivers are contra-revenue |
| P3 | Payout Treatment | Default to pass-through, COGS only when MoR |

---

## Change Log

| Version | Date | Change | Author |
|---------|------|--------|--------|
| v1 | 2026-01-01 | Initial policy definition | CFO Agent |
