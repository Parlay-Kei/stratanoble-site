# ANX Autonomy V3 Acceptance Gate V2

**Version:** 2.0.0
**Date:** 2025-01-22
**Status:** READY FOR EXECUTION

## Executive Summary

This acceptance gate validates the critical gap fixes for Autonomy V3:
- Kill switch receipt generation
- Expected failure semantics
- Enhanced weekly digest
- Rollback proof requirements

## Acceptance Criteria

### Score Requirements
- **Minimum Score:** 7/7 (100%)
- **Critical Tests:** ACC-001, ACC-002, ACC-003, ACC-004
- **All tests must pass to achieve V3 certification**

## Test Suite

### ACC-001: Standard Success Flow
**Objective:** Verify normal job processing with PASS outcome

```json
{
  "ticket_id": "ACC-001",
  "type": "command",
  "command": "echo 'Success test'",
  "run_intent": "TEST_POSITIVE"
}
```

**Expected Outcome:**
- Status: COMPLETED
- run_outcome: PASS
- Receipt generated with run_intent and run_outcome
- No exception ticket created

---

### ACC-002: Expected Failure Semantics
**Objective:** Verify TEST_NEGATIVE with expected failure pattern matching

```json
{
  "ticket_id": "ACC-002",
  "type": "command",
  "command": "exit 1 && echo 'pattern_not_found'",
  "run_intent": "TEST_NEGATIVE",
  "expected_failure": "pattern_not_found"
}
```

**Expected Outcome:**
- Status: COMPLETED
- run_outcome: EXPECTED_FAIL
- Receipt shows EXPECTED_FAIL
- **NO exception ticket created** (critical requirement)
- Event logged to DB as EXPECTED_FAILURE

---

### ACC-003: Budget Block Simulation
**Objective:** Verify budget blocking with proper receipts

```json
{
  "ticket_id": "ACC-003",
  "type": "command",
  "command": "echo 'Should be blocked'",
  "run_intent": "TEST_POSITIVE",
  "simulate_budget_block": true
}
```

**Expected Outcome:**
- Status: BLOCKED
- run_outcome: BLOCKED
- Receipt shows BLOCKED with reason "Budget limit exceeded"
- Job marked as BLOCKED in queue

---

### ACC-004: Kill Switch Activation/Deactivation
**Objective:** Verify kill switch generates SYSTEM receipts and DB events

**Test Sequence:**
1. Set kill_switch = true in autonomy_config
2. Runner detects kill switch
3. Verify SYSTEM receipt created:
   - Type: KILL_SWITCH
   - Status: STOPPED
   - Event logged to DB
4. Set kill_switch = false
5. Verify RESUMED receipt created:
   - Type: KILL_SWITCH
   - Status: RESUMED
   - Event logged to DB

**Expected Artifacts:**
- `runs/SYSTEM/kill-switch-*/system_receipt.json`
- `runs/SYSTEM/resumed-*/system_receipt.json`
- Events in DB with types: KILL_SWITCH_ACTIVATED, KILL_SWITCH_DEACTIVATED

---

## Validation Checklist

### Kill Switch Receipts ✓
- [ ] SYSTEM receipts generated when kill switch activated
- [ ] RESUMED receipts generated when kill switch deactivated
- [ ] Events logged to DB events table
- [ ] Runner properly pauses/resumes operations

### Expected Failure Semantics ✓
- [ ] run_intent field properly tracked (PROD | TEST_POSITIVE | TEST_NEGATIVE)
- [ ] run_outcome field properly set (PASS | FAIL | EXPECTED_FAIL | BLOCKED | STOPPED)
- [ ] EXPECTED_FAIL does not create exception tickets
- [ ] Pattern matching works for TEST_NEGATIVE

### Weekly Digest Enhancements ✓
- [ ] Runner uptime calculated from heartbeats
- [ ] Job counts by outcome displayed
- [ ] Exception categories aggregated
- [ ] Kill switch events tracked and reported
- [ ] Last kill switch transition highlighted

### Rollback Proof Requirements ✓
- [ ] Rollback operations require proof validation
- [ ] Pre-rollback quality gate enforced
- [ ] Post-rollback validation executed
- [ ] Rollback proofs written to `.rollback-proofs/`
- [ ] QA validator checks rollback proof existence

---

## Execution Instructions

### 1. Database Setup
```bash
# Apply migrations
python C:\Dev\.claude-anx\scripts\migrate_runner_v2.py

# Initialize if needed
python C:\Dev\.claude-anx\scripts\init_db.py
```

### 2. Run Test Suite
```bash
# Queue all acceptance tests
python C:\Dev\.claude-anx\scripts\queue_acceptance_jobs.py

# Start runner
python C:\Dev\.claude-anx\autonomy\runner.py
```

### 3. Verify Results
```bash
# Check receipts
dir C:\Dev\.claude-anx\runs\ACC-* /s

# Generate weekly digest
python C:\Dev\.claude-anx\scripts\weekly_digest.py

# View digest
type C:\Dev\.claude-anx\receipts\WEEKLY_DIGEST_*.md
```

### 4. Kill Switch Test
```bash
# Activate kill switch
python -c "import sqlite3; conn = sqlite3.connect(r'C:\Dev\.claude-anx\state\anx_state.db'); conn.execute(\"UPDATE autonomy_config SET value='true' WHERE key='kill_switch'\"); conn.commit()"

# Wait for runner to detect (check logs)

# Deactivate kill switch
python -c "import sqlite3; conn = sqlite3.connect(r'C:\Dev\.claude-anx\state\anx_state.db'); conn.execute(\"UPDATE autonomy_config SET value='false' WHERE key='kill_switch'\"); conn.commit()"

# Verify SYSTEM receipts
dir C:\Dev\.claude-anx\runs\SYSTEM\* /s
```

---

## Success Criteria

**PASS Requirements:**
- All 4 acceptance tests complete successfully
- Kill switch receipts properly generated
- EXPECTED_FAIL does not create exception tickets
- Weekly digest shows all new metrics
- Rollback proof validation enforced

**Score Calculation:**
- ACC-001 PASS: +2 points (basic flow)
- ACC-002 EXPECTED_FAIL: +2 points (critical semantics)
- ACC-003 BLOCKED: +1 point (budget control)
- ACC-004 KILL_SWITCH: +2 points (operational control)
- **Total: 7/7 points**

---

## Rollback Validation

To verify rollback proof requirements:

1. Attempt rollback without proof:
```javascript
// Should fail - no proof provided
await rollbackRelease({ targetVersion: '1.0.0' })
```

2. Execute with proof generation:
```javascript
// Should succeed and generate proof
await rollbackRelease({
  targetVersion: '1.0.0',
  reason: 'Testing rollback proofs'
})
```

3. Check proof existence:
```bash
dir .rollback-proofs\rollback-*.json
```

---

## Certification

Upon successful completion of all tests:

1. **Score:** 7/7 (100%)
2. **Status:** V3 CERTIFIED
3. **Gaps Closed:**
   - Kill switch receipts ✓
   - Expected failure semantics ✓
   - Weekly digest enhancements ✓
   - Rollback proof requirements ✓

## Proof Pack Contents

The following artifacts constitute the V3 acceptance proof pack:

1. `receipts/AUTONOMY_V3_GAP_FIX_RECEIPT.md` - Gap fix summary
2. `runs/ACC-001/*/receipt.json` - PASS test receipt
3. `runs/ACC-002/*/receipt.json` - EXPECTED_FAIL receipt
4. `runs/ACC-003/*/receipt.json` - BLOCKED receipt
5. `runs/SYSTEM/kill-switch-*/system_receipt.json` - Kill switch receipt
6. `runs/SYSTEM/resumed-*/system_receipt.json` - Resume receipt
7. `receipts/WEEKLY_DIGEST_*.md` - Enhanced digest with new metrics
8. `.rollback-proofs/*.json` - Rollback proof samples

---

## Notes

- No manual intervention required except kill switch toggle for ACC-004
- All tests are idempotent and can be re-run
- Database migrations are backward compatible
- System continues operating normally during tests