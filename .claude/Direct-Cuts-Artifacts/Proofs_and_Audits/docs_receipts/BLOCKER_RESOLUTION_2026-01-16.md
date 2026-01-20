# Blocker Resolution Guide
**Date**: 2026-01-16
**Purpose**: Step-by-step instructions to resolve deployment blockers

## Current Blockers & Solutions

### 🔴 Blocker 1: No Staging Environment Access

#### Problem
No staging project reference provided, cannot deploy or test.

#### Resolution Steps
1. **Get Staging Project Reference**
   ```bash
   # Option A: If you have Supabase dashboard access
   # 1. Log into https://app.supabase.com
   # 2. Select your staging project
   # 3. Go to Settings > General
   # 4. Copy the Reference ID

   # Option B: Ask DevOps team
   # Request: "Need staging project reference ID for Direct-Cuts"
   ```

2. **Link Staging Project**
   ```bash
   # Once you have the reference
   supabase link --project-ref [STAGING_REF]
   ```

3. **Verify Link**
   ```bash
   supabase projects list
   # Should show staging project with ● indicator
   ```

#### Alternative Solution
If no staging environment exists:
```bash
# Create a new staging project
supabase projects create direct-cuts-staging --org-id mhaugpcyrrvpbccwksvj --region us-east-1

# Link it
supabase link --project-ref [NEW_REF]
```

---

### 🔴 Blocker 2: Docker Not Running

#### Problem
Local Supabase requires Docker Desktop, which is not running.

#### Resolution Steps

1. **Windows**
   ```powershell
   # Start Docker Desktop
   Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

   # Wait for Docker to start (usually 30-60 seconds)
   docker version
   ```

2. **Verify Docker Running**
   ```bash
   docker ps
   # Should show running containers or empty list (not error)
   ```

3. **Start Local Supabase**
   ```bash
   supabase start
   # This will download containers on first run (~5 minutes)
   ```

#### Alternative Solution
Skip local testing and deploy directly to staging:
```bash
# Deploy without local testing (riskier)
supabase db push --project-ref [STAGING_REF] --dry-run
# Review output, then remove --dry-run if looks good
```

---

### 🔴 Blocker 3: Missing Environment Variables

#### Problem
Cannot verify if required environment variables are configured.

#### Resolution Steps

1. **Check Current Variables**
   ```bash
   # List existing secrets (names only)
   supabase secrets list --project-ref [PROJECT_REF]
   ```

2. **Set Missing Stripe Variables**
   ```bash
   # Get values from Stripe Dashboard > API Keys
   supabase secrets set STRIPE_SECRET_KEY=sk_test_... --project-ref [PROJECT_REF]
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... --project-ref [PROJECT_REF]

   # Get price ID from Stripe Dashboard > Products
   supabase secrets set STRIPE_BARBER_SUBSCRIPTION_PRICE_ID=price_... --project-ref [PROJECT_REF]
   ```

3. **Set Supabase Service Key**
   ```bash
   # Get from Supabase Dashboard > Settings > API
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ... --project-ref [PROJECT_REF]
   ```

4. **Set Verification Provider (Choose One)**

   **Option A: Twilio**
   ```bash
   # Get from Twilio Console
   supabase secrets set TWILIO_ACCOUNT_SID=AC... --project-ref [PROJECT_REF]
   supabase secrets set TWILIO_AUTH_TOKEN=... --project-ref [PROJECT_REF]
   supabase secrets set TWILIO_PHONE_NUMBER=+1... --project-ref [PROJECT_REF]
   supabase secrets set TWILIO_VERIFY_SERVICE_ID=VA... --project-ref [PROJECT_REF]
   ```

   **Option B: Resend**
   ```bash
   # Get from Resend Dashboard
   supabase secrets set RESEND_API_KEY=re_... --project-ref [PROJECT_REF]
   ```

#### Quick Validation Script
```javascript
// Save as check-env.js and run with node
const required = [
  'STRIPE_SECRET_KEY',
  'STRIPE_BARBER_SUBSCRIPTION_PRICE_ID',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const verification = [
  ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
  ['RESEND_API_KEY']
];

// Check logic here
console.log('Checking required variables...');
```

---

### 🟡 Blocker 4: CLI Version Outdated

#### Problem
Using Supabase CLI v2.67.1, latest is v2.72.7

#### Resolution Steps

1. **Windows (Scoop)**
   ```powershell
   scoop update supabase
   ```

2. **Windows (Direct Download)**
   ```powershell
   # Download latest
   Invoke-WebRequest -Uri "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.tar.gz" -OutFile "supabase.tar.gz"

   # Extract and replace
   tar -xzf supabase.tar.gz
   Move-Item supabase.exe "C:\Program Files\supabase\" -Force
   ```

3. **NPM Global**
   ```bash
   npm update -g supabase
   ```

4. **Verify Update**
   ```bash
   supabase --version
   # Should show 2.72.7 or later
   ```

---

## Quick Blocker Check Script

Save as `check-blockers.ps1` and run:

```powershell
# Check all blockers
Write-Host "=== Deployment Blocker Check ===" -ForegroundColor Cyan

# 1. Check Supabase CLI
Write-Host "`n1. Checking Supabase CLI..." -ForegroundColor Yellow
$version = supabase --version
Write-Host "   Version: $version"
if ($version -match "2\.6[0-6]") {
    Write-Host "   ⚠️  Consider updating CLI" -ForegroundColor Red
}

# 2. Check Docker
Write-Host "`n2. Checking Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "   ✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker not running - start Docker Desktop" -ForegroundColor Red
}

# 3. Check Projects
Write-Host "`n3. Checking linked projects..." -ForegroundColor Yellow
$projects = supabase projects list
if ($projects -match "Direct-Cuts") {
    Write-Host "   ✅ Production project linked" -ForegroundColor Green
} else {
    Write-Host "   ❌ No project linked" -ForegroundColor Red
}

# 4. Check for staging
if ($projects -match "staging") {
    Write-Host "   ✅ Staging project found" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No staging project" -ForegroundColor Yellow
}

Write-Host "`n=== End Check ===" -ForegroundColor Cyan
```

---

## Escalation Path

If blockers cannot be resolved:

### Level 1: Team Slack
- Post in #deployments channel
- Tag @platform-team for database issues
- Tag @devops for environment access

### Level 2: Direct Contact
- Engineering Lead: [Name]
- DevOps Lead: [Name]
- Product Owner: [Name]

### Level 3: Emergency
- Use PagerDuty for production issues
- Call engineering on-call for critical blockers

---

## Pre-Flight Checklist

Before attempting deployment, ensure:

- [ ] Docker Desktop is running (or skip local testing)
- [ ] Staging project reference obtained
- [ ] Environment variables documented (even if not set)
- [ ] Supabase CLI updated (optional but recommended)
- [ ] Rollback plan reviewed
- [ ] Team notified of deployment window

---

**Remember**: Most blockers are configuration issues that can be resolved quickly with the right access or information. Don't hesitate to ask for help!