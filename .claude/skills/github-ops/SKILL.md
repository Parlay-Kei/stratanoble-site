# GitHub Operations Skill

**Purpose:** Comprehensive GitHub repository management, CI/CD, and collaboration workflows  
**Version:** 1.0.0  
**Created:** 2025-12-04

---

## Level 1: Quick Reference (0-2KB)

### Essential CLI Commands

```bash
# Authentication
gh auth login                         # Authenticate with GitHub
gh auth status                        # Check auth status

# Repository
gh repo clone owner/repo              # Clone repository
gh repo view                          # View repo details
gh repo sync                          # Sync fork with upstream

# Pull Requests
gh pr create                          # Create PR interactively
gh pr list                            # List open PRs
gh pr checkout <number>               # Checkout PR locally
gh pr merge <number>                  # Merge PR
gh pr review <number> --approve       # Approve PR

# Issues
gh issue create                       # Create issue
gh issue list                         # List open issues
gh issue close <number>               # Close issue

# Actions
gh run list                           # List workflow runs
gh run view <run-id>                  # View run details
gh run rerun <run-id>                 # Re-run failed workflow
gh workflow run <workflow>            # Trigger workflow manually

# Releases
gh release create <tag>               # Create release
gh release list                       # List releases
```

### Quick Diagnostics

| Task | Command |
|------|---------|
| Check CI status | `gh pr checks` |
| View recent runs | `gh run list --limit 5` |
| Failed workflows | `gh run list --status failure` |
| My open PRs | `gh pr list --author @me` |
| Repo secrets | `gh secret list` |
| Branch protection | `gh api repos/{owner}/{repo}/branches/{branch}/protection` |

### Common Issues & Fixes

| Issue | Quick Fix |
|-------|-----------|
| PR checks failing | `gh pr checks --watch` then fix issues |
| Merge conflicts | `git fetch origin && git rebase origin/main` |
| Stale branch | `gh pr update-branch` |
| Action failing | `gh run view <id> --log-failed` |
| Secret not found | `gh secret set SECRET_NAME` |

---

## Level 2: Detailed Guide (2-5KB)

### Branch Strategy

#### GitFlow Model
```
main (production)
  └── develop (integration)
        ├── feature/ticket-123-description
        ├── bugfix/ticket-456-description
        └── release/v1.2.0
              └── hotfix/critical-fix
```

#### Trunk-Based Model
```
main (always deployable)
  ├── feature/short-lived-branch (max 2 days)
  └── release/v1.2.0 (if needed)
```

### Branch Protection Rules

```bash
# View current protection
gh api repos/{owner}/{repo}/branches/main/protection

# Set protection via API
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  -f required_status_checks='{"strict":true,"contexts":["ci/test","ci/build"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f restrictions=null
```

**Recommended Protection:**
- Require PR before merging
- Require status checks (CI must pass)
- Require conversation resolution
- Require linear history (no merge commits)
- Include administrators

### Pull Request Workflow

#### Creating Quality PRs

```bash
# Create with template
gh pr create --title "feat: add user authentication" \
  --body-file .github/PULL_REQUEST_TEMPLATE.md \
  --label "feature" \
  --assignee @me \
  --reviewer teammate1,teammate2

# Draft PR for early feedback
gh pr create --draft

# Convert draft to ready
gh pr ready <number>
```

#### PR Template (.github/PULL_REQUEST_TEMPLATE.md)

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.logs or debug code
```

### GitHub Actions Basics

#### Workflow Structure

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

#### Common Triggers

```yaml
# On push to specific branches
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'

# On PR events
on:
  pull_request:
    types: [opened, synchronize, reopened]

# Scheduled (cron)
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight

# Manual trigger
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deploy environment'
        required: true
        default: 'staging'
```

### Secrets Management

```bash
# Repository secrets
gh secret set API_KEY                           # Set from prompt
gh secret set API_KEY < secret.txt              # Set from file
gh secret set API_KEY --env production          # Environment-specific
gh secret list                                  # List all secrets

# Environment secrets (requires environment setup)
gh secret set DATABASE_URL --env production
gh secret set DATABASE_URL --env staging

# Organization secrets (admin required)
gh secret set ORG_SECRET --org myorg --visibility all
```

---

## Level 3: Complete Reference (5KB+)

### Advanced Actions Patterns

#### Matrix Builds

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [18, 20, 22]
        exclude:
          - os: windows-latest
            node: 18
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
```

#### Caching Dependencies

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

#### Conditional Jobs

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: [test, build]
    runs-on: ubuntu-latest
```

#### Reusable Workflows

```yaml
# .github/workflows/reusable-deploy.yml
name: Reusable Deploy
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
    secrets:
      deploy_key:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - run: echo "Deploying to ${{ inputs.environment }}"

# Calling workflow
jobs:
  deploy-staging:
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: staging
    secrets:
      deploy_key: ${{ secrets.STAGING_DEPLOY_KEY }}
```

#### Environment Deployments

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://myapp.com
    steps:
      - name: Deploy
        run: ./deploy.sh
```

### Release Management

#### Semantic Versioning Workflow

```bash
# Create release with auto-generated notes
gh release create v1.2.0 --generate-notes

# Create pre-release
gh release create v1.3.0-beta.1 --prerelease

# Create release with specific notes
gh release create v1.2.0 --notes "## What's New
- Feature A
- Bug fix B

## Breaking Changes
- Changed X to Y"

# Upload assets
gh release upload v1.2.0 ./dist/app.zip ./dist/app.tar.gz
```

#### Automated Release Workflow

```yaml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: npm run build
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/*
          generate_release_notes: true
```

### GitHub API Usage

#### Common API Calls

```bash
# Get repository info
gh api repos/{owner}/{repo}

# List collaborators
gh api repos/{owner}/{repo}/collaborators

# Get workflow runs
gh api repos/{owner}/{repo}/actions/runs

# Create issue
gh api repos/{owner}/{repo}/issues --method POST \
  -f title="Bug report" \
  -f body="Description here" \
  -f labels[]="bug"

# Update PR
gh api repos/{owner}/{repo}/pulls/{number} --method PATCH \
  -f title="Updated title"

# GraphQL query
gh api graphql -f query='
  query {
    repository(owner: "owner", name: "repo") {
      pullRequests(first: 10, states: OPEN) {
        nodes {
          title
          number
          author { login }
        }
      }
    }
  }
'
```

### Security Features

#### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    reviewers:
      - "team-leads"
    labels:
      - "dependencies"
    groups:
      dev-dependencies:
        patterns:
          - "*"
        dependency-type: "development"
```

#### Code Scanning (CodeQL)

```yaml
name: CodeQL
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript
      - uses: github/codeql-action/analyze@v3
```

#### Secret Scanning

```yaml
# .github/secret_scanning.yml
paths-ignore:
  - 'docs/**'
  - '**/*.test.js'
```

### Issue & Project Management

#### Issue Templates

```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: Bug Report
description: Report a bug
labels: ["bug", "triage"]
body:
  - type: textarea
    id: description
    attributes:
      label: Description
      description: What happened?
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
  - type: dropdown
    id: severity
    attributes:
      label: Severity
      options:
        - Critical
        - High
        - Medium
        - Low
```

#### Automated Issue Management

```yaml
name: Stale Issues
on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v9
        with:
          stale-issue-message: 'This issue is stale due to inactivity.'
          days-before-stale: 30
          days-before-close: 7
          stale-issue-label: 'stale'
```

### Repository Templates

#### .github/CODEOWNERS

```
# Default owners
* @team-leads

# Frontend
/src/components/ @frontend-team
/src/pages/ @frontend-team

# Backend
/src/api/ @backend-team
/supabase/ @backend-team @db-admin

# DevOps
/.github/ @devops-team
/docker/ @devops-team
```

#### Branch Naming Convention

```
feature/  - New features (feature/add-auth)
bugfix/   - Bug fixes (bugfix/fix-login)
hotfix/   - Production fixes (hotfix/critical-error)
release/  - Release branches (release/v1.2.0)
chore/    - Maintenance (chore/update-deps)
docs/     - Documentation (docs/api-guide)
test/     - Testing (test/e2e-coverage)
```

### Webhooks Configuration

```bash
# List webhooks
gh api repos/{owner}/{repo}/hooks

# Create webhook
gh api repos/{owner}/{repo}/hooks --method POST \
  -f name="web" \
  -f active=true \
  -f events[]="push" \
  -f events[]="pull_request" \
  -f config[url]="https://example.com/webhook" \
  -f config[content_type]="json" \
  -f config[secret]="webhook-secret"
```

---

## Audit Checklist

### Repository Health Audit

- [ ] README.md exists and is current
- [ ] LICENSE file present
- [ ] CONTRIBUTING.md guide exists
- [ ] Issue templates configured
- [ ] PR template configured
- [ ] CODEOWNERS file set up
- [ ] Branch protection enabled on main
- [ ] Required status checks configured
- [ ] Dependabot enabled
- [ ] Secret scanning enabled

### CI/CD Audit

- [ ] Build workflow exists and passes
- [ ] Test workflow with coverage
- [ ] Linting workflow
- [ ] Security scanning (CodeQL)
- [ ] Deploy workflows for each environment
- [ ] Secrets properly scoped
- [ ] No secrets in code
- [ ] Caching configured for performance

### Security Audit

- [ ] No exposed secrets in history
- [ ] 2FA required for collaborators
- [ ] Minimal repository permissions
- [ ] Dependency updates automated
- [ ] Vulnerability alerts enabled
- [ ] Branch protection prevents force push

---

## Related Skills

- **deployment-ops** - Deployment workflows
- **codebase-admin-ops** - Repository structure
- **monitoring-ops** - CI/CD monitoring
- **supabase-ops** - Database CI/CD integration

---

**Last Updated:** 2025-12-04
