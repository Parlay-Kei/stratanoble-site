#!/usr/bin/env node
/**
 * skill-executor.js - MCP Skill Execution Module
 *
 * Provides actual execution of skills via shell commands, APIs, and file operations.
 * Used by both anx-ops MCP server and oc_do orchestrator.
 *
 * v2.0.0 - Added run manifest generation and proof validation support
 *
 * @version 2.0.0
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import crypto from 'crypto';

const execAsync = promisify(exec);

const ANX_ROOT = 'C:/Dev/.claude-anx';
const SKILLS_INDEX = path.join(ANX_ROOT, 'skills/index.json');
const PROOFS_DIR = path.join(ANX_ROOT, 'docs/ops/04-PROOFS');
const MANIFESTS_DIR = path.join(ANX_ROOT, 'docs/ops/05-MANIFESTS');

/**
 * Generate unique execution ID
 */
function generateExecutionId() {
  return `EXE-${Date.now()}`;
}

/**
 * Load skill registry
 */
export async function loadSkillRegistry() {
  try {
    const content = await fs.readFile(SKILLS_INDEX, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to load skill registry:', err.message);
    return null;
  }
}

/**
 * Load proof requirements for a skill
 */
export async function loadProofRequirements(skillId) {
  const registry = await loadSkillRegistry();
  const skill = registry?.skills?.[skillId];
  if (!skill) return null;

  // Read skill file and extract proof_requirements from frontmatter
  try {
    const content = await fs.readFile(skill.path, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return getDefaultProofRequirements(skillId);

    // Simple YAML-like parsing for proof_requirements
    const frontmatter = frontmatterMatch[1];
    if (!frontmatter.includes('proof_requirements')) {
      return getDefaultProofRequirements(skillId);
    }

    // For now, return defaults - full YAML parsing would go here
    return getDefaultProofRequirements(skillId);
  } catch {
    return getDefaultProofRequirements(skillId);
  }
}

/**
 * Get default proof requirements by skill type
 */
function getDefaultProofRequirements(skillId) {
  const strictSkills = ['platform-ops', 'browser-operator-ops'];
  const minimalSkills = ['docs-admin-ops', 'file-monitor-ops'];

  if (strictSkills.includes(skillId)) {
    return {
      proof_level: 'strict',
      required_files: [
        { path: 'outputs/{{execution_id}}.json', type: 'application/json', min_bytes: 50 }
      ],
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
    required_files: [
      { path: 'outputs/{{execution_id}}.json', type: 'application/json', min_bytes: 50 }
    ],
    required_metadata: [
      { key: 'execution_id', type: 'string', required: true },
      { key: 'status', type: 'enum', values: ['success', 'partial', 'failed'], required: true }
    ]
  };
}

/**
 * Generate run manifest for an execution
 */
export function generateRunManifest(execution) {
  const manifest = {
    // Identification
    execution_id: execution.executionId,
    skill_id: execution.skillId,
    action: execution.action,

    // Timing
    started_at: execution.startedAt,
    completed_at: execution.completedAt,
    duration_ms: execution.duration,

    // Inputs
    inputs: {
      directive: execution.directive || null,
      params: execution.params || {},
      context: execution.context || {}
    },

    // Outputs
    outputs: {
      files: execution.outputFiles || [],
      links: execution.outputLinks || [],
      data: execution.outputData || {}
    },

    // Status
    exit_status: execution.success ? 'success' : 'failed',
    exit_code: execution.success ? 0 : 1,
    error_message: execution.error || null,

    // Proof validation (to be filled by validator)
    proof_validation: {
      required_level: execution.proofLevel || 'standard',
      checks_performed: 0,
      checks_passed: 0,
      checks_failed: 0,
      failures: [],
      overall_status: 'PENDING'
    }
  };

  return manifest;
}

/**
 * Validate proof requirements against outputs
 */
export async function validateProofRequirements(requirements, outputs, executionId) {
  const validation = {
    required_level: requirements.proof_level,
    checks_performed: 0,
    checks_passed: 0,
    checks_failed: 0,
    failures: [],
    overall_status: 'PENDING'
  };

  // Validate files
  for (const fileReq of (requirements.required_files || [])) {
    validation.checks_performed++;

    // Substitute variables in path
    const actualPath = fileReq.path
      .replace('{{execution_id}}', executionId)
      .replace('{{timestamp}}', new Date().toISOString().replace(/[:.]/g, '-'));

    const fullPath = path.join(PROOFS_DIR, actualPath);

    // Check existence
    if (!fsSync.existsSync(fullPath)) {
      validation.checks_failed++;
      validation.failures.push({
        check_type: 'file',
        requirement: fileReq.path,
        error: `File not found: ${fullPath}`
      });
      continue;
    }

    // Check size
    const stats = fsSync.statSync(fullPath);
    if (stats.size < fileReq.min_bytes) {
      validation.checks_failed++;
      validation.failures.push({
        check_type: 'file',
        requirement: fileReq.path,
        error: `File too small: ${stats.size} bytes < required ${fileReq.min_bytes} bytes`
      });
      continue;
    }

    // Check MIME type (basic check by extension)
    const mimeCheck = validateMimeType(fullPath, fileReq.type);
    if (!mimeCheck.valid) {
      validation.checks_failed++;
      validation.failures.push({
        check_type: 'file',
        requirement: fileReq.path,
        error: mimeCheck.error
      });
      continue;
    }

    validation.checks_passed++;
  }

  // Validate metadata
  for (const metaReq of (requirements.required_metadata || [])) {
    validation.checks_performed++;

    const actualValue = outputs.data?.[metaReq.key];

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

  // Validate links
  for (const linkReq of (requirements.required_links || [])) {
    if (!linkReq.must_resolve) {
      continue;
    }

    validation.checks_performed++;

    const actualUrl = outputs.links?.find(l => l.description === linkReq.description)?.url;
    if (!actualUrl) {
      validation.checks_failed++;
      validation.failures.push({
        check_type: 'link',
        requirement: linkReq.description,
        error: `Link not provided: ${linkReq.description}`
      });
      continue;
    }

    try {
      const response = await fetch(actualUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(linkReq.timeout_ms || 5000)
      });

      const expectedStatuses = linkReq.expected_status || [200, 201, 204];
      if (!expectedStatuses.includes(response.status)) {
        validation.checks_failed++;
        validation.failures.push({
          check_type: 'link',
          requirement: linkReq.description,
          error: `Unexpected status ${response.status} for ${actualUrl}`
        });
        continue;
      }

      validation.checks_passed++;
    } catch (err) {
      validation.checks_failed++;
      validation.failures.push({
        check_type: 'link',
        requirement: linkReq.description,
        error: `Failed to resolve: ${err.message}`
      });
    }
  }

  // HARD GATE: ANY failure = FAIL (no warnings allowed)
  validation.overall_status = validation.checks_failed > 0 ? 'FAILED' : 'PASSED';

  return validation;
}

/**
 * Basic MIME type validation by extension
 */
function validateMimeType(filePath, expectedType) {
  const ext = path.extname(filePath).toLowerCase();
  const extToMime = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.webm': 'video/webm',
    '.mp4': 'video/mp4',
    '.json': 'application/json',
    '.pdf': 'application/pdf',
    '.md': 'text/markdown',
    '.txt': 'text/plain'
  };

  const detectedType = extToMime[ext] || 'application/octet-stream';

  if (detectedType !== expectedType) {
    return {
      valid: false,
      error: `Wrong file type: detected ${detectedType}, expected ${expectedType}`
    };
  }

  // For JSON files, validate it's actually parseable
  if (expectedType === 'application/json') {
    try {
      const content = fsSync.readFileSync(filePath, 'utf-8');
      JSON.parse(content);
    } catch {
      return {
        valid: false,
        error: 'File is not valid JSON'
      };
    }
  }

  return { valid: true };
}

/**
 * Save run manifest to disk
 */
export async function saveRunManifest(manifest) {
  const timestamp = new Date().toISOString();
  const date = timestamp.split('T')[0];
  const year = date.split('-')[0];
  const month = date.substring(0, 7);

  const manifestDir = path.join(MANIFESTS_DIR, year, month);
  await fs.mkdir(manifestDir, { recursive: true });

  const manifestPath = path.join(manifestDir, `${manifest.execution_id}_manifest.json`);
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  return manifestPath;
}

/**
 * Execute a skill action with full manifest and proof validation
 * @param {string} skillId - Skill identifier
 * @param {string} action - Action to perform
 * @param {object} params - Additional parameters
 * @returns {Promise<object>} Execution result with manifest
 */
export async function executeSkill(skillId, action, params = {}) {
  const executionId = generateExecutionId();
  const startTime = new Date().toISOString();
  const startMs = Date.now();

  const execution = {
    executionId,
    skillId,
    action,
    params,
    startedAt: startTime,
    success: false,
    output: null,
    error: null,
    outputFiles: [],
    outputLinks: [],
    outputData: {},
    artifacts: [],
    duration: 0
  };

  try {
    // Route to specific executor based on skill
    let result;
    switch (skillId) {
      case 'qa-gatekeeper-ops':
        result = await executeQAGatekeeper(action, params, executionId);
        break;

      case 'platform-ops':
        result = await executePlatformOps(action, params, executionId);
        break;

      case 'docs-admin-ops':
        result = await executeDocsAdmin(action, params, executionId);
        break;

      case 'release-ops':
        result = await executeReleaseOps(action, params, executionId);
        break;

      case 'web-operator-ops':
        result = await executeWebOperator(action, params, executionId);
        break;

      case 'security-ops':
        result = await executeSecurityOps(action, params, executionId);
        break;

      default:
        result = { success: false, error: `No executor implemented for skill: ${skillId}` };
    }

    Object.assign(execution, result);
    execution.outputData = {
      execution_id: executionId,
      status: result.success ? 'success' : 'failed',
      ...result.outputData
    };

  } catch (err) {
    execution.error = err.message;
    execution.outputData = {
      execution_id: executionId,
      status: 'failed'
    };
  }

  execution.completedAt = new Date().toISOString();
  execution.duration = Date.now() - startMs;

  // Load proof requirements and validate
  const proofRequirements = await loadProofRequirements(skillId);
  execution.proofLevel = proofRequirements?.proof_level || 'standard';

  // Generate manifest
  const manifest = generateRunManifest(execution);

  // Validate proof requirements
  const validation = await validateProofRequirements(
    proofRequirements || getDefaultProofRequirements(skillId),
    manifest.outputs,
    executionId
  );

  manifest.proof_validation = validation;

  // Save manifest
  const manifestPath = await saveRunManifest(manifest);

  return {
    ...execution,
    manifest,
    manifestPath,
    proofValidation: validation
  };
}

/**
 * QA Gatekeeper skill executor
 */
async function executeQAGatekeeper(action, params, executionId) {
  const result = { success: false, output: null, artifacts: [], outputData: {} };
  const workDir = params.workDir || process.cwd();

  switch (action) {
    case 'test':
    case 'run': {
      const scope = params.scope || 'all';
      let cmd;

      switch (scope) {
        case 'unit':
          cmd = 'npm run test:unit 2>&1 || npm test 2>&1';
          break;
        case 'lint':
          cmd = 'npm run lint 2>&1';
          break;
        case 'types':
          cmd = 'npx tsc --noEmit 2>&1';
          break;
        default:
          cmd = 'npm test 2>&1';
      }

      try {
        const { stdout, stderr } = await execAsync(cmd, { cwd: workDir, timeout: 120000 });
        result.success = true;
        result.output = stdout || stderr;
        result.outputData = { tests_passed: true, scope };
      } catch (err) {
        result.output = err.stdout || err.stderr || err.message;
        result.success = false;
        result.outputData = { tests_passed: false, scope, error: err.message };
      }
      break;
    }

    case 'gate': {
      // Run full quality gate
      const checks = [];

      // Lint
      try {
        await execAsync('npm run lint', { cwd: workDir, timeout: 60000 });
        checks.push({ name: 'lint', passed: true });
      } catch {
        checks.push({ name: 'lint', passed: false });
      }

      // Types
      try {
        await execAsync('npx tsc --noEmit', { cwd: workDir, timeout: 60000 });
        checks.push({ name: 'types', passed: true });
      } catch {
        checks.push({ name: 'types', passed: false });
      }

      // Tests
      try {
        await execAsync('npm test', { cwd: workDir, timeout: 120000 });
        checks.push({ name: 'test', passed: true });
      } catch {
        checks.push({ name: 'test', passed: false });
      }

      result.success = checks.every(c => c.passed);
      result.output = JSON.stringify({
        gate: result.success ? 'PASS' : 'FAIL',
        checks,
        passed: checks.filter(c => c.passed).length,
        failed: checks.filter(c => !c.passed).length
      }, null, 2);
      result.outputData = {
        gate_result: result.success ? 'PASS' : 'FAIL',
        checks,
        checks_passed: checks.filter(c => c.passed).length,
        checks_failed: checks.filter(c => !c.passed).length
      };
      break;
    }

    case 'validate_proof': {
      // Validate proof requirements for another execution
      const targetExecutionId = params.execution_id;
      const targetSkillId = params.skill_id;

      if (!targetExecutionId || !targetSkillId) {
        result.output = 'execution_id and skill_id are required';
        break;
      }

      const requirements = await loadProofRequirements(targetSkillId);
      const manifestPath = path.join(
        MANIFESTS_DIR,
        new Date().getFullYear().toString(),
        new Date().toISOString().substring(0, 7),
        `${targetExecutionId}_manifest.json`
      );

      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const targetManifest = JSON.parse(manifestContent);

        const validation = await validateProofRequirements(
          requirements,
          targetManifest.outputs,
          targetExecutionId
        );

        result.success = validation.overall_status === 'PASSED';
        result.output = JSON.stringify(validation, null, 2);
        result.outputData = validation;
      } catch (err) {
        result.output = `Failed to validate: ${err.message}`;
        result.outputData = { error: err.message };
      }
      break;
    }

    default:
      result.output = `Unknown QA action: ${action}`;
  }

  return result;
}

/**
 * Platform Ops skill executor
 */
async function executePlatformOps(action, params, executionId) {
  const result = { success: false, output: null, artifacts: [], outputLinks: [], outputData: {} };

  switch (action) {
    case 'deploy': {
      const env = params.env || 'preview';
      const cmd = env === 'production' ? 'vercel --prod --yes' : 'vercel --yes';

      try {
        const { stdout } = await execAsync(cmd, { timeout: 300000 });
        result.success = true;
        result.output = stdout;

        // Extract deployment URL
        const urlMatch = stdout.match(/https:\/\/[^\s]+\.vercel\.app/);
        if (urlMatch) {
          result.artifacts.push({ type: 'deployment_url', value: urlMatch[0] });
          result.outputLinks.push({ url: urlMatch[0], description: 'Deployed application URL' });
          result.outputData.deployed_url = urlMatch[0];
        }

        result.outputData.environment = env;
      } catch (err) {
        result.output = err.message;
        result.outputData.error = err.message;
      }
      break;
    }

    case 'status': {
      try {
        const { stdout } = await execAsync('vercel ls --json', { timeout: 30000 });
        const deployments = JSON.parse(stdout);
        result.success = true;
        result.output = JSON.stringify({
          deployments: deployments.slice(0, 5).map(d => ({
            url: d.url,
            state: d.state,
            created: d.created
          }))
        }, null, 2);
        result.outputData = { deployment_count: deployments.length };
      } catch (err) {
        result.output = err.message;
      }
      break;
    }

    case 'migrate': {
      try {
        const { stdout } = await execAsync('supabase db push', { timeout: 60000 });
        result.success = true;
        result.output = stdout;
        result.outputData.migration_complete = true;
      } catch (err) {
        result.output = err.message;
        result.outputData.migration_complete = false;
      }
      break;
    }

    default:
      result.output = `Unknown platform action: ${action}`;
  }

  return result;
}

/**
 * Docs Admin skill executor
 */
async function executeDocsAdmin(action, params, executionId) {
  const result = { success: false, output: null, artifacts: [], outputData: {} };
  const docsPath = params.path || './docs';

  switch (action) {
    case 'audit':
    case 'scan': {
      try {
        // Scan for markdown files
        const { stdout: files } = await execAsync(
          `find "${docsPath}" -name "*.md" -type f 2>/dev/null || dir /s /b "${docsPath}\\*.md" 2>nul`,
          { timeout: 30000 }
        );

        const fileList = files.split('\n').filter(Boolean);

        // Analyze each file
        const analysis = {
          totalFiles: fileList.length,
          withFrontmatter: 0,
          withoutFrontmatter: 0,
          stale: [],
          files: []
        };

        for (const file of fileList.slice(0, 50)) { // Limit to 50 files
          try {
            const content = await fs.readFile(file.trim(), 'utf-8');
            const hasFrontmatter = content.startsWith('---');
            const wordCount = content.split(/\s+/).length;

            if (hasFrontmatter) analysis.withFrontmatter++;
            else analysis.withoutFrontmatter++;

            analysis.files.push({
              path: file.trim(),
              hasFrontmatter,
              wordCount
            });
          } catch {}
        }

        result.success = true;
        result.output = JSON.stringify({
          summary: {
            total: analysis.totalFiles,
            withFrontmatter: analysis.withFrontmatter,
            withoutFrontmatter: analysis.withoutFrontmatter,
            healthScore: Math.round((analysis.withFrontmatter / analysis.totalFiles) * 100) || 0
          },
          files: analysis.files.slice(0, 10)
        }, null, 2);
        result.outputData = {
          files_scanned: analysis.totalFiles,
          health_score: Math.round((analysis.withFrontmatter / analysis.totalFiles) * 100) || 0
        };
      } catch (err) {
        result.output = err.message;
      }
      break;
    }

    default:
      result.output = `Unknown docs action: ${action}`;
  }

  return result;
}

/**
 * Release Ops skill executor
 */
async function executeReleaseOps(action, params, executionId) {
  const result = { success: false, output: null, artifacts: [], outputData: {} };

  switch (action) {
    case 'version': {
      try {
        const pkg = JSON.parse(await fs.readFile('./package.json', 'utf-8'));
        result.success = true;
        result.output = JSON.stringify({
          name: pkg.name,
          version: pkg.version,
          description: pkg.description
        }, null, 2);
        result.outputData = { current_version: pkg.version };
      } catch (err) {
        result.output = err.message;
      }
      break;
    }

    case 'changelog': {
      const fromTag = params.from || 'HEAD~10';
      try {
        const { stdout } = await execAsync(
          `git log ${fromTag}..HEAD --pretty=format:"%h %s" --no-merges`,
          { timeout: 30000 }
        );
        result.success = true;
        result.output = stdout || 'No commits found';
        result.outputData = { commits_found: stdout.split('\n').filter(Boolean).length };
      } catch (err) {
        result.output = err.message;
      }
      break;
    }

    case 'release': {
      const level = params.level || 'patch';
      try {
        // Bump version
        const { stdout: bumpOut } = await execAsync(`npm version ${level} --no-git-tag-version`);

        // Get new version
        const pkg = JSON.parse(await fs.readFile('./package.json', 'utf-8'));

        result.success = true;
        result.output = JSON.stringify({
          action: 'version_bumped',
          level,
          newVersion: pkg.version,
          bumpOutput: bumpOut.trim()
        }, null, 2);
        result.outputData = { new_version: pkg.version, level };
      } catch (err) {
        result.output = err.message;
      }
      break;
    }

    default:
      result.output = `Unknown release action: ${action}`;
  }

  return result;
}

/**
 * Web Operator skill executor
 */
async function executeWebOperator(action, params, executionId) {
  const result = { success: false, output: null, artifacts: [], outputLinks: [], outputData: {} };

  switch (action) {
    case 'fetch': {
      const url = params.url;
      if (!url) {
        result.output = 'URL is required';
        break;
      }

      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'ANX-WebOperator/1.0' }
        });

        const contentType = response.headers.get('content-type') || '';
        let body;

        if (contentType.includes('application/json')) {
          body = await response.json();
        } else {
          body = await response.text();
          // Truncate if too long
          if (body.length > 5000) {
            body = body.substring(0, 5000) + '\n...[truncated]';
          }
        }

        result.success = response.ok;
        result.output = JSON.stringify({
          url,
          status: response.status,
          statusText: response.statusText,
          contentType,
          bodyLength: typeof body === 'string' ? body.length : JSON.stringify(body).length,
          body: typeof body === 'object' ? body : body.substring(0, 1000)
        }, null, 2);
        result.outputLinks.push({ url, description: 'Fetched URL' });
        result.outputData = { url, status: response.status, success: response.ok };
      } catch (err) {
        result.output = err.message;
        result.outputData = { url, error: err.message };
      }
      break;
    }

    case 'check': {
      const url = params.url;
      if (!url) {
        result.output = 'URL is required';
        break;
      }

      try {
        const start = Date.now();
        const response = await fetch(url, { method: 'HEAD' });
        const latency = Date.now() - start;

        result.success = response.ok;
        result.output = JSON.stringify({
          url,
          healthy: response.ok,
          status: response.status,
          latencyMs: latency
        }, null, 2);
        result.outputData = { url, healthy: response.ok, latency_ms: latency };
      } catch (err) {
        result.output = JSON.stringify({
          url,
          healthy: false,
          error: err.message
        }, null, 2);
        result.outputData = { url, healthy: false, error: err.message };
      }
      break;
    }

    default:
      result.output = `Unknown web action: ${action}`;
  }

  return result;
}

/**
 * Security Ops skill executor
 */
async function executeSecurityOps(action, params, executionId) {
  const result = { success: false, output: null, artifacts: [], outputData: {} };

  switch (action) {
    case 'audit':
    case 'scan': {
      try {
        const { stdout, stderr } = await execAsync('npm audit --json', { timeout: 60000 });
        const audit = JSON.parse(stdout || stderr);

        result.success = (audit.metadata?.vulnerabilities?.high || 0) === 0 &&
                        (audit.metadata?.vulnerabilities?.critical || 0) === 0;

        result.output = JSON.stringify({
          summary: audit.metadata?.vulnerabilities || {},
          totalDependencies: audit.metadata?.dependencies || 0,
          shipReady: result.success
        }, null, 2);
        result.outputData = {
          vulnerabilities: audit.metadata?.vulnerabilities || {},
          ship_ready: result.success
        };
      } catch (err) {
        // npm audit returns non-zero exit code when vulnerabilities found
        try {
          const audit = JSON.parse(err.stdout || '{}');
          result.output = JSON.stringify({
            summary: audit.metadata?.vulnerabilities || {},
            shipReady: false
          }, null, 2);
          result.outputData = {
            vulnerabilities: audit.metadata?.vulnerabilities || {},
            ship_ready: false
          };
        } catch {
          result.output = err.message;
        }
      }
      break;
    }

    case 'secrets': {
      const searchPath = params.path || '.';
      try {
        // Simple secret pattern search
        const patterns = [
          'api[_-]?key',
          'secret[_-]?key',
          'password',
          'sk_live_',
          'sk_test_'
        ];

        const findings = [];
        for (const pattern of patterns) {
          try {
            const { stdout } = await execAsync(
              `grep -r -l -i "${pattern}" "${searchPath}" --include="*.{ts,js,json,env}" 2>/dev/null | head -10`,
              { timeout: 30000 }
            );
            if (stdout.trim()) {
              findings.push({ pattern, files: stdout.trim().split('\n') });
            }
          } catch {}
        }

        result.success = findings.length === 0;
        result.output = JSON.stringify({
          scanned: searchPath,
          findings,
          clean: findings.length === 0
        }, null, 2);
        result.outputData = { clean: findings.length === 0, findings_count: findings.length };
      } catch (err) {
        result.output = err.message;
      }
      break;
    }

    default:
      result.output = `Unknown security action: ${action}`;
  }

  return result;
}

// Export for MCP integration
export default {
  executeSkill,
  loadSkillRegistry,
  loadProofRequirements,
  validateProofRequirements,
  generateRunManifest,
  saveRunManifest,
  executeQAGatekeeper,
  executePlatformOps,
  executeDocsAdmin,
  executeReleaseOps,
  executeWebOperator,
  executeSecurityOps
};
