# Health Check Runner
# Wrapper script to run health monitor from correct directory

$ErrorActionPreference = "Stop"

Write-Host "🏥 Running Health Check..." -ForegroundColor Cyan

# Navigate to website directory
$websitePath = Join-Path $PSScriptRoot "..\apps\website"

if (-not (Test-Path $websitePath)) {
    Write-Host "❌ Website directory not found: $websitePath" -ForegroundColor Red
    exit 1
}

Push-Location $websitePath

try {
    # Run health monitor
    node ../../scripts/health-monitor.mjs
    $exitCode = $LASTEXITCODE

    if ($exitCode -eq 0) {
        Write-Host "`n✅ Health check completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Health check completed with issues. Review output above." -ForegroundColor Yellow
    }

    exit $exitCode
} finally {
    Pop-Location
}
