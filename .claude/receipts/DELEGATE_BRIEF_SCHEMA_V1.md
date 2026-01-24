# DELEGATE_BRIEF_SCHEMA_V1

**Mission**: Product Ops - Delegate Brief Schema v1
**Status**: COMPLETE ✅
**Date**: 2026-01-24

## Schema Definition

The canonical Delegate Brief format that minimizes ambiguity and enables automatic mission generation.

### Required Fields (5 fields only)

```yaml
title: String (what we're doing)
type: Enum [feature|fix|process|project]
target: String (repo/system/area)
why: String (1-2 sentences max)
done: Array<String> (measurable criteria)
```

### Optional Fields (for precision)

```yaml
scope_out: Array<String> (what NOT to do)
risk: Enum [low|medium|high] (default: medium)
deadline: ISO8601 (if time-bound)
```

## Writing Rules

1. **2-minute rule**: Brief must be writable in under 2 minutes
2. **No essays**: Each field is concise
3. **Measurable done**: Each criterion is testable
4. **Default assumptions**: System makes reasonable defaults

## Auto-Routing Logic

Based on brief content, OCS automatically routes to:

- **Always**: Engineering + QA
- **If "deploy"**: + Release Ops
- **If "infrastructure"**: + Platform Ops
- **If "cost/pricing"**: + Finance Ops
- **If "legal/compliance"**: + Legal Ops

## Decision Gate Triggers

Auto-creates gates when:
- risk = "low" → Gate before production
- deadline exists → Gate if behind schedule
- scope increases → Gate for approval

## Sample Brief (30 seconds to write)

```yaml
title: Add retry logic to payment processor
type: feature
target: apps/platform/payments
why: Stripe webhooks failing 5% of the time causing revenue loss
done:
  - Retry 3x with exponential backoff
  - Error rate <0.1%
  - No duplicate charges
```

From this, OCS generates:
- Work packet
- Engineering mission (implement)
- QA mission (validate <0.1% error)
- Platform mission (monitor in prod)
- Closeout criteria

## Success Metric

**80% of briefs need zero clarification** - The schema forces enough structure that missions are unambiguous.

---
*Product Ops - Brief Schema v1 Complete*