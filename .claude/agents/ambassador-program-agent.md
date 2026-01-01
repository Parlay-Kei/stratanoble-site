# Ambassador Program Agent

## Purpose
Manages brand ambassadors (college students, gym trainers, influencers) who promote Direct Cuts in exchange for free cuts and commissions.

## Capabilities
- Process ambassador applications
- Manage unique referral links and codes
- Track ambassador content submissions
- Credit free cuts for qualified referrals
- Generate performance dashboards
- Handle ambassador tier promotions

## Configuration

### Environment Variables
```env
AMBASSADOR_REFERRAL_CREDIT=15.00
AMBASSADOR_CUTS_PER_MONTH=4
CONTENT_REVIEW_WEBHOOK=https://slack.com/xxx
```

### Database Tables
```sql
-- Ambassador applications
CREATE TABLE IF NOT EXISTS ambassador_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  instagram_handle TEXT,
  tiktok_handle TEXT,
  follower_count INTEGER,
  location TEXT,
  affiliation TEXT, -- "UNLV", "Gold's Gym", etc.
  affiliation_type TEXT CHECK (affiliation_type IN ('college', 'gym', 'influencer', 'military', 'corporate', 'other')),
  why_ambassador TEXT,
  content_samples TEXT[], -- URLs to existing content
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active ambassadors
CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES ambassador_applications(id),
  referral_code TEXT UNIQUE NOT NULL, -- e.g., "MARCUS15"
  referral_link TEXT UNIQUE, -- directcuts.com/r/marcus15
  tier TEXT DEFAULT 'starter' CHECK (tier IN ('starter', 'rising', 'elite', 'legend')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'terminated')),
  free_cuts_remaining INTEGER DEFAULT 4,
  free_cuts_monthly_limit INTEGER DEFAULT 4,
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- % of first booking
  total_referrals INTEGER DEFAULT 0,
  total_bookings_generated INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  content_posts_required INTEGER DEFAULT 2, -- per month
  content_posts_submitted INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral tracking
CREATE TABLE IF NOT EXISTS ambassador_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES users(id),
  referral_code_used TEXT,
  status TEXT DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'first_booking', 'qualified', 'churned')),
  first_booking_id UUID REFERENCES bookings(id),
  commission_amount DECIMAL(10,2),
  commission_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  qualified_at TIMESTAMPTZ
);

-- Content submissions
CREATE TABLE IF NOT EXISTS ambassador_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE,
  platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'twitter', 'youtube', 'other')),
  content_type TEXT CHECK (content_type IN ('post', 'story', 'reel', 'video', 'review')),
  content_url TEXT NOT NULL,
  caption TEXT,
  views INTEGER,
  likes INTEGER,
  comments INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  bonus_earned DECIMAL(10,2) DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ambassador payouts
CREATE TABLE IF NOT EXISTS ambassador_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('commission', 'bonus', 'content_bonus')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  payment_method TEXT, -- 'stripe', 'paypal', 'venmo'
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_ambassadors_user ON ambassadors(user_id);
CREATE INDEX idx_ambassadors_code ON ambassadors(referral_code);
CREATE INDEX idx_ambassador_referrals_ambassador ON ambassador_referrals(ambassador_id);
CREATE INDEX idx_ambassador_content_ambassador ON ambassador_content(ambassador_id);
```

## Edge Function: ambassador-service

### Endpoint
`POST /functions/v1/ambassador-service`

### Actions

#### Submit Application
```typescript
// Request
{
  "action": "apply",
  "userId": "uuid",
  "application": {
    "fullName": "Marcus Johnson",
    "email": "marcus@unlv.edu",
    "phone": "702-555-1234",
    "instagramHandle": "@marcusfades",
    "tiktokHandle": "@marcusfades",
    "followerCount": 5200,
    "location": "Las Vegas, NV",
    "affiliation": "UNLV",
    "affiliationType": "college",
    "whyAmbassador": "I'm passionate about grooming and have a strong social presence on campus.",
    "contentSamples": ["https://instagram.com/p/xxx", "https://tiktok.com/@xxx/video/xxx"]
  }
}

// Response
{
  "success": true,
  "applicationId": "uuid",
  "status": "pending",
  "message": "Thanks for applying! We'll review within 48 hours."
}
```

#### Approve Application
```typescript
// Admin action
{
  "action": "approve",
  "applicationId": "uuid",
  "customCode": "MARCUS15", // optional, auto-generated if not provided
  "tier": "starter",
  "monthlyFreeCuts": 4
}

// Response
{
  "success": true,
  "ambassadorId": "uuid",
  "referralCode": "MARCUS15",
  "referralLink": "https://directcuts.com/r/marcus15",
  "welcomeEmailSent": true
}
```

#### Track Referral
```typescript
// Called when new user signs up with code
{
  "action": "trackReferral",
  "referralCode": "MARCUS15",
  "newUserId": "uuid"
}

// Response
{
  "success": true,
  "ambassadorNotified": true,
  "newUserDiscount": {
    "percent": 15,
    "validFor": "first booking"
  }
}
```

#### Submit Content
```typescript
// Request
{
  "action": "submitContent",
  "ambassadorId": "uuid",
  "content": {
    "platform": "instagram",
    "contentType": "reel",
    "url": "https://instagram.com/reel/xxx",
    "caption": "Fresh cut from @directcuts! Use my code MARCUS15!"
  }
}

// Response
{
  "success": true,
  "contentId": "uuid",
  "status": "pending",
  "message": "Content submitted for review. You'll be notified within 24 hours."
}
```

#### Get Ambassador Dashboard
```typescript
// Request
{
  "action": "dashboard",
  "ambassadorId": "uuid"
}

// Response
{
  "ambassador": {
    "name": "Marcus Johnson",
    "tier": "rising",
    "code": "MARCUS15",
    "link": "https://directcuts.com/r/marcus15"
  },
  "stats": {
    "totalReferrals": 47,
    "bookingsGenerated": 32,
    "lifetimeEarnings": 480.00,
    "pendingEarnings": 45.00
  },
  "thisMonth": {
    "referrals": 8,
    "bookings": 5,
    "earnings": 75.00,
    "contentSubmitted": 1,
    "contentRequired": 2
  },
  "freeCuts": {
    "remaining": 2,
    "monthlyLimit": 4,
    "nextRefresh": "2024-02-01"
  },
  "recentReferrals": [
    { "name": "John D.", "date": "2024-01-14", "status": "first_booking", "earned": 15.00 }
  ]
}
```

#### Redeem Free Cut
```typescript
// Request
{
  "action": "redeemFreeCut",
  "ambassadorId": "uuid",
  "barberId": "uuid",
  "scheduledTime": "2024-01-20T14:00:00Z"
}

// Response
{
  "success": true,
  "bookingId": "uuid",
  "cutsRemaining": 1,
  "message": "Free cut booked! Enjoy your appointment."
}
```

## Tier System

| Tier | Requirements | Monthly Free Cuts | Commission | Perks |
|------|--------------|-------------------|------------|-------|
| **Starter** | New ambassador | 4 | 10% | Basic dashboard |
| **Rising** | 25+ referrals | 6 | 12% | Early access to promos |
| **Elite** | 100+ referrals | 8 | 15% | Exclusive merch, events |
| **Legend** | 500+ referrals | Unlimited | 20% | VIP everything, cash bonuses |

## Content Requirements

### Monthly Minimums
- Starter: 2 posts/month
- Rising: 3 posts/month
- Elite: 4 posts/month
- Legend: Negotiated

### Content Guidelines
- Must tag @directcuts
- Must include referral code
- Must show actual haircut or mention service
- No competitor mentions
- Family-friendly content only

### Content Bonuses
- Viral post (10k+ views): $25 bonus
- Featured by Direct Cuts: $50 bonus
- Testimonial video: $100 bonus

## Referral Flow

```
1. User clicks ambassador link or enters code
2. Cookie set (30 days) or code stored
3. User signs up → referral logged
4. User books first cut → ambassador earns commission
5. User completes cut → commission available for payout
```

## Venues for Targeting

| Venue Type | Example Locations | Strategy |
|------------|-------------------|----------|
| Colleges | UNLV, CSN | Campus ambassadors, dorm promos |
| Gyms | Gold's, EOS, LVAC | Gym trainer partnerships |
| Casinos | Strip properties | Employee discounts |
| Military | Nellis AFB | Base promotions |
| Corporate | Tech companies | Office perks programs |

## CLI Commands
```bash
# Review pending applications
npm run agent:ambassador review-applications

# Approve application
npm run agent:ambassador approve --id=xxx --code=MARCUS15

# Generate monthly report
npm run agent:ambassador report --period=2024-01

# Process payouts
npm run agent:ambassador payouts

# Refresh monthly free cuts (1st of month)
npm run agent:ambassador refresh-cuts
```

## Scheduled Jobs

| Job | Schedule | Action |
|-----|----------|--------|
| Refresh free cuts | 1st of month | Reset remaining cuts to limit |
| Content deadline reminder | 25th of month | Email ambassadors missing content |
| Tier evaluation | 1st of month | Upgrade/downgrade based on performance |
| Payout processing | Weekly | Process pending commissions |
| Inactive check | Weekly | Flag ambassadors inactive 30+ days |

## Analytics Events
- `ambassador.application.submitted`
- `ambassador.approved`
- `ambassador.referral.signup`
- `ambassador.referral.first_booking`
- `ambassador.content.submitted`
- `ambassador.content.approved`
- `ambassador.free_cut.redeemed`
- `ambassador.payout.processed`
- `ambassador.tier.upgraded`
