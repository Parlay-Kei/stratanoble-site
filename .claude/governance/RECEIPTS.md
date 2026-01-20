# Receipts Standard

**Version**: 1.0 (Lean)
**Last Updated**: January 2026

---

## Rule

Every completed task must attach exactly one receipt artifact. If approvals were required, include approval receipt(s) plus the proof artifact.

---

## Receipt Contents (Minimum)

```yaml
receipt:
  request_id: "REQ-YYYY-NNNNN"
  owner: "Agent name"
  completed_at: "ISO8601 timestamp"
  summary: "What changed"
  artifacts:
    - "Link to PR/deploy/doc/screenshot"
  verification: "How to verify"
```

---

## Storage

- Path: `agents/[agent]/receipts/[request_id].md`
- If outside agent scope (drills/examples), store in `governance/drills/receipts/`.

---

## Receipt Types

- Approval receipt (decision + approver + timestamp)
- Proof artifact (deploy log, screenshot, doc link, query output)
