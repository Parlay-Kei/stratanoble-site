#!/usr/bin/env node
/**
 * Verify all agent files have mandatory security headers
 *
 * Fails CI if any agent file is missing the security header.
 * This prevents drift when new agents are added.
 *
 * Usage:
 *   node scripts/verify-agent-security-headers.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const REQUIRED_MARKER = 'SECURITY_SECRETS_HANDLING.md';
const SKIP_FILES = ['SECURITY_SECRETS_HANDLING.md'];

const AGENT_DIRS = [
  'docs/agents',
  // Add other agent directories as needed
];

function checkDir(dir) {
  if (!existsSync(dir)) return [];

  const missing = [];
  const files = readdirSync(dir).filter(f => f.endsWith('.md') && !SKIP_FILES.includes(f));

  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf-8');
    if (!content.includes(REQUIRED_MARKER)) {
      missing.push(join(dir, file));
    }
  }

  return missing;
}

function main() {
  console.log('🔐 Verifying agent security headers...\n');

  const missing = AGENT_DIRS.flatMap(checkDir);

  if (missing.length === 0) {
    console.log('✅ All agent files have security headers\n');
    process.exit(0);
  }

  console.log(`❌ ${missing.length} agent file(s) missing security header:\n`);
  missing.forEach(f => console.log(`   ${f}`));
  console.log('\nFix: Run node scripts/add-security-headers-to-agents.mjs');
  console.log('See: docs/agents/SECURITY_SECRETS_HANDLING.md\n');
  process.exit(1);
}

main();
