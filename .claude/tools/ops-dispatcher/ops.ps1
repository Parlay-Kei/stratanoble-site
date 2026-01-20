# ops.ps1
# ANX Ops Dispatcher (Level 2)
# Requires: Claude Code CLI installed as `claude`
# Claude outputs content to stdout; dispatcher writes files

param(
  [Parameter(Position=0)][ValidateSet("new","run","stage")] [string]$Cmd,
  [string]$Entity = "DC",
  [string]$Title,
  [string]$TicketId,
  [string]$DoDPath = "C:\Dev\.claude-anx\docs\ops\06-RUNBOOKS\release\direct-cuts_public-preview_dod_v1.md",
  [string]$RepoPath = "C:\Dev\Direct-Cuts",
  [string]$Stages = "ocs,pm,eng,db,release,qag"
)

$OpsRoot = "C:\Dev\.claude-anx\docs\ops"
$TicketsRoot = Join-Path $OpsRoot "03-TICKETS"
$ProofsRoot  = Join-Path $OpsRoot "04-PROOFS"
$QueueFile   = Join-Path $OpsRoot "02-QUEUE\active\ops_queue.md"

$AgentsDir   = "C:\Dev\.claude-anx\agents"

function New-SessionId {
  return [guid]::NewGuid().ToString()
}

function Get-NextTicketNumber {
  $regPath = Join-Path $OpsRoot "01-REGISTRY\ticket-seq.json"
  if (!(Test-Path $regPath)) {
    New-Item -ItemType Directory -Force -Path (Split-Path $regPath) | Out-Null
    Set-Content -Path $regPath -Value '{ "DC": 0, "SN": 0, "DSLV": 0 }' -Encoding UTF8
  }
  $reg = Get-Content $regPath -Raw | ConvertFrom-Json
  $reg.$Entity = [int]$reg.$Entity + 1
  $num = "{0:D4}" -f $reg.$Entity
  ($reg | ConvertTo-Json) | Set-Content -Path $regPath -Encoding UTF8
  return $num
}

function Ticket-Paths([string]$tid) {
  $yyyy = (Get-Date).ToString("yyyy")
  $yyyyMM = (Get-Date).ToString("yyyy-MM")
  $folder = Join-Path $TicketsRoot "$yyyy\$yyyyMM\$tid"
  $ticketFile = Join-Path $folder "ticket.md"
  $handoffDir = Join-Path $folder "handoff_prompts"
  $outputsDir = Join-Path $folder "outputs"
  $inputsDir  = Join-Path $folder "inputs"
  return @{
    Folder=$folder; TicketFile=$ticketFile; HandoffDir=$handoffDir; OutputsDir=$outputsDir; InputsDir=$inputsDir
  }
}

function Proof-Pack-Path([string]$tid) {
  $yyyy = (Get-Date).ToString("yyyy")
  $yyyyMM = (Get-Date).ToString("yyyy-MM")
  $folder = Join-Path $ProofsRoot "$yyyy\$yyyyMM"
  New-Item -ItemType Directory -Force -Path $folder | Out-Null
  return (Join-Path $folder "${tid}_proof_pack.md")
}

function Get-StageOutputs([string]$stage, [hashtable]$p, [string]$tid) {
  $outputsDir = $p.OutputsDir
  $handoffDir = $p.HandoffDir

  switch ($stage) {
    "ocs" {
      return @{
        "ticket" = $p.TicketFile
        "queue" = $QueueFile
        "pm_handoff" = Join-Path $handoffDir "pm.txt"
        "eng_handoff" = Join-Path $handoffDir "eng.txt"
        "db_handoff" = Join-Path $handoffDir "db.txt"
        "release_handoff" = Join-Path $handoffDir "release.txt"
        "qag_handoff" = Join-Path $handoffDir "qag.txt"
      }
    }
    "pm" {
      return @{
        "pm_readiness_scope" = Join-Path $outputsDir "pm_readiness_scope.md"
      }
    }
    "eng" {
      return @{
        "eng_readiness_audit" = Join-Path $outputsDir "eng_readiness_audit.md"
      }
    }
    "db" {
      return @{
        "db_env_rls_receipts" = Join-Path $outputsDir "db_env_rls_receipts.md"
      }
    }
    "release" {
      return @{
        "release_preview_plan" = Join-Path $outputsDir "release_preview_plan.md"
      }
    }
    "qag" {
      return @{
        "proof_pack" = Proof-Pack-Path $tid
        "decision_brief" = Join-Path $outputsDir "decision_brief.md"
      }
    }
    default { return @{} }
  }
}

function Create-StubFiles([hashtable]$outputs) {
  foreach ($key in $outputs.Keys) {
    $path = $outputs[$key]
    $dir = Split-Path $path -Parent
    if (!(Test-Path $dir)) {
      New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    # Create empty stub if file doesn't exist
    if (!(Test-Path $path)) {
      Set-Content -Path $path -Value "" -Encoding UTF8
    }
  }
}

function Invoke-ClaudeCapture([string]$prompt) {
  $guard = @"
Hard rule: Do NOT use any file writing tools. Output content ONLY to stdout.
Hard rule: The dispatcher will capture your stdout and write files for you.
Hard rule: Follow the exact output format specified in the prompt.
"@

  $args = @(
    "-p",
    "--add-dir", "C:\Dev\.claude-anx",
    "--add-dir", $RepoPath,
    "--append-system-prompt", $guard,
    $prompt
  )

  Write-Host ""
  Write-Host "claude $($args -join ' ')" -ForegroundColor DarkGray

  # Capture stdout
  $output = & claude --dangerously-skip-permissions @args 2>&1
  return $output
}

function Stage-Prompt([string]$stage, [hashtable]$p, [string]$tid, [hashtable]$outputs) {
  $ticketFile = $p.TicketFile

  $roleFile = switch ($stage) {
    "ocs"     { Join-Path $AgentsDir "orchestrator-chief-of-staff.md" }
    "pm"      { Join-Path $AgentsDir "product-manager.md" }
    "eng"     { Join-Path $AgentsDir "eng-delivery-lead.md" }
    "db"      { Join-Path $AgentsDir "supabase-admin.md" }
    "release" { Join-Path $AgentsDir "release-manager.md" }
    "qag"     { Join-Path $AgentsDir "qa-gatekeeper.md" }
    default   { throw "Unknown stage: $stage" }
  }

  # Build output instructions
  $outputKeys = $outputs.Keys | Sort-Object
  $outputInstructions = @()
  foreach ($key in $outputKeys) {
    $outputInstructions += "### FILE: $key"
    $outputInstructions += "Path: $($outputs[$key])"
  }
  $outputSection = $outputInstructions -join "`n"

  $prompt = @"
You are executing stage: $stage for ticket $tid.

CRITICAL: Do NOT write any files. Output ALL content to stdout using the exact format below.

1) Read and follow this role charter file: $roleFile
2) Read the ticket: $ticketFile
3) Read the DoD acceptance criteria: $DoDPath
4) Read repo context as needed under: $RepoPath

OUTPUT FORMAT:
For each required file, output in this exact format:

===BEGIN_FILE:key_name===
(file content here)
===END_FILE:key_name===

Required output files:
$outputSection

Output each file's content between the BEGIN/END markers using the key name (not the path).
After all files, print exactly: DONE: $stage
"@
  return $prompt
}

function Parse-ClaudeOutput([string]$output, [hashtable]$outputs) {
  $results = @{}

  foreach ($key in $outputs.Keys) {
    $pattern = "===BEGIN_FILE:${key}===(.+?)===END_FILE:${key}==="
    $match = [regex]::Match($output, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if ($match.Success) {
      $content = $match.Groups[1].Value.Trim()
      $results[$key] = $content
    }
  }

  return $results
}

function Write-OutputFiles([hashtable]$parsedContent, [hashtable]$outputs) {
  $written = @()
  $failed = @()

  foreach ($key in $parsedContent.Keys) {
    if ($outputs.ContainsKey($key)) {
      $path = $outputs[$key]
      $content = $parsedContent[$key]

      try {
        # For queue file, append instead of overwrite
        if ($key -eq "queue") {
          Add-Content -Path $path -Value $content -Encoding UTF8
        } else {
          Set-Content -Path $path -Value $content -Encoding UTF8
        }
        $written += $path
        Write-Host "  Written: $path" -ForegroundColor Green
      } catch {
        $failed += $path
        Write-Host "  FAILED: $path - $_" -ForegroundColor Red
      }
    }
  }

  return @{ Written = $written; Failed = $failed }
}

function Assert-FilesExist([string[]]$paths) {
  $missing = @()
  foreach ($f in $paths) {
    if (!(Test-Path $f)) {
      $missing += $f
    } else {
      # Check if file has content (not just stub)
      $content = Get-Content $f -Raw -ErrorAction SilentlyContinue
      if ([string]::IsNullOrWhiteSpace($content)) {
        $missing += "$f (empty)"
      }
    }
  }
  if ($missing.Count -gt 0) {
    Write-Host "FAIL: Missing or empty required files:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    exit 2
  }
}

if ($Cmd -eq "new") {
  if (!$Title) { throw "Provide -Title for new ticket." }
  $num = Get-NextTicketNumber
  $tid = "OCS-$Entity-$num"
  $sid = New-SessionId
  $p = Ticket-Paths $tid

  New-Item -ItemType Directory -Force -Path $p.Folder     | Out-Null
  New-Item -ItemType Directory -Force -Path $p.HandoffDir | Out-Null
  New-Item -ItemType Directory -Force -Path $p.OutputsDir | Out-Null
  New-Item -ItemType Directory -Force -Path $p.InputsDir  | Out-Null

  $ticketStub = @"
# $tid - $Title

## Metadata
- Entity: $Entity
- SessionId: $sid
- Repo: $RepoPath
- DoD: $DoDPath

## Acceptance Criteria Source
- $DoDPath

## Status
- Stage: intake
- Owner: OCS (orchestrator-chief-of-staff)

## Notes
- Dispatcher created this ticket stub. OCS stage must populate full spec and handoffs.
"@
  Set-Content -Path $p.TicketFile -Value $ticketStub -Encoding UTF8

  if (!(Test-Path $QueueFile)) {
    New-Item -ItemType Directory -Force -Path (Split-Path $QueueFile) | Out-Null
    Set-Content -Path $QueueFile -Value "# Ops Queue (Active)`n" -Encoding UTF8
  }
  Add-Content -Path $QueueFile -Value ("- [$tid] $Title") -Encoding UTF8

  Write-Host "Created ticket: $tid"
  Write-Host "SessionId: $sid"
  Write-Host "Ticket file: $($p.TicketFile)"
  exit 0
}

if ($Cmd -eq "run") {
  if (!$TicketId) { throw "Provide -TicketId for run." }
  $p = Ticket-Paths $TicketId
  if (!(Test-Path $p.TicketFile)) { throw "Ticket not found: $($p.TicketFile)" }

  # SessionId is stored in ticket.md metadata
  $raw = Get-Content $p.TicketFile -Raw
  $m = [regex]::Match($raw, "SessionId:\s*([0-9a-fA-F-]{36})")
  if (!$m.Success) { throw "SessionId not found in ticket.md" }
  $sid = $m.Groups[1].Value

  $stageList = $Stages -split ',' | ForEach-Object { $_.Trim().ToLower() }

  foreach ($s in $stageList) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "STAGE: $s" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    # Get outputs for this stage
    $outputs = Get-StageOutputs $s $p $TicketId

    # Create stub files
    Write-Host "Creating stub files..." -ForegroundColor Yellow
    Create-StubFiles $outputs

    # Generate prompt and invoke Claude
    $prompt = Stage-Prompt $s $p $TicketId $outputs
    Write-Host "Invoking Claude..." -ForegroundColor Yellow
    $claudeOutput = Invoke-ClaudeCapture $prompt

    # Show raw output for debugging
    Write-Host ""
    Write-Host "--- Claude Output ---" -ForegroundColor DarkGray
    Write-Host $claudeOutput
    Write-Host "--- End Output ---" -ForegroundColor DarkGray
    Write-Host ""

    # Parse output
    Write-Host "Parsing output..." -ForegroundColor Yellow
    $parsed = Parse-ClaudeOutput ($claudeOutput -join "`n") $outputs

    if ($parsed.Count -eq 0) {
      Write-Host "WARNING: No files parsed from Claude output" -ForegroundColor Yellow
    } else {
      Write-Host "Parsed $($parsed.Count) file(s)" -ForegroundColor Green
    }

    # Write files
    Write-Host "Writing files..." -ForegroundColor Yellow
    $writeResult = Write-OutputFiles $parsed $outputs

    # Verify files exist and have content
    $requiredPaths = $outputs.Values | ForEach-Object { $_ }
    Assert-FilesExist $requiredPaths

    Write-Host "PASS: stage $s produced required files." -ForegroundColor Green
  }

  Write-Host ""
  Write-Host "DONE: ticket $TicketId pipeline complete." -ForegroundColor Cyan
  exit 0
}
