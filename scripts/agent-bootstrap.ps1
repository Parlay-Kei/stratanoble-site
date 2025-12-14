# StrataNoble DevOps Agent Bootstrap Script
# Version: 1.0.0
# Date: November 3, 2025
# Purpose: Automated setup and validation of development environment

param(
    [switch]$SkipInstall,
    [switch]$SkipAuth,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

function Write-Header {
    param([string]$Text)
    Write-Host "`n========================================" -ForegroundColor $Cyan
    Write-Host $Text -ForegroundColor $Cyan
    Write-Host "========================================`n" -ForegroundColor $Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor $Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor $Red
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠️  $Text" -ForegroundColor $Yellow
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️  $Text" -ForegroundColor $Cyan
}

# Initialize counters
$script:TotalChecks = 0
$script:PassedChecks = 0
$script:FailedChecks = 0
$script:WarningChecks = 0

function Test-Command {
    param(
        [string]$Command,
        [string]$Description,
        [switch]$Required
    )

    $script:TotalChecks++

    if (Get-Command $Command -ErrorAction SilentlyContinue) {
        Write-Success "$Description installed"
        $script:PassedChecks++
        return $true
    } else {
        if ($Required) {
            Write-Error "$Description not found"
            $script:FailedChecks++
        } else {
            Write-Warning "$Description not found (optional)"
            $script:WarningChecks++
        }
        return $false
    }
}

function Test-EnvVar {
    param(
        [string]$VarName,
        [string]$Description,
        [switch]$Required
    )

    $script:TotalChecks++
    $value = [System.Environment]::GetEnvironmentVariable($VarName)

    # Also check in .env.local
    $envPath = Join-Path $PSScriptRoot "..\apps\website\.env.local"
    if (Test-Path $envPath) {
        $envContent = Get-Content $envPath -Raw
        if ($envContent -match "$VarName=(.+)") {
            $value = $matches[1].Trim()
        }
    }

    if ($value -and $value -ne "") {
        Write-Success "$Description configured"
        $script:PassedChecks++
        return $true
    } else {
        if ($Required) {
            Write-Error "$Description missing"
            $script:FailedChecks++
        } else {
            Write-Warning "$Description missing (optional)"
            $script:WarningChecks++
        }
        return $false
    }
}

# Main execution
try {
    Write-Header "🤖 StrataNoble DevOps Agent Bootstrap"
    Write-Host "Initializing automated development environment setup...`n"

    # 1. Check Prerequisites
    Write-Header "📋 Step 1: Checking Prerequisites"

    Write-Info "Checking Node.js environment..."
    $nodeVersion = node --version
    $npmVersion = npm --version

    if ($nodeVersion) {
        Write-Success "Node.js $nodeVersion"
        $script:PassedChecks++
    } else {
        Write-Error "Node.js not found. Install Node.js 20+ from https://nodejs.org"
        exit 1
    }

    if ($npmVersion) {
        Write-Success "npm $npmVersion"
        $script:PassedChecks++
    } else {
        Write-Error "npm not found"
        exit 1
    }

    $script:TotalChecks += 2

    # 2. Check CLI Tools
    Write-Header "🛠️  Step 2: Checking CLI Tools"

    Test-Command -Command "supabase" -Description "Supabase CLI" -Required
    Test-Command -Command "netlify" -Description "Netlify CLI" -Required
    Test-Command -Command "stripe" -Description "Stripe CLI"
    Test-Command -Command "gh" -Description "GitHub CLI" -Required
    Test-Command -Command "vercel" -Description "Vercel CLI"
    Test-Command -Command "turbo" -Description "Turbo (monorepo)" -Required

    # 3. Install Missing Tools (if not skipped)
    if (-not $SkipInstall) {
        Write-Header "📦 Step 3: Installing Missing Tools"

        if (-not (Get-Command "turbo" -ErrorAction SilentlyContinue)) {
            Write-Info "Installing Turbo..."
            npm install -g turbo
            Write-Success "Turbo installed"
        }

        if (-not (Get-Command "stripe" -ErrorAction SilentlyContinue)) {
            Write-Info "Installing Stripe CLI via Scoop..."
            if (Get-Command "scoop" -ErrorAction SilentlyContinue) {
                scoop install stripe
                Write-Success "Stripe CLI installed"
            } else {
                Write-Warning "Scoop not found. Install manually from https://stripe.com/docs/stripe-cli"
            }
        }
    } else {
        Write-Info "Skipping installation (--SkipInstall flag set)"
    }

    # 4. Verify Authentication
    Write-Header "🔐 Step 4: Checking Authentication"

    if (-not $SkipAuth) {
        # GitHub
        $ghStatus = gh auth status 2>&1
        if ($ghStatus -match "Logged in") {
            Write-Success "GitHub CLI authenticated"
            $script:PassedChecks++
        } else {
            Write-Warning "GitHub CLI not authenticated. Run: gh auth login"
            $script:WarningChecks++
        }
        $script:TotalChecks++

        # Netlify
        $netlifyStatus = netlify status 2>&1
        if ($netlifyStatus -match "Current Netlify User") {
            Write-Success "Netlify CLI authenticated"
            $script:PassedChecks++
        } else {
            Write-Warning "Netlify CLI not authenticated. Run: netlify login"
            $script:WarningChecks++
        }
        $script:TotalChecks++

        # Supabase
        try {
            $supabaseStatus = supabase projects list 2>&1
            if ($supabaseStatus -notmatch "Unauthorized") {
                Write-Success "Supabase CLI authenticated"
                $script:PassedChecks++
            } else {
                Write-Warning "Supabase CLI not authenticated. Run: supabase login"
                $script:WarningChecks++
            }
        } catch {
            Write-Warning "Supabase CLI authentication check failed"
            $script:WarningChecks++
        }
        $script:TotalChecks++
    } else {
        Write-Info "Skipping authentication checks (--SkipAuth flag set)"
    }

    # 5. Check Environment Variables
    Write-Header "🔑 Step 5: Checking Environment Variables"

    Write-Info "Checking database & auth..."
    Test-EnvVar -VarName "NEXT_PUBLIC_SUPABASE_URL" -Description "Supabase URL" -Required
    Test-EnvVar -VarName "NEXT_PUBLIC_SUPABASE_ANON_KEY" -Description "Supabase Anon Key" -Required
    Test-EnvVar -VarName "SUPABASE_SERVICE_ROLE_KEY" -Description "Supabase Service Role" -Required

    Write-Info "Checking payments..."
    Test-EnvVar -VarName "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" -Description "Stripe Public Key" -Required
    Test-EnvVar -VarName "STRIPE_SECRET_KEY" -Description "Stripe Secret Key" -Required

    Write-Info "Checking authentication..."
    Test-EnvVar -VarName "NEXTAUTH_SECRET" -Description "NextAuth Secret" -Required
    Test-EnvVar -VarName "GOOGLE_CLIENT_ID" -Description "Google OAuth Client ID" -Required

    Write-Info "Checking AI & Voice..."
    Test-EnvVar -VarName "OPENAI_API_KEY" -Description "OpenAI API Key" -Required
    Test-EnvVar -VarName "TWILIO_ACCOUNT_SID" -Description "Twilio Account SID"
    Test-EnvVar -VarName "TWILIO_AUTH_TOKEN" -Description "Twilio Auth Token"

    Write-Info "Checking security..."
    Test-EnvVar -VarName "VAULT_ENCRYPTION_KEY" -Description "Vault Encryption Key" -Required

    # 6. Verify Project Structure
    Write-Header "📁 Step 6: Checking Project Structure"

    $requiredPaths = @(
        "apps/website",
        "apps/platform",
        "packages/ui",
        "packages/utils",
        "supabase",
        ".claude"
    )

    foreach ($path in $requiredPaths) {
        $script:TotalChecks++
        $fullPath = Join-Path $PSScriptRoot "..\$path"
        if (Test-Path $fullPath) {
            Write-Success "$path exists"
            $script:PassedChecks++
        } else {
            Write-Error "$path missing"
            $script:FailedChecks++
        }
    }

    # 7. Install Dependencies
    Write-Header "📦 Step 7: Installing Dependencies"

    Write-Info "Installing root dependencies..."
    Push-Location (Join-Path $PSScriptRoot "..")

    if (Test-Path "package.json") {
        npm install --loglevel=error
        Write-Success "Root dependencies installed"
    }

    Write-Info "Installing website dependencies..."
    Push-Location "apps/website"

    if (Test-Path "package.json") {
        npm install --loglevel=error
        Write-Success "Website dependencies installed"
    }

    Pop-Location
    Pop-Location

    # 8. Run Type Check
    Write-Header "🔍 Step 8: Running Type Check"

    Push-Location (Join-Path $PSScriptRoot "..\apps\website")

    Write-Info "Running TypeScript compiler..."
    $typeCheckResult = npm run type-check 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Type check passed"
        $script:PassedChecks++
    } else {
        Write-Warning "Type check has errors (check output above)"
        $script:WarningChecks++
    }
    $script:TotalChecks++

    Pop-Location

    # 9. Generate Summary Report
    Write-Header "📊 Summary Report"

    $percentage = [math]::Round(($script:PassedChecks / $script:TotalChecks) * 100, 1)

    Write-Host "Total Checks: $script:TotalChecks" -ForegroundColor $Cyan
    Write-Host "✅ Passed: $script:PassedChecks" -ForegroundColor $Green
    Write-Host "⚠️  Warnings: $script:WarningChecks" -ForegroundColor $Yellow
    Write-Host "❌ Failed: $script:FailedChecks" -ForegroundColor $Red
    Write-Host "`nCompletion: $percentage%" -ForegroundColor $(if ($percentage -ge 90) { $Green } elseif ($percentage -ge 70) { $Yellow } else { $Red })

    # 10. Next Steps
    Write-Header "🚀 Next Steps"

    if ($script:FailedChecks -eq 0) {
        Write-Success "Environment is ready for development!"
        Write-Host "`nTo start the development server:"
        Write-Host "  cd apps/website"
        Write-Host "  npm run dev"
    } else {
        Write-Warning "$script:FailedChecks critical checks failed. Please fix the issues above before proceeding."

        if ($script:WarningChecks -gt 0) {
            Write-Info "$script:WarningChecks optional components are not configured."
        }
    }

    Write-Host "`nFor detailed documentation, see:"
    Write-Host "  .claude/docs/infrastructure-audit-2025-11-03.md"

    # Save report
    $reportPath = Join-Path $PSScriptRoot "..\logs\bootstrap-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').log"
    $reportDir = Split-Path $reportPath
    if (-not (Test-Path $reportDir)) {
        New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
    }

    @"
StrataNoble DevOps Agent Bootstrap Report
Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

Total Checks: $script:TotalChecks
Passed: $script:PassedChecks
Warnings: $script:WarningChecks
Failed: $script:FailedChecks
Completion: $percentage%

Status: $(if ($script:FailedChecks -eq 0) { "READY" } else { "NEEDS ATTENTION" })
"@ | Out-File $reportPath -Encoding UTF8

    Write-Success "Report saved to: $reportPath"

    # Exit code
    exit $(if ($script:FailedChecks -eq 0) { 0 } else { 1 })

} catch {
    Write-Error "Bootstrap failed with error: $_"
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
