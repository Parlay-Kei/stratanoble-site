# Proof Validator V1

## Purpose

Automated validation of "Proof Packs" emitted by Agent interactions.

## Proof Pack Structure

Every autonomous run MUST produce a directory:
`C:\Dev\.claude-anx\runs\{ticket_id}\{run_id}\`

Containing:

1. `receipt.json`: Machine-readable metadata (Tool, Inputs, Outputs, Status).
2. `receipt.md`: Human-readable summary.
3. `logs\`: stdout/stderr logs (optional for V1).
4. `artifacts\`: Created files or screenshots.

## Validation Rules (Pass/Fail)

### Rule 1: Receipt Existence

**FAIL** if `receipt.json` is missing. **FAIL** if `receipt.md` is missing.

### Rule 2: Status Check

**FAIL** if `receipt.json` status is "FAILED" (unless handling is expected).

### Rule 3: Artifact Integrity

If `receipt.json` lists created artifacts, they must exist in the `artifacts\`
folder or their listed path.

## Logic

The validator script `validate_proof.py` is called with a `run_id`. It returns
exit code 0 for PASS, 1 for FAIL. Output written to `validation_report.md`.
