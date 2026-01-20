@echo off
REM oc.cmd - ANX One-Command Front Door
REM Usage: oc "Do this task" [Entity]
REM Entity defaults to DC if not specified

setlocal

set "SCRIPT_DIR=%~dp0"
set "TITLE=%~1"
set "ENTITY=%~2"

if "%TITLE%"=="" (
    echo Usage: oc "task description" [Entity]
    echo Entity: DC ^(default^), SN, DSLV
    exit /b 1
)

if "%ENTITY%"=="" set "ENTITY=DC"

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%oc.ps1" "%TITLE%" -Entity %ENTITY%
exit /b %ERRORLEVEL%
