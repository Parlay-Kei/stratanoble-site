# Analytics Operations Skill
**Version**: 1.0  
**Last Updated**: December 13, 2025  
**Purpose**: Business intelligence, reporting, and KPI tracking for DSLV

---

## Overview

This skill enables comprehensive analytics including real-time dashboards, automated reporting, and forecasting.

### Core Capabilities
- Real-time KPI dashboards
- Automated daily/weekly/monthly reports
- Revenue forecasting
- Conversion funnel analysis
- Agent performance tracking

---

## Key Metrics

### Sales KPIs

| Metric | Target |
|--------|--------|
| Connect Rate | > 40% |
| Qualification Rate | > 50% |
| Quote Rate | > 70% |
| Close Rate | > 20% |

### Revenue KPIs

| Metric | Target |
|--------|--------|
| MRR Growth | 10%/mo |
| Pipeline Value | $500K+ |
| CAC | < $200 |
| LTV:CAC | > 3:1 |

---

## Dashboard Access

**URL:** `/admin/analytics`  
**API:** `GET /api/admin-analytics`

---

## Key Queries

### Conversion Funnel
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'contacted') as contacted,
  COUNT(*) FILTER (WHERE status = 'qualified') as qualified,
  COUNT(*) FILTER (WHERE status = 'closed_won') as won
FROM leads WHERE created_at >= NOW() - INTERVAL '30 days';
```

### Call Performance
```sql
SELECT 
  DATE(completed_at) as date,
  COUNT(*) as calls,
  AVG(duration_seconds) as avg_duration
FROM call_logs
WHERE completed_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(completed_at);
```

---

## Forecasting

```typescript
function calculateCallsForTarget(targetMRR) {
  const dealsNeeded = targetMRR / 500; // $500 avg deal
  const callsNeeded = dealsNeeded / 0.20 / 0.70 / 0.50 / 0.40;
  return Math.ceil(callsNeeded);
}
```

---

## Related Skills
- `crm-ops` - Lead and pipeline data
- `cold-calling-ops` - Call performance data
- `quote-automation-ops` - Quote metrics
