# Work Model

**Version**: 1.0 (Lean)
**Last Updated**: January 2026

---

## Purpose

Define the minimal structure for projects, workstreams, and optional phases/sprints.

---

## Project Structure (Minimum)

- Project: single outcome with accountable owner
- Workstreams: parallel tracks that roll up to the project
- Phases (optional): gated steps when sequencing is required
- Sprint (optional): time-boxed execution unit

---

## Execution Modes

### Sequence Mode (Phase Gating)

Use when risk or dependencies require order. Next phase starts only after prior phase receipts are approved.

### Parallel Mode (Workstreams Concurrent)

Use when workstreams can run independently. Receipts still required per workstream.

---

## Phase Gate Rules

- Each phase must list required receipts in its definition.
- QA Gatekeeper decides if a phase requires receipts or test evidence.
- OCS verifies receipts before allowing the next phase to start.

---

## Project Packet

Use `governance/templates/PROJECT_PACKET.md` for all new projects.
