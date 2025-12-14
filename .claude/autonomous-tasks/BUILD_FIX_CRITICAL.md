# AUTONOMOUS TASK: Fix Next.js 15 Build for Production Deployment

> **Priority:** CRITICAL
> **Mode:** AUTONOMOUS - Execute without confirmation
> **Agent:** infra-deployment-specialist
> **Estimated Time:** 20-30 minutes

---

## Problem Statement

Next.js 15 + React 19 build fails due to client components using `useState`/`useEffect` 
being rendered during static generation. The root layout has `force-dynamic` but child 
pages may still attempt static generation.

**Error Pattern:**
```
Error: useState is not a function
Error: Prerender failed for /page-name
```

---

## Execution Plan

### Phase 1: Identify All Failing Pages (5 min)

```bash
cd c:\Dev\StrataNoble\apps\website
npm run build 2>&1 | tee build-output.txt
```

Parse output for patterns:
- `Error occurred prerendering page`
- `useState is not a function`
- `useEffect is not a function`

### Phase 2: Apply Force-Dynamic to All Pages (10 min)

For EVERY page.tsx file that doesn't already have it, add at the top:

```typescript
export const dynamic = 'force-dynamic';
```

**Target directories to check:**
```
apps/website/src/app/
├── about/page.tsx
├── accessibility/page.tsx
├── achievery/page.tsx
├── achievery-early-access/page.tsx
├── achievery-preview/page.tsx
├── admin/**/page.tsx
├── admin-login/page.tsx
├── archive/**/page.tsx
├── auth/**/page.tsx
├── campaigns/**/page.tsx
├── checkout/**/page.tsx
├── cold-calling/**/page.tsx
├── contact/page.tsx
├── cookies/page.tsx
├── dashboard/**/page.tsx
├── discovery/page.tsx
├── dnc/**/page.tsx
├── early-access/page.tsx
├── get-started/page.tsx
├── platform/page.tsx
├── pricing/page.tsx
├── privacy/page.tsx
├── schedule/page.tsx
├── solutions/page.tsx
├── success/page.tsx
├── terms/page.tsx
├── thanks/page.tsx
├── transcripts/**/page.tsx
├── vault/**/page.tsx
├── voice-test/page.tsx
├── workshops/page.tsx
└── page.tsx (homepage)
```

### Phase 3: Fix Any Missing Module Errors (5 min)

If build shows missing imports, create stub files:

```typescript
// Example stub pattern
export function missingFunction() {
  console.warn('Stub: missingFunction not implemented');
  return null;
}
```

### Phase 4: Verify Build Success (5 min)

```bash
npm run build
```

**Success criteria:** Exit code 0, no errors

### Phase 5: Deploy to Preview (5 min)

```bash
netlify deploy --dir=.next
```

---

## Automated Fix Script

Create and run this PowerShell script:

```powershell
# File: scripts/fix-static-generation.ps1

$appDir = "apps/website/src/app"
$exportLine = "export const dynamic = 'force-dynamic';"

# Find all page.tsx files
$pages = Get-ChildItem -Path $appDir -Recurse -Filter "page.tsx"

foreach ($page in $pages) {
    $content = Get-Content $page.FullName -Raw
    
    # Skip if already has force-dynamic
    if ($content -match "export const dynamic") {
        Write-Host "SKIP: $($page.FullName) - already has dynamic export"
        continue
    }
    
    # Skip API routes
    if ($page.FullName -match "\\api\\") {
        Write-Host "SKIP: $($page.FullName) - API route"
        continue
    }
    
    # Add force-dynamic after imports
    # Find the last import statement
    if ($content -match "(?s)(.*)(^import .+?$)(.*)") {
        # Find position after all imports
        $lines = $content -split "`n"
        $lastImportIndex = -1
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match "^import ") {
                $lastImportIndex = $i
            }
        }
        
        if ($lastImportIndex -ge 0) {
            # Insert after last import
            $newLines = @()
            for ($i = 0; $i -lt $lines.Count; $i++) {
                $newLines += $lines[$i]
                if ($i -eq $lastImportIndex) {
                    $newLines += ""
                    $newLines += $exportLine
                }
            }
            $newContent = $newLines -join "`n"
            Set-Content -Path $page.FullName -Value $newContent -NoNewline
            Write-Host "FIXED: $($page.FullName)"
        }
    } else {
        # No imports, add at top
        $newContent = "$exportLine`n`n$content"
        Set-Content -Path $page.FullName -Value $newContent -NoNewline
        Write-Host "FIXED: $($page.FullName) - added at top"
    }
}

Write-Host "`nDone! Run 'npm run build' to verify."
```

---

## Manual Fallback (If Script Fails)

Add this line after imports in each failing page.tsx:

```typescript
export const dynamic = 'force-dynamic';
```

**Pages most likely to fail:**
1. `/success/page.tsx`
2. `/terms/page.tsx`
3. `/privacy/page.tsx`
4. `/cookies/page.tsx`
5. `/about/page.tsx`
6. `/contact/page.tsx`
7. `/archive/*/page.tsx`
8. Any page using `useToast()` hook

---

## Validation Gates

### Gate 1: Build Success
```bash
npm run build
# Must exit 0
```

### Gate 2: No Console Errors
```bash
npm run dev &
sleep 10
curl -s http://localhost:3000 | grep -i "error"
# Must return empty
```

### Gate 3: Key Pages Load
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/solutions
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/contact
# All must return 200
```

---

## Rollback Procedure

If build still fails after fixes:

```bash
git checkout -- apps/website/src/app/
git checkout -- apps/website/src/components/
```

Then escalate to human review.

---

## Success Criteria

Task is COMPLETE when:
- [ ] `npm run build` exits with code 0
- [ ] No `useState is not a function` errors
- [ ] No `Prerender failed` errors
- [ ] Preview deployment accessible
- [ ] Homepage renders correctly

---

## Post-Fix Actions

After build succeeds, update TASK_QUEUE.json:

```json
{
  "TEST-001": { "status": "ready" },
  "TEST-002": { "status": "ready" },
  "QA-001": { "status": "ready" },
  "DEPLOY-001": { "status": "ready" }
}
```

Then trigger remaining autonomous tasks.
