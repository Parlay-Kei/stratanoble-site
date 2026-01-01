# Supabase MCP Configuration Guide

## Overview

Supabase provides a hosted MCP server that uses browser-based OAuth for authentication.

---

## Quick Setup

### Step 1: Add MCP Server via CLI

```bash
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=<PROJECT_REF>"
```

This creates/updates `.mcp.json` (note the dot prefix) which Claude Code CLI uses.

### Step 2: Authenticate

```bash
claude /mcp
```

Select "supabase" and complete browser OAuth.

---

## Project References

| Project | Ref | Command |
|---------|-----|---------|
| Direct-Cuts | `dskpfnjbgocieoqyiznf` | `claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=dskpfnjbgocieoqyiznf"` |

---

## Important: Two Config Files

| File | Used By |
|------|---------|
| `.mcp.json` | Claude Code CLI (`claude` command) |
| `mcp.json` | Cursor/other MCP clients |

The CLI command creates `.mcp.json`. If using Cursor, you may need both files.

---

## Verification

In Claude Code, ask:
- "List all tables in the database"
- "Show the profiles table schema"

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No MCP servers configured" | Run the `claude mcp add` command above |
| Auth expired | Run `claude /mcp` and re-authenticate |
| Wrong project | Check project_ref matches your Supabase project |
