# Release Notes: Barber Launch Mode + P0 Stability Gates

## What Changed

### Barber Launch Mode Guardrails
- Portfolio uploads become optional when `VITE_LAUNCH_MODE_BARBER=1`
- Stripe connection failures show non-blocking messages
- Onboarding progression cannot be blocked by upload/payment issues

### Media Pipeline Stabilization
- All storage operations use `auth.uid()` for RLS compliance
- Canonical identity prevents barberId/userId mismatches

### Admin Debug Panel
- Build fingerprint shows commit SHA, Supabase ref, Launch Mode status
- Eliminates "deployed but not deployed" confusion

### Automated Gates
- `gate-barber-portfolio-upload`: validates portfolio flow with receipts
- `gate-stripe-functions-reachable`: validates Stripe function reachability

## CRITICAL: Launch Mode is Build-Time Only

⚠️ **IMPORTANT**: `VITE_LAUNCH_MODE_BARBER=1` is baked into the bundle at build time.

- ✅ Set env var → redeploy → Launch Mode enabled
- ❌ Set env var without redeploy → nothing happens

**Why**: Vite processes `import.meta.env.VITE_*` at build time, not runtime.

**Runtime toggles**: For live toggles later, use remote config (Supabase table, Edge Config, etc).

## Release Strategy

### Phase 1: Launch Mode ON
1. Deploy with `VITE_LAUNCH_MODE_BARBER=1`
2. Barbers can complete onboarding even if uploads fail
3. App feels intentional, not broken

### Phase 2: Enable Stripe
1. Validate gate receipts show Stripe functions reachable
2. Deploy with Stripe UI enabled
3. Keep fallback messaging for edge cases

## Environment Requirements

### Production
```bash
VITE_LAUNCH_MODE_BARBER=1
VITE_SUPABASE_URL=https://dskpfnjbgocieoqyiznf.supabase.co
```

### CORS Support
- Production: strict allowlist (`app.direct-cuts.com` only)
- Non-prod: allows `*.vercel.app` preview domains + localhost

## Proof Requirements

### 1. Prod Build Fingerprint Receipt
Admin debug panel shows:
- Commit SHA containing these changes
- Correct Supabase project ref
- Launch Mode: ON

### 2. QAG Gate Receipts
Both gates pass and produce artifacts:
- `gate-barber-portfolio-upload.spec.ts`
- `gate-stripe-functions-reachable.spec.ts`

### 3. Data Receipts
- Barber completes onboarding despite upload/Stripe failures
- Portfolio images persist after refresh when upload succeeds
- Storage objects + DB rows exist

## Known Limitations

1. **Flag Toggle**: Requires redeploy to change Launch Mode
2. **Preview Domains**: CORS now supports Vercel previews
3. **Blob URL Revocation**: Gates may fail if blob URLs revoked early

## Rollback Plan

1. Set `VITE_LAUNCH_MODE_BARBER=0` or remove var
2. Redeploy
3. Normal validation requirements return