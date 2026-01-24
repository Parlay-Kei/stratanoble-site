#!/usr/bin/env node
/**
 * Minimal Agentic Loop v1
 * File-based mission executor with no UI dependency
 *
 * Watches: C:\Dev\.claude-anx\intake\missions\
 * Outputs: C:\Dev\.claude-anx\proof-packs\
 * Logs: C:\Dev\.claude-anx\runtime\execution.log
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Directories
const INTAKE_DIR = 'C:\\Dev\\.claude-anx\\intake\\missions';
const PROOF_DIR = 'C:\\Dev\\.claude-anx\\proof-packs';
const RUNTIME_DIR = 'C:\\Dev\\.claude-anx\\runtime';
const EXECUTION_LOG = path.join(RUNTIME_DIR, 'execution.log');

// Mission states
const STATE = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Initialize logging
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] ${message}\n`;

  // Write to console
  process.stdout.write(logLine);

  // Append to execution.log
  fs.appendFileSync(EXECUTION_LOG, logLine);
}

// Process a single mission file
async function processMission(missionFile) {
  const missionPath = path.join(INTAKE_DIR, missionFile);
  const missionId = path.basename(missionFile, '.json');

  log(`Processing mission: ${missionId}`);

  try {
    // Read mission
    const missionContent = fs.readFileSync(missionPath, 'utf8');
    const mission = JSON.parse(missionContent);

    // Mark as processing (rename with .processing suffix)
    const processingPath = `${missionPath}.processing`;
    fs.renameSync(missionPath, processingPath);

    log(`Mission ${missionId}: type=${mission.type}, agent=${mission.agent || 'default'}`);

    // Execute mission based on type
    const result = await executeMission(mission, missionId);

    // Write proof pack
    const proofPackPath = path.join(PROOF_DIR, `${missionId}-${Date.now()}.json`);
    const proofPack = {
      mission_id: missionId,
      mission: mission,
      execution: {
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        status: 'completed',
        result: result
      }
    };

    fs.writeFileSync(proofPackPath, JSON.stringify(proofPack, null, 2));
    log(`Proof pack written: ${path.basename(proofPackPath)}`);

    // Mark as completed (rename with .completed suffix)
    const completedPath = `${missionPath}.completed`;
    fs.renameSync(processingPath, completedPath);

    log(`Mission ${missionId} completed successfully`, 'SUCCESS');

    // Write receipt
    const receiptPath = path.join(PROOF_DIR, `RECEIPT_${missionId}_${Date.now()}.md`);
    const receiptContent = generateReceipt(mission, result, 'SUCCESS');
    fs.writeFileSync(receiptPath, receiptContent);

    return { success: true, result };

  } catch (error) {
    log(`Mission ${missionId} failed: ${error.message}`, 'ERROR');

    // Write failure receipt
    const receiptPath = path.join(PROOF_DIR, `RECEIPT_${missionId}_FAILED_${Date.now()}.md`);
    const receiptContent = generateReceipt(mission, error, 'FAILED');
    fs.writeFileSync(receiptPath, receiptContent);

    // Mark as failed
    const failedPath = `${missionPath}.failed`;
    if (fs.existsSync(`${missionPath}.processing`)) {
      fs.renameSync(`${missionPath}.processing`, failedPath);
    }

    return { success: false, error: error.message };
  }
}

// Execute mission logic (stub for now)
async function executeMission(mission, missionId) {
  log(`Executing mission logic for ${missionId}`);

  // Simulate different agent types
  switch (mission.agent) {
    case 'qa-gatekeeper':
      return await executeQAMission(mission);

    case 'platform-ops':
      return await executePlatformMission(mission);

    case 'engineering':
      return await executeEngineeringMission(mission);

    default:
      // Default execution: just log and return
      return {
        message: `Mission ${mission.type} executed`,
        timestamp: new Date().toISOString(),
        details: mission.params || {}
      };
  }
}

// QA mission executor
async function executeQAMission(mission) {
  log('Executing QA mission');

  // Simulate test execution
  const tests = mission.params?.tests || ['test1', 'test2'];
  const results = {};

  for (const test of tests) {
    results[test] = {
      status: 'passed',
      duration_ms: Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString()
    };
  }

  return {
    agent: 'qa-gatekeeper',
    test_results: results,
    summary: `All ${tests.length} tests passed`
  };
}

// Platform mission executor
async function executePlatformMission(mission) {
  log('Executing Platform mission');

  return {
    agent: 'platform-ops',
    action: mission.params?.action || 'deploy',
    status: 'completed',
    artifacts: ['config.json', 'deployment.log']
  };
}

// Engineering mission executor
async function executeEngineeringMission(mission) {
  log('Executing Engineering mission');

  return {
    agent: 'engineering',
    task: mission.params?.task || 'build',
    status: 'success',
    metrics: {
      files_modified: 5,
      lines_added: 150,
      lines_removed: 30
    }
  };
}

// Generate receipt markdown
function generateReceipt(mission, result, status) {
  const timestamp = new Date().toISOString();

  return `# Mission Receipt

**Mission ID**: ${mission.id || 'unknown'}
**Status**: ${status}
**Timestamp**: ${timestamp}

## Mission Details
\`\`\`json
${JSON.stringify(mission, null, 2)}
\`\`\`

## Execution Result
\`\`\`json
${JSON.stringify(result, null, 2)}
\`\`\`

## Metadata
- Agent: ${mission.agent || 'default'}
- Type: ${mission.type || 'unknown'}
- Executed at: ${timestamp}

---
*Generated by Agentic Loop v1*
`;
}

// Watch for new mission files
function watchIntake() {
  log('Starting mission intake watcher...');

  // Process existing missions on startup
  const existingMissions = fs.readdirSync(INTAKE_DIR)
    .filter(f => f.endsWith('.json') && !f.includes('.processing') && !f.includes('.completed') && !f.includes('.failed'));

  if (existingMissions.length > 0) {
    log(`Found ${existingMissions.length} pending missions`);
    existingMissions.forEach(mission => {
      processMission(mission).catch(err => {
        log(`Failed to process ${mission}: ${err.message}`, 'ERROR');
      });
    });
  }

  // Watch for new files
  fs.watch(INTAKE_DIR, (eventType, filename) => {
    if (eventType === 'rename' && filename && filename.endsWith('.json')) {
      // Check if it's a new file (not .processing, .completed, or .failed)
      if (!filename.includes('.processing') &&
          !filename.includes('.completed') &&
          !filename.includes('.failed')) {

        const filePath = path.join(INTAKE_DIR, filename);
        if (fs.existsSync(filePath)) {
          log(`New mission detected: ${filename}`);
          processMission(filename).catch(err => {
            log(`Failed to process ${filename}: ${err.message}`, 'ERROR');
          });
        }
      }
    }
  });

  log('Mission intake watcher ready');
}

// Main entry point
function main() {
  log('=== Agentic Loop v1 Starting ===');

  // Ensure directories exist
  [INTAKE_DIR, PROOF_DIR, RUNTIME_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`Created directory: ${dir}`);
    }
  });

  // Start watching
  watchIntake();

  // Keep process alive
  process.on('SIGINT', () => {
    log('Shutting down gracefully...');
    process.exit(0);
  });

  log('Agentic loop ready. Drop missions into intake/missions/');
}

// Start the loop
main();