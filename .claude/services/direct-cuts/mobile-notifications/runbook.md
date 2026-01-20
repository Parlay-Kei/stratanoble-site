# Mobile Notifications Service

**Type**: Service (V12)
**Operator**: Direct Cuts GM

---

## Purpose

Push, SMS, email notification delivery.

## Channels

| Channel | Provider | Use Case |
|---------|----------|----------|
| Push | FCM/APNS | App users |
| SMS | Twilio | Time-sensitive |
| Email | Sendgrid | Non-urgent |

## Notification Types

| Type | Channel | Template |
|------|---------|----------|
| Booking confirmed | Push + Email | booking_confirmed |
| Barber arriving | Push + SMS | barber_eta |
| Payment received | Push + Email | payment_receipt |
| Review request | Push | review_request |

## Send API

```bash
POST /api/notifications/send
{
  "user_id": "...",
  "template": "booking_confirmed",
  "channel": ["push", "email"],
  "data": { ... }
}
```

## Template Variables

```
{{customer_name}}
{{barber_name}}
{{booking_time}}
{{amount}}
```

## Delivery Tracking

| Status | Meaning |
|--------|---------|
| queued | In queue |
| sent | Delivered to provider |
| delivered | Confirmed receipt |
| failed | Delivery failed |
| clicked | User engaged |

## Rate Limits

| Channel | Limit |
|---------|-------|
| Push | 100/min per user |
| SMS | 10/day per user |
| Email | 50/day per user |

## Opt-Out Handling

```
1. User requests opt-out
2. Update preferences
3. Honor across all channels
4. Confirm to user
```

## Incidents

| Issue | Resolution |
|-------|------------|
| Delivery failures | Check provider status |
| Spam complaints | Review frequency |
| Template errors | Fix and resend |
