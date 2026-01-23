# Google Drive MCP Server - Quick Setup Script
# This script sets up Google Cloud credentials for the MCP server
# Run in PowerShell: .\setup-gcloud.ps1

$ErrorActionPreference = "Stop"
$ServerDir = "C:\Dev\.claude-anx\mcp-servers\google-drive-server"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Google Drive MCP Server - Credentials Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check for gcloud
$gcloudPath = Get-Command gcloud -ErrorAction SilentlyContinue
if (-not $gcloudPath) {
    Write-Host "ERROR: gcloud CLI not found. Please install Google Cloud SDK." -ForegroundColor Red
    Write-Host "Download: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found gcloud CLI: $($gcloudPath.Source)" -ForegroundColor Green
Write-Host ""

# Step 1: Authenticate with Google
Write-Host "Step 1: Google Account Authentication" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Yellow
$authStatus = gcloud auth list --filter="status:ACTIVE" --format="value(account)" 2>&1

if ($authStatus -and $authStatus -notmatch "ERROR") {
    Write-Host "Already authenticated as: $authStatus" -ForegroundColor Green
    $reauth = Read-Host "Re-authenticate? (y/N)"
    if ($reauth -eq "y" -or $reauth -eq "Y") {
        Write-Host "Opening browser for authentication..."
        gcloud auth login
    }
} else {
    Write-Host "Opening browser for authentication..."
    gcloud auth login
}

# Step 2: Set up project
Write-Host ""
Write-Host "Step 2: Google Cloud Project Setup" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

$projects = gcloud projects list --format="value(projectId)" 2>&1
$projectList = $projects -split "`n" | Where-Object { $_ -and $_ -notmatch "ERROR" }

if ($projectList.Count -gt 0) {
    Write-Host "Existing projects:"
    $i = 1
    foreach ($proj in $projectList) {
        Write-Host "  $i. $proj"
        $i++
    }
    Write-Host "  N. Create new project"
    Write-Host ""

    $choice = Read-Host "Select a project (number or N)"

    if ($choice -eq "N" -or $choice -eq "n") {
        $projectId = "claude-anx-gdrive-" + (Get-Random -Maximum 9999)
        Write-Host "Creating project: $projectId"
        gcloud projects create $projectId --name="Claude ANX Google Drive"
        gcloud config set project $projectId
    } else {
        $index = [int]$choice - 1
        if ($index -ge 0 -and $index -lt $projectList.Count) {
            $projectId = $projectList[$index]
            gcloud config set project $projectId
            Write-Host "Selected project: $projectId" -ForegroundColor Green
        } else {
            Write-Host "Invalid selection" -ForegroundColor Red
            exit 1
        }
    }
} else {
    $projectId = "claude-anx-gdrive-" + (Get-Random -Maximum 9999)
    Write-Host "No existing projects. Creating: $projectId"
    gcloud projects create $projectId --name="Claude ANX Google Drive"
    gcloud config set project $projectId
}

Write-Host ""
Write-Host "Current project: $(gcloud config get-value project)" -ForegroundColor Green

# Step 3: Enable Drive API
Write-Host ""
Write-Host "Step 3: Enable Google Drive API" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow
Write-Host "Enabling Google Drive API..."
gcloud services enable drive.googleapis.com 2>&1
Write-Host "Google Drive API enabled" -ForegroundColor Green

# Step 4: Create OAuth credentials or Service Account
Write-Host ""
Write-Host "Step 4: Create Credentials" -ForegroundColor Yellow
Write-Host "--------------------------" -ForegroundColor Yellow
Write-Host "Choose credential type:"
Write-Host "  1. OAuth2 (for personal/user access)"
Write-Host "  2. Service Account (for automation/shared access)"
Write-Host ""
$credType = Read-Host "Enter choice (1 or 2)"

if ($credType -eq "2") {
    # Service Account
    Write-Host "Creating service account..."
    $saName = "anx-drive-mcp"
    $saEmail = "$saName@$(gcloud config get-value project).iam.gserviceaccount.com"

    # Check if SA already exists
    $existingSA = gcloud iam service-accounts list --filter="email:$saEmail" --format="value(email)" 2>&1

    if ($existingSA -match $saName) {
        Write-Host "Service account already exists: $saEmail"
    } else {
        gcloud iam service-accounts create $saName --display-name="ANX Drive MCP Server"
        Write-Host "Created service account: $saEmail" -ForegroundColor Green
    }

    # Create key
    $keyPath = Join-Path $ServerDir "service-account.json"
    Write-Host "Creating service account key..."
    gcloud iam service-accounts keys create $keyPath --iam-account=$saEmail
    Write-Host "Service account key saved to: $keyPath" -ForegroundColor Green

    Write-Host ""
    Write-Host "IMPORTANT: Share your Google Drive folders with:" -ForegroundColor Yellow
    Write-Host "  $saEmail" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Service accounts can only access files explicitly shared with them."

} else {
    # OAuth2
    Write-Host ""
    Write-Host "For OAuth2, you need to create credentials in the Google Cloud Console:"
    Write-Host ""
    Write-Host "1. Go to: https://console.cloud.google.com/apis/credentials" -ForegroundColor Cyan
    Write-Host "2. Click 'Create Credentials' > 'OAuth client ID'"
    Write-Host "3. If needed, configure the OAuth consent screen first"
    Write-Host "4. Select 'Desktop app' as application type"
    Write-Host "5. Download the JSON file"
    Write-Host "6. Save it as: $ServerDir\credentials.json"
    Write-Host ""

    $ready = Read-Host "Press Enter when you've saved credentials.json (or 'skip' to do later)"

    if ($ready -ne "skip") {
        $credPath = Join-Path $ServerDir "credentials.json"
        if (Test-Path $credPath) {
            Write-Host "Found credentials.json" -ForegroundColor Green
            Write-Host "Running OAuth flow..."
            Set-Location $ServerDir
            node setup-credentials.js
        } else {
            Write-Host "credentials.json not found at: $credPath" -ForegroundColor Red
            Write-Host "Please download it from Google Cloud Console and run:"
            Write-Host "  cd $ServerDir && node setup-credentials.js"
        }
    }
}

# Done
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Restart Claude Desktop to load the MCP server"
Write-Host "  2. Test with: gdrive_status tool"
Write-Host ""
Write-Host "If using OAuth2, run: node $ServerDir\setup-credentials.js"
Write-Host ""
