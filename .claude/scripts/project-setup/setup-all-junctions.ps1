# PowerShell script to setup junctions for all projects
$ErrorActionPreference = "Stop"

Write-Host "Setting up Claude ANX junctions for all projects..." -ForegroundColor Cyan
Write-Host ""

$devDir = "C:\Dev"
$claudeAnx = "C:\Dev\.claude-anx"
$excludeDirs = @(".claude", ".claude-anx")

# Get all directories in C:\Dev
$projects = Get-ChildItem -Path $devDir -Directory | Where-Object { 
    $excludeDirs -notcontains $_.Name 
}

foreach ($project in $projects) {
    Write-Host "Processing: $($project.Name)" -ForegroundColor Yellow
    
    $claudePath = Join-Path $project.FullName ".claude"
    
    # Check if .claude exists
    if (Test-Path $claudePath) {
        # Check if it's a junction
        $item = Get-Item $claudePath -Force
        if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
            Write-Host "  - Removing existing junction" -ForegroundColor Gray
            $item.Delete()
        } else {
            # It's a real directory, backup
            Write-Host "  - Backing up existing .claude directory" -ForegroundColor Gray
            $backupPath = Join-Path $project.FullName ".claude.backup"
            if (Test-Path $backupPath) {
                Remove-Item $backupPath -Recurse -Force
            }
            Move-Item $claudePath $backupPath -Force
        }
    }
    
    # Create junction
    try {
        Write-Host "  - Creating junction to .claude-anx" -ForegroundColor Gray
        $null = New-Item -ItemType Junction -Path $claudePath -Target $claudeAnx -Force
        Write-Host "  SUCCESS: Junction created" -ForegroundColor Green
    } catch {
        Write-Host "  ERROR: Failed to create junction - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "Junction setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "All projects now have access to centralized agents and skills at:" -ForegroundColor Cyan
Write-Host "  $claudeAnx" -ForegroundColor White
