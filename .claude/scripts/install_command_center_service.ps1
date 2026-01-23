# ANX Command Center Service Installer for Windows
# Creates a Scheduled Task to run supervisor at user login

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "install"
)

$TaskName = "ANXCommandCenterSupervisor"
$ANXRoot = "C:\Dev\.claude-anx"
$SupervisorPath = "$ANXRoot\tools\command-center\supervisor\anx_supervisor.js"
$NodePath = (Get-Command node).Path
$LogPath = "$ANXRoot\logs\supervisor.log"

function Install-Service {
    Write-Host "Installing ANX Command Center Service..." -ForegroundColor Green

    # Create logs directory if it doesn't exist
    $LogDir = Split-Path $LogPath -Parent
    if (!(Test-Path $LogDir)) {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
        Write-Host "Created logs directory: $LogDir" -ForegroundColor Yellow
    }

    # Check if Node.js is installed
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }

    # Check if supervisor script exists
    if (!(Test-Path $SupervisorPath)) {
        Write-Host "ERROR: Supervisor script not found at $SupervisorPath" -ForegroundColor Red
        exit 1
    }

    # Check if task already exists
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "Task already exists. Removing old task..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }

    # Create the scheduled task
    $Action = New-ScheduledTaskAction `
        -Execute $NodePath `
        -Argument """$SupervisorPath""" `
        -WorkingDirectory $ANXRoot

    # Trigger at user logon
    $Trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

    # Run with highest privileges available to user
    $Principal = New-ScheduledTaskPrincipal `
        -UserId $env:USERNAME `
        -LogonType Interactive `
        -RunLevel Highest

    # Task settings
    $Settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RestartInterval (New-TimeSpan -Minutes 5) `
        -RestartCount 3 `
        -ExecutionTimeLimit (New-TimeSpan -Hours 0)

    # Register the task
    $Task = Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $Action `
        -Trigger $Trigger `
        -Principal $Principal `
        -Settings $Settings `
        -Description "ANX Command Center Supervisor - Ensures API and UI services are always running"

    if ($Task) {
        Write-Host "Successfully installed ANX Command Center Service!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Service Details:" -ForegroundColor Cyan
        Write-Host "  Task Name: $TaskName"
        Write-Host "  Trigger: At user login ($env:USERNAME)"
        Write-Host "  Command: $NodePath $SupervisorPath"
        Write-Host ""

        # Ask if user wants to start now
        $startNow = Read-Host "Do you want to start the service now? (Y/N)"
        if ($startNow -eq "Y" -or $startNow -eq "y") {
            Start-Service-Now
        } else {
            Write-Host "Service will start automatically at next login." -ForegroundColor Yellow
        }

        # Create uninstall documentation
        Create-UninstallDoc
    } else {
        Write-Host "ERROR: Failed to create scheduled task" -ForegroundColor Red
        exit 1
    }
}

function Uninstall-Service {
    Write-Host "Uninstalling ANX Command Center Service..." -ForegroundColor Yellow

    # Check if task exists
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if (!$existingTask) {
        Write-Host "Service is not installed." -ForegroundColor Yellow
        return
    }

    # Stop the running task if active
    Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

    # Remove the task
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false

    Write-Host "Successfully uninstalled ANX Command Center Service!" -ForegroundColor Green

    # Kill any remaining node processes for supervisor
    $supervisorProcesses = Get-Process node -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -like "*anx_supervisor.js*" }

    if ($supervisorProcesses) {
        Write-Host "Stopping supervisor processes..." -ForegroundColor Yellow
        $supervisorProcesses | Stop-Process -Force
    }
}

function Start-Service-Now {
    Write-Host "Starting ANX Command Center Service..." -ForegroundColor Green
    Start-ScheduledTask -TaskName $TaskName

    Start-Sleep -Seconds 3

    # Check if it started
    $task = Get-ScheduledTask -TaskName $TaskName
    if ($task.State -eq "Running") {
        Write-Host "Service started successfully!" -ForegroundColor Green
        Write-Host "Access Command Center at: http://localhost:3000" -ForegroundColor Cyan
    } else {
        Write-Host "WARNING: Service may not have started correctly." -ForegroundColor Yellow
        Write-Host "Check logs at: $LogPath" -ForegroundColor Yellow
    }
}

function Get-Service-Status {
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

    if (!$task) {
        Write-Host "ANX Command Center Service is not installed." -ForegroundColor Yellow
        return
    }

    Write-Host ""
    Write-Host "ANX Command Center Service Status" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "  Status: $($task.State)"
    Write-Host "  Last Run: $($task.LastRunTime)"
    Write-Host "  Next Run: $($task.NextRunTime)"
    Write-Host "  Last Result: $($task.LastTaskResult)"

    # Check if supervisor process is running
    $supervisorProcesses = Get-Process node -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -like "*anx_supervisor.js*" }

    if ($supervisorProcesses) {
        Write-Host "  Supervisor PID: $($supervisorProcesses.Id -join ', ')" -ForegroundColor Green
        Write-Host "  Status: RUNNING" -ForegroundColor Green
    } else {
        Write-Host "  Status: NOT RUNNING" -ForegroundColor Red
    }
    Write-Host ""
}

function Create-UninstallDoc {
    $docPath = "$ANXRoot\receipts\COMMAND_CENTER_SERVICE_BREAKGLASS.md"

    $content = @"
# ANX Command Center Service - Breakglass Documentation

## Installation Details

- **Service Name:** $TaskName
- **Installed On:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- **User:** $env:USERNAME
- **Supervisor Path:** $SupervisorPath

## How to Manually Control the Service

### Check Status
``````powershell
Get-ScheduledTask -TaskName "$TaskName"
``````

### Start Service
``````powershell
Start-ScheduledTask -TaskName "$TaskName"
``````

### Stop Service
``````powershell
Stop-ScheduledTask -TaskName "$TaskName"
``````

### Disable Service (Temporary)
``````powershell
Disable-ScheduledTask -TaskName "$TaskName"
``````

### Enable Service
``````powershell
Enable-ScheduledTask -TaskName "$TaskName"
``````

## Complete Uninstall

Run the uninstall script:
``````powershell
& "$ANXRoot\scripts\uninstall_command_center_service.ps1"
``````

Or manually:
``````powershell
# Stop the task
Stop-ScheduledTask -TaskName "$TaskName"

# Unregister the task
Unregister-ScheduledTask -TaskName "$TaskName" -Confirm:```$false

# Kill any remaining processes
Get-Process node | Where-Object { ```$_.CommandLine -like "*anx_supervisor.js*" } | Stop-Process -Force
``````

## Troubleshooting

### Service Won't Start
1. Check Node.js is installed: ``node --version``
2. Verify supervisor exists: ``Test-Path "$SupervisorPath"``
3. Check Windows Event Log for errors
4. Review logs at: ``$LogPath``

### Port Already in Use
1. Find process using port 5000: ``netstat -ano | findstr :5000``
2. Kill the process: ``taskkill /PID <PID> /F``

### Access Denied Errors
1. Run PowerShell as Administrator
2. Reinstall the service with elevated privileges

## Emergency Stop

If the service is misbehaving and needs immediate stop:
``````powershell
# Force kill all node processes (CAUTION: kills ALL Node.js processes)
Get-Process node | Stop-Process -Force
``````

---
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

    Set-Content -Path $docPath -Value $content
    Write-Host "Created breakglass documentation at: $docPath" -ForegroundColor Green
}

# Main execution
switch ($Action.ToLower()) {
    "install" {
        Install-Service
    }
    "uninstall" {
        Uninstall-Service
    }
    "status" {
        Get-Service-Status
    }
    "start" {
        Start-Service-Now
    }
    default {
        Write-Host "Usage: .\install_command_center_service.ps1 [-Action install|uninstall|status|start]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Actions:" -ForegroundColor Cyan
        Write-Host "  install   - Install the service (default)"
        Write-Host "  uninstall - Remove the service"
        Write-Host "  status    - Check service status"
        Write-Host "  start     - Start the service now"
    }
}