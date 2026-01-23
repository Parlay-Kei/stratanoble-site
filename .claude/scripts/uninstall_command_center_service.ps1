# ANX Command Center Service Uninstaller

$TaskName = "ANXCommandCenterSupervisor"

Write-Host "Uninstalling ANX Command Center Service..." -ForegroundColor Yellow

# Check if task exists
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if (!$existingTask) {
    Write-Host "Service is not installed." -ForegroundColor Yellow
    exit 0
}

# Stop the running task if active
Write-Host "Stopping service..." -ForegroundColor Yellow
Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

# Remove the task
Write-Host "Removing scheduled task..." -ForegroundColor Yellow
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false

# Kill any remaining supervisor processes
Write-Host "Stopping supervisor processes..." -ForegroundColor Yellow
$supervisorProcesses = Get-Process node -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like "*anx_supervisor.js*" }

if ($supervisorProcesses) {
    $supervisorProcesses | Stop-Process -Force
    Write-Host "Stopped $($supervisorProcesses.Count) supervisor process(es)" -ForegroundColor Green
}

Write-Host ""
Write-Host "ANX Command Center Service has been completely uninstalled!" -ForegroundColor Green
Write-Host "All processes have been stopped and the scheduled task removed." -ForegroundColor Green