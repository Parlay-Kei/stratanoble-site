# Security Guidelines for Paralegal Agent

## Critical: Key Management

### NEVER Commit
- `.env` files
- Service role keys
- API secrets
- JWT signing keys

### Required Rotations
If any of the following have been exposed (in commits, logs, screenshots, or chat):
1. **Supabase Service Role Key** - Rotate immediately in Supabase Dashboard > Settings > API
2. **Any API keys** - Regenerate in respective service dashboards

### Known Historical Exposures
- `strata-automation-bundle/data/docuseal/docuseal/docuseal.env` contains a SECRET_KEY_BASE
- **ACTION REQUIRED**: If DocuSeal is in production, rotate that key

## Kill Switch

Emergency shutdown for all contract generation:

```bash
# Enable kill switch
export PARALEGAL_KILL_SWITCH=true

# Or in .env
PARALEGAL_KILL_SWITCH=true
```

This immediately blocks all `save_contract` operations across all projects.

## Audit Trail

Every saved contract includes a `build_manifest` with:
- `request_id` - Unique identifier for each generation
- `template_id` and `template_version` - Traceability to source template
- `template_hash` - SHA-256 integrity check
- `clause_ids` - All clauses used
- `generated_at` - Timestamp

## Placeholder Validation

Contracts with unresolved placeholders will **hard fail**:
- `{{VARIABLE}}`
- `${VARIABLE}`
- `[TBD]`
- `[INSERT ...]`
- `___` (three or more underscores)
- `[CLIENT_NAME]`, `[COMPANY_NAME]`, `[DATE]`, `[AMOUNT]`
- `PLACEHOLDER` (literal word)

## RLS Bypass Warning

The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. Use it ONLY:
- Server-side (never in client bundles)
- Within the MCP server runtime
- For administrative operations

Consider implementing an internal API layer so agents never directly access the DB with full privileges.

## Smoke Test

Run before deployment:
```bash
npm run smoke-test
```

This verifies:
- Database connectivity
- Template integrity
- Placeholder detection
- Kill switch functionality
- Playbook and clause library presence
