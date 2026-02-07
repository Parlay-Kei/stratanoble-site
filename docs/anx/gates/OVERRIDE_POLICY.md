# Drift Prevention Override Policy

**Document ID**: OCS-OVERRIDE-POLICY-001
**Version**: 1.0.0
**Effective**: 2026-02-06
**Authority**: OCS

---

## Overview

This policy governs when and how drift prevention gates can be overridden. Overrides are designed to be:

1. **Explicit** - Requires deliberate action
2. **Auditable** - Creates permanent record
3. **Justified** - Requires stated reason
4. **Reversible** - Can be reverted if abuse detected

---

## Override Tiers

### Tier 1: Pre-commit Override (Local)

**Scope**: Single commit on local machine
**Method**: `git commit --no-verify`
**Audit**: Commit message must contain `DRIFT-OVERRIDE:`

```bash
# Valid override
git commit --no-verify -m "DRIFT-OVERRIDE: Emergency hotfix for production outage"

# Invalid override (will be flagged in CI)
git commit --no-verify -m "quick fix"
```

**INVARIANT**: CI will flag commits that bypassed pre-commit without `DRIFT-OVERRIDE:` in message.

---

### Tier 2: CI Override (Team)

**Scope**: Single PR or push
**Method**: Commit message contains emergency override block
**Audit**: Logged in CI, requires approval reference

```
DRIFT-EMERGENCY-OVERRIDE: Critical security patch requires temporary agent
Approved-By: [operator name]
Ticket: OPS-1234
Review-By: 2026-02-07
```

**INVARIANT**: Must include:
- Justification
- Approver name
- Ticket/issue reference
- Review deadline (max 24 hours)

---

### Tier 3: Policy Override (Organization)

**Scope**: Repository or organization-wide
**Method**: Repository variable or CLAUDE.md directive
**Audit**: Requires documented change request

```yaml
# In repository settings
DRIFT_CHECK_DISABLED: true
DRIFT_DISABLE_REASON: "Migration in progress, ticket OPS-5678"
DRIFT_DISABLE_EXPIRES: "2026-02-10"
```

**INVARIANT**: Policy overrides expire automatically. Maximum duration: 7 days.

---

## Forbidden Overrides

The following scenarios do NOT permit override:

1. **Production-bound commits** to `main` branch without approval
2. **Commits introducing > 5 forbidden files** (triggers mandatory review)
3. **Commits from automated systems** without human approval
4. **Repeat overrides** by same operator within 48 hours

---

## Override Audit Trail

All overrides generate audit entries:

```json
{
  "timestamp": "2026-02-06T10:30:00Z",
  "type": "DRIFT_OVERRIDE",
  "tier": 1,
  "operator": "git-user-email",
  "commit": "abc123",
  "justification": "Emergency hotfix for production outage",
  "files_bypassed": [".claude/agents/temp-agent.md"],
  "review_status": "PENDING"
}
```

---

## Post-Override Review

### Within 24 Hours

1. Review override justification
2. Verify bypassed files are appropriate
3. Mark override as `APPROVED` or `REJECTED`
4. If `REJECTED`, create remediation ticket

### Rejected Override Actions

1. Revert offending commit if possible
2. Migrate forbidden files to .claude-anx
3. Document incident for future prevention
4. Review operator access if pattern of abuse

---

## Safe Quarantine Interaction

Overrides do NOT bypass Safe Quarantine policy:

- Quarantine always creates backup before migration
- 30-day retention applies to all quarantined files
- Override does not delete quarantine records

---

**Classification**: OCS POLICY
**Enforcement**: AUTOMATED with human review
**Review Cycle**: Quarterly
