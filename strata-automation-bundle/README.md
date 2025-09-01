
# Strata Noble – $0 Automation Bundle (Core)

This bundle ships a lean, self-hosted core to jumpstart internal automations and ops:

- **Node-RED** – flow-based automation and integrations
- **Uptime Kuma** – uptime checks + status page
- **ntfy** – push notifications to desktop/mobile via simple HTTP
- **DocuSeal** – open-source e-signature

> PostHog (product analytics/feature flags) and Zulip (team chat) are **recommended via their free cloud tiers** to keep your server light. You can add self-hosting later with separate compose files if needed.

---

## Quickstart

1. **Clone this folder into a repo**, copy `.env.example` → `.env` and adjust values.
2. Ensure you have **Docker** and **Docker Compose** installed.
3. From this directory, run:

```bash
docker compose --profile core up -d
```

4. Open the services:

- Node-RED: http://localhost:1880
- Uptime Kuma: http://localhost:3001
- ntfy (web): http://localhost:2586
- DocuSeal: http://localhost:3002

> Replace `localhost` with your server IP/hostname if deploying on a remote machine.

---

## Minimal hardening checklist (local → internet)

- Set strong passwords on each service (Node-RED admin auth, DocuSeal secret).
- Put the stack behind a reverse proxy (Caddy/Traefik) with HTTPS certificates.
- For **ntfy**, disable anonymous access or restrict topics to authenticated users.
- Create firewall rules: only expose ports you intend to use publicly.
- Backups: snapshot `./data/**` regularly (bind mounts make this trivial).

---

## Suggested first flows

### 1) Status & incident alerts
- Add your public app endpoints to **Uptime Kuma**.
- Configure **ntfy** as an alert channel (email/push/webhook supported).
- Add a Node-RED flow to forward Sentry/Supabase events to ntfy or Slack.

### 2) Lead → proposal → sign
- Node-RED listens for new lead (webhook/form).
- Generates proposal from a template (Notion/Drive).
- Sends for signature via **DocuSeal**.
- On completion: store PDF in Drive/S3 and notify.

---

## PostHog & Zulip (cloud-first)

- **PostHog Cloud (free)**: add the script key to your app for analytics, session replay, and feature flags.
- **Zulip Cloud (free)**: create an org for threaded team chat without heavy hosting.

---

## Self-hosting PostHog/Zulip later

- They require multiple containers (databases, caches, etc.) and 4–8 GB RAM.
- Add them in separate compose files when you’re ready, or stay on the cloud tiers.

---

## Docs Site (MkDocs Material)

This repo includes a ready-to-publish documentation site under `docs/` with a **Monitoring SOP** and an **Incident Postmortem template**. Pushing to `main` will auto-deploy to GitHub Pages (see `.github/workflows/docs.yml`).

### Local preview

```bash
pip install mkdocs mkdocs-material
mkdocs serve
# then open http://127.0.0.1:8000
```

---

## Troubleshooting

- **Ports already in use**: change the left side of the `ports:` bindings in `docker-compose.yml`.
- **Permissions on data folders**: ensure your Docker user can write to `./data/**`.
- **DocuSeal host mismatch**: set `DOCUSEAL_HOST` to the exact public URL when using a proxy/domain.
