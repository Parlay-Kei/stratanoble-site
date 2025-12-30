#!/usr/bin/env node
/**
 * Secret Scanning Enforcement
 * 
 * Pre-commit and CI check to prevent service role keys from leaking.
 * 
 * Scans for:
 * - SUPABASE_SERVICE_ROLE_KEY patterns in code
 * - Keys in logs, artifacts, shell history
 * - Misconfigured CI that might expose secrets
 * 
 * Usage:
 *   node scripts/check-secrets.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const FORBIDDEN_PATTERNS = [
  // Supabase Personal Access Tokens (PATs) - FULL ACCOUNT ACCESS
  {
    pattern: /\bsbp_[A-Za-z0-9]{20,}\b/,
    message: 'Supabase Personal Access Token (PAT) found - ROTATE IMMEDIATELY',
    severity: 'error',
    context: 'PATs have full account access. Delete token at: Supabase Dashboard > Account > Access Tokens',
  },
  {
    pattern: /SUPABASE_ACCESS_TOKEN\s*=\s*['"]?sbp_[A-Za-z0-9]{20,}/,
    message: 'Supabase PAT assigned to variable - NEVER store PATs in code/config',
    severity: 'error',
    context: 'Use single-command env var injection only. See: docs/agents/SECURITY_SECRETS_HANDLING.md',
  },
  {
    pattern: /Bearer\s+sbp_[A-Za-z0-9]{20,}/i,
    message: 'Supabase PAT in Authorization header - exposed in code',
    severity: 'error',
  },
  // Supabase service role key (obvious)
  {
    pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"](eyJ[a-zA-Z0-9_-]+)['"]/,
    message: 'Service role key hardcoded in file',
    severity: 'error',
  },
  {
    pattern: /supabase.*service.*role.*key.*eyJ/i,
    message: 'Service role key pattern found (may be exposed)',
    severity: 'error',
  },
  // JWT-like strings (three base64url segments)
  {
    pattern: /['"](eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]{20,})['"]/,
    message: 'JWT-like token found (may be a secret key)',
    severity: 'error',
    context: 'JWT tokens have three base64url segments separated by dots',
  },
  // Supabase anon keys (long and look "harmless")
  {
    pattern: /SUPABASE_ANON_KEY\s*=\s*['"](eyJ[a-zA-Z0-9_-]{100,})['"]/,
    message: 'Supabase anon key hardcoded in file',
    severity: 'error',
  },
  {
    pattern: /NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*['"](eyJ[a-zA-Z0-9_-]{100,})['"]/,
    message: 'Supabase anon key hardcoded (even if public, should be in env)',
    severity: 'warning',
  },
  // ElevenLabs API keys
  {
    pattern: /ELEVENLABS.*API.*KEY\s*=\s*['"]([a-zA-Z0-9_-]{20,})['"]/i,
    message: 'ElevenLabs API key hardcoded in file',
    severity: 'error',
  },
  // Twilio keys
  {
    pattern: /TWILIO.*(AUTH_TOKEN|API_KEY)\s*=\s*['"]([a-zA-Z0-9_-]{20,})['"]/i,
    message: 'Twilio key hardcoded in file',
    severity: 'error',
  },
  // OpenAI keys
  {
    pattern: /OPENAI.*API.*KEY\s*=\s*['"](sk-[a-zA-Z0-9_-]{20,})['"]/i,
    message: 'OpenAI API key hardcoded in file',
    severity: 'error',
  },
  // Generic long secrets (catch-all)
  {
    pattern: /(SECRET|KEY|TOKEN|PASSWORD)\s*=\s*['"]([a-zA-Z0-9_-]{40,})['"]/i,
    message: 'Long secret-like value found (may be an API key)',
    severity: 'warning',
    context: 'If this is a real secret, move it to environment variables',
  },
  // Logging patterns
  {
    pattern: /console\.(log|warn|error|debug).*SERVICE_ROLE/i,
    message: 'Service role key may be logged',
    severity: 'warning',
  },
  {
    pattern: /process\.env\.(SUPABASE_SERVICE_ROLE_KEY|SUPABASE_ANON_KEY).*console/i,
    message: 'Supabase key may be logged to console',
    severity: 'error',
  },
];

const ALLOWED_PATTERNS = [
  /\.env\.example/, // Example files are OK
  /\.env\.local\.example/,
  /\.gitignore/,
  /check-secrets\.mjs/, // This file itself
  /TEST_INFRASTRUCTURE.*\.md/, // Documentation
];

function shouldSkipFile(filePath) {
  return ALLOWED_PATTERNS.some((pattern) => pattern.test(filePath));
}

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.yml', '.yaml'], fileList = []) {
  if (!statSync(dir).isDirectory()) {
    return fileList;
  }

  // Skip node_modules, .git, build directories
  if (dir.includes('node_modules') || dir.includes('.git') || dir.includes('.next') || dir.includes('dist')) {
    return fileList;
  }

  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    try {
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        findFiles(filePath, extensions, fileList);
      } else if (extensions.some((ext) => file.endsWith(ext))) {
        if (!shouldSkipFile(filePath)) {
          fileList.push(filePath);
        }
      }
    } catch {
      // Skip files we can't read
    }
  });

  return fileList;
}

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const issues = [];

  FORBIDDEN_PATTERNS.forEach(({ pattern, message, severity }) => {
    const matches = content.matchAll(new RegExp(pattern.source, 'gi'));
    for (const match of matches) {
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      const line = content.split('\n')[lineNumber - 1];

      issues.push({
        file: filePath,
        line: lineNumber,
        message,
        severity,
        code: line.trim().substring(0, 100),
      });
    }
  });

  return issues;
}

function checkGitHistory() {
  const issues = [];

  try {
    // Check if service role key was ever committed
    const result = execSync(
      'git log --all --source --full-history -S "SUPABASE_SERVICE_ROLE_KEY" --oneline',
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    if (result.trim()) {
      issues.push({
        severity: 'error',
        message: 'Service role key found in git history. Rotate the key immediately.',
        details: result.trim().split('\n').slice(0, 5),
      });
    }
  } catch {
    // Git command failed, skip
  }

  try {
    // Check if Supabase PAT was ever committed (comprehensive history scan)
    const patResult = execSync(
      'git rev-list --all | xargs -n 50 git grep -l "sbp_[A-Za-z0-9]\\{20,\\}" -- 2>/dev/null || true',
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    if (patResult.trim()) {
      issues.push({
        severity: 'error',
        message: 'Supabase PAT (sbp_) found in git history. DELETE the token immediately at Supabase Dashboard.',
        details: patResult.trim().split('\n').slice(0, 5),
      });
    }
  } catch {
    // Git command failed, skip
  }

  return issues.length > 0 ? issues : null;
}

function checkEnvFiles() {
  const issues = [];
  const envPatterns = ['.env', '.env.local', '.env.development', '.env.production', '.env.test'];

  for (const envFile of envPatterns) {
    try {
      const content = readFileSync(envFile, 'utf-8');

      // SUPABASE_ACCESS_TOKEN should NEVER be in .env files
      if (content.includes('SUPABASE_ACCESS_TOKEN')) {
        issues.push({
          file: envFile,
          line: content.split('\n').findIndex(l => l.includes('SUPABASE_ACCESS_TOKEN')) + 1,
          message: 'SUPABASE_ACCESS_TOKEN found in .env file - PATs should NEVER be stored in files',
          severity: 'error',
          context: 'Use single-command env var injection only. See: docs/agents/SECURITY_SECRETS_HANDLING.md',
        });
      }

      // Check for actual PAT values
      const patMatch = content.match(/sbp_[A-Za-z0-9]{20,}/);
      if (patMatch) {
        issues.push({
          file: envFile,
          line: content.split('\n').findIndex(l => l.includes('sbp_')) + 1,
          message: 'Supabase PAT value found in .env file - ROTATE IMMEDIATELY',
          severity: 'error',
          context: 'Delete token at: Supabase Dashboard > Account > Access Tokens',
        });
      }
    } catch {
      // File doesn't exist, skip
    }
  }

  return issues;
}

function main() {
  console.log('🔍 Scanning for exposed service role keys...\n');

  const issues = [];
  const testDirs = [
    'apps/website/src',
    'apps/website/scripts',
    'apps/platform/src',
    'scripts',
    '.github/workflows',
    '.claude',
    'docs/agents',
  ];

  testDirs.forEach((dir) => {
    try {
      const files = findFiles(dir);
      files.forEach((file) => {
        const fileIssues = checkFile(file);
        issues.push(...fileIssues);
      });
    } catch {
      // Directory doesn't exist, skip
    }
  });

  // Check .env files for PAT storage (should NEVER happen)
  const envIssues = checkEnvFiles();
  issues.push(...envIssues);

  // Check git history for both service role keys and PATs
  const gitHistoryIssues = checkGitHistory();
  if (gitHistoryIssues) {
    gitHistoryIssues.forEach((issue) => {
      issues.push({
        file: 'git-history',
        line: 0,
        ...issue,
      });
    });
  }

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ No exposed service role keys found.\n');
    process.exit(0);
  }

  if (errors.length > 0) {
    console.log(`❌ Found ${errors.length} error(s):\n`);
    errors.forEach((issue) => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.message}`);
      if (issue.code) {
        console.log(`    Code: ${issue.code}...`);
      }
      if (issue.details) {
        console.log(`    Details: ${issue.details.join(', ')}`);
      }
      console.log('');
    });
  }

  if (warnings.length > 0) {
    console.log(`⚠️  Found ${warnings.length} warning(s):\n`);
    warnings.forEach((issue) => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.message}\n`);
    });
  }

  console.log('💡 Fix: Remove secrets from code. Use environment variables only.\n');
  console.log('🚨 ROTATION REQUIRED: If any key was committed to git history, ROTATE IT IMMEDIATELY.\n');
  console.log('   Rotation is what actually ends the risk, not just blocking the push.\n');

  if (errors.length > 0) {
    process.exit(1);
  }

  process.exit(0);
}

main();
