# Funding Narrative Skill

**Purpose:** Synthesize all DSLV data into compelling VC-ready narratives  
**Version:** 1.0.0  
**Created:** 2025-11-29

---

## What This Skill Does

Combines outputs from Cost/Risk Analyzer and Valuation Comps into:

- **2-Page Investment Memo:** Executive summary for partner meetings
- **Slide Outline:** 10-12 slide pitch deck structure with content
- **One-Pager:** Quick-reference for warm intros
- **Email Templates:** Outreach copy for different investor types

---

## When to Use This Skill

Use this skill when you need to:

- ✅ Prepare for partner meetings at VC firms
- ✅ Create pitch deck narrative and structure
- ✅ Write investor outreach emails
- ✅ Summarize DSLV's story for warm introductions
- ✅ Prepare answers to common VC questions

---

## Inputs Required

### Data Source: Supabase
**Table:** `financial_artifacts`  
**Project:** ftlrjnbuvbdvnkdboyrp

```sql
-- Get all artifacts for narrative synthesis
SELECT artifact_name, data 
FROM financial_artifacts;
```

### 1. All Artifacts (from Supabase)
- Risk matrix from Cost/Risk Analyzer
- Comps table and DCF from Valuation Comps
- Unit economics from ground_truth.json

### 2. Narrative Elements
```json
{
  "founder_story": "Telecom industry veteran, built quote systems at scale",
  "problem": "Connectivity brokers spend $50K+/mo on human cold callers with 24hr quote turnaround",
  "solution": "AI-powered cold calling + instant quoting = 97% cost reduction",
  "traction": "Production system deployed, 500+ calls/day capacity",
  "ask": "$500K seed / $2M Series A",
  "use_of_funds": "Hire 2 engineers, scale to 10 broker clients"
}
```

---

## Output Format

### 1. Two-Page Investment Memo

```markdown
# DSLV Investment Memo
**Prepared for:** [Firm Name] Partner Meeting  
**Date:** November 2025

## Executive Summary
DSLV is building the operating system for connectivity brokers—automating the entire sales cycle from cold calling to quote delivery. Our AI agent "Angela" makes 500+ calls/day at $0.025/call vs. $1.00+ for humans, with sub-5-minute quote turnaround vs. industry standard 24 hours.

**The Ask:** $500K seed at $3M pre-money  
**Use of Funds:** 2 engineers ($16K/mo), scale to 10 clients  
**Target:** $1M ARR in 18 months

## Why Now
1. Voice AI crossed the quality threshold in 2024 (ElevenLabs, OpenAI Realtime)
2. Connectivity broker market is $15B, entirely unautomated
3. Labor costs up 40% since 2020, brokers desperate for alternatives

## Traction
- Production system live at datasolutionslv.com
- 4 campaign types operational (Internet, VoIP, Security, Cisco)
- Unit economics: 48x LTV/CAC, 85% gross margin target

## Team
Steve [Last Name] - Solo technical founder
- 15+ years telecom industry
- Built enterprise quote systems
- Deep carrier relationships (ATT, Lumen, Comcast, Verizon)

## Competition & Moat
| Competitor | Gap |
|------------|-----|
| Gong/Outreach | Analysis only, no voice AI execution |
| Orum | Generic dialer, no vertical expertise |
| Air.ai | Horizontal, no quote integration |

**DSLV Moat:** Vertical integration of voice AI + carrier APIs + broker workflows. 12-18 month head start on connectivity-specific AI.

## Risks & Mitigations
[Insert from Cost/Risk Analyzer output]

## Financial Projections
[Insert from Valuation Comps output]

## The Ask
$500K seed investment for:
- 2 senior engineers ($192K/yr)
- Scale infrastructure ($50K)
- First 10 client acquisition ($100K)
- 18-month runway to Series A metrics
```

### 2. Pitch Deck Outline (10 Slides)

| # | Slide | Content | Data Source |
|---|-------|---------|-------------|
| 1 | Title | DSLV: AI Sales Automation for Connectivity Brokers | - |
| 2 | Problem | $50K/mo caller costs, 24hr quotes, 2% conversion | Market research |
| 3 | Solution | Angela AI + instant quoting = 97% cost reduction | ground_truth.json |
| 4 | Demo | 30-second call recording + quote flow | Production system |
| 5 | Market | $15B TAM → $500M SAM → $50M SOM | Valuation Comps |
| 6 | Traction | System live, 500 calls/day capacity, unit economics | Metrics JSON |
| 7 | Business Model | $2K/mo/broker, 85% margin, expansion via carrier APIs | Financial model |
| 8 | Competition | Moat diagram: vertical integration | Valuation Comps |
| 9 | Team | Solo founder + advisor network + hire plan | Narrative elements |
| 10 | Ask | $500K seed, $3M pre, 18mo to Series A | Valuation Comps |

### 3. Common VC Questions (Prepared Answers)

**"Why will you win?"**
> Vertical integration. Gong analyzes calls, we make them. Orum dials, we quote. We're the only platform connecting voice AI to carrier APIs in a single workflow. That's a 12-month head start competitors can't buy.

**"Why now?"**
> Voice AI crossed the quality threshold in 2024. ElevenLabs and OpenAI Realtime made conversations indistinguishable from humans. We built while others waited.

**"What's your moat?"**
> Three layers: (1) Carrier API integrations that took 6 months to build, (2) Conversation design tuned for broker workflows, (3) First-mover data advantage—every call improves the model.

**"Why should we fund a solo founder?"**
> Production system is live. I'm not asking you to fund an idea—you can call Angela yourself. The risk isn't "can he build it," it's "can he scale it." That's what the capital is for.

---

## VC Jargon Reference

Frame narratives using:
- **Category creation** - We're defining AI sales automation for connectivity
- **Wedge strategy** - Start with brokers, expand to carriers
- **Land and expand** - $2K/mo → $10K/mo via carrier API upsells
- **Winner-take-most** - Network effects from carrier integrations
- **Capital efficient** - $380/mo burn with production system live

---

## Sample Narrative Prompt

```
Generate investor materials for DSLV Series A prep.

Given:
- Risk matrix (from Cost/Risk Analyzer)
- Valuation analysis (from Valuation Comps)
- Narrative elements JSON

Produce:
1. 2-page investment memo
2. 10-slide pitch deck outline with content notes
3. Top 5 VC questions with prepared answers

Tone: Confident but not arrogant. Data-driven. 
Frame as: Preparing Steve for a16z partner meeting.
```

---

## Integration Points

- **Input:** Cost/Risk Analyzer output, Valuation Comps output, narrative JSON
- **Output:** Memo (markdown), slide outline (table), Q&A prep
- **Feeds Into:** Actual pitch deck creation, investor emails
