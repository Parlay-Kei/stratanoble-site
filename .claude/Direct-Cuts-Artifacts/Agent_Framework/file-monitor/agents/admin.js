#!/usr/bin/env node
/**
 * Admin Agent
 * Triggered on configuration changes, migrations, and system files
 * Tracks changes, validates configs, and maintains audit trail
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { join, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Parse event from command line
const eventJson = process.argv[2];
if (!eventJson) {
  console.error('No event data provided');
  process.exit(1);
}

const event = JSON.parse(eventJson);

// File type handlers
const FILE_HANDLERS = {
  '.json': validateJson,
  '.yaml': validateYaml,
  '.yml': validateYaml,
  '.sql': analyzeMigration,
  '.md': analyzeAgentConfig,
  '.env': trackEnvChange
};

/**
 * Validate JSON file
 */
function validateJson(content, filePath) {
  const issues = [];

  try {
    const parsed = JSON.parse(content);

    // Check for common issues
    if (typeof parsed !== 'object' || parsed === null) {
      issues.push({
        type: 'INVALID_STRUCTURE',
        severity: 'WARNING',
        message: 'JSON root should be an object'
      });
    }

    // Check for empty objects
    if (Object.keys(parsed).length === 0) {
      issues.push({
        type: 'EMPTY_CONFIG',
        severity: 'WARNING',
        message: 'Configuration file is empty'
      });
    }

    // Check for package.json specific issues
    if (basename(filePath) === 'package.json') {
      if (!parsed.name) {
        issues.push({
          type: 'MISSING_FIELD',
          severity: 'ERROR',
          message: 'package.json missing "name" field'
        });
      }
      if (!parsed.version) {
        issues.push({
          type: 'MISSING_FIELD',
          severity: 'ERROR',
          message: 'package.json missing "version" field'
        });
      }
    }

    // Check for tsconfig.json specific issues
    if (basename(filePath) === 'tsconfig.json') {
      if (!parsed.compilerOptions) {
        issues.push({
          type: 'MISSING_FIELD',
          severity: 'WARNING',
          message: 'tsconfig.json missing "compilerOptions"'
        });
      }
    }

    return {
      valid: issues.filter(i => i.severity === 'ERROR').length === 0,
      issues,
      parsed
    };

  } catch (error) {
    return {
      valid: false,
      issues: [{
        type: 'PARSE_ERROR',
        severity: 'ERROR',
        message: `JSON parse error: ${error.message}`
      }]
    };
  }
}

/**
 * Validate YAML file (basic check without yaml parser)
 */
function validateYaml(content, filePath) {
  const issues = [];

  // Basic YAML validation
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for tabs (YAML should use spaces)
    if (line.includes('\t')) {
      issues.push({
        type: 'TAB_INDENTATION',
        severity: 'WARNING',
        message: `Line ${i + 1}: YAML should use spaces, not tabs`
      });
    }

    // Check for trailing spaces
    if (line !== line.trimEnd()) {
      issues.push({
        type: 'TRAILING_WHITESPACE',
        severity: 'INFO',
        message: `Line ${i + 1}: Trailing whitespace`
      });
    }
  }

  // Check if file is empty
  if (content.trim().length === 0) {
    issues.push({
      type: 'EMPTY_CONFIG',
      severity: 'WARNING',
      message: 'YAML file is empty'
    });
  }

  return {
    valid: issues.filter(i => i.severity === 'ERROR').length === 0,
    issues
  };
}

/**
 * Analyze SQL migration file
 */
function analyzeMigration(content, filePath) {
  const analysis = {
    type: 'MIGRATION',
    tables: [],
    operations: [],
    risks: []
  };

  const upperContent = content.toUpperCase();

  // Detect operations
  if (upperContent.includes('CREATE TABLE')) {
    analysis.operations.push('CREATE_TABLE');
  }
  if (upperContent.includes('ALTER TABLE')) {
    analysis.operations.push('ALTER_TABLE');
  }
  if (upperContent.includes('DROP TABLE')) {
    analysis.operations.push('DROP_TABLE');
    analysis.risks.push({
      type: 'DESTRUCTIVE',
      severity: 'CRITICAL',
      message: 'Migration contains DROP TABLE - data will be lost'
    });
  }
  if (upperContent.includes('DROP COLUMN')) {
    analysis.operations.push('DROP_COLUMN');
    analysis.risks.push({
      type: 'DESTRUCTIVE',
      severity: 'HIGH',
      message: 'Migration contains DROP COLUMN - data will be lost'
    });
  }
  if (upperContent.includes('TRUNCATE')) {
    analysis.operations.push('TRUNCATE');
    analysis.risks.push({
      type: 'DESTRUCTIVE',
      severity: 'CRITICAL',
      message: 'Migration contains TRUNCATE - all data will be deleted'
    });
  }

  // Detect RLS changes
  if (upperContent.includes('CREATE POLICY') || upperContent.includes('ALTER POLICY')) {
    analysis.operations.push('RLS_CHANGE');
    analysis.risks.push({
      type: 'SECURITY',
      severity: 'HIGH',
      message: 'Migration modifies Row Level Security policies'
    });
  }

  // Detect index operations
  if (upperContent.includes('CREATE INDEX')) {
    analysis.operations.push('CREATE_INDEX');
  }
  if (upperContent.includes('DROP INDEX')) {
    analysis.operations.push('DROP_INDEX');
  }

  // Extract table names
  const tableMatches = content.match(/(?:CREATE|ALTER|DROP)\s+TABLE\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?["']?(\w+)["']?/gi);
  if (tableMatches) {
    for (const match of tableMatches) {
      const tableName = match.split(/\s+/).pop().replace(/["']/g, '');
      if (!analysis.tables.includes(tableName)) {
        analysis.tables.push(tableName);
      }
    }
  }

  return {
    valid: true,
    issues: analysis.risks,
    analysis
  };
}

/**
 * Analyze Claude agent configuration
 */
function analyzeAgentConfig(content, filePath) {
  const issues = [];

  // Check if it's an agent config file
  if (!filePath.includes('.claude/agents')) {
    return { valid: true, issues: [] };
  }

  // Check for required sections
  if (!content.includes('# ')) {
    issues.push({
      type: 'MISSING_TITLE',
      severity: 'WARNING',
      message: 'Agent config missing title'
    });
  }

  // Check for description/purpose
  if (!content.toLowerCase().includes('purpose') && !content.toLowerCase().includes('description')) {
    issues.push({
      type: 'MISSING_DESCRIPTION',
      severity: 'INFO',
      message: 'Agent config should include a purpose or description'
    });
  }

  // Check for trigger conditions
  if (!content.toLowerCase().includes('trigger') && !content.toLowerCase().includes('when to use')) {
    issues.push({
      type: 'MISSING_TRIGGERS',
      severity: 'INFO',
      message: 'Agent config should specify trigger conditions'
    });
  }

  return {
    valid: true,
    issues
  };
}

/**
 * Track environment file changes
 */
function trackEnvChange(content, filePath) {
  const issues = [];

  // Parse env file
  const lines = content.split('\n');
  const variables = [];

  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key] = line.split('=');
      if (key) {
        variables.push(key.trim());
      }
    }
  }

  // Check for common issues
  if (variables.includes('DEBUG') || variables.includes('DEV_MODE')) {
    issues.push({
      type: 'DEBUG_ENABLED',
      severity: 'WARNING',
      message: 'Environment file contains debug flags'
    });
  }

  return {
    valid: true,
    issues,
    variables
  };
}

/**
 * Calculate file hash
 */
function calculateHash(content) {
  return createHash('sha256').update(content).digest('hex').substring(0, 12);
}

/**
 * Main admin analysis
 */
async function runAdminAnalysis() {
  console.log(`\n[Admin Agent] Processing: ${event.path}`);
  console.log(`[Admin Agent] Event type: ${event.eventType}`);

  const results = {
    processedAt: new Date().toISOString(),
    file: event.path,
    eventType: event.eventType,
    fileType: null,
    hash: null,
    issues: [],
    audit: {}
  };

  // Handle file deletion
  if (event.eventType === 'unlink') {
    console.log('[Admin Agent] Configuration file deleted');
    results.audit = {
      action: 'FILE_DELETED',
      path: event.path,
      timestamp: new Date().toISOString()
    };
    results.issues.push({
      type: 'CONFIG_DELETED',
      severity: 'WARNING',
      message: `Configuration file was deleted: ${event.path}`
    });
    return results;
  }

  // Handle large file alert
  if (event.conditions?.maxSizeKb && event.fileSize) {
    const sizeKb = event.fileSize / 1024;
    if (sizeKb > event.conditions.maxSizeKb) {
      results.issues.push({
        type: 'LARGE_FILE',
        severity: 'WARNING',
        message: `File size (${sizeKb.toFixed(1)}KB) exceeds threshold (${event.conditions.maxSizeKb}KB)`
      });
    }
  }

  // Check if file exists
  const fullPath = event.fullPath;
  if (!existsSync(fullPath)) {
    console.log('[Admin Agent] File no longer exists, skipping analysis');
    return results;
  }

  // Get file info
  const ext = extname(fullPath).toLowerCase();
  results.fileType = ext;

  // Read file content
  try {
    const content = readFileSync(fullPath, 'utf-8');
    results.hash = calculateHash(content);

    // Get appropriate handler
    const handler = FILE_HANDLERS[ext];

    if (handler) {
      const analysis = handler(content, event.path);
      results.issues = analysis.issues || [];
      results.audit = {
        action: event.eventType === 'add' ? 'FILE_CREATED' : 'FILE_MODIFIED',
        path: event.path,
        hash: results.hash,
        valid: analysis.valid,
        ...analysis.analysis
      };

      console.log(`[Admin Agent] Validation: ${analysis.valid ? 'PASSED' : 'FAILED'}`);
    } else {
      // Generic file tracking
      const stats = statSync(fullPath);
      results.audit = {
        action: event.eventType === 'add' ? 'FILE_CREATED' : 'FILE_MODIFIED',
        path: event.path,
        hash: results.hash,
        size: stats.size,
        modified: stats.mtime.toISOString()
      };
    }

    // Summary
    console.log(`[Admin Agent] Processing complete:`);
    console.log(`  - File type: ${results.fileType}`);
    console.log(`  - Hash: ${results.hash}`);
    console.log(`  - Issues found: ${results.issues.length}`);

  } catch (error) {
    console.error(`[Admin Agent] Error reading file: ${error.message}`);
    results.error = error.message;
  }

  // Output results
  console.log('\n[Admin Agent] Results:');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

// Run the analysis
runAdminAnalysis()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('[Admin Agent] Fatal error:', error);
    process.exit(1);
  });
