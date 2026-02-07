@echo off
echo Testing Legal Ops Agent from StrataNoble...
echo.

cd C:\Dev\StrataNoble

node C:\Dev\.claude-anx\runtime\agent-invoker.js legal-ops --task="Examine business plan documents and generate comprehensive analysis for grants and investment" --context="./ANX/02_Operating_Company_Strata_Noble_LLC"

echo.
echo Test complete! Check C:\Dev\StrataNoble\proof-packs for results
pause
