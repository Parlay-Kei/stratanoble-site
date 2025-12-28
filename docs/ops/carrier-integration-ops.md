# Carrier Integration Operations Skill
**Version**: 1.0  
**Last Updated**: December 13, 2025  
**Purpose**: Multi-carrier API management and integration for DSLV

---

## Overview

This skill manages integrations with telecommunications carriers, ensuring reliable API connectivity for quote retrieval and order submission.

### Core Capabilities
- Carrier API health monitoring
- Authentication and token management
- Rate limiting and retry logic
- Data normalization across carriers
- Order status tracking

---

## Carrier Status

| Carrier | Status | Rate Limit |
|---------|--------|------------|
| **Lumen** | ✅ Production | 300/min |
| **AT&T** | 🔄 Development | TBD |
| **Comcast** | 📋 Planned | TBD |
| **Verizon** | 📋 Planned | TBD |

---

## Lumen API

### Get Quotes

```typescript
import { lumenAdapter } from '@/lib/carriers/lumen-adapter';

const quotes = await lumenAdapter.getQuotes({
  addresses: ['123 Main St, Las Vegas, NV 89101'],
  serviceTypes: ['fiber'],
  bandwidth: '100Mbps',
  term: '36_months',
  agentId: 'dslv-001'
});
```

### Submit Order

```typescript
const order = await lumenAdapter.submitOrder({
  quoteId: 'lumen_quote_12345',
  customerInfo: {
    companyName: 'Acme Corp',
    contactName: 'John Smith',
    email: 'john@acme.com',
    phone: '+17025551234',
    address: '123 Main St, Las Vegas, NV 89101'
  },
  serviceDetails: {
    serviceType: 'fiber',
    bandwidth: '100Mbps',
    term: '36_months'
  },
  agentId: 'dslv-001'
});
```

### Check Health

```typescript
const health = await lumenAdapter.testConnection();
// { success: true, latency: 450, capabilities: ['quotes', 'orders'] }
```

---

## Multi-Carrier Orchestration

### Request Quotes from All Carriers

**API:** `POST /api/carriers`

```typescript
const response = await fetch('/api/carriers', {
  method: 'POST',
  body: JSON.stringify({
    addresses: ['123 Main St, Las Vegas, NV 89101'],
    serviceTypes: ['internet'],
    bandwidth: '100Mbps',
    agentId: 'dslv-001'
  })
});
```

### Check All Carrier Health

**API:** `GET /api/carriers`

---

## Error Handling

### Retry Strategy
- Max retries: 3
- Backoff: Exponential (1s, 2s, 4s)
- Retryable: TIMEOUT, RATE_LIMITED, SERVICE_UNAVAILABLE

### Common Errors

| Error | Action |
|-------|--------|
| TIMEOUT | Retry with backoff |
| RATE_LIMITED | Wait and retry |
| AUTH_FAILED | Refresh token |
| NOT_SERVICEABLE | Return to user |

---

## Configuration

### Environment Variables

```bash
LUMEN_CLIENT_ID=dslv_production_client
LUMEN_CLIENT_SECRET=your_secret
LUMEN_API_BASE_URL=https://api.lumen.com/v1
LUMEN_TIMEOUT_MS=5000
LUMEN_MAX_RETRIES=3
```

---

## Monitoring

| Metric | Target | Alert |
|--------|--------|-------|
| API Uptime | > 99.9% | < 99% |
| Response Time | < 2s | > 5s |
| Success Rate | > 95% | < 90% |

---

## Related Skills
- `quote-automation-ops` - Uses carrier APIs for pricing
- `deployment-ops` - Carrier API deployments
- `monitoring-ops` - Carrier health tracking
