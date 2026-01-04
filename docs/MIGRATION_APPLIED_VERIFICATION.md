# LeadIntake Migration Applied - Verification Steps

**Date**: January 2, 2026  
**Migration**: `0026_create_lead_intake_table.sql`  
**Status**: ✅ Applied via Supabase Dashboard

---

## ✅ Migration Applied

The `LeadIntake` table has been created in production database with:
- Enum types: `IntakeSource`, `IntakeStatus`
- Table: `LeadIntake` with all required columns
- Indexes: email, source, status, createdAt
- Unique constraint: idempotencyKey

---

## ⏳ Next Steps

### 1. Wait for New Deploy

A new production deploy has been triggered to regenerate the Prisma client. The Prisma client in the current production build was generated before the table existed, so it doesn't know about `LeadIntake`.

**Expected**: New deploy will run `prisma generate` which will include the `LeadIntake` model.

**Check**: Netlify dashboard for deploy completion (should be commit after `31b971b`).

---

### 2. Verify Table Exists (Optional)

Run in Supabase SQL Editor:
```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'LeadIntake'
ORDER BY ordinal_position;
```

Should return 11 rows (all columns).

---

### 3. Test Intake Route After Deploy

Once the new deploy completes:

**Test from browser:**
1. Go to: `https://stratanoble.com/lead-leak-check`
2. Fill out and submit the form
3. Should return HTTP 200 (not 500)

**Test with script:**
```powershell
.\scripts\test-rate-limiting.ps1
```

**Expected results:**
- ✅ Intake requests 1-10: HTTP 200
- ✅ Intake request 11: HTTP 429 (rate limited)
- ✅ Auth requests: HTTP 429 on attempt 6
- ✅ Benign endpoints: All HTTP 200

---

## 🔍 If Still Getting 500s After Deploy

### Check 1: Prisma Client Regenerated
- Verify deploy logs show `prisma generate` completed
- Check for any Prisma errors in build logs

### Check 2: Table Name Match
- Prisma model: `LeadIntake` (PascalCase)
- Database table: `"LeadIntake"` (quoted, preserving case)
- These should match - verify in Supabase

### Check 3: Column Names Match
- Verify column names in database match Prisma schema exactly
- Check for case sensitivity issues

### Check 4: Get Actual Error
- Use Netlify function logs to get the exact Prisma error
- See: `docs/HOW_TO_GET_NETLIFY_ERROR_LOGS.md`

---

## 📋 Verification Checklist

- [x] Migration SQL created and committed
- [x] Migration applied via Supabase dashboard
- [ ] New production deploy triggered
- [ ] Deploy completed successfully
- [ ] Prisma client regenerated (check build logs)
- [ ] Intake route tested (HTTP 200, not 500)
- [ ] Rate limiting tested (429 on request 11)
- [ ] Lead capture end-to-end verified (DB + email)

---

## 🎯 Success Criteria

**Migration is successful when:**
1. ✅ Table exists in database
2. ✅ Prisma client recognizes the table
3. ✅ Intake routes return HTTP 200 (not 500)
4. ✅ Rate limiting works (429 on request 11)
5. ✅ Leads are saved to database
6. ✅ SES notifications are sent

---

**Current Status**: Waiting for production deploy to complete and regenerate Prisma client.
