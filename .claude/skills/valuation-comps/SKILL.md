# Valuation Comps Skill

**Purpose:** Generate Series A valuation analysis with public comps and DCF  
**Version:** 1.0.0  
**Created:** 2025-11-29

---

## What This Skill Does

You are a Series A VC analyst at a16z. Given DSLV's engineering JSON and TAM data, produce:

- **5 Public Comps:** ARR, headcount, eng burn, valuation multiples
- **DCF Model:** 10% discount rate, 3-year hockey stick projection
- **Investment Thesis:** "Why this is undervalued" in 3 bullets
- **Comparable Transactions:** Recent Series A rounds in AI/SaaS space

---

## When to Use This Skill

Use this skill when you need to:

- ✅ Justify valuation for Series A pitch deck
- ✅ Prepare for investor valuation negotiations
- ✅ Benchmark against similar companies
- ✅ Create financial slides for pitch deck
- ✅ Model different valuation scenarios

---

## Inputs Required

### Data Source: Supabase
**Table:** `financial_artifacts`  
**Project:** ftlrjnbuvbdvnkdboyrp

```sql
-- Get required artifacts
SELECT artifact_name, data 
FROM financial_artifacts 
WHERE artifact_name IN ('ground_truth', 'usage_burn_analysis');
```

### 1. ground_truth.financials (from artifact)
```json
{
  "company": "DSLV",
  "stage": "Pre-revenue / Early revenue",
  "metrics": {
    "mrr": 0,
    "arr_projected_y1": 240000,
    "arr_projected_y2": 960000,
    "arr_projected_y3": 2400000,
    "gross_margin_target": 0.85,
    "cac": 50,
    "ltv": 2400,
    "ltv_cac_ratio": 48
  },
  "team": {
    "headcount": 1,
    "engineering_pct": 1.0
  },
  "burn": {
    "monthly": 380,
    "runway_months": 18
  }
}
```

### 2. Market Data
```json
{
  "tam": {
    "total": 15000000000,
    "sam": 500000000,
    "som": 50000000
  },
  "segment": "AI Sales Automation",
  "growth_rate": 0.35,
  "competitors": ["Gong", "Outreach", "Salesloft", "Apollo"]
}
```

---

## Output Format

### 1. Public Comps Table

| Company | ARR at Series A | Headcount | Eng % | Valuation | ARR Multiple | Notes |
|---------|-----------------|-----------|-------|-----------|--------------|-------|
| Gong | $2M | 25 | 60% | $40M | 20x | Conversation intelligence |
| Outreach | $1.5M | 20 | 55% | $30M | 20x | Sales engagement |
| Apollo.io | $800K | 15 | 70% | $20M | 25x | Lead intelligence |
| Orum | $500K | 12 | 65% | $15M | 30x | AI dialer (closest comp) |
| Air.ai | $300K | 8 | 80% | $12M | 40x | AI voice agents |

**Median Multiple:** 25x ARR  
**DSLV Implied Range:** $6M - $10M (at $240K projected Y1 ARR)

### 2. DCF Summary (10% Discount, 3-Year)

| Year | ARR | Growth | FCF | Discounted |
|------|-----|--------|-----|------------|
| Y1 | $240K | - | -$50K | -$45K |
| Y2 | $960K | 300% | $150K | $124K |
| Y3 | $2.4M | 150% | $600K | $451K |
| Terminal (5x) | - | - | $3M | $2.05M |

**DCF Value:** $2.58M  
**With Growth Premium (AI/Automation):** $5.2M - $7.8M

### 3. "Why This Is Undervalued" Thesis

1. **Unit Economics Dominance:** LTV/CAC of 48x vs. industry median of 3-5x. $0.025/call vs. $1.00+ human equivalent = 97% cost advantage creates winner-take-most dynamics.

2. **Technical Moat:** Fully operational AI voice system with proven conversation quality. Competitors are 12-18 months behind on voice AI integration. First-mover in connectivity broker vertical.

3. **Capital Efficiency:** Solo founder with deployed production system. $380/mo burn with 18-month runway. Every dollar invested goes to growth, not catch-up engineering.

---

## VC Jargon Reference

Use these terms naturally:
- **LTV/CAC** - Customer lifetime value / acquisition cost (>3x is good)
- **Rule of 40** - Growth rate + profit margin should exceed 40%
- **Magic Number** - Net new ARR / S&M spend (>0.75 is efficient)
- **Net Revenue Retention (NRR)** - Expansion - churn (>100% means growth without new customers)
- **ARR Multiple** - Valuation / Annual Recurring Revenue
- **Gross Margin** - Revenue - COGS (SaaS target: 70-85%)

---

## Sample Analysis Prompt

```
Generate Series A valuation analysis for DSLV.

Given:
- DSLV metrics JSON (current state + projections)
- Market data (TAM/SAM/SOM, competitors)

Produce:
1. 5 public comps table (focus on AI sales automation, voice AI)
2. DCF summary with 10% discount, 3-year hockey stick
3. "Why undervalued" thesis in 3 bullets
4. Recommended ask range with justification

Frame as: What would justify a $5M pre-money to a skeptical a16z partner?
```

---

## Integration Points

- **Input:** DSLV metrics JSON, market research, ground_truth.json
- **Output:** Comps table, DCF model, thesis bullets
- **Feeds Into:** Funding Narrative skill, pitch deck financial slides
