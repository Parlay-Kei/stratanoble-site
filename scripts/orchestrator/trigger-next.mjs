/**
 * Orchestrator Trigger Script
 *
 * Reads the P0 completion signal and creates GitHub Issues
 * for the next validation tasks. Prevents double-triggering
 * by checking if issues already exist for that signal/date.
 *
 * Runs in GitHub Actions after CI success on main.
 *
 * This script uses the shared trigger-handler.mjs for core logic.
 */

import path from "node:path";
import { triggerOrchestration } from "./trigger-handler.mjs";

const owner = process.env.GITHUB_REPOSITORY?.split("/")[0];
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const token = process.env.GITHUB_TOKEN;
const runId = process.env.GITHUB_RUN_ID || "local";

if (!owner || !repo) throw new Error("Missing GITHUB_REPOSITORY");
if (!token) throw new Error("Missing GITHUB_TOKEN");

const SIGNAL_PATH = path.join(process.cwd(), "docs/sprints/signals/security-hotfix-p0.json");

async function main() {
  const result = await triggerOrchestration({
    signalPath: SIGNAL_PATH,
    githubToken: token,
    owner,
    repo,
    runId,
    cwd: process.cwd(),
  });

  console.log("\n" + result.message);

  if (!result.success) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Orchestrator failed:", e);
  process.exit(1);
});
