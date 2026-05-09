# Agent roster confirmation — OCS-SN-INVOICE-BRAND-STANDARD-0001

**Date:** 2026-05-04

## Inspected locations (`C:\Dev\.claude-anx`)

| Target | Result |
|--------|--------|
| `agents\` | Reviewed. **One active top-level agent file:** `marketing-director.md`. Subfolders: `_archived_v2\`, `_deprecated\` (historical agent specs). |
| `prompts\` | Reviewed structure: `Missions\`, `routines\`, `shared\` — no invoice-specific prompt; not used for owner selection. |
| `slash-commands.md` | **Not found** at repository root (2026-05-04). |
| `workspace-layout.md` | **Not found** at repository root (2026-05-04). |
| `CLAUDE.md` | Read — ANX context, Merlin, zones, governance. |
| `registry\MISSION_REGISTRY.md` | Sampled for historical owner patterns (e.g. `eng-delivery-lead` for Q-ARI brand skin, `brand-manager` archived for site brand audit). |
| `registry\_archived\agent-registry.md` | Confirms many agents live under archive; current `agents\` root is minimal. |

## Design / brand / document / PDF / finance agents

- **Active:** `marketing-director.md` — owns market-facing outcomes, **SN-BCA / brand alignment** (references `SN-BRAND-COMMERCIAL-ARCHITECTURE.md`, SN-BCA-001), and oversight of brand standards for Strata Noble.
- **Archived (not active file):** `brand-manager.md`, `comms-design-agent.md`, `cfo-economics.md`, and others under `agents\_archived_v2\` — useful references; **not** the current single-file active roster.

## Selected owner

**Marketing Director** (`C:\Dev\.claude-anx\agents\marketing-director.md`)

## Rationale

1. **Roster reality:** The only non-archived agent definition at `agents\*.md` is the Marketing Director. No separate “PDF specialist” or “finance document” agent exists at that layer today.
2. **Mission fit:** This deliverable is a **client-facing financial document standard** that must align with **canonical Strata Noble brand and positioning** (SN-BCA / SN-BRAND-COMMERCIAL-ARCHITECTURE) and present **operational maturity** — the Marketing Director’s remit includes brand compliance and authority of market-facing materials.
3. **Execution:** Implementation of HTML/CSS/PDF in the Strata Noble repo is performed in **Cursor (this session)** in the same way registry missions cite **Engineering Delivery** for shipped artifacts; brand direction precedes build.

## Platform Ops path

**Not triggered.** A suitable owner exists (Marketing Director) for brand-aligned standards; engineering execution is standard Cursor/repo work, not a missing agent class.
