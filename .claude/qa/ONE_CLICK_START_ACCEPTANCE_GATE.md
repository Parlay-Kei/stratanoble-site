# One-Click Start Acceptance Gate

**Version:** 1.0
**Component:** ANX Command Center One-Click Starter
**Policy:** ZERO MANUAL STEPS REQUIRED

## Overview

This acceptance gate validates that the ANX Command Center can be started and accessed through a single action with complete automation. The system must launch, validate health, discover UI configuration, and open the browser automatically within 30 seconds.

## Test Requirements

### 1. Single Action Launch
- **Test ID:** GATE-OCS-001
- **Description:** One PowerShell script execution starts entire system
- **Success Criteria:**
  - Script executes without user prompts
  - No additional manual steps required
  - Complete process automation from start to UI access
- **Failure Modes:** FAIL if any manual intervention required

### 2. Supervisor Management
- **Test ID:** GATE-OCS-002
- **Description:** Supervisor starts automatically via best available method
- **Success Criteria:**
  - If scheduled task exists: starts via task
  - If no scheduled task: starts via direct process
  - Supervisor becomes operational within 10 seconds
- **Failure Modes:** FAIL if supervisor cannot be started

### 3. API Health Validation
- **Test ID:** GATE-OCS-003
- **Description:** API health endpoint responds within timeout
- **Success Criteria:**
  - GET /health returns 200 OK within 30 seconds
  - Response contains {"status": "healthy"}
  - Health polling succeeds before timeout
- **Failure Modes:** FAIL if health check times out or returns error

### 4. UI Discovery and Access
- **Test ID:** GATE-OCS-004
- **Description:** UI URL discovered and browser launched automatically
- **Success Criteria:**
  - Script detects if API serves UI directly (port 5000)
  - Or discovers dedicated UI server port (default 3000)
  - Browser opens to correct URL automatically
  - URL printed to console for verification
- **Failure Modes:** FAIL if browser doesn't launch or wrong URL

### 5. End-to-End Functionality
- **Test ID:** GATE-OCS-005
- **Description:** UI can submit a directive successfully
- **Success Criteria:**
  - UI loads completely in browser
  - User can submit a test directive
  - Directive appears in Command Center queue
  - Full workflow operational
- **Failure Modes:** FAIL if UI non-functional or directive submission fails

### 6. Receipt Generation
- **Test ID:** GATE-OCS-006
- **Description:** Startup receipt generated with complete details
- **Success Criteria:**
  - Receipt created at receipts/COMMAND_CENTER_ONE_CLICK_START_RECEIPT.md
  - Contains startup sequence details
  - Documents discovery method and timing
  - Includes success/failure status
- **Failure Modes:** FAIL if no receipt generated or incomplete data

## Pass/Fail Criteria

### GATE PASS Requirements
- **All tests PASS (6/6)**
- **Total startup time < 30 seconds**
- **Zero manual intervention**
- **Browser launches automatically**
- **UI fully functional**
- **Receipt generation successful**

### GATE FAIL Triggers
- **Any test FAILS**
- **Startup time exceeds 30 seconds**
- **Manual steps required**
- **Browser fails to launch**
- **UI non-responsive**
- **Missing or incomplete receipt**

## Test Execution Procedure

### Pre-Test Setup
1. Ensure Command Center services are stopped
2. Close any open browser tabs to Command Center
3. Clear any existing startup receipts
4. Verify PowerShell execution policy allows scripts

### Test Sequence
1. Execute: `powershell -ExecutionPolicy Bypass -File start_command_center.ps1`
2. Measure total time from execution to browser opening
3. Verify health endpoint accessibility
4. Test directive submission in UI
5. Validate receipt generation
6. Check all success criteria

### Desktop Shortcut Test
1. Install shortcut: `powershell -ExecutionPolicy Bypass -File install_shortcut.ps1`
2. Double-click "ANX Command Center" desktop shortcut
3. Verify identical behavior to script execution
4. Confirm hidden window mode (no PowerShell visible)

## Success Indicators

✅ **Single Action:** One script execution or shortcut click
✅ **Automatic Startup:** Supervisor starts without intervention
✅ **Health Validation:** API responds within timeout
✅ **UI Discovery:** Correct port detected and used
✅ **Browser Launch:** Automatic opening to correct URL
✅ **Functional UI:** Directive submission works
✅ **Receipt Generation:** Complete startup documentation

## Failure Modes

❌ **Multiple Steps Required:** Any manual intervention needed
❌ **Supervisor Fails:** Cannot start or becomes non-responsive
❌ **Health Timeout:** API doesn't respond within 30 seconds
❌ **Wrong UI URL:** Incorrect port or URL detection
❌ **Browser Failure:** Doesn't launch or opens wrong page
❌ **UI Malfunction:** Cannot submit directives or non-responsive
❌ **Missing Receipt:** No documentation generated

## Implementation Files

- **Launcher:** `scripts/start_command_center.ps1`
- **Shortcut Installer:** `scripts/install_shortcut.ps1`
- **Supervisor:** `tools/command-center/supervisor/anx_supervisor.js`
- **Health Endpoint:** `/api/health`
- **Receipt Location:** `receipts/COMMAND_CENTER_ONE_CLICK_START_RECEIPT.md`

## Compliance Requirements

- **Local-Only:** All services remain bound to 127.0.0.1
- **Zero Manual Steps:** Complete automation required
- **Proof Generation:** Receipt documents entire startup process
- **Error Handling:** Graceful failure with diagnostic information
- **Performance:** Startup within 30-second timeout

## Expected Behavior

### Successful Launch Sequence
```
[10:30:01] [INFO] ANX Command Center - One-Click Starter V1
[10:30:01] [INFO] ===============================================
[10:30:02] [INFO] Starting ANX Supervisor...
[10:30:02] [INFO] Found scheduled task: ANXCommandCenterSupervisor
[10:30:03] [INFO] Polling API health at http://127.0.0.1:5000/health...
[10:30:05] [SUCCESS] API health check passed
[10:30:05] [INFO] Using UI port from supervisor config: 3000
[10:30:05] [SUCCESS] Command Center UI URL: http://127.0.0.1:3000/
[10:30:06] [SUCCESS] Browser launched successfully
[10:30:06] [SUCCESS] Receipt written to: receipts/COMMAND_CENTER_ONE_CLICK_START_RECEIPT.md
[10:30:06] [SUCCESS] Command Center started successfully!
```

### Receipt Content Validation
```markdown
# Command Center One-Click Start Receipt
**Status:** SUCCESS
**Launch Method:** One-Click Starter V1
**UI URL:** http://127.0.0.1:3000/
**Total Launch Time:** < 30 seconds
```

---

**Gate Version:** 1.0
**Zero Manual Steps Policy:** ENFORCED
**Automation Requirement:** COMPLETE