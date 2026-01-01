# Post-Deployment Verification Checklist
**Sprint:** Double-Booking Prevention  
**Deployment Date:** [TO BE FILLED]  
**Verified By:** [TO BE FILLED]

---

## 🔍 Database Verification

### Step 1: Verify Migrations Applied
```sql
-- Check migration history
SELECT * FROM supabase_migrations.schema_migrations 
WHERE version IN ('20251231000007', '20251231000008')
ORDER BY version;

-- Expected: Both migrations present with executed_at timestamp
```
- [ ] Migration 007 applied
- [ ] Migration 008 applied

### Step 2: Verify Constraints Exist
```sql
-- Check unique index
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'appointments' 
AND indexname = 'ux_appointments_barber_slot';

-- Expected: Index with (barber_id, start_time) WHERE status NOT IN (...)

-- Check exclusion constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'no_overlapping_appointments';

-- Expected: EXCLUDE USING gist (barber_id WITH =, tstzrange(...) WITH &&)
```
- [ ] Unique index exists
- [ ] Exclusion constraint exists

### Step 3: Verify btree_gist Extension
```sql
SELECT * FROM pg_extension WHERE extname = 'btree_gist';

-- Expected: One row showing extension is installed
```
- [ ] btree_gist extension enabled

### Step 4: Verify end_time Backfilled
```sql
SELECT COUNT(*) as total_appointments,
       COUNT(end_time) as with_end_time,
       COUNT(*) - COUNT(end_time) as missing_end_time
FROM appointments;

-- Expected: missing_end_time = 0
```
- [ ] All appointments have end_time
- [ ] No NULL end_time values

### Step 5: Verify RPC Function
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'create_booking' 
AND routine_schema = 'public';

-- Expected: One row with routine_type = 'FUNCTION'
```
- [ ] create_booking() RPC exists

---

## 🧪 Functional Testing

### Test 1: Exact Duplicate Prevention (Unique Index)
**Setup:**
```sql
-- Manually insert test booking
INSERT INTO appointments (
  barber_id, 
  customer_id, 
  start_time, 
  end_time, 
  status
) VALUES (
  'test-barber-123',
  'test-customer-1',
  '2025-01-02 14:00:00+00',
  '2025-01-02 14:30:00+00',
  'confirmed'
);
```

**Test:**
```sql
-- Try to insert exact duplicate start_time
INSERT INTO appointments (
  barber_id, 
  customer_id, 
  start_time, 
  end_time, 
  status
) VALUES (
  'test-barber-123',
  'test-customer-2',
  '2025-01-02 14:00:00+00',
  '2025-01-02 14:30:00+00',
  'confirmed'
);

-- Expected: ERROR - duplicate key value violates unique constraint
```

**Cleanup:**
```sql
DELETE FROM appointments WHERE barber_id = 'test-barber-123';
```

- [ ] Exact duplicate rejected
- [ ] Error code: 23505 (unique_violation)

### Test 2: Overlap Prevention (Exclusion Constraint)
**Setup:**
```sql
INSERT INTO appointments (
  barber_id, 
  customer_id, 
  start_time, 
  end_time, 
  status
) VALUES (
  'test-barber-456',
  'test-customer-1',
  '2025-01-02 14:00:00+00',
  '2025-01-02 14:30:00+00',
  'confirmed'
);
```

**Test:**
```sql
-- Try to insert overlapping time range
INSERT INTO appointments (
  barber_id, 
  customer_id, 
  start_time, 
  end_time, 
  status
) VALUES (
  'test-barber-456',
  'test-customer-2',
  '2025-01-02 14:15:00+00',  -- Overlaps with 14:00-14:30
  '2025-01-02 14:45:00+00',
  'confirmed'
);

-- Expected: ERROR - conflicting key value violates exclusion constraint
```

**Cleanup:**
```sql
DELETE FROM appointments WHERE barber_id = 'test-barber-456';
```

- [ ] Overlapping booking rejected
- [ ] Error code: 23P01 (exclusion_violation)

### Test 3: Adjacent Slots Allowed (No Overlap)
**Test:**
```sql
-- Insert first booking
INSERT INTO appointments (
  barber_id, customer_id, start_time, end_time, status
) VALUES (
  'test-barber-789', 'test-customer-1',
  '2025-01-02 14:00:00+00', '2025-01-02 14:30:00+00', 'confirmed'
);

-- Insert adjacent booking (should succeed)
INSERT INTO appointments (
  barber_id, customer_id, start_time, end_time, status
) VALUES (
  'test-barber-789', 'test-customer-2',
  '2025-01-02 14:30:00+00', '2025-01-02 15:00:00+00', 'confirmed'
);

-- Expected: Both succeed (half-open intervals don't overlap)
```

**Cleanup:**
```sql
DELETE FROM appointments WHERE barber_id = 'test-barber-789';
```

- [ ] Adjacent bookings allowed
- [ ] No errors thrown

### Test 4: Cancelled Slot Reusable
**Test:**
```sql
-- Insert and cancel booking
INSERT INTO appointments (
  barber_id, customer_id, start_time, end_time, status
) VALUES (
  'test-barber-999', 'test-customer-1',
  '2025-01-02 14:00:00+00', '2025-01-02 14:30:00+00', 'confirmed'
);

UPDATE appointments 
SET status = 'cancelled' 
WHERE barber_id = 'test-barber-999';

-- Try to book same slot (should succeed)
INSERT INTO appointments (
  barber_id, customer_id, start_time, end_time, status
) VALUES (
  'test-barber-999', 'test-customer-2',
  '2025-01-02 14:00:00+00', '2025-01-02 14:30:00+00', 'confirmed'
);

-- Expected: Success (unique index excludes cancelled bookings)
```

**Cleanup:**
```sql
DELETE FROM appointments WHERE barber_id = 'test-barber-999';
```

- [ ] Cancelled slot reusable
- [ ] No constraint violation

### Test 5: RPC Function Error Handling
**Test:**
```sql
-- Call RPC with valid data
SELECT create_booking(
  barber_id := 'test-barber-111',
  customer_id := auth.uid(),
  start_time := '2025-01-02 16:00:00+00',
  duration_minutes := 30,
  service_id := 'test-service',
  price := 35.00,
  payment_method := 'card',
  location_type := 'shop'
);

-- Try to call RPC with same time (should raise exception)
SELECT create_booking(
  barber_id := 'test-barber-111',
  customer_id := auth.uid(),
  start_time := '2025-01-02 16:00:00+00',
  duration_minutes := 30,
  service_id := 'test-service',
  price := 35.00,
  payment_method := 'card',
  location_type := 'shop'
);

-- Expected: Exception with message 'SLOT_TAKEN'
```

**Cleanup:**
```sql
DELETE FROM appointments WHERE barber_id = 'test-barber-111';
```

- [ ] RPC raises SLOT_TAKEN exception
- [ ] Exception message matches expected format

---

## 📱 Flutter App Testing

### Manual Testing Checklist

#### Test 1: UI Shows Available Slots Only
1. Open app and navigate to booking flow
2. Select a barber
3. Select a date
4. Verify time slots displayed

**Expected:**
- [ ] Only available time slots shown
- [ ] Existing bookings NOT shown as available
- [ ] Adjacent slots (back-to-back) ARE shown

#### Test 2: Double-Booking Prevention
1. Open app on **two devices** (or two browser tabs)
2. Both devices: Select same barber, same date, same time
3. Device 1: Click "Confirm Booking" → Should succeed
4. Device 2: Click "Confirm Booking" immediately after

**Expected:**
- [ ] Device 1: Booking succeeds
- [ ] Device 2: Shows "Time slot unavailable" dialog
- [ ] Device 2: "Pick Another Time" button works
- [ ] After picking new time, Device 2 booking succeeds

#### Test 3: Error Message Display
When SLOT_TAKEN error occurs:

**Expected:**
- [ ] Dialog appears with clear message
- [ ] Message: "This time slot was just booked. Please pick another time."
- [ ] Button: "Pick Another Time" (not just "OK")
- [ ] Clicking button returns to time selection screen
- [ ] Previously selected time is now unavailable (refreshed)

#### Test 4: Edge Cases
**Scenario A:** Cancel and Rebook
1. Book a time slot
2. Cancel the booking
3. Immediately try to book the same slot again

**Expected:**
- [ ] Rebooking succeeds (cancelled slots are reusable)

**Scenario B:** Different Barbers
1. Two customers book same time
2. But different barbers

**Expected:**
- [ ] Both bookings succeed (no conflict)

**Scenario C:** Network Latency
1. Book a slot with slow network (throttle to 3G)
2. Verify loading state shown
3. Verify success/error handled properly

**Expected:**
- [ ] Loading indicator shown during booking
- [ ] Error handled gracefully if network fails
- [ ] No duplicate booking if retry attempted

---

## 📊 Production Monitoring

### Metrics to Track (First 24 Hours)

#### Error Rates
```sql
-- Count SLOT_TAKEN errors by hour
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as slot_taken_errors
FROM error_logs
WHERE error_code = 'SLOT_TAKEN'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour;
```

**Target:** <1% of total booking attempts

- [ ] SLOT_TAKEN error rate < 1%
- [ ] No spike in overall error rate
- [ ] No user complaints about "phantom" availability

#### Booking Success Rate
```sql
-- Compare booking success rate before/after deployment
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as successful,
  ROUND(COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::numeric / COUNT(*) * 100, 2) as success_rate_pct
FROM appointments
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY date
ORDER BY date;
```

**Target:** Success rate maintained or improved

- [ ] Booking success rate ≥ pre-deployment baseline
- [ ] No increase in abandoned bookings

#### Database Performance
```sql
-- Check index usage
SELECT 
  schemaname, tablename, indexname, 
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE indexname = 'ux_appointments_barber_slot';

-- Check constraint check performance
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
WHERE query LIKE '%no_overlapping_appointments%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Target:** No performance degradation

- [ ] Index scans happening (not seq scans)
- [ ] Query performance <100ms p95
- [ ] No database CPU spikes

---

## 🚨 Rollback Triggers

Rollback immediately if:

- [ ] SLOT_TAKEN error rate >5% (indicates UI filtering broken)
- [ ] Database CPU >80% sustained (constraint overhead too high)
- [ ] User complaints about legitimate slots showing as "unavailable"
- [ ] Any critical bugs preventing bookings entirely

---

## ✅ Sign-Off

**Database Verification:** _____________________ Date: _______

**Flutter Testing:** _____________________ Date: _______

**Production Monitoring (24h):** _____________________ Date: _______

**Final Approval:** _____________________ Date: _______

---

## 📋 Notes

[Space for deployment notes, issues encountered, resolution steps]
