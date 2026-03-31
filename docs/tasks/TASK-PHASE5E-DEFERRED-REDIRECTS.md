# TASK: Phase 5E — Deferred Route Redirects & Deletions

**Branch:** `feature/site-revamp-phase-5-content` (append to existing Phase 5 branch)  
**Context:** Steve decided on the three deferred 4D routes: redirect all three and delete route dirs.

---

## Redirects to add in `next.config.js`

Add these three 301 permanent redirects to the `redirects()` array:

```js
{ source: '/resources', destination: '/tools', permanent: true },
{ source: '/studio', destination: '/proof', permanent: true },
{ source: '/early-access', destination: '/achievery-early-access', permanent: true },
```

## Route directories to delete

```
src/app/resources/page.tsx        → entire resources/ dir
src/app/studio/page.tsx           → entire studio/ dir
src/app/early-access/page.tsx     → entire early-access/ dir
```

## Orphaned page client to delete

After deleting `/early-access`, check if `EarlyAccessPageClient` has any other importers:
```bash
grep -rn "EarlyAccessPageClient" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```
- Expected: only `src/app/early-access/page.tsx` (being deleted) and the component definition itself.
- If clean → delete `src/components/pages/EarlyAccessPageClient.tsx`

## Validation
- `npm run build` exit 0
- `/resources` → 301 → `/tools`
- `/studio` → 301 → `/proof`
- `/early-access` → 301 → `/achievery-early-access`

## Commit
```bash
git commit -m "chore: redirect /resources → /tools, /studio → /proof, /early-access → /achievery-early-access; delete route dirs"
```
