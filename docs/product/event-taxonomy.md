# Strata Noble Platform – Event Taxonomy

**Version:** 1.0
**Last Updated:** 2025‑08‑06
**Owner:** Analytics & Growth Guild
**Status:** Living Document
**Sprint:** Phase‑1 / S‑1 Deliverable

---

## 1 · Overview

This taxonomy standardises all analytics events across the **marketing site**, **diagnostic wizard**, **playbook execution**, and **checkout/engagement flows**. Consistent naming + property structures let us map the top‑of‑funnel (visit → lead → paid workshop) and product engagement (diagnostic → playbook success) without manual ETL.

---

## 2 · Naming Convention

**Pattern:** `{domain}_{action}_{object}`
*Same tri‑part structure as DSLV so dashboards & queries stay familiar.*

| Segment    | Description                                                                        | Examples                          |
| ---------- | ---------------------------------------------------------------------------------- | --------------------------------- |
| **Domain** | Logical area of the business (site, lead, diag, playbook, checkout, insight, user) | `lead`, `diag`, `playbook`        |
| **Action** | Past‑tense verb (opened, submitted, completed, failed)                             | `clicked`, `started`, `abandoned` |
| **Object** | Noun describing the target of action (cta, wizard, step, plan)                     | `cta`, `wizard`, `plan`           |

Example event names:

* `site_cta_clicked`
* `diag_wizard_completed`
* `playbook_step_completed`

---

## 3 · Core Event Categories & Definitions

### 3.1 Site & Lead Generation

| Event                 | Description                   | When Fired        | Core Props                 |
| --------------------- | ----------------------------- | ----------------- | -------------------------- |
| `site_page_view`      | Any route navigation          | App route change  | `page_path`, `referrer`    |
| `site_cta_clicked`    | Hero or inline CTA click      | Click             | `cta_id`, `cta_text`       |
| `lead_form_started`   | Newsletter/consult form focus | First input focus | `form_id`                  |
| `lead_form_submitted` | Lead form success             | API 200           | `lead_type`, `source_page` |
| `lead_form_error`     | Validation/API failure        | Error caught      | `error_type`, `field_name` |

### 3.2 Diagnostic Wizard

| Event                         | Description             | When Fired       | Props                           |
| ----------------------------- | ----------------------- | ---------------- | ------------------------------- |
| `diag_wizard_opened`          | Wizard modal/page opens | Dialog mount     | `entry_point`                   |
| `diag_step_entered`           | New step viewed         | Step change      | `step_number`                   |
| `diag_step_completed`         | Step validated          | Validation pass  | `step_number`, `time_spent_ms`  |
| `diag_step_validation_failed` | Client‑side fail        | Validation error | `step_number`, `error_fields[]` |
| `diag_wizard_completed`       | Full wizard success     | Roadmap created  | `roadmap_id`, `total_time_ms`   |
| `diag_wizard_abandoned`       | Closed before finish    | Unmount w/ <100% | `completion_pct`                |

### 3.3 Playbook Execution

| Event                     | Description      | When Fired      | Props                          |
| ------------------------- | ---------------- | --------------- | ------------------------------ |
| `playbook_plan_created`   | New play seeded  | API success     | `playbook_id`, `template_key`  |
| `playbook_step_completed` | Task marked done | Checkbox toggle | `task_id`, `playbook_id`       |
| `playbook_plan_completed` | All tasks done   | Cron/trigger    | `playbook_id`, `duration_days` |
| `playbook_plan_abandoned` | No activity ≥14d | Job flag        | `playbook_id`                  |

### 3.4 Checkout & Workshop Events

| Event                     | Description              | When Fired        | Props                            |
| ------------------------- | ------------------------ | ----------------- | -------------------------------- |
| `checkout_started`        | Stripe Checkout redirect | Redirect init     | `plan_id`, `amount_usd`          |
| `checkout_completed`      | Stripe webhook success   | Payment succeeded | `customer_id`, `subscription_id` |
| `checkout_failed`         | Payment failed/cancelled | Webhook fail      | `reason`, `customer_email`       |
| `workshop_session_booked` | Calendly slot booked     | API callback      | `event_type`, `price_tier`       |

### 3.5 Insight Engine & AI Queries

| Event                     | Description           | When Fired  | Props                          |
| ------------------------- | --------------------- | ----------- | ------------------------------ |
| `insight_query_sent`      | NLQ posted to backend | API call    | `prompt_length`, `user_id`     |
| `insight_query_completed` | LLM response success  | Stream done | `tokens`, `latency_ms`         |
| `insight_query_error`     | LLM error             | Catch       | `error_type`, `prompt_excerpt` |

### 3.6 User & Session

| Event             | Description           | Props                      |
| ----------------- | --------------------- | -------------------------- |
| `session_start`   | On first page hit     | `session_id`, `user_agent` |
| `user_identified` | JWT resolved or login | `user_id`, `auth_method`   |

### 3.7 Error & Performance (shared DSLV template)

Use `error_occurred`, `api_error`, `performance_metric`, etc., identical to DSLV for cross‑project alerting consistency.

---

## 4 · Standard Properties (attached to every event)

| Prop         | Type           | Example                         |
| ------------ | -------------- | ------------------------------- |
| `event_name` | string         | `site_cta_clicked`              |
| `timestamp`  | ISO 8601       | `2025‑08‑06T18:30:00Z`          |
| `session_id` | string         | `sess_1691365800_ab12`          |
| `user_id`    | string \| null | `user_f7c9`                     |
| `page_url`   | string         | `https://stratanoble.com/#hero` |
| `referrer`   | string         | `https://twitter.com/`          |
| `user_agent` | string         | …                               |

---

## 5 · Data Governance & Privacy

* **Collect:** Name, email, company (with consent).
* **Mask:** IP after 30 days.
* **Never Collect:** Payment card numbers (Stripe handles), sensitive PII.
* **GDPR/CCPA:** Supported via Supabase RLS delete + BigQuery delete jobs.
* **Retention:** Raw events 2 yrs; aggregates 7 yrs.

---

## 6 · Sprint S‑1 Coverage Target

Goal: ≥ 60 % coverage for **Site → Diagnostic → Checkout** journey.

| Flow                   | Target Coverage | Notes                                |
| ---------------------- | --------------- | ------------------------------------ |
| Site Hero → CTA → Lead | 100 %           | Baseline for marketing campaigns     |
| Diagnostic Wizard      | ≥ 90 %          | All step events & error states       |
| Checkout / Stripe      | ≥ 80 %          | Start, success, fail, SES receipt    |
| Playbook (MVP)         | 40 %            | Only plan\_created & step\_completed |
| Insight Engine         | 0 %             | Out‑of‑scope Phase 1                 |

Running **coverage script** prints missing events; fails CI if <60 %.

---

## 7 · Phase 1 Success Metrics

* **Daily Events:** 1 k–3 k
* **Error Event Ratio:** < 5 %
* **Event Latency (FE → Supabase):** < 120 ms p95
* **Schema Compliance:** ≥ 98 %

---

## 8 · Future Phases

* **S‑2:** Add Playbook depth & AI Insight events
* **S‑3:** On‑page A/B experiment events (`experiment_viewed`, `variant_assigned`)
* **S‑4:** Community‑interaction events once platform beta launches

---

*This taxonomy lives in `docs/product/event‑taxonomy.md` and must be updated via PR whenever new events or properties are introduced.*

**Next Scheduled Review:** S‑2 End (20 Sep 2025) – Include Playbook v1 events

---

**Document Owner:** Analytics & Growth Guild
**Reviewers:** Engineering Lead, Product Owner