#!/bin/bash
# =============================================================================
# Drift Detector - Automated .claude-anx Governance Enforcement
# =============================================================================
# Document ID: DRIFT-DETECT-SCRIPT-001
# Version: 1.0.0
# Purpose: Detect forbidden files in .claude/ directories
# Authority: OCS / DRIFT-DETECTOR-RULES v1.1.0
# =============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${1:-$(pwd)}"
OUTPUT_MODE="${2:-normal}"  # normal, json, ci
PROOF_DIR="${3:-}"

# Colors (disabled in CI mode)
if [ "$OUTPUT_MODE" = "ci" ]; then
    RED=""
    GREEN=""
    YELLOW=""
    NC=""
else
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    NC='\033[0m'
fi

# Counters
CRITICAL_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=0
VIOLATIONS=()

# =============================================================================
# Functions
# =============================================================================

log_info() {
    if [ "$OUTPUT_MODE" != "json" ]; then
        echo -e "${GREEN}[INFO]${NC} $1"
    fi
}

log_warn() {
    if [ "$OUTPUT_MODE" != "json" ]; then
        echo -e "${YELLOW}[WARN]${NC} $1"
    fi
}

log_error() {
    if [ "$OUTPUT_MODE" != "json" ]; then
        echo -e "${RED}[FAIL]${NC} $1"
    fi
}

add_violation() {
    local rule_id="$1"
    local severity="$2"
    local file_path="$3"
    local description="$4"

    VIOLATIONS+=("$rule_id|$severity|$file_path|$description")

    case "$severity" in
        CRITICAL) ((CRITICAL_COUNT++)) || true ;;
        HIGH) ((HIGH_COUNT++)) || true ;;
        MEDIUM) ((MEDIUM_COUNT++)) || true ;;
    esac

    if [ "$OUTPUT_MODE" != "json" ]; then
        log_error "[$rule_id] $severity: $file_path"
        echo "         $description"
    fi
}

is_valid_overlay_stub() {
    local file_path="$1"
    local filename=$(basename "$file_path")

    # Must be named OVERLAY_STUB.md
    if [ "$filename" != "OVERLAY_STUB.md" ]; then
        return 1
    fi

    # Must contain required headers
    if ! grep -q "# Overlay Stub - DO NOT DEFINE AGENTS HERE" "$file_path" 2>/dev/null; then
        return 1
    fi

    if ! grep -q "See .claude-anx/agents/" "$file_path" 2>/dev/null; then
        return 1
    fi

    # Must NOT contain agent definition patterns
    if grep -qE '^\*\*ID\*\*:\s*`[a-z-]+`' "$file_path" 2>/dev/null; then
        return 1
    fi

    if grep -qE '^\*\*Role\*\*:' "$file_path" 2>/dev/null; then
        return 1
    fi

    return 0
}

check_forbidden_directories() {
    local claude_dir="$1"

    # DRIFT-001: Local agents/ directory
    if [ -d "$claude_dir/agents" ]; then
        local agent_files=$(find "$claude_dir/agents" -name "*.md" 2>/dev/null | wc -l)
        if [ "$agent_files" -gt 0 ]; then
            # Check each file
            while IFS= read -r file; do
                if [ -f "$file" ] && ! is_valid_overlay_stub "$file"; then
                    add_violation "DRIFT-014" "CRITICAL" "$file" "Forbidden agent definition in local .claude/agents/"
                fi
            done < <(find "$claude_dir/agents" -name "*.md" 2>/dev/null)
        fi
    fi

    # DRIFT-002: Local policies/ directory
    if [ -d "$claude_dir/policies" ]; then
        local policy_files=$(find "$claude_dir/policies" -name "*.md" 2>/dev/null)
        if [ -n "$policy_files" ]; then
            while IFS= read -r file; do
                add_violation "DRIFT-002" "CRITICAL" "$file" "Forbidden policy definition in local .claude/policies/"
            done <<< "$policy_files"
        fi
    fi

    # DRIFT-003: Local gates/ directory
    if [ -d "$claude_dir/gates" ]; then
        local gate_files=$(find "$claude_dir/gates" -name "*.md" 2>/dev/null)
        if [ -n "$gate_files" ]; then
            while IFS= read -r file; do
                add_violation "DRIFT-003" "CRITICAL" "$file" "Forbidden gate definition in local .claude/gates/"
            done <<< "$gate_files"
        fi
    fi
}

check_forbidden_files() {
    local claude_dir="$1"

    # DRIFT-010: Local ROSTER.md
    if [ -f "$claude_dir/ROSTER.md" ]; then
        add_violation "DRIFT-010" "CRITICAL" "$claude_dir/ROSTER.md" "Local roster forbidden"
    fi

    # DRIFT-011: Local INTAKE.md
    if [ -f "$claude_dir/INTAKE.md" ]; then
        add_violation "DRIFT-011" "CRITICAL" "$claude_dir/INTAKE.md" "Local intake forbidden"
    fi

    # DRIFT-012: Nested ROSTER.md
    local nested_rosters=$(find "$claude_dir" -name "ROSTER.md" -not -path "$claude_dir/ROSTER.md" 2>/dev/null)
    if [ -n "$nested_rosters" ]; then
        while IFS= read -r file; do
            add_violation "DRIFT-012" "CRITICAL" "$file" "Nested roster forbidden"
        done <<< "$nested_rosters"
    fi

    # DRIFT-013: Nested INTAKE.md
    local nested_intakes=$(find "$claude_dir" -name "INTAKE.md" -not -path "$claude_dir/INTAKE.md" 2>/dev/null)
    if [ -n "$nested_intakes" ]; then
        while IFS= read -r file; do
            add_violation "DRIFT-013" "CRITICAL" "$file" "Nested intake forbidden"
        done <<< "$nested_intakes"
    fi
}

check_file_patterns() {
    local claude_dir="$1"

    # DRIFT-015: *-agent.md pattern
    local agent_pattern_files=$(find "$claude_dir" -name "*-agent.md" 2>/dev/null)
    if [ -n "$agent_pattern_files" ]; then
        while IFS= read -r file; do
            add_violation "DRIFT-015" "HIGH" "$file" "Agent file pattern forbidden"
        done <<< "$agent_pattern_files"
    fi

    # DRIFT-016: *-policy.md pattern
    local policy_pattern_files=$(find "$claude_dir" -name "*-policy.md" 2>/dev/null)
    if [ -n "$policy_pattern_files" ]; then
        while IFS= read -r file; do
            add_violation "DRIFT-016" "HIGH" "$file" "Policy file pattern forbidden"
        done <<< "$policy_pattern_files"
    fi

    # DRIFT-017: *-gate.md pattern
    local gate_pattern_files=$(find "$claude_dir" -name "*-gate.md" 2>/dev/null)
    if [ -n "$gate_pattern_files" ]; then
        while IFS= read -r file; do
            add_violation "DRIFT-017" "HIGH" "$file" "Gate file pattern forbidden"
        done <<< "$gate_pattern_files"
    fi
}

check_content_patterns() {
    local claude_dir="$1"

    # Find all .md files in .claude/
    local md_files=$(find "$claude_dir" -name "*.md" 2>/dev/null)
    if [ -z "$md_files" ]; then
        return
    fi

    while IFS= read -r file; do
        # Skip allowed overlay directories
        if [[ "$file" == *"/settings/"* ]] || [[ "$file" == *"/mcp/"* ]] || \
           [[ "$file" == *"/commands/"* ]] || [[ "$file" == *"/context/"* ]] || \
           [[ "$file" == *"/workflows/"* ]] || [[ "$file" == *"/hooks/"* ]]; then
            continue
        fi

        # DRIFT-020: Agent definition content
        if grep -q "## Agent Definition" "$file" 2>/dev/null; then
            add_violation "DRIFT-020" "HIGH" "$file" "Agent definition content in local file"
        fi

        # DRIFT-022: Policy invariant
        if grep -q "INVARIANT:" "$file" 2>/dev/null; then
            add_violation "DRIFT-022" "MEDIUM" "$file" "Policy invariant in local file"
        fi

        # DRIFT-023: Gate enforcement
        if grep -q "HARD_FAIL" "$file" 2>/dev/null; then
            add_violation "DRIFT-023" "MEDIUM" "$file" "Gate enforcement in local file"
        fi
    done <<< "$md_files"
}

scan_project() {
    local project_path="$1"
    local claude_dir="$project_path/.claude"

    if [ ! -d "$claude_dir" ]; then
        return
    fi

    if [ "$OUTPUT_MODE" != "json" ]; then
        log_info "Scanning: $project_path"
    fi

    check_forbidden_directories "$claude_dir"
    check_forbidden_files "$claude_dir"
    check_file_patterns "$claude_dir"
    check_content_patterns "$claude_dir"
}

output_json() {
    echo "{"
    echo "  \"timestamp\": \"$(date -Iseconds)\","
    echo "  \"project_root\": \"$PROJECT_ROOT\","
    echo "  \"summary\": {"
    echo "    \"critical\": $CRITICAL_COUNT,"
    echo "    \"high\": $HIGH_COUNT,"
    echo "    \"medium\": $MEDIUM_COUNT,"
    echo "    \"total\": ${#VIOLATIONS[@]}"
    echo "  },"
    echo "  \"violations\": ["

    local first=true
    for violation in "${VIOLATIONS[@]}"; do
        IFS='|' read -r rule_id severity file_path description <<< "$violation"
        if [ "$first" = true ]; then
            first=false
        else
            echo ","
        fi
        echo -n "    {\"rule\": \"$rule_id\", \"severity\": \"$severity\", \"file\": \"$file_path\", \"description\": \"$description\"}"
    done

    echo ""
    echo "  ],"
    echo "  \"verdict\": \"$([ "$CRITICAL_COUNT" -gt 0 ] && echo "FAIL" || echo "PASS")\""
    echo "}"
}

write_proof_pack() {
    if [ -z "$PROOF_DIR" ]; then
        return
    fi

    mkdir -p "$PROOF_DIR"
    local proof_file="$PROOF_DIR/drift-scan-$(date +%Y%m%d-%H%M%S).json"
    output_json > "$proof_file"

    if [ "$OUTPUT_MODE" != "json" ]; then
        log_info "Proof pack written to: $proof_file"
    fi
}

# =============================================================================
# Main
# =============================================================================

main() {
    if [ "$OUTPUT_MODE" != "json" ]; then
        echo "=============================================="
        echo "  Drift Detector v1.0.0"
        echo "  .claude-anx Governance Enforcement"
        echo "=============================================="
        echo ""
    fi

    # Scan the target project
    scan_project "$PROJECT_ROOT"

    # Output results
    if [ "$OUTPUT_MODE" = "json" ]; then
        output_json
    else
        echo ""
        echo "=============================================="
        echo "  SCAN RESULTS"
        echo "=============================================="
        echo "  CRITICAL: $CRITICAL_COUNT"
        echo "  HIGH:     $HIGH_COUNT"
        echo "  MEDIUM:   $MEDIUM_COUNT"
        echo "  TOTAL:    ${#VIOLATIONS[@]}"
        echo "=============================================="

        if [ "$CRITICAL_COUNT" -gt 0 ]; then
            echo -e "  ${RED}VERDICT: FAIL${NC}"
            echo "  Resolve CRITICAL violations before proceeding."
        else
            echo -e "  ${GREEN}VERDICT: PASS${NC}"
        fi
        echo "=============================================="
    fi

    # Write proof pack if directory specified
    write_proof_pack

    # Exit with appropriate code
    if [ "$CRITICAL_COUNT" -gt 0 ]; then
        exit 1
    fi
    exit 0
}

# Run if executed directly
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
    main
fi
