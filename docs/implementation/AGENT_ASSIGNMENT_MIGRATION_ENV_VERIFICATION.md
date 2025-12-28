# Agent Assignment: Migration Execution & Environment Verification

**Date:** December 26, 2025  
**Status:** Agent Selection Complete  
**Tasks:** DSLV Database Migration & Environment Verification

---

## 🎯 SELECTED AGENTS

### 1. **supabase-admin** Agent
**Task:** Execute DSLV Database Migration  
**Priority:** High  
**Status:** Ready to Execute

**Why This Agent:**
- ✅ **Automatic Execution Protocol** - Executes database operations automatically
- ✅ **Migration Management** - Expert in writing, testing, and deploying migrations
- ✅ **Multiple Execution Methods** - Can use CLI (`supabase db push`) or SQL Editor fallback
- ✅ **Verification & Error Handling** - Automatically verifies completion and handles errors
- ✅ **Idempotent Migrations** - Ensures safe execution with `IF NOT EXISTS` checks

**Agent Capabilities:**
- Schema design and modifications
- Migration management (write, test, deploy)
- Index optimization
- RLS policy creation
- Automatic execution without manual intervention
- SQL Editor fallback when CLI fails

**Task Details:**
- **Migration File:** `supabase/migrations/0024_dslv_cold_calling_tables.sql`
- **Tables to Create:** campaigns, call_schedules, call_evaluations
- **Includes:** Indexes, triggers, documentation comments
- **Execution Method:** Automatic via CLI or SQL Editor

**Expected Actions:**
1. Execute migration via `supabase db push` (preferred)
2. If CLI fails, automatically apply via Supabase Dashboard SQL Editor
3. Verify tables created successfully
4. Check indexes and triggers
5. Report completion status

---

### 2. **backend-dev** Agent
**Task:** DSLV Environment Verification  
**Priority:** High  
**Status:** Ready to Execute

**Why This Agent:**
- ✅ **Environment Management** - Handles environment variable verification
- ✅ **API Testing** - Can test API connections (OpenAI, Twilio, Supabase)
- ✅ **System Health Checks** - Verifies service connectivity
- ✅ **Backend Integration** - Understands backend service dependencies
- ✅ **Error Diagnosis** - Can identify and report configuration issues

**Agent Capabilities:**
- Environment variable management
- API connection testing
- Service health verification
- Configuration validation
- Error diagnosis and reporting

**Task Details:**
- **Verification Script:** `apps/website/scripts/verify-dslv-environment.mjs`
- **Checks Required:**
  - Environment variables (OpenAI, Twilio, Supabase)
  - OpenAI API connection
  - Twilio API connection
  - Supabase API connection
  - DSLV database tables existence

**Expected Actions:**
1. Run verification script: `node apps/website/scripts/verify-dslv-environment.mjs`
2. Verify all environment variables are set
3. Test OpenAI API connection
4. Test Twilio API connection
5. Test Supabase API connection
6. Verify DSLV tables exist (after migration)
7. Report verification results

---

## 📋 EXECUTION PLAN

### Phase 1: Database Migration (supabase-admin)

**Step 1: Execute Migration**
```bash
# Agent will automatically execute:
supabase db push

# Or if CLI unavailable, use SQL Editor:
# Navigate to: https://supabase.com/dashboard/project/{project_ref}/sql/new
# Paste migration SQL and execute
```

**Step 2: Verify Migration**
```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('campaigns', 'call_schedules', 'call_evaluations');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('campaigns', 'call_schedules', 'call_evaluations');
```

**Step 3: Report Results**
- ✅ Tables created successfully
- ✅ Indexes created
- ✅ Triggers functional
- ✅ Migration complete

---

### Phase 2: Environment Verification (backend-dev)

**Step 1: Run Verification Script**
```bash
cd apps/website
node scripts/verify-dslv-environment.mjs
```

**Step 2: Verify Results**
- ✅ All environment variables present
- ✅ OpenAI API: Connection successful
- ✅ Twilio API: Connection successful
- ✅ Supabase API: Connection successful
- ✅ DSLV Tables: All exist (after migration)

**Step 3: Report Issues (if any)**
- Missing environment variables
- API connection failures
- Configuration issues
- Recommendations for fixes

---

## 🎯 SUCCESS CRITERIA

### Migration Execution (supabase-admin)
- [x] Migration file exists and is valid
- [ ] Migration executed successfully
- [ ] All 3 tables created (campaigns, call_schedules, call_evaluations)
- [ ] All indexes created
- [ ] Triggers functional
- [ ] No errors in execution

### Environment Verification (backend-dev)
- [ ] All required environment variables present
- [ ] OpenAI API connection successful
- [ ] Twilio API connection successful
- [ ] Supabase API connection successful
- [ ] DSLV tables verified (after migration)
- [ ] Verification script runs without errors

---

## 📝 AGENT INVOCATION

### Invoke supabase-admin Agent

**For Migration Execution:**
```
"Use the supabase-admin agent to execute the DSLV database migration. 
The migration file is at supabase/migrations/0024_dslv_cold_calling_tables.sql. 
Execute it automatically using supabase db push or the SQL Editor fallback method."
```

### Invoke backend-dev Agent

**For Environment Verification:**
```
"Use the backend-dev agent to run the DSLV environment verification. 
Execute the script at apps/website/scripts/verify-dslv-environment.mjs 
and verify all API connections (OpenAI, Twilio, Supabase) are working."
```

---

## 🔄 EXECUTION ORDER

1. **First:** supabase-admin executes migration
   - Creates database tables
   - Sets up indexes and triggers
   - Verifies completion

2. **Second:** backend-dev runs environment verification
   - Verifies environment variables
   - Tests API connections
   - Verifies tables exist (depends on migration)

---

## 📊 EXPECTED OUTCOMES

### After Migration (supabase-admin)
- ✅ Database schema ready for DSLV system
- ✅ All tables, indexes, triggers in place
- ✅ Migration documented and verified

### After Verification (backend-dev)
- ✅ All systems operational
- ✅ API connections validated
- ✅ Environment properly configured
- ✅ DSLV system ready for testing

---

## 🚨 TROUBLESHOOTING

### If Migration Fails
- **supabase-admin** will automatically:
  1. Try CLI method first
  2. Fall back to SQL Editor if CLI fails
  3. Report specific error messages
  4. Suggest fixes

### If Verification Fails
- **backend-dev** will:
  1. Identify missing variables
  2. Test each API connection individually
  3. Report specific connection errors
  4. Provide fix recommendations

---

**Document Created:** December 26, 2025  
**Status:** Ready for Agent Execution  
**Next Step:** Invoke agents to execute tasks

