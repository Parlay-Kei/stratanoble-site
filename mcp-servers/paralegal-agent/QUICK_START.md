# Quick Start Guide - Paralegal Contract Agent

Get the Paralegal Contract Agent up and running in 5 minutes.

## Prerequisites

- Node.js 20+ installed
- Supabase project with service role key
- Access to StrataNoble monorepo

## Step 1: Install Dependencies (1 min)

```bash
cd C:\Dev\StrataNoble\mcp-servers\paralegal-agent
npm install
```

## Step 2: Configure Environment (1 min)

Create `.env` file in the root directory:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get these from:
- Supabase Dashboard → Settings → API
- Use the `service_role` key (NOT the anon key)

## Step 3: Verify Database Schema (30 sec)

The migration `0025_paralegal_contract_tables.sql` should already be applied. Verify by checking Supabase:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('deals', 'contracts', 'contract_versions', 'clause_library', 'playbook_rules', 'contract_templates');
```

Should return 6 tables.

## Step 4: Seed Database (1 min)

Populate templates, clauses, and playbook:

```bash
npm run seed
```

Expected output:
```
Seeding contract templates...
✓ Seeded template: Master Service Agreement - Standard (Nevada)
✓ Seeded template: Statement of Work - Standard (Nevada)
✓ Seeded template: Mutual NDA - Standard

Seeding clause library...
✓ Seeded clause: Provider Retains Pre-existing IP
✓ Seeded clause: Standard Liability Cap
✓ Seeded clause: Mutual Confidentiality - Standard
✓ Seeded clause: Milestone-Based Payment Terms
✓ Seeded clause: Arbitration - Nevada

Seeding playbook rules...
✓ Seeded playbook rule: ip_ownership
✓ Seeded playbook rule: limitation_of_liability
✓ Seeded playbook rule: payment_terms
...

✓ Database seed completed successfully!
```

## Step 5: Start MCP Server (30 sec)

```bash
npm start
```

Expected output:
```
Paralegal Contract Agent MCP Server running on stdio
```

Server is now ready to accept MCP requests via stdio.

## Step 6: Configure MCP Client (1 min)

### For Claude Desktop

Add to your Claude Desktop config file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "paralegal-agent": {
      "command": "node",
      "args": ["C:\\Dev\\StrataNoble\\mcp-servers\\paralegal-agent\\src\\index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

### For Other MCP Clients

Use the same configuration format with appropriate paths.

## Step 7: Test the Tools (2 min)

### Test 1: Get a Template

In your MCP client (e.g., Claude Desktop), ask:

> "Use the paralegal agent to get the MSA template"

Expected: Returns MSA template with variables and sections.

### Test 2: Get Clauses

> "Use the paralegal agent to get clauses for IP ownership"

Expected: Returns IP ownership clauses from the library.

### Test 3: Get Playbook Rules

> "Use the paralegal agent to get playbook rules for payment terms"

Expected: Returns StrataNoble's payment term rules and positions.

## Step 8: Create a Test Deal (Optional)

Insert a sample deal to test full workflow:

```sql
INSERT INTO deals (
  client_name,
  client_legal_name,
  client_address,
  governing_law,
  services_description,
  pricing_model,
  ip_model,
  start_date,
  end_date
) VALUES (
  'Acme Corp',
  'Acme Corporation Inc.',
  '{"street": "123 Main St", "city": "San Francisco", "state": "CA", "zip": "94102"}',
  'US-NV',
  'Custom software development for internal platform',
  'fixed_fee',
  'provider_retains',
  '2025-02-01',
  '2025-06-30'
);
```

Get the UUID from the inserted record, then test:

> "Use the paralegal agent to get deal context for UUID: [paste-uuid-here]"

## Common Issues

### Issue: "SUPABASE_URL not set"
**Solution**: Verify `.env` file exists and has correct values

### Issue: "Cannot find module"
**Solution**: Run `npm install` to install dependencies

### Issue: "Permission denied"
**Solution**: Check Supabase service role key is correct (not anon key)

### Issue: "Template not found"
**Solution**: Run `npm run seed` to populate database

## Next Steps

Once everything is working:

1. **Generate Your First Contract**:
   - Create a real deal record in `deals` table
   - Use MCP tools to generate MSA
   - Review and customize

2. **Explore Templates**:
   - Check `data/templates/` for all available templates
   - Customize for your needs
   - Add new templates

3. **Customize Playbook**:
   - Edit `data/playbook/stratanoble-playbook.json`
   - Adjust default positions
   - Add/modify rules
   - Run seed to update database

4. **Add More Clauses**:
   - Create new clause files in `data/clauses/`
   - Add to seed script
   - Run seed

5. **Build API Routes** (Optional):
   - Create Next.js API routes
   - Expose MCP tools via HTTP
   - Build admin UI

## Quick Reference

### MCP Tools Available

1. `get_contract_template` - Fetch templates
2. `get_clauses` - Get clause library
3. `get_playbook_rules` - Negotiation rules
4. `get_deal_context` - Deal data
5. `compare_contract_versions` - Version diff
6. `save_contract` - Persist contracts

### Prompts Available

1. `paralegal_system_prompt` - Agent behavior guide
2. `human_review_checklist` - Review checklist

### File Locations

- **Templates**: `data/templates/`
- **Clauses**: `data/clauses/`
- **Playbook**: `data/playbook/stratanoble-playbook.json`
- **Tools**: `src/tools/`
- **Seed Script**: `scripts/seed-data.js`

## Support

For issues:
1. Check `README.md` for detailed documentation
2. Review `IMPLEMENTATION_SUMMARY.md` for architecture
3. Examine ANX skill: `C:\Dev\.claude-anx\skills\paralegal-agent-ops\skill.md`
4. Check database schema: Migration 0025

## Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with Supabase credentials
- [ ] Database migration applied (6 tables exist)
- [ ] Seed script run successfully
- [ ] MCP server starts without errors
- [ ] MCP client configured (Claude Desktop or other)
- [ ] Can fetch templates via MCP
- [ ] Can get clauses via MCP
- [ ] Can retrieve playbook rules via MCP
- [ ] Test deal created (optional)
- [ ] Can generate sample contract (optional)

Once all checks pass, you're ready to use the Paralegal Contract Agent!

---

**Total Setup Time**: ~5-10 minutes
**Difficulty**: Easy
**Prerequisites**: Node.js, Supabase access
