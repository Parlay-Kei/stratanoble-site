# StrataNoble Scripts

Automation scripts for StrataNoble development, deployment, and DevOps agent management.

## DevOps Agent Scripts (Phase 2 Complete ✅)

### Master Orchestrator

**`run-devops-agent.ps1`** - Complete DevOps automation pipeline

```powershell
# Full automation (setup + monitor + heal)
.\run-devops-agent.ps1 -Mode full

# Continuous monitoring with 5-minute healing cycles
.\run-devops-agent.ps1 -Mode full -Continuous

# Setup only
.\run-devops-agent.ps1 -Mode setup

# Health monitoring only
.\run-devops-agent.ps1 -Mode monitor

# Self-healing only
.\run-devops-agent.ps1 -Mode heal
```

### Health Monitoring

**`health-monitor.mjs`** - Real-time service health checks

```bash
node scripts/health-monitor.mjs
```

**`run-health-check.ps1`** - PowerShell wrapper

```powershell
.\scripts\run-health-check.ps1
```

### Environment Management

**`validate-env.mjs`** - Environment variable validation

```bash
node scripts/validate-env.mjs
```

**`agent-bootstrap.ps1`** - Initial setup and prerequisite check

```powershell
.\scripts\agent-bootstrap.ps1
```

### MCP Server Configuration

**`setup-google-drive-mcp.mjs`** - Google Drive MCP setup
**`setup-notion-mcp.mjs`** - Notion MCP setup
**`test-google-drive-mcp.mjs`** - Google Drive test suite

### Testing

**`test-phase2-system.ps1`** - Complete Phase 2 test suite

```powershell
.\scripts\test-phase2-system.ps1
```

Expected: 18/19 tests passed (94.7%)

---

## Legacy Scripts

### Credential Management

**`discover-credentials.mjs`** - Discover credentials across repo

```bash
node scripts/discover-credentials.mjs
```

Outputs report to `scripts/.reports/credentials-report.json`

### Supabase Configuration

**`verify-supabase.mjs`** - Verify Supabase configuration

Set environment variables:
```bash
set NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
set NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
set SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Then run:
```bash
node scripts/verify-supabase.mjs
```

### Netlify Management

**`add-netlify-env-vars.js`** - Add environment variables
**`list-vault-netlify.mjs`** - List Netlify variables
**`update-netlify-auth-env.mjs`** - Update auth variables

### AWS & Twilio

**`setup-aws-ses.mjs`** - Configure AWS SES
**`check-ses-status.mjs`** - Check SES status
**`get-twilio-auth-token.mjs`** - Retrieve Twilio token

---

## Quick Start

```powershell
# First-time setup
.\scripts\agent-bootstrap.ps1
node scripts/validate-env.mjs
.\scripts\run-health-check.ps1

# Daily development
.\scripts\run-devops-agent.ps1 -Mode full -Continuous

# Before deployment
.\scripts\test-phase2-system.ps1
```

---

**Phase 2 Status:** ✅ Complete (94.7% pass rate)
**Documentation:** 30,000+ words in `.claude/docs/` and root MD files



