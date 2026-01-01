@echo off
REM Setup junction for a new project
REM Usage: setup-new-project.bat <project-name>

if "%~1"=="" (
    echo Usage: setup-new-project.bat ^<project-name^>
    echo Example: setup-new-project.bat MyNewProject
    exit /b 1
)

set PROJECT=%~1
set PROJECT_PATH=C:\Dev\%PROJECT%

echo Setting up Claude ANX junction for: %PROJECT%
echo.

REM Check if project directory exists
if not exist "%PROJECT_PATH%" (
    echo ERROR: Project directory does not exist: %PROJECT_PATH%
    echo Please create the project directory first.
    exit /b 1
)

REM Check if .claude already exists
if exist "%PROJECT_PATH%\.claude" (
    echo Checking existing .claude...
    fsutil reparsepoint query "%PROJECT_PATH%\.claude" >nul 2>&1
    if errorlevel 1 (
        echo - Backing up existing .claude directory
        if exist "%PROJECT_PATH%\.claude.backup" rd /s /q "%PROJECT_PATH%\.claude.backup"
        move "%PROJECT_PATH%\.claude" "%PROJECT_PATH%\.claude.backup" >nul
    ) else (
        echo - Junction already exists
        echo - Removing and recreating
        rmdir "%PROJECT_PATH%\.claude"
    )
)

REM Create junction
echo Creating junction to .claude-anx...
mklink /J "%PROJECT_PATH%\.claude" "C:\Dev\.claude-anx" >nul

if errorlevel 1 (
    echo.
    echo ERROR: Failed to create junction
    echo Make sure you're running as Administrator
    exit /b 1
)

echo.
echo SUCCESS: Junction created for %PROJECT%
echo Path: %PROJECT_PATH%\.claude
echo Target: C:\Dev\.claude-anx
echo.
echo The project now has access to all ANX agents and skills.
