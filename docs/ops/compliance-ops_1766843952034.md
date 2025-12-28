# Compliance Operations Skill
**Version**: 1.0  
**Last Updated**: December 13, 2025  
**Purpose**: TCPA/DNC compliance and data privacy for DSLV cold calling

---

## Overview

This skill ensures 100% compliance with telecommunications regulations (TCPA, TSR) and data privacy requirements. Zero tolerance for violations.

### Core Capabilities
- Real-time DNC list management
- TCPA call time enforcement
- Consent tracking and verification
- Data privacy request handling (CCPA/GDPR)
- Compliance audit and reporting

---

## DNC Management

### Check Before Calling

```typescript
import { checkDNC } from '@/lib/calling/dnc-checker';

const result = await checkDNC('+17025551234');
if (!result.allowed) {
  // Do not call - blocked by DNC
}
```

### DNC Sources
- Internal DNC (real-time)
- National Registry (monthly sync)
- State Registries
- Litigation List

---

## TCPA Compliance

### Call Time Restrictions
- Weekday: 8 AM - 9 PM local time
- Saturday: 9 AM - 6 PM local time
- Sunday: No calls
- Federal holidays: No calls

### Caller ID
- Must display valid, callable number
- Never block or spoof

### Abandonment Rate
- TCPA Limit: < 3%
- Our Target: < 2%

---

## Consent Management

| Type | Required For |
|------|--------------|
| Express Written | Autodialed calls |
| Express Oral | Live agent calls |
| Implied | Existing customers |

---

## Data Privacy (CCPA/GDPR)

### Subject Rights
- Access: 45 days
- Deletion: 45 days
- Correction: 45 days
- Opt-out: Immediate

---

## Opt-Out Detection

Trigger phrases Angela listens for:
- "Take me off your list"
- "Don't call me"
- "Not interested"

Auto-response: End call + Add to DNC

---

## Monitoring

### Key Metrics

| Metric | Target |
|--------|--------|
| DNC Violations | 0 |
| Time Violations | 0 |
| Abandonment Rate | < 2% |
| Consent Coverage | 100% |

---

## Related Skills
- `cold-calling-ops` - DNC integration
- `crm-ops` - Lead consent status
- `analytics-ops` - Compliance metrics
