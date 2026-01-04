---
name: earnings-payouts-agent
description: Manages earnings calculations, surge pricing, and instant payouts.
---

# Earnings & Payouts Agent

## Purpose
Manages barber earnings calculations, surge pricing, instant payouts, tips, bonuses, and referral commissions.

## Capabilities
- Calculate dynamic pricing (surge, house call premiums)
- Process instant payouts via Stripe Connect
- Track and distribute tips
- Calculate weekly performance bonuses
- Manage referral bonus payouts
- Generate earnings reports and analytics

## Configuration

### Environment Variables
```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_INSTANT_PAYOUT_ENABLED=true
INSTANT_PAYOUT_FEE_PERCENT=1.5
PLATFORM_COMMISSION_PERCENT=15
```

### Database Tables
```sql
-- Surge pricing rules
CREATE TABLE IF NOT EXISTS surge_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  day_of_week INTEGER[], -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0, -- e.g., 1.25 = 25% surge
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- higher = takes precedence
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barber earnings ledger
CREATE TABLE IF NOT EXISTS barber_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  type TEXT CHECK (type IN ('service', 'tip', 'house_call_premium', 'surge', 'product_commission', 'referral_bonus', 'performance_bonus', 'adjustment')),
  gross_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'paid_out', 'refunded')),
  payout_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payout records
CREATE TABLE IF NOT EXISTS barber_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payout_id TEXT,
  stripe_transfer_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('standard', 'instant')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'paid', 'failed', 'canceled')),
  arrival_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Referral tracking
CREATE TABLE IF NOT EXISTS barber_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'paid')),
  bonus_amount DECIMAL(10,2),
  qualified_at TIMESTAMPTZ, -- When referred barber completes 5 cuts
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Weekly performance bonuses
CREATE TABLE IF NOT EXISTS performance_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  cuts_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  bonus_tier TEXT CHECK (bonus_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  bonus_amount DECIMAL(10,2),
  status TEXT DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_earnings_barber ON barber_earnings(barber_id);
CREATE INDEX idx_earnings_status ON barber_earnings(status);
CREATE INDEX idx_payouts_barber ON barber_payouts(barber_id);
CREATE INDEX idx_referrals_referrer ON barber_referrals(referrer_id);
```

## Edge Function: earnings-service

### Endpoint
`POST /functions/v1/earnings-service`

### Actions

#### Calculate Booking Price
```typescript
// Request
{
  "action": "calculatePrice",
  "services": ["haircut", "beard_trim"],
  "barberId": "uuid",
  "scheduledTime": "2024-01-15T18:00:00Z",
  "isHouseCall": true,
  "distance": 5.2 // miles
}

// Response
{
  "breakdown": {
    "basePrice": 35.00,
    "surgeMultiplier": 1.25,
    "surgeAmount": 8.75,
    "houseCallPremium": 15.00,
    "travelFee": 5.20,
    "subtotal": 63.95,
    "platformFee": 9.59,
    "barberEarnings": 54.36
  },
  "surgeReason": "Friday evening peak hours",
  "estimatedTip": 12.79 // 20% suggestion
}
```

#### Process Tip
```typescript
// Request
{
  "action": "processTip",
  "bookingId": "uuid",
  "amount": 10.00,
  "paymentMethodId": "pm_xxx"
}

// Response
{
  "success": true,
  "tipId": "uuid",
  "barberReceives": 10.00, // 100% of tips go to barber
  "message": "Tip sent successfully"
}
```

#### Request Instant Payout
```typescript
// Request
{
  "action": "instantPayout",
  "barberId": "uuid",
  "amount": 150.00 // optional, defaults to full available balance
}

// Response
{
  "success": true,
  "payoutId": "uuid",
  "amount": 150.00,
  "fee": 2.25, // 1.5%
  "netAmount": 147.75,
  "arrivalTime": "within minutes",
  "stripePayoutId": "po_xxx"
}
```

#### Get Earnings Summary
```typescript
// Request
{
  "action": "summary",
  "barberId": "uuid",
  "period": "week" // day, week, month, year, all
}

// Response
{
  "period": "week",
  "earnings": {
    "services": 450.00,
    "tips": 95.00,
    "houseCallPremiums": 75.00,
    "surgeEarnings": 45.00,
    "productCommissions": 32.00,
    "bonuses": 25.00,
    "total": 722.00
  },
  "platformFees": 108.30,
  "netEarnings": 613.70,
  "availableBalance": 463.70,
  "pendingBalance": 150.00,
  "cutsCompleted": 18,
  "averagePerCut": 40.11
}
```

#### Calculate Weekly Bonus
```typescript
// Triggered automatically every Monday at midnight
// Request
{
  "action": "calculateWeeklyBonus",
  "weekStart": "2024-01-08",
  "weekEnd": "2024-01-14"
}

// Bonus Tiers:
// Platinum: 30+ cuts, 4.9+ rating → $100 bonus
// Gold: 25+ cuts, 4.7+ rating → $50 bonus
// Silver: 20+ cuts, 4.5+ rating → $25 bonus
// Bronze: 15+ cuts, 4.3+ rating → $10 bonus
```

## Surge Pricing Rules (Default)

| Rule | Days | Time | Multiplier |
|------|------|------|------------|
| Friday Evening | Fri | 5pm-9pm | 1.25x |
| Saturday Peak | Sat | 10am-6pm | 1.30x |
| Sunday Afternoon | Sun | 12pm-5pm | 1.20x |
| Holiday Premium | Holidays | All day | 1.50x |
| Late Night | Any | 9pm-6am | 1.15x |

## Referral Program

### Barber Referrals
- Referrer gets $50 when referred barber completes 5 cuts
- Referred barber gets $25 welcome bonus after certification

### Customer Referrals
- Referrer gets $10 credit
- New customer gets 15% off first cut

## Stripe Connect Flow

```
Customer pays → Stripe
                   ↓
            Platform receives full amount
                   ↓
            Calculate splits:
            - Barber: 85%
            - Platform: 15%
                   ↓
            Transfer to barber's Connect account
                   ↓
            Available for payout (instant or standard)
```

## CLI Commands
```bash
# Calculate surge for a time
npm run agent:earnings surge --time="2024-01-15T18:00:00"

# Process pending payouts
npm run agent:earnings process-payouts

# Calculate weekly bonuses
npm run agent:earnings weekly-bonus --week=2024-01-08

# Generate earnings report
npm run agent:earnings report --barber-id=xxx --period=month

# Simulate instant payout
npm run agent:earnings instant --barber-id=xxx --amount=100
```

## Scheduled Jobs

| Job | Schedule | Action |
|-----|----------|--------|
| Process standard payouts | Daily 6am | Transfer available balances |
| Calculate weekly bonuses | Monday 12am | Compute and credit bonuses |
| Qualify referrals | Hourly | Check for 5-cut milestones |
| Expire pending earnings | Daily | Mark old pending as available |

## Analytics Events
- `earnings.booking.completed`
- `earnings.tip.received`
- `earnings.payout.requested`
- `earnings.payout.completed`
- `earnings.bonus.earned`
- `earnings.referral.qualified`
