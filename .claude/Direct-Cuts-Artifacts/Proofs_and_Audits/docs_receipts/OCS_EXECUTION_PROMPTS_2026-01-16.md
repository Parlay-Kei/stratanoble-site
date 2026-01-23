# OCS Execution Prompts - Phase 1 Deployment
**Date**: 2026-01-16
**Purpose**: Pasteable prompts for different OCS agents to execute deployment tasks

## 1. Platform Ops - Database Migration & Receipts

### OCS Prompt (Copy & Paste)
```
Apply 20260116000001_barber_subscription_guest_rewards.sql to staging first, then production.

Capture proof artifacts:
- migration applied output
- schema snapshot queries (tables, functions, triggers, policies)
- RLS behavior checks for anon/authed/service role

Produce DB_RECEIPTS_2026-01-16.md with exact SQL run + outputs.

Receipt queries to include:
select table_name from information_schema.tables where table_schema='public' and table_name in ('barber_subscriptions','guest_identities','reward_accounts','reward_transactions');
select proname from pg_proc join pg_namespace on pg_proc.pronamespace = pg_namespace.oid where nspname='public' and proname in ('can_barber_accept_bookings','merge_guest_rewards_to_member','award_rewards_on_completion','enforce_barber_subscription_gating');
select tgname as trigger_name, pg_proc.proname as function_name from pg_trigger join pg_proc on pg_trigger.tgfoid = pg_proc.oid join pg_class on pg_trigger.tgrelid = pg_class.oid where pg_class.relname = 'appointments' and not pg_trigger.tgisinternal;
select schemaname, tablename, policyname, roles, cmd from pg_policies where schemaname='public' and tablename in ('barber_subscriptions','guest_identities','reward_accounts','reward_transactions');
```

### Expected Actions
1. Connect to staging database
2. Run migration file
3. Execute all validation queries
4. Capture outputs
5. Repeat for production
6. Update DB_RECEIPTS_2026-01-16.md with results

### Success Criteria
- All 4 tables created
- All 4 functions exist
- Trigger on appointments table active
- RLS policies in place
- No errors during migration

---

## 2. Release Ops - Edge Function Deployment & Environment

### OCS Prompt (Copy & Paste)
```
Deploy edge functions:
- barber-subscription-service
- updated stripe-webhook
- verification delivery endpoints (Twilio/Resend)

Validate required env vars exist in the target environment:
- STRIPE_SECRET_KEY
- STRIPE_BARBER_SUBSCRIPTION_PRICE_ID
- STRIPE_WEBHOOK_SECRET
- SUPABASE_SERVICE_ROLE_KEY
- one of: TWILIO_* or RESEND_API_KEY

Produce DEPLOY_RECEIPTS_2026-01-16.md including:
- function deploy versions/hashes
- env var presence checks (names only, no values)
- a webhook dry-run / signature verification proof
```

### Expected Actions
1. Deploy functions to staging:
   ```bash
   supabase functions deploy barber-subscription-service --project-ref [STAGING_REF]
   supabase functions deploy stripe-webhook --project-ref [STAGING_REF]
   ```
2. Check environment variables:
   ```bash
   supabase secrets list --project-ref [STAGING_REF]
   ```
3. Test webhook signature:
   ```bash
   curl -X POST https://[STAGING_REF].supabase.co/functions/v1/stripe-webhook \
     -H "stripe-signature: test_invalid" \
     -H "Content-Type: application/json" \
     -d '{"type":"test"}'
   ```
4. Record deployment hashes
5. Repeat for production
6. Update DEPLOY_RECEIPTS_2026-01-16.md

### Success Criteria
- Functions deployed and accessible
- All required env vars present
- Webhook returns 400 for invalid signature
- No deployment errors

---

## 3. QA Gatekeeper - E2E Testing & Proof Pack

### OCS Prompt (Copy & Paste)
```
Run E2E suite for Phase 1:
- guest booking + verification
- unsubscribed barber gating (API must return blocked)
- complete appointment => rewards earned
- guest -> member signup => rewards merge idempotent

Output a proof pack folder:
- screenshots for each step
- API logs (redacted)
- DB diff snapshots for rewards before/after merge

Fail the gate if any of:
- booking can be created for non-entitled barber
- rewards double-credit under retry
- webhook events not deduped
```

### Expected Actions
1. Set up test data:
   ```javascript
   // Create test barbers
   const subscribedBarber = await createBarber({ hasSubscription: true });
   const unsubscribedBarber = await createBarber({ hasSubscription: false });

   // Create test guest
   const guest = await createGuestIdentity({
     phone: '+1234567890',
     email: 'test@example.com'
   });
   ```

2. Execute test scenarios:
   ```javascript
   // Test 1: Guest booking
   const booking = await bookAsGuest(subscribedBarber.id, guestDetails);
   assert(booking.guest_identity_id);

   // Test 2: Subscription gate
   try {
     await bookAsGuest(unsubscribedBarber.id, guestDetails);
     assert.fail('Should have blocked booking');
   } catch (e) {
     assert(e.status === 403);
   }

   // Test 3: Rewards on completion
   const beforeBalance = await getRewardsBalance(guest.id);
   await completeAppointment(booking.id);
   const afterBalance = await getRewardsBalance(guest.id);
   assert(afterBalance > beforeBalance);

   // Test 4: Guest to member merge
   const member = await signUpGuest(guest);
   const memberRewards = await getRewardsBalance(member.id);
   assert(memberRewards === afterBalance);
   ```

3. Capture artifacts:
   - Screenshots at each step
   - API request/response logs
   - Database snapshots

4. Generate proof pack structure:
   ```
   qa-proof-pack-2026-01-16/
   ├── screenshots/
   ├── api-logs/
   ├── database-snapshots/
   └── test-results/
   ```

5. Update QA_PROOF_PACK_2026-01-16.md

### Success Criteria
- All happy path tests pass
- All gate criteria met
- No critical failures
- Artifacts properly captured

---

## 4. Combined Execution (All Three Roles)

### Master OCS Prompt (If Running All)
```
Execute Phase 1 deployment in sequence:

1. PLATFORM OPS: Apply migration 20260116000001_barber_subscription_guest_rewards.sql to staging, validate schema (tables, functions, triggers, RLS), then production.

2. RELEASE OPS: Deploy functions (barber-subscription-service, stripe-webhook) to staging, validate env vars (STRIPE_*, SUPABASE_SERVICE_ROLE_KEY, TWILIO_* or RESEND_*), test webhook signature, then production.

3. QA GATEKEEPER: Run E2E tests for guest booking, subscription gating, rewards earning, guest-to-member merge. Capture screenshots, logs, DB diffs.

Create three receipt files:
- DB_RECEIPTS_2026-01-16.md (migration outputs)
- DEPLOY_RECEIPTS_2026-01-16.md (deployment hashes, env validation)
- QA_PROOF_PACK_2026-01-16.md (test results, artifacts)

GATE: Block production if any critical failure:
- Booking allowed for unsubscribed barber
- Rewards double-credited
- Webhook events not deduped
```

---

## Staging Environment Requirements

To execute these prompts, provide:
1. Staging Supabase project reference ID
2. Staging Supabase URL
3. Staging database connection string (if direct SQL needed)
4. Confirmation that Stripe test keys are configured
5. Confirmation that Twilio or Resend test keys are configured

## Production Environment Requirements

After staging validation:
1. Production Supabase project reference ID
2. Production Supabase URL
3. Confirmation that Stripe live keys are configured
4. Confirmation that Twilio or Resend production keys are configured
5. Approval from product owner

## Rollback Commands

If issues occur:
```bash
# Rollback database
supabase db reset --project-ref [PROJECT_REF]

# Rollback functions
git checkout HEAD~1 -- supabase/functions/
supabase functions deploy --project-ref [PROJECT_REF]

# Remove problem tables (emergency)
DROP TABLE reward_transactions CASCADE;
DROP TABLE reward_accounts CASCADE;
DROP TABLE guest_identities CASCADE;
DROP TABLE barber_subscriptions CASCADE;
```

## Contact for Issues
- Platform Ops: #platform-ops channel
- Release Ops: #deployments channel
- QA: #qa-gate channel
- Escalation: Engineering Lead