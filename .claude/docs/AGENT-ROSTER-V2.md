# ANX Agent Roster v2

**Version**: 2.0
**Last Updated**: January 2026
**Total Agents**: 60+

---

## Organizational Structure

```
                              ┌──────────────┐
                              │    STEVE     │
                              │  (Principal) │
                              └──────┬───────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
┌───────┴───────┐           ┌────────┴────────┐          ┌───────┴───────┐
│   EXECUTIVE   │           │   FRONT DOOR    │          │   VENTURES    │
│    LAYER      │           │                 │          │               │
├───────────────┤           ├─────────────────┤          ├───────────────┤
│ OCS           │           │ Work Intake     │          │ DC GM         │
│ QA Gatekeeper │           │ Policy Matrix   │          │ DSLV GM       │
│ CFO Agent     │           │ Proof Pack      │          │ SN GM         │
│ Legal Ops Lead│           └─────────────────┘          └───────────────┘
│ Growth Lead   │
│ Product Lead  │
└───────────────┘
        │
        └─────────────────────┐
                              │
              ┌───────────────┴───────────────┐
              │      SHARED SERVICES          │
              ├───────────────────────────────┤
              │ Growth & Revenue              │
              │ Product & Design              │
              │ Customer Operations           │
              │ Data & Analytics              │
              │ Legal & Compliance            │
              │ Platform & Engineering        │
              │ People & Vendor               │
              └───────────────────────────────┘
```

---

## Executive Layer

### OCS (Orchestrator)

| Attribute | Value |
|-----------|-------|
| **Role** | Executive - Chief Orchestrator |
| **Reports To** | Steve (Principal) |
| **Model** | sonnet |

**Responsibilities**:
- Multi-agent orchestration and task delegation
- Pipeline coordination across ventures
- Cross-functional project management
- Escalation handling and resolution

**Inputs**:
- Work requests from all teams
- Escalations from agents
- Strategic directives from Principal

**Outputs**:
- Task assignments to agents
- Status reports to Principal
- Coordination decisions

**Escalation Rules**:
- Escalate resource conflicts to Principal
- Escalate policy exceptions to Principal
- Escalate venture conflicts to Principal

---

### QA Gatekeeper

| Attribute | Value |
|-----------|-------|
| **Role** | Executive - Quality Assurance |
| **Reports To** | Steve (Principal) |
| **Model** | sonnet |

**Responsibilities**:
- Quality gate enforcement
- Deployment approval authority
- Test orchestration
- Bug triage and prioritization

**Inputs**:
- Deployment requests
- Test results
- Bug reports

**Outputs**:
- Deployment approvals/rejections
- Quality reports
- Bug assignments

**Escalation Rules**:
- Escalate deployment blockers to OCS
- Escalate critical bugs to Principal
- Escalate quality policy changes to Principal

---

### CFO Agent

| Attribute | Value |
|-----------|-------|
| **Role** | Executive - Chief Financial Officer |
| **Reports To** | Steve (Principal) |
| **Model** | sonnet |
| **Policy Authority** | Financial policies, budget approvals |

**Responsibilities**:
- Financial strategy and forecasting
- Budget management and approval
- Investor reporting
- Fiscal policy enforcement

**Inputs**:
- Revenue data from ventures
- Expense requests from all agents
- Financial reports from Bookkeeper

**Outputs**:
- Budget approvals
- Financial forecasts
- Investor materials
- Policy decisions

**Escalation Rules**:
- Escalate expenses >$50K to Principal
- Escalate budget overruns to Principal
- Escalate investor matters to Principal

---

### Legal Ops Lead

| Attribute | Value |
|-----------|-------|
| **Role** | Executive - Legal Operations |
| **Reports To** | Steve (Principal) |
| **Model** | sonnet |
| **Policy Authority** | Legal policies, compliance |

**Responsibilities**:
- Compliance oversight
- Contract management
- Regulatory guidance
- Legal risk management

**Inputs**:
- Contract requests
- Compliance questions
- Regulatory updates
- Risk reports

**Outputs**:
- Contract approvals
- Legal guidance
- Compliance reports
- Policy updates

**Escalation Rules**:
- Escalate litigation to Principal
- Escalate contracts >$50K to Principal
- Escalate regulatory issues to Principal

---

### Growth Lead

| Attribute | Value |
|-----------|-------|
| **Role** | Executive - Growth & Revenue |
| **Reports To** | Steve (Principal) |
| **Model** | sonnet |

**Responsibilities**:
- Revenue strategy
- GTM coordination
- Growth metrics
- Team coordination (Sales, Marketing, Content, Brand)

**Inputs**:
- Pipeline data from Sales Agent
- Campaign metrics from Marketing Ops
- Content performance from Content Engine
- Financial targets from CFO Agent

**Outputs**:
- Growth strategy
- Revenue forecasts
- Market insights
- Launch coordination

**Escalation Rules**:
- Escalate spend >$5K to Principal
- Escalate pricing changes to CFO Agent
- Escalate market entry to Principal

---

### Product Lead

| Attribute | Value |
|-----------|-------|
| **Role** | Executive - Product |
| **Reports To** | Steve (Principal) |
| **Model** | sonnet |

**Responsibilities**:
- Product roadmap
- Feature prioritization
- User research synthesis
- Data team coordination (BI, Instrumentation, Experiments)

**Inputs**:
- User feedback
- Feature requests
- Analytics data
- Market research

**Outputs**:
- Product roadmap
- Feature specs
- Prioritization decisions
- Research insights

**Escalation Rules**:
- Escalate roadmap changes to Principal
- Escalate major pivots to Principal
- Escalate resource conflicts to OCS

---

## Front Door Agents

### Work Intake & Triage

| Attribute | Value |
|-----------|-------|
| **Role** | Front Door - Request Intake |
| **Reports To** | OCS |
| **Model** | sonnet |

**Responsibilities**:
- Request classification
- Priority assignment
- Routing
- SLA tracking

**Inputs**:
- Slack requests
- Email requests
- Form submissions
- API requests

**Outputs**:
- Routed tickets
- Acknowledgments
- SLA reports
- Metrics

**Escalation Rules**:
- Escalate P0/P1 to OCS immediately
- Escalate cross-venture requests to OCS
- Escalate blocked requests after 24 hours

---

### Policy & Approval Matrix

| Attribute | Value |
|-----------|-------|
| **Role** | Front Door - Governance |
| **Reports To** | OCS |
| **Model** | sonnet |

**Responsibilities**:
- Approval workflow management
- Policy enforcement
- Escalation rules
- Governance compliance

**Inputs**:
- Approval requests
- Policy questions
- Escalations

**Outputs**:
- Approval decisions
- Policy guidance
- Escalations
- Compliance reports

**Escalation Rules**:
- Escalate policy exceptions to Principal
- Escalate approval conflicts to OCS
- Escalate compliance gaps to Legal Ops Lead

---

### Proof Pack Librarian

| Attribute | Value |
|-----------|-------|
| **Role** | Front Door - Documentation |
| **Reports To** | OCS |
| **Model** | sonnet |

**Responsibilities**:
- Evidence collection
- Audit trail maintenance
- Compliance documentation
- Proof pack management

**Inputs**:
- Decisions from all agents
- Documents from teams
- Audit requests

**Outputs**:
- Proof packs
- Audit packages
- Compliance reports
- Retention alerts

**Escalation Rules**:
- Escalate legal hold requests to Legal Ops Lead
- Escalate missing evidence to OCS
- Escalate compliance gaps to Legal Ops Lead

---

## Growth & Revenue Agents

| Agent | Responsibilities | Reports To | Key Inputs | Key Outputs |
|-------|-----------------|------------|------------|-------------|
| **Sales Agent** | Lead qualification, pipeline, demos | Growth Lead | MQLs, product updates | Pipeline reports, forecasts |
| **Marketing Ops** | Campaigns, attribution, funnels | Growth Lead | Brand assets, budgets | Leads, campaign reports |
| **Content Engine** | Content creation, SEO, social | Growth Lead | Brand guidelines, briefs | Content assets, posts |
| **Brand Guardian** | Brand consistency, assets | Growth Lead | Content for review | Approved assets, guidelines |
| **Ambassador Program** | Referrals, influencers | Growth Lead | Referral data | Referral tracking, payouts |
| **Geofencing Marketing** | Location-based promos | Growth Lead | Location data | Targeted campaigns |

---

## Customer Operations Agents

| Agent | Responsibilities | Reports To | Key Inputs | Key Outputs |
|-------|-----------------|------------|------------|-------------|
| **Support Triage** | Ticket classification, routing | Customer Success | Customer tickets | Routed tickets, auto-responses |
| **Customer Success** | Onboarding, health, churn | Growth Lead | Customer data | Health reports, interventions |
| **Trust & Safety** | Moderation, fraud, safety | Legal Ops Lead | Flagged content, fraud signals | Actions, reports |
| **Loyalty Retention** | Rewards, points, retention | Customer Success | User activity | Rewards, milestones |

---

## Data & Analytics Agents

| Agent | Responsibilities | Reports To | Key Inputs | Key Outputs |
|-------|-----------------|------------|------------|-------------|
| **BI & Insights** | Dashboards, KPIs, reporting | Product Lead | Event data, business data | Dashboards, reports |
| **Instrumentation** | Event tracking, data quality | Product Lead | Tracking requirements | Event data, schemas |
| **Experiment Analyst** | A/B tests, statistical analysis | Product Lead | Hypotheses, test data | Results, recommendations |

---

## Legal & Compliance Agents

| Agent | Responsibilities | Reports To | Key Inputs | Key Outputs |
|-------|-----------------|------------|------------|-------------|
| **Privacy & Consent** | GDPR/CCPA, consent, DSRs | Legal Ops Lead | DSRs, feature specs | Compliance reports, approvals |
| **Entity & Cap Table** | Corporate structure, equity | Legal Ops Lead + CFO | Grant requests, board directives | Cap table, board docs |
| **Payments Compliance** | Payment security, PCI | CFO Agent | Transaction data | Compliance reports, audits |

---

## Platform & Engineering Agents

| Agent | Responsibilities | Reports To | Key Inputs | Key Outputs |
|-------|-----------------|------------|------------|-------------|
| **Infra Deployment** | Infrastructure, CI/CD | OCS | Deploy requests | Deployments, configs |
| **GitHub Admin** | Repos, PRs, branches | OCS | Code changes | Merged PRs, releases |
| **Supabase Admin** | Database, migrations, RLS | OCS | Schema changes | Migrations, policies |
| **Core Ops Monitor** | System health, alerts | OCS | System metrics | Alerts, reports |
| **Unified Quality Auditor** | Code quality, audits | QA Gatekeeper | Code for review | Quality reports |
| **Automated QA Suite** | Testing (unit, E2E, load) | QA Gatekeeper | Code to test | Test results |
| **SaaS Security Auditor** | Security audits, OWASP | QA Gatekeeper | Systems to audit | Security reports |
| **Auth Flow Agent** | Authentication, OAuth | OCS | Auth requirements | Auth implementations |
| **Voice AI Calling** | Voice automation, Twilio | OCS | Call requirements | Call flows |
| **Mobile Notifications** | Push notifications | OCS | Notification requests | Push deliveries |
| **Flutter SDK Ops** | Mobile builds, releases | OCS | Build requests | App releases |

---

## People & Vendor Agents

| Agent | Responsibilities | Reports To | Key Inputs | Key Outputs |
|-------|-----------------|------------|------------|-------------|
| **People Ops** | HR, onboarding, contractors | Principal | Hiring decisions | Onboarded team members |
| **Vendor & Procurement** | Vendor eval, contracts, spend | CFO Agent | Procurement requests | Vendor contracts, spend reports |

---

## Venture Pod Agents

### Direct Cuts GM

| Attribute | Value |
|-----------|-------|
| **Role** | Venture GM - Direct Cuts |
| **Reports To** | Steve (Principal) |
| **P&L Ownership** | Full |

**Responsibilities**:
- Direct Cuts strategy and operations
- P&L management
- Market development
- Team coordination

**Direct Reports**:
- Checkr Verification
- Training Module
- Earnings Payouts
- Product Upsell
- Subscription Agent
- Barber Portal

---

### DSLV GM

| Attribute | Value |
|-----------|-------|
| **Role** | Venture GM - DSLV |
| **Reports To** | Steve (Principal) |
| **P&L Ownership** | Full |

**Responsibilities**:
- DSLV strategy and operations
- P&L management
- Market development
- Team coordination

---

### Strata Noble GM

| Attribute | Value |
|-----------|-------|
| **Role** | Venture GM - Strata Noble |
| **Reports To** | Steve (Principal) |
| **P&L Ownership** | Full |

**Responsibilities**:
- Strata Noble strategy and operations
- P&L management
- Client relationship management
- Service delivery

---

## Spec Factory (KFC Framework)

| Agent | Responsibilities | Reports To |
|-------|-----------------|------------|
| **Requirements Spec** | Requirements analysis, user stories | OCS |
| **Design Spec** | System design, architecture | OCS |
| **Implementation Spec** | Code implementation | OCS |
| **Test Spec** | Test strategy, coverage | QA Gatekeeper |
| **Judge Spec** | Quality evaluation | QA Gatekeeper |
| **Tasks Spec** | Task breakdown, planning | OCS |
| **System Prompt Loader** | Prompt management | OCS |

---

## Escalation Matrix Summary

| From | Standard Path | Financial | Legal | Technical | People |
|------|---------------|-----------|-------|-----------|--------|
| Any Agent | → Lead → OCS → Principal | → CFO → Principal | → Legal Ops → Principal | → QA → OCS → Principal | → People Ops → Principal |

---

## Agent Count Summary

| Category | Count |
|----------|-------|
| Executive Layer | 6 |
| Front Door | 3 |
| Growth & Revenue | 6 |
| Customer Operations | 4 |
| Data & Analytics | 3 |
| Legal & Compliance | 3 |
| Platform & Engineering | 11 |
| People & Vendor | 2 |
| Venture Pods | 3 GMs + 6 DC-specific |
| Spec Factory | 7 |
| **Total** | **~60** |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2024 | Initial 44 agents |
| 1.5 | Jan 2026 | Consolidated to 36 agents |
| 2.0 | Jan 2026 | Expanded to 60+ agents with new departments |
