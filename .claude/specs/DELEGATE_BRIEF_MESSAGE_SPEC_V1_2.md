# Delegate Brief Message Spec v1.2

Goal: Steve can send one messy message. System extracts enough structure to generate missions.

## Required (must be inferable from plain text)
- title (fallback: first sentence trimmed)
- target (repo/system name, or "unknown" if missing)
- why (1-3 sentences)
- definition_of_done (3-7 bullets; may be embedded as sentences)
- constraints (0+)
- scope_included / scope_excluded (0+)

## Optional Headings (helpful, never required)
Title:
Type: project | feature | process
Target:
Why:
Definition of Done:
Scope Included:
Scope Excluded:
Constraints:
Risk Tolerance: low | medium | high
Deadline:
Approvals:

## Parsing Rules
- If headings exist, treat them as authoritative.
- If no headings:
  - title = first non-empty line (max 80 chars)
  - target = first mention of path/repo keyword ("C:\Dev\", "repo:", "project:", known repo list)
  - definition_of_done = any lines starting with -, *, • OR sentences containing "done when", "must", "should"
  - constraints = sentences containing "do not", "cannot", "must not", "no new", "avoid"
- Default risk_tolerance = medium
- Default approvals = spend money, legal claims, irreversible data changes, scope expansion

## Output Artifacts
Compiler produces:
- brief.json (parsed structure)
- work_packet.md
- missions/*.json
- decisions/*.json (only if needed)

## Examples (3)

### Example 1 (Feature)
Build "Delegate Brief Intake" for ANX Command Center. Target: C:\Dev\StrataNoble. Done when: (1) I can send one message and it becomes a brief file, (2) missions are generated automatically, (3) I only get pinged for decisions. No new UI beyond a single textarea page.

### Example 2 (Process)
Change our release process. Target: Direct-Cuts. Done when: releases require QA PASS receipt + rollback note. Exclude: adding new dashboards. Constraint: keep it lightweight.

### Example 3 (Project)
Create Data Room intake automation. Target: ANX. Done when: dropping one link triggers a folder scaffold + checklist + receipt.