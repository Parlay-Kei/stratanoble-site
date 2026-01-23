# RELIABILITY SCORE DEFINITIONS V1

**Version:** 1.0
**Date:** 2026-01-22
**Purpose:** Eliminate success rate contradictions with dual-metric system

## Metric Definitions

### 1. Ops Reliability % (Operational Correctness)

**Definition:** Measures whether the system behaved correctly according to operational intent and policies.

**Formula:**
```
Ops Reliability % = (Correct Behaviors / Total Jobs) × 100
```

**Correct Behaviors Include:**
- `PASS` - Job succeeded as intended
- `EXPECTED_FAIL` - Job failed as expected (test negative cases)
- `BLOCKED` - Job correctly blocked by policy (quarantine, degraded mode)
- `STOPPED` - Job correctly halted by kill switch

**Incorrect Behaviors Include:**
- `FAIL` - Unexpected failure (not matching expected patterns)
- `TIMEOUT` - Job exceeded time limits
- `CRASH` - System crash or unhandled exception

**Use Case:** Measures if the autonomy system is operating correctly, including safety mechanisms and test scenarios.

### 2. Shipping Reliability % (Production Success)

**Definition:** Measures pure success rate for production workloads.

**Formula:**
```
Shipping Reliability % = (Successful Jobs / Total Production Jobs) × 100
```

**Successful Jobs:**
- `PASS` status only
- For phases: `validate`, `test`, `build`
- Production intent only (excludes test runs)

**Failed Jobs:**
- Any non-PASS status
- Including BLOCKED, STOPPED (counted as failures for shipping)

**Use Case:** Measures ability to ship code successfully, critical for developer productivity.

## Time Windows

### Standard Windows
- **Real-time:** Last 1 hour
- **Daily:** Last 24 hours (used for sweep scores)
- **Weekly:** Last 7 days (used for digests)
- **Sprint:** 14 days (used for scorecard)

### Window Specification Format
```json
{
  "window_type": "daily",
  "start_time": "2026-01-22T00:00:00Z",
  "end_time": "2026-01-22T23:59:59Z",
  "total_seconds": 86400
}
```

## Denominator Definitions

### Ops Reliability Denominator
```
Total Jobs = COUNT(*) FROM queue
WHERE created_at BETWEEN start_time AND end_time
AND status IN ('COMPLETED', 'FAILED', 'BLOCKED', 'STOPPED', 'TIMEOUT', 'EXPECTED_FAIL')
```

### Shipping Reliability Denominator
```
Total Production Jobs = COUNT(*) FROM queue
WHERE created_at BETWEEN start_time AND end_time
AND json_extract(payload, '$.intent') != 'TEST'
AND json_extract(payload, '$.phase') IN ('validate', 'test', 'build')
AND status != 'PENDING'
```

## Included Outcomes

### Ops Reliability Outcomes
| Outcome | Counted As | Description |
|---------|------------|-------------|
| PASS | Correct | Job completed successfully |
| EXPECTED_FAIL | Correct | Test negative case passed |
| BLOCKED | Correct | Policy correctly blocked job |
| STOPPED | Correct | Kill switch correctly halted job |
| FAIL | Incorrect | Unexpected failure |
| TIMEOUT | Incorrect | Job exceeded time limit |
| CRASH | Incorrect | System failure |

### Shipping Reliability Outcomes
| Outcome | Counted As | Description |
|---------|------------|-------------|
| PASS | Success | Job shipped successfully |
| FAIL | Failure | Job failed to ship |
| BLOCKED | Failure | Blocked from shipping |
| STOPPED | Failure | Halted before shipping |
| TIMEOUT | Failure | Timed out before shipping |
| EXPECTED_FAIL | Excluded | Test runs not counted |

## Failure Classification (Replacing OTHER)

### Deterministic Categories

1. **ENV_TOOLING**
   - Keywords: timeout, connection, network, permission, access, file not found, ENOENT, EACCES
   - Examples: npm install failures, network timeouts, missing dependencies

2. **CODE_TEST**
   - Keywords: test, assertion, expect, jest, vitest, playwright, syntax error, type error
   - Examples: Unit test failures, type checking errors, linting issues

3. **POLICY_BLOCK**
   - Keywords: policy, blocked, quarantine, degraded, budget, limit, threshold, cap
   - Examples: Budget exceeded, rate limited, quarantined repo

4. **RUNTIME**
   - Keywords: memory, heap, stack, segfault, OOM, CPU, disk full
   - Examples: Out of memory, stack overflow, disk space issues

5. **PROOF**
   - Keywords: proof, validation, receipt, verification, witness, artifact
   - Examples: Proof generation failures, validation mismatches

6. **UNCLASSIFIED**
   - No matching keywords
   - Must capture:
     - Raw error signature (first 500 chars)
     - Stderr excerpt (last 1000 chars)
     - Service ID
     - Repository ID
     - Full stack trace if available

### Classification Algorithm
```python
def classify_failure(error_message, stderr, service_id, repo_id):
    error_lower = error_message.lower() if error_message else ""

    # Check each category in order
    if matches_keywords(error_lower, ENV_TOOLING_KEYWORDS):
        return "ENV_TOOLING"
    elif matches_keywords(error_lower, CODE_TEST_KEYWORDS):
        return "CODE_TEST"
    elif matches_keywords(error_lower, POLICY_KEYWORDS):
        return "POLICY_BLOCK"
    elif matches_keywords(error_lower, RUNTIME_KEYWORDS):
        return "RUNTIME"
    elif matches_keywords(error_lower, PROOF_KEYWORDS):
        return "PROOF"
    else:
        # Store raw data for UNCLASSIFIED
        return {
            "category": "UNCLASSIFIED",
            "raw_signature": error_message[:500],
            "stderr_excerpt": stderr[-1000:] if stderr else "",
            "service_id": service_id,
            "repo_id": repo_id,
            "timestamp": datetime.now().isoformat()
        }
```

## Display Format

### Dual Metric Display
```
═══════════════════════════════════════════════════════════════
RELIABILITY METRICS (24h window: 2026-01-22 00:00 - 23:59 UTC)
═══════════════════════════════════════════════════════════════

Ops Reliability:      72.5% ↑    [PASS+EXPECTED_FAIL+BLOCKED+STOPPED / ALL]
                               Denominator: 200 total jobs
                               Correct: 145 | Incorrect: 55

Shipping Reliability: 68.8% ↓    [PASS only / PRODUCTION JOBS]
                               Denominator: 160 production jobs
                               Successful: 110 | Failed: 50
═══════════════════════════════════════════════════════════════
```

## Migration Notes

### From Single Metric to Dual Metric
- Previous "Success Rate" → Split into Ops/Shipping
- Previous "OTHER" category → Split into 6 deterministic categories
- Previous ambiguous denominators → Explicit SQL definitions

### Backwards Compatibility
- Old reports show "Success Rate: 68.8%"
- New reports show both metrics
- Historical data recomputed with new definitions

---
Generated by: Reliability Clarity Patch V1
Type: Metric Definition Document