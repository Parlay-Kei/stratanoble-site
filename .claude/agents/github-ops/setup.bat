@echo off
echo ========================================
echo GitHub Ops Agent Setup
echo ========================================
echo.

cd /d "%~dp0"

echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm install failed
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create .env file with your GitHub token:
echo    copy .env.example .env
echo    Then edit .env with your credentials
echo.
echo 2. Test the CLI:
echo    npm run cli -- status
echo.
echo 3. Add to Claude Desktop config:
echo    See AGENT.md for configuration
echo.
pause
