# Quote Automation Operations Skill
**Version**: 1.0  
**Last Updated**: December 13, 2025  
**Purpose**: Multi-carrier quote orchestration and pricing automation for DSLV

---

## Overview

This skill enables automated quote generation by orchestrating multiple carrier APIs, applying margin calculations, and generating customer-ready proposals.

### Core Capabilities
- Multi-carrier API orchestration (Lumen, AT&T, etc.)
- Parallel quote requests with aggregation
- Automated margin and pricing calculations
- Quote document generation
- Quote lifecycle management

---

## Quick Start

### Generate a Quote

**API:** `POST /api/carriers`

```typescript
const quoteRequest = {
  addresses: ['123 Main St, Las Vegas, NV 89101'],
  serviceTypes: ['internet', 'voip'],
  bandwidth: '100Mbps',
  term: '36_months',
  agentId: 'dslv-001'
};
```

---

## Carrier Status

| Carrier | Status | Rate Limit |
|---------|--------|------------|
| **Lumen** | ✅ Production | 300/min |
| **AT&T** | 🔄 Development | TBD |
| **Comcast** | 📋 Planned | TBD |

---

## Pricing & Margins

### Default Margins
- Small deals (< $500/mo): 30%
- Medium deals ($500-$2000): 25%
- Large deals ($2000-$5000): 20%
- Enterprise (> $5000): 15%

---

## Quote Lifecycle

```
pending → processing → completed → delivered → accepted/rejected/expired
```

---

## Related Skills
- `crm-ops` - Lead source for quotes
- `carrier-integration-ops` - Carrier API details
- `analytics-ops` - Quote metrics
