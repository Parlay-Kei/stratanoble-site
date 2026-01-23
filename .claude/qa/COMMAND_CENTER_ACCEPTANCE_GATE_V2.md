# Command Center Acceptance Gate V2

**Version:** 2.0
**Component:** ANX Command Center with Supervisor
**Policy:** NO SKIP ALLOWED

## Overview

Acceptance Gate V2 eliminates the manual start requirement by enforcing that all components must be operational before declaring system ready. Unlike V1 which allowed SKIP results, V2 requires the supervisor to start services automatically and validates full end-to-end functionality.

## Test Requirements

### 1. Database Connectivity
- **Test ID:** GATE-V2-001
- **Description:** Verify all required database tables are accessible
- **Success Criteria:**
  - Core tables: directives, plans, queue, runtime_jobs
  - Supervisor tables: supervisor_events, supervisor_heartbeats
  - All table queries execute successfully
- **Failure Modes:** FAIL (no SKIP allowed)

### 2. Supervisor Startup
- **Test ID:** GATE-V2-002
- **Description:** Supervisor can start and manage services automatically
- **Success Criteria:**
  - If services already running, supervisor is operational
  - If services down, supervisor starts them within 60 seconds
  - API becomes available and responsive
- **Failure Modes:** FAIL if supervisor cannot start services

### 3. API Server (Mandatory)
- **Test ID:** GATE-V2-003
- **Description:** API server MUST be reachable and functional
- **Success Criteria:**
  - GET /api/health responds within 10 seconds
  - GET /api/directives returns 200 OK
  - API fully operational through supervisor management
- **Failure Modes:** FAIL (no SKIP allowed) - "supervisor failed to start services"

### 4. UI Integration
- **Test ID:** GATE-V2-004
- **Description:** UI can communicate with API
- **Success Criteria:**
  - UI can fetch directives through API
  - HTTP 200 response for directive listing
  - Full UI-API communication validated
- **Failure Modes:** FAIL if communication broken

### 5. Supervisor Stop/Restart
- **Test ID:** GATE-V2-005
- **Description:** Supervisor produces SYSTEM receipts for lifecycle events
- **Success Criteria:**
  - STOPPED receipt generated on graceful shutdown
  - STARTED receipt generated on restart
  - Receipt count increases during test
- **Failure Modes:** FAIL if no receipts generated, SKIP if no supervisor process

### 6. Health Monitoring
- **Test ID:** GATE-V2-006
- **Description:** Health monitoring and heartbeat recording
- **Success Criteria:**
  - Recent heartbeats found in database
  - API/UI status recorded correctly
  - Monitoring active within test timeframe
- **Failure Modes:** FAIL if no heartbeats recorded

### 7. End-to-End Execution
- **Test ID:** GATE-V2-007
- **Description:** Complete directive flow through supervisor-managed services
- **Success Criteria:**
  - Create directive via API
  - Directive persisted to database
  - Full flow completed successfully
- **Failure Modes:** FAIL if any step in chain breaks

## V2 Improvements Over V1

| Aspect | V1 Behavior | V2 Behavior |
|--------|-------------|-------------|
| API Availability | SKIP if not running | FAIL - supervisor must start it |
| Component Testing | Manual verification | Automatic startup and validation |
| Service Management | Manual start required | Supervisor handles all services |
| Error Tolerance | SKIP allowed for missing components | Zero tolerance - all must work |
| Receipt Validation | Not tested | SYSTEM receipt generation verified |
| Health Monitoring | Not validated | Active monitoring required |

## Pass/Fail Criteria

### GATE PASS Requirements
- **All tests PASS (7/7)**
- **Zero SKIP results**
- **Zero FAIL results**
- **Supervisor operational**
- **Services auto-started**

### GATE FAIL Triggers
- **Any test FAILS**
- **Any test SKIPS**
- **Services not auto-starting**
- **Manual intervention required**

## Test Execution

### Pre-Test Setup
1. Stop any running Command Center services
2. Ensure supervisor is not running
3. Clear any existing test data
4. Verify Node.js and dependencies available

### Test Sequence
1. Start gate runner
2. Gate runner attempts to start supervisor
3. Wait for services to become available (max 60s)
4. Execute all 7 test cases in sequence
5. Generate V2 receipt with results

### Post-Test Cleanup
1. Stop test supervisor process
2. Generate final receipts
3. Archive test results
4. Restore system to known state

## Success Indicators

✅ **No manual intervention required**
✅ **All services auto-start via supervisor**
✅ **API responds within 10 seconds**
✅ **UI-API communication functional**
✅ **SYSTEM receipts generated**
✅ **Health monitoring active**
✅ **End-to-end directive flow works**

## Failure Modes

❌ **Services require manual start**
❌ **API not reachable after 60s**
❌ **Supervisor fails to start services**
❌ **No SYSTEM receipts generated**
❌ **Health monitoring inactive**
❌ **Database connectivity issues**
❌ **End-to-end flow broken**

## Implementation Files

- **Gate Runner:** `run_acceptance_gates_v2.py`
- **Supervisor:** `anx_supervisor.js`
- **Install Script:** `install_command_center_service.ps1`
- **Health Endpoint:** `/api/health`
- **Receipt Location:** `receipts/COMMAND_CENTER_ACCEPTANCE_GATE_V2_*.md`

## Compliance Requirements

- **Local-Only:** All services bind to 127.0.0.1
- **Zero Manual Steps:** Complete automation required
- **Proof Generation:** SYSTEM receipts for all events
- **Health Validation:** Active monitoring verified
- **Integration Testing:** End-to-end flow validated

---

**Gate Version:** V2.0
**Zero Tolerance Policy:** NO SKIP ALLOWED
**Automation Requirement:** SUPERVISOR MANAGED