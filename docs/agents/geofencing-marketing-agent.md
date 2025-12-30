# Geofencing & Local Marketing Agent

## SECURITY (MANDATORY)
Follow: docs/agents/SECURITY_SECRETS_HANDLING.md

- Never ask for or accept secrets in chat
- Provide single-command env var instructions only
- Never write PATs to files or logs
- After use, instruct user to DELETE the PAT (revoke)
- Assume any disclosed token is compromised

---


## Purpose
Manages location-based push notifications, venue partnerships, promotional campaigns, and event integrations for hyper-local customer acquisition.

## Capabilities
- Set up and manage geofences around target venues
- Trigger contextual push notifications
- Track venue partnership promotions
- Manage location-specific promo codes
- Coordinate local event integrations
- Analyze location-based conversion data

## Configuration

### Environment Variables
```env
ONESIGNAL_APP_ID=xxx
ONESIGNAL_API_KEY=xxx
GEOFENCE_RADIUS_DEFAULT_METERS=500
PUSH_COOLDOWN_HOURS=24
```

### Database Tables
```sql
-- Geofence definitions
CREATE TABLE IF NOT EXISTS geofences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  venue_type TEXT CHECK (venue_type IN ('gym', 'college', 'casino', 'military', 'corporate', 'event', 'barbershop_competitor', 'other')),
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  radius_meters INTEGER DEFAULT 500,
  address TEXT,
  venue_name TEXT, -- "Gold's Gym - Summerlin"
  is_active BOOLEAN DEFAULT true,
  trigger_on_enter BOOLEAN DEFAULT true,
  trigger_on_exit BOOLEAN DEFAULT false,
  notification_template_id UUID,
  promo_code TEXT,
  daily_trigger_limit INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL, -- "Fresh cut nearby?"
  body TEXT NOT NULL, -- "Get 15% off your first cut. Barbers available now."
  category TEXT CHECK (category IN ('acquisition', 'reactivation', 'promotion', 'event', 'reminder')),
  deep_link TEXT, -- directcuts://book?promo=GYM15
  image_url TEXT,
  action_buttons JSONB, -- [{ "id": "book", "text": "Book Now" }]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venue partnerships
CREATE TABLE IF NOT EXISTS venue_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_name TEXT NOT NULL,
  venue_type TEXT CHECK (venue_type IN ('gym', 'college', 'casino', 'military', 'corporate', 'other')),
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  partnership_type TEXT CHECK (partnership_type IN ('promo_code', 'ambassador', 'event', 'display', 'referral')),
  promo_code TEXT,
  discount_percent INTEGER,
  employee_discount_percent INTEGER,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'expired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Location-based promo codes
CREATE TABLE IF NOT EXISTS location_promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  geofence_id UUID REFERENCES geofences(id),
  partnership_id UUID REFERENCES venue_partnerships(id),
  discount_type TEXT CHECK (discount_type IN ('percent', 'fixed', 'free_addon')),
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  first_time_only BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geofence trigger events
CREATE TABLE IF NOT EXISTS geofence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  geofence_id UUID REFERENCES geofences(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('enter', 'exit', 'dwell')),
  notification_sent BOOLEAN DEFAULT false,
  notification_id TEXT,
  converted BOOLEAN DEFAULT false, -- did they book?
  booking_id UUID REFERENCES bookings(id),
  device_id TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- Local events
CREATE TABLE IF NOT EXISTS local_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('sports', 'concert', 'conference', 'festival', 'community', 'other')),
  venue_name TEXT,
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  expected_attendance INTEGER,
  promo_code TEXT,
  geofence_id UUID REFERENCES geofences(id),
  notification_schedule JSONB, -- [{ "hours_before": 24, "template_id": "uuid" }]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_geofences_location ON geofences USING GIST (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
);
CREATE INDEX idx_geofence_events_user ON geofence_events(user_id);
CREATE INDEX idx_geofence_events_geofence ON geofence_events(geofence_id);
CREATE INDEX idx_local_events_date ON local_events(starts_at);
```

## Edge Function: geofence-service

### Endpoint
`POST /functions/v1/geofence-service`

### Actions

#### Register Device Location
```typescript
// Request (from mobile app)
{
  "action": "updateLocation",
  "userId": "uuid",
  "deviceId": "device-xxx",
  "latitude": 36.1699,
  "longitude": -115.1398
}

// Response
{
  "geofencesEntered": [
    {
      "id": "uuid",
      "name": "Gold's Gym Summerlin",
      "notification": {
        "title": "Post-workout fresh?",
        "body": "Get 15% off your cut. Barbers nearby.",
        "promoCode": "GYM15"
      }
    }
  ],
  "geofencesExited": [],
  "notificationSent": true
}
```

#### Create Geofence
```typescript
// Admin action
{
  "action": "createGeofence",
  "geofence": {
    "name": "UNLV Student Union",
    "venueType": "college",
    "latitude": 36.1082,
    "longitude": -115.1442,
    "radiusMeters": 300,
    "venueName": "UNLV",
    "promoCode": "UNLV20",
    "notificationTemplate": {
      "title": "Campus cuts",
      "body": "20% off for UNLV students. Book between classes!"
    }
  }
}

// Response
{
  "success": true,
  "geofenceId": "uuid",
  "estimatedDailyReach": 5200
}
```

#### Validate Promo Code
```typescript
// Request
{
  "action": "validatePromo",
  "code": "GYM15",
  "userId": "uuid",
  "location": {
    "latitude": 36.1699,
    "longitude": -115.1398
  }
}

// Response
{
  "valid": true,
  "discount": {
    "type": "percent",
    "value": 15
  },
  "restrictions": {
    "firstTimeOnly": true,
    "validUntil": "2024-01-31"
  }
}
```

#### Get Nearby Promotions
```typescript
// Request
{
  "action": "nearbyPromos",
  "latitude": 36.1699,
  "longitude": -115.1398,
  "radiusMiles": 5
}

// Response
{
  "promotions": [
    {
      "venue": "Gold's Gym Summerlin",
      "distance": "0.3 miles",
      "code": "GYM15",
      "discount": "15% off",
      "validUntil": "2024-01-31"
    }
  ],
  "nearbyBarbers": 12
}
```

#### Schedule Event Campaign
```typescript
// Request
{
  "action": "scheduleEventCampaign",
  "event": {
    "name": "Raiders vs Chiefs",
    "venue": "Allegiant Stadium",
    "startsAt": "2024-01-21T13:00:00-08:00",
    "expectedAttendance": 65000
  },
  "campaign": {
    "geofenceRadius": 1000,
    "notifications": [
      { "hoursBefore": 24, "title": "Game day fresh?", "body": "Get a cut before the game. 10% off." },
      { "hoursBefore": 4, "title": "Pregame ready?", "body": "Last chance for a quick cut!" }
    ],
    "promoCode": "RAIDERS10"
  }
}
```

## Target Venues (Las Vegas Launch)

### Gyms
| Venue | Address | Strategy |
|-------|---------|----------|
| Gold's Gym Summerlin | 7501 W Lake Mead | 15% first cut, trainer ambassadors |
| EOS Henderson | 2400 N Green Valley | 10% members discount |
| LVAC Downtown | 2655 E Desert Inn | Partnership display |

### Colleges
| Venue | Address | Strategy |
|-------|---------|----------|
| UNLV Campus | 4505 S Maryland | 20% student discount, campus ambassador |
| CSN Cheyenne | 3200 E Cheyenne | 15% student discount |

### Casinos (Employee Programs)
| Venue | Address | Strategy |
|-------|---------|----------|
| MGM Grand | 3799 S Las Vegas Blvd | Employee perk program |
| Wynn | 3131 S Las Vegas Blvd | Concierge partnership |
| Caesars Palace | 3570 S Las Vegas Blvd | Employee discount |

### Military
| Venue | Address | Strategy |
|-------|---------|----------|
| Nellis AFB | 4311 N Washington | 15% military discount |
| Creech AFB | Indian Springs | On-base promotion |

## Notification Strategies

### Gym Geofences
```
Trigger: Enter gym parking lot
Time: 5am-9pm only
Cooldown: 24 hours
Message: "Post-workout fresh? 15% off your first cut. Barbers nearby."
CTA: "Book Now"
```

### College Geofences
```
Trigger: Enter campus
Time: 10am-6pm (avoid early classes)
Cooldown: 7 days
Message: "Campus cuts - 20% off for students"
CTA: "Get Code"
```

### Event Geofences
```
Trigger: Enter stadium area
Time: 4 hours before event
Cooldown: Per event
Message: "Game day ready? Quick cut before kickoff"
CTA: "Find Nearby Barber"
```

## Privacy & Compliance

- Location tracking requires explicit opt-in
- Users can disable geofencing in settings
- No background tracking when app closed
- CCPA/GDPR compliant data handling
- Location data retained max 30 days
- Anonymous analytics only shared with partners

## CLI Commands
```bash
# Create geofence
npm run agent:geofence create --venue="Gold's Gym" --lat=36.17 --lng=-115.14

# Import venue list
npm run agent:geofence import --file=venues.csv

# Test notification
npm run agent:geofence test-push --user-id=xxx --geofence-id=xxx

# Generate location report
npm run agent:geofence report --period=week

# Sync event calendar
npm run agent:geofence sync-events --source=ticketmaster
```

## Scheduled Jobs

| Job | Schedule | Action |
|-----|----------|--------|
| Event notifications | Hourly | Send pre-event notifications |
| Expire promo codes | Daily | Deactivate expired codes |
| Partnership check-in | Weekly | Email venue contacts |
| Analytics digest | Weekly | Performance report to admins |
| Clean old events | Monthly | Archive past events |

## Analytics Events
- `geofence.enter`
- `geofence.exit`
- `geofence.notification.sent`
- `geofence.notification.opened`
- `geofence.promo.redeemed`
- `geofence.booking.converted`
- `event.campaign.triggered`

## Integration Points
- OneSignal (push notifications)
- Mobile app location services
- Booking flow (promo validation)
- Analytics dashboard
- Partnership CRM
