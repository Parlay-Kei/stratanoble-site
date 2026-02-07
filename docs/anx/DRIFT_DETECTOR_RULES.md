# Drift Detector Rules

**Document ID**: ANX-DRIFT-DETECT-001
**Version**: 1.1.0
**Effective**: 2026-02-06
**Updated**: 2026-02-06
**Authority**: OCS
**Purpose**: Automated detection of governance violations in project .claude/ directories

---

## Overview

The Drift Detector scans project repositories for forbidden files in `.claude/` directories. Any detection triggers a **BLOCKING** drift issue that must be resolved before mission execution.

---

## Detection Rules

### Rule 1: Forbidden Directory Detection

| Rule ID | Pattern | Severity | Description |
|---------|---------|----------|-------------|
| `DRIFT-001` | `{project}/.claude/agents/` | CRITICAL | Local agent directory forbidden |
| `DRIFT-002` | `{project}/.claude/policies/` | CRITICAL | Local policy directory forbidden |
| `DRIFT-003` | `{project}/.claude/gates/` | CRITICAL | Local gate directory forbidden |
| `DRIFT-004` | `{project}/.claude/prompts/` | CRITICAL | Local prompts directory forbidden (except context/) |
| `DRIFT-005` | `{project}/.claude/governance/` | CRITICAL | Local governance directory forbidden |
| `DRIFT-006` | `{project}/.claude/proofs/templates/` | HIGH | Local proof templates forbidden |

### Rule 2: Forbidden File Detection

| Rule ID | Pattern | Severity | Description |
|---------|---------|----------|-------------|
| `DRIFT-010` | `{project}/.claude/ROSTER.md` | CRITICAL | Local roster forbidden |
| `DRIFT-011` | `{project}/.claude/INTAKE.md` | CRITICAL | Local intake forbidden |
| `DRIFT-012` | `{project}/.claude/**/ROSTER.md` | CRITICAL | Nested roster forbidden |
| `DRIFT-013` | `{project}/.claude/**/INTAKE.md` | CRITICAL | Nested intake forbidden |
| `DRIFT-014` | `{project}/.claude/agents/*.md` | CRITICAL | Agent definition forbidden |
| `DRIFT-014a` | `{project}/.claude/agents/**/*.md` | CRITICAL | Nested agent definition forbidden |
| `DRIFT-015` | `{project}/.claude/**/*-agent.md` | HIGH | Agent file pattern forbidden |
| `DRIFT-016` | `{project}/.claude/**/*-policy.md` | HIGH | Policy file pattern forbidden |
| `DRIFT-017` | `{project}/.claude/**/*-gate.md` | HIGH | Gate file pattern forbidden |

**CRITICAL**: Any `.md` file in `{project}/.claude/agents/` or any subdirectory is treated as a forbidden agent definition UNLESS explicitly allowlisted as an overlay stub (see Overlay Stub Allowlist below).

### Rule 3: Content Pattern Detection

| Rule ID | Pattern (in file) | Severity | Description |
|---------|-------------------|----------|-------------|
| `DRIFT-020` | `## Agent Definition` | HIGH | Agent definition content in local file |
| `DRIFT-021` | `**ID**: \`[a-z-]+\`` with `**Role**:` | HIGH | Agent ID/Role pattern |
| `DRIFT-022` | `INVARIANT:` in `.claude/` | MEDIUM | Policy invariant in local file |
| `DRIFT-023` | `HARD_FAIL` in `.claude/` | MEDIUM | Gate enforcement in local file |

---

## Detection Algorithm

```
DRIFT_DETECTOR_SCAN(project_root):
    findings = []
    claude_dir = project_root + "/.claude"

    if not exists(claude_dir):
        return []  # No .claude directory - compliant

    # Rule 1: Forbidden directories
    for forbidden_dir in ["agents", "policies", "gates", "prompts", "governance"]:
        path = claude_dir + "/" + forbidden_dir
        if exists(path) and is_directory(path):
            if forbidden_dir == "prompts":
                # Check if it's just context/ subdirectory (allowed)
                contents = list_directory(path)
                if contents != ["context"] and contents != ["context/"]:
                    findings.append({
                        rule: "DRIFT-004",
                        path: path,
                        severity: "CRITICAL",
                        message: "Forbidden prompts directory (non-context)"
                    })
            else:
                findings.append({
                    rule: "DRIFT-00X",
                    path: path,
                    severity: "CRITICAL",
                    message: "Forbidden directory: " + forbidden_dir
                })

    # Rule 2: Forbidden files
    for file in recursive_list_files(claude_dir):
        filename = basename(file)

        if filename == "ROSTER.md":
            findings.append({
                rule: "DRIFT-010",
                path: file,
                severity: "CRITICAL",
                message: "Local ROSTER.md forbidden"
            })

        if filename == "INTAKE.md":
            findings.append({
                rule: "DRIFT-011",
                path: file,
                severity: "CRITICAL",
                message: "Local INTAKE.md forbidden"
            })

        if file.contains("/agents/") and filename.endswith(".md"):
            findings.append({
                rule: "DRIFT-014",
                path: file,
                severity: "CRITICAL",
                message: "Local agent definition forbidden"
            })

        if filename.endswith("-agent.md"):
            findings.append({
                rule: "DRIFT-015",
                path: file,
                severity: "HIGH",
                message: "Agent file pattern forbidden"
            })

    # Rule 3: Content patterns
    for file in list_md_files(claude_dir):
        content = read_file(file)

        if content.contains("## Agent Definition"):
            findings.append({
                rule: "DRIFT-020",
                path: file,
                severity: "HIGH",
                message: "Agent definition content in local file"
            })

        if regex_match(content, /\*\*ID\*\*:\s*`[a-z-]+`/) and content.contains("**Role**:"):
            findings.append({
                rule: "DRIFT-021",
                path: file,
                severity: "HIGH",
                message: "Agent ID/Role pattern in local file"
            })

    return findings
```

---

## Severity Levels

| Severity | Action | Mission Impact |
|----------|--------|----------------|
| **CRITICAL** | HARD FAIL | Mission cannot proceed |
| **HIGH** | BLOCKING | Mission blocked until resolved |
| **MEDIUM** | WARNING | Logged, migration recommended |
| **LOW** | INFO | Logged for awareness |

---

## Detection Report Format

```yaml
drift_detection_report:
  scan_date: "2026-02-06T12:00:00Z"
  project: "{project_name}"
  project_root: "{project_root}"
  claude_dir: "{project}/.claude"

  summary:
    total_findings: {count}
    critical: {count}
    high: {count}
    medium: {count}
    low: {count}

  verdict: "PASS" | "FAIL"

  findings:
    - rule_id: "DRIFT-001"
      severity: "CRITICAL"
      path: "{project}/.claude/agents/my-agent.md"
      message: "Local agent definition forbidden"
      resolution: "Move to .claude-anx/agents/"

    - rule_id: "DRIFT-010"
      severity: "CRITICAL"
      path: "{project}/.claude/ROSTER.md"
      message: "Local ROSTER.md forbidden"
      resolution: "Delete local copy; use .claude-anx/agents/ROSTER.md"
```

---

## Exclusion Rules

### Allowed Paths (Not Scanned)

```
EXCLUSIONS:
  # node_modules .claude directories (npm packages, not our governance)
  - "**/node_modules/**/.claude/**"

  # Backup directories
  - "**/.claude.backup/**"

  # Archive/quarantine
  - "**/archive/**/.claude/**"
  - "**/quarantine/**/.claude/**"
  - "**/_quarantine/**/.claude/**"
```

### Allowed Files in Project .claude/

```
ALLOWED (never flagged):
  - settings.json
  - settings.local.json
  - mcp.json
  - commands/*.md
  - context/*.md
  - context/*.json
  - workflows/*.json
  - workflows/*.yaml
  - hooks/*.sh
  - hooks/*.ps1
  - hooks/*.js
```

---

## Overlay Stub Allowlist

In rare cases, a project may need an overlay stub file that references global agents without defining them. These stubs are ALLOWED only if they meet ALL criteria:

### Stub File Requirements

1. **File must be named**: `OVERLAY_STUB.md` (exact name)
2. **File must contain header**: `# Overlay Stub - DO NOT DEFINE AGENTS HERE`
3. **File must reference**: `See .claude-anx/agents/ for canonical definitions`
4. **File must NOT contain**: Agent definition patterns (ID/Role/Trigger blocks)

### Valid Overlay Stub Example

```markdown
# Overlay Stub - DO NOT DEFINE AGENTS HERE

This project uses agents from the global .claude-anx source.

See .claude-anx/agents/ for canonical definitions.

## Local Context Only

This file provides local context for agent routing, NOT agent definitions.

- For Direct-Cuts specific agents, see: .claude-anx/agents/direct-cuts/
- For shared agents, see: .claude-anx/agents/
```

### Invalid Overlay Stub (will FAIL drift detection)

```markdown
# My Agents

**ID**: `my-agent`
**Role**: Custom agent
**Trigger**: Some trigger

## Responsibilities
...
```

This would fail because it contains agent definition patterns.

### Detection Logic

```
if file in project/.claude/agents/*.md:
    if filename == "OVERLAY_STUB.md":
        if file.contains("# Overlay Stub - DO NOT DEFINE AGENTS HERE"):
            if file.contains("See .claude-anx/agents/"):
                if NOT file.matches(AGENT_DEFINITION_PATTERN):
                    ALLOW  # Valid overlay stub
    FAIL  # All other cases are forbidden
```

---

## Implementation: Shell Script

```bash
#!/bin/bash
# drift-detector.sh - Scan project for .claude drift

PROJECT_ROOT="${1:-.}"
CLAUDE_DIR="$PROJECT_ROOT/.claude"
FINDINGS=()
CRITICAL=0
HIGH=0

echo "Drift Detector v1.0.0"
echo "Scanning: $PROJECT_ROOT"
echo "─────────────────────────────────────"

# Skip if no .claude directory
if [ ! -d "$CLAUDE_DIR" ]; then
    echo "No .claude directory found - COMPLIANT"
    exit 0
fi

# Rule 1: Forbidden directories
for dir in agents policies gates governance; do
    if [ -d "$CLAUDE_DIR/$dir" ]; then
        echo "CRITICAL: Forbidden directory: $CLAUDE_DIR/$dir"
        FINDINGS+=("DRIFT-00X:$CLAUDE_DIR/$dir")
        ((CRITICAL++))
    fi
done

# Check prompts (allowed if only context/)
if [ -d "$CLAUDE_DIR/prompts" ]; then
    non_context=$(find "$CLAUDE_DIR/prompts" -mindepth 1 -maxdepth 1 ! -name "context" 2>/dev/null)
    if [ -n "$non_context" ]; then
        echo "CRITICAL: Forbidden prompts directory (non-context content)"
        FINDINGS+=("DRIFT-004:$CLAUDE_DIR/prompts")
        ((CRITICAL++))
    fi
fi

# Rule 2: Forbidden files
find "$CLAUDE_DIR" -name "ROSTER.md" 2>/dev/null | while read f; do
    echo "CRITICAL: Local ROSTER.md: $f"
    FINDINGS+=("DRIFT-010:$f")
    ((CRITICAL++))
done

find "$CLAUDE_DIR" -name "INTAKE.md" 2>/dev/null | while read f; do
    echo "CRITICAL: Local INTAKE.md: $f"
    FINDINGS+=("DRIFT-011:$f")
    ((CRITICAL++))
done

find "$CLAUDE_DIR" -path "*/agents/*.md" 2>/dev/null | while read f; do
    echo "CRITICAL: Local agent definition: $f"
    FINDINGS+=("DRIFT-014:$f")
    ((CRITICAL++))
done

# Summary
echo "─────────────────────────────────────"
echo "Findings: ${#FINDINGS[@]}"
echo "Critical: $CRITICAL"
echo "High: $HIGH"

if [ $CRITICAL -gt 0 ]; then
    echo "VERDICT: FAIL - Migration required"
    exit 1
else
    echo "VERDICT: PASS - Overlay compliant"
    exit 0
fi
```

---

## Integration Points

### CI/CD Integration

```yaml
# .github/workflows/drift-check.yml
name: Drift Detection
on: [push, pull_request]
jobs:
  drift-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Drift Detector
        run: |
          chmod +x ./scripts/drift-detector.sh
          ./scripts/drift-detector.sh .
```

### Pre-Commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
./scripts/drift-detector.sh . || {
    echo "Drift detected! Resolve before committing."
    exit 1
}
```

### Mission Bootstrap

```
BOOTSTRAP_SEQUENCE:
  1. Resolve ANX_ROOT
  2. Load global governance
  3. RUN DRIFT DETECTOR on PROJECT_ROOT
  4. If findings.critical > 0:
       HARD_FAIL("Drift detected. Migration required.")
  5. Proceed with mission
```

---

## Remediation Actions

| Rule ID | Remediation |
|---------|-------------|
| DRIFT-001 | Move `agents/` contents to `.claude-anx/agents/`, delete local |
| DRIFT-002 | Move `policies/` contents to `.claude-anx/policies/`, delete local |
| DRIFT-003 | Move `gates/` contents to `.claude-anx/gates/`, delete local |
| DRIFT-004 | Move prompts to `.claude-anx/prompts/`, keep only `context/` locally |
| DRIFT-005 | Move governance to `.claude-anx/governance/`, delete local |
| DRIFT-010 | Delete local `ROSTER.md`, ensure `.claude-anx/agents/ROSTER.md` is canonical |
| DRIFT-011 | Delete local `INTAKE.md`, ensure `.claude-anx/governance/INTAKE.md` is canonical |
| DRIFT-014 | Move agent `.md` files to `.claude-anx/agents/`, delete local |

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.1.0 | 2026-02-06 | Added DRIFT-014a for nested agents, overlay stub allowlist, explicit agents/*.md blocking |
| 1.0.0 | 2026-02-06 | Initial drift detector rules |

---

**Classification**: DETECTION RULES
**Enforcement**: Automated scan with blocking on CRITICAL findings
