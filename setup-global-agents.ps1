# Setup Global Agent Access
# Copies all consolidated agents and skills to global .claude directory for cross-project access

$sourceAgents = "C:\Dev\StrataNoble\.claude\agents"
$sourceSkills = "C:\Dev\StrataNoble\.claude\skills"
$globalClaude = "$env:USERPROFILE\.claude"
$globalAgents = "$globalClaude\agents"
$globalSkills = "$globalClaude\skills"

Write-Host "Setting up global agent access..." -ForegroundColor Cyan
Write-Host "Source: $sourceAgents" -ForegroundColor Gray
Write-Host "Target: $globalAgents" -ForegroundColor Gray

# Ensure global directories exist
if (-not (Test-Path $globalAgents)) {
    New-Item -ItemType Directory -Path $globalAgents -Force | Out-Null
    Write-Host "Created: $globalAgents" -ForegroundColor Green
}

if (-not (Test-Path $globalSkills)) {
    New-Item -ItemType Directory -Path $globalSkills -Force | Out-Null
    Write-Host "Created: $globalSkills" -ForegroundColor Green
}

# Function to copy agents recursively, preserving structure
function Copy-Agents {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Type = "agents"
    )
    
    $copied = 0
    $skipped = 0
    
    # Copy main agents (excluding consolidated)
    Get-ChildItem -Path $Source -File -Filter "*.md" -ErrorAction SilentlyContinue | ForEach-Object {
        $destPath = Join-Path $Destination $_.Name
        if (-not (Test-Path $destPath)) {
            Copy-Item -Path $_.FullName -Destination $destPath -Force
            $copied++
            Write-Host "  ✅ Copied: $($_.Name)" -ForegroundColor Green
        } else {
            $skipped++
            Write-Host "  ⚠️  Skipped (exists): $($_.Name)" -ForegroundColor Yellow
        }
    }
    
    # Copy subdirectories (design, engineering, etc.) but exclude consolidated
    Get-ChildItem -Path $Source -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne "consolidated" } | ForEach-Object {
        $destDir = Join-Path $Destination $_.Name
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        # Recursively copy all files
        Get-ChildItem -Path $_.FullName -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
            $relativePath = $_.FullName.Substring($_.Directory.Parent.FullName.Length + 1)
            $destPath = Join-Path $Destination $relativePath
            $destFileDir = Split-Path $destPath -Parent
            
            if (-not (Test-Path $destFileDir)) {
                New-Item -ItemType Directory -Path $destFileDir -Force | Out-Null
            }
            
            if (-not (Test-Path $destPath)) {
                Copy-Item -Path $_.FullName -Destination $destPath -Force
                $copied++
                Write-Host "  ✅ Copied: $relativePath" -ForegroundColor Green
            } else {
                $skipped++
            }
        }
    }
    
    # Copy consolidated agents to a "consolidated" subdirectory
    $consolidatedSource = Join-Path $Source "consolidated"
    if (Test-Path $consolidatedSource) {
        $consolidatedDest = Join-Path $Destination "consolidated"
        if (-not (Test-Path $consolidatedDest)) {
            New-Item -ItemType Directory -Path $consolidatedDest -Force | Out-Null
        }
        
        Get-ChildItem -Path $consolidatedSource -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
            $relativePath = $_.FullName.Substring($consolidatedSource.Length + 1)
            $destPath = Join-Path $consolidatedDest $relativePath
            $destFileDir = Split-Path $destPath -Parent
            
            if (-not (Test-Path $destFileDir)) {
                New-Item -ItemType Directory -Path $destFileDir -Force | Out-Null
            }
            
            Copy-Item -Path $_.FullName -Destination $destPath -Force
            $copied++
            Write-Host "  ✅ Copied (consolidated): $relativePath" -ForegroundColor Cyan
        }
    }
    
    return @{ Copied = $copied; Skipped = $skipped }
}

# Copy agents
Write-Host "`nCopying agents..." -ForegroundColor Cyan
$agentStats = Copy-Agents -Source $sourceAgents -Destination $globalAgents -Type "agents"

# Copy skills
Write-Host "`nCopying skills..." -ForegroundColor Cyan
$skillStats = Copy-Agents -Source $sourceSkills -Destination $globalSkills -Type "skills"

# Summary
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "Global Agent Setup Complete!" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Cyan
Write-Host "Agents: $($agentStats.Copied) copied, $($agentStats.Skipped) skipped" -ForegroundColor White
Write-Host "Skills: $($skillStats.Copied) copied, $($skillStats.Skipped) skipped" -ForegroundColor White
Write-Host "`nGlobal agents location: $globalAgents" -ForegroundColor Yellow
Write-Host "Global skills location: $globalSkills" -ForegroundColor Yellow
Write-Host "`n⚠️  Restart Claude Desktop/Code to load new agents" -ForegroundColor Yellow

