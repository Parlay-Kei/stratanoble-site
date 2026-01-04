# How to Get Netlify Error Logs for Intake 500s

**Goal**: Get the exact error message from Netlify to diagnose the intake route 500s.

---

## Method 1: Functions Logs (Recommended - YOU ARE HERE)

1. **You're already in the right place!**
   - You're in: **Logs & metrics → Functions**

2. **Click on "Next.js Server Handler"**
   - You should see it listed with a "System" tag
   - Click on it (or the chevron arrow on the right)

3. **Enable Real-time Logs (If Empty)**
   - If logs area is empty, click the **"Real-time"** dropdown button
   - Enable real-time logging to see live errors
   - OR: Check time range filter (should include last 24 hours)

4. **Trigger a Fresh Error**
   - Go to: `https://stratanoble.com` and submit the Lead Leak Check form
   - This will generate a new error that should appear in real-time logs
   - Watch the logs area for the error to appear

5. **View Function Logs**
   - Look for entries with **red error indicators** or **"ERROR"** log level
   - The metrics you see (Duration, Memory Usage) are NOT the errors - scroll past those
   - Look for entries that show:
     - Error messages (not just metrics)
     - Stack traces
     - Prisma errors
   - OR: Use the search bar to filter by "lead-leak-check", "500", "error", "Prisma", or "Exception"
   - Look for timestamps matching when you submitted the form

6. **What You're Looking For**
   - ❌ **NOT these**: `Duration: 21.06 ms Memory Usage: 335 MB` (these are metrics)
   - ✅ **YES these**: Error messages like `PrismaClientKnownRequestError`, `relation "LeadIntake" does not exist`, stack traces

7. **If You Only See Metrics**
   - The error might be in a different log entry
   - Click on individual log entries to expand them
   - OR: Trigger a fresh error (submit form) and watch for it in real-time
   - OR: Try Method 3 (Deploy Logs) instead

8. **Copy Error Lines**
   - Find the error stack trace (usually 10-20 lines)
   - Copy the full error message including:
     - Error type (e.g., `PrismaClientKnownRequestError`)
     - Error code (e.g., `P2025`, `P1001`)
     - Error message (e.g., `relation "LeadIntake" does not exist`)
     - Stack trace (first few lines)

---

## Method 2: Observability Card (Quick Check)

1. **Open Netlify Dashboard**
   - Go to: https://app.netlify.com/sites/stratanoble
   - Look at the **"Observability"** card on the Project overview page

2. **Check Error Rate**
   - Should show "Errors" percentage (you mentioned seeing 18.27%)
   - Click on the error count or "View logs" link

3. **Filter to Intake Errors**
   - Use browser search (Ctrl+F) for "lead-leak-check" or "500"
   - OR: Filter by path `/api/intake/`

---

## Method 3: Deploy Logs (Alternative if Function Logs Empty)

1. **Open Netlify Dashboard**
   - Go to: https://app.netlify.com/sites/stratanoble
   - Click: **"Deploys"** in the left sidebar

2. **Find Latest Deploy**
   - Click on the most recent production deploy (the one that's published)
   - Look for deploy with commit `01f1492` or newer

3. **View Runtime Logs**
   - Scroll through the deploy logs
   - Look for **runtime errors** (not build errors)
   - Function errors appear after the build completes
   - Use browser search (Ctrl+F) for "lead-leak-check", "500", "error", or "Prisma"

4. **Copy Error**
   - Copy the error message and stack trace (10-20 lines)

**Note**: Deploy logs show errors that occurred during that specific deploy's runtime, not all production errors. For current production errors, use Method 1 (Function logs) with real-time enabled.

---

## What to Look For

### Prisma Database Errors

**Table Missing**:
```
PrismaClientKnownRequestError: 
Invalid `prisma.leadIntake.findUnique()` invocation
...
relation "LeadIntake" does not exist
```

**Connection Error**:
```
PrismaClientInitializationError:
Can't reach database server at `xxx`
P1001: Can't reach database server
```

**Timeout**:
```
P1017: Server has closed the connection
```

### SES/Email Errors

```
AWS SES error: AccessDenied
Missing region
Invalid "From" address
```

### JSON Parsing Errors

```
SyntaxError: Unexpected end of JSON input
TypeError: Cannot read property 'email' of undefined
```

---

## What to Copy

**Copy 10-20 lines** that include:
1. Error type/name
2. Error code (if Prisma: P1001, P2025, etc.)
3. Error message (the actual problem)
4. First 5-10 lines of stack trace

**Example of what we need**:
```
PrismaClientKnownRequestError: 
Invalid `prisma.leadIntake.findUnique()` invocation in
/api/intake/lead-leak-check/route.ts:90:30

  88 const result = await prisma.$transaction(async (tx) => {
  89   const existing = await tx.leadIntake.findUnique({
→ 90     where: { idempotencyKey },
       })

Unknown arg `idempotencyKey` in where clause for LeadIntake.findUnique.
Available args are marked with ?.
```

---

## Next Steps After Getting Logs

1. **Paste the error here** in `docs/INTAKE_500_DIAGNOSIS.md`
2. **Diagnosis will be provided** based on actual error
3. **Fix will be applied** (migration, env var, or code fix)
4. **Re-test** to confirm fix works
