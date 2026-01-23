/**
 * Proof Validator v1.0
 * Validates proof packs against requirements schema
 * Enforces hard gate - pipeline fails on missing requirements
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

// Load requirements configuration
async function loadRequirements() {
  const configPath = 'C:\\Dev\\.claude-anx\\governance\\proof-requirements-config.json';
  const content = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Validation result structure
 */
class ValidationResult {
  constructor(skillName) {
    this.skill = skillName;
    this.timestamp = new Date().toISOString();
    this.passed = true;
    this.errors = [];
    this.warnings = [];
    this.checks = [];
    this.evidence = {};
  }

  addError(check, message) {
    this.errors.push({ check, message, severity: 'ERROR' });
    this.passed = false;
    this.checks.push({ name: check, passed: false, message });
  }

  addWarning(check, message) {
    this.warnings.push({ check, message, severity: 'WARNING' });
    this.checks.push({ name: check, passed: true, warning: true, message });
  }

  addSuccess(check, message) {
    this.checks.push({ name: check, passed: true, message });
  }

  toGateDecision() {
    return {
      decision: this.passed ? 'PASS' : 'FAIL',
      skill: this.skill,
      timestamp: this.timestamp,
      summary: this.passed
        ? `All ${this.checks.length} checks passed`
        : `Failed ${this.errors.length} of ${this.checks.length} checks`,
      errors: this.errors,
      warnings: this.warnings,
      hardGate: !this.passed
    };
  }
}

/**
 * Validate file requirements
 */
async function validateFiles(proofDir, fileRequirements, result) {
  for (const fileReq of fileRequirements) {
    const pattern = path.join(proofDir, fileReq.pattern);
    const files = await glob(pattern, { nocase: true });

    if (fileReq.required && files.length === 0) {
      result.addError('file_required', `Required file missing: ${fileReq.pattern}`);
      continue;
    }

    if (files.length === 0) {
      result.addWarning('file_optional', `Optional file not found: ${fileReq.pattern}`);
      continue;
    }

    // Check each found file
    for (const file of files) {
      const stats = await fs.stat(file);

      // Check minimum size
      if (fileReq.minSize && stats.size < fileReq.minSize) {
        result.addError('file_size',
          `File ${path.basename(file)} is ${stats.size} bytes, minimum required: ${fileReq.minSize}`);
      }

      // Check maximum size
      if (fileReq.maxSize && stats.size > fileReq.maxSize) {
        result.addWarning('file_size',
          `File ${path.basename(file)} is ${stats.size} bytes, exceeds maximum: ${fileReq.maxSize}`);
      }

      // Content validation
      if (fileReq.contentValidation) {
        const content = await fs.readFile(file, 'utf-8');

        if (fileReq.contentValidation.mustContain) {
          for (const required of fileReq.contentValidation.mustContain) {
            if (!content.includes(required)) {
              result.addError('content_validation',
                `File ${path.basename(file)} missing required content: "${required}"`);
            }
          }
        }

        if (fileReq.contentValidation.mustNotContain) {
          for (const forbidden of fileReq.contentValidation.mustNotContain) {
            if (content.includes(forbidden)) {
              result.addError('content_validation',
                `File ${path.basename(file)} contains forbidden content: "${forbidden}"`);
            }
          }
        }
      }

      result.addSuccess('file_found', `Found ${fileReq.type} file: ${path.basename(file)}`);
    }
  }
}

/**
 * Validate markdown sections
 */
async function validateSections(proofFile, requiredSections, result) {
  try {
    const content = await fs.readFile(proofFile, 'utf-8');

    for (const section of requiredSections) {
      const hasSection = content.includes(`## ${section}`) ||
                        content.includes(`# ${section}`) ||
                        content.includes(`### ${section}`);

      if (!hasSection) {
        result.addError('section_missing', `Required section missing: "${section}"`);
      } else {
        result.addSuccess('section_found', `Found section: "${section}"`);
      }
    }
  } catch (error) {
    result.addError('file_read', `Cannot read proof file: ${error.message}`);
  }
}

/**
 * Validate evidence requirements
 */
async function validateEvidence(proofDir, evidence, result) {
  // Check screenshots
  if (evidence.screenshots?.required) {
    const formats = evidence.screenshots.formats || ['png', 'jpg', 'jpeg'];
    const pattern = `**/*.{${formats.join(',')}}`;
    const screenshots = await glob(path.join(proofDir, pattern));

    if (screenshots.length < (evidence.screenshots.minCount || 1)) {
      result.addError('evidence_screenshots',
        `Found ${screenshots.length} screenshots, minimum required: ${evidence.screenshots.minCount || 1}`);
    } else {
      result.addSuccess('evidence_screenshots', `Found ${screenshots.length} screenshots`);
    }
  }

  // Check test results
  if (evidence.testResults?.required) {
    const formats = evidence.testResults.formats || ['json'];
    const testFiles = [];

    for (const format of formats) {
      const pattern = `**/*.${format}`;
      const files = await glob(path.join(proofDir, pattern));
      testFiles.push(...files);
    }

    if (testFiles.length === 0) {
      result.addError('evidence_tests', `No test result files found (formats: ${formats.join(', ')})`);
    } else {
      result.addSuccess('evidence_tests', `Found ${testFiles.length} test result files`);
    }
  }

  // Check logs
  if (evidence.logs?.required) {
    const logFiles = await glob(path.join(proofDir, '**/*.log'));

    if (logFiles.length === 0) {
      result.addError('evidence_logs', 'No log files found');
    } else {
      let totalLines = 0;
      for (const logFile of logFiles) {
        const content = await fs.readFile(logFile, 'utf-8');
        totalLines += content.split('\n').length;
      }

      if (totalLines < (evidence.logs.minLines || 10)) {
        result.addError('evidence_logs',
          `Log files contain ${totalLines} lines, minimum required: ${evidence.logs.minLines || 10}`);
      } else {
        result.addSuccess('evidence_logs', `Found ${logFiles.length} log files with ${totalLines} lines`);
      }
    }
  }

  // Check metrics
  if (evidence.metrics?.required) {
    const metricsFiles = await glob(path.join(proofDir, '**/metrics*.{json,txt,log}'));

    if (metricsFiles.length === 0) {
      result.addError('evidence_metrics', 'No metrics files found');
    } else {
      result.addSuccess('evidence_metrics', `Found ${metricsFiles.length} metrics files`);
    }
  }
}

/**
 * Validate metadata requirements
 */
async function validateMetadata(proofFile, validation, result) {
  try {
    const content = await fs.readFile(proofFile, 'utf-8');

    // Check ticket ID
    if (validation.ticketId?.required) {
      const pattern = new RegExp(validation.ticketId.pattern || 'OCS-[A-Z]+-\\d{4}');
      if (!pattern.test(content)) {
        result.addError('validation_ticket', `No valid ticket ID found (pattern: ${validation.ticketId.pattern})`);
      } else {
        const match = content.match(pattern);
        result.addSuccess('validation_ticket', `Found ticket ID: ${match[0]}`);
      }
    }

    // Check timestamp
    if (validation.timestamp?.required) {
      const datePatterns = {
        iso8601: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
        date: /\d{4}-\d{2}-\d{2}/,
        unix: /\d{10,13}/
      };

      const pattern = datePatterns[validation.timestamp.format] || datePatterns.date;
      if (!pattern.test(content)) {
        result.addError('validation_timestamp', `No timestamp found (format: ${validation.timestamp.format})`);
      } else {
        result.addSuccess('validation_timestamp', 'Found timestamp');
      }
    }

    // Check signatures
    if (validation.signatures?.required) {
      const sigPattern = /Signed-off-by:|Approved by:|Verified by:/gi;
      const matches = content.match(sigPattern) || [];

      if (matches.length < (validation.signatures.minCount || 1)) {
        result.addError('validation_signatures',
          `Found ${matches.length} signatures, minimum required: ${validation.signatures.minCount || 1}`);
      } else {
        result.addSuccess('validation_signatures', `Found ${matches.length} signatures`);
      }
    }
  } catch (error) {
    result.addError('file_read', `Cannot read proof file for validation: ${error.message}`);
  }
}

/**
 * Main validation function
 */
export async function validateProofPack(proofPackPath, skillName = null) {
  const requirements = await loadRequirements();

  // Determine which requirements to use
  let skillRequirements;
  if (skillName && requirements.skills[skillName]) {
    skillRequirements = requirements.skills[skillName].requirements;
  } else {
    skillRequirements = requirements.defaultRequirements;
  }

  const result = new ValidationResult(skillName || 'default');
  const proofDir = path.dirname(proofPackPath);

  // Run all validations
  if (skillRequirements.files) {
    await validateFiles(proofDir, skillRequirements.files, result);
  }

  if (skillRequirements.sections) {
    await validateSections(proofPackPath, skillRequirements.sections, result);
  }

  if (skillRequirements.evidence) {
    await validateEvidence(proofDir, skillRequirements.evidence, result);
  }

  if (skillRequirements.validation) {
    await validateMetadata(proofPackPath, skillRequirements.validation, result);
  }

  return result;
}

/**
 * CLI entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: node proof-validator.js <proof-pack-path> [skill-name]');
    process.exit(1);
  }

  const [proofPath, skill] = args;

  validateProofPack(proofPath, skill)
    .then(result => {
      const decision = result.toGateDecision();
      console.log(JSON.stringify(decision, null, 2));

      // Exit with error code if validation failed (hard gate)
      if (!result.passed) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Validation error:', error.message);
      process.exit(2);
    });
}