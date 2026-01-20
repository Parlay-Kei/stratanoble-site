@echo off
REM ANX Skills Server Setup Script
echo ============================================
echo  ANX Skills Server v2.0 Setup
echo ============================================
echo.

set SERVER_DIR=C:\Dev\.claude-anx\mcp-servers\skills-server
set CONFIG_PATH=%APPDATA%\Claude\claude_desktop_config.json

echo Step 1: Installing dependencies...
cd /d "%SERVER_DIR%"
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Step 2: Validating skills...
call npm run validate
if errorlevel 1 (
    echo WARNING: Validation failed - check your skills
)
echo.

echo Step 3: Updating Claude Desktop config...
if not exist "%APPDATA%\Claude" (
    echo ERROR: Claude Desktop not found at %APPDATA%\Claude
    echo Please install Claude Desktop first
    pause
    exit /b 1
)

REM Backup existing config
if exist "%CONFIG_PATH%" (
    copy "%CONFIG_PATH%" "%CONFIG_PATH%.backup" >nul
    echo Backed up existing config to claude_desktop_config.json.backup
)

REM Copy new config
copy C:\Dev\.claude-anx\mcp-configs\claude-desktop-config.json "%CONFIG_PATH%" >nul
echo Updated Claude Desktop config
echo.

echo ============================================
echo  Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Restart Claude Desktop
echo 2. The skills server will auto-start
echo 3. Check server logs at:
echo    %SERVER_DIR%\server.log
echo.
echo Usage:
echo   get_skill("frontend-dev-ops", level: 1)
echo   list_skills()
echo   recommend_skills(context: "build api")
echo.
pause
