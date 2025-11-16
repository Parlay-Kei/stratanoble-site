#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Interactive MCP Integration Configuration
.DESCRIPTION
    Guides you through setting up Google Drive and Notion MCP integrations
.EXAMPLE
    .\configure-mcp-integrations.ps1
#>

$ErrorActionPreference = "Stop"

$Colors = @{
    Reset = "`e[0m"
    Green = "`e[32m"
    Yellow = "`e[33m"
    Red = "`e[31m"
    Cyan = "`e[36m"
    Blue = "`e[34m"
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = 'Reset')
    Write-Host "$($Colors[$Color])$Message$($Colors.Reset)"
}

function Write-Header {
    param([string]$Title)
    Write-ColorOutput "`n$('=' * 80)" 'Cyan'
    Write-ColorOutput "  $Title" 'Cyan'
    Write-ColorOutput "$('=' * 80)`n" 'Cyan'
}

function Add-EnvVariable {
    param(
        [string]$VarName,
        [string]$VarValue,
        [string]$Section = ""
    )

    $envPath = "apps\website\.env.local"

    if (-not (Test-Path $envPath)) {
        Write-ColorOutput "  Creating .env.local file..." 'Yellow'
        New-Item -Path $envPath -ItemType File -Force | Out-Null
    }

    $content = Get-Content $envPath -Raw -ErrorAction SilentlyContinue

    # Add section header if provided and not exists
    if ($Section -and $content -notmatch [regex]::Escape($Section)) {
        $content += "`n`n# --- $Section ---`n"
    }

    # Add or update variable
    if ($content -match "^$VarName=") {
        $content = $content -replace "^$VarName=.*$", "$VarName=$VarValue"
        Write-ColorOutput "  Updated: $VarName" 'Green'
    } else {
        $content += "$VarName=$VarValue`n"
        Write-ColorOutput "  Added: $VarName" 'Green'
    }

    Set-Content -Path $envPath -Value $content -NoNewline
}

# Main execution
Write-Header "MCP Integration Configuration Wizard"

Write-ColorOutput "This wizard will help you configure:" 'Cyan'
Write-ColorOutput "  1. Google Drive MCP (brand assets & documentation)" 'Reset'
Write-ColorOutput "  2. Notion MCP (task management & knowledge base)" 'Reset'

Write-ColorOutput "`nBefore starting, ensure you have:" 'Yellow'
Write-ColorOutput "  - Google Cloud Console access" 'Reset'
Write-ColorOutput "  - Notion workspace admin permissions" 'Reset'

Write-Host "`nPress Enter to continue or Ctrl+C to exit..."
Read-Host

# Google Drive Configuration
Write-Header "1. Google Drive MCP Configuration"

Write-ColorOutput "Opening setup guide in browser..." 'Cyan'
Write-ColorOutput "Follow these steps:`n" 'Yellow'

Write-ColorOutput "1. Go to: https://console.cloud.google.com/apis/credentials" 'Cyan'
Write-ColorOutput "2. Create OAuth 2.0 Client ID (Desktop app)" 'Reset'
Write-ColorOutput "3. Go to: https://developers.google.com/oauthplayground/" 'Reset'
Write-ColorOutput "4. Configure with your credentials" 'Reset'
Write-ColorOutput "5. Get refresh token`n" 'Reset'

Write-Host "Press Enter when ready to input credentials..."
Read-Host

Write-ColorOutput "`nEnter Google Drive credentials:" 'Cyan'

$clientId = Read-Host "Client ID (.apps.googleusercontent.com)"
if ($clientId) {
    Add-EnvVariable -VarName "GOOGLE_DRIVE_CLIENT_ID" -VarValue $clientId -Section "Google Drive MCP Configuration"
}

$clientSecret = Read-Host "Client Secret (GOCSPX-...)"
if ($clientSecret) {
    Add-EnvVariable -VarName "GOOGLE_DRIVE_CLIENT_SECRET" -VarValue $clientSecret
}

$refreshToken = Read-Host "Refresh Token (1//...)"
if ($refreshToken) {
    Add-EnvVariable -VarName "GOOGLE_DRIVE_REFRESH_TOKEN" -VarValue $refreshToken
}

if ($clientId -and $clientSecret -and $refreshToken) {
    Write-ColorOutput "`n  Google Drive credentials saved!" 'Green'

    # Install MCP server
    Write-ColorOutput "`nInstalling Google Drive MCP server..." 'Cyan'
    npm install -g @modelcontextprotocol/server-google-drive

    # Test
    Write-ColorOutput "`nTesting Google Drive integration..." 'Cyan'
    node scripts/test-google-drive-mcp.mjs
} else {
    Write-ColorOutput "`n  Skipped Google Drive configuration" 'Yellow'
}

# Notion Configuration
Write-Header "2. Notion MCP Configuration"

Write-ColorOutput "Opening Notion integrations in browser..." 'Cyan'
Write-ColorOutput "Follow these steps:`n" 'Yellow'

Write-ColorOutput "1. Go to: https://www.notion.so/my-integrations" 'Cyan'
Write-ColorOutput "2. Create new integration: 'StrataNoble DevOps Agent'" 'Reset'
Write-ColorOutput "3. Enable Read/Update/Insert capabilities" 'Reset'
Write-ColorOutput "4. Copy Internal Integration Token" 'Reset'
Write-ColorOutput "5. Share databases with the integration`n" 'Reset'

Write-Host "Press Enter when ready to input token..."
Read-Host

Write-ColorOutput "`nEnter Notion credentials:" 'Cyan'

$notionToken = Read-Host "Integration Token (secret_...)"
if ($notionToken) {
    Add-EnvVariable -VarName "NOTION_API_KEY" -VarValue $notionToken -Section "Notion MCP Configuration"

    Write-ColorOutput "`n  Notion credentials saved!" 'Green'

    # Install MCP server
    Write-ColorOutput "`nInstalling Notion MCP server..." 'Cyan'
    npm install -g @modelcontextprotocol/server-notion

    # Test
    Write-ColorOutput "`nTesting Notion integration..." 'Cyan'
    node scripts/test-notion-mcp.mjs
} else {
    Write-ColorOutput "`n  Skipped Notion configuration" 'Yellow'
}

# Final verification
Write-Header "Configuration Complete"

Write-ColorOutput "Running full system test..." 'Cyan'
.\scripts\test-phase2-system.ps1

Write-ColorOutput "`n  MCP integrations are configured!" 'Green'
Write-ColorOutput "`nNext steps:" 'Cyan'
Write-ColorOutput "  1. Share Notion databases with integration" 'Reset'
Write-ColorOutput "  2. Organize brand assets in Google Drive" 'Reset'
Write-ColorOutput "  3. Start using the DevOps agent:`n" 'Reset'
Write-ColorOutput "     .\scripts\run-devops-agent.ps1 -Mode full -Continuous`n" 'Yellow'

Write-ColorOutput "Documentation: MCP_INTEGRATION_SETUP.md`n" 'Cyan'
