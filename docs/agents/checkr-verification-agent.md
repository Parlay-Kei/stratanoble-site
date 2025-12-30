# Checkr Verification Agent

## SECURITY (MANDATORY)
Follow: docs/agents/SECURITY_SECRETS_HANDLING.md

- Never ask for or accept secrets in chat
- Provide single-command env var instructions only
- Never write PATs to files or logs
- After use, instruct user to DELETE the PAT (revoke)
- Assume any disclosed token is compromised

---


## Purpose
Handles automated background check processing for barber onboarding via Checkr API integration.

## Capabilities
- Submit background check requests to Checkr API
- Process webhook callbacks for check status updates
- Update barber verification status in database
- Trigger notifications on check completion
- Manage manual review queue for edge cases

## Configuration

### Environment Variables
```env
CHECKR_API_KEY=your_checkr_api_key
CHECKR_WEBHOOK_SECRET=your_webhook_secret
CHECKR_PACKAGE_ID=standard_criminal  # or custom package
```

### Database Tables
```sql
-- Background checks tracking
CREATE TABLE IF NOT EXISTS background_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  checkr_candidate_id TEXT,
  checkr_report_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'passed', 'failed', 'manual_review', 'expired')),
  package_type TEXT DEFAULT 'standard_criminal',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  result_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_background_checks_barber ON background_checks(barber_id);
CREATE INDEX idx_background_checks_status ON background_checks(status);
```

## Edge Function: handle-background-check

### Endpoint
`POST /functions/v1/handle-background-check`

### Actions

#### Submit Check
```typescript
// Request
{
  "action": "submit",
  "barberId": "uuid",
  "candidateData": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "dob": "1990-01-15",
    "ssn": "xxx-xx-xxxx",
    "driver_license": {
      "number": "D1234567",
      "state": "NV"
    },
    "address": {
      "street": "123 Main St",
      "city": "Las Vegas",
      "state": "NV",
      "zipcode": "89101"
    }
  }
}

// Response
{
  "success": true,
  "checkId": "uuid",
  "checkrCandidateId": "abc123",
  "estimatedCompletion": "2-3 business days"
}
```

#### Webhook Handler
```typescript
// Checkr sends webhook to: /functions/v1/checkr-webhook
// Events: report.completed, report.upgraded, candidate.created

{
  "type": "report.completed",
  "data": {
    "object": {
      "id": "report_xxx",
      "status": "clear",
      "candidate_id": "candidate_xxx",
      "package": "standard_criminal",
      "completed_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Check Status
```typescript
// Request
{
  "action": "status",
  "barberId": "uuid"
}

// Response
{
  "status": "passed",
  "completedAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2025-01-15T10:30:00Z"
}
```

## Workflow

```
1. Barber completes Step 1 (profile) → Step 2 triggered
2. Agent submits candidate to Checkr API
3. Checkr processes (1-3 days typically)
4. Webhook received → Agent updates status
5. If passed → Unlock Step 3 (training)
6. If failed/flagged → Route to manual_review queue
7. Admin reviews → Approve/Deny
8. Notification sent to barber
```

## Status Flow
```
pending → processing → passed/failed/manual_review
                           ↓
                    (admin action)
                           ↓
                    approved/denied
```

## Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| Check submitted | Barber | Push, Email |
| Check passed | Barber | Push, Email |
| Check failed | Barber, Admin | Email |
| Manual review needed | Admin | Email, Dashboard |
| Check expiring (30 days) | Barber | Push, Email |

## Security
- SSN encrypted at rest, never logged
- Checkr webhook signature verification required
- Rate limit: 10 submissions per barber per year
- Auto-expire checks after 12 months

## CLI Commands
```bash
# Submit check manually
npm run agent:checkr submit --barber-id=xxx

# Check status
npm run agent:checkr status --barber-id=xxx

# List pending reviews
npm run agent:checkr list-reviews

# Approve manual review
npm run agent:checkr approve --check-id=xxx
```

## Integration Points
- Barber onboarding wizard (Step 2)
- Admin dashboard (review queue)
- Notification service
- Barber profile (verification badge)
