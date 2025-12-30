#!/usr/bin/env node
/**
 * Add security headers to agent prompt files
 *
 * Adds mandatory security header pointing to SECURITY_SECRETS_HANDLING.md
 * to all agent files in docs/agents/ that don't already have it.
 *
 * Usage:
 *   node scripts/add-security-headers-to-agents.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SECURITY_HEADER = `## SECURITY (MANDATORY)
Follow: docs/agents/SECURITY_SECRETS_HANDLING.md

- Never ask for or accept secrets in chat
- Provide single-command env var instructions only
- Never write PATs to files or logs
- After use, instruct user to DELETE the PAT (revoke)
- Assume any disclosed token is compromised

---

`;

const AGENTS_DIR = 'docs/agents';
const SKIP_FILES = [
  'SECURITY_SECRETS_HANDLING.md', // The rules doc itself
];

function hasSecurityHeader(content) {
  return content.includes('## SECURITY (MANDATORY)') ||
         content.includes('SECURITY_SECRETS_HANDLING.md');
}

function addSecurityHeader(content) {
  // If file starts with YAML frontmatter (---), insert after it
  if (content.startsWith('---')) {
    const endOfFrontmatter = content.indexOf('---', 3);
    if (endOfFrontmatter > 0) {
      const frontmatter = content.substring(0, endOfFrontmatter + 3);
      const rest = content.substring(endOfFrontmatter + 3);
      return frontmatter + '\n\n' + SECURITY_HEADER + rest.trimStart();
    }
  }

  // If file starts with # heading, insert after it
  const firstHeadingMatch = content.match(/^(#[^\n]+\n+)/);
  if (firstHeadingMatch) {
    const heading = firstHeadingMatch[1];
    const rest = content.substring(heading.length);
    return heading + '\n' + SECURITY_HEADER + rest;
  }

  // Otherwise, prepend to file
  return SECURITY_HEADER + content;
}

function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log(`🔐 Adding security headers to agent files${dryRun ? ' (DRY RUN)' : ''}\n`);

  const files = readdirSync(AGENTS_DIR).filter(f =>
    f.endsWith('.md') && !SKIP_FILES.includes(f)
  );

  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = join(AGENTS_DIR, file);
    const content = readFileSync(filePath, 'utf-8');

    if (hasSecurityHeader(content)) {
      console.log(`  ⏭️  ${file} (already has header)`);
      skipped++;
      continue;
    }

    const newContent = addSecurityHeader(content);

    if (dryRun) {
      console.log(`  📝 ${file} (would add header)`);
    } else {
      writeFileSync(filePath, newContent);
      console.log(`  ✅ ${file} (header added)`);
    }
    updated++;
  }

  console.log(`\n📊 Summary: ${updated} updated, ${skipped} skipped`);

  if (dryRun && updated > 0) {
    console.log('\n💡 Run without --dry-run to apply changes');
  }
}

main();
