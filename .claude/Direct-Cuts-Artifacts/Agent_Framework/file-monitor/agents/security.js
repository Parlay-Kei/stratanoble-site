#!/usr/bin/env node
/**
 * Security Agent
 * Triggered on sensitive file changes, scans for secrets and vulnerabilities
 */

import { readFileSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Parse event from command line
const eventJson = process.argv[2];
if (!eventJson) {
  console.error('No event data provided');
  process.exit(1);
}

const event = JSON.parse(eventJson);

// Security patterns to detect
const SECURITY_PATTERNS = {
  // API Keys and Tokens
  apiKey: /(['"`])?(?:api[_-]?key|apikey)\1?\s*[:=]\s*(['"`])[\w-]{20,}['"`]/gi,
  secretKey: /(['"`])?(?:secret[_-]?key|secretkey|private[_-]?key)\1?\s*[:=]\s*(['"`])[\w-]{20,}['"`]/gi,

  // AWS
  awsAccessKey: /AKIA[0-9A-Z]{16}/g,
  awsSecretKey: /['"`][A-Za-z0-9/+=]{40}['"`]/g,

  // Database
  dbConnection: /(?:mongodb|postgres|mysql|redis):\/\/[^\s'"`]+/gi,
  dbPassword: /(?:password|passwd|pwd)\s*[:=]\s*['"`][^'"`]+['"`]/gi,

  // JWT and Bearer
  jwt: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*/g,
  bearer: /bearer\s+[A-Za-z0-9-_.]+/gi,

  // Private Keys
  privateKey: /-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/g,

  // Stripe
  stripeKey: /sk_(?:live|test)_[A-Za-z0-9]{24,}/g,
  stripePublishable: /pk_(?:live|test)_[A-Za-z0-9]{24,}/g,

  // Supabase
  supabaseKey: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,

  // GitHub
  githubToken: /gh[ps]_[A-Za-z0-9_]{36,}/g,

  // Google
  googleApiKey: /AIza[0-9A-Za-z-_]{35}/g,

  // Generic secrets
  hardcodedPassword: /(?:password|passwd|pwd|secret)\s*=\s*['"`][^'"`]{8,}['"`]/gi,

  // Environment variable exposure
  envExposure: /process\.env\.[A-Z_]+\s*\|\|\s*['"`][^'"`]+['"`]/g,

  // SQL Injection vectors
  sqlInjection: /(?:execute|query|raw)\s*\([^)]*\+\s*(?:req|user|input|params)/gi,

  // XSS vectors
  dangerousHtml: /dangerouslySetInnerHTML|innerHTML\s*=|document\.write/g,

  // Command injection
  commandInjection: /(?:exec|spawn|execSync|spawnSync)\s*\([^)]*(?:\+|`\$\{)/g
};

// File types that should be scanned
const SCANNABLE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.json', '.yaml', '.yml', '.toml',
  '.env', '.env.local', '.env.production',
  '.sh', '.bash', '.ps1',
  '.sql', '.graphql'
];

// Files that are always sensitive
const SENSITIVE_FILES = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  'credentials.json',
  'service-account.json',
  'secrets.json',
  'id_rsa',
  'id_ed25519',
  '.pem',
  '.key'
];

/**
 * Scan file content for security issues
 */
function scanForSecrets(filePath, content) {
  const findings = [];
  const lines = content.split('\n');

  for (const [patternName, pattern] of Object.entries(SECURITY_PATTERNS)) {
    pattern.lastIndex = 0; // Reset regex state

    let match;
    while ((match = pattern.exec(content)) !== null) {
      // Find line number
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;

      // Get context (the line containing the match)
      const contextLine = lines[lineNumber - 1] || '';

      // Mask the actual secret value
      const maskedMatch = match[0].replace(/(['"`])[^'"`]{8,}(['"`])/g, '$1***MASKED***$2');

      findings.push({
        type: patternName,
        severity: getSeverity(patternName),
        line: lineNumber,
        context: contextLine.trim().substring(0, 100),
        match: maskedMatch.substring(0, 50)
      });
    }
  }

  return findings;
}

/**
 * Get severity level for a finding type
 */
function getSeverity(type) {
  const critical = ['privateKey', 'awsSecretKey', 'stripeKey', 'dbPassword', 'jwt'];
  const high = ['apiKey', 'secretKey', 'githubToken', 'supabaseKey', 'hardcodedPassword'];
  const medium = ['sqlInjection', 'commandInjection', 'dangerousHtml'];

  if (critical.includes(type)) return 'CRITICAL';
  if (high.includes(type)) return 'HIGH';
  if (medium.includes(type)) return 'MEDIUM';
  return 'LOW';
}

/**
 * Check if file is in sensitive list
 */
function isSensitiveFile(filePath) {
  const filename = basename(filePath);
  return SENSITIVE_FILES.some(sensitive =>
    filename === sensitive || filename.endsWith(sensitive)
  );
}

/**
 * Main security scan
 */
async function runSecurityScan() {
  console.log(`\n[Security Agent] Scanning: ${event.path}`);
  console.log(`[Security Agent] Event type: ${event.eventType}`);

  const results = {
    scannedAt: new Date().toISOString(),
    file: event.path,
    eventType: event.eventType,
    findings: [],
    alerts: []
  };

  // Handle file deletion
  if (event.eventType === 'unlink') {
    console.log('[Security Agent] File deleted, checking if it was sensitive...');
    if (isSensitiveFile(event.path)) {
      results.alerts.push({
        type: 'SENSITIVE_FILE_DELETED',
        severity: 'HIGH',
        message: `Sensitive file was deleted: ${event.path}`
      });
    }
    return results;
  }

  // Check if file exists
  const fullPath = event.fullPath;
  if (!existsSync(fullPath)) {
    console.log('[Security Agent] File no longer exists, skipping scan');
    return results;
  }

  // Check file extension
  const ext = extname(fullPath).toLowerCase();
  if (!SCANNABLE_EXTENSIONS.includes(ext) && !isSensitiveFile(event.path)) {
    console.log('[Security Agent] File type not scannable, skipping');
    return results;
  }

  // Alert on sensitive file creation/modification
  if (isSensitiveFile(event.path)) {
    results.alerts.push({
      type: 'SENSITIVE_FILE_MODIFIED',
      severity: 'WARNING',
      message: `Sensitive file was ${event.eventType === 'add' ? 'created' : 'modified'}: ${event.path}`
    });
  }

  // Read and scan file content
  try {
    const content = readFileSync(fullPath, 'utf-8');
    results.findings = scanForSecrets(event.path, content);

    // Count by severity
    const bySeverity = results.findings.reduce((acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    }, {});

    console.log(`[Security Agent] Scan complete:`);
    console.log(`  - Critical: ${bySeverity.CRITICAL || 0}`);
    console.log(`  - High: ${bySeverity.HIGH || 0}`);
    console.log(`  - Medium: ${bySeverity.MEDIUM || 0}`);
    console.log(`  - Low: ${bySeverity.LOW || 0}`);

    // Generate alerts for critical/high findings
    if (bySeverity.CRITICAL > 0 || bySeverity.HIGH > 0) {
      results.alerts.push({
        type: 'SECRETS_DETECTED',
        severity: 'CRITICAL',
        message: `Potential secrets detected in ${event.path}: ${bySeverity.CRITICAL || 0} critical, ${bySeverity.HIGH || 0} high`,
        action: 'Review immediately and remove hardcoded secrets'
      });
    }

  } catch (error) {
    console.error(`[Security Agent] Error reading file: ${error.message}`);
    results.error = error.message;
  }

  // Output results
  console.log('\n[Security Agent] Results:');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

// Run the scan
runSecurityScan()
  .then(results => {
    if (results.findings.length > 0 || results.alerts.length > 0) {
      process.exit(0); // Success with findings
    }
    process.exit(0); // Success, no findings
  })
  .catch(error => {
    console.error('[Security Agent] Fatal error:', error);
    process.exit(1);
  });
