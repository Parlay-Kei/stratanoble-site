# Test Legal Ops Agent Invocation
Write-Host "Testing Legal Ops Agent from StrataNoble project..." -ForegroundColor Cyan

# Test 1: Invoke from project directory
Write-Host "`n=== Test 1: From StrataNoble Directory ===" -ForegroundColor Yellow
node C:\Dev\.claude-anx\runtime\agent-invoker.js legal-ops --task="Examine business plan documents and generate comprehensive analysis for grants and investment" --context="./ANX/02_Operating_Company_Strata_Noble_LLC"

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "Check the proof-packs directory for execution results" -ForegroundColor Cyan
