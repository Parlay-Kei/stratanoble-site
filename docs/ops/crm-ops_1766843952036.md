# CRM Operations Skill
**Version**: 1.0  
**Last Updated**: December 13, 2025  
**Purpose**: Lead management, qualification scoring, and sales pipeline operations for DSLV

---

## Overview

This skill enables comprehensive CRM operations including lead lifecycle management, automated qualification scoring, pipeline analytics, and sales team productivity tools.

### Core Capabilities
- Lead intake and assignment automation
- Qualification scoring (0-100 scale)
- Pipeline health monitoring
- Activity tracking and follow-up scheduling
- Duplicate detection and data quality
- Performance analytics and reporting

---

## Lead Management

### Creating Leads
**API Endpoint:** `POST /api/crm-leads`

### Querying Leads
**API Endpoint:** `GET /api/crm-leads`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (max: 100)
- `search` - Search by name, email, company
- `status` - Filter by status
- `qualification_status` - Filter by qualification
- `assigned_to` - Filter by agent UUID

---

## Qualification Scoring

### Score Breakdown (100 points)

| Component | Points | How to Score |
|-----------|--------|--------------|
| **Decision Maker** | 40 max | Confirmed DM: 40, Influences: 20 |
| **Pain Points** | 20 max | 5 points per pain point (max 4) |
| **Interest Level** | 20 max | High: 20, Medium: 10, Low: 5 |
| **Timeline** | 10 max | Immediate: 10, Quarter: 5 |
| **Contact Info** | 10 max | Email + phone: 10 |

### Score Interpretation

| Range | Classification | Action |
|-------|----------------|--------|
| 80-100 | 🔥 Hot | Immediate follow-up |
| 60-79 | 🌡️ Warm | 24hr follow-up |
| 40-59 | ❄️ Cold | Nurture sequence |
| 0-39 | ⛔ Unqualified | Archive |

---

## Pipeline Analytics

### Pipeline Stages
```
New → Contacted → Qualified → Proposal → Negotiation → Closed Won/Lost
```

### Key Queries

```sql
-- Pipeline by stage
SELECT status, COUNT(*), SUM(estimated_value)
FROM leads WHERE status NOT IN ('deleted')
GROUP BY status;

-- Stale leads needing follow-up
SELECT * FROM leads
WHERE qualification_status = 'hot'
AND updated_at < NOW() - INTERVAL '24 hours';
```

---

## Related Skills
- `cold-calling-ops` - Call execution and transcripts
- `quote-automation-ops` - Quote generation
- `analytics-ops` - Advanced reporting
