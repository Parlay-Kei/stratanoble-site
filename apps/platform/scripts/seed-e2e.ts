// E2E Test Data Seeder
// Creates deterministic test accounts for E2E testing
// Safe to run repeatedly (idempotent)

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

type Phase = "explore" | "build" | "launch";

const URL = process.env.E2E_SUPABASE_URL!;
const SERVICE_KEY = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY!;

const COMPLETED_EMAIL = process.env.E2E_COMPLETED_EMAIL || "e2e.completed@achievery.test";
const COMPLETED_PASSWORD = process.env.E2E_COMPLETED_PASSWORD || "ChangeMe-Completed-123!";

const INCOMPLETE_EMAIL = process.env.E2E_INCOMPLETE_EMAIL || "e2e.incomplete@achievery.test";
const INCOMPLETE_PASSWORD = process.env.E2E_INCOMPLETE_PASSWORD || "ChangeMe-Incomplete-123!";

// SAFETY CHECKS
// In CI, missing secrets are not a hard failure: we want PRs from forks (or branches
// where the E2E Supabase project has not been provisioned yet) to surface a clear
// warning and skip cleanly rather than fail the whole workflow. The dedicated e2e
// workflow also guards the Playwright run on the same env var, so skipping here
// produces a no-op job that the merge button can ignore.
// To run the seeder locally, populate apps/platform/.env.e2e (see E2E_SEED_SETUP.md).
if (!URL || !SERVICE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[seed-e2e] Skipping: E2E_SUPABASE_URL or E2E_SUPABASE_SERVICE_ROLE_KEY not set. " +
      "If this is CI, configure GitHub Actions secrets per apps/platform/E2E_SEED_SETUP.md.",
  );
  process.exit(0);
}

// CRITICAL: Prevent running against production
// Allowlist E2E project refs only (add your E2E project ref here)
const ALLOWED_E2E_PROJECTS: string[] = [
  // Add your E2E project refs here, e.g.:
  // "abcdefghijklmnop",  // E2E project
  // "qrstuvwxyz123456",  // Staging E2E
];

// Extract project ref from URL (format: https://[ref].supabase.co)
const projectRefMatch = URL.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
const projectRef = projectRefMatch?.[1];

if (ALLOWED_E2E_PROJECTS.length === 0) {
  console.warn("⚠️  WARNING: No E2E project refs in allowlist - seed will run on ANY project!");
  console.warn("⚠️  Add your E2E project ref to ALLOWED_E2E_PROJECTS array to prevent accidents.");
} else if (!projectRef || !ALLOWED_E2E_PROJECTS.includes(projectRef)) {
  throw new Error(
    `🚨 SAFETY LOCK: This script can only run against allowlisted E2E projects.\n` +
    `Current project: ${projectRef || 'UNKNOWN'}\n` +
    `Allowed projects: ${ALLOWED_E2E_PROJECTS.join(', ')}\n` +
    `Update ALLOWED_E2E_PROJECTS in seed-e2e.ts to proceed.`
  );
}

// Verify service key is NOT exposed to client (must not have NEXT_PUBLIC_ prefix)
if (SERVICE_KEY.startsWith('NEXT_PUBLIC_')) {
  throw new Error("🚨 SECURITY: Service role key must NOT be prefixed with NEXT_PUBLIC_");
}

const supabase = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Find user by email across all pages
 * Admin API is paginated, so we need to scan
 */
async function findUserByEmail(email: string) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users ?? [];
    const found = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;

    if (users.length < perPage) return null;
    page += 1;
  }
}

/**
 * Ensure user exists with deterministic password
 * Updates password if user already exists
 */
async function ensureUser(email: string, password: string) {
  const existing = await findUserByEmail(email);

  if (existing?.id) {
    console.log(`  ✓ User exists: ${email} (${existing.id})`);
    // Keep password deterministic for CI and local runs
    const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (updateErr) throw updateErr;
    console.log(`  ✓ Password reset for: ${email}`);
    return existing.id;
  }

  console.log(`  + Creating user: ${email}`);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  if (!data.user?.id) throw new Error("createUser returned no user id");
  console.log(`  ✓ User created: ${email} (${data.user.id})`);
  return data.user.id;
}

/**
 * Upsert user profile (may be auto-created by trigger, but we ensure it exists)
 */
async function upsertUserProfile(
  userId: string,
  email: string,
  role: "user" | "admin" | "client" | "coach" = "user"
) {
  const { error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        id: userId,
        email,
        role,
        status: "active",
        full_name: null,
      },
      { onConflict: "id" }
    );
  if (error) throw error;
  console.log(`  ✓ Profile upserted for: ${email}`);
}

/**
 * Seed a completed user with onboarding done
 * This user can access /dashboard immediately
 */
async function seedCompletedUser(userId: string, email: string) {
  console.log(`\n📦 Seeding COMPLETED user: ${email}`);
  
  const phase: Phase = "build";
  const dreamText = "Build a repeatable income engine using structured systems and clear metrics.";
  const starterActions = [
    "Define the next 7-day outcome",
    "List the top 3 blockers",
    "Ship one measurable improvement today",
  ];

  // Set onboarding_completed = true
  const { error: settingsErr } = await supabase
    .from("user_platform_settings")
    .upsert(
      {
        user_id: userId,
        onboarding_completed: true,
        preferred_phase: phase,
        weekly_narrative_email: false,
        action_reminders: false,
        weekly_action_limit: 20,
      },
      { onConflict: "user_id" }
    );
  if (settingsErr) throw settingsErr;
  console.log(`  ✓ Platform settings: onboarding_completed = true`);

  // Hard delete all existing dreams (truly deterministic - no accumulation)
  const { error: deleteErr } = await supabase
    .from("user_dreams")
    .delete()
    .eq("user_id", userId);
  if (deleteErr) throw deleteErr;

  // Insert exactly one active dream
  const { error: insertErr } = await supabase.from("user_dreams").insert({
    user_id: userId,
    dream_text: dreamText,
    current_phase: phase,
    starter_actions: starterActions,
    is_active: true,
  });
  if (insertErr) throw insertErr;
  console.log(`  ✓ Active dream created (hard reset): "${dreamText.substring(0, 50)}..."`);

  await upsertUserProfile(userId, email, "user");
}

/**
 * Seed an incomplete user without onboarding
 * This user should be redirected to /onboarding
 */
async function seedIncompleteUser(userId: string, email: string) {
  console.log(`\n📦 Seeding INCOMPLETE user: ${email}`);
  
  // Remove any existing dreams
  const { error: dreamsErr } = await supabase.from("user_dreams").delete().eq("user_id", userId);
  if (dreamsErr) throw dreamsErr;
  console.log(`  ✓ Dreams cleared`);

  // Remove any existing settings (so onboarding is required)
  const { error: settingsErr } = await supabase.from("user_platform_settings").delete().eq("user_id", userId);
  if (settingsErr) throw settingsErr;
  console.log(`  ✓ Platform settings cleared`);

  await upsertUserProfile(userId, email, "user");
}

/**
 * Log seed run to database for audit trail
 */
async function logSeedRun(completedId: string, incompleteId: string) {
  const SEED_VERSION = "1.0.0"; // Increment when fixture schema changes
  const GIT_COMMIT = process.env.GITHUB_SHA || process.env.GIT_COMMIT || null;
  const ENVIRONMENT = process.env.CI ? 'ci' : 'local';

  try {
    const { error } = await supabase.from("e2e_seed_runs").insert({
      seed_version: SEED_VERSION,
      git_commit: GIT_COMMIT,
      completed_user_id: completedId,
      incomplete_user_id: incompleteId,
      environment: ENVIRONMENT,
      metadata: {
        completed_email: COMPLETED_EMAIL,
        incomplete_email: INCOMPLETE_EMAIL,
        project_ref: projectRef,
      }
    });

    if (error) {
      console.warn("⚠️  Could not log seed run (table may not exist):", error.message);
    } else {
      console.log(`  ✓ Seed run logged: v${SEED_VERSION} (${ENVIRONMENT})`);
    }
  } catch (err) {
    console.warn("⚠️  Could not log seed run:", err instanceof Error ? err.message : 'Unknown error');
  }
}

/**
 * Main seeder
 */
async function main() {
  const startTime = Date.now();
  
  console.log("\n🌱 E2E Test Data Seeder v1.0.0");
  console.log("═".repeat(50));
  console.log(`📍 Supabase URL: ${URL}`);
  console.log(`📧 Completed user: ${COMPLETED_EMAIL}`);
  console.log(`📧 Incomplete user: ${INCOMPLETE_EMAIL}`);
  console.log(`🏗️  Environment: ${process.env.CI ? 'CI' : 'Local'}`);
  if (process.env.GITHUB_SHA) {
    console.log(`📌 Commit: ${process.env.GITHUB_SHA.substring(0, 7)}`);
  }
  console.log("═".repeat(50));

  // Create/update users
  const completedId = await ensureUser(COMPLETED_EMAIL, COMPLETED_PASSWORD);
  const incompleteId = await ensureUser(INCOMPLETE_EMAIL, INCOMPLETE_PASSWORD);

  // Seed their data
  await seedCompletedUser(completedId, COMPLETED_EMAIL);
  await seedIncompleteUser(incompleteId, INCOMPLETE_EMAIL);

  // Log this seed run for audit trail
  await logSeedRun(completedId, incompleteId);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log("\n✅ E2E seed complete!");
  console.log("\nTest Account Summary:");
  console.log("─".repeat(50));
  console.log(`Completed:  ${COMPLETED_EMAIL} / ${COMPLETED_PASSWORD}`);
  console.log(`            ID: ${completedId}`);
  console.log(`Incomplete: ${INCOMPLETE_EMAIL} / ${INCOMPLETE_PASSWORD}`);
  console.log(`            ID: ${incompleteId}`);
  console.log(`Duration:   ${duration}s`);
  console.log("─".repeat(50));
  console.log("\n💡 Use these credentials in your E2E tests");
}

main().catch((err) => {
  console.error("\n❌ E2E seed failed:", err);
  process.exit(1);
});
