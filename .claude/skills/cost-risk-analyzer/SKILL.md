# Cost/Risk Analyzer Skill

**Purpose:** Analyze technical and financial risks for VC due diligence  
**Version:** 1.0.0  
**Created:** 2025-11-29

---

## What This Skill Does

This skill produces VC-ready risk analysis from DSLV's engineering and financial data:

- **Tech Debt Assessment:** Identify engineering risks that could block Series A
- **Burn Rate Analysis:** Flag unsustainable spending patterns
- **Dependency Risks:** Vendor lock-in, single points of failure
- **Mitigation Planning:** Actionable remediation with timelines and costs
- **Risk Matrix:** Probability × Impact scoring for investor presentations

---

## When to Use This Skill

Use this skill when you need to:

- ✅ Prepare for VC technical due diligence
- ✅ Identify "Tech risks blocking Series A"
- ✅ Create risk matrices for board/investor meetings
- ✅ Prioritize engineering debt reduction
- ✅ Justify infrastructure investments to investors

---

## Inputs Required

### Data Source: Supabase
**Table:** `financial_artifacts`  
**Project:** ftlrjnbuvbdvnkdboyrp

```sql
-- Get required artifacts
SELECT artifact_name, data 
FROM financial_artifacts 
WHERE artifact_name IN ('ground_truth', 'burn_sheets', 'codebase_scan');
```

### 1. ground_truth (artifact)
Engineering reality snapshot:
```json
{
  "infrastructure": {
    "hosting": ["Vercel", "Railway", "Supabase"],
    "critical_services": ["Twilio", "OpenAI", "ElevenLabs"],
    "redundancy": "none|partial|full"
  },
  "codebase": {
    "test_coverage": 0.45,
    "tech_debt_hours": 120,
    "deployment_frequency": "daily|weekly|monthly"
  },
  "team": {
    "bus_factor": 1,
    "key_person_dependencies": ["Steve"]
  }
}
```

### 2. Burn Sheet (Monthly)
```json
{
  "month": "2025-11",
  "infrastructure": {
    "vercel": 20,
    "railway": 45,
    "supabase": 25,
    "twilio": 150,
    "openai": 80,
    "elevenlabs": 60
  },
  "runway_months": 18,
  "mrr": 0,
  "gross_burn": 380
}
```

---

## Output Format

### Risk Matrix
| Risk | Probability | Impact | Score | Mitigation | Cost | Timeline |
|------|-------------|--------|-------|------------|------|----------|
| Single engineer dependency | High | Critical | 9 | Document + hire | $8K/mo | 3 mo |
| OpenAI API changes | Medium | High | 6 | Abstract LLM layer | 40 hrs | 2 wk |
| Twilio rate limits | Low | Critical | 4 | Multi-carrier fallback | $2K | 1 mo |

### Mitigation Plan (Investor-Ready)
```markdown
## Technical Risk Mitigation - Series A Readiness

### Critical (Address Before Raise)
1. **Bus Factor = 1** 
   - Risk: Entire system knowledge in one person
   - Fix: Documentation sprint + part-time contractor
   - Investment: $15K over 6 weeks
   - Status: 🟡 In Progress

### High Priority (Address Q1 2026)
2. **No Multi-Carrier Redundancy**
   - Risk: Twilio outage = 100% revenue impact
   - Fix: Integrate Bandwidth.com as backup
   - Investment: 60 engineering hours
   - Status: 🔴 Not Started

### Acceptable Risks (Documented)
3. **OpenAI Dependency**
   - Mitigated by: Anthropic fallback ready
   - Monitoring: Daily API health checks
```

---

## VC Jargon Reference

Use these terms in output:
- **Bus factor** - How many people can leave before project dies
- **Tech debt** - Shortcuts that slow future development
- **Vendor lock-in** - Switching cost to change providers
- **SPOF** - Single Point of Failure
- **Blast radius** - Impact scope of a failure
- **Recovery time objective (RTO)** - How fast can you recover

---

## Sample Analysis Prompt

```
Analyze DSLV's technical risks for Series A readiness.

Given:
- ground_truth.json (engineering state)
- November 2025 burn sheet

Produce:
1. Risk matrix with P×I scoring
2. Top 3 "fix before fundraise" items with cost/timeline
3. "Acceptable risks" list with monitoring plan
4. One-paragraph "Technical Risk Summary" for investor memo

Frame as: What would a16z's technical DD team flag?
```

---

## Integration Points

- **Input:** `ground_truth.json`, Notion financials, Supabase metrics
- **Output:** Risk matrix (table), mitigation plan (markdown), investor memo section
- **Feeds Into:** Funding Narrative skill, pitch deck appendix
