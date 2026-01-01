# Agent Capability Gap Analysis

**Analysis Date:** December 19, 2025  
**Scope:** `C:\Dev\.claude\agents\*` (root-level shared agents)

---

## Summary

After reviewing all 7 agents, I identified the following capability gaps that prevent them from being "fully capable" of handling all tasks in their domain.

---

## 1. supabase-admin.md ⚠️ CRITICAL GAPS

### Gap 1.1: MCP Not Configured (FIXED)
- **Issue:** Agent assumes MCP authentication exists, but no project has it configured
- **Impact:** Agent cannot execute database operations via MCP
- **Status:** ✅ Created `mcp-supabase-config.md` with setup instructions
- **Status:** ✅ Updated agent with fallback protocol

### Gap 1.2: No Automatic CLI Fallback
- **Issue:** When MCP fails, agent should automatically use Supabase CLI
- **Fix Required:** Add decision tree that routes to CLI when MCP unavailable

### Gap 1.3: Missing Project-Ref Mapping
- **Issue:** No mapping of which project-ref belongs to which project
- **Fix Required:** Add configuration file or environment variable lookup

### Gap 1.4: No Type Generation Automation
- **Issue:** Agent describes type generation but doesn't automatically run it after schema changes
- **Fix Required:** Add automatic `supabase gen types typescript` after migrations

---

## 2. backend-dev.md ⚠️ MODERATE GAPS

### Gap 2.1: No API Testing Protocol
- **Issue:** Agent describes building APIs but no automated testing workflow
- **Fix Required:** Add integration with testing frameworks (Vitest, Jest)

### Gap 2.2: No OpenAPI/Swagger Generation
- **Issue:** Agent doesn't automatically generate API documentation
- **Fix Required:** Add automatic OpenAPI spec generation from routes

### Gap 2.3: Missing Webhook Signature Verification Templates
- **Issue:** Agent mentions webhooks but no copy-paste templates for verification
- **Fix Required:** Add templates for Stripe, GitHub, Twilio webhook verification

---

## 3. frontend-dev.md ⚠️ MODERATE GAPS

### Gap 3.1: No Component Library Reference
- **Issue:** Agent doesn't know which components already exist in shadcn/ui
- **Fix Required:** Add quick reference of available shadcn components

### Gap 3.2: No Accessibility Checklist
- **Issue:** Agent mentions accessibility but no enforcement checklist
- **Fix Required:** Add WCAG 2.1 checklist for components

### Gap 3.3: Missing Mobile-First Templates
- **Issue:** Agent says "mobile-first" but no breakpoint templates
- **Fix Required:** Add Tailwind responsive templates

---

## 4. github-admin.md ✅ MOSTLY COMPLETE

### Gap 4.1: No GitHub Actions Self-Repair
- **Issue:** Agent can diagnose failures but doesn't automatically fix common issues
- **Fix Required:** Add auto-fix patterns for common CI failures

---

## 5. codebase-admin.md ✅ MOSTLY COMPLETE

### Gap 5.1: No Automated Cleanup Script
- **Issue:** Agent describes cleanup but doesn't auto-generate cleanup scripts
- **Fix Required:** Add script generation for identified issues

---

## 6. documentation-admin.md ✅ MOSTLY COMPLETE

### Gap 6.1: No Notion Integration
- **Issue:** Agent focuses on file-based docs but you use Notion extensively
- **Fix Required:** Add Notion MCP integration for documentation sync

---

## 7. project-orchestrator.md ⚠️ MODERATE GAPS

### Gap 7.1: No Inter-Agent Communication Protocol
- **Issue:** Agent describes dispatch but no message format for agent handoffs
- **Fix Required:** Add structured handoff message templates

### Gap 7.2: No Progress Tracking System
- **Issue:** Agent mentions STATUS.md but no automated status updates
- **Fix Required:** Add status file auto-generation

### Gap 7.3: No Blocker Detection
- **Issue:** Agent says it resolves blockers but no detection mechanism
- **Fix Required:** Add common blocker patterns and auto-resolution

---

## Priority Fixes

### P0 - Must Fix Now
1. **Supabase MCP configuration** - Create setup guide and update mcp.json files
2. **Supabase CLI fallback** - Agent must work without MCP

### P1 - Should Fix This Week
3. **Type generation automation** - Auto-run after migrations
4. **Inter-agent handoff protocol** - Structured messages

### P2 - Fix When Convenient
5. **API testing integration** - Backend dev
6. **Accessibility checklist** - Frontend dev
7. **Notion integration** - Documentation admin

---

## Recommended Next Steps

1. **Run setup:** Execute commands in `mcp-supabase-config.md` to configure MCP
2. **Test Supabase agent:** Ask it to "show all tables in Direct Cuts database"
3. **If MCP fails:** Agent should automatically fall back to CLI - verify this works
4. **Review other agents:** Apply similar robustness patterns

---

## Files Modified

| File | Change |
|------|--------|
| `C:\Dev\.claude\agents\supabase-admin.md` | Added authentication status check and fallback protocol |
| `C:\Dev\.claude\mcp-supabase-config.md` | Created new setup guide |
| `C:\Dev\.claude\AGENT_GAP_ANALYSIS.md` | This analysis document |
