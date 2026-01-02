# How to Get Netlify Error Logs for Intake 500s

**Goal**: Get the exact error message from Netlify to diagnose the intake route 500s.

---

## Method 1: Logs & Metrics (Recommended)

1. **Open Netlify Dashboard**
   - Go to: https://app.netlify.com/sites/stratanoble
   - Click: **"Logs & metrics"** in the left sidebar

2. **View Function Logs**
   - Look for **"Function logs"** or **"Serverless function logs"** section
   - Filter by: `/api/intake/lead-leak-check` (if filter available)
   - OR: Scroll to recent errors (should show HTTP 500)
   - Look for timestamps matching when you submitted the form

3. **Copy Error Lines**
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

## Method 3: Deploy Logs

1. **Open Netlify Dashboard**
   - Go to: https://app.netlify.com/sites/stratanoble
   - Click: **"Deploys"** in the left sidebar

2. **Find Latest Deploy**
   - Click on the most recent production deploy (the one that's published)

3. **View Build/Function Logs**
   - Scroll through the deploy logs
   - Look for runtime errors (not build errors)
   - Use browser search (Ctrl+F) for "lead-leak-check", "500", or "error"

4. **Copy Error**
   - Copy the error message and stack trace

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
