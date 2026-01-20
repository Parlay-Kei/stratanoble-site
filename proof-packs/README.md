# LinkedIn Operator Proof Packs

This directory stores audit trails from LinkedIn Operator Agent runs.

## Structure

```
proof-packs/
├── run-2026-01-19T10-30-00/
│   ├── action-log.json              # Full action audit trail
│   ├── receipt.json                 # Run summary
│   ├── 2026-01-19T10-30-01_session-established.png
│   ├── 2026-01-19T10-30-05_service-page-loaded.png
│   ├── 2026-01-19T10-30-10_before-overview-edit.png
│   └── ...
└── run-2026-01-19T14-45-00/
    └── ...
```

## Files

### action-log.json
Complete audit trail of every action taken:
```json
[
  {
    "action": "session_establish_start",
    "timestamp": "2026-01-19T10:30:00.000Z",
    "data": { "headless": true }
  },
  {
    "action": "screenshot_captured",
    "timestamp": "2026-01-19T10:30:01.000Z",
    "data": { "filename": "session-established.png" }
  }
]
```

### receipt.json
Summary of the run:
```json
{
  "runId": "run-2026-01-19T10-30-00",
  "startTime": "2026-01-19T10:30:00.000Z",
  "endTime": "2026-01-19T10:35:00.000Z",
  "totalActions": 12,
  "actionCount": 5,
  "actions": ["session_establish_start", "navigation_start", ...],
  "status": "COMPLETED",
  "proofDir": "/absolute/path/to/proof-packs/run-2026-01-19T10-30-00"
}
```

## Security Notes

- Proof packs may contain screenshots of LinkedIn pages
- Do not commit sensitive data to version control
- Consider adding `proof-packs/` to `.gitignore` for production
- Keep proof packs for audit compliance (recommend 90 days retention)

## Cleanup

To clean old proof packs:
```bash
# Delete proof packs older than 30 days
find ./proof-packs -type d -name "run-*" -mtime +30 -exec rm -rf {} +
```
