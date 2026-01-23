#
# ANX Command Center - Shortcuts Installer V1
# Creates Start Menu and Desktop shortcuts for one-click access
#

param(
    [switch]$Uninstall = $false,
    [switch]$Silent = $false
)

# Configuration
$ANXRoot = "C:\Dev\.claude-anx"
$LauncherScript = "$ANXRoot\scripts\start_command_center.ps1"
$ReceiptsDir = "$ANXRoot\receipts"

# Shortcut paths
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$StartMenuPath = [Environment]::GetFolderPath("StartMenu")
$DesktopShortcut = "$DesktopPath\ANX Command Center.lnk"
$StartMenuShortcut = "$StartMenuPath\Programs\ANX Command Center.lnk"

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    if (-not $Silent) {
        Write-Host "[$timestamp] [$Level] $Message"
    }
}

function Test-Prerequisites {
    Write-Log "Checking prerequisites..."

    if (-not (Test-Path $LauncherScript)) {
        Write-Log "Launcher script not found: $LauncherScript" "ERROR"
        return $false
    }

    if (-not (Test-Path $ANXRoot)) {
        Write-Log "ANX root directory not found: $ANXRoot" "ERROR"
        return $false
    }

    Write-Log "Prerequisites check passed" "SUCCESS"
    return $true
}

function Create-Shortcut {
    param(
        [string]$ShortcutPath,
        [string]$Description
    )

    Write-Log "Creating shortcut: $Description"

    try {
        # Ensure parent directory exists
        $parentDir = Split-Path $ShortcutPath -Parent
        if (-not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
        }

        # Create COM object for shortcut
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($ShortcutPath)

        # Configure shortcut properties
        $Shortcut.TargetPath = "powershell.exe"
        $Shortcut.Arguments = "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$LauncherScript`" -Silent"
        $Shortcut.WorkingDirectory = Split-Path $LauncherScript -Parent
        $Shortcut.Description = "ANX Command Center - One-Click Launcher"
        $Shortcut.IconLocation = "powershell.exe,0"

        # Save shortcut
        $Shortcut.Save()

        # Release COM object
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($Shortcut) | Out-Null
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($WshShell) | Out-Null

        Write-Log "$Description created successfully" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "Failed to create $Description`: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Remove-Shortcut {
    param(
        [string]$ShortcutPath,
        [string]$Description
    )

    Write-Log "Removing shortcut: $Description"

    try {
        if (Test-Path $ShortcutPath) {
            Remove-Item $ShortcutPath -Force
            Write-Log "$Description removed successfully" "SUCCESS"
            return $true
        } else {
            Write-Log "$Description not found (already removed)" "INFO"
            return $true
        }
    }
    catch {
        Write-Log "Failed to remove $Description`: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Write-InstallReceipt {
    param(
        [bool]$Success,
        [bool]$IsUninstall,
        [hashtable]$Results,
        [string]$ErrorMessage = ""
    )

    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
    $operation = if ($IsUninstall) { "UNINSTALL" } else { "INSTALL" }
    $receiptPath = "$ReceiptsDir\COMMAND_CENTER_SHORTCUTS_${operation}_RECEIPT.md"

    # Ensure receipts directory exists
    if (-not (Test-Path $ReceiptsDir)) {
        New-Item -ItemType Directory -Path $ReceiptsDir -Force | Out-Null
    }

    $status = if ($Success) { "SUCCESS" } else { "FAILED" }

    $content = @"
# Command Center Shortcuts $operation Receipt

**Date:** $timestamp
**Operation:** $operation
**Status:** $status

## Shortcuts Management

### Desktop Shortcut
- **Path:** $DesktopShortcut
- **Status:** $(if ($Results.Desktop) { "SUCCESS" } else { "FAILED" })
- **Target:** powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "$LauncherScript" -Silent
- **Working Dir:** $(Split-Path $LauncherScript -Parent)

### Start Menu Shortcut
- **Path:** $StartMenuShortcut
- **Status:** $(if ($Results.StartMenu) { "SUCCESS" } else { "FAILED" })
- **Target:** powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "$LauncherScript" -Silent
- **Working Dir:** $(Split-Path $LauncherScript -Parent)

## Installation Details

### Launcher Configuration
- **Script Path:** $LauncherScript
- **Execution Policy:** Bypass (no restrictions)
- **Window Style:** Hidden (no console window)
- **Silent Mode:** Enabled (no user prompts)
- **Description:** ANX Command Center - One-Click Launcher

### User Experience
$(if ($IsUninstall) {
"- **Desktop Access:** REMOVED
- **Start Menu Access:** REMOVED
- **One-Click Launch:** DISABLED"
} else {
"- **Desktop Access:** Double-click desktop shortcut
- **Start Menu Access:** Start Menu > Programs > ANX Command Center
- **One-Click Launch:** Both shortcuts provide instant Command Center access
- **Zero Manual Steps:** Complete automation from shortcut to browser UI"
})

$(if ($ErrorMessage) {
"## Error Details
$ErrorMessage"
} else {
"## Success Metrics
$(if ($IsUninstall) {
"- **Cleanup Complete:** All shortcuts removed
- **System Restored:** No residual shortcut files
- **User Folders Clean:** Desktop and Start Menu restored"
} else {
"- **Installation Complete:** Both shortcuts created successfully
- **Access Methods:** Desktop + Start Menu integration
- **Launch Method:** Hidden PowerShell execution
- **Target Verified:** Launcher script exists and accessible"
})"
})

## File System Verification

- **ANX Root:** $(if (Test-Path $ANXRoot) { "EXISTS" } else { "MISSING" }) - $ANXRoot
- **Launcher Script:** $(if (Test-Path $LauncherScript) { "EXISTS" } else { "MISSING" }) - $LauncherScript
- **Desktop Folder:** $(if (Test-Path $DesktopPath) { "EXISTS" } else { "MISSING" }) - $DesktopPath
- **Start Menu Folder:** $(if (Test-Path $StartMenuPath) { "EXISTS" } else { "MISSING" }) - $StartMenuPath

---
Generated by: Shortcuts Installer V1
"@

    try {
        Set-Content -Path $receiptPath -Value $content -Encoding UTF8
        Write-Log "Receipt written to: $receiptPath" "SUCCESS"
    }
    catch {
        Write-Log "Failed to write receipt: $($_.Exception.Message)" "ERROR"
    }
}

# Main execution
function Main {
    $operation = if ($Uninstall) { "UNINSTALL" } else { "INSTALL" }
    Write-Log "ANX Command Center - Shortcuts $operation V1" "INFO"
    Write-Log "=============================================" "INFO"

    $results = @{ Desktop = $false; StartMenu = $false }
    $overallSuccess = $true
    $errorMessage = ""

    try {
        # Check prerequisites (only for install)
        if (-not $Uninstall) {
            if (-not (Test-Prerequisites)) {
                Write-InstallReceipt -Success $false -IsUninstall $Uninstall -Results $results -ErrorMessage "Prerequisites check failed"
                exit 1
            }
        }

        if ($Uninstall) {
            # Uninstall shortcuts
            Write-Log "Removing ANX Command Center shortcuts..." "INFO"

            $results.Desktop = Remove-Shortcut -ShortcutPath $DesktopShortcut -Description "Desktop shortcut"
            $results.StartMenu = Remove-Shortcut -ShortcutPath $StartMenuShortcut -Description "Start Menu shortcut"

            $overallSuccess = $results.Desktop -and $results.StartMenu

            if ($overallSuccess) {
                Write-Log "All shortcuts removed successfully" "SUCCESS"
            } else {
                $errorMessage = "One or more shortcuts failed to remove"
                Write-Log $errorMessage "ERROR"
            }
        }
        else {
            # Install shortcuts
            Write-Log "Installing ANX Command Center shortcuts..." "INFO"

            $results.Desktop = Create-Shortcut -ShortcutPath $DesktopShortcut -Description "Desktop shortcut"
            $results.StartMenu = Create-Shortcut -ShortcutPath $StartMenuShortcut -Description "Start Menu shortcut"

            $overallSuccess = $results.Desktop -and $results.StartMenu

            if ($overallSuccess) {
                Write-Log "All shortcuts installed successfully" "SUCCESS"
            } else {
                $errorMessage = "One or more shortcuts failed to install"
                Write-Log $errorMessage "ERROR"
            }
        }

        # Write receipt
        Write-InstallReceipt -Success $overallSuccess -IsUninstall $Uninstall -Results $results -ErrorMessage $errorMessage

        Write-Log "=============================================" "INFO"
        if ($Uninstall) {
            Write-Log "ANX Command Center shortcuts removed!" "SUCCESS"
        } else {
            Write-Log "ANX Command Center shortcuts installed!" "SUCCESS"
            Write-Log "Desktop: Double-click 'ANX Command Center'" "INFO"
            Write-Log "Start Menu: Programs > ANX Command Center" "INFO"
        }
        Write-Log "=============================================" "INFO"

        if (-not $Silent) {
            Write-Host ""
            if ($Uninstall) {
                Write-Host "ANX Command Center shortcuts have been removed." -ForegroundColor Yellow
                Write-Host "You can still run the launcher script directly if needed." -ForegroundColor Cyan
            } else {
                Write-Host "ANX Command Center shortcuts installed successfully!" -ForegroundColor Green
                Write-Host "Desktop: Double-click 'ANX Command Center' shortcut" -ForegroundColor Cyan
                Write-Host "Start Menu: Programs > ANX Command Center" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "Both shortcuts provide one-click access to Command Center!" -ForegroundColor Yellow
            }
            Write-Host ""
        }

        exit 0
    }
    catch {
        $errorMessage = "Unexpected error: $($_.Exception.Message)"
        Write-Log $errorMessage "ERROR"
        Write-InstallReceipt -Success $false -IsUninstall $Uninstall -Results $results -ErrorMessage $errorMessage
        exit 1
    }
}

# Execute main function
Main