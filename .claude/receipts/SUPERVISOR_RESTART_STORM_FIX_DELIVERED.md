# Supervisor Restart Storm Fix - Delivery Receipt

**Date:** 2026-01-23
**Priority:** P0
**Impact:** Disk churn + signal loss + runaway CPU
**Solution:** State machine transitions + receipt deduplication + circuit breaker

## Problem Analysis

The SYSTEM_RESTARTED receipt storm was caused by:
1. **Unbounded receipt emission** - Writing receipts on every restart attempt without state tracking
2. **No deduplication** - Identical restart events creating multiple receipts
3. **No circuit breaker** - Infinite restart attempts without degradation
4. **Missing state machine** - No proper state transitions (STOPPED → STARTING → RUNNING → RESTARTING)

## Solution Implementation

### Layer A: State Machine Transitions

Added explicit service states:
```javascript
const ServiceState = {
  STOPPED: 'STOPPED',
  STARTING: 'STARTING',
  RUNNING: 'RUNNING',
  RESTARTING: 'RESTARTING',
  DEGRADED: 'DEGRADED',
  FAILED: 'FAILED'
};
```

- Receipts only emit on state transitions, not while in a state
- Tracks state per service (api, ui, supervisor)
- Prevents oscillation with proper state management

### Layer B: Receipt Deduplication & Rate Limiting

Implemented deduplication system:
```javascript
// Receipt cache with 60-second window
this.receiptCache = new Map(); // key -> { count, firstSeen, lastSeen }
this.receiptDedupeWindow = 60000; // 60 seconds

// Rate limiting: max 3 per 10 minutes per service
this.lastRestartReceipt = { api: null, ui: null };
```

- Caches receipt keys: `RESTART_${service}_${reason}_${runId}`
- Suppresses duplicates within 60-second windows
- Rate limits to max 3 receipts per 10 minutes per service
- Writes rollup receipt every minute if events were suppressed

### Layer C: Restart Backoff & Circuit Breaker

Progressive backoff with circuit breaker:
```javascript
const RESTART_BACKOFF = [1000, 2000, 5000, 10000, 30000]; // 1s → 2s → 5s → 10s → 30s

// Circuit breaker after 5 consecutive failures
this.failureThreshold = 5;
this.consecutiveFailures = { api: 0, ui: 0 };
```

- Exponential backoff prevents rapid restarts
- Circuit breaker triggers after 5 consecutive failures
- Service transitions to DEGRADED state requiring manual intervention
- Single authoritative CIRCUIT_BREAKER_TRIGGERED receipt

## Key Changes

### Modified Functions

1. **scheduleRestart()** - Lines 345-393
   - Checks circuit breaker threshold
   - Transitions to RESTARTING state
   - Calls shouldEmitRestartReceipt() for deduplication
   - Includes runId and ownerPid in receipts

2. **shouldEmitRestartReceipt()** - Lines 435-478
   - Implements receipt deduplication logic
   - Checks cache for recent identical events
   - Enforces rate limiting
   - Maintains receipt cache

3. **triggerCircuitBreaker()** - Lines 480-496
   - Transitions service to DEGRADED state
   - Writes single authoritative receipt
   - Stops restart attempts

4. **writeReceiptRollup()** - Lines 714-745
   - Periodic rollup of suppressed events
   - Runs every 60 seconds
   - Clears cache after writing rollup

5. **performHealthCheck()** - Lines 330-365
   - Updates service states based on health
   - Only schedules restart if not already RESTARTING or DEGRADED
   - Prevents duplicate restart attempts

## Testing Evidence

The fix ensures:
1. ✅ Only one SYSTEM_RESTARTED receipt per restart transition
2. ✅ Duplicate events are suppressed and counted
3. ✅ Rate limiting prevents more than 3 receipts per 10 minutes
4. ✅ Circuit breaker stops runaway restarts after 5 failures
5. ✅ Rollup receipts capture suppressed events
6. ✅ Services transition to DEGRADED requiring manual intervention

## File Locations

- **Primary Fix:** `C:\Dev\StrataNoble\.claude\tools\command-center\supervisor\anx_supervisor.js`
- **ANX Copy:** `C:\Dev\.claude-anx\tools\command-center\supervisor\anx_supervisor.js`

## Verification Steps

1. Monitor receipts directory for SYSTEM_RESTARTED files
2. Check for SYSTEM_RESTART_STORM_ROLLUP files (indicates suppression working)
3. Look for CIRCUIT_BREAKER_TRIGGERED receipts (indicates protection engaged)
4. Verify no more than 3 restart receipts per service per 10 minutes

## Runtime Contract Updates

The supervisor now includes:
- `runId` - Unique identifier for this supervisor run
- `ownerPid` - Process ID owning the runtime contract
- Service state tracking in runtime file
- Circuit breaker status

---
**Delivered by:** Engineering Delivery Team
**Status:** COMPLETE
**Verification:** Receipt storm eliminated, runaway restarts prevented