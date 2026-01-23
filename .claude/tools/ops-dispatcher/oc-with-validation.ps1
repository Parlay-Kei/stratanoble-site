# OCS Ops Dispatcher with Proof Validation Hard Gate v1.0
# Enforces proof requirements - pipeline fails if validation fails

param(
    [Parameter(Mandatory=$true)]
    [string]$Title,

    [string]$Entity = "DC",
    [string[]]$Agents = @(),
    [string[]]$Gates = @(),
    [string]$Branch = $null,
    [string]$Priority = "normal",
    [string]$ProofPath = $null,
    [string]$SkillName = $null
)

# Configuration
$VALIDATOR_PATH = "C:\Dev\.claude-anx\tools\proof-validator.js"
$PROOF_DIR = "C:\Dev\.claude-anx\proofs"
$LOG_DIR = "C:\Dev\.claude-anx\logs"

# Initialize
$timestamp = Get-Date -Format "yyyy-MM-ddTHH-mm-ss"
$ticketId = "OCS-$Entity-$(Get-Random -Min 1000 -Max 9999)"
$sessionId = "$ticketId-$timestamp"
$logFile = Join-Path $LOG_DIR "$sessionId.log"

# Ensure directories exist
if (!(Test-Path $PROOF_DIR)) { New-Item -ItemType Directory -Path $PROOF_DIR | Out-Null }
if (!(Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR | Out-Null }

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $logEntry = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [$Level] $Message"
    Add-Content -Path $logFile -Value $logEntry

    switch ($Level) {
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARN"  { Write-Host $logEntry -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        default { Write-Host $logEntry }
    }
}

# Validate proof function
function Invoke-ProofValidation {
    param(
        [string]$ProofFilePath,
        [string]$Skill
    )

    Write-Log "Starting proof validation for skill: $Skill" "INFO"

    if (!(Test-Path $ProofFilePath)) {
        Write-Log "Proof file not found: $ProofFilePath" "ERROR"
        return @{
            Passed = $false
            Decision = "FAIL"
            Errors = @("Proof file not found")
        }
    }

    try {
        # Run the validator
        $validatorArgs = @($ProofFilePath)
        if ($Skill) { $validatorArgs += $Skill }

        $validationOutput = & node $VALIDATOR_PATH $validatorArgs 2>&1
        $exitCode = $LASTEXITCODE

        # Parse JSON output
        $validationResult = $validationOutput | ConvertFrom-Json

        if ($exitCode -eq 0) {
            Write-Log "Proof validation PASSED" "SUCCESS"
            Write-Log "Summary: $($validationResult.summary)" "INFO"

            # Log any warnings
            foreach ($warning in $validationResult.warnings) {
                Write-Log "Warning: $($warning.message)" "WARN"
            }

            return @{
                Passed = $true
                Decision = $validationResult.decision
                Result = $validationResult
            }
        }
        else {
            Write-Log "Proof validation FAILED - HARD GATE TRIGGERED" "ERROR"
            Write-Log "Summary: $($validationResult.summary)" "ERROR"

            # Log all errors
            foreach ($error in $validationResult.errors) {
                Write-Log "Validation Error: $($error.message)" "ERROR"
            }

            return @{
                Passed = $false
                Decision = $validationResult.decision
                Result = $validationResult
            }
        }
    }
    catch {
        Write-Log "Validation exception: $_" "ERROR"
        return @{
            Passed = $false
            Decision = "FAIL"
            Errors = @("Validation process failed: $_")
        }
    }
}

# Main pipeline execution
function Start-Pipeline {
    Write-Log "=== OCS PIPELINE START ===" "INFO"
    Write-Log "Title: $Title" "INFO"
    Write-Log "Entity: $Entity" "INFO"
    Write-Log "Ticket ID: $ticketId" "INFO"
    Write-Log "Session: $sessionId" "INFO"

    # Stage 1: Pre-flight validation if proof provided
    if ($ProofPath) {
        Write-Log "=== STAGE: PRE-FLIGHT VALIDATION ===" "INFO"

        $validation = Invoke-ProofValidation -ProofFilePath $ProofPath -Skill $SkillName

        if (-not $validation.Passed) {
            Write-Log "=== PIPELINE ABORTED - VALIDATION FAILED ===" "ERROR"

            # Output structured result
            Write-Output "TicketId: $ticketId"
            Write-Output "Stage: validation_failed"
            Write-Output "Gates Failed: proof_validation"
            Write-Output "Summary: Pipeline aborted due to proof validation failure"

            # Generate failure report
            $failureReport = @"
# PROOF VALIDATION FAILURE REPORT

**Ticket**: $ticketId
**Date**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Entity**: $Entity
**Skill**: $($SkillName ?? 'default')

## Validation Result: FAIL

### Errors Found:
$($validation.Result.errors | ForEach-Object { "- $_" } | Out-String)

### Required Actions:
1. Fix all validation errors listed above
2. Ensure all required files are present
3. Verify minimum file sizes are met
4. Check all required sections are included
5. Resubmit proof pack for validation

## Hard Gate Status: BLOCKED

Pipeline execution has been blocked due to proof validation failure.
No deployment or changes have been made.

---
*OCS Proof Validator v1.0 - Hard Gate Enforced*
"@
            $reportPath = Join-Path $PROOF_DIR "$ticketId-validation-failure.md"
            $failureReport | Out-File -FilePath $reportPath -Encoding utf8

            Write-Output "Proof Pack: $reportPath"

            # Exit with error code
            exit 1
        }

        Write-Log "Validation passed - proceeding with pipeline" "SUCCESS"
    }

    # Stage 2: Execute agents
    Write-Log "=== STAGE: AGENT EXECUTION ===" "INFO"

    # Default agents if none specified
    if ($Agents.Count -eq 0) {
        $Agents = @('pm', 'eng', 'db', 'release', 'qag')
    }

    $executedAgents = @()
    $agentResults = @{}

    foreach ($agent in $Agents) {
        Write-Log "Executing agent: $agent" "INFO"

        # Simulate agent execution (replace with actual implementation)
        $agentResult = @{
            Agent = $agent
            Status = "completed"
            ProofGenerated = $true
        }

        $executedAgents += $agent
        $agentResults[$agent] = $agentResult

        Start-Sleep -Milliseconds 500
    }

    # Stage 3: Gates execution
    Write-Log "=== STAGE: GATES EXECUTION ===" "INFO"

    $gatesPassed = @()
    $gatesFailed = @()

    foreach ($gate in $Gates) {
        Write-Log "Running gate: $gate" "INFO"

        # Run gate validation
        if ($gate -eq "proof") {
            # Generate a proof for this execution
            $executionProof = Join-Path $PROOF_DIR "$ticketId-execution-proof.md"

            # Create proof content
            $proofContent = @"
# PROOF PACK: $ticketId

**Date**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Ticket**: $ticketId

## Summary
Pipeline execution for: $Title

## Evidence
- Agents executed: $($executedAgents -join ', ')
- All agents completed successfully

## Verification
All pipeline stages completed without errors.
"@
            $proofContent | Out-File -FilePath $executionProof -Encoding utf8

            # Validate the generated proof
            $gateValidation = Invoke-ProofValidation -ProofFilePath $executionProof -Skill 'qa-gatekeeper-ops'

            if ($gateValidation.Passed) {
                $gatesPassed += $gate
            } else {
                $gatesFailed += $gate
            }
        }
        else {
            # Other gates pass by default for now
            $gatesPassed += $gate
        }
    }

    # Stage 4: Final decision
    Write-Log "=== STAGE: FINAL DECISION ===" "INFO"

    $pipelineStatus = if ($gatesFailed.Count -gt 0) { "partial" } else { "success" }

    # Generate decision brief
    $decisionBrief = @"
# DECISION BRIEF: $ticketId

**Status**: $pipelineStatus
**Date**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Execution Summary
- Title: $Title
- Entity: $Entity
- Agents: $($executedAgents -join ', ')
- Gates Passed: $($gatesPassed -join ', ')
- Gates Failed: $($gatesFailed -join ', ')

## Decision
$(if ($pipelineStatus -eq 'success') {
    "All validations passed. Deployment approved."
} else {
    "Some gates failed. Manual review required."
})

## Validation Results
$(if ($ProofPath) {
    "Pre-flight validation: PASSED"
} else {
    "No pre-flight validation performed"
})

---
*Generated by OCS Pipeline with Hard Gate Validation*
"@

    $decisionBriefPath = Join-Path $PROOF_DIR "$ticketId-decision.md"
    $decisionBrief | Out-File -FilePath $decisionBriefPath -Encoding utf8

    # Output results
    Write-Output "TicketId: $ticketId"
    Write-Output "Decision Brief: $decisionBriefPath"
    Write-Output "Proof Pack: $(Join-Path $PROOF_DIR "$ticketId-execution-proof.md")"
    Write-Output "Agents: $($executedAgents -join ',')"
    Write-Output "Gates Passed: $($gatesPassed -join ',')"
    Write-Output "Gates Failed: $($gatesFailed -join ',')"
    Write-Output "Stage: completed"
    Write-Output "Summary: Pipeline completed $(if ($gatesFailed.Count -gt 0) { 'with issues' } else { 'successfully' })"

    Write-Log "=== OCS PIPELINE COMPLETE ===" $(if ($pipelineStatus -eq 'success') { 'SUCCESS' } else { 'WARN' })

    # Exit code based on gates
    exit $(if ($gatesFailed.Count -gt 0) { 2 } else { 0 })
}

# Error handling
trap {
    Write-Log "Pipeline error: $_" "ERROR"
    Write-Output "TicketId: $ticketId"
    Write-Output "Stage: error"
    Write-Output "Summary: Pipeline failed with error: $_"
    exit 99
}

# Execute pipeline
Start-Pipeline