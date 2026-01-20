# GitHub Admin Service

**Type**: Service (V3)
**Operator**: Platform Ops Lead

---

## Purpose

Repo, branch protection, secrets, admin operations.

## Repository Structure

```
main        - Production code
develop     - Integration branch
feature/*   - Feature branches
hotfix/*    - Emergency fixes
```

## Branch Protection

| Rule | main | develop |
|------|------|---------|
| Require PR | Yes | Yes |
| Required reviewers | 1 | 1 |
| Require status checks | Yes | Yes |
| Allow force push | No | No |
| Allow deletion | No | No |

## Required Status Checks

- [ ] typecheck
- [ ] lint
- [ ] test
- [ ] build

## Secrets Management

```bash
# List secrets
gh secret list

# Set secret
gh secret set NAME --body "value"

# Environment secrets
gh secret set NAME --env production --body "value"
```

## Common Operations

### Create Branch
```bash
git checkout -b feature/feature-name
git push -u origin feature/feature-name
```

### Merge PR
```bash
gh pr merge [number] --squash
```

### Delete Branch
```bash
git push origin --delete feature/old-branch
```

## Access Levels

| Role | Permissions |
|------|-------------|
| Read | View code |
| Triage | Manage issues |
| Write | Push to branches |
| Maintain | Manage branches |
| Admin | Full access |

## Incidents

| Issue | Resolution |
|-------|------------|
| Accidental commit to main | Revert commit, investigate access |
| Secret exposed | Rotate immediately, audit |
| Access request | Verify with OCS, grant minimal |
