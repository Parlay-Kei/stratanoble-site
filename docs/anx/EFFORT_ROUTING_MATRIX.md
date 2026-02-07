# Effort Routing Matrix

**Document ID**: ANX-ROUTING-MATRIX-001
**Version**: 1.0.0
**Authority**: OCS
**Effective Date**: 2026-02-06
**Decision Time Target**: < 60 seconds

---

## Purpose

This matrix enables rapid routing decisions: **Single Session vs Agent Team (Swarm)**. Use the Quick Decision Flow to make routing calls in under 60 seconds.

---

## Quick Decision Flow

```
                    ┌─────────────────────────────────┐
                    │      New Mission Received        │
                    └────────────────┬────────────────┘
                                     │
                                     ▼
              ┌──────────────────────────────────────────┐
              │ Q1: Are there 3+ independent subtasks?   │
              └────────────────┬─────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
           NO                                    YES
            │                                      │
            ▼                                      ▼
    ┌───────────────┐          ┌─────────────────────────────────┐
    │SINGLE SESSION │          │ Q2: Is department swarm-allowed? │
    └───────────────┘          └────────────────┬────────────────┘
                                                │
                            ┌───────────────────┴───────────────────┐
                           NO                                      YES
                            │                                        │
                            ▼                                        ▼
                    ┌───────────────┐         ┌──────────────────────────────┐
                    │SINGLE SESSION │         │ Q3: Is risk level < CRITICAL? │
                    └───────────────┘         └────────────────┬─────────────┘
                                                               │
                                           ┌───────────────────┴───────────────┐
                                          NO                                  YES
                                           │                                    │
                                           ▼                                    ▼
                                   ┌───────────────┐      ┌────────────────────────────┐
                                   │SINGLE SESSION │      │ Q4: Is speedup estimate >2x? │
                                   └───────────────┘      └────────────────┬───────────┘
                                                                           │
                                                       ┌───────────────────┴───────────────┐
                                                      NO                                  YES
                                                       │                                    │
                                                       ▼                                    ▼
                                               ┌───────────────┐              ┌───────────────────┐
                                               │SINGLE SESSION │              │  SWARM EXECUTION   │
                                               └───────────────┘              └───────────────────┘
```

---

## Department Authorization Matrix

| Department | Swarm Allowed | Approval Required | Restrictions |
|------------|---------------|-------------------|--------------|
| **ENGDEL** | YES | Plan approval for risky modules | Code review teammate required for >100 lines |
| **QAG** | LIMITED | Always | Test execution only, no gate decisions |
| **OCS** | NO | — | Governance requires unified accountability |
| **PLATOPS** | LIMITED | Plan approval | Infrastructure changes only |
| **DOCSMITH** | YES | None | Ideal for batch documentation |
| **SECOPS** | NO | — | Security analysis requires unified context |

---

## Mission Type Routing

### Always Single Session

| Mission Type | Reason |
|--------------|--------|
| Security audit | Requires unified context |
| Compliance review | Strict governance chain |
| Production deployment | Sequential verification required |
| Database migration | Transactional integrity |
| Architecture design | Deep reasoning required |
| Governance modification | Single accountability |
| Credential management | Security isolation |

### Swarm Eligible (If Conditions Met)

| Mission Type | Min Tasks | Conditions |
|--------------|-----------|------------|
| Feature implementation | 3 | Decomposable into independent components |
| Multi-file refactor | 3 | No shared state between files |
| Batch documentation | 3 | Independent documents |
| Test suite creation | 3 | Independent test files |
| Multi-component bug fix | 3 | Isolated bugs in different files |
| API endpoint batch | 3 | Independent endpoints |

---

## Speedup Estimation Table

Use this table to estimate whether speedup exceeds 2x:

| Team Size | Parallel Tasks | Overhead | Net Speedup | Swarm? |
|-----------|----------------|----------|-------------|--------|
| Lead + 1 | 2 | 10% | 1.8x | NO |
| Lead + 2 | 3 | 15% | 2.5x | YES |
| Lead + 3 | 4 | 20% | 3.2x | YES |
| Lead + 4 | 5 | 25% | 3.75x | YES |

**Formula**: `Net Speedup = Tasks × (1 - Overhead)`

**Rule of thumb**: Swarm only when 3+ truly independent tasks exist.

---

## Risk Level Impact

| Risk Level | Single Session | Swarm Eligible |
|------------|----------------|----------------|
| LOW | Optional | YES |
| MEDIUM | Recommended | YES (with review teammate) |
| HIGH | Required checkpoint | LIMITED (plan approval required) |
| CRITICAL | Mandatory | NEVER |

---

## 60-Second Decision Checklist

Print this checklist for rapid decisions:

```
□ Step 1: Count independent subtasks
  → Less than 3? → SINGLE SESSION (STOP)
  → 3 or more? → Continue

□ Step 2: Check department authorization
  → OCS/SECOPS? → SINGLE SESSION (STOP)
  → Other? → Continue to matrix above

□ Step 3: Check risk level
  → CRITICAL? → SINGLE SESSION (STOP)
  → HIGH? → Requires plan approval
  → Other? → Continue

□ Step 4: Estimate speedup
  → Less than 2x? → SINGLE SESSION
  → Greater than 2x? → SWARM AUTHORIZED

□ Step 5: Record decision
  → Add to mission packet: swarm_authorized: true/false
```

---

## Quick Reference by Scenario

### Scenario: "Update 5 independent UI components"
- Tasks: 5 (independent) ✓
- Department: ENGDEL (allowed) ✓
- Risk: LOW ✓
- Speedup: ~3.75x ✓
- **Decision: SWARM**

### Scenario: "Fix auth bug across 4 files with shared session state"
- Tasks: 4
- Independent: NO (shared session state)
- **Decision: SINGLE SESSION** (stop at Step 1)

### Scenario: "Security vulnerability assessment"
- Department: SECOPS
- **Decision: SINGLE SESSION** (stop at Step 2)

### Scenario: "Write unit tests for 3 API endpoints"
- Tasks: 3 (independent) ✓
- Department: QAG (limited - test execution OK) ✓
- Risk: LOW ✓
- Speedup: 2.5x ✓
- **Decision: SWARM**

### Scenario: "Deploy hotfix to production"
- Mission type: Production deployment
- **Decision: SINGLE SESSION** (always single for deployments)

---

## Evidence Requirements by Mode

### Single Session Evidence

```
proofs/{MISSION_ID}/
  ├── MISSION_RECEIPT.yaml
  ├── files_modified.txt
  └── test_results.txt
```

### Swarm Execution Evidence

```
proofs/swarm-runs/{SWARM_RUN_ID}/
  ├── CONSOLIDATED_RECEIPT.yaml    # Lead agent produces
  ├── TASK_MANIFEST.yaml           # All tasks with owners
  ├── ST-001.yaml                  # Per-subtask receipts
  ├── ST-002.yaml
  ├── ST-003.yaml
  ├── REVIEW_RECEIPT.yaml          # If code review teammate used
  └── test_results_aggregated.txt
```

---

## Matrix Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-06 | Initial release |

---

**Classification**: ROUTING MATRIX
**Usage**: Mission routing decisions
**Review Cycle**: Quarterly
