# UX Implementation Gap Analysis: ANX Command Center

**Date:** 2026-01-23
**Scope:** Testing UX flow specification against actual implementation
**Status:** Mixed implementation - Core functionality exists, UI gaps identified

## Summary

The ANX Command Center has a **solid backend foundation** but **missing UX layer**. The supervisor implements all the state machine logic and runtime contract features described in the UX flow, but there's no actual Command Center UI that matches the design specification.

## Implementation Status by UX Section

### ✅ 0) Mental Model - **FULLY IMPLEMENTED**
- ✅ **Supervisor as operator:** `anx_supervisor.js` manages services
- ✅ **Runtime contract as truth:** `command_center.runtime.json` contains all state
- ✅ **Receipts as forensic trail:** Receipt system with deduplication working
- ❌ **Command Center UI as cockpit:** Current UI is a basic directive management tool, not the status dashboard described

### ❌ 1) Open and Orient - **NOT IMPLEMENTED**
**Expected:** Status Dashboard showing supervisor state, service status, URLs, failure reasons
**Actual:** Basic React app that doesn't read runtime contract or show system status

**Missing Components:**
- No Status Dashboard component
- No runtime contract reader in UI
- No supervisor state display (STOPPED/STARTING/RUNNING/RESTARTING/DEGRADED)
- No service health indicators
- No "Is it running/Where is it running/Why not" quick answers

### ❌ 2) Start the System - **NOT IMPLEMENTED**
**Expected:** Start button with live progress view
**Actual:** No start/stop controls in current UI

**Missing Components:**
- No Start/Stop buttons
- No progress indicators during startup
- No real-time state transition display
- No "Open UI/Open API/Copy URLs" buttons after start

### ❌ 3) Normal Operating Loop - **PARTIALLY IMPLEMENTED**
**Backend:** All runtime data exists in contract
**UI:** Missing all three panels

**Missing Panels:**
- **A. Live Health Panel:** No API health/latency display, no UI reachability checks
- **B. Runtime Contract Viewer:** No read-only contract display in UI
- **C. Receipts and Logs:** No receipt browsing, no filtering, no "Open folder" action

### ✅ 4) Port Conflict Handling - **FULLY IMPLEMENTED**
**Expected:** Auto-selects next available port, updates contract
**Actual:** ✅ Supervisor scans ports 3000-3009 for UI, updates `actual_ui_port` and `actual_api_port`

**Evidence:**
```json
{
  "api_url": "http://127.0.0.1:5000",
  "ui_url": "http://127.0.0.1:3000/",
  "actual_ui_port": 3000,
  "actual_api_port": 5000,
  "api_port_conflict": false
}
```

### ✅ 5) Failure Scenarios - **BACKEND IMPLEMENTED, UI MISSING**

#### ✅ A. Transient Failure - **STATE MACHINE WORKING**
**Backend:** State transitions RUNNING → RESTARTING → RUNNING with backoff
**UI:** No display of restart progress or backoff timers

#### ✅ B. Circuit Breaker - **FULLY IMPLEMENTED**
**Backend:** After 5 failures → DEGRADED state with clear receipts
**UI:** No DEGRADED state display or manual intervention instructions

**Evidence from supervisor:**
```javascript
// Circuit breaker implementation
if (this.consecutiveFailures[service] >= this.failureThreshold) {
  await this.triggerCircuitBreaker(service);
  this.serviceStates[service] = ServiceState.DEGRADED;
}
```

### ❌ 6) Stop the System - **NOT IMPLEMENTED**
**Expected:** Stop button, clean shutdown, stop receipt
**Actual:** No stop controls in UI (supervisor has shutdown logic)

### ❌ 7) Advanced Tools - **NOT IMPLEMENTED**
**Expected:** Reset contract, diagnostics bundle, port config, receipt verbosity
**Actual:** None of these tools exist in current UI

## Runtime Contract Analysis

### ✅ Fields Present vs UX Requirements

| UX Field | Implemented | Contract Field | Status |
|----------|-------------|----------------|---------|
| `api_url` | ✅ | `api_url` | Matches |
| `ui_url` | ✅ | `ui_url` | Matches |
| `actual_api_port` | ✅ | `actual_api_port` | Matches |
| `actual_ui_port` | ✅ | `actual_ui_port` | Matches |
| `state` | ❌ | Missing | **GAP** |
| `run_id` | ❌ | Missing | **GAP** |
| `owner_pid` | ✅ | `supervisor_pid` | Matches |
| `last_failure_reason` | ❌ | Missing | **GAP** |
| Readiness timestamps | ❌ | Missing | **GAP** |

### Missing Contract Fields for UX

```javascript
// Need to add to runtimeContract:
{
  "state": "RUNNING", // ServiceState enum value
  "run_id": "lxk9m2", // Unique supervisor run ID
  "last_failure_reason": null,
  "api_ready_at": "2026-01-23T17:24:02.123Z",
  "ui_ready_at": "2026-01-23T17:24:05.456Z",
  "service_states": {
    "api": "RUNNING",
    "ui": "RUNNING",
    "supervisor": "RUNNING"
  },
  "failure_counters": {
    "api": 0,
    "ui": 0
  }
}
```

## Current UI Analysis

**What exists:** Basic directive management tool
- Directives form and list
- Plan viewer
- Jobs view
- Ops control

**What's missing:** Entire Command Center cockpit UX
- Status dashboard
- Runtime contract viewer
- Service health monitoring
- Start/stop controls
- Receipt browser
- Diagnostic tools

## Required Implementation Work

### 1. Backend Contract Updates ⚡ **Priority 1**
```javascript
// In anx_supervisor.js writeRuntimeFile()
const runtimeContract = {
  // Existing fields...
  state: this.serviceStates.supervisor,
  run_id: this.runId,
  service_states: this.serviceStates,
  last_failure_reason: this.lastFailureReason,
  api_ready_at: this.apiReadyAt,
  ui_ready_at: this.uiReadyAt,
  failure_counters: {
    api: this.consecutiveFailures.api,
    ui: this.consecutiveFailures.ui
  }
};
```

### 2. Command Center UI Components ⚡ **Priority 1**

#### StatusDashboard.js
- Read runtime contract via polling
- Display supervisor/API/UI states with color coding
- Show URLs with "Open" buttons
- Display failure reasons and counters

#### ServiceHealth.js
- API health checks with latency
- UI reachability with latency
- Last check timestamps

#### RuntimeContractViewer.js
- Read-only JSON viewer of contract
- Highlight key fields (ports, states, timestamps)

#### ReceiptsBrowser.js
- List recent receipts with type badges
- Filter by event type
- "Open folder" action

#### SystemControls.js
- Start/Stop buttons
- Progress indicators during transitions
- Backoff timer display during restarts

### 3. Launcher Integration 🔄 **Priority 2**
- Create launcher that starts supervisor and waits for readiness
- Implement acceptance gate that reads contract and returns appropriate exit codes
- Wire up Start/Stop buttons to supervisor lifecycle

## Acceptance Criteria

### Must Have (P1)
1. ✅ **Backend state machine** (already implemented)
2. ✅ **Runtime contract with all UX fields** (needs contract updates)
3. ✅ **Status dashboard** matching UX flow section 1
4. ✅ **Start/Stop controls** matching UX flow sections 2 & 6
5. ✅ **Failure state display** matching UX flow section 5

### Should Have (P2)
1. ✅ **Service health monitoring** (section 3A)
2. ✅ **Runtime contract viewer** (section 3B)
3. ✅ **Receipt browser** (section 3C)
4. ✅ **Port conflict messaging** (section 4)

### Nice to Have (P3)
1. ✅ **Advanced diagnostic tools** (section 7)
2. ✅ **Receipt verbosity controls**
3. ✅ **Port range configuration**

## Conclusion

**The ANX Command Center has excellent backend architecture that fully implements the UX flow's state machine and contract system.** However, **the UI is completely disconnected from this backend** - it's a generic directive tool instead of the specified status cockpit.

**Recommendation:** Build the Command Center UI components to read the runtime contract and provide the dashboard experience described in the UX flow. The backend is ready; we just need the frontend.

---
**Analyzed by:** UX Implementation Review
**Backend Status:** ✅ READY
**UI Status:** ❌ MISSING
**Priority:** Implement Command Center cockpit UI