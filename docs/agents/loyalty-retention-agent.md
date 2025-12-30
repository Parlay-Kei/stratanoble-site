# Loyalty & Retention Agent

## SECURITY (MANDATORY)
Follow: docs/agents/SECURITY_SECRETS_HANDLING.md

- Never ask for or accept secrets in chat
- Provide single-command env var instructions only
- Never write PATs to files or logs
- After use, instruct user to DELETE the PAT (revoke)
- Assume any disclosed token is compromised

---


## Purpose
Manages customer and barber retention programs including loyalty points, rewards, milestones, gamification, and AI-powered grooming calendar.

## Capabilities
- Track and award loyalty points
- Manage rewards redemption catalog
- Calculate "10 cuts = 1 free" milestones
- Generate AI grooming recommendations
- Send personalized reminder notifications
- Track "Barber of the Week" selection
- Manage barber retention incentives

## Configuration

### Environment Variables
```env
POINTS_PER_DOLLAR=1
FREE_CUT_THRESHOLD=10
HAIR_GROWTH_MODEL_ENDPOINT=https://api.directcuts.com/ml/hair-growth
```

### Database Tables
```sql
-- Extended loyalty points (add to existing)
ALTER TABLE loyalty_points ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('booking', 'product', 'referral', 'bonus', 'social', 'milestone'));
ALTER TABLE loyalty_points ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Milestone tracking
CREATE TABLE IF NOT EXISTS customer_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  milestone_type TEXT CHECK (milestone_type IN ('cuts_10', 'cuts_25', 'cuts_50', 'cuts_100', 'spend_500', 'spend_1000', 'loyalty_1_year', 'referrals_5')),
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  reward_claimed BOOLEAN DEFAULT false,
  reward_type TEXT,
  reward_value DECIMAL(10,2),
  UNIQUE(customer_id, milestone_type)
);

-- Rewards catalog
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('free_cut', 'discount', 'upgrade', 'product', 'house_call', 'priority')),
  points_required INTEGER NOT NULL,
  value DECIMAL(10,2), -- monetary value
  quantity_available INTEGER, -- null = unlimited
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reward redemptions
CREATE TABLE IF NOT EXISTS loyalty_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES loyalty_rewards(id),
  points_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'used', 'expired', 'refunded')),
  booking_id UUID REFERENCES bookings(id),
  code TEXT UNIQUE, -- redemption code
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI grooming calendar
CREATE TABLE IF NOT EXISTS grooming_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hair_type TEXT, -- 'straight', 'wavy', 'curly', 'coily'
  growth_rate TEXT DEFAULT 'average', -- 'slow', 'average', 'fast'
  preferred_length TEXT, -- 'fade', 'short', 'medium', 'long'
  last_cut_date DATE,
  predicted_next_cut DATE,
  confidence DECIMAL(3,2), -- 0.00 to 1.00
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barber of the Week
CREATE TABLE IF NOT EXISTS barber_spotlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  selection_reason JSONB, -- { rating: 4.95, cuts: 35, ... }
  featured_image_url TEXT,
  bio_snippet TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barber_id, week_start)
);

-- Barber retention milestones
CREATE TABLE IF NOT EXISTS barber_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  milestone_type TEXT CHECK (milestone_type IN ('days_30', 'days_90', 'days_180', 'days_365', 'cuts_100', 'cuts_500', 'earnings_5000', 'rating_49')),
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  reward_type TEXT, -- 'insurance_eligible', 'merch_discount', 'bonus'
  reward_granted BOOLEAN DEFAULT false,
  UNIQUE(barber_id, milestone_type)
);

CREATE INDEX idx_milestones_customer ON customer_milestones(customer_id);
CREATE INDEX idx_redemptions_customer ON loyalty_redemptions(customer_id);
CREATE INDEX idx_grooming_predictions ON grooming_predictions(customer_id);
CREATE INDEX idx_barber_spotlights_week ON barber_spotlights(week_start);
```

## Edge Function: loyalty-service

### Endpoint
`POST /functions/v1/loyalty-service`

### Actions

#### Get Customer Loyalty Status
```typescript
// Request
{
  "action": "status",
  "customerId": "uuid"
}

// Response
{
  "points": {
    "available": 450,
    "lifetime": 1250,
    "expiringSoon": 50, // within 30 days
    "expirationDate": "2024-02-15"
  },
  "cuts": {
    "completed": 8,
    "untilFree": 2,
    "progress": 80
  },
  "tier": {
    "current": "silver",
    "next": "gold",
    "pointsToNext": 250
  },
  "milestones": [
    { "type": "cuts_10", "achieved": false, "progress": 8, "reward": "Free haircut" }
  ],
  "availableRewards": [
    { "id": "uuid", "name": "Free Beard Trim", "points": 200 }
  ]
}
```

#### Award Points
```typescript
// Request
{
  "action": "awardPoints",
  "customerId": "uuid",
  "amount": 35,
  "source": "booking",
  "bookingId": "uuid"
}

// Response
{
  "success": true,
  "pointsAwarded": 35,
  "newBalance": 485,
  "milestoneUnlocked": null
}
```

#### Redeem Reward
```typescript
// Request
{
  "action": "redeem",
  "customerId": "uuid",
  "rewardId": "uuid"
}

// Response
{
  "success": true,
  "redemptionId": "uuid",
  "code": "DC-REWARD-ABC123",
  "expiresAt": "2024-02-15",
  "instructions": "Apply this code at checkout or show to your barber."
}
```

#### Get AI Next Cut Prediction
```typescript
// Request
{
  "action": "predictNextCut",
  "customerId": "uuid"
}

// Response
{
  "prediction": {
    "recommendedDate": "2024-01-25",
    "daysFromNow": 10,
    "confidence": 0.85,
    "reasoning": "Based on your bi-weekly fade preference and last cut on Jan 11"
  },
  "suggestedBooking": {
    "date": "2024-01-25",
    "time": "10:00 AM",
    "barber": "Marcus",
    "bookNow": true
  },
  "reminderScheduled": "2024-01-23" // 2 days before
}
```

#### Select Barber of the Week
```typescript
// Automated weekly selection
{
  "action": "selectBarberOfWeek",
  "weekStart": "2024-01-15"
}

// Algorithm considers:
// - Average rating (40%)
// - Number of cuts (30%)
// - Customer retention rate (15%)
// - Positive reviews (10%)
// - Response time (5%)

// Response
{
  "selectedBarber": {
    "id": "uuid",
    "name": "Marcus Williams",
    "rating": 4.95,
    "cutsThisWeek": 38,
    "specialty": "Fades & Beard Work"
  },
  "runnerUps": [
    { "id": "uuid", "name": "James", "score": 92 }
  ]
}
```

## Loyalty Tiers

| Tier | Points Required | Perks |
|------|-----------------|-------|
| **Bronze** | 0 | 1 point per $1 |
| **Silver** | 500 | 1.25 points per $1, priority support |
| **Gold** | 1500 | 1.5 points per $1, free upgrades |
| **Platinum** | 5000 | 2 points per $1, exclusive events, concierge |

## Rewards Catalog

| Reward | Points | Value |
|--------|--------|-------|
| Free Beard Trim | 200 | $15 |
| $5 Off Any Cut | 150 | $5 |
| Free House Call (under 5mi) | 400 | $15 |
| Premium Hot Towel Treatment | 100 | $10 |
| Free Haircut | 500 | $35 |
| Product Bundle (25% off) | 300 | ~$12 |
| Priority Weekend Booking | 250 | N/A |

## Milestone Rewards

| Milestone | Reward |
|-----------|--------|
| 10 Cuts | 1 Free Haircut |
| 25 Cuts | $25 Product Credit |
| 50 Cuts | VIP Status (lifetime) |
| $500 Spent | 200 Bonus Points |
| 1 Year Loyalty | Free Premium Cut |
| 5 Referrals | Free Month Subscription |

## Barber Retention Milestones

| Milestone | Reward |
|-----------|--------|
| 30 Days Active | Welcome bonus ($25) |
| 90 Days Active | Insurance eligibility |
| 180 Days Active | 25% merch discount |
| 365 Days Active | Platinum barber badge |
| 100 Cuts | Performance bonus ($100) |
| 500 Cuts | Elite status, event invites |
| 4.9+ Rating | Featured placement |

## AI Grooming Calendar

### Hair Growth Model Factors
- Hair type (straight/wavy/curly/coily)
- Ethnicity-adjusted growth rates
- Preferred style maintenance level
- Historical booking patterns
- Seasonal adjustments

### Reminder Schedule
```
Predicted cut date: Jan 25
├── Day -7: "Your next cut is coming up"
├── Day -3: "Book now for best availability"
├── Day -1: "Tomorrow is your recommended cut day"
└── Day +3: "Overdue! Your barber has openings today"
```

## CLI Commands
```bash
# Process point expirations
npm run agent:loyalty expire-points

# Select barber of the week
npm run agent:loyalty select-botw --week=2024-01-15

# Generate predictions for all customers
npm run agent:loyalty predict-all

# Send grooming reminders
npm run agent:loyalty send-reminders

# Check milestone achievements
npm run agent:loyalty check-milestones
```

## Scheduled Jobs

| Job | Schedule | Action |
|-----|----------|--------|
| Expire old points | Daily | Mark expired, notify customers |
| Barber of the Week | Sunday 6am | Select and feature |
| Grooming predictions | Daily | Update predictions |
| Reminder notifications | Daily 9am | Send due reminders |
| Milestone check | After each booking | Check and award |
| Tier evaluation | Monthly | Upgrade/downgrade tiers |

## Analytics Events
- `loyalty.points.earned`
- `loyalty.points.redeemed`
- `loyalty.milestone.achieved`
- `loyalty.tier.upgraded`
- `loyalty.reward.claimed`
- `loyalty.reminder.sent`
- `loyalty.prediction.generated`
- `barber.spotlight.selected`
