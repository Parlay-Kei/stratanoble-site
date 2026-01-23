# theCut-Inspired Features Implementation Plan

## Unit Economics Configuration
Based on Direct Cuts codebase analysis:

```typescript
PLATFORM_ECONOMICS = {
  commission_rate: 0.15,        // 15% platform fee
  booking_fee: 3.00,            // $3 for cash bookings
  in_app_discount: 0.05,        // 5% discount for in-app payments
  avg_service_price: 35.00,     // Average from $20-50 range
  
  // Estimated metrics (update with actuals)
  cac_estimate: 25.00,          // Customer acquisition cost
  repeat_rate: 0.30,            // 30% booking twice+
  
  // Calculated LTV (update based on real data)
  avg_lifetime_bookings: 4.2,   // Based on 30% repeat @ 3.5 additional
  customer_ltv: 147.00,         // 4.2 * $35
  ltv_cac_ratio: 5.88,          // 147 / 25
}
```

## Feature Implementation Priority

### P0 Features (Launch Blockers) - Days 1-7

#### Feature 1: Enhanced Barber Dashboard
**Files to create:**
- `src/components/barber/dashboard/QuickActionBar.tsx`
- `src/components/barber/dashboard/NextAppointmentCard.tsx`
- `src/components/barber/dashboard/AppointmentActions.tsx`
- `src/components/barber/dashboard/StatsDashboard.tsx`
- `src/components/barber/dashboard/StatsCard.tsx`
- `src/components/barber/dashboard/DailyBarChart.tsx`
- `src/services/barberStatsService.ts`

**Database additions:**
```sql
-- Add barber_stats view for performance
CREATE MATERIALIZED VIEW barber_daily_stats AS
SELECT 
  barber_id,
  DATE(appointment_time) as stat_date,
  COUNT(*) as booking_count,
  SUM(total_price) as revenue,
  SUM(platform_fee) as platform_fees,
  SUM(barber_payout) as barber_payout,
  SUM(tip_amount) as tips,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'no_show') as no_show_count
FROM appointments
GROUP BY barber_id, DATE(appointment_time);

CREATE INDEX idx_barber_stats_date ON barber_daily_stats(barber_id, stat_date DESC);
```

**Key Direct Cuts improvements:**
- Show appointment earnings with platform fee breakdown
- Client loyalty status badge on next appointment card
- Pending payout amount in stats
- Travel time calculation for mobile appointments

---

#### Feature 2: Schedule Week Strip View
**Files to create:**
- `src/components/barber/schedule/WeekStrip.tsx`
- `src/components/barber/schedule/DayCell.tsx`
- `src/components/barber/schedule/TimeBlockView.tsx`
- `src/components/barber/schedule/AppointmentBlock.tsx`
- `src/hooks/useWeekNavigation.ts`

**Direct Cuts improvements:**
- Earnings preview per day cell
- Dot indicators for appointment density
- Color-coded revenue intensity
- Travel time display between mobile bookings

---

### P1 Features (Core UX) - Days 8-12

#### Feature 3: Enhanced Service Menu
**Files to create:**
- `src/components/services/ServiceCard.tsx`
- `src/components/services/ServiceList.tsx`
- `src/components/services/ServiceSelector.tsx`
- `src/components/services/SelectedServicesBar.tsx`

**Database migration:**
```sql
ALTER TABLE services 
ADD COLUMN category TEXT DEFAULT 'haircuts',
ADD COLUMN sort_order INTEGER DEFAULT 0,
ADD COLUMN popularity_score INTEGER DEFAULT 0;

CREATE INDEX idx_services_category ON services(barber_id, category, sort_order);
```

**Direct Cuts improvements:**
- "Most Popular" badge based on booking frequency
- "Last booked" timestamp for returning clients
- Smart add-on suggestions based on selection
- Show actual average duration with barber (vs listed)

---

#### Feature 4: Client Management with Count
**Files to create:**
- `src/components/barber/clients/ClientListHeader.tsx`
- `src/components/barber/clients/ClientList.tsx`
- `src/components/barber/clients/ClientRow.tsx`
- `src/components/barber/clients/AlphabetIndex.tsx`
- `src/services/clientManagementService.ts`

**Database query optimization:**
```sql
CREATE MATERIALIZED VIEW barber_client_stats AS
SELECT 
  barber_id,
  customer_id,
  COUNT(*) as visit_count,
  MAX(appointment_time) as last_visit,
  MIN(appointment_time) as first_visit,
  SUM(total_price) as lifetime_spend,
  CASE 
    WHEN COUNT(*) >= 10 THEN 'vip'
    WHEN COUNT(*) >= 5 THEN 'loyal'
    WHEN COUNT(*) >= 2 THEN 'returning'
    ELSE 'new'
  END as loyalty_tier
FROM appointments
WHERE status IN ('completed', 'confirmed')
GROUP BY barber_id, customer_id;

CREATE INDEX idx_client_stats ON barber_client_stats(barber_id, customer_id);
```

**Direct Cuts improvements:**
- Lifetime spend per client
- Loyalty tier badges (New/Returning/Loyal/VIP)
- "At risk" indicator (60+ days no visit)
- Quick message/book actions

---

### P2 Features (Polish) - Days 13-14

#### Feature 5: Barber Profile Hub
**Files to create:**
- `src/pages/barber/ProfileHub.tsx`
- `src/components/barber/profile/ProfileHeader.tsx`
- `src/components/barber/profile/SubscriptionCard.tsx`
- `src/components/barber/profile/SettingsSection.tsx`
- `src/components/barber/profile/SettingsRow.tsx`

**Direct Cuts improvements:**
- Profile completion percentage
- Profile views counter
- Portfolio quick upload
- Inline earnings summary
- "Available for mobile" quick toggle

---

## Implementation Workflow

### Phase 1: Database Setup (Day 1)
1. Run materialized view migrations
2. Create indexes for performance
3. Add new columns to services table
4. Seed test data for development

### Phase 2: Service Layer (Days 2-3)
1. Create `barberStatsService.ts`
2. Create `clientManagementService.ts`
3. Extend `pricingService.ts` for unit economics display
4. Add caching layer for materialized views

### Phase 3: Component Development (Days 4-12)
Build features in priority order:
- P0: Dashboard + Schedule (Days 4-7)
- P1: Services + Clients (Days 8-11)
- P2: Profile Hub (Days 12)

### Phase 4: Testing & Polish (Days 13-14)
1. Unit tests for all services
2. E2E tests for P0 features
3. Performance optimization
4. Mobile responsive checks

---

## Success Metrics

**Pre-launch (Development):**
- [ ] All P0 features pass E2E tests
- [ ] Dashboard loads in <800ms
- [ ] Stats calculations accurate vs database
- [ ] Mobile responsive on iOS/Android

**Post-launch (Vegas Soft Launch):**
- [ ] Barbers use dashboard daily (>80% DAU)
- [ ] Schedule view reduces booking friction (measure time-to-book)
- [ ] Client management increases repeat bookings (+10%)
- [ ] Profile completion improves discovery (+15% profile views)

---

## Next Steps
1. **Review this plan** - Validate priorities and timelines
2. **Approve database migrations** - Critical for performance
3. **Begin Phase 1** - Database setup and materialized views
4. **Parallel mobile work** - Create Flutter equivalents for DC-2

Ready to execute? Let me know if you want me to:
- Generate all TypeScript component stubs
- Write complete database migrations
- Create test data seeds
- Build the full implementation agent
