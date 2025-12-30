# Paralegal Contract Agent

An MCP (Model Context Protocol) server for autonomous contract drafting and review that integrates with the StrataNoble platform.

## Features

- **Template Library**: Pre-built contract templates (MSA, SOW, NDA, etc.)
- **Clause Library**: Reusable clauses organized by topic and risk profile
- **Negotiation Playbook**: Policy rules for acceptable/unacceptable positions
- **Deal Context**: Structured intake data for contract population
- **Diff Engine**: Version comparison with risk analysis
- **Document Save**: Persistent storage with version history

## Quick Start

### Prerequisites

- Node.js 20.18.0 or higher
- Supabase project with migrations applied
- MCP-compatible client (e.g., Claude Desktop)

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run database migrations
supabase migration up

# Seed initial data (optional)
npm run seed
```

### Configuration

1. Copy `.env.example` to `.env`
2. Add your Supabase credentials
3. Configure in your MCP client settings

### MCP Client Configuration

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "paralegal-agent": {
      "command": "node",
      "args": ["path/to/apps/mcp-servers/paralegal-agent/dist/index.js"],
      "env": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_SERVICE_KEY": "your-service-key"
      }
    }
  }
}
```

## Available Tools

### get_contract_template

Fetch base contract templates by type and jurisdiction.

```typescript
{
  document_type: 'MSA' | 'SOW' | 'CHANGE_ORDER' | 'NDA' | 'IP_ADDENDUM' | 'PAYMENT_POLICY',
  jurisdiction?: string,  // default: 'US-NV'
  risk_profile?: 'standard' | 'customer_friendly' | 'vendor_friendly'
}
```

### get_clauses

Retrieve reusable contract clauses by topic.

```typescript
{
  topic: 'IP_OWNERSHIP' | 'CONFIDENTIALITY' | 'LIABILITY' | 'PAYMENT_TERMS' | ...,
  risk_profile?: 'standard' | 'customer_friendly' | 'vendor_friendly',
  jurisdiction?: string,
  clause_key?: string
}
```

### get_playbook_rules

Get negotiation policy rules.

```typescript
{
  topic: string,
  jurisdiction?: string,
  rule_key?: string
}
```

### get_deal_context

Load deal intake data for contract population.

```typescript
{
  deal_id: string  // UUID
}
```

### compare_contracts

Diff two contract versions with risk analysis.

```typescript
{
  base_document_id: string,  // UUID
  comparison_document_id: string  // UUID
}
```

### save_contract_draft

Save or update a contract draft.

```typescript
{
  deal_id?: string,
  contract_id?: string,  // For updates
  document_type: 'MSA' | 'SOW' | ...,
  title?: string,
  content: {
    sections: [...],
    variables: {...}
  },
  risk_profile?: string,
  jurisdiction?: string
}
```

## Database Schema

The agent uses the following tables:

- `deals` - Client engagement intake data
- `contracts` - Generated contract documents
- `contract_versions` - Version history
- `clause_library` - Reusable clauses
- `playbook_rules` - Negotiation policies
- `contract_templates` - Base templates

See `supabase/migrations/0025_paralegal_contract_tables.sql` for full schema.

## Development

```bash
# Run in development mode (with hot reload)
npm run dev

# Type check
npm run typecheck

# Run tests
npm test

# Build for production
npm run build
```

## Directory Structure

```
paralegal-agent/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── lib/
│   │   └── supabase.ts       # Database client
│   ├── tools/
│   │   ├── template-library.ts
│   │   ├── clause-library.ts
│   │   ├── playbook.ts
│   │   ├── deal-context.ts
│   │   ├── diff-engine.ts
│   │   └── document-save.ts
│   ├── types/
│   │   ├── contracts.ts
│   │   └── enums.ts
│   └── prompts/
│       └── system-prompt.ts
├── data/
│   ├── templates/            # Base contract templates
│   ├── clauses/             # Clause library files
│   └── playbook/            # Negotiation rules
├── scripts/
│   └── seed-data.ts         # Database seeder
└── package.json
```

## Legal Disclaimer

This tool generates contract drafts for efficiency and consistency. **It is not a substitute for legal advice.** All generated documents should be reviewed by a licensed attorney before execution.
