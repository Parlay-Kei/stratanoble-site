# Stripe API Reference

## Authentication

```bash
curl https://api.stripe.com/v1/charges \
  -u "$STRIPE_SECRET_KEY:"

# The colon after the key is required (empty password in basic auth)
```

### Key Types
| Key Prefix | Type | Use |
|------------|------|-----|
| `sk_live_` | Secret (Live) | Production API calls |
| `sk_test_` | Secret (Test) | Testing |
| `pk_live_` | Publishable (Live) | Client-side (Stripe.js) |
| `pk_test_` | Publishable (Test) | Client-side testing |
| `rk_live_` | Restricted | Limited permissions |
| `whsec_` | Webhook Secret | Verify webhook signatures |

## Base URL

`https://api.stripe.com/v1`

## Charges & Payments

### Create PaymentIntent
```bash
POST /payment_intents

amount=1000              # in cents
currency=usd
payment_method_types[]=card
customer=cus_xxx         # optional
description=Order 123    # optional
```

### Confirm PaymentIntent
```bash
POST /payment_intents/{id}/confirm

payment_method=pm_xxx
```

### Retrieve PaymentIntent
```bash
GET /payment_intents/{id}
```

### PaymentIntent Statuses
| Status | Meaning |
|--------|---------|
| `requires_payment_method` | Needs payment method |
| `requires_confirmation` | Ready to confirm |
| `requires_action` | Needs 3DS or action |
| `processing` | Being processed |
| `succeeded` | Payment complete |
| `canceled` | Canceled |
| `requires_capture` | Authorized, needs capture |

## Customers

### Create Customer
```bash
POST /customers

email=user@example.com
name=John Doe
description=Premium customer
metadata[user_id]=12345
```

### List Customers
```bash
GET /customers?limit=100&email=user@example.com
```

### Update Customer
```bash
POST /customers/{id}

email=new@example.com
```

## Subscriptions

### Create Subscription
```bash
POST /subscriptions

customer=cus_xxx
items[0][price]=price_xxx
payment_behavior=default_incomplete
expand[]=latest_invoice.payment_intent
```

### Update Subscription
```bash
POST /subscriptions/{id}

items[0][id]=si_xxx
items[0][price]=price_new
proration_behavior=create_prorations|none|always_invoice
```

### Cancel Subscription
```bash
DELETE /subscriptions/{id}
# or
POST /subscriptions/{id}
cancel_at_period_end=true
```

### Subscription Statuses
| Status | Meaning |
|--------|---------|
| `incomplete` | First payment failed |
| `incomplete_expired` | Expired without payment |
| `trialing` | In trial period |
| `active` | Paid and active |
| `past_due` | Payment failed, retrying |
| `canceled` | Canceled |
| `unpaid` | Multiple payment failures |
| `paused` | Manually paused |

## Products & Prices

### Create Product
```bash
POST /products

name=Premium Plan
description=Full access
```

### Create Price
```bash
POST /prices

product=prod_xxx
unit_amount=1999              # $19.99
currency=usd
recurring[interval]=month     # or year, week, day
```

## Invoices

### List Invoices
```bash
GET /invoices?customer=cus_xxx&status=open
```

### Pay Invoice
```bash
POST /invoices/{id}/pay
```

### Invoice Statuses
| Status | Meaning |
|--------|---------|
| `draft` | Not yet finalized |
| `open` | Awaiting payment |
| `paid` | Payment received |
| `void` | Canceled |
| `uncollectible` | Marked uncollectible |

## Webhooks

### List Webhook Endpoints
```bash
GET /webhook_endpoints
```

### Create Webhook Endpoint
```bash
POST /webhook_endpoints

url=https://example.com/webhook
enabled_events[]=payment_intent.succeeded
enabled_events[]=customer.subscription.deleted
```

### Update Webhook Endpoint
```bash
POST /webhook_endpoints/{id}

enabled_events[]=invoice.payment_failed
disabled=false
```

### Verify Webhook Signature
```python
import stripe

payload = request.body
sig_header = request.headers.get('Stripe-Signature')

try:
    event = stripe.Webhook.construct_event(
        payload, sig_header, STRIPE_WEBHOOK_SECRET
    )
except stripe.error.SignatureVerificationError:
    return 400
```

### Key Webhook Events
| Event | Trigger |
|-------|---------|
| `payment_intent.succeeded` | Payment completed |
| `payment_intent.payment_failed` | Payment failed |
| `invoice.paid` | Invoice paid |
| `invoice.payment_failed` | Invoice payment failed |
| `customer.subscription.created` | New subscription |
| `customer.subscription.updated` | Subscription changed |
| `customer.subscription.deleted` | Subscription canceled |
| `checkout.session.completed` | Checkout success |

## Events

### List Events
```bash
GET /events?type=payment_intent.succeeded&limit=100

# Filter by time
created[gte]=1704067200  # Unix timestamp
created[lte]=1704153600
```

### Retrieve Event
```bash
GET /events/{id}
```

## Disputes & Refunds

### Create Refund
```bash
POST /refunds

payment_intent=pi_xxx
amount=500               # Partial refund in cents
reason=requested_by_customer
```

### List Disputes
```bash
GET /disputes?limit=100
```

### Submit Dispute Evidence
```bash
POST /disputes/{id}

evidence[customer_name]=John Doe
evidence[customer_email]=john@example.com
evidence[product_description]=Premium subscription
```

## Balance & Payouts

### Get Balance
```bash
GET /balance
```

### List Payouts
```bash
GET /payouts?limit=100
```

### Create Payout
```bash
POST /payouts

amount=10000
currency=usd
```

## Common Error Codes

| Code | Category | Meaning | Remediation |
|------|----------|---------|-------------|
| `authentication_error` | auth | Invalid API key | Verify key |
| `api_key_expired` | auth | Key expired | Generate new key |
| `rate_limit_error` | rate_limit | Too many requests | Implement backoff |
| `invalid_request_error` | bad_params | Missing/invalid param | Check parameters |
| `card_error` | transient | Card declined | Try different method |
| `idempotency_error` | bad_params | Idempotency conflict | Use new key |

### Decline Codes (card_error)
| Code | Meaning |
|------|---------|
| `insufficient_funds` | Card has no funds |
| `lost_card` | Card reported lost |
| `stolen_card` | Card reported stolen |
| `expired_card` | Card expired |
| `incorrect_cvc` | CVC wrong |
| `processing_error` | Bank processing error |
| `do_not_honor` | Bank declined |

## Pagination

```bash
GET /customers?limit=100&starting_after=cus_xxx

# Response includes:
{
  "has_more": true,
  "data": [...],
  "url": "/v1/customers"
}
```

Use `starting_after` with last object ID to paginate forward.

## Idempotency

```bash
POST /customers \
  -H "Idempotency-Key: unique-key-123" \
  -d email=user@example.com
```

Keys expire after 24 hours. Use for safe retries.

## Expanding Objects

```bash
GET /payment_intents/{id}?expand[]=customer&expand[]=payment_method

# Returns full customer and payment_method objects instead of IDs
```

## Metadata

All objects support `metadata` (up to 50 keys, 500 char values):

```bash
POST /customers

metadata[user_id]=12345
metadata[plan]=premium
metadata[source]=website
```

## Rate Limits

| Mode | Limit |
|------|-------|
| Live | 100 read/sec, 100 write/sec |
| Test | 25 read/sec, 25 write/sec |

Headers returned:
```
Stripe-Request-Id: req_xxx
Request-Id: req_xxx
```

## Console-Only Settings

These require Stripe Dashboard:
- API key management
- Webhook secret rotation
- Radar (fraud) rules
- Tax settings
- Connect account onboarding
- Branding customization
- Payout schedules
- Account verification
