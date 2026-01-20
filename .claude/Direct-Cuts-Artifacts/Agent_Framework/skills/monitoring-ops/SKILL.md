# Monitoring Operations Skill

**Purpose:** Real-time monitoring and alerting for production systems  
**Version:** 1.0.0

---

## What This Skill Does

- **Real-time Monitoring:** Track system health 24/7
- **Alerting:** Intelligent alerts for issues
- **Metrics Collection:** Aggregate performance data
- **Dashboards:** Visual monitoring interfaces
- **Incident Detection:** Automatic issue identification

---

## Key Capabilities

### Monitor System Health
```typescript
const health = await monitorSystemHealth();
// Returns real-time health scores for all components
```

### Track Call Metrics
```typescript
const metrics = await trackCallMetrics();
// Returns success rates, durations, error counts
```

### Set up Alerts
```typescript
await setupAlert({
  metric: 'callSuccessRate',
  threshold: 90,
  action: 'escalate'
});
```

---

## Quick Reference

```bash
ops-cli monitor start       # Start monitoring
ops-cli monitor dashboard   # View dashboard
ops-cli monitor alerts      # View alerts
ops-cli monitor metrics     # View metrics
```

---

**Last Updated:** 2025-11-06
