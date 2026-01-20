@echo off
REM Direct Cuts Data Room Sync - Quick Launch Script
REM Double-click this file to sync your Data Room to Google Drive

echo.
echo ================================================
echo   Direct Cuts Data Room - Google Drive Sync
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found
    echo Please install Python from: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if requirements are installed
python -c "import google.auth" >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    echo.
    pip install -r requirements-sync.txt
    echo.
)

REM Check if credentials.json exists
if not exist credentials.json (
    echo.
    echo ERROR: credentials.json not found!
    echo.
    echo Please follow setup instructions in SYNC_SETUP_GUIDE.md
    echo.
    pause
    exit /b 1
)

REM Ask user what to do
echo What would you like to do?
echo.
echo 1. Preview sync (dry run - no changes)
echo 2. Sync files (upload new/changed only)
echo 3. Force sync (re-upload everything)
echo 4. Exit
echo.

set /p choice="Enter choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Running dry run...
    python sync_data_room.py --dry-run
) else if "%choice%"=="2" (
    echo.
    echo Syncing files...
    python sync_data_room.py
) else if "%choice%"=="3" (
    echo.
    echo Force syncing all files...
    python sync_data_room.py --force
) else if "%choice%"=="4" (
    exit /b 0
) else (
    echo Invalid choice
)

echo.
pause
