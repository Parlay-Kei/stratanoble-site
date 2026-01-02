# How to Get Netlify Error Logs for Intake 500s

**Goal**: Get the exact error message from Netlify to diagnose the intake route 500s.

---

## Method 1: Function Logs (Recommended)

1. **Open Netlify Dashboard**
   - Go to: https://app.netlify.com/sites/stratanoble
   - Navigate to: **Site → Functions**

2. **Find the Server Handler**
   - Look for: `___netlify-server-handler`
   - Click on it

3. **View Logs**
   - Click **"Logs"** tab
   - Filter by: `/api/intake/lead-leak-check` (if filter available)
   - OR: Scroll to recent errors (should show HTTP 500)

4. **Copy Error Lines**
   - Find the error stack trace (usually 10-20 lines)
   - Copy the full error message including:
     - Error type (e.g., `PrismaClientKnownRequestError`)
     - Error code (e.g., `P2025`, `P1001`)
     - Error message (e.g., `relation "LeadIntake" does not exist`)
     - Stack trace (first few lines)

---

## Method 2: Deploy Logs

1. **Open Netlify Dashboard**
   - Go to: https://app.netlify.com/sites/stratanoble
   - Navigate to: **Deploys**

2. **Find Latest Deploy**
   - Click on the most recent production deploy

3. **View Function Logs**
   - Scroll to **"Functions"** section
   - Look for errors related to `/api/intake/lead-leak-check`
   - OR: Use browser search (Ctrl+F) for "lead-leak-check" or "500"

4. **Copy Error**
   - Copy the error message and stack trace

---

## Method 3: Real-time Logs (If Available)

1. **Netlify Dashboard → Site → Functions**
2. **Click on `___netlify-server-handler`**
3. **Click "Real-time logs"** (if available)
4. **Trigger the error** by submitting the intake form
5. **Watch for the error** in real-time

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
