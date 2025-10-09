# Product Requirements Document (PRD)
**Project:** Strata Noble – Phase 3 Development Cycle  
**Focus:** Sales Cycle + ACHIEVERY Integration  
**Owner:** Strata Noble Consulting  
**Date:** 2025-09-11

---

## 1. Purpose
Phase 3 establishes a complete sales cycle framework for Strata Noble that ensures every inbound lead flows through a fast, automated, and repeatable process. The system must integrate with Q by Strata Noble (CRM) and ACHIEVERY (achievement engine) to deliver immediate value, shrink speed-to-lead response, and reinforce the brand’s mission of turning passion into profitable action.

---

## 2. Goals & Objectives
- Speed-to-Lead: Reduce client response time from hours or days to minutes.
- Trust Through Action: Show prospects immediate progress using ACHIEVERY tasks.
- Scalable Sales Process: Build a consistent, automated pipeline that applies to all new leads.
- Data Capture and Insights: Use CRM plus ACHIEVERY logs for continuous improvement and upsell opportunities.
- Seamless UX: Ensure client and internal flows are smooth, intuitive, and branded.

---

## 3. User Stories
### A. Lead (Client)
1. As a lead, I want to receive an instant confirmation after submitting a discovery request so I feel acknowledged.
2. As a lead, I want to book a call in under 2 minutes from the confirmation email so I can quickly secure a slot.
3. As a lead, I want to see my first ACHIEVERY task immediately after the call so I feel like I am making progress.
4. As a lead, I want to track my achievements through a simple dashboard so I gain confidence in the process.

### B. Strata Noble (Internal)
1. As Strata Noble, I want new leads to auto-log into Q by Strata Noble CRM so I never lose track of opportunities.
2. As Strata Noble, I want to see tags for stage, challenge, and tier interest so I can prioritize properly.
3. As Strata Noble, I want notifications when new leads arrive so I can react immediately.
4. As Strata Noble, I want follow-ups to trigger automatically so I do not waste time on manual tasks.

---

## 4. Scope
### In-Scope
- CRM integration for lead intake
- Automated confirmation and scheduling flow
- Discovery call agenda framework
- ACHIEVERY task assignment post-call
- Client-facing dashboard (basic MVP)
- Automated follow-up sequences

### Out-of-Scope (Future Phases)
- Full ACHIEVERY ecosystem beyond achievements
- Tier-based billing and automated upgrades
- Deep analytics dashboards

---

## 5. Features
### 5.1 Lead Capture and CRM Integration
- Form submission → direct CRM entry (Q by Strata Noble)
- Auto-tagging: Business Stage, Main Challenge, Passion Area, Tier Interest

### 5.2 Automated Response and Scheduling
- Personalized email template with dynamic insertion of stage and challenge
- Embedded Calendly link with next 24–48 hours availability
- SLA: under 5 minutes from submission to inbox delivery

### 5.3 Discovery Call Execution Support
- Internal agenda template (Listen → Reframe → Assign → Measure)
- Note-taking auto-synced to CRM

### 5.4 ACHIEVERY Integration
- Admin UI: assign first task from call outcomes
- Client UI: view task as an achievement card
- Notification: email plus link to ACHIEVERY dashboard

### 5.5 Follow-Up Automation
- Day 0: confirmation email and scheduling link
- Day 2: post-call summary and ACHIEVERY task link
- Day 7: progress check reminder from ACHIEVERY
- Day 14: tier conversion email with package CTA

### 5.6 Internal Dashboard Enhancements
- Lead pipeline: Discovery → In Progress → Converted → Dormant
- ACHIEVERY progress snapshot tied to each lead

---

## 6. UI/UX Flow
### Client Side
1. Submit Discovery Request → confirmation email in minutes
2. Schedule call → quick slot booking
3. Attend call → assigned ACHIEVERY task
4. Complete first achievement → immediate badge and progress shown
5. Receive follow-up → email reminders and dashboard link

### Strata Noble Side
1. Receive notification (Slack or email plus CRM entry)
2. Review lead tags (Stage, Challenge, Tier)
3. Host discovery call (CRM notes plus ACHIEVERY assignment)
4. Assign achievement (ACHIEVERY integration)
5. Monitor progress (CRM plus dashboard)

---

## 7. Acceptance Criteria
- [ ] New lead auto-logged into CRM within 1 minute of submission
- [ ] Auto-response email delivered under 5 minutes
- [ ] Scheduling link works and syncs to calendar
- [ ] CRM entry tagged with correct metadata
- [ ] Post-call ACHIEVERY task visible to client within 1 hour
- [ ] Follow-up sequence runs without manual intervention
- [ ] Internal dashboard shows ACHIEVERY status per client

---

## 8. Dependencies
- Q by Strata Noble CRM
- ACHIEVERY MVP
- Calendly or equivalent scheduling tool
- AWS SES for email delivery

---

## 9. KPIs
- Speed-to-Lead: average response under 5 minutes
- Call Conversion: 70% of form submissions to scheduled calls
- Achievement Completion: 60% complete first ACHIEVERY task
- Client Conversion: 30% of discovery calls to paying tier packages
- Pipeline Visibility: 100% of leads tracked in CRM

---

## 10. Risks and Mitigations
- Leads do not book calls → add SMS reminders and urgency copy
- ACHIEVERY tasks feel generic → prebuild task libraries by stage and challenge
- Follow-up fatigue → stagger reminders with value content

---

## 11. Timeline
- Week 1–2: CRM integration and auto-response email flow
- Week 3: Calendly embed and notifications
- Week 4: ACHIEVERY task assignment and client UI
- Week 5: Follow-up automation
- Week 6: Internal dashboard and QA
- Week 7: Launch and monitor KPIs

---

## 12. Visuals

### 12.1 Sales Cycle Overview (Swimlanes)
```mermaid
flowchart LR
  subgraph Lead
    A[Submit Discovery Form] --> B[Auto Email Received]
    B --> C[Book Call (Calendly)]
    C --> D[Attend Call]
    D --> E[Receive ACHIEVERY Task]
    E --> F[Complete First Achievement]
  end

  subgraph Strata_Noble
    A2[Lead Captured in Q CRM] --> B2[Slack/Email Alert]
    B2 --> C2[Calendar Updated]
    D2[Discovery Call Notes in CRM] --> E2[Assign ACHIEVERY Task]
    E2 --> F2[Follow-up Sequence Starts]
    F2 --> G2[Monitor ACHIEVERY Progress in CRM]
  end

  %% Cross-lane connections
  A -.webhook.-> A2
  B -.opens.-> C2
  D -.summary.-> D2
  E -.task link.-> F2
  F -.status sync.-> G2

12.2 Detailed Sequence
sequenceDiagram
  participant L as Lead
  participant W as Website Form
  participant Q as Q by Strata Noble (CRM)
  participant E as SES Email Service
  participant Cal as Scheduler
  participant S as Strata Noble
  participant A as ACHIEVERY

  L->>W: Submit discovery form
  W->>Q: Create Lead + tags
  Q-->>S: New lead alert
  Q->>E: Send personalized confirmation
  E-->>L: Confirmation with scheduling link
  L->>Cal: Book time slot
  Cal-->>S: Calendar event
  S->>L: Discovery call
  S->>Q: Notes and outcome
  S->>A: Create first achievement task
  A-->>L: Task assigned email + dashboard link
  A-->>Q: Task status sync
  Q->>E: Post-call summary email
  A-->>L: Day 7 reminder
  Q->>E: Day 14 tier conversion email

12.3 Pipeline Status Map
flowchart TD
  P0[New Lead] --> P1[Discovery Scheduled]
  P1 -->|No Show| P1A[Reschedule]
  P1 -->|Call Held| P2[ACHIEVERY Task Assigned]
  P2 -->|Completed| P3[Qualified Opportunity]
  P2 -->|Not Completed| P2A[Nurture Sequence]
  P3 -->|Selected Package| P4[Converted Client]
  P3 -->|Not Ready| P3A[Dormant with Quarterly Check]

