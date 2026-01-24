# Delegate Brief Template

## Core Fields (Required)

**Title**: [What are we doing - be specific]

**Type**: [project | feature | process]

**Target**: [repo/system name]

**Why**: [Why this matters - 1-2 sentences]

**Definition of Done**:
- [ ] [Measurable success criterion 1]
- [ ] [Measurable success criterion 2]
- [ ] [Measurable success criterion 3]

## Scope (Optional but Recommended)

**Included**:
- [What's definitely in scope]
- [Another thing in scope]

**Excluded**:
- [What's definitely NOT in scope]
- [Another thing not in scope]

## Constraints (Optional)

- [Hard constraint like "no downtime"]
- [Another constraint like "must use existing auth"]

## Risk & Approval (Optional)

**Risk Tolerance**: [low | medium | high]

**Approval Thresholds**:
- If [condition], requires [who's approval]
- If [another condition], requires [who's approval]

**Deadline**: [ISO date like 2026-01-31T00:00:00Z]

---

## Examples

### Feature Brief
```markdown
**Title**: Add OAuth2 login to platform

**Type**: feature

**Target**: apps/platform

**Why**: Users need SSO capability for enterprise deployments

**Definition of Done**:
- [ ] OAuth2 flow works with Google
- [ ] OAuth2 flow works with GitHub
- [ ] Existing password auth still works
- [ ] Zero downtime migration

**Risk Tolerance**: low

**Approval Thresholds**:
- If database migration required, requires founder approval
- If third-party service costs >$100/mo, requires finance approval
```

### Process Brief
```markdown
**Title**: Automate deployment pipeline

**Type**: process

**Target**: .github/workflows

**Why**: Manual deployments causing errors and delays

**Definition of Done**:
- [ ] Push to main auto-deploys to staging
- [ ] Approved PR auto-deploys to production
- [ ] Rollback possible within 5 minutes

**Excluded**:
- Database migrations (separate brief)
- Monitoring setup (existing tools sufficient)
```