---
name: subscription-agent
description: Manages customer membership plans, recurring bookings, and billing cycles.
---

# Customer Subscription Agent

## Purpose
Manages customer membership plans, recurring bookings, billing cycles, and subscription perks.

## Capabilities
- Create and manage subscription plans
- Handle Stripe subscription billing
- Auto-schedule recurring appointments
- Process plan upgrades/downgrades
- Manage pause and cancellation flows
- Track subscription analytics

## Configuration

### Environment Variables
```env
STRIPE_SECRET_KEY=sk_live_xxx
SUBSCRIPTION_TRIAL_DAYS=7
AUTO_BOOKING_ADVANCE_DAYS=3
```

### Database Tables
```sql
-- Subscription plans catalog
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_interval TEXT CHECK (billing_interval IN ('weekly', 'biweekly', 'monthly', 'yearly')),
  stripe_price_id TEXT UNIQUE,
  features JSONB, -- ["Unlimited cuts", "Priority booking", etc.]
  cuts_included INTEGER, -- null = unlimited
  includes_products BOOLEAN DEFAULT false,
  product_discount_percent INTEGER DEFAULT 0,
  house_call_discount_percent INTEGER DEFAULT 0,
  priority_booking BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer subscriptions
CREATE TABLE IF NOT EXISTS customer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'paused', 'canceled', 'expired')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  pause_starts_at TIMESTAMPTZ,
  pause_ends_at TIMESTAMPTZ,
  preferred_barber_id UUID REFERENCES users(id),
  preferred_day_of_week INTEGER, -- 0-6
  preferred_time TIME,
  cuts_used_this_period INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription billing history
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  invoice_pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-scheduled bookings
CREATE TABLE IF NOT EXISTS subscription_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  scheduled_for TIMESTAMPTZ,
  auto_scheduled BOOLEAN DEFAULT true,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_customer ON customer_subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX idx_subscriptions_barber ON customer_subscriptions(preferred_barber_id);
```

## Edge Function: subscription-service

### Endpoint
`POST /functions/v1/subscription-service`

### Actions

#### Get Available Plans
```typescript
// Request
{
  "action": "plans"
}

// Response
{
  "plans": [
    {
      "id": "uuid",
      "name": "Stay Fresh Weekly",
      "slug": "stay-fresh-weekly",
      "price": 89.00,
      "interval": "weekly",
      "features": [
        "1 cut per week",
        "Priority booking",
        "15% off products",
        "Free house calls under 5 miles"
      ],
      "savings": "Save $15/month vs pay-per-cut",
      "popular": true
    },
    {
      "id": "uuid",
      "name": "Gentleman's Plan",
      "slug": "gentlemans-biweekly",
      "price": 55.00,
      "interval": "biweekly",
      "features": [
        "1 cut every 2 weeks",
        "10% off products",
        "Free beard trim add-on"
      ]
    },
    {
      "id": "uuid",
      "name": "Family Unlimited",
      "slug": "family-unlimited",
      "price": 149.00,
      "interval": "monthly",
      "features": [
        "Unlimited kids cuts (under 12)",
        "2 adult cuts included",
        "20% off products",
        "Priority weekend booking"
      ]
    }
  ]
}
```

#### Subscribe
```typescript
// Request
{
  "action": "subscribe",
  "customerId": "uuid",
  "planSlug": "stay-fresh-weekly",
  "paymentMethodId": "pm_xxx",
  "preferences": {
    "preferredBarberId": "uuid",
    "preferredDayOfWeek": 6, // Saturday
    "preferredTime": "10:00"
  }
}

// Response
{
  "success": true,
  "subscriptionId": "uuid",
  "stripeSubscriptionId": "sub_xxx",
  "status": "active",
  "currentPeriodEnd": "2024-01-22T00:00:00Z",
  "nextBooking": {
    "date": "2024-01-20",
    "time": "10:00 AM",
    "barber": "Marcus",
    "canReschedule": true
  },
  "message": "Welcome to Stay Fresh! Your first appointment is scheduled."
}
```

#### Get Subscription Status
```typescript
// Request
{
  "action": "status",
  "customerId": "uuid"
}

// Response
{
  "hasSubscription": true,
  "subscription": {
    "id": "uuid",
    "plan": "Stay Fresh Weekly",
    "status": "active",
    "price": 89.00,
    "cutsUsed": 2,
    "cutsIncluded": 4, // or null for unlimited
    "currentPeriodEnd": "2024-01-22",
    "autoRenews": true
  },
  "upcomingBooking": {
    "date": "2024-01-20",
    "time": "10:00 AM",
    "barber": "Marcus",
    "bookingId": "uuid"
  },
  "perks": {
    "productDiscount": 15,
    "houseCallDiscount": 100, // free under 5 miles
    "priorityBooking": true
  }
}
```

#### Pause Subscription
```typescript
// Request
{
  "action": "pause",
  "subscriptionId": "uuid",
  "pauseUntil": "2024-02-15" // max 30 days
}

// Response
{
  "success": true,
  "status": "paused",
  "pauseEnds": "2024-02-15",
  "message": "Subscription paused. You won't be charged until Feb 15."
}
```

#### Cancel Subscription
```typescript
// Request
{
  "action": "cancel",
  "subscriptionId": "uuid",
  "reason": "moving", // optional
  "cancelImmediately": false // true = now, false = end of period
}

// Response
{
  "success": true,
  "cancelAt": "2024-01-22", // end of current period
  "refundAmount": 0,
  "message": "Your subscription will end on Jan 22. You can still book until then."
}
```

#### Auto-Schedule Next Booking
```typescript
// Triggered automatically when period renews
// Request
{
  "action": "autoSchedule",
  "subscriptionId": "uuid"
}

// Logic:
// 1. Get preferred barber, day, time
// 2. Find next available slot within 3 days of preferred
// 3. Create booking
// 4. Send confirmation
// 5. Send reminder 24 hours before
```

## Subscription Plans (Launch)

| Plan | Price | Interval | Cuts | Perks |
|------|-------|----------|------|-------|
| **Stay Fresh Weekly** | $89/wk | Weekly | 1/week | Priority booking, 15% products, free house calls <5mi |
| **Gentleman's Plan** | $55/2wk | Biweekly | 1/2 weeks | 10% products, free beard trim |
| **Monthly Classic** | $45/mo | Monthly | 1/month | 5% products |
| **Family Unlimited** | $149/mo | Monthly | Unlimited kids + 2 adults | 20% products, weekend priority |

## Billing Flow

```
1. Customer subscribes → Stripe creates subscription
2. First charge → period starts
3. Auto-booking scheduled for preferred day/time
4. Appointment completed → cuts_used++
5. Period ends → Stripe charges → new period
6. Repeat from step 3
```

## Pause Rules
- Max pause duration: 30 days
- 1 pause per billing cycle
- No refunds during pause
- Auto-resumes on pause end date

## Cancellation Flow
```
1. Customer requests cancel
2. Show retention offers:
   - 1 month free
   - Downgrade option
   - Pause instead
3. If still canceling:
   - Cancel at period end (keep access)
   - Or cancel immediately (pro-rata refund)
4. Send win-back emails at 7, 30 days
```

## CLI Commands
```bash
# Create subscription plan
npm run agent:subscriptions create-plan --name="Stay Fresh" --price=89

# Process renewals
npm run agent:subscriptions renew-all

# Auto-schedule upcoming bookings
npm run agent:subscriptions auto-schedule

# Generate churn report
npm run agent:subscriptions churn-report --period=month

# Send renewal reminders
npm run agent:subscriptions send-reminders
```

## Scheduled Jobs

| Job | Schedule | Action |
|-----|----------|--------|
| Auto-schedule bookings | Daily 6am | Create bookings for upcoming periods |
| Renewal reminders | Daily | Email 3 days before renewal |
| Process failed payments | Hourly | Retry failed charges |
| Resume paused subs | Hourly | Check pause_ends_at |
| Win-back emails | Daily | Email churned at 7, 30 days |

## Analytics Events
- `subscription.created`
- `subscription.renewed`
- `subscription.upgraded`
- `subscription.downgraded`
- `subscription.paused`
- `subscription.canceled`
- `subscription.booking.auto_scheduled`
- `subscription.payment.failed`
