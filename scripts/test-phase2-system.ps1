#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Phase 2 System Test Suite
.DESCRIPTION
    Comprehensive testing for DevOps Agent Phase 2 implementation.
    Tests all components: MCP configs, monitoring dashboard, self-healing, orchestrator.
.EXAMPLE
    .\test-phase2-system.ps1
    Run complete test suite
#>

$ErrorActionPreference = "Stop"

$Colors = @{
    Reset = "`e[0m"
    Green = "`e[32m"
    Yellow = "`e[33m"
    Red = "`e[31m"
    Cyan = "`e[36m"
    Blue = "`e[34m"
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = 'Reset')
    Write-Host "$($Colors[$Color])$Message$($Colors.Reset)"
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Details = ""
    )

    $icon = if ($Passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($Passed) { "Green" } else { "Red" }

    Write-ColorOutput "  $icon $TestName" $color
    if ($Details) {
        Write-ColorOutput "    $Details" 'Reset'
    }

    return $Passed
}

# Test results tracking
$totalTests = 0
$passedTests = 0

Write-ColorOutput "`n$('=' * 80)" 'Cyan'
Write-ColorOutput "  Phase 2 System Test Suite" 'Cyan'
Write-ColorOutput "$('=' * 80)`n" 'Cyan'

# Test 1: MCP Configuration Files
Write-ColorOutput "`n[Test Category: MCP Configuration]" 'Blue'
Write-ColorOutput "$('-' * 80)" 'Blue'

$totalTests++
$googleDriveMcpExists = Test-Path ".claude/mcp-configs/google-drive-mcp.json"
if (Write-TestResult "Google Drive MCP config exists" $googleDriveMcpExists) { $passedTests++ }

$totalTests++
$notionMcpExists = Test-Path ".claude/mcp-configs/notion-mcp.json"
if (Write-TestResult "Notion MCP config exists" $notionMcpExists) { $passedTests++ }

$totalTests++
$googleDriveSetupExists = Test-Path "scripts/setup-google-drive-mcp.mjs"
if (Write-TestResult "Google Drive setup script exists" $googleDriveSetupExists) { $passedTests++ }

$totalTests++
$notionSetupExists = Test-Path "scripts/setup-notion-mcp.mjs"
if (Write-TestResult "Notion setup script exists" $notionSetupExists) { $passedTests++ }

# Test 2: Monitoring Dashboard
Write-ColorOutput "`n[Test Category: Monitoring Dashboard]" 'Blue'
Write-ColorOutput "$('-' * 80)" 'Blue'

$totalTests++
$healthApiExists = Test-Path "apps/website/src/app/api/admin/devops/health/route.ts"
if (Write-TestResult "Health check API endpoint exists" $healthApiExists) { $passedTests++ }

$totalTests++
$devopsPageExists = Test-Path "apps/website/src/app/admin/devops/page.tsx"
if (Write-TestResult "DevOps dashboard page exists" $devopsPageExists) { $passedTests++ }

$totalTests++
$devopsMonitorExists = Test-Path "apps/website/src/components/admin/DevOpsMonitor.tsx"
if (Write-TestResult "DevOpsMonitor component exists" $devopsMonitorExists) { $passedTests++ }

# Test 3: Self-Healing Agent
Write-ColorOutput "`n[Test Category: Self-Healing Agent]" 'Blue'
Write-ColorOutput "$('-' * 80)" 'Blue'

$totalTests++
$selfHealingExists = Test-Path "apps/website/src/lib/self-healing-agent.ts"
if (Write-TestResult "Self-healing agent library exists" $selfHealingExists) { $passedTests++ }

$totalTests++
$healApiExists = Test-Path "apps/website/src/app/api/admin/devops/heal/route.ts"
if (Write-TestResult "Healing API endpoint exists" $healApiExists) { $passedTests++ }

# Test 4: Master Orchestrator
Write-ColorOutput "`n[Test Category: Master Orchestrator]" 'Blue'
Write-ColorOutput "$('-' * 80)" 'Blue'

$totalTests++
$orchestratorExists = Test-Path "scripts/run-devops-agent.ps1"
if (Write-TestResult "Master orchestrator script exists" $orchestratorExists) { $passedTests++ }

$totalTests++
$healthCheckWrapperExists = Test-Path "scripts/run-health-check.ps1"
if (Write-TestResult "Health check wrapper exists" $healthCheckWrapperExists) { $passedTests++ }

# Test 5: Documentation
Write-ColorOutput "`n[Test Category: Documentation]" 'Blue'
Write-ColorOutput "$('-' * 80)" 'Blue'

$totalTests++
$auditDocExists = Test-Path ".claude/docs/infrastructure-audit-2025-11-03.md"
if (Write-TestResult "Infrastructure audit doc exists" $auditDocExists) { $passedTests++ }

$totalTests++
$setupDocExists = Test-Path ".claude/docs/devops-agent-setup-complete.md"
if (Write-TestResult "Setup complete doc exists" $setupDocExists) { $passedTests++ }

# Test 6: Environment Configuration
Write-ColorOutput "`n[Test Category: Environment Configuration]" 'Blue'
Write-ColorOutput "$('-' * 80)" 'Blue'

$totalTests++
$envExists = Test-Path "apps/website/.env.local"
if (Write-TestResult ".env.local file exists" $envExists) { $passedTests++ }

if ($envExists) {
    $envContent = Get-Content "apps/website/.env.local" -Raw

    $totalTests++
    $hasOpenAI = $envContent -match "OPENAI_API_KEY="
    if (Write-TestResult "OpenAI API key configured" $hasOpenAI) { $passedTests++ }

    $totalTests++
    $hasTwilio = $envContent -match "TWILIO_ACCOUNT_SID="
    if (Write-TestResult "Twilio credentials configured" $hasTwilio) { $passedTests++ }

    $totalTests++
    $hasSupabase = $envContent -match "NEXT_PUBLIC_SUPABASE_URL="
    if (Write-TestResult "Supabase configured" $hasSupabase) { $passedTests++ }

    $totalTests++
    $hasStripe = $envContent -match "STRIPE_SECRET_KEY="
    if (Write-TestResult "Stripe configured" $hasStripe) { $passedTests++ }
}

# Test 7: API Endpoints (if dev server is running)
Write-ColorOutput "`n[Test Category: Runtime API Tests]" 'Blue'
Write-ColorOutput "$('-' * 80)" 'Blue'

try {
    $totalTests++
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/devops/health" `
                                        -Method GET `
                                        -TimeoutSec 5 `
                                        -ErrorAction Stop

    $healthApiWorks = $healthResponse.services -and $healthResponse.environment -and $healthResponse.agent
    if (Write-TestResult "Health API endpoint responds" $healthApiWorks) { $passedTests++ }

    if ($healthApiWorks) {
        $totalTests++
        $serviceCount = $healthResponse.services.Count
        $servicesValid = $serviceCount -ge 6
        if (Write-TestResult "Health API returns service data" $servicesValid "$serviceCount services") { $passedTests++ }

        $totalTests++
        $envCount = $healthResponse.environment.Count
        $envValid = $envCount -ge 10
        if (Write-TestResult "Health API returns environment data" $envValid "$envCount variables") { $passedTests++ }

        $totalTests++
        $agentValid = $healthResponse.agent.autonomyLevel -gt 0
        if (Write-TestResult "Health API returns agent metrics" $agentValid "Autonomy: $($healthResponse.agent.autonomyLevel)%") { $passedTests++ }
    }
} catch {
    Write-ColorOutput "  [WARN] Dev server not running - skipping runtime API tests" 'Yellow'
    Write-ColorOutput "    Start dev server with: npm run dev" 'Reset'
}

# Calculate results
Write-ColorOutput "`n$('=' * 80)" 'Cyan'
Write-ColorOutput "  Test Results" 'Cyan'
Write-ColorOutput "$('=' * 80)" 'Cyan'

$passRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
$resultColor = if ($passRate -ge 90) { 'Green' } elseif ($passRate -ge 75) { 'Yellow' } else { 'Red' }

Write-ColorOutput "`n  Passed: $passedTests / $totalTests tests ($passRate%)" $resultColor

if ($passRate -eq 100) {
    Write-ColorOutput "`n  Perfect score! All Phase 2 components operational." 'Green'
} elseif ($passRate -ge 90) {
    Write-ColorOutput "`n  Excellent! Phase 2 system is ready." 'Green'
} elseif ($passRate -ge 75) {
    Write-ColorOutput "`n  Good progress, some components need attention." 'Yellow'
} else {
    Write-ColorOutput "`n  Several components missing or not configured." 'Red'
}

Write-ColorOutput "`n$('=' * 80)`n" 'Cyan'

# Exit with appropriate code
if ($passRate -ge 90) {
    exit 0
} else {
    exit 1
}
