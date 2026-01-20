# Ops Monitoring Service

**Type**: Service (V5)
**Operator**: Platform Ops Lead

---

## Purpose

Monitoring, alerts, heartbeat.

## Monitoring Stack

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Frontend performance |
| Sentry | Error tracking |
| Supabase Dashboard | Database metrics |
| Uptime Robot | Availability |

## Key Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Uptime | 99.9% | <99.5% |
| Error rate | <1% | >1% |
| P95 latency | <500ms | >1000ms |
| Apdex | >0.9 | <0.8 |

## Alert Channels

| Severity | Channel |
|----------|---------|
| Critical | Slack + SMS + Email |
| High | Slack + Email |
| Medium | Slack |
| Low | Email digest |

## Health Checks

| Endpoint | Interval | Timeout |
|----------|----------|---------|
| /api/health | 1 min | 10s |
| /api/db-health | 5 min | 30s |

## Alert Response

### P0 (Critical)
```
1. Acknowledge within 5 min
2. Assess impact
3. Communicate status
4. Fix or rollback
5. Post-mortem
```

### P1 (High)
```
1. Acknowledge within 15 min
2. Investigate
3. Communicate if customer impact
4. Fix within 4 hours
```

## Dashboard URLs

- Vercel: [URL]
- Sentry: [URL]
- Supabase: [URL]
- Uptime: [URL]

## Incidents

| Issue | Resolution |
|-------|------------|
| Alert fatigue | Tune thresholds |
| Missing alerts | Add monitoring |
| False positives | Adjust sensitivity |
