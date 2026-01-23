# ONE-CLICK AUTOOPEN ACCEPTANCE GATE V1

**Gate ID:** GATE-AUTOOPEN-V1
**Created:** 2026-01-23
**Objective:** Validate Command Center one-click autoopen functionality
**Policy:** NO SKIP - All tests must pass

## Gate Overview

This acceptance gate validates the complete one-click autoopen workflow for ANX Command Center. The directive requires that users can launch Command Center with a single action (desktop shortcut or launcher script) and have it automatically open in their browser within 30 seconds with zero manual steps.

## Prerequisites

- ANX Command Center supervisor and API components installed
- Node.js available in PATH
- PowerShell execution policy allows script execution
- Desktop and Start Menu shortcut installation completed

## Test Cases

### GATE-AUTOOPEN-001: Single Action Desktop Launch
**Objective:** Verify desktop shortcut provides one-click access to Command Center

**Test Steps:**
1. Double-click "ANX Command Center" desktop shortcut
2. Observe system behavior (no user interaction required)
3. Wait up to 30 seconds for browser to open
4. Verify Command Center UI loads in browser

**Pass Criteria:**
- Browser opens automatically within 30 seconds
- Command Center UI loads successfully
- No user prompts or manual steps required
- Receipt generated documenting successful launch

**Test Data:**
- Desktop shortcut path: `%USERPROFILE%\Desktop\ANX Command Center.lnk`
- Expected target: `powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "C:\Dev\.claude-anx\scripts\start_command_center.ps1" -Silent`

### GATE-AUTOOPEN-002: Start Menu Launch
**Objective:** Verify Start Menu shortcut provides one-click access to Command Center

**Test Steps:**
1. Navigate to Start Menu > Programs
2. Click "ANX Command Center" entry
3. Observe system behavior (no user interaction required)
4. Wait up to 30 seconds for browser to open
5. Verify Command Center UI loads in browser

**Pass Criteria:**
- Browser opens automatically within 30 seconds
- Command Center UI loads successfully
- No user prompts or manual steps required
- Start Menu integration works correctly

**Test Data:**
- Start Menu shortcut path: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\ANX Command Center.lnk`
- Expected behavior: Identical to desktop shortcut

### GATE-AUTOOPEN-003: Runtime Contract Validation
**Objective:** Verify runtime contract eliminates port guessing

**Test Steps:**
1. Execute launcher script: `powershell -ExecutionPolicy Bypass -File C:\Dev\.claude-anx\scripts\start_command_center.ps1`
2. Verify runtime contract file is created: `C:\Dev\.claude-anx\runtime\command_center.runtime.json`
3. Validate contract contains required fields
4. Verify browser opens to exact URL from contract

**Pass Criteria:**
- Runtime contract file exists and is valid JSON
- Contract contains: `api_url`, `ui_url`, `started_at`, `supervisor_pid`, `health_endpoint`, `api_status`, `ui_status`, `last_updated`
- Browser opens to exact `ui_url` from contract (no port guessing)
- API health endpoint returns 200 OK

**Test Data:**
```json
Expected contract structure:
{
  "api_url": "http://127.0.0.1:5000",
  "ui_url": "http://127.0.0.1:3000/",
  "started_at": "2026-01-23T...",
  "supervisor_pid": 12345,
  "health_endpoint": "http://127.0.0.1:5000/health",
  "api_status": "running",
  "ui_status": "running",
  "last_updated": "2026-01-23T..."
}
```

### GATE-AUTOOPEN-004: API Health Validation
**Objective:** Verify API health check functionality

**Test Steps:**
1. Launch Command Center via any method
2. Wait for launcher to poll API health
3. Verify health endpoint responds correctly
4. Confirm browser only opens after health check passes

**Pass Criteria:**
- API health endpoint (`/health`) returns HTTP 200
- Health response contains `{"status": "healthy"}` or similar
- Launcher waits for health check before opening browser
- Timeout handling works (30-second maximum wait)

**Test Data:**
- Health endpoint: `http://127.0.0.1:5000/health`
- Expected response: HTTP 200 with JSON body containing status field

### GATE-AUTOOPEN-005: End-to-End API Functionality
**Objective:** Verify Command Center API is fully operational

**Test Steps:**
1. Launch Command Center and wait for browser to open
2. Verify UI loads completely
3. Test API endpoint: GET `/api/directives`
4. Verify UI can communicate with API

**Pass Criteria:**
- Command Center UI renders without errors
- Directives list loads (even if empty)
- API endpoints respond correctly
- Full stack integration works end-to-end

**Test Data:**
- API base URL: From runtime contract `api_url` field
- Test endpoint: `/api/directives`
- Expected: Valid JSON response (may be empty array)

### GATE-AUTOOPEN-006: Receipt Generation and Audit Trail
**Objective:** Verify comprehensive receipt generation

**Test Steps:**
1. Launch Command Center via launcher script
2. Verify receipt is generated in receipts directory
3. Check receipt contains all required information
4. Validate receipt format and completeness

**Pass Criteria:**
- Receipt file created: `C:\Dev\.claude-anx\receipts\COMMAND_CENTER_ONE_CLICK_AUTOOPEN_RECEIPT.md`
- Receipt contains: timestamp, status, URLs opened, health check results, startup sequence details
- Receipt format is markdown and human-readable
- Error scenarios also generate receipts with diagnostic info

**Test Data:**
- Receipt directory: `C:\Dev\.claude-anx\receipts\`
- Receipt naming: `COMMAND_CENTER_ONE_CLICK_AUTOOPEN_RECEIPT.md`
- Required sections: Status, Runtime Contract, API Health, Browser Launch, Success Metrics

## Error Handling Tests

### GATE-AUTOOPEN-ERR-001: Supervisor Start Failure
**Test:** Node.js not in PATH
**Expected:** Clear error message, receipt with diagnostic info

### GATE-AUTOOPEN-ERR-002: API Health Timeout
**Test:** API fails to start within 30 seconds
**Expected:** Timeout message, receipt with error details, no browser launch

### GATE-AUTOOPEN-ERR-003: Runtime Contract Missing
**Test:** Runtime file doesn't exist or is invalid
**Expected:** Error logged, receipt generated, clear user guidance

### GATE-AUTOOPEN-ERR-004: Browser Launch Failure
**Test:** Browser cannot be launched
**Expected:** Error logged, manual URL provided in output

## Performance Requirements

- **Total Launch Time:** < 30 seconds from shortcut click to browser UI
- **API Health Response:** < 5 seconds after API starts
- **Browser Launch:** < 2 seconds after health check passes
- **Receipt Generation:** < 1 second for all scenarios

## Security and Compliance

- **Local-Only Binding:** All services remain on 127.0.0.1
- **No External Dependencies:** Launcher works offline
- **Execution Policy:** Uses bypass only for specific launcher script
- **Hidden Execution:** PowerShell windows hidden from user

## Gate Execution

### Manual Testing Protocol
1. Fresh Windows session (restart recommended)
2. Execute each test case in sequence
3. Document results with timestamps
4. Verify all receipts are generated
5. Check error handling scenarios

### Automated Testing (Future)
- PowerShell test harness for gate validation
- Continuous integration gate checks
- Performance regression detection

## Pass/Fail Criteria

**PASS Requirements:**
- All 6 primary test cases pass
- Performance requirements met
- Error handling tests demonstrate graceful failure
- Receipts generated for all scenarios
- Zero manual steps required after initial shortcut click

**FAIL Conditions:**
- Any primary test case fails
- Manual user intervention required
- Browser doesn't open automatically
- Port guessing occurs (runtime contract not used)
- Performance requirements not met
- Missing or incomplete receipts

## Gate Completion

**Gate Status:** PENDING
**Last Tested:** Not yet executed
**Next Test Date:** Required before release

**Approval Required:** YES (NO SKIP POLICY)
**Approved By:** [Pending]
**Approval Date:** [Pending]

## Notes

This gate enforces the core directive requirement of "zero manual steps, zero port guessing" for Command Center access. The NO SKIP policy ensures that the one-click autoopen functionality works reliably for all users before deployment.

All test cases must be verified in a clean environment to ensure the one-click experience works for new users without pre-existing Command Center sessions.