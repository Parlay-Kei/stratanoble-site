@echo off
REM Setup junctions for all projects in C:\Dev

echo Setting up Claude ANX junctions for all projects...
echo.

cd /d C:\Dev

REM List of all project directories (excluding system folders)
for /d %%d in (*) do (
    REM Skip special directories
    if not "%%d"==".claude" (
        if not "%%d"==".claude-anx" (
            call :setup_junction "%%d"
        )
    )
)

echo.
echo Junction setup complete!
pause
exit /b

:setup_junction
set PROJECT=%~1
echo Processing: %PROJECT%

REM Check if .claude exists and is not a junction
if exist "%PROJECT%\.claude" (
    fsutil reparsepoint query "%PROJECT%\.claude" >nul 2>&1
    if errorlevel 1 (
        echo   - Backing up existing .claude directory
        if exist "%PROJECT%\.claude.backup" rd /s /q "%PROJECT%\.claude.backup"
        move "%PROJECT%\.claude" "%PROJECT%\.claude.backup" >nul
    ) else (
        echo   - Removing existing junction
        rmdir "%PROJECT%\.claude"
    )
)

REM Create junction
echo   - Creating junction to .claude-anx
mklink /J "%PROJECT%\.claude" "C:\Dev\.claude-anx" >nul
if errorlevel 1 (
    echo   ERROR: Failed to create junction
) else (
    echo   SUCCESS: Junction created
)
echo.
exit /b
