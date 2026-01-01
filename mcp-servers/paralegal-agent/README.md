# Paralegal Contract Agent MCP Server

Autonomous contract drafting and review system using Model Context Protocol (MCP). Generates business contracts from pre-approved templates, clause libraries, and negotiation playbooks.

## Overview

This MCP server provides tools for generating and reviewing contracts while enforcing StrataNoble's legal playbook, IP policies, and risk management guidelines.

**IMPORTANT**: This system generates contracts but does NOT provide legal advice. All generated contracts include mandatory disclaimers and require human review before execution.

## Features

- **6 Core Contract Types**: MSA, SOW, Change Order, NDA, IP Addendum, Payment Policy
- **Template System**: Pre-approved base templates with variable substitution
- **Clause Library**: Reusable contract clauses organized by topic and risk profile
- **Negotiation Playbook**: Enforces StrataNoble's default positions and deal-breakers
- **Version Comparison**: Diff engine for identifying substantive changes
- **Deal Context Integration**: Retrieves client intake data from database
- **Database Persistence**: Stores contracts with full version history

## Installation

### 1. Install Dependencies

```bash
cd C:\Dev\StrataNoble\mcp-servers\paralegal-agent
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Run Database Migration

The database schema is already created via migration:
```
C:\Dev\StrataNoble\supabase\migrations\0025_paralegal_contract_tables.sql
```

### 4. Seed Data

Populate templates, clauses, and playbook rules:

```bash
npm run seed
```

This will create:
- 3 contract templates (MSA, SOW, NDA)
- 5 reusable clauses (IP, Liability, Confidentiality, Payment, Dispute Resolution)
- 8 playbook rules covering key negotiation topics

## MCP Tools

### 1. `get_contract_template`
Fetch contract template by type, risk profile, and jurisdiction.

**Parameters**:
- `document_type`: MSA, SOW, CHANGE_ORDER, NDA, IP_ADDENDUM, PAYMENT_POLICY, etc.
- `risk_profile`: standard (default), customer_friendly, vendor_friendly
- `jurisdiction`: US-NV (default)

**Returns**: Template content, variables, sections, and metadata

### 2. `get_clauses`
Retrieve contract clauses by topic and filters.

**Parameters**:
- `topic`: IP_OWNERSHIP, LIABILITY, CONFIDENTIALITY, PAYMENT_TERMS, etc.
- `risk_profile`: Optional filter
- `jurisdiction`: Optional filter

**Returns**: Array of matching clauses with text and variables

### 3. `get_playbook_rules`
Get negotiation playbook rules for specific topics.

**Parameters**:
- `topic`: ip_ownership, payment_terms, liability, warranty, etc.
- `jurisdiction`: Optional filter

**Returns**: Default positions, acceptable alternatives, deal-breakers, escalation rules

### 4. `get_deal_context`
Retrieve deal intake data and client information.

**Parameters**:
- `deal_id`: UUID of the deal record

**Returns**: Complete deal context including client info, services, pricing, timeline

### 5. `compare_contract_versions`
Generate diff between contract versions.

**Parameters**:
- `contract_id`: Contract UUID
- `version_a`: First version number
- `version_b`: Second version number

**Returns**: Diff report with risk-impacting changes, line counts, full diff text

### 6. `save_contract`
Persist contract to database with versioning.

**Parameters**:
- `deal_id`: Associated deal UUID
- `document_type`: Contract type
- `title`: Contract title
- `content`: Contract content object (sections, variables)
- `rendered_text`: Full rendered text
- `risk_profile`: Risk stance
- `jurisdiction`: Governing law
- `parties`: Array of party information
- `metadata`: Additional metadata

**Returns**: Contract ID, version, status, success message

## Prompts

### `paralegal_system_prompt`
Complete system prompt with:
- Agent role and responsibilities
- StrataNoble legal context (IP model, payment terms, jurisdiction)
- Contract drafting guidelines
- Playbook rules and deal-breakers
- Human review triggers
- Output format specifications

### `human_review_checklist`
Comprehensive checklist for human reviewers covering:
- Critical deal terms verification
- Legal compliance checks
- Risk assessment
- Playbook compliance
- Document quality
- Missing information flags

## Directory Structure

```
paralegal-agent/
├── src/
│   ├── index.js                    # MCP server entry point
│   ├── tools/
│   │   ├── template-library.js     # Template retrieval
│   │   ├── clause-library.js       # Clause management
│   │   ├── playbook.js             # Negotiation rules
│   │   ├── deal-context.js         # Intake data
│   │   ├── diff-engine.js          # Version comparison
│   │   └── document-save.js        # Persistence
│   ├── types/
│   │   ├── contracts.ts            # TypeScript types
│   │   └── enums.ts                # Enumerations
│   └── prompts/
│       └── system-prompt.js        # Agent behavior
├── data/
│   ├── templates/                  # Base contract templates
│   │   ├── msa-standard.md
│   │   ├── sow-standard.md
│   │   ├── change-order-standard.md
│   │   ├── nda-standard.md
│   │   ├── ip-addendum-standard.md
│   │   └── payment-policy-standard.md
│   ├── clauses/                    # Reusable clause library
│   │   ├── ip-ownership/
│   │   ├── liability/
│   │   ├── confidentiality/
│   │   ├── payment-terms/
│   │   └── dispute-resolution/
│   └── playbook/                   # Negotiation rules
│       └── stratanoble-playbook.json
├── scripts/
│   └── seed-data.js                # Database seeding
├── package.json
├── README.md
└── .env.example
```

## Usage

### Start MCP Server

```bash
npm start
```

The server runs on stdio for MCP protocol communication.

### Add to MCP Configuration

Add to your MCP settings file (e.g., Claude Desktop config):

```json
{
  "mcpServers": {
    "paralegal-agent": {
      "command": "node",
      "args": ["C:\\Dev\\StrataNoble\\mcp-servers\\paralegal-agent\\src\\index.js"],
      "env": {
        "SUPABASE_URL": "your_url",
        "SUPABASE_SERVICE_ROLE_KEY": "your_key"
      }
    }
  }
}
```

### Example Workflow

1. **Draft MSA for new client**:
   - Get deal context: `get_deal_context({ deal_id: "uuid" })`
   - Fetch template: `get_contract_template({ document_type: "MSA" })`
   - Get clauses: `get_clauses({ topic: "IP_OWNERSHIP" })`
   - Review playbook: `get_playbook_rules({ topic: "ip_ownership" })`
   - Generate contract with substituted variables
   - Save: `save_contract({ deal_id, document_type, content, ... })`

2. **Review contract changes**:
   - Compare versions: `compare_contract_versions({ contract_id, version_a: 1, version_b: 2 })`
   - Analyze risk-impacting changes
   - Check playbook compliance
   - Generate review report

## StrataNoble Legal Defaults

### IP Model
- **Provider retains**: All pre-existing IP, frameworks, methodologies
- **Client receives**: Perpetual license to use Provider IP in deliverables
- **Client owns**: Custom deliverables created specifically for them

### Payment Terms
- **50% deposit** (minimum 30%)
- **Net 15 payment terms**
- **Milestone-based** for remainder
- **1.5% monthly late fee**

### Liability
- **Cap**: Total fees paid in preceding 12 months
- **No consequential damages**
- **Exceptions**: Confidentiality, indemnification

### Jurisdiction
- **Nevada law** (default, can adjust for enterprise clients)
- **Arbitration** for dispute resolution

### Deal-Breakers
Never accept:
1. Transfer of Provider's core IP/frameworks
2. Unlimited liability
3. No upfront payment
4. Payment only on final completion
5. Indemnification for all third-party claims

## Database Schema

Contracts stored in Supabase tables:
- `deals`: Client engagement intake
- `contracts`: Generated contracts
- `contract_versions`: Version history
- `clause_library`: Reusable clauses
- `playbook_rules`: Negotiation rules
- `contract_templates`: Base templates

See: `C:\Dev\StrataNoble\supabase\migrations\0025_paralegal_contract_tables.sql`

## ANX Integration

This MCP server is registered as a skill in the ANX agent system:

**Skill**: `paralegal-agent-ops`
**Location**: `C:\Dev\.claude-anx\skills\paralegal-agent-ops\`

Triggers on queries like:
- "draft contract"
- "generate MSA"
- "create NDA"
- "review agreement"

## Development

### Add New Template

1. Create template file in `data/templates/`
2. Use double-brace syntax for variables: `{{variable_name}}`
3. Add to seed script in `scripts/seed-data.js`
4. Run `npm run seed` to populate database

### Add New Clause

1. Create clause markdown in `data/clauses/[topic]/`
2. Include frontmatter with metadata
3. Add to seed script
4. Run seed

### Add Playbook Rule

1. Edit `data/playbook/stratanoble-playbook.json`
2. Add new rule with topic, positions, alternatives, deal-breakers
3. Run seed

## Legal Disclaimer

This system generates contract drafts for internal use. It does NOT:
- Provide legal advice
- Replace attorney review
- Guarantee legal compliance
- Warrant fitness for specific purposes

All generated contracts:
- Include AI-generation disclosure
- Require human review
- Should be reviewed by licensed attorney
- Are provided "as is" without warranty

## License

MIT - StrataNoble LLC

## Support

For issues or questions:
- Check ANX skill documentation: `C:\Dev\.claude-anx\skills\paralegal-agent-ops\skill.md`
- Review database schema: Migration 0025
- Examine playbook: `data/playbook/stratanoble-playbook.json`
