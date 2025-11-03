#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Master DevOps Agent Orchestrator
.DESCRIPTION
    Comprehensive automation script for StrataNoble infrastructure management.
    Runs setup, health monitoring, self-healing, and maintains system autonomy.
.PARAMETER Mode
    Operation mode: setup, monitor, heal, or full (default: full)
.PARAMETER HealingInterval
    Minutes between healing cycles (default: 5)
.PARAMETER Continuous
    Run continuously with scheduled checks (default: false)
.EXAMPLE
    .\run-devops-agent.ps1 -Mode full -Continuous
    Run complete DevOps agent with continuous monitoring
.EXAMPLE
    .\run-devops-agent.ps1 -Mode heal
    Run single healing cycle
#>

param(
    [ValidateSet('setup', 'monitor', 'heal', 'full')]
    [string]$Mode = 'full',

    [int]$HealingInterval = 5,

    [switch]$Continuous,

    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Reset = "`e[0m"
    Green = "`e[32m"
    Yellow = "`e[33m"
    Red = "`e[31m"
    Cyan = "`e[36m"
    Blue = "`e[34m"
    Magenta = "`e[35m"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = 'Reset'
    )
    Write-Host "$($Colors[$Color])$Message$($Colors.Reset)"
}

function Write-Header {
    param([string]$Title)
    Write-ColorOutput "`n$('=' * 80)" 'Cyan'
    Write-ColorOutput "  $Title" 'Cyan'
    Write-ColorOutput "$('=' * 80)`n" 'Cyan'
}

function Write-Section {
    param([string]$Title)
    Write-ColorOutput "`n$Title" 'Blue'
    Write-ColorOutput "$('-' * 80)" 'Blue'
}

function Test-Prerequisite {
    param(
        [string]$Command,
        [string]$Description,
        [switch]$Required
    )

    $exists = Get-Command $Command -ErrorAction SilentlyContinue

    if ($exists) {
        Write-ColorOutput "  ✓ $Description installed" 'Green'
        return $true
    } else {
        if ($Required) {
            Write-ColorOutput "  ✗ $Description NOT installed (REQUIRED)" 'Red'
            return $false
        } else {
            Write-ColorOutput "  ⚠ $Description not installed (optional)" 'Yellow'
            return $false
        }
    }
}

function Invoke-Setup {
    Write-Header "DevOps Agent Setup"

    Write-Section "Checking Prerequisites"

    $allGood = $true
    $allGood = (Test-Prerequisite -Command "node" -Description "Node.js" -Required) -and $allGood
    $allGood = (Test-Prerequisite -Command "npm" -Description "npm" -Required) -and $allGood
    $allGood = (Test-Prerequisite -Command "supabase" -Description "Supabase CLI") -and $allGood
    $allGood = (Test-Prerequisite -Command "gh" -Description "GitHub CLI") -and $allGood
    $allGood = (Test-Prerequisite -Command "netlify" -Description "Netlify CLI") -and $allGood
    $allGood = (Test-Prerequisite -Command "stripe" -Description "Stripe CLI") -and $allGood
    $allGood = (Test-Prerequisite -Command "turbo" -Description "Turbo") -and $allGood

    if (-not $allGood) {
        Write-ColorOutput "`n⚠️  Some required tools are missing. Run setup script:" 'Yellow'
        Write-ColorOutput "  .\scripts\agent-bootstrap.ps1`n" 'Cyan'
    }

    Write-Section "Validating Environment Variables"
    node scripts/validate-env.mjs

    Write-Section "Setting up MCP Servers"

    # Google Drive MCP
    Write-ColorOutput "`nConfiguring Google Drive MCP..." 'Cyan'
    node scripts/setup-google-drive-mcp.mjs

    # Notion MCP
    Write-ColorOutput "`nConfiguring Notion MCP..." 'Cyan'
    node scripts/setup-notion-mcp.mjs

    Write-ColorOutput "`n✅ Setup complete!" 'Green'
}

function Invoke-HealthMonitor {
    Write-Header "Health Monitoring"

    Write-Section "Running Health Checks"
    node scripts/health-monitor.mjs

    $exitCode = $LASTEXITCODE

    if ($exitCode -eq 0) {
        Write-ColorOutput "`n✅ All services healthy" 'Green'
        return $true
    } else {
        Write-ColorOutput "`n⚠️  Some services have issues" 'Yellow'
        return $false
    }
}

function Invoke-SelfHealing {
    Write-Header "Self-Healing Agent"

    Write-Section "Running Healing Cycle"

    try {
        # Call self-healing API endpoint
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/devops/heal" `
                                      -Method POST `
                                      -ContentType "application/json" `
                                      -TimeoutSec 30

        Write-ColorOutput "`nHealing Report:" 'Cyan'
        Write-ColorOutput "  Timestamp: $($response.timestamp)" 'Reset'
        Write-ColorOutput "  Issues Found: $($response.issuesFound)" 'Yellow'
        Write-ColorOutput "  Issues Fixed: $($response.issuesFixed)" 'Green'
        Write-ColorOutput "  Issues Failed: $($response.issuesFailed)" 'Red'

        if ($response.details.Count -gt 0) {
            Write-ColorOutput "`n  Details:" 'Cyan'
            foreach ($detail in $response.details) {
                $statusIcon = if ($detail.fixed) { "✓" } else { "✗" }
                $statusColor = if ($detail.fixed) { "Green" } else { "Red" }
                Write-ColorOutput "    $statusIcon [$($detail.service)] $($detail.issue)" $statusColor
            }
        }

        Write-ColorOutput "`n✅ Healing cycle complete" 'Green'
        return $true
    } catch {
        Write-ColorOutput "`n❌ Failed to run healing cycle: $_" 'Red'
        Write-ColorOutput "  Ensure dev server is running on port 3000" 'Yellow'
        return $false
    }
}

function Start-DevServer {
    Write-Section "Starting Development Server"

    # Check if server is already running
    $existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -like "*npm*" -or $_.CommandLine -like "*next dev*"
    }

    if ($existingProcess) {
        Write-ColorOutput "  ℹ Dev server already running (PID: $($existingProcess.Id))" 'Cyan'
        return $true
    }

    Write-ColorOutput "  Starting Next.js dev server..." 'Cyan'

    try {
        # Start dev server in background
        $job = Start-Job -ScriptBlock {
            Set-Location "C:\Dev\StrataNoble\apps\website"
            npm run dev
        }

        # Wait for server to start
        Write-ColorOutput "  Waiting for server to be ready..." 'Yellow'
        $maxAttempts = 30
        $attempt = 0

        while ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 2
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
                Write-ColorOutput "  ✓ Dev server is ready!" 'Green'
                return $true
            } catch {
                $attempt++
                if ($attempt % 5 -eq 0) {
                    Write-ColorOutput "  Still waiting... ($attempt/$maxAttempts)" 'Yellow'
                }
            }
        }

        Write-ColorOutput "  ⚠ Server start timeout after $maxAttempts attempts" 'Yellow'
        return $false
    } catch {
        Write-ColorOutput "  ❌ Failed to start dev server: $_" 'Red'
        return $false
    }
}

function Invoke-ContinuousMonitoring {
    Write-Header "Continuous DevOps Agent"

    Write-ColorOutput "Starting continuous monitoring with ${HealingInterval}-minute healing cycles..." 'Cyan'
    Write-ColorOutput "Press Ctrl+C to stop`n" 'Yellow'

    $cycleCount = 0

    while ($true) {
        $cycleCount++
        Write-ColorOutput "`n$('▀' * 80)" 'Magenta'
        Write-ColorOutput "Cycle #$cycleCount - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" 'Magenta'
        Write-ColorOutput "$('▀' * 80)" 'Magenta'

        # Run health monitor
        $healthy = Invoke-HealthMonitor

        # If not healthy, run healing
        if (-not $healthy) {
            Write-ColorOutput "`nIssues detected, triggering self-healing..." 'Yellow'
            Invoke-SelfHealing | Out-Null
        }

        # Wait for next cycle
        Write-ColorOutput "`nNext cycle in $HealingInterval minutes..." 'Cyan'
        Start-Sleep -Seconds ($HealingInterval * 60)
    }
}

# Main execution
try {
    Write-Header "StrataNoble DevOps Agent Orchestrator"
    Write-ColorOutput "Mode: $Mode | Healing Interval: ${HealingInterval}m | Continuous: $Continuous`n" 'Cyan'

    switch ($Mode) {
        'setup' {
            Invoke-Setup
        }
        'monitor' {
            Invoke-HealthMonitor
        }
        'heal' {
            # Ensure dev server is running
            Start-DevServer | Out-Null
            Invoke-SelfHealing
        }
        'full' {
            # Run complete cycle
            Invoke-Setup

            if ($Continuous) {
                # Ensure dev server is running
                Start-DevServer | Out-Null

                # Start continuous monitoring
                Invoke-ContinuousMonitoring
            } else {
                # Single cycle
                Invoke-HealthMonitor
                Start-DevServer | Out-Null
                Invoke-SelfHealing
            }
        }
    }

    Write-ColorOutput "`n✅ DevOps Agent completed successfully!`n" 'Green'
    exit 0

} catch {
    Write-ColorOutput "`n❌ DevOps Agent failed: $_`n" 'Red'
    if ($Verbose) {
        Write-ColorOutput "Stack Trace:" 'Red'
        Write-ColorOutput $_.ScriptStackTrace 'Red'
    }
    exit 1
}
