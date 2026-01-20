# ANX Approval Thresholds

**Version**: 3.0 (Lean Governance)
**Last Updated**: January 2026

---

## Philosophy

**Default: APPROVED. Only block irreversible decisions.**

Agents operate autonomously within their authority. Approvals exist only for decisions that:
1. Cannot be easily undone
2. Have significant financial/legal/reputational risk
3. Commit ANX to external parties

---

## The Spine (Mandatory Flow)

```
Work → INTAKE → OCS → Department Owner → Execution → PROOF → Done
```

**No side channels. No bypassing.**

---

## Financial Approvals

| Decision | Threshold | Approver | Backup |
|----------|-----------|----------|--------|
| **Expense** | <$500 | Auto-approved | - |
| **Expense** | $500-$5,000 | CFO Agent | OCS |
| **Expense** | >$5,000 | Principal | - |
| **Recurring spend** | <$500/mo | CFO Agent | OCS |
| **Recurring spend** | >$500/mo | Principal | - |
| **Revenue commitment** | Any binding | CFO Agent | Principal |
| **Pricing change** | Any | CFO + Growth Lead | Principal |
| **Discount** | <10% | Sales (Growth Lead skill) | Growth Lead |
| **Discount** | 10-25% | Growth Lead | CFO Agent |
| **Discount** | >25% | CFO Agent | Principal |
| **Refund** | <$100 | Auto-approved | - |
| **Refund** | $100-$1,000 | CFO Agent | OCS |
| **Refund** | >$1,000 | Principal | - |

---

## Legal Approvals

| Decision | Threshold | Approver | Backup |
|----------|-----------|----------|--------|
| **Standard contract** | <$10K value | Legal Ops Lead | OCS |
| **Custom contract** | $10K-$50K | Legal Ops Lead + CFO | Principal |
| **Major contract** | >$50K | Principal | - |
| **NDA (standard)** | Any | Auto-approved (template) | Legal Ops |
| **NDA (custom)** | Any | Legal Ops Lead | Principal |
| **Terms of Service change** | Any | Legal Ops + Principal | - |
| **Privacy Policy change** | Any | Legal Ops + Principal | - |
| **Litigation response** | Any | Principal + External Counsel | - |
| **Regulatory response** | Any | Legal Ops + Principal | - |

---

## Technical Approvals

| Decision | Threshold | Approver | Backup |
|----------|-----------|----------|--------|
| **Production deploy** | Standard | QA Gatekeeper | OCS |
| **Production deploy** | Hotfix/Critical | QA Gatekeeper + OCS | Principal |
| **Database migration** | Non-destructive | Platform Ops | QA Gatekeeper |
| **Database migration** | Destructive/Schema | Platform Ops + QA | OCS |
| **API breaking change** | Any | Product Lead + Platform Ops | Principal |
| **Security exception** | Any | Platform Ops + Legal Ops | Principal |
| **PII data access** | Any | Legal Ops (Privacy skill) | Principal |
| **Third-party integration** | New vendor | Platform Ops + CFO | OCS |
| **Infrastructure change** | <$100/mo impact | Platform Ops | CFO Agent |
| **Infrastructure change** | >$100/mo impact | Platform Ops + CFO | Principal |

---

## People Approvals

| Decision | Threshold | Approver | Backup |
|----------|-----------|----------|--------|
| **New hire** | Any | Principal | - |
| **Contractor** | <$5K total | OCS (People Ops skill) | CFO Agent |
| **Contractor** | >$5K total | CFO Agent | Principal |
| **Termination** | Any | Principal + Legal Ops | - |
| **Raise/Promotion** | Any | Principal + CFO | - |
| **Policy exception** | Any | Principal | - |
| **Access grant** | Standard role | OCS (People Ops skill) | Platform Ops |
| **Access grant** | Admin/Elevated | Platform Ops + OCS | Principal |

---

## Product Approvals

| Decision | Threshold | Approver | Backup |
|----------|-----------|----------|--------|
| **Feature prioritization** | Within sprint | Product Lead | OCS |
| **Roadmap change** | Major | Product Lead + Principal | - |
| **Feature removal** | Any | Product Lead + OCS | Principal |
| **Experiment launch** | <5% traffic | Product Lead | QA Gatekeeper |
| **Experiment launch** | >5% traffic | Product Lead + QA | OCS |
| **Public announcement** | Any | Growth Lead + Principal | - |

---

## Venture Approvals

| Decision | Threshold | Approver | Backup |
|----------|-----------|----------|--------|
| **Pricing (venture)** | Any | Venture GM + CFO | Principal |
| **New market entry** | Any | Venture GM + Principal | - |
| **Partnership** | Non-binding | Venture GM + Growth Lead | OCS |
| **Partnership** | Binding | Venture GM + Principal | - |
| **Feature for venture** | Within roadmap | Venture GM | Product Lead |
| **Feature for venture** | Outside roadmap | Venture GM + Product Lead | Principal |

---

## Auto-Approved (No Escalation Needed)

These are always approved within bounds:

| Action | Bound |
|--------|-------|
| Bug fixes | No feature changes |
| Documentation updates | Accuracy only |
| Test additions | No production impact |
| Monitoring/alerting | No cost increase |
| Code refactoring | No behavior change |
| Dependency updates | Security patches only |
| Content publishing | Within brand guidelines |
| Customer support responses | Within playbook |
| Scheduled reports | Existing templates |

---

## Escalation Triggers

### Auto-Escalate When:

| Trigger | Escalate To | SLA |
|---------|-------------|-----|
| Approval pending >48 hours | Next level up | Immediate |
| P0/P1 incident | OCS + Principal | 15 min |
| Security breach | Platform Ops + Legal + Principal | Immediate |
| Customer complaint (public) | Growth Lead + Principal | 2 hours |
| Revenue loss >$1K | CFO + Principal | 4 hours |
| Legal threat | Legal Ops + Principal | Immediate |
| Conflicting approvals | OCS | 4 hours |

### Escalation Chain

```
Standard:     Agent → Lead → OCS → Principal
Financial:    Agent → CFO → Principal
Legal:        Agent → Legal Ops → Principal
Technical:    Agent → Platform Ops/QA → OCS → Principal
People:       Agent → OCS → Principal
```

---

## Proof Requirements

### What Needs a Receipt

| Decision Type | Proof Required |
|---------------|----------------|
| Any approval | Approval record with timestamp |
| Financial >$500 | Invoice + approval chain |
| Contract signed | Executed document |
| Deploy to prod | Deploy log + QA sign-off |
| Data access | Access log + justification |
| Customer refund | Ticket + approval |
| Security exception | Risk acceptance doc |

### Proof Storage

All proofs stored via **Proof Pack Librarian** (OCS skill):
- Location: `agents/[agent]/receipts/`
- Format: Markdown with links to artifacts
- Retention: Per Legal Ops policy

---

## Decision Framework

**Before requesting approval, ask:**

1. Is this reversible? → Probably don't need approval
2. Does it commit money/legal/reputation? → Check thresholds
3. Am I within my authority? → Just do it
4. Am I at the threshold edge? → Get approval to be safe

**When in doubt:**
- Small reversible risk → Do it, document it
- Large or irreversible risk → Get approval first

---

## Summary

| Category | Auto-Approved | Agent Authority | Principal Required |
|----------|---------------|-----------------|-------------------|
| Financial | <$500 | $500-$5K | >$5K |
| Contracts | Standard NDA | <$50K | >$50K |
| Technical | Bug fixes | Standard deploys | Breaking changes |
| People | Access (standard) | Contractors <$5K | Hiring/firing |
| Product | Within sprint | Roadmap items | Major pivots |
