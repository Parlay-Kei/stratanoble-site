---
name: platform-ops
description: Platform operations skill for deployment, infrastructure management, monitoring, and GitHub administration. Core operational capability for Platform Ops Lead.
version: 1.0.0
level: 3
triggers:
  - deploy
  - infrastructure
  - monitor
  - github admin
  - vercel deploy
  - supabase migration
  - rollback
---

# platform-ops Skill

Platform operations for deployment, infrastructure, and operational excellence. Enables Platform Ops Lead to manage all infrastructure concerns.

## Quick Commands

| Command | Action |
|---------|--------|
| `deploy` | Deploy to Vercel (preview or production) |
| `migrate` | Run Supabase migration |
| `rollback` | Rollback deployment or migration |
| `status` | Infrastructure status dashboard |
| `logs` | Fetch logs from deployment |
| `github` | GitHub administration tasks |

---

## Level 1: Deployment Operations

### deployToVercel()
```bash
#!/bin/bash
# Deploy to Vercel
# Usage: platform-ops deploy [preview|production] [project]

deploy_vercel() {
  local env="${1:-preview}"
  local project="${2:-direct-cuts}"

  if [ "$env" = "production" ]; then
    vercel --prod --yes
  else
    vercel --yes
  fi

  # Capture deployment URL
  local url=$(vercel ls --json | jq -r '.[0].url')
  echo "Deployed: https://$url"
}
```

### checkDeploymentStatus()
```javascript
/**
 * Check Vercel deployment status
 */
async function checkDeploymentStatus(deploymentId) {
  const response = await fetch(
    `https://api.vercel.com/v13/deployments/${deploymentId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`
      }
    }
  );

  const deployment = await response.json();

  return {
    id: deployment.id,
    url: deployment.url,
    state: deployment.state, // QUEUED, BUILDING, READY, ERROR
    createdAt: deployment.createdAt,
    readyAt: deployment.readyAt,
    error: deployment.error
  };
}
```

### rollbackDeployment()
```bash
#!/bin/bash
# Rollback to previous deployment
rollback_vercel() {
  local project="${1:-direct-cuts}"

  # Get previous deployment
  local prev=$(vercel ls --json | jq -r '.[1].uid')

  # Promote previous deployment
  vercel promote "$prev" --yes

  echo "Rolled back to: $prev"
}
```

---

## Level 2: Database Operations

### runMigration()
```bash
#!/bin/bash
# Run Supabase migration
run_migration() {
  local migration_name="$1"

  # Push migration
  supabase db push

  # Verify
  supabase db diff

  echo "Migration applied: $migration_name"
}
```

### createMigration()
```bash
#!/bin/bash
# Create new migration
create_migration() {
  local name="$1"

  # Generate migration from diff
  supabase db diff --file "$name"

  echo "Migration created: supabase/migrations/*_$name.sql"
}
```

### rollbackMigration()
```bash
#!/bin/bash
# Rollback last migration (requires manual SQL)
rollback_migration() {
  echo "WARNING: Supabase does not support automatic rollback"
  echo "Manual steps:"
  echo "1. Write rollback SQL"
  echo "2. Apply via supabase db push"
  echo "3. Verify data integrity"
}
```

---

## Level 3: GitHub Administration

### createBranch()
```bash
#!/bin/bash
# Create feature branch
create_branch() {
  local branch_name="$1"
  local base="${2:-main}"

  git checkout "$base"
  git pull origin "$base"
  git checkout -b "$branch_name"
  git push -u origin "$branch_name"

  echo "Branch created: $branch_name"
}
```

### createPR()
```bash
#!/bin/bash
# Create pull request
create_pr() {
  local title="$1"
  local body="${2:-}"
  local base="${3:-main}"

  gh pr create \
    --title "$title" \
    --body "$body" \
    --base "$base" \
    --fill

  echo "PR created"
}
```

### protectBranch()
```javascript
/**
 * Configure branch protection rules
 */
async function protectBranch(owner, repo, branch) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/branches/${branch}/protection`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json'
      },
      body: JSON.stringify({
        required_status_checks: {
          strict: true,
          contexts: ['build', 'test', 'lint']
        },
        enforce_admins: true,
        required_pull_request_reviews: {
          required_approving_review_count: 1
        },
        restrictions: null
      })
    }
  );

  return response.ok;
}
```

---

## Level 4: Monitoring & Observability

### getDeploymentLogs()
```javascript
/**
 * Fetch deployment logs from Vercel
 */
async function getDeploymentLogs(deploymentId, options = {}) {
  const { follow = false, limit = 100 } = options;

  const response = await fetch(
    `https://api.vercel.com/v2/deployments/${deploymentId}/events?limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`
      }
    }
  );

  const events = await response.json();

  return events.map(e => ({
    timestamp: e.created,
    type: e.type,
    message: e.text
  }));
}
```

### checkInfraStatus()
```javascript
/**
 * Infrastructure status dashboard
 */
async function checkInfraStatus() {
  const checks = await Promise.all([
    // Vercel status
    fetch('https://www.vercel-status.com/api/v2/status.json')
      .then(r => r.json())
      .then(d => ({ service: 'vercel', status: d.status.indicator })),

    // Supabase status
    fetch('https://status.supabase.com/api/v2/status.json')
      .then(r => r.json())
      .then(d => ({ service: 'supabase', status: d.status.indicator })),

    // App health check
    fetch(process.env.APP_URL + '/api/health')
      .then(r => ({ service: 'app', status: r.ok ? 'operational' : 'down' }))
      .catch(() => ({ service: 'app', status: 'unreachable' }))
  ]);

  return {
    timestamp: new Date().toISOString(),
    checks,
    allHealthy: checks.every(c => c.status === 'operational' || c.status === 'none')
  };
}
```

---

## Environment Variables

```bash
VERCEL_TOKEN=           # Vercel API token
GITHUB_TOKEN=           # GitHub personal access token
SUPABASE_ACCESS_TOKEN=  # Supabase management API token
APP_URL=                # Production app URL for health checks
```

---

## Usage Examples

```bash
# Deploy to preview
platform-ops deploy preview

# Deploy to production
platform-ops deploy production

# Run database migration
platform-ops migrate

# Check infrastructure status
platform-ops status

# Get deployment logs
platform-ops logs <deployment-id>

# Create feature branch
platform-ops github branch feature/new-feature

# Create PR
platform-ops github pr "Add new feature"

# Rollback deployment
platform-ops rollback
```

---

## Integration Points

| Agent | Coordination Purpose |
|-------|---------------------|
| `QA Gatekeeper` | Quality gates before production deploy |
| `Release Ops` | Versioning and changelog coordination |
| `Security Ops` | Security headers and config validation |

---

## Success Criteria

- Deployments complete without errors
- Migrations apply cleanly
- Branch protection enforced
- Monitoring shows all systems operational
- Rollback completes within 2 minutes
