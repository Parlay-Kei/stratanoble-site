#!/usr/bin/env node

/**
 * Saves proof file with proper naming, organization, and security sanitization.
 *
 * Usage:
 *   node scripts/orchestrator/save-proof.mjs --task SEC-001 --type middleware-fix --content "All tests passed"
 *   npm test 2>&1 | node scripts/orchestrator/save-proof.mjs --task VAL-001 --type test-suite
 *
 * Options:
 *   --task     Task ID (e.g., SEC-001, VAL-001)
 *   --type     Proof type/name (e.g., middleware-fix, test-suite)
 *   --content  Content to save (if not provided, reads from stdin)
 *   --date     Override date (default: today's date YYYY-MM-DD)
 *   --max-size Maximum content size in bytes (default: 1MB)
 *   --strict   Fail if any secrets are detected (instead of redacting)
 *
 * Security:
 *   - Strips known secret patterns (API keys, tokens, passwords)
 *   - Redacts URLs with embedded credentials
 *   - Removes environment variable dumps
 *   - Truncates excessively large files
 */

import fs from 'fs/promises';
import path from 'path';

// Comprehensive secret patterns to strip from proof files
const SECRET_PATTERNS = [
  // Supabase
  { pattern: /sbp_[A-Za-z0-9]{20,}/g, name: 'Supabase PAT' },
  { pattern: /service_role['":\s]+[A-Za-z0-9._-]{100,}/gi, name: 'Supabase service role' },
  { pattern: /anon['":\s]+[A-Za-z0-9._-]{100,}/gi, name: 'Supabase anon key' },

  // Stripe
  { pattern: /sk_live_[A-Za-z0-9]{20,}/g, name: 'Stripe live key' },
  { pattern: /sk_test_[A-Za-z0-9]{20,}/g, name: 'Stripe test key' },
  { pattern: /pk_live_[A-Za-z0-9]{20,}/g, name: 'Stripe public live key' },
  { pattern: /pk_test_[A-Za-z0-9]{20,}/g, name: 'Stripe public test key' },
  { pattern: /whsec_[A-Za-z0-9]{20,}/g, name: 'Stripe webhook secret' },

  // GitHub
  { pattern: /ghp_[A-Za-z0-9]{36,}/g, name: 'GitHub PAT' },
  { pattern: /gho_[A-Za-z0-9]{36,}/g, name: 'GitHub OAuth' },
  { pattern: /ghu_[A-Za-z0-9]{36,}/g, name: 'GitHub user token' },
  { pattern: /ghs_[A-Za-z0-9]{36,}/g, name: 'GitHub server token' },
  { pattern: /github_pat_[A-Za-z0-9_]{20,}/g, name: 'GitHub fine-grained PAT' },

  // Slack
  { pattern: /xoxb-[A-Za-z0-9-]{50,}/g, name: 'Slack bot token' },
  { pattern: /xoxp-[A-Za-z0-9-]{50,}/g, name: 'Slack user token' },
  { pattern: /xoxa-[A-Za-z0-9-]{50,}/g, name: 'Slack app token' },

  // AWS
  { pattern: /AKIA[A-Z0-9]{16}/g, name: 'AWS access key' },
  { pattern: /aws_secret_access_key['"=:\s]+[A-Za-z0-9/+=]{40}/gi, name: 'AWS secret key' },

  // Generic tokens and secrets
  { pattern: /eyJ[A-Za-z0-9_-]{50,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g, name: 'JWT token' },
  { pattern: /Bearer\s+[A-Za-z0-9._-]{20,}/g, name: 'Bearer token' },
  { pattern: /api[_-]?key['"=:\s]+[A-Za-z0-9_-]{20,}/gi, name: 'API key' },
  { pattern: /secret['"=:\s]+[A-Za-z0-9_-]{20,}/gi, name: 'Secret value' },
  { pattern: /password['"=:\s]+[^\s'"]{8,}/gi, name: 'Password' },
  { pattern: /token['"=:\s]+[A-Za-z0-9._-]{20,}/gi, name: 'Token value' },

  // Twilio
  { pattern: /AC[a-f0-9]{32}/g, name: 'Twilio Account SID' },
  { pattern: /SK[a-f0-9]{32}/g, name: 'Twilio API Key SID' },

  // OpenAI
  { pattern: /sk-[A-Za-z0-9]{48,}/g, name: 'OpenAI API key' },
  { pattern: /sk-proj-[A-Za-z0-9_-]{48,}/g, name: 'OpenAI project key' },

  // SendGrid
  { pattern: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g, name: 'SendGrid API key' },

  // Mapbox
  { pattern: /pk\.[A-Za-z0-9]{60,}/g, name: 'Mapbox public key' },
  { pattern: /sk\.[A-Za-z0-9]{60,}/g, name: 'Mapbox secret key' },

  // URLs with credentials
  { pattern: /https?:\/\/[^:]+:[^@]+@[^\s]+/g, name: 'URL with credentials' },

  // Connection strings
  { pattern: /postgres(ql)?:\/\/[^\s'"]+/gi, name: 'Postgres connection string' },
  { pattern: /mongodb(\+srv)?:\/\/[^\s'"]+/gi, name: 'MongoDB connection string' },
  { pattern: /redis:\/\/[^\s'"]+/gi, name: 'Redis connection string' },

  // Private keys
  { pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(RSA\s+)?PRIVATE\s+KEY-----/g, name: 'Private key' },
  { pattern: /-----BEGIN\s+CERTIFICATE-----[\s\S]*?-----END\s+CERTIFICATE-----/g, name: 'Certificate' },
];

// Patterns that indicate environment variable dumps
const ENV_DUMP_PATTERNS = [
  /^[A-Z][A-Z0-9_]+=.+$/gm,  // Lines like "VARIABLE=value"
  /process\.env\.[A-Z_]+\s*[:=]/g,  // process.env.VARIABLE references
];

const MAX_CONTENT_SIZE = 1024 * 1024; // 1MB default
const MAX_ENV_LINES = 5; // Max consecutive env-like lines before warning

function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      if (args[i + 1] && !args[i + 1].startsWith('--')) {
        result[key] = args[i + 1];
        i++;
      } else {
        result[key] = true;
      }
    }
  }
  return result;
}

async function readStdin(maxSize) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalSize = 0;
    let truncated = false;

    // Check if stdin has data (not a TTY)
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      if (truncated) return;

      if (totalSize + chunk.length > maxSize) {
        // Truncate at max size
        const remaining = maxSize - totalSize;
        chunks.push(chunk.slice(0, remaining));
        truncated = true;
        console.warn(`Warning: Content truncated at ${maxSize} bytes`);
      } else {
        chunks.push(chunk);
        totalSize += chunk.length;
      }
    });

    process.stdin.on('end', () => {
      const content = chunks.join('');
      if (truncated) {
        resolve(content + '\n\n[... TRUNCATED ...]');
      } else {
        resolve(content);
      }
    });

    process.stdin.on('error', (err) => {
      reject(err);
    });

    // Timeout after 30 seconds for very long operations
    setTimeout(() => {
      if (chunks.length === 0) {
        resolve('');
      }
    }, 30000);
  });
}

function sanitizeContent(content, strict = false) {
  let sanitized = content;
  const detectedSecrets = [];

  // Check for secret patterns
  for (const { pattern, name } of SECRET_PATTERNS) {
    const matches = sanitized.match(pattern);
    if (matches) {
      detectedSecrets.push({ name, count: matches.length });
      sanitized = sanitized.replace(pattern, `[REDACTED:${name}]`);
    }
  }

  // Check for environment variable dumps
  const lines = sanitized.split('\n');
  let consecutiveEnvLines = 0;
  let envDumpWarning = false;

  for (let i = 0; i < lines.length; i++) {
    if (/^[A-Z][A-Z0-9_]+=/.test(lines[i])) {
      consecutiveEnvLines++;
      if (consecutiveEnvLines >= MAX_ENV_LINES) {
        envDumpWarning = true;
        // Redact the value part of env-like lines in large blocks
        lines[i] = lines[i].replace(/^([A-Z][A-Z0-9_]+=)(.*)$/, '$1[REDACTED:env_value]');
      }
    } else {
      consecutiveEnvLines = 0;
    }
  }

  if (envDumpWarning) {
    sanitized = lines.join('\n');
    detectedSecrets.push({ name: 'Environment variable dump', count: 1 });
  }

  // Report findings
  if (detectedSecrets.length > 0) {
    console.warn('Security: Detected and redacted secrets:');
    for (const { name, count } of detectedSecrets) {
      console.warn(`  - ${name}: ${count} occurrence(s)`);
    }

    if (strict) {
      throw new Error('Secrets detected in proof content (strict mode enabled)');
    }
  }

  return sanitized;
}

async function saveProof() {
  const args = parseArgs(process.argv.slice(2));

  const taskId = args.task;
  const proofType = args.type;
  const dateOverride = args.date;
  const maxSize = parseInt(args['max-size']) || MAX_CONTENT_SIZE;
  const strict = args.strict === true;

  if (!taskId) {
    console.error('Error: --task is required');
    console.error('Usage: node save-proof.mjs --task SEC-001 --type middleware-fix --content "proof content"');
    console.error('   or: npm test 2>&1 | node save-proof.mjs --task VAL-001 --type test-suite');
    process.exit(1);
  }

  if (!proofType) {
    console.error('Error: --type is required');
    console.error('Usage: node save-proof.mjs --task SEC-001 --type middleware-fix --content "proof content"');
    console.error('   or: npm test 2>&1 | node save-proof.mjs --task VAL-001 --type test-suite');
    process.exit(1);
  }

  // Get content: prefer --content, otherwise read from stdin
  let content = args.content || '';

  if (!content) {
    console.log('Reading from stdin...');
    content = await readStdin(maxSize);
  }

  if (!content || content.trim() === '') {
    content = 'Proof generated automatically - no content provided';
  }

  // Sanitize content to remove secrets
  try {
    content = sanitizeContent(content, strict);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  // Truncate if still too large
  if (content.length > maxSize) {
    content = content.slice(0, maxSize) + '\n\n[... TRUNCATED ...]';
    console.warn(`Warning: Content truncated to ${maxSize} bytes`);
  }

  // Determine date
  const today = dateOverride || new Date().toISOString().split('T')[0];
  const proofsDir = path.join(process.cwd(), 'docs', 'audits', 'proofs', today);

  // Ensure proof directory exists
  await fs.mkdir(proofsDir, { recursive: true });

  // Generate proof filename
  const filename = `${taskId.toLowerCase()}-${proofType}.log`;
  const proofPath = path.join(proofsDir, filename);

  // Check if file already exists (idempotency)
  try {
    await fs.access(proofPath);
    console.log(`Proof file already exists: docs/audits/proofs/${today}/${filename}`);
    console.log('Skipping to prevent duplicate. Use --force to overwrite.');
    if (!args.force) {
      return proofPath;
    }
  } catch {
    // File doesn't exist, continue
  }

  // Add timestamp and metadata
  const timestamp = new Date().toISOString();
  const proofContent = `# Proof for ${taskId}
# Type: ${proofType}
# Generated: ${timestamp}
# Path: docs/audits/proofs/${today}/${filename}
# Size: ${content.length} bytes
# Sanitized: Yes (secrets redacted)

${'-'.repeat(60)}

${content}

${'-'.repeat(60)}
# End of proof file
`;

  await fs.writeFile(proofPath, proofContent);
  console.log(`Proof saved: docs/audits/proofs/${today}/${filename}`);

  // Also update the sprint state to reflect new proof
  try {
    const statePath = path.join(process.cwd(), 'docs', 'sprints', '_state.json');
    const stateContent = await fs.readFile(statePath, 'utf-8');
    const state = JSON.parse(stateContent);

    // Add task to completed if not already there
    if (!state.completedTasks.includes(taskId)) {
      state.completedTasks.push(taskId);
      state.lastUpdated = timestamp;
      await fs.writeFile(statePath, JSON.stringify(state, null, 2));
      console.log(`Task ${taskId} marked as completed in sprint state`);
    }
  } catch (error) {
    // State update is optional, don't fail if it doesn't work
    console.log(`Note: Could not update sprint state (${error.message})`);
  }

  return proofPath;
}

// Show help if no args
if (process.argv.length === 2) {
  console.log(`
Save Proof Helper v2.0

Saves proof files with proper naming, organization, and security sanitization.
Automatically detects and redacts secrets before writing to disk.

Usage:
  node scripts/orchestrator/save-proof.mjs --task <ID> --type <TYPE> [OPTIONS]

Required:
  --task     Task ID (e.g., SEC-001, VAL-001, BUILD-001)
  --type     Proof type/name (e.g., middleware-fix, test-suite, build-output)

Optional:
  --content   Content to save in the proof file (if omitted, reads from stdin)
  --date      Override date (default: today's date YYYY-MM-DD)
  --max-size  Maximum content size in bytes (default: 1048576 = 1MB)
  --strict    Fail if any secrets are detected (instead of redacting)
  --force     Overwrite existing proof file

Examples:
  # Save with inline content
  node scripts/orchestrator/save-proof.mjs --task SEC-001 --type middleware-fix --content "All tests passed"

  # Pipe command output (preferred method)
  npm test 2>&1 | node scripts/orchestrator/save-proof.mjs --task VAL-001 --type test-suite

  # Pipe build output
  npm run build 2>&1 | node scripts/orchestrator/save-proof.mjs --task VAL-002 --type build-output

  # Limit output size
  npm run build 2>&1 | node scripts/orchestrator/save-proof.mjs --task VAL-002 --type build-output --max-size 102400

  # Strict mode (fail on secrets)
  npm test 2>&1 | node scripts/orchestrator/save-proof.mjs --task VAL-001 --type test-suite --strict

Security (automatically redacted):
  - Supabase: PAT, service_role, anon keys
  - Stripe: sk_*, pk_*, whsec_*
  - GitHub: ghp_*, gho_*, github_pat_*
  - AWS: AKIA*, aws_secret_access_key
  - JWT tokens, Bearer tokens
  - API keys, secrets, passwords, tokens
  - Twilio: AC*, SK*
  - OpenAI: sk-*, sk-proj-*
  - SendGrid: SG.*
  - Mapbox: pk.*, sk.*
  - URLs with embedded credentials
  - Database connection strings
  - Private keys and certificates
  - Environment variable dumps

Output:
  Creates file: docs/audits/proofs/<date>/<task-id>-<type>.log
  Updates: docs/sprints/_state.json (marks task complete)
`);
  process.exit(0);
}

saveProof().catch((error) => {
  console.error('Failed to save proof:', error);
  process.exit(1);
});
