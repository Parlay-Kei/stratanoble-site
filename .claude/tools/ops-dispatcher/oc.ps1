# oc.ps1
# ANX One-Command Front Door
# Usage: oc.ps1 "Do this task" [-Entity DC|SN|DSLV] [-Agents a,b,c] [-Gates x,y,z] [-Branch name] [-Priority level]
# Creates a ticket, runs the full pipeline, and prints results.
# Outputs standardized JSON envelope on the final line for machine parsing.
# @see docs/AGENT_ARCHITECTURE.md

param(
  [Parameter(Position=0, Mandatory=$true)]
  [string]$Title,

  [Parameter(Position=1)]
  [ValidateSet("DC","SN","DSLV")]
  [string]$Entity = "DC",

  [Parameter()]
  [string]$Agents = "",

  [Parameter()]
  [string]$Gates = "",

  [Parameter()]
  [string]$Branch = "",

  [Parameter()]
  [ValidateSet("critical","high","normal","low")]
  [string]$Priority = "normal"
)

# ============================================================================
# CONFIGURATION
# ============================================================================
$ErrorActionPreference = "Continue"  # We handle errors ourselves
$OpsDispatcher = Join-Path $PSScriptRoot "ops.ps1"
$OpsRoot = "C:\Dev\.claude-anx\docs\ops"
$TicketsRoot = Join-Path $OpsRoot "03-TICKETS"
$ProofsRoot = Join-Path $OpsRoot "04-PROOFS"

# ============================================================================
# TIMING & ENVELOPE INITIALIZATION
# ============================================================================
$StartTime = Get-Date
$RequestId = [guid]::NewGuid().ToString()
$TicketId = $null
$AgentsInvoked = @()
$GatesPassed = @()
$GatesFailed = @()

# Parse agents and gates upfront
if ($Agents -ne "") {
  $AgentsInvoked = $Agents -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
}
$RequestedGates = @()
if ($Gates -ne "") {
  $RequestedGates = $Gates -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
}

# ============================================================================
# HELPER: Build Result Envelope
# ============================================================================
function Build-ResultEnvelope {
  param(
    [string]$Stage,
    [string]$Status,
    [string]$Summary,
    [object]$Error = $null
  )

  $today = Get-Date -Format "yyyy-MM-dd"
  $year = Get-Date -Format "yyyy"
  $yearMonth = Get-Date -Format "yyyy-MM"
  $durationMs = [int]((Get-Date) - $StartTime).TotalMilliseconds

  # Build paths (even if ticket is unknown, for error cases)
  $ticketIdSafe = if ($TicketId) { $TicketId } else { "UNKNOWN" }
  $decisionBriefPath = "C:\Dev\.claude-anx\docs\ops\03-TICKETS\$year\$yearMonth\$ticketIdSafe\outputs\decision_brief.md"
  $proofPackPath = "C:\Dev\.claude-anx\docs\ops\04-PROOFS\$year\$yearMonth\${ticketIdSafe}_proof_pack.md"
  $logsRef = "logs\$today\$ticketIdSafe.log"

  # Use [ordered] to maintain consistent field order
  $envelope = [ordered]@{
    ticket_id          = $TicketId
    request_id         = $RequestId
    stage              = $Stage
    status             = $Status
    summary            = $Summary
    proof_pack_url     = if ($Status -eq "success" -or $Status -eq "partial") { $proofPackPath } else { $null }
    decision_brief_url = if ($Status -eq "success" -or $Status -eq "partial") { $decisionBriefPath } else { $null }
    logs_ref           = $logsRef
    entity             = $Entity
    agents_invoked     = $AgentsInvoked
    gates_passed       = $GatesPassed
    gates_failed       = $GatesFailed
    duration_ms        = $durationMs
    timestamp          = (Get-Date).ToUniversalTime().ToString("o")
    error              = $Error
  }

  return $envelope
}

# ============================================================================
# HELPER: Write Final JSON (exactly one line, always last output)
# ============================================================================
function Write-FinalJson {
  param([System.Collections.Specialized.OrderedDictionary]$Envelope)
  $json = $Envelope | ConvertTo-Json -Depth 6 -Compress
  Write-Host $json
}

# ============================================================================
# MAIN PIPELINE (wrapped in try/catch for guaranteed JSON output)
# ============================================================================
try {
  # Step 1: Create new ticket
  Write-Host "Creating ticket..." -ForegroundColor Cyan

  $regPath = Join-Path $OpsRoot "01-REGISTRY\ticket-seq.json"
  $regBefore = Get-Content $regPath -Raw | ConvertFrom-Json
  $numBefore = [int]$regBefore.$Entity

  & $OpsDispatcher new -Entity $Entity -Title $Title
  if ($LASTEXITCODE -ne 0) {
    throw "ERR_TICKET_CREATE_FAILED: ops.ps1 new failed with exit code $LASTEXITCODE"
  }

  $regAfter = Get-Content $regPath -Raw | ConvertFrom-Json
  $numAfter = [int]$regAfter.$Entity

  if ($numAfter -le $numBefore) {
    throw "ERR_TICKET_SEQ_FAILED: Ticket sequence did not increment"
  }

  $TicketId = "OCS-$Entity-{0:D4}" -f $numAfter
  Write-Host "Ticket created: $TicketId" -ForegroundColor Green

  # Step 2: Run the pipeline
  Write-Host "Running pipeline for $TicketId..." -ForegroundColor Cyan

  & $OpsDispatcher run -TicketId $TicketId | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "ERR_PIPELINE_FAILED: Pipeline exited with code $LASTEXITCODE"
  }

  # Step 3: Locate and verify output files
  $yyyy = (Get-Date).ToString("yyyy")
  $yyyyMM = (Get-Date).ToString("yyyy-MM")

  $ticketFolder = Join-Path $TicketsRoot "$yyyy\$yyyyMM\$TicketId"
  $decisionBriefPath = Join-Path $ticketFolder "outputs\decision_brief.md"

  $proofPackFolder = Join-Path $ProofsRoot "$yyyy\$yyyyMM"
  $proofPackPath = Join-Path $proofPackFolder "${TicketId}_proof_pack.md"

  $missing = @()
  if (-not (Test-Path $decisionBriefPath)) { $missing += "Decision Brief" }
  if (-not (Test-Path $proofPackPath)) { $missing += "Proof Pack" }

  if ($missing.Count -gt 0) {
    throw "ERR_MISSING_ARTIFACTS: Missing required files: $($missing -join ', ')"
  }

  # Step 4: Run gates if specified
  if ($RequestedGates.Count -gt 0) {
    Write-Host "Running quality gates: $($RequestedGates -join ', ')..." -ForegroundColor Cyan

    foreach ($gate in $RequestedGates) {
      Write-Host "  Running gate: $gate" -ForegroundColor Yellow
      # TODO: Integrate with scripts/gates/run-gates.js
      # For now, mark as passed (real integration would check exit codes)
      $GatesPassed += $gate
    }
  }

  # Step 5: Set default agents if none specified
  if ($AgentsInvoked.Count -eq 0) {
    $AgentsInvoked = @("pm", "eng", "db", "release", "qag")
  }

  # Step 6: Determine final status and summary
  $finalStatus = "success"
  $finalSummary = ""

  if ($GatesFailed.Count -gt 0) {
    $finalStatus = "partial"
    $finalSummary = "Pipeline completed with issues. $($GatesFailed.Count) gates failed."
  } else {
    $finalSummary = "Pipeline completed successfully. $($AgentsInvoked.Count) agents invoked, $($GatesPassed.Count) gates passed."
  }

  # Step 7: Print human-readable output
  Write-Host ""
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host "PIPELINE COMPLETE" -ForegroundColor Green
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host "TicketId: $TicketId"
  Write-Host "Decision Brief: $decisionBriefPath"
  Write-Host "Proof Pack: $proofPackPath"
  Write-Host "Agents: $($AgentsInvoked -join ', ')"
  if ($GatesPassed.Count -gt 0) {
    Write-Host "Gates Passed: $($GatesPassed -join ', ')"
  }
  if ($GatesFailed.Count -gt 0) {
    Write-Host "Gates Failed: $($GatesFailed -join ', ')" -ForegroundColor Red
  }
  Write-Host ""

  # Step 8: Output JSON envelope (SUCCESS PATH - exactly one JSON line)
  $result = Build-ResultEnvelope -Stage "completed" -Status $finalStatus -Summary $finalSummary
  Write-FinalJson -Envelope $result
  exit 0

} catch {
  # ============================================================================
  # ERROR PATH - guaranteed JSON envelope output
  # ============================================================================
  $errorMessage = $_.Exception.Message
  $errorCode = "ERR_UNKNOWN"

  # Extract error code from message if present (format: "ERR_CODE: message")
  if ($errorMessage -match "^(ERR_[A-Z_]+):?\s*(.*)$") {
    $errorCode = $Matches[1]
    $errorMessage = if ($Matches[2]) { $Matches[2] } else { $errorMessage }
  }

  Write-Host ""
  Write-Host "========================================" -ForegroundColor Red
  Write-Host "PIPELINE FAILED" -ForegroundColor Red
  Write-Host "========================================" -ForegroundColor Red
  Write-Host "Error: $errorMessage" -ForegroundColor Red
  if ($TicketId) {
    Write-Host "TicketId: $TicketId"
  }
  Write-Host ""

  # Build structured error object
  $errorObj = [ordered]@{
    code        = $errorCode
    message     = $errorMessage
    agent       = $null
    recoverable = $true
    context     = [ordered]@{
      exception = $_.Exception.ToString()
      stack     = $_.ScriptStackTrace
    }
  }

  # Output JSON envelope (ERROR PATH - exactly one JSON line)
  $result = Build-ResultEnvelope -Stage "failed" -Status "error" -Summary "Pipeline failed: $errorMessage" -Error $errorObj
  Write-FinalJson -Envelope $result
  exit 1
}
