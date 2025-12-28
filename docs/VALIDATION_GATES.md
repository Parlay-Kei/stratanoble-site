# Validation Gates - Homepage Redesign

> **Purpose:** Quality checkpoints that must pass before proceeding
> **Enforcement:** Automatic - agents cannot skip gates

---

## Gate 1: Pre-Flight Check

**When:** Before any task execution
**Blocking:** YES

| Check | Command | Expected |
|-------|---------|----------|
| Git clean | `git status --porcelain` | Empty |
| Spec exists | `test -f HOMEPAGE_REDESIGN_SPEC.md` | Exit 0 |
| Framework exists | `test -f MESSAGING_FRAMEWORK.md` | Exit 0 |

---

## Gate 2: Per-Task Validation

**When:** After each task completes
**Blocking:** YES

| Check | Command | Expected |
|-------|---------|----------|
| TypeScript | `npx tsc --noEmit` | Exit 0 |
| ESLint | `npm run lint` | Exit 0 |
| Render | Component mounts | No errors |

**On Failure:** Revert file, retry once

---

## Gate 3: Integration Validation

**When:** After all component tasks
**Blocking:** YES

| Check | Command | Expected |
|-------|---------|----------|
| Build | `npm run build` | Exit 0 |
| Bundle size | Analyze | Delta <5% |

---

## Gate 4: Visual Regression

**When:** After PAGE-001
**Blocking:** YES

### Lighthouse Minimums

| Metric | Minimum |
|--------|---------|
| Performance | 80 |
| Accessibility | 90 |
| Best Practices | 90 |
| SEO | 90 |

---

## Gate 5: Pre-Deploy Check

**When:** Before DEPLOY-001
**Blocking:** YES

| Check | Command | Expected |
|-------|---------|----------|
| Tests | `npm run test` | Pass |
| Security | `npm audit` | No high/critical |
| Console | Browser check | 0 errors |

### Content Verification

```bash
# Stats appear once
grep -r "73%" components/ | wc -l  # Should be 1

# Mission present
grep "Help people succeed" WhyStrataNobleGrid.tsx

# Identity present  
grep "everyday operators" WhatIsStrataNoble.tsx
```

---

## Rollback Triggers

| Condition | Action |
|-----------|--------|
| Build fails | `git checkout -- .` |
| Lighthouse -10 points | `git revert HEAD` |
| Console errors | `git revert HEAD` |
| Bundle +10% | `git revert HEAD` |

---

## Escalation Matrix

| Gate | Failure | Escalate To |
|------|---------|-------------|
| 1 | Environment | infra-deployment-specialist |
| 2 | Code error | frontend-developer (retry) |
| 3 | Build fail | Orchestrator |
| 4 | Visual | Orchestrator |
| 5 | Security | Human (Steve) |
