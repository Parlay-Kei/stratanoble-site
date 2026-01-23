#!/usr/bin/env node
/**
 * oc_do.js - ANX Minimal Orchestration Entrypoint
 *
 * Accepts a directive, resolves the skill from the registry,
 * calls the skill, and archives outputs/receipts.
 *
 * v2.0.0 - Added proof validation with hard gate failure (stop-on-FAIL)
 *
 * Usage:
 *   node oc_do.js --directive "audit docs" --output ./receipts
 *   node oc_do.js --skill docs-admin-ops --action audit
 *   node oc_do.js --help
 *
 * @version 2.0.0
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ANX_ROOT = 'C:/Dev/.claude-anx';
const SKILLS_INDEX = path.join(ANX_ROOT, 'skills/index.json');
const SKILLS_MANIFEST = path.join(ANX_ROOT, 'skills/manifest.json');
const RECEIPTS_DIR = path.join(ANX_ROOT, 'docs/ops/04-PROOFS');
const MANIFESTS_DIR = path.join(ANX_ROOT, 'docs/ops/05-MANIFESTS');

// Parse arguments
const args = parseArgs(process.argv.slice(2));

async function main() {
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  console.log('[oc_do] ANX Orchestrator v2.0.0 (with proof hard gate)');
  console.log('[oc_do] Canonical root:', ANX_ROOT);

  // Load skill registry
  const registry = loadRegistry();
  if (!registry) {
    console.error('[oc_do] ERROR: Could not load skill registry');
    process.exit(1);
  }

  console.log(`[oc_do] Loaded ${Object.keys(registry.skills).length} skills`);

  // Resolve skill from directive or direct skill name
  let skillId, action;

  if (args.skill) {
    skillId = args.skill;
    action = args.action || 'default';
  } else if (args.directive) {
    const resolved = resolveSkillFromDirective(registry, args.directive);
    if (!resolved) {
      console.error(`[oc_do] ERROR: Could not resolve skill for directive: "${args.directive}"`);
      console.log('[oc_do] Available triggers:', Object.keys(registry.triggerIndex || {}).join(', '));
      process.exit(1);
    }
    skillId = resolved.skillId;
    action = resolved.action;
  } else {
    console.error('[oc_do] ERROR: Must provide --directive or --skill');
    printHelp();
    process.exit(1);
  }

  // Validate skill exists
  const skill = registry.skills[skillId];
  if (!skill) {
    console.error(`[oc_do] ERROR: Skill not found: ${skillId}`);
    console.log('[oc_do] Available skills:', Object.keys(registry.skills).join(', '));
    process.exit(1);
  }

  console.log(`[oc_do] Resolved skill: ${skillId}`);
  console.log(`[oc_do] Skill path: ${skill.path}`);
  console.log(`[oc_do] Action: ${action}`);

  // Verify skill file exists
  if (!fs.existsSync(skill.path)) {
    console.error(`[oc_do] ERROR: Skill file not found: ${skill.path}`);
    process.exit(1);
  }

  // Execute skill with proof validation
  const result = await executeSkill(skill, action, args);

  // Generate receipt
  const receipt = generateReceipt(skillId, action, result);

  // Archive receipt
  const receiptPath = archiveReceipt(receipt, args.output);

  // Check proof validation - HARD GATE
  if (result.proofValidation && result.proofValidation.overall_status === 'FAILED') {
    console.log('\n[oc_do] ========================================');
    console.log('[oc_do] PROOF VALIDATION FAILED - PIPELINE STOPPED');
    console.log('[oc_do] ========================================');
    console.log(`[oc_do] Checks performed: ${result.proofValidation.checks_performed}`);
    console.log(`[oc_do] Checks passed: ${result.proofValidation.checks_passed}`);
    console.log(`[oc_do] Checks failed: ${result.proofValidation.checks_failed}`);
    console.log('\n[oc_do] Failures:');
    for (const failure of result.proofValidation.failures) {
      console.log(`[oc_do]   - [${failure.check_type}] ${failure.requirement}: ${failure.error}`);
    }
    console.log(`\n[oc_do] Receipt: ${receiptPath}`);
    console.log('[oc_do] NO "pass with warnings" allowed. Fix all proof requirements.');
    process.exit(2); // Exit code 2 for proof validation failure
  }

  // Output result
  console.log('\n[oc_do] === EXECUTION COMPLETE ===');
  console.log(`[oc_do] Skill: ${skillId}`);
  console.log(`[oc_do] Action: ${action}`);
  console.log(`[oc_do] Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);

  if (result.proofValidation) {
    console.log(`[oc_do] Proof Validation: ${result.proofValidation.overall_status}`);
    console.log(`[oc_do]   Level: ${result.proofValidation.required_level}`);
    console.log(`[oc_do]   Checks: ${result.proofValidation.checks_passed}/${result.proofValidation.checks_performed} passed`);
  }

  console.log(`[oc_do] Receipt: ${receiptPath}`);
  if (result.manifestPath) {
    console.log(`[oc_do] Manifest: ${result.manifestPath}`);
  }

  // Output JSON envelope
  const envelope = {
    orchestrator: 'oc_do',
    version: '2.0.0',
    skill_id: skillId,
    action: action,
    status: result.success ? 'success' : 'error',
    receipt_path: receiptPath,
    manifest_path: result.manifestPath || null,
    skill_path: skill.path,
    timestamp: new Date().toISOString(),
    artifacts: result.artifacts || [],
    proof_validation: result.proofValidation || null
  };

  console.log('\n[oc_do] JSON Envelope:');
  console.log(JSON.stringify(envelope, null, 2));

  process.exit(result.success ? 0 : 1);
}

/**
 * Parse command line arguments
 */
function parseArgs(argv) {
  const args = {
    directive: null,
    skill: null,
    action: null,
    output: null,
    help: false,
    dryRun: false,
    strictProof: true,  // Default to strict proof validation
    skipProof: false    // Allow skipping proof for testing
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];

    switch (arg) {
      case '--directive':
      case '-d':
        args.directive = next;
        i++;
        break;
      case '--skill':
      case '-s':
        args.skill = next;
        i++;
        break;
      case '--action':
      case '-a':
        args.action = next;
        i++;
        break;
      case '--output':
      case '-o':
        args.output = next;
        i++;
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--skip-proof':
        args.skipProof = true;
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
    }
  }

  return args;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
oc_do - ANX Orchestration Entrypoint v2.0.0

Usage:
  node oc_do.js --directive "<directive>"
  node oc_do.js --skill <skill-id> [--action <action>]
  node oc_do.js --help

Options:
  -d, --directive  Natural language directive (e.g., "audit docs")
  -s, --skill      Direct skill ID (e.g., "docs-admin-ops")
  -a, --action     Action to perform (default: extracted from directive)
  -o, --output     Output directory for receipts
  --dry-run        Preview without execution
  --skip-proof     Skip proof validation (for testing only)
  -h, --help       Show this help

Proof Validation:
  All executions are validated against proof requirements.
  If proof validation FAILS, the pipeline stops immediately.
  Exit codes:
    0 = Success
    1 = Execution failed
    2 = Proof validation failed (HARD GATE)

Examples:
  node oc_do.js --directive "audit docs"
  node oc_do.js --skill qa-gatekeeper-ops --action test
  node oc_do.js --directive "run quality gate"
  node oc_do.js --directive "deploy to production" --dry-run
`);
}

/**
 * Load skill registry from index.json or manifest.json
 */
function loadRegistry() {
  // Try index.json first (preferred)
  if (fs.existsSync(SKILLS_INDEX)) {
    try {
      const content = fs.readFileSync(SKILLS_INDEX, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.warn('[oc_do] WARN: Could not parse index.json:', e.message);
    }
  }

  // Fall back to manifest.json
  if (fs.existsSync(SKILLS_MANIFEST)) {
    try {
      const content = fs.readFileSync(SKILLS_MANIFEST, 'utf-8');
      const manifest = JSON.parse(content);

      // Convert manifest format to registry format
      const registry = {
        skills: {},
        triggerIndex: manifest.problemTypeMapping || {}
      };

      for (const [id, skill] of Object.entries(manifest.skills)) {
        registry.skills[id] = {
          id,
          name: skill.name,
          path: skill.filePath,
          capabilities: skill.capabilities || [],
          triggers: skill.triggers || []
        };

        // Build trigger index
        for (const trigger of skill.triggers || []) {
          registry.triggerIndex[trigger.toLowerCase()] = id;
        }
      }

      return registry;
    } catch (e) {
      console.warn('[oc_do] WARN: Could not parse manifest.json:', e.message);
    }
  }

  return null;
}

/**
 * Resolve skill ID from natural language directive
 */
function resolveSkillFromDirective(registry, directive) {
  const directiveLower = directive.toLowerCase().trim();

  // 1. Exact trigger match
  if (registry.triggerIndex && registry.triggerIndex[directiveLower]) {
    return {
      skillId: registry.triggerIndex[directiveLower],
      action: extractAction(directiveLower)
    };
  }

  // 2. Partial trigger match
  for (const [trigger, skillId] of Object.entries(registry.triggerIndex || {})) {
    if (directiveLower.includes(trigger) || trigger.includes(directiveLower)) {
      return {
        skillId,
        action: extractAction(directiveLower)
      };
    }
  }

  // 3. Keyword match against skill capabilities
  for (const [skillId, skill] of Object.entries(registry.skills)) {
    const keywords = [
      ...(skill.capabilities || []),
      ...(skill.triggers || []),
      skill.name?.toLowerCase() || ''
    ];

    for (const keyword of keywords) {
      if (directiveLower.includes(keyword.toLowerCase())) {
        return {
          skillId,
          action: extractAction(directiveLower)
        };
      }
    }
  }

  return null;
}

/**
 * Extract action from directive
 */
function extractAction(directive) {
  const actionWords = ['audit', 'scan', 'test', 'deploy', 'release', 'fetch', 'check', 'validate', 'run', 'generate', 'gate'];

  for (const word of actionWords) {
    if (directive.includes(word)) {
      return word;
    }
  }

  return 'execute';
}

/**
 * Get default proof requirements by skill type
 */
function getDefaultProofRequirements(skillId) {
  const strictSkills = ['platform-ops', 'browser-operator-ops'];
  const minimalSkills = ['docs-admin-ops', 'file-monitor-ops'];

  // Special test skill for FAIL case demonstration
  if (skillId === 'browser-operator-ops') {
    return {
      proof_level: 'strict',
      required_files: [
        {
          path: 'screenshots/{{execution_id}}_dashboard.png',
          type: 'image/png',
          min_bytes: 1024,
          description: 'Dashboard screenshot after login'
        }
      ],
      required_metadata: [
        { key: 'execution_id', type: 'string', required: true },
        { key: 'status', type: 'enum', values: ['success', 'partial', 'failed'], required: true },
        { key: 'screenshot_path', type: 'string', required: true }
      ]
    };
  }

  if (strictSkills.includes(skillId)) {
    return {
      proof_level: 'strict',
      required_files: [],
      required_metadata: [
        { key: 'execution_id', type: 'string', required: true },
        { key: 'status', type: 'enum', values: ['success', 'partial', 'failed'], required: true }
      ]
    };
  }

  if (minimalSkills.includes(skillId)) {
    return {
      proof_level: 'minimal',
      required_files: [],
      required_metadata: [
        { key: 'execution_id', type: 'string', required: true }
      ]
    };
  }

  // Standard level
  return {
    proof_level: 'standard',
    required_files: [],
    required_metadata: [
      { key: 'execution_id', type: 'string', required: true },
      { key: 'status', type: 'enum', values: ['success', 'partial', 'failed'], required: true }
    ]
  };
}

/**
 * Validate proof requirements
 */
function validateProofRequirements(requirements, outputData, executionId) {
  const validation = {
    required_level: requirements.proof_level,
    checks_performed: 0,
    checks_passed: 0,
    checks_failed: 0,
    failures: [],
    overall_status: 'PENDING'
  };

  // Validate metadata
  for (const metaReq of (requirements.required_metadata || [])) {
    validation.checks_performed++;

    const actualValue = outputData?.[metaReq.key];

    // Check presence
    if (actualValue === undefined || actualValue === null) {
      if (metaReq.required !== false) {
        validation.checks_failed++;
        validation.failures.push({
          check_type: 'metadata',
          requirement: metaReq.key,
          error: `Missing required metadata: ${metaReq.key}`
        });
        continue;
      }
    }

    // Type validation
    let typeValid = true;
    switch (metaReq.type) {
      case 'string':
        typeValid = typeof actualValue === 'string';
        if (typeValid && metaReq.pattern) {
          typeValid = new RegExp(metaReq.pattern).test(actualValue);
        }
        break;
      case 'number':
        typeValid = typeof actualValue === 'number';
        if (typeValid && metaReq.min !== undefined) {
          typeValid = actualValue >= metaReq.min;
        }
        break;
      case 'enum':
        typeValid = metaReq.values.includes(actualValue);
        break;
      case 'boolean':
        typeValid = typeof actualValue === 'boolean';
        break;
    }

    if (!typeValid) {
      validation.checks_failed++;
      validation.failures.push({
        check_type: 'metadata',
        requirement: metaReq.key,
        error: `Invalid value for ${metaReq.key}: ${actualValue}`
      });
      continue;
    }

    validation.checks_passed++;
  }

  // Validate required files
  for (const fileReq of (requirements.required_files || [])) {
    validation.checks_performed++;

    const actualPath = fileReq.path
      .replace('{{execution_id}}', executionId)
      .replace('{{timestamp}}', new Date().toISOString().replace(/[:.]/g, '-'));

    const fullPath = path.join(RECEIPTS_DIR, actualPath);

    if (!fs.existsSync(fullPath)) {
      validation.checks_failed++;
      validation.failures.push({
        check_type: 'file',
        requirement: fileReq.path,
        error: `File not found: ${fullPath}`
      });
      continue;
    }

    const stats = fs.statSync(fullPath);
    if (stats.size < (fileReq.min_bytes || 0)) {
      validation.checks_failed++;
      validation.failures.push({
        check_type: 'file',
        requirement: fileReq.path,
        error: `File too small: ${stats.size} bytes < required ${fileReq.min_bytes} bytes`
      });
      continue;
    }

    validation.checks_passed++;
  }

  // HARD GATE: ANY failure = FAIL (no warnings allowed)
  validation.overall_status = validation.checks_failed > 0 ? 'FAILED' : 'PASSED';

  return validation;
}

/**
 * Generate execution ID
 */
function generateExecutionId() {
  return `EXE-${Date.now()}`;
}

/**
 * Save run manifest
 */
function saveManifest(manifest) {
  const timestamp = new Date().toISOString();
  const date = timestamp.split('T')[0];
  const year = date.split('-')[0];
  const month = date.substring(0, 7);

  const manifestDir = path.join(MANIFESTS_DIR, year, month);
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }

  const manifestPath = path.join(manifestDir, `${manifest.execution_id}_manifest.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  return manifestPath;
}

/**
 * Execute a skill
 */
async function executeSkill(skill, action, cmdArgs) {
  const executionId = generateExecutionId();
  const startTime = Date.now();
  const startTimestamp = new Date().toISOString();

  let result;

  try {
    // Read skill content
    const skillContent = fs.readFileSync(skill.path, 'utf-8');

    // Extract frontmatter
    const frontmatterMatch = skillContent.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';

    // Build output data
    const outputData = {
      execution_id: executionId,
      status: 'success',
      skill_id: skill.id,
      action: action
    };

    // For now, return skill metadata as proof of addressability
    result = {
      success: true,
      skill: skill.id,
      action: action,
      skillFound: true,
      skillPath: skill.path,
      skillSize: skillContent.length,
      frontmatter: frontmatter,
      capabilities: skill.capabilities,
      executionTime: Date.now() - startTime,
      artifacts: [skill.path],
      output: `Skill ${skill.id} loaded successfully. Content length: ${skillContent.length} bytes.`,
      outputData: outputData
    };

    // If dry run, mark as such
    if (cmdArgs.dryRun) {
      result.dryRun = true;
      result.output = `[DRY RUN] Would execute ${skill.id}:${action}`;
    }

  } catch (error) {
    result = {
      success: false,
      skill: skill.id,
      action: action,
      error: error.message,
      executionTime: Date.now() - startTime,
      outputData: {
        execution_id: executionId,
        status: 'failed'
      }
    };
  }

  // Skip proof validation if requested
  if (cmdArgs.skipProof) {
    result.proofValidation = {
      required_level: 'skipped',
      checks_performed: 0,
      checks_passed: 0,
      checks_failed: 0,
      failures: [],
      overall_status: 'SKIPPED'
    };
  } else {
    // Validate proof requirements
    const requirements = getDefaultProofRequirements(skill.id);
    result.proofValidation = validateProofRequirements(
      requirements,
      result.outputData,
      executionId
    );
  }

  // Generate and save manifest
  const manifest = {
    execution_id: executionId,
    skill_id: skill.id,
    action: action,
    started_at: startTimestamp,
    completed_at: new Date().toISOString(),
    duration_ms: Date.now() - startTime,
    inputs: {
      directive: cmdArgs.directive,
      params: {}
    },
    outputs: {
      files: [],
      links: [],
      data: result.outputData
    },
    exit_status: result.success ? 'success' : 'failed',
    exit_code: result.success ? 0 : 1,
    error_message: result.error || null,
    proof_validation: result.proofValidation
  };

  result.manifestPath = saveManifest(manifest);

  return result;
}

/**
 * Generate receipt document
 */
function generateReceipt(skillId, action, result) {
  const timestamp = new Date().toISOString();
  const date = timestamp.split('T')[0];

  const proofStatus = result.proofValidation?.overall_status || 'N/A';
  const proofLevel = result.proofValidation?.required_level || 'N/A';
  const proofChecks = result.proofValidation
    ? `${result.proofValidation.checks_passed}/${result.proofValidation.checks_performed}`
    : 'N/A';

  let failureSection = '';
  if (result.proofValidation?.failures?.length > 0) {
    failureSection = `
## Proof Validation Failures

| Type | Requirement | Error |
|------|-------------|-------|
${result.proofValidation.failures.map(f => `| ${f.check_type} | ${f.requirement} | ${f.error} |`).join('\n')}

**NOTE**: No "pass with warnings" allowed. All failures must be fixed.
`;
  }

  return `# Execution Receipt

**Orchestrator**: oc_do v2.0.0
**Timestamp**: ${timestamp}
**Skill**: ${skillId}
**Action**: ${action}
**Status**: ${result.success ? 'SUCCESS' : 'FAILED'}

## Proof Validation

| Field | Value |
|-------|-------|
| Overall Status | **${proofStatus}** |
| Proof Level | ${proofLevel} |
| Checks Passed | ${proofChecks} |

${failureSection}

## Execution Details

| Field | Value |
|-------|-------|
| Execution ID | ${result.outputData?.execution_id || 'N/A'} |
| Skill ID | ${skillId} |
| Skill Path | ${result.skillPath || 'N/A'} |
| Skill Size | ${result.skillSize || 'N/A'} bytes |
| Execution Time | ${result.executionTime || 0}ms |
| Dry Run | ${result.dryRun ? 'Yes' : 'No'} |

## Output

\`\`\`
${result.output || result.error || 'No output'}
\`\`\`

## Artifacts

${(result.artifacts || []).map(a => `- ${a}`).join('\n') || 'None'}

## Manifest

${result.manifestPath ? `Saved to: ${result.manifestPath}` : 'No manifest generated'}

---
*Generated by oc_do orchestrator v2.0.0 with proof hard gate*
`;
}

/**
 * Archive receipt to filesystem
 */
function archiveReceipt(receipt, outputDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `RECEIPT_OC_DO_${timestamp}.md`;

  // Use provided output dir or default
  const targetDir = outputDir || path.join(RECEIPTS_DIR, new Date().getFullYear().toString(), new Date().toISOString().slice(0, 7));

  // Ensure directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const receiptPath = path.join(targetDir, filename);
  fs.writeFileSync(receiptPath, receipt, 'utf-8');

  return receiptPath;
}

// Run
main().catch(err => {
  console.error('[oc_do] FATAL:', err.message);
  process.exit(1);
});
