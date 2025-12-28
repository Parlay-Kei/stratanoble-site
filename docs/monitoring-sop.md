
# Monitoring SOP

**Objective:** Detect issues early and route actionable alerts to the right place with minimal noise.

## Components

- **Uptime Kuma:** HTTP/TCP/keyword checks and public status page.
- **ntfy:** Simple push notifications to desktop/mobile via topics.
- **Sentry (cloud, free):** Error & performance tracing from the app.
- **(Optional) Grafana Cloud (free):** Logs/traces in one console.

## Setup Steps

1. **Uptime Kuma**
   - Add monitors for: public site(s), API health, critical webhooks.
   - Configure notification channels (ntfy email/webhook, Slack, etc.).
   - Enable the status page and share with stakeholders.

2. **Sentry**
   - Create a project and drop the DSN into your Next.js app.
   - Enable performance sampling (start low, e.g., 10%).

3. **ntfy**
   - Choose a topic naming convention: `alerts.prod.*`, `alerts.stage.*`.
   - Subscribe on desktop/mobile; test with a curl POST.

4. **Alert Routing**
   - “Error spike” → Slack `#ops` + ntfy push.
   - “Outage” → ntfy high-priority + on-call.
   - “Non-critical” → daily digests only.

## SLOs

- **API error rate** < 0.1 % (5-min window)
- **p95 page load** ≤ 1.2 s (core pages)
- **Uptime** ≥ 99.9 % monthly

## Review Cadence

- Weekly: review incidents, prune noisy alerts.
- Monthly: drill a failure scenario and log TTD/TTR.
