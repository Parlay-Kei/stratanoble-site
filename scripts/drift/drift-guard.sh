#!/bin/bash
# =============================================================================
# Drift Guard - Lightweight Pre-commit Check
# =============================================================================
# Document ID: DRIFT-GUARD-SCRIPT-001
# Version: 1.0.0
# Purpose: Fast pre-commit check for forbidden .claude/agents/** files
# Authority: OCS / DRIFT-DETECTOR-RULES v1.1.0
# =============================================================================

# This is a minimal, fast check designed for pre-commit hooks.
# It only checks staged files for the most critical violation (DRIFT-014).

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo -e "${YELLOW}[DRIFT-GUARD]${NC} Not in a git repository, skipping drift check."
    exit 0
fi

# Get staged files that match forbidden patterns
FORBIDDEN_STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.claude/agents/.*\.md$' || true)

# Check for DRIFT-014/014a violations in staged files
if [ -n "$FORBIDDEN_STAGED" ]; then
    # Filter out valid overlay stubs
    ACTUAL_VIOLATIONS=""

    while IFS= read -r file; do
        filename=$(basename "$file")

        # Check if it's a valid overlay stub
        if [ "$filename" = "OVERLAY_STUB.md" ]; then
            # Verify stub content
            if git show ":$file" 2>/dev/null | grep -q "# Overlay Stub - DO NOT DEFINE AGENTS HERE"; then
                if git show ":$file" 2>/dev/null | grep -q "See .claude-anx/agents/"; then
                    # Check for agent definition patterns
                    if ! git show ":$file" 2>/dev/null | grep -qE '^\*\*ID\*\*:\s*`[a-z-]+`'; then
                        continue  # Valid overlay stub, skip
                    fi
                fi
            fi
        fi

        # This is a violation
        ACTUAL_VIOLATIONS="$ACTUAL_VIOLATIONS$file"$'\n'
    done <<< "$FORBIDDEN_STAGED"

    # Remove trailing newline
    ACTUAL_VIOLATIONS=$(echo "$ACTUAL_VIOLATIONS" | sed '/^$/d')

    if [ -n "$ACTUAL_VIOLATIONS" ]; then
        echo ""
        echo -e "${RED}╔══════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                    DRIFT GUARD - COMMIT BLOCKED                      ║${NC}"
        echo -e "${RED}╠══════════════════════════════════════════════════════════════════════╣${NC}"
        echo -e "${RED}║  Rule Violated: DRIFT-014 / DRIFT-014a                               ║${NC}"
        echo -e "${RED}║  Severity: CRITICAL                                                  ║${NC}"
        echo -e "${RED}║                                                                      ║${NC}"
        echo -e "${RED}║  Forbidden agent definition files detected in staged changes:       ║${NC}"
        echo -e "${RED}╠══════════════════════════════════════════════════════════════════════╣${NC}"

        while IFS= read -r file; do
            printf "${RED}║  %-68s ║${NC}\n" "$file"
        done <<< "$ACTUAL_VIOLATIONS"

        echo -e "${RED}╠══════════════════════════════════════════════════════════════════════╣${NC}"
        echo -e "${RED}║                                                                      ║${NC}"
        echo -e "${RED}║  Agent definitions must live in .claude-anx/agents/                  ║${NC}"
        echo -e "${RED}║  See: docs/anx/GLOBAL_AUTHORITY_RULES.md                             ║${NC}"
        echo -e "${RED}║                                                                      ║${NC}"
        echo -e "${RED}║  To override (REQUIRES OPERATOR INTENT):                             ║${NC}"
        echo -e "${RED}║    git commit --no-verify -m \"DRIFT-OVERRIDE: [justification]\"       ║${NC}"
        echo -e "${RED}║                                                                      ║${NC}"
        echo -e "${RED}╚══════════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        exit 1
    fi
fi

# Also check for other critical file patterns
ROSTER_STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.claude/ROSTER\.md$' || true)
INTAKE_STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.claude/INTAKE\.md$' || true)

if [ -n "$ROSTER_STAGED" ]; then
    echo ""
    echo -e "${RED}[DRIFT-GUARD] BLOCKED: DRIFT-010 violation${NC}"
    echo -e "${RED}Forbidden file staged: $ROSTER_STAGED${NC}"
    echo -e "${RED}Local ROSTER.md is forbidden. Use .claude-anx/ROSTER.md${NC}"
    echo ""
    exit 1
fi

if [ -n "$INTAKE_STAGED" ]; then
    echo ""
    echo -e "${RED}[DRIFT-GUARD] BLOCKED: DRIFT-011 violation${NC}"
    echo -e "${RED}Forbidden file staged: $INTAKE_STAGED${NC}"
    echo -e "${RED}Local INTAKE.md is forbidden. Use .claude-anx/INTAKE.md${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}[DRIFT-GUARD]${NC} No forbidden .claude/ files in staged changes."
exit 0
