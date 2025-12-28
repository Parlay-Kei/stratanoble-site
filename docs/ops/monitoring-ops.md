# Monitoring Operations Skill
**Version**: 1.0
**Last Updated**: November 21, 2025
**Purpose**: Guide to monitoring system health, logs, and alerts.

---

## Dashboards

### Vercel
- **Usage**: Bandwidth, Function Invocations.
- **Logs**: Real-time logs for API routes and frontend.
- **Analytics**: Web vitals (LCP, FID, CLS).

### Supabase
- **Database**: CPU, RAM, Disk IO.
- **Auth**: User sign-ups, active sessions.
- **API**: Request counts, errors.

### Twilio
- **Voice**: Call logs, recordings, error codes (e.g., 11200).
- **Debugger**: Real-time alert feed for webhook failures.

---

## Health Checks

### Endpoints
- `/api/health`: Returns system status (DB connection, Redis, etc.).
- `/api/voice/health`: Checks OpenAI/Twilio connectivity.

### Alerts
- **Sentry** (if configured): Error tracking.
- **Uptime Robot**: External ping to `https://datasolutionslv.com`.

---

## Incident Response

### Severity Levels
- **Sev1 (Critical)**: Voice AI down, Site 500s. -> Page On-Call.
- **Sev2 (Major)**: Feature broken (e.g., Quotes). -> Fix within 4h.
- **Sev3 (Minor)**: UI glitch, slow perf. -> Fix next sprint.

### Debugging Steps
1. Check Vercel Logs for recent errors.
2. Verify Database connectivity.
3. Check External Status Pages (OpenAI, Twilio, Supabase).
