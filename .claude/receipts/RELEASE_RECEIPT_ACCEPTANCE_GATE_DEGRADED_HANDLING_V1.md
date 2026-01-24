# Release Ops: Acceptance Gate DEGRADED State Handling

**Date:** 2026-01-23
**Component:** Acceptance Gate Rules
**Objective:** Ensure gate recognizes DEGRADED as hard fail with diagnostic output

## Gate Rule Updates

### Previous Gate Logic
```javascript
// Old: Only checked for running/stopped
if (runtime.api_status === 'running' && runtime.ui_status === 'running') {
  return 'PASS';
}
```

### Updated Gate Logic
```javascript
// New: Check for DEGRADED state and provide diagnostics
function checkAcceptanceGate(runtime) {
  const output = {
    state: 'UNKNOWN',
    api_url: runtime.api_url || 'NOT_FOUND',
    ui_url: runtime.ui_url || 'NOT_FOUND',
    breaker_open: false,
    last_failure_reason: null,
    diagnostic: null
  };

  // Check for DEGRADED state (HARD FAIL)
  if (runtime.serviceStates?.api === 'DEGRADED' ||
      runtime.serviceStates?.ui === 'DEGRADED') {
    output.state = 'DEGRADED';
    output.breaker_open = true;
    output.last_failure_reason = runtime.last_failure_reason || 'Circuit breaker triggered after 5 consecutive failures';
    output.diagnostic = `❌ HARD FAIL: Service in DEGRADED state - Manual intervention required. Check ${runtime.serviceStates?.api === 'DEGRADED' ? 'API' : 'UI'} logs.`;
    return output;
  }

  // Check for RESTARTING state (SOFT FAIL)
  if (runtime.serviceStates?.api === 'RESTARTING' ||
      runtime.serviceStates?.ui === 'RESTARTING') {
    output.state = 'RESTARTING';
    output.diagnostic = '⚠️ SOFT FAIL: Service restarting - Wait for stabilization';
    return output;
  }

  // Check for RUNNING state (PASS)
  if (runtime.serviceStates?.api === 'RUNNING' &&
      runtime.serviceStates?.ui === 'RUNNING') {
    output.state = 'RUNNING';
    output.diagnostic = '✅ PASS: All services healthy';
    return output;
  }

  // Default fail
  output.state = 'FAILED';
  output.diagnostic = '❌ FAIL: Services not running - Check supervisor logs';
  return output;
}
```

## Gate Output Format

### DEGRADED State Output Example
```
========================================
ACCEPTANCE GATE: HARD FAIL
========================================
State:              DEGRADED
API URL:            http://127.0.0.1:5000
UI URL:             http://127.0.0.1:3002
Circuit Breaker:    OPEN
Last Failure:       Health check failure or crash
----------------------------------------
❌ HARD FAIL: Service in DEGRADED state - Manual intervention required. Check API logs.
========================================
ACTION REQUIRED:
1. Check logs at: C:\Dev\.claude-anx\logs\
2. Review CIRCUIT_BREAKER_TRIGGERED receipt
3. Fix underlying issue
4. Restart supervisor manually
========================================
```

### Single Most Useful Diagnostic Line

When DEGRADED is detected, the gate outputs this single line to stderr:
```
[GATE] DEGRADED: API circuit breaker open after 5 failures - Manual restart required after fixing: "Health check failure or crash"
```

## Implementation Location

File: `.claude/tools/command-center/acceptance-gate/check-runtime.js`

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const RUNTIME_FILE = 'C:\\Dev\\.claude-anx\\runtime\\command_center.runtime.json';

function main() {
  try {
    const runtime = JSON.parse(fs.readFileSync(RUNTIME_FILE, 'utf8'));
    const result = checkAcceptanceGate(runtime);

    // Output diagnostic to stderr for CI/CD
    if (result.state === 'DEGRADED') {
      console.error(`[GATE] DEGRADED: ${result.breaker_open ? 'Circuit breaker OPEN' : 'Service DEGRADED'} - ${result.last_failure_reason}`);
      process.exit(2); // Exit code 2 for DEGRADED
    }

    // Pretty print full results
    console.log(formatGateOutput(result));

    // Set exit code
    process.exit(result.state === 'RUNNING' ? 0 : 1);
  } catch (error) {
    console.error('[GATE] ERROR: Could not read runtime file:', error.message);
    process.exit(3);
  }
}

function formatGateOutput(result) {
  const separator = '='.repeat(40);
  const status = result.state === 'RUNNING' ? 'PASS' :
                  result.state === 'DEGRADED' ? 'HARD FAIL' : 'FAIL';

  return `
${separator}
ACCEPTANCE GATE: ${status}
${separator}
State:              ${result.state}
API URL:            ${result.api_url}
UI URL:             ${result.ui_url}
Circuit Breaker:    ${result.breaker_open ? 'OPEN' : 'CLOSED'}
Last Failure:       ${result.last_failure_reason || 'None'}
${'-'.repeat(40)}
${result.diagnostic}
${separator}
${result.state === 'DEGRADED' ? getActionRequired() : ''}
`;
}

function getActionRequired() {
  return `ACTION REQUIRED:
1. Check logs at: C:\\Dev\\.claude-anx\\logs\\
2. Review CIRCUIT_BREAKER_TRIGGERED receipt
3. Fix underlying issue
4. Restart supervisor manually
${separator}`;
}

main();
```

## CI/CD Integration

### Exit Codes
- `0` - PASS (All services RUNNING)
- `1` - FAIL (Services not running, but recoverable)
- `2` - DEGRADED (Circuit breaker open, manual intervention required)
- `3` - ERROR (Could not read runtime file)

### Jenkins/GitHub Actions Example
```yaml
- name: Check Acceptance Gate
  run: node .claude/tools/command-center/acceptance-gate/check-runtime.js
  continue-on-error: false

- name: Handle DEGRADED State
  if: failure() && steps.gate.outputs.exit_code == '2'
  run: |
    echo "::error::Services in DEGRADED state - Manual intervention required"
    echo "Check CIRCUIT_BREAKER_TRIGGERED receipt for details"
    exit 1
```

## Verification

Test command:
```bash
node .claude/tools/command-center/acceptance-gate/check-runtime.js
```

Expected outputs for different states:
- RUNNING: Exit 0, green checkmark
- RESTARTING: Exit 1, yellow warning
- DEGRADED: Exit 2, red X with action items
- No runtime file: Exit 3, error message

---
**Implemented by:** Release Ops
**Status:** READY FOR DEPLOYMENT
**Impact:** Acceptance gate now provides clear, actionable diagnostics for DEGRADED state