# Error Classification Schema

Unified error classification across all supported APIs.

## Category Definitions

| Category | Description | Severity Default | Auto-Fix Eligible |
|----------|-------------|------------------|-------------------|
| `auth` | Authentication/authorization failures | critical | ❌ Never |
| `config` | Misconfigured resources or settings | critical | ✓ With approval |
| `rate_limit` | Request throttling or quotas | warning | ✓ Auto-backoff |
| `carrier` | Carrier/network delivery issues (Twilio) | warning | ❌ |
| `spam_blocked` | Content filtering or spam detection | warning | ❌ |
| `bad_params` | Invalid request parameters | info | ✓ Obvious fixes |
| `transient` | Temporary server/network issues | info | ✓ Auto-retry |

## Twilio Error Mapping

### Auth Category (critical)
| Code | Description |
|------|-------------|
| 20003 | Invalid credentials |
| 20005 | Account not active |
| 20403 | Permission denied |

### Config Category (critical)
| Code | Description |
|------|-------------|
| 11200 | HTTP retrieval failure (webhook unreachable) |
| 11205 | HTTP connection failure |
| 11206 | Invalid protocol (webhook URL) |
| 11210 | HTTP bad host (webhook) |
| 11750 | TwiML document empty |
| 20404 | Resource not found |
| 21408 | Permissions not enabled |
| 21452 | Geo permissions required |

### Rate Limit Category (warning)
| Code | Description |
|------|-------------|
| 20429 | Too many requests |
| 21611 | Message queue full |
| 31206 | Call queue full |

### Carrier Category (warning)
| Code | Description |
|------|-------------|
| 30001 | Queue timeout |
| 30003 | Unreachable destination |
| 30005 | Unknown destination |
| 30006 | Landline SMS attempt |
| 30007 | Carrier violation |
| 30008 | Unknown carrier error |
| 30009 | Missing inbound action |
| 30010 | Unknown message error |

### Spam/Blocked Category (warning)
| Code | Description |
|------|-------------|
| 21610 | Recipient unsubscribed |
| 30004 | Message blocked |
| 30034 | Messaging service violation |
| 63038 | Message flagged as spam |

### Bad Params Category (info)
| Code | Description |
|------|-------------|
| 21201 | No To number specified |
| 21211 | Invalid To number |
| 21212 | Invalid From number |
| 21214 | Invalid To number (length) |
| 21401 | Invalid phone number |
| 21602 | Message body empty |
| 21617 | Message body too long |

## OpenAI Error Mapping

### Auth Category (critical)
| HTTP | Type | Description |
|------|------|-------------|
| 401 | authentication_error | Invalid API key |
| 403 | permission_error | No access to resource |

### Config Category (critical)
| HTTP | Type | Description |
|------|------|-------------|
| 404 | not_found_error | Model or resource not found |

### Rate Limit Category (warning)
| HTTP | Type | Description |
|------|------|-------------|
| 429 | rate_limit_error | Rate limit exceeded |
| 429 | tokens_exceeded | Token limit exceeded |
| 429 | requests_exceeded | Request limit exceeded |

### Bad Params Category (info)
| HTTP | Type | Description |
|------|------|-------------|
| 400 | invalid_request_error | Malformed request |
| 400 | context_length_exceeded | Too many tokens |

### Transient Category (info)
| HTTP | Type | Description |
|------|------|-------------|
| 500 | server_error | Internal server error |
| 503 | service_unavailable | Service overloaded |
| 502 | bad_gateway | Gateway error |

## Stripe Error Mapping

### Auth Category (critical)
| Code | Description |
|------|-------------|
| authentication_error | Invalid API key |
| api_key_expired | Key expired |
| account_invalid | Account issue |

### Config Category (critical)
| Code | Description |
|------|-------------|
| resource_missing | Resource not found |
| webhook_inactive | Webhook disabled |

### Rate Limit Category (warning)
| Code | Description |
|------|-------------|
| rate_limit | Too many requests |
| lock_timeout | Concurrent update conflict |

### Bad Params Category (info)
| Code | Description |
|------|-------------|
| invalid_request_error | Missing/invalid param |
| parameter_missing | Required param missing |
| parameter_invalid | Invalid param value |
| idempotency_error | Idempotency key conflict |

### Transient Category (info)
| Code | Description |
|------|-------------|
| api_error | Internal API error |
| card_error | Card declined (various) |

## Severity Guidelines

### Critical (Immediate Attention)
- System cannot function
- Security implications
- Revenue-blocking issues
- Examples: auth failures, webhook completely broken

### Warning (Monitor Closely)
- Degraded functionality
- Partial failures
- Approaching limits
- Examples: rate limits, carrier blocks, spam filtering

### Info (Track & Analyze)
- User input errors
- Transient issues that resolved
- Non-blocking problems
- Examples: invalid params, retried successfully

## Auto-Remediation Rules

### Always Safe to Auto-Fix
```yaml
rate_limit:
  - Implement exponential backoff
  - Queue and retry later
  - Log for pattern analysis

transient:
  - Retry with backoff (max 3)
  - Log occurrence
```

### Fix with Confirmation
```yaml
config:
  - Webhook URL corrections (show diff first)
  - Missing capability enablement
  - Resource configuration updates
```

### Never Auto-Fix
```yaml
auth:
  - Credential issues require human verification
  
purchases:
  - Phone numbers, subscriptions, etc.
  
deletions:
  - Any destructive operation
```

## Incident Log Schema

```json
{
  "id": "inc_uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "twilio|openai|stripe",
  "error_code": "21211",
  "error_message": "Invalid To phone number",
  "category": "bad_params",
  "severity": "info",
  "resource_type": "message",
  "resource_id": "SMxxx",
  "context": {
    "to": "+1invalid",
    "from": "+12025551234",
    "body_preview": "Hello..."
  },
  "action_taken": "none|logged|auto_fixed|escalated",
  "action_details": "Logged for pattern analysis",
  "resolved": true,
  "resolution_timestamp": "2024-01-15T10:30:01Z"
}
```

## Aggregation Queries

### Top Errors by Frequency
```sql
SELECT error_code, category, COUNT(*) as count
FROM incident_log
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY error_code, category
ORDER BY count DESC
LIMIT 20
```

### Critical Issues (Unresolved)
```sql
SELECT *
FROM incident_log
WHERE severity = 'critical'
  AND resolved = false
ORDER BY timestamp DESC
```

### Error Trends (Daily)
```sql
SELECT DATE(timestamp) as day,
       category,
       COUNT(*) as count
FROM incident_log
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY day, category
ORDER BY day DESC, count DESC
```
