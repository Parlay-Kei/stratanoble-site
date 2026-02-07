@echo off
REM StrataNoble Legal Ops Agent - Quick Invoke Script
REM This script invokes the Legal Ops agent to analyze StrataNoble business plan documents

echo.
echo ================================================
echo   StrataNoble Legal Ops Agent Invocation
echo ================================================
echo.

cd C:\Dev\StrataNoble

echo Invoking Legal Ops agent...
echo Task: Analyze business plan documents for grants and investment
echo Context: ANX Operating Company Documents
echo.

node C:\Dev\.claude-anx\bin\anx-agent.js legal-ops "Examine the two Strata Noble business plan documents and generate comprehensive analysis for grants and investment readiness" --context="./ANX/02_Operating_Company_Strata_Noble_LLC"

echo.
echo ================================================
echo   Analysis Complete
echo ================================================
echo.
echo Results saved to: C:\Dev\StrataNoble\proof-packs\
echo.

pause
