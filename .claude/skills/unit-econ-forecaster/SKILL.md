# Unit Economics Forecaster Skill

**Purpose:** Model MRR scenarios and growth trajectories for investor presentations  
**Version:** 1.0.0  
**Created:** 2025-11-29

---

## What This Skill Does

Generate financial projections that answer "Path to $1M ARR":

- **MRR Scenarios:** Conservative, base, aggressive growth models
- **Hockey Stick Projections:** Month-over-month growth curves
- **Sensitivity Analysis:** What breaks the model? What accelerates it?
- **Milestone Mapping:** Revenue triggers for Series A readiness

---

## When to Use This Skill

Use this skill when you need to:

- ✅ Model "Path to $1M ARR" for investors
- ✅ Create financial projections for pitch deck
- ✅ Stress-test assumptions (what if CAC doubles?)
- ✅ Identify Series A trigger metrics
- ✅ Plan hiring/spend against revenue milestones

---

## Inputs Required

### Data Source: Supabase
**Table:** `financial_artifacts`  
**Project:** ftlrjnbuvbdvnkdboyrp

```sql
-- Get required artifacts
SELECT artifact_name, data 
FROM financial_artifacts 
WHERE artifact_name IN ('ground_truth', 'burn_sheets', 'usage_burn_analysis');
```

### 1. Base Assumptions (from ground_truth.financials)
```json
{
  "pricing": {
    "mrr_per_client": 2000,
    "setup_fee": 500,
    "expansion_potential": 3.0
  },
  "sales": {
    "calls_per_day": 500,
    "connect_rate": 0.15,
    "appointment_rate": 0.02,
    "close_rate": 0.25,
    "sales_cycle_days": 30
  },
  "costs": {
    "cac": 50,
    "cost_per_call": 0.025,
    "infrastructure_monthly": 380,
    "fully_loaded_engineer": 8000
  },
  "churn": {
    "monthly": 0.03,
    "net_retention": 1.10
  }
}
```

### 2. Current State
```json
{
  "current_mrr": 0,
  "current_clients": 0,
  "runway_months": 18,
  "team_size": 1
}
```

---

## Output Format

### 1. MRR Scenarios Table

| Month | Conservative | Base | Aggressive |
|-------|--------------|------|------------|
| M1 | $2K | $4K | $6K |
| M3 | $6K | $12K | $20K |
| M6 | $14K | $30K | $50K |
| M12 | $40K | $80K | $140K |
| M18 | $80K | $160K | $280K |
| M24 | $140K | $280K | $500K |

**Assumptions by Scenario:**

| Metric | Conservative | Base | Aggressive |
|--------|--------------|------|------------|
| New clients/mo | 1 | 2 | 3 |
| Churn | 5% | 3% | 2% |
| NRR | 100% | 110% | 120% |
| CAC | $100 | $50 | $30 |

### 2. Hockey Stick Chart Data

```
MRR Growth - Base Case
$300K |                               ****
$250K |                          *****
$200K |                     *****
$150K |                *****
$100K |           *****
$50K  |      *****
$0    |*****
      +----------------------------------
        M1  M6  M12  M18  M24  M30  M36

Inflection Point: M12 (first enterprise client)
Series A Trigger: M18 @ $160K MRR ($1.9M ARR run rate)
```

### 3. Path to $1M ARR

```markdown
## $1M ARR Roadmap (Base Case)

### Phase 1: Foundation (M1-M6)
- Target: $30K MRR ($360K ARR run rate)
- Clients: 15 small/medium brokers
- Focus: Product-market fit, case studies
- Burn: $380/mo infrastructure only

### Phase 2: Scale (M7-M12)
- Target: $80K MRR ($960K ARR run rate)
- Clients: 35 brokers + 2 enterprise
- Focus: Hire first engineer, sales automation
- Burn: $8K/mo (1 engineer + infra)

### Phase 3: Series A Ready (M13-M18)
- Target: $160K MRR ($1.9M ARR run rate)  
- Clients: 60 brokers + 5 enterprise
- Focus: Multi-carrier integration, expansion revenue
- Burn: $24K/mo (3 engineers + infra)

### Key Milestones for Series A
✅ $100K MRR sustained for 3 months
✅ Net retention > 110%
✅ Gross margin > 80%
✅ 2+ enterprise logos
✅ Clear path to $10M ARR
```

### 4. Sensitivity Analysis

| If This Changes... | Impact on M18 MRR | Mitigation |
|-------------------|-------------------|------------|
| Churn +2% | -$25K (-16%) | Contract length, success team |
| CAC doubles | -$15K (-9%) | Referral program, content marketing |
| Price -20% | -$32K (-20%) | Add premium tier, carrier integrations |
| Close rate +50% | +$40K (+25%) | Sales training, demo optimization |
| NRR +10% | +$30K (+19%) | Expansion playbook, upsell automation |

**Model Breakers (Red Flags):**
- Churn > 8% monthly = death spiral
- CAC > $200 = unit economics collapse  
- Close rate < 10% = product-market fit issue

**Model Accelerators (Upside):**
- Enterprise deal ($20K+ MRR) = hockey stick inflection
- Carrier partnership = channel revenue
- Referral flywheel = CAC → $0

---

## VC Jargon Reference

Use these metrics in projections:
- **MRR** - Monthly Recurring Revenue
- **ARR** - Annual Recurring Revenue (MRR × 12)
- **Net Revenue Retention (NRR)** - (Starting MRR + Expansion - Churn) / Starting MRR
- **Gross Margin** - (Revenue - COGS) / Revenue
- **Payback Period** - CAC / (MRR × Gross Margin)
- **LTV** - (MRR × Gross Margin) / Monthly Churn Rate
- **T2D3** - Triple, triple, double, double, double (growth pattern)

---

## Sample Forecast Prompt

```
Model DSLV's path to $1M ARR.

Given:
- Base assumptions JSON
- Current state (pre-revenue)

Produce:
1. 3 MRR scenarios (conservative/base/aggressive) through M24
2. Hockey stick chart data points
3. Phase-by-phase roadmap with milestones
4. Sensitivity analysis: what breaks/accelerates the model
5. Series A trigger metrics with timeline

Frame as: What does an investor need to believe for this to work?
```

---

## Integration Points

- **Input:** Assumptions JSON, current state, market data
- **Output:** Scenario tables, chart data, milestone roadmap
- **Feeds Into:** Valuation Comps (DCF inputs), Funding Narrative (projections section)
