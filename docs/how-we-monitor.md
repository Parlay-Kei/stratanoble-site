# How We Monitor

**Purpose**  
Detect problems fast, route actionable alerts, and keep a clean trail for fixes.

**Scope & Tools**
- **Uptime Kuma**: uptime/latency checks + status page  
- **Sentry (cloud, free)**: app errors + performance traces  
- **ntfy**: push alerts to desktop/mobile  
- **Node-RED**: light routing/formatting of alerts  
- **Runbooks**: docs/runbooks/* (postmortems, rollback steps)

## What we monitor
- **Public site:** GET `/`, expect 200 < 1500ms
- **API health:** GET `/healthz`, expect 200 with `ok:true`
- **Critical webhooks:** Stripe, email, analytics collectors
- **Background jobs:** heartbeat via Healthchecks or Node-RED timer

## SLOs (review monthly)
- Uptime ≥ **99.9%**
- p95 page load ≤ **1.2s**
- API error rate (5-min window) < **0.1%**

## Alert routing
- **DOWN or 5xx spike:** ntfy `alerts-critical` (priority 5) + Slack `#ops`
- **RECOVERED:** ntfy `alerts-prod` (priority 3)
- **Non-critical (warn):** daily digest only

## On-call (lightweight)
- During business hours, the person shipping the current sprint is on point.
- Acknowledge within **5 min**; start a Slack thread with: issue, impact, ETA.

## Incident flow (Sev-2 or higher)
1) Acknowledge in Slack thread and ntfy checkmark  
2) Create an **Incident** ticket with timestamps  
3) Follow the relevant **runbook**; post updates in the thread  
4) Within 24h, file a **Postmortem** using `docs/runbooks/incident-template.md`

## Weekly routine
- Prune noisy monitors, review Sentry top issues, confirm status page is accurate.
- Verify alert test: send a fake DOWN → confirm ntfy + Slack fire.

## Monthly drill
- Simulate a common failure (e.g., API returns 500s) and record TTD/TTR.
