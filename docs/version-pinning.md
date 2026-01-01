# Contract Version Pinning System

## Overview

Version pinning prevents **contract drift** by locking template and playbook versions at deal creation time. This ensures that in-flight deals continue using the same contract templates and negotiation rules, even when those templates are updated.

## Problem Statement

Without version pinning:
- Deal created on Jan 15 with MSA v1.0.0
- MSA v2.0.0 released on Feb 1 with breaking changes
- Generating a new contract for the Jan 15 deal would unexpectedly use v2.0.0
- This creates inconsistency within a single deal

With version pinning:
- Deal created on Jan 15 locks to MSA v1.0.0 and Playbook v1.0.0
- MSA v2.0.0 released on Feb 1
- Jan 15 deal continues using v1.0.0 until explicitly upgraded
- Consistency maintained throughout deal lifecycle

## Architecture

### Database Schema

The `deals` table includes three version pinning columns:

```sql
ALTER TABLE deals
  ADD COLUMN template_version TEXT,      -- e.g., "MSA_v1.0.0"
  ADD COLUMN playbook_version TEXT,      -- e.g., "1.0.0"
  ADD COLUMN locked_at TIMESTAMPTZ;      -- When versions were locked
```

### Data Flow

1. **Deal Creation** (DealsList.tsx)
   - User creates a new deal
   - Frontend queries current template version from `contract_templates` table
   - Frontend queries current playbook version (static for now)
   - Frontend saves deal with pinned versions and `locked_at` timestamp

2. **Deal Context Retrieval** (deal-context.js)
   - MCP tool fetches deal data including pinned versions
   - Returns `version_pinning` object with version info
   - Indicates whether version pinning is active

3. **Contract Generation** (document-save.js)
   - Fetches deal's pinned versions before saving
   - Passes pinned versions to build manifest generator
   - Build manifest records both pinned and actual versions used
   - Response indicates whether version pinning was applied

## Files Modified

### Migration
- `supabase/migrations/0027_add_version_pinning_to_deals.sql`
  - Adds three columns to deals table
  - Creates indexes for version queries
  - Includes documentation comments

### Frontend
- `apps/website/src/components/admin/contracts/DealsList.tsx`
  - `getCurrentTemplateVersion()`: Queries current template version
  - `getCurrentPlaybookVersion()`: Returns current playbook version
  - `handleSubmit()`: Captures and saves versions at deal creation

### MCP Tools
- `mcp-servers/paralegal-agent/src/tools/deal-context.js`
  - Returns `version_pinning` object with deal's locked versions
  - Provides notice about version pinning status

- `mcp-servers/paralegal-agent/src/tools/document-save.js`
  - Fetches deal's pinned versions when `deal_id` provided
  - Passes `dealVersions` to `generateBuildManifest()`
  - Build manifest includes version pinning metadata
  - Response includes version pinning notice

## Usage Examples

### Creating a Deal with Version Pinning

```typescript
// Frontend automatically handles this
const dealData = {
  client_name: 'Acme Corp',
  governing_law: 'US-NV',
  pricing_model: 'fixed_fee',
  ip_model: 'provider_retains',
  // ... other fields
  template_version: 'MSA_v1.0.0',      // Auto-captured
  playbook_version: '1.0.0',            // Auto-captured
  locked_at: '2025-12-30T10:00:00Z'     // Auto-captured
};
```

### Retrieving Deal Context

```javascript
// MCP tool: deal-context
{
  "success": true,
  "deal": {
    "id": "...",
    "client_name": "Acme Corp",
    "template_version": "MSA_v1.0.0",
    "playbook_version": "1.0.0",
    "locked_at": "2025-12-30T10:00:00Z"
  },
  "version_pinning": {
    "template_version": "MSA_v1.0.0",
    "playbook_version": "1.0.0",
    "locked_at": "2025-12-30T10:00:00Z",
    "version_pinning_active": true
  },
  "notice": "This deal has pinned versions. Use the specified template_version and playbook_version for all contracts."
}
```

### Saving a Contract with Pinned Versions

```javascript
// MCP tool: document-save
// The tool automatically fetches and applies pinned versions

{
  "success": true,
  "contract_id": "...",
  "version": 1,
  "status": "draft",
  "message": "Contract created successfully",
  "version_pinning": "Version pinning active: Using template MSA_v1.0.0 and playbook 1.0.0 from deal.",
  "build_manifest": {
    "template_version": "MSA_v1.0.0",
    "playbook_version": "1.0.0",
    "version_pinning": {
      "enabled": true,
      "deal_template_version": "MSA_v1.0.0",
      "deal_playbook_version": "1.0.0",
      "locked_at": "2025-12-30T10:00:00Z"
    }
  }
}
```

## Build Manifest Changes

The build manifest now includes a `version_pinning` section:

```json
{
  "manifest_version": "1.0.0",
  "template_version": "MSA_v1.0.0",       // From pinned version
  "playbook_version": "1.0.0",            // From pinned version
  "version_pinning": {
    "enabled": true,
    "deal_template_version": "MSA_v1.0.0",
    "deal_playbook_version": "1.0.0",
    "locked_at": "2025-12-30T10:00:00Z"
  }
}
```

## Future Enhancements

### Playbook Version Table
Currently, playbook version is static (`1.0.0`). Consider creating a `playbook_versions` table:

```sql
CREATE TABLE playbook_versions (
  id UUID PRIMARY KEY,
  version TEXT NOT NULL,
  description TEXT,
  effective_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Version Upgrade Tool
Create an MCP tool to upgrade a deal's pinned versions:

```javascript
// Upgrade deal to latest versions
await upgradeDealVersions({
  deal_id: '...',
  template_version: 'MSA_v2.0.0',  // Optional: specific version
  playbook_version: '2.0.0',       // Optional: specific version
  reason: 'Client requested feature from v2.0.0'
});
```

### Version Compatibility Matrix
Track which template versions are compatible with which playbook versions:

```sql
CREATE TABLE version_compatibility (
  template_version TEXT,
  playbook_version TEXT,
  compatible BOOLEAN,
  notes TEXT
);
```

### Version Audit Report
Query to see all deals by version:

```sql
SELECT
  template_version,
  playbook_version,
  COUNT(*) as deal_count,
  MIN(created_at) as oldest_deal,
  MAX(created_at) as newest_deal
FROM deals
GROUP BY template_version, playbook_version
ORDER BY created_at DESC;
```

## Migration Guide

To apply version pinning to your environment:

1. **Run the migration**:
   ```bash
   # Apply via Supabase CLI or SQL Editor
   supabase migration up
   ```

2. **Existing deals** will have NULL versions:
   - They will continue to work without version pinning
   - Consider backfilling with the version that was current when they were created
   - Or run a data migration to set them to current versions

3. **New deals** automatically get version pinning

4. **Test the flow**:
   - Create a new deal
   - Verify `template_version`, `playbook_version`, and `locked_at` are set
   - Generate a contract for the deal
   - Verify build manifest includes version pinning info

## Troubleshooting

### Deal has NULL versions
**Cause**: Deal was created before version pinning was implemented
**Solution**:
- Contracts will use latest/provided versions
- Optionally backfill versions for historical accuracy

### Version pinning not working
**Checks**:
1. Verify migration applied: `SELECT template_version FROM deals LIMIT 1;`
2. Check deal has versions: `SELECT template_version, playbook_version FROM deals WHERE id = '...';`
3. Review build manifest in contract metadata
4. Check MCP tool logs for version fetch errors

### Template version mismatch
**Cause**: Template was updated but deal still uses old version (expected behavior)
**Solution**: This is intentional. To upgrade, create a version upgrade tool.

## Security Considerations

- Version pinning creates an immutable audit trail
- Build manifests include version pinning metadata
- Cannot accidentally change contract terms by updating templates
- Deliberate upgrades require explicit action

## Compliance Benefits

1. **Consistency**: All contracts within a deal use the same template version
2. **Auditability**: Build manifest records exact versions used
3. **Traceability**: Can identify which deals are affected by a template bug
4. **Risk Management**: Template changes don't retroactively affect in-flight deals
5. **Regulatory**: Demonstrates controlled change management

## References

- Migration: `supabase/migrations/0027_add_version_pinning_to_deals.sql`
- Frontend: `apps/website/src/components/admin/contracts/DealsList.tsx`
- MCP Tools: `mcp-servers/paralegal-agent/src/tools/`
  - `deal-context.js`
  - `document-save.js`
  - `template-library.js` (already has version support)
