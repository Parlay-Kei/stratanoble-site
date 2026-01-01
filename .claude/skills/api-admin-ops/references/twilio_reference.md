# Twilio API Reference

## Authentication

```bash
# Basic Auth with Account SID + Auth Token
curl -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
  https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json

# Or API Key + Secret (preferred for production)
curl -u "$TWILIO_API_KEY:$TWILIO_API_SECRET" \
  https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json
```

## Base URLs

| Service | Base URL |
|---------|----------|
| Core API | `https://api.twilio.com/2010-04-01` |
| Messaging | `https://messaging.twilio.com/v1` |
| Verify | `https://verify.twilio.com/v2` |
| Conversations | `https://conversations.twilio.com/v1` |
| Studio | `https://studio.twilio.com/v2` |
| Lookups | `https://lookups.twilio.com/v2` |

## Phone Number Management

### Search Available Numbers
```bash
GET /Accounts/{AccountSid}/AvailablePhoneNumbers/{CountryCode}/Local.json
GET /Accounts/{AccountSid}/AvailablePhoneNumbers/{CountryCode}/TollFree.json
GET /Accounts/{AccountSid}/AvailablePhoneNumbers/{CountryCode}/Mobile.json

# Params: AreaCode, Contains, SmsEnabled, VoiceEnabled, MmsEnabled, InRegion, InPostalCode
```

### Purchase Number
```bash
POST /Accounts/{AccountSid}/IncomingPhoneNumbers.json
# Body: PhoneNumber=+1234567890

# With initial config:
# VoiceUrl, VoiceMethod, SmsUrl, SmsMethod, StatusCallback
```

### Update Number Configuration
```bash
POST /Accounts/{AccountSid}/IncomingPhoneNumbers/{PhoneNumberSid}.json

# Configurable fields:
FriendlyName      # Human-readable label
VoiceUrl          # Webhook for incoming calls
VoiceMethod       # GET or POST
VoiceFallbackUrl  # Backup if VoiceUrl fails
SmsUrl            # Webhook for incoming SMS
SmsMethod         # GET or POST
SmsFallbackUrl    # Backup if SmsUrl fails
StatusCallback    # URL for status updates
```

### Release Number
```bash
DELETE /Accounts/{AccountSid}/IncomingPhoneNumbers/{PhoneNumberSid}.json
# WARNING: Cannot be undone. Number returns to pool.
```

### List Owned Numbers
```bash
GET /Accounts/{AccountSid}/IncomingPhoneNumbers.json
# Params: PhoneNumber, FriendlyName, Beta (for beta features)
```

## Messages

### Send SMS/MMS
```bash
POST /Accounts/{AccountSid}/Messages.json

# Required:
To=+1234567890
From=+0987654321  # or MessagingServiceSid
Body=Hello

# Optional:
MediaUrl=https://...    # For MMS
StatusCallback=https://...
```

### List Messages
```bash
GET /Accounts/{AccountSid}/Messages.json

# Filter params:
To=+1234567890
From=+0987654321
DateSent>=2024-01-01
DateSent<=2024-01-31
Status=failed|delivered|sent|queued|undelivered
```

### Message Statuses
| Status | Meaning |
|--------|---------|
| `queued` | Waiting to be sent |
| `sending` | Being transmitted |
| `sent` | Delivered to carrier |
| `delivered` | Confirmed delivered to device |
| `undelivered` | Carrier rejected |
| `failed` | Could not be sent |

## Calls

### Make Outbound Call
```bash
POST /Accounts/{AccountSid}/Calls.json

To=+1234567890
From=+0987654321
Url=https://handler.example.com/voice  # TwiML endpoint

# Optional:
StatusCallback=https://...
StatusCallbackEvent=initiated,ringing,answered,completed
Timeout=30
Record=true
```

### List Calls
```bash
GET /Accounts/{AccountSid}/Calls.json

# Filter params:
To, From, Status, StartTime>=, StartTime<=, ParentCallSid
```

### Call Statuses
| Status | Meaning |
|--------|---------|
| `queued` | About to be dialed |
| `ringing` | Ringing |
| `in-progress` | Connected |
| `completed` | Finished successfully |
| `busy` | Busy signal |
| `no-answer` | Rang but no answer |
| `canceled` | Canceled before connect |
| `failed` | Could not be dialed |

## Messaging Services

### Create Service
```bash
POST /Services
# messaging.twilio.com/v1

FriendlyName=MyMessagingService
InboundRequestUrl=https://...
InboundMethod=POST
StatusCallback=https://...
```

### Add Number to Service
```bash
POST /Services/{ServiceSid}/PhoneNumbers

PhoneNumberSid=PNXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### List Service Numbers
```bash
GET /Services/{ServiceSid}/PhoneNumbers
```

## Verify Service

### Create Verification
```bash
POST /Services/{ServiceSid}/Verifications

To=+1234567890
Channel=sms|call|email|whatsapp
```

### Check Verification
```bash
POST /Services/{ServiceSid}/VerificationCheck

To=+1234567890
Code=123456
```

## Common Error Codes

| Code | Category | Meaning | Remediation |
|------|----------|---------|-------------|
| 20003 | auth | Invalid credentials | Verify SID/Token |
| 20404 | config | Resource not found | Check SID exists |
| 20429 | rate_limit | Too many requests | Implement backoff |
| 21211 | bad_params | Invalid To number | Validate E.164 format |
| 21408 | config | Missing permissions | Enable capability in Console |
| 21610 | spam_blocked | Recipient unsubscribed | Remove from list |
| 21611 | rate_limit | Message queue full | Slow down sends |
| 21614 | bad_params | Invalid From number | Use owned number |
| 30001 | carrier | Message queued too long | Retry or alternate carrier |
| 30003 | carrier | Unreachable destination | Verify number active |
| 30004 | spam_blocked | Message blocked | Modify content |
| 30005 | carrier | Unknown destination | Validate number |
| 30006 | carrier | Landline destination | Use voice instead |
| 30007 | carrier | Carrier violation | Review carrier rules |
| 30008 | carrier | Unknown error | Contact support |
| 30034 | spam_blocked | Messaging service violation | Review content/sender |

## Studio Flows

### List Flows
```bash
GET /Flows
# studio.twilio.com/v2
```

### Get Flow
```bash
GET /Flows/{FlowSid}
```

### Execute Flow
```bash
POST /Flows/{FlowSid}/Executions

To=+1234567890
From=+0987654321
Parameters={"key":"value"}  # JSON
```

## Webhook Validation

Verify incoming webhooks are from Twilio:

```python
from twilio.request_validator import RequestValidator

validator = RequestValidator(auth_token)
is_valid = validator.validate(
    url,           # Full URL including query params
    params,        # POST body params as dict
    signature      # X-Twilio-Signature header
)
```

## Pagination

All list endpoints support pagination:

```bash
GET /Messages.json?PageSize=50
# Response includes: next_page_uri, previous_page_uri

# Follow next_page_uri for more results
```

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Messages (standard) | 1 msg/sec per number |
| Messages (high-volume) | Varies by registration |
| API requests | 100/sec per account |

## Console-Only Settings

These require manual Console adjustment:
- A2P 10DLC registration
- Trust Hub brand registration
- Short code provisioning
- Phone number emergency address
- Messaging service compliance settings
- Account-level sending limits
