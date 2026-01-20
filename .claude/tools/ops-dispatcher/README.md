# ANX Ops Dispatcher

## Quick Start: The `oc` Command

The `oc` (One-Command) front door lets you dispatch work to the ANX agent org with a single sentence.

### Usage

```cmd
oc "Your task description here"
```

Or with a specific entity:

```cmd
oc "Your task description" DC
```

### Examples

```cmd
oc "Add dark mode toggle to settings page"
oc "Fix authentication timeout on mobile" DC
oc "Update payment integration" SN
```

### What It Does

1. Creates a new ticket via `ops.ps1 new`
2. Runs the full pipeline through all agent stages (OCS, PM, Eng, DB, Release, QAG)
3. Prints the results:
   - TicketId
   - Decision Brief path
   - Proof Pack path
4. Exits with code 0 on success, non-zero on failure

### Entities

| Entity | Description |
|--------|-------------|
| DC     | Direct Cuts (default) |
| SN     | Snippets |
| DSLV   | DSLV |

### Installation (Optional)

To run `oc` from any directory, add the dispatcher folder to your PATH:

```powershell
$env:PATH += ";C:\Dev\.claude-anx\tools\ops-dispatcher"
```

Or add permanently via System Properties > Environment Variables.

### Files

- `oc.cmd` - Windows batch wrapper (run from cmd or any terminal)
- `oc.ps1` - PowerShell implementation
- `ops.ps1` - Core dispatcher with `new`, `run`, and `stage` commands

### Exit Codes

| Code | Meaning |
|------|---------|
| 0    | Success |
| 1    | Failed to parse TicketId |
| 2    | Pipeline execution error |
| 3    | Missing required output files |

### Non-Interactive Mode

All commands run with `--dangerously-skip-permissions` - no prompts, no questions.
