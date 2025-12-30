// User Wipe Script - DESTRUCTIVE OPERATION
// Safely deletes all users and related data from the database
// Requires explicit confirmation and project allowlisting

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.E2E_SUPABASE_URL!;
const SERVICE_KEY = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY!;

// =============================================================================
// SAFETY GUARDRAILS
// =============================================================================

// CRITICAL: Prevent running against production
// Add your E2E/staging project refs here
const ALLOWED_WIPE_PROJECTS: string[] = [
  // Add your E2E project refs here, e.g.:
  // "abcdefghijklmnop",  // E2E project
  // "qrstuvwxyz123456",  // Staging
];

// REQUIRED: Must set this exact value to confirm wipe
const REQUIRED_CONFIRM_VALUE = "DELETE_ALL_USERS_NOW";
const CONFIRM_WIPE = process.env.CONFIRM_WIPE;

// Optional: Admin email to preserve (won't be deleted)
const PRESERVE_ADMIN_EMAIL = process.env.PRESERVE_ADMIN_EMAIL;

// =============================================================================
// VALIDATION
// =============================================================================

if (!URL || !SERVICE_KEY) {
  console.error("Missing E2E_SUPABASE_URL or E2E_SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Extract project ref from URL
const projectRefMatch = URL.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
const projectRef = projectRefMatch?.[1];

// Check 1: Project must be allowlisted
if (ALLOWED_WIPE_PROJECTS.length === 0) {
  console.error(`
================================================================================
SAFETY LOCK: No projects in allowlist
================================================================================
This wipe script will NOT run until you explicitly allowlist your project.

To enable:
1. Edit apps/platform/scripts/wipe-users.ts
2. Add your project ref to ALLOWED_WIPE_PROJECTS array
3. Your current project ref is: ${projectRef || "UNKNOWN"}

Example:
  const ALLOWED_WIPE_PROJECTS: string[] = [
    "${projectRef || "your-project-ref"}",  // E2E project
  ];

This prevents accidentally wiping production data.
================================================================================
`);
  process.exit(1);
}

if (!projectRef || !ALLOWED_WIPE_PROJECTS.includes(projectRef)) {
  console.error(`
================================================================================
SAFETY LOCK: Project not in allowlist
================================================================================
Current project: ${projectRef || "UNKNOWN"}
Allowed projects: ${ALLOWED_WIPE_PROJECTS.join(", ")}

Add "${projectRef}" to ALLOWED_WIPE_PROJECTS in wipe-users.ts to proceed.
================================================================================
`);
  process.exit(1);
}

// Check 2: Explicit confirmation required
if (CONFIRM_WIPE !== REQUIRED_CONFIRM_VALUE) {
  console.error(`
================================================================================
SAFETY LOCK: Missing confirmation
================================================================================
To wipe all users, you must set:

  CONFIRM_WIPE=${REQUIRED_CONFIRM_VALUE}

Run with:
  CONFIRM_WIPE=${REQUIRED_CONFIRM_VALUE} npx tsx apps/platform/scripts/wipe-users.ts

Current CONFIRM_WIPE value: ${CONFIRM_WIPE || "(not set)"}

This prevents accidental data deletion.
================================================================================
`);
  process.exit(1);
}

// Check 3: Service key safety
if (SERVICE_KEY.startsWith("NEXT_PUBLIC_")) {
  console.error("SECURITY: Service role key must NOT be prefixed with NEXT_PUBLIC_");
  process.exit(1);
}

// =============================================================================
// WIPE IMPLEMENTATION
// =============================================================================

const supabase = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

interface TableCount {
  table: string;
  before: number;
  after: number;
}

/**
 * Get count from a table (returns 0 if table doesn't exist)
 */
async function getCount(table: string, column = "id"): Promise<number> {
  try {
    const { count, error } = await supabase
      .from(table)
      .select(column, { count: "exact", head: true });
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Delete all rows from a table (safe if table doesn't exist)
 */
async function truncateTable(table: string): Promise<number> {
  try {
    const beforeCount = await getCount(table);
    if (beforeCount === 0) return 0;

    // Use neq with impossible value to delete all rows
    // (Supabase doesn't allow delete without a filter)
    const { error } = await supabase
      .from(table)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.warn(`  Warning: Could not clear ${table}: ${error.message}`);
      return 0;
    }
    return beforeCount;
  } catch {
    return 0;
  }
}

/**
 * Get all auth users (paginated)
 */
async function getAllUsers() {
  const users: { id: string; email?: string }[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const pageUsers = data?.users ?? [];
    users.push(...pageUsers.map((u) => ({ id: u.id, email: u.email })));

    if (pageUsers.length < perPage) break;
    page += 1;
  }

  return users;
}

/**
 * Delete a single auth user
 */
async function deleteAuthUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.warn(`  Warning: Could not delete user ${userId}: ${error.message}`);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Main wipe function
 */
async function main() {
  const startTime = Date.now();
  const counts: TableCount[] = [];

  console.log(`
================================================================================
                       USER WIPE OPERATION
================================================================================
Project:     ${projectRef}
URL:         ${URL}
Preserve:    ${PRESERVE_ADMIN_EMAIL || "(none)"}
Environment: ${process.env.CI ? "CI" : "Local"}
================================================================================
`);

  // Step 1: Get initial counts
  console.log("Step 1: Capturing initial counts...\n");

  const tables = [
    "user_dreams",
    "user_actions",
    "weekly_narratives",
    "trust_ledger_shares",
    "user_platform_settings",
    "user_profiles",
    "e2e_seed_runs",
    "contracts",
    "invoices",
    "contract_milestones",
  ];

  for (const table of tables) {
    const count = await getCount(table);
    counts.push({ table, before: count, after: 0 });
    if (count > 0) {
      console.log(`  ${table}: ${count} rows`);
    }
  }

  const users = await getAllUsers();
  console.log(`  auth.users: ${users.length} users`);

  // Step 2: Delete domain tables (order matters for FK constraints)
  console.log("\nStep 2: Deleting domain table data...\n");

  // Tables that reference user_dreams
  await truncateTable("user_actions");
  console.log("  Cleared: user_actions");

  // Tables that reference clients/users
  await truncateTable("user_dreams");
  console.log("  Cleared: user_dreams");

  await truncateTable("weekly_narratives");
  console.log("  Cleared: weekly_narratives");

  await truncateTable("trust_ledger_shares");
  console.log("  Cleared: trust_ledger_shares");

  await truncateTable("user_platform_settings");
  console.log("  Cleared: user_platform_settings");

  // Tables that reference auth.users
  await truncateTable("user_profiles");
  console.log("  Cleared: user_profiles");

  await truncateTable("e2e_seed_runs");
  console.log("  Cleared: e2e_seed_runs");

  // Paralegal tables (if they exist)
  await truncateTable("contract_milestones");
  console.log("  Cleared: contract_milestones");

  await truncateTable("invoices");
  console.log("  Cleared: invoices");

  await truncateTable("contracts");
  console.log("  Cleared: contracts");

  // Step 3: Delete auth users
  console.log("\nStep 3: Deleting auth users...\n");

  let deletedCount = 0;
  let preservedCount = 0;

  for (const user of users) {
    // Preserve admin if specified
    if (
      PRESERVE_ADMIN_EMAIL &&
      user.email?.toLowerCase() === PRESERVE_ADMIN_EMAIL.toLowerCase()
    ) {
      console.log(`  PRESERVED: ${user.email} (${user.id})`);
      preservedCount++;
      continue;
    }

    const deleted = await deleteAuthUser(user.id);
    if (deleted) {
      console.log(`  Deleted: ${user.email || user.id}`);
      deletedCount++;
    }
  }

  // Step 4: Verification
  console.log("\nStep 4: Verifying deletion...\n");

  let allClean = true;
  for (const entry of counts) {
    entry.after = await getCount(entry.table);
    const status = entry.after === 0 ? "OK" : "REMAINING";
    if (entry.after > 0) allClean = false;
    console.log(`  ${entry.table}: ${entry.after} rows [${status}]`);
  }

  const remainingUsers = await getAllUsers();
  const remainingNonPreserved = remainingUsers.filter(
    (u) =>
      !PRESERVE_ADMIN_EMAIL ||
      u.email?.toLowerCase() !== PRESERVE_ADMIN_EMAIL.toLowerCase()
  );

  if (remainingNonPreserved.length > 0) {
    allClean = false;
    console.log(`  auth.users: ${remainingNonPreserved.length} remaining [REMAINING]`);
  } else {
    console.log(
      `  auth.users: 0 remaining (${preservedCount} preserved) [OK]`
    );
  }

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`
================================================================================
                       WIPE COMPLETE
================================================================================
Users deleted:   ${deletedCount}
Users preserved: ${preservedCount}
Duration:        ${duration}s
Status:          ${allClean ? "ALL CLEAN" : "SOME DATA REMAINING"}
================================================================================
`);

  if (!allClean) {
    console.warn("\nWarning: Some data could not be deleted. Check errors above.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\nWipe failed:", err);
  process.exit(1);
});
