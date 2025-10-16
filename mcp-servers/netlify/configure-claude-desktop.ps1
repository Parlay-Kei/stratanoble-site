# Configure Claude Desktop for Netlify MCP Server
# Run this script to automatically add the Netlify MCP server to Claude Desktop

$ErrorActionPreference = "Stop"

Write-Host "🔧 Configuring Claude Desktop for Netlify MCP Server..." -ForegroundColor Cyan
Write-Host ""

# Get Claude config directory
$claudeConfigDir = Join-Path $env:APPDATA "Claude"
$configFile = Join-Path $claudeConfigDir "claude_desktop_config.json"

Write-Host "📁 Claude config directory: $claudeConfigDir" -ForegroundColor Gray
Write-Host "📄 Config file: $configFile" -ForegroundColor Gray
Write-Host ""

# Create directory if it doesn't exist
if (-not (Test-Path $claudeConfigDir)) {
    Write-Host "📁 Creating Claude config directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $claudeConfigDir -Force | Out-Null
    Write-Host "✅ Directory created" -ForegroundColor Green
}

# Get current working directory (should be mcp-servers/netlify)
$mcpServerPath = (Get-Location).Path
$indexPath = Join-Path $mcpServerPath "index.js"

if (-not (Test-Path $indexPath)) {
    Write-Host "❌ Error: index.js not found at $indexPath" -ForegroundColor Red
    Write-Host "   Please run this script from the mcp-servers/netlify directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found MCP server at: $indexPath" -ForegroundColor Green
Write-Host ""

# Load or create config
if (Test-Path $configFile) {
    Write-Host "📖 Reading existing configuration..." -ForegroundColor Yellow
    $config = Get-Content $configFile -Raw | ConvertFrom-Json
    Write-Host "✅ Existing config loaded" -ForegroundColor Green
} else {
    Write-Host "📝 Creating new configuration..." -ForegroundColor Yellow
    $config = @{
        mcpServers = @{}
    }
    Write-Host "✅ New config created" -ForegroundColor Green
}

Write-Host ""

# Check if mcpServers exists
if (-not $config.mcpServers) {
    $config | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value @{} -Force
}

# Prompt for Netlify credentials
Write-Host "🔑 Netlify API Configuration" -ForegroundColor Cyan
Write-Host ""
Write-Host "Get your credentials from:" -ForegroundColor Gray
Write-Host "  • API Token: https://app.netlify.com/user/applications" -ForegroundColor Gray
Write-Host "  • Site ID: Site Settings → General → Site information" -ForegroundColor Gray
Write-Host ""

$netlifyToken = Read-Host "Enter your Netlify API Token"
$netlifySiteId = Read-Host "Enter your Netlify Site ID"

Write-Host ""

if ([string]::IsNullOrWhiteSpace($netlifyToken) -or [string]::IsNullOrWhiteSpace($netlifySiteId)) {
    Write-Host "❌ Error: Both API Token and Site ID are required" -ForegroundColor Red
    exit 1
}

# Convert path to proper JSON format (escaped backslashes)
$indexPathEscaped = $indexPath -replace '\\', '\\'

# Add Netlify MCP server configuration
$netlifyConfig = @{
    command = "node"
    args = @($indexPathEscaped)
    env = @{
        NETLIFY_API_TOKEN = $netlifyToken
        NETLIFY_SITE_ID = $netlifySiteId
    }
}

# Add or update the netlify server
$config.mcpServers | Add-Member -MemberType NoteProperty -Name "netlify" -Value $netlifyConfig -Force

# Save configuration
Write-Host "💾 Saving configuration..." -ForegroundColor Yellow
$config | ConvertTo-Json -Depth 10 | Set-Content $configFile -Encoding UTF8
Write-Host "✅ Configuration saved" -ForegroundColor Green
Write-Host ""

# Display final config
Write-Host "📋 Updated Configuration:" -ForegroundColor Cyan
Write-Host (Get-Content $configFile -Raw) -ForegroundColor Gray
Write-Host ""

# Success message
Write-Host "🎉 Success! Netlify MCP Server configured!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Close Claude Desktop completely" -ForegroundColor White
Write-Host "  2. Wait 5 seconds" -ForegroundColor White
Write-Host "  3. Restart Claude Desktop" -ForegroundColor White
Write-Host "  4. Test with: 'List all Netlify environment variables'" -ForegroundColor White
Write-Host ""
Write-Host "Configuration file: $configFile" -ForegroundColor Gray
Write-Host ""
