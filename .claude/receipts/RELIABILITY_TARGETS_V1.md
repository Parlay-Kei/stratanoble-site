# RELIABILITY TARGETS V2 (CLARITY PATCH)

**Date:** 2026-01-22
**Objective:** Dual metrics system - eliminate contradictions
**Ops Target:** Raise operational correctness to >=90%
**Shipping Target:** Raise production success to >=85%
**Timeline:** 14 Shipping Factory sweeps

## Current State Analysis

Based on FAILURE_TAXONOMY_V1.md:
- **Current Success Rate:** 68.8% (11 successes / 16 total jobs)
- **Target Success Rate:** 85%
- **Gap:** 16.2 percentage points
- **Required Improvement:** Reduce failures by ~50%

## Top 2 Failure Causes by Impact

### 1. BUDGET_EXCEEDED (35% of failures)
**Impact:** 2 failures causing degraded mode triggers
**Root Cause:** Jobs exceeding budget caps during peak operations
**Pattern:** Occurs primarily during build phases and parallel test runs

**Fix Strategy:**
- Implement dynamic budget allocation based on job type
- Add pre-flight budget estimation before job execution
- Create budget pooling for related jobs

**Owner:** Platform Ops (Automated)
**Expected Lift:** +10% success rate

**Implementation:**
```python
# Budget optimization algorithm
def optimize_budget(job_type, historical_usage):
    base_budget = {"build": 100, "test": 50, "validate": 20}
    safety_factor = 1.2
    return base_budget.get(job_type, 30) * safety_factor
```

### 2. OTHER/Unknown Errors (40% of failures)
**Impact:** 2 failures with unclear root causes
**Root Cause:** Unclassified errors, missing error handling
**Pattern:** Random occurrences without clear pattern

**Fix Strategy:**
- Enhance error classification system
- Add comprehensive error wrapping
- Implement retry with exponential backoff

**Owner:** Reliability Team (Automated)
**Expected Lift:** +8% success rate

**Implementation:**
```python
# Enhanced retry mechanism
def retry_with_classification(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            classify_and_log_error(e)
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise
```

## Secondary Improvements

### Quick Wins
1. **Timeout Optimization**
   - Adjust timeouts based on historical execution times
   - Expected lift: +2%

2. **Dependency Caching**
   - Cache npm/pip dependencies
   - Expected lift: +3%

3. **Parallel Execution Limits**
   - Reduce concurrent job limit during peak hours
   - Expected lift: +1%

## Success Metrics

### Primary KPIs
- **Success Rate:** >=85% over 7-day rolling window
- **MTTP:** <4 hours for all repos
- **Quarantine Rate:** <10% of repos at any time

### Leading Indicators
- Budget exceeded events: <2 per day
- Unknown errors: <1 per day
- Autofix success rate: >60%

## Implementation Roadmap

### Phase 1: Foundation (Sweeps 1-5)
- Deploy quarantine manager
- Implement budget optimization
- Deploy autofix playbooks

### Phase 2: Optimization (Sweeps 6-10)
- Tune autofix patterns
- Refine quarantine thresholds
- Enhance error classification

### Phase 3: Stabilization (Sweeps 11-14)
- Monitor improvements
- Fine-tune parameters
- Document patterns

## Expected Outcomes

### By Sweep 5
- Success rate: 75%
- Budget errors: -50%
- Unknown errors: -30%

### By Sweep 10
- Success rate: 82%
- Quarantine effectiveness: 80%
- Autofix coverage: 60%

### By Sweep 14
- **Success rate: >=85%**
- System stability: High
- Manual interventions: <1 per week

## Risk Mitigation

### Potential Risks
1. **Over-quarantining:** May block legitimate work
   - Mitigation: Conservative thresholds, quick recovery

2. **Autofix loops:** Fixes may cause new issues
   - Mitigation: Bounded attempts, escalation paths

3. **Budget starvation:** Over-optimization may starve jobs
   - Mitigation: Minimum budget guarantees

## Validation Criteria

Success is achieved when:
1. 7-day rolling success rate >= 85%
2. No single repo below 70% success rate
3. Autofix resolves >50% of eligible failures
4. Quarantine exits within 24 hours
5. Weekly digest shows positive trend

---

**Status:** APPROVED FOR IMPLEMENTATION
**Next Steps:** Deploy quarantine manager and autofix playbooks
**Review Date:** After sweep 7