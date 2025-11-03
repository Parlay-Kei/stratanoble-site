# Pre-Push Hook Installation Script for Windows
# This script creates a git pre-push hook that runs validation checks

Write-Host "Installing Pre-Push Validation Hook..." -ForegroundColor Cyan
Write-Host ""

$hookPath = ".git\hooks\pre-push"
$gitDir = ".git"

# Check if .git directory exists
if (-not (Test-Path $gitDir)) {
    Write-Host "Error: Not a git repository!" -ForegroundColor Red
    Write-Host "Run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Create hooks directory if it doesn't exist
$hooksDir = ".git\hooks"
if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir | Out-Null
}

# Create pre-push hook with Unix-style line endings
$hookContent = @"
#!/bin/sh

echo "Running pre-push validation..."
echo ""

# Change to project root
cd "`$(git rev-parse --show-toplevel)"

# Run validation script
npm run pre-push-check

# Capture exit code
EXIT_CODE=`$?

if [ `$EXIT_CODE -ne 0 ]; then
    echo ""
    echo "Pre-push validation failed!"
    echo "Fix the issues above before pushing."
    echo ""
    exit 1
fi

echo ""
echo "All checks passed! Pushing to remote..."
echo ""
exit 0
"@

# Write hook with Unix line endings (LF only)
$hookContent -replace "`r`n", "`n" | Set-Content $hookPath -NoNewline -Encoding UTF8

Write-Host "Pre-push hook installed at: .git\hooks\pre-push" -ForegroundColor Green
Write-Host ""
Write-Host "Hook Configuration:" -ForegroundColor Cyan
Write-Host "  - Runs automatically before every push" -ForegroundColor Gray
Write-Host "  - Validates: Linting, TypeScript, Tests, Environment" -ForegroundColor Gray
Write-Host "  - Blocks push if validation fails" -ForegroundColor Gray
Write-Host ""
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  - Test now: npm run pre-push-check" -ForegroundColor Gray
Write-Host "  - Auto-fix: node scripts/auto-fix-lint.mjs" -ForegroundColor Gray
Write-Host "  - Bypass (emergency only): git push --no-verify" -ForegroundColor Gray
Write-Host ""
Write-Host "Testing the hook now..." -ForegroundColor Yellow
Write-Host ""

# Test the validation script
npm run pre-push-check

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Installation complete! The pre-push hook is ready." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Hook installed but validation found issues." -ForegroundColor Yellow
    Write-Host "Fix these issues before your next push." -ForegroundColor Yellow
}
