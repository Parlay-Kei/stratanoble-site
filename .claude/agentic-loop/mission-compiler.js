#!/usr/bin/env node
/**
 * Mission Compiler v1.1
 * Converts Delegate Briefs → Work Packets → Missions
 * Minimal upgrade to complete the loop
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Simple YAML parser for our minimal format
const yaml = {
  load: (content) => {
    const result = {};
    const lines = content.split('\n');
    let currentKey = null;
    let arrayMode = false;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      if (trimmed.startsWith('- ')) {
        // Array item
        if (currentKey && arrayMode) {
          if (!result[currentKey]) result[currentKey] = [];
          result[currentKey].push(trimmed.substring(2).trim());
        }
      } else if (trimmed.includes(':')) {
        // Key-value
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        currentKey = key.trim();

        if (!value) {
          // Start of array
          arrayMode = true;
          result[currentKey] = [];
        } else {
          // Direct value
          arrayMode = false;
          result[currentKey] = value;
        }
      }
    });

    return result;
  }
};

// Directories
const BRIEFS_DIR = 'C:\\Dev\\.claude-anx\\intake\\delegate-briefs';
const MISSIONS_DIR = 'C:\\Dev\\.claude-anx\\intake\\missions';
const RUNS_DIR = 'C:\\Dev\\.claude-anx\\runs';

class MissionCompiler {
  constructor() {
    this.ensureDirectories();
  }

  ensureDirectories() {
    [BRIEFS_DIR, MISSIONS_DIR, RUNS_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Compile brief to missions
   */
  compileBrief(briefPath) {
    const runId = `run-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const runDir = path.join(RUNS_DIR, runId);
    fs.mkdirSync(runDir, { recursive: true });

    console.log(`[COMPILER] Processing brief → ${runId}`);

    // Parse brief (supports YAML and JSON)
    const briefContent = fs.readFileSync(briefPath, 'utf8');
    let brief;

    try {
      if (briefPath.endsWith('.yaml') || briefPath.endsWith('.yml')) {
        brief = yaml.load(briefContent);
      } else {
        brief = JSON.parse(briefContent);
      }
    } catch (err) {
      console.error('[COMPILER] Failed to parse brief:', err.message);
      return null;
    }

    // Save brief to run
    fs.writeFileSync(path.join(runDir, 'brief.json'), JSON.stringify(brief, null, 2));

    // Generate work packet
    const workPacket = this.generateWorkPacket(brief, runId);
    fs.writeFileSync(path.join(runDir, 'work_packet.md'), this.formatWorkPacket(workPacket));
    console.log('[COMPILER] Work packet generated');

    // Identify departments
    const departments = this.identifyDepartments(brief);
    console.log(`[COMPILER] Routing to: ${departments.join(', ')}`);

    // Generate missions
    const missions = [];
    departments.forEach(dept => {
      const mission = this.createMission(dept, brief, workPacket, runId);
      missions.push(mission);

      // Save to intake for mission-runner to execute
      const missionFile = `${dept}-${runId}.json`;
      fs.writeFileSync(
        path.join(MISSIONS_DIR, missionFile),
        JSON.stringify(mission, null, 2)
      );
    });

    console.log(`[COMPILER] ${missions.length} missions created`);

    // Check for decision gates
    const gates = this.identifyDecisionGates(brief);
    if (gates.length > 0) {
      const gatesDir = path.join(runDir, 'decisions');
      fs.mkdirSync(gatesDir, { recursive: true });
      fs.writeFileSync(
        path.join(gatesDir, 'gates.json'),
        JSON.stringify(gates, null, 2)
      );
      console.log(`[COMPILER] ${gates.length} decision gates identified`);
    }

    // Create run index
    const runIndex = {
      run_id: runId,
      brief: brief.title,
      created_at: new Date().toISOString(),
      departments: departments,
      missions_count: missions.length,
      gates_count: gates.length,
      status: 'active'
    };

    fs.writeFileSync(
      path.join(runDir, 'index.json'),
      JSON.stringify(runIndex, null, 2)
    );

    // Archive processed brief
    const archivePath = briefPath + '.processed';
    fs.renameSync(briefPath, archivePath);

    console.log(`[COMPILER] Complete: ${runId}`);
    return runId;
  }

  /**
   * Generate work packet from brief
   */
  generateWorkPacket(brief, runId) {
    return {
      run_id: runId,
      title: brief.title,
      type: brief.type || 'feature',
      target: brief.target,
      why: brief.why,
      definition_of_done: brief.done || [],
      scope_excluded: brief.scope_out || [],
      risk_tolerance: brief.risk || 'medium',
      deadline: brief.deadline || null,
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Identify required departments based on brief content
   */
  identifyDepartments(brief) {
    // Always include Engineering and QA
    const departments = ['engineering', 'qa'];

    const content = JSON.stringify(brief).toLowerCase();

    // Conditional routing
    if (content.includes('deploy') || content.includes('release')) {
      departments.push('release-ops');
    }

    if (content.includes('infrastructure') || content.includes('scaling')) {
      departments.push('platform-ops');
    }

    if (content.includes('cost') || content.includes('pricing') || content.includes('billing')) {
      departments.push('finance-ops');
    }

    if (content.includes('legal') || content.includes('compliance') || content.includes('gdpr')) {
      departments.push('legal-ops');
    }

    return departments;
  }

  /**
   * Create mission for department
   */
  createMission(department, brief, workPacket, runId) {
    const missionTypes = {
      'engineering': 'implement',
      'qa': 'validate',
      'platform-ops': 'provision',
      'release-ops': 'deploy',
      'finance-ops': 'analyze',
      'legal-ops': 'review'
    };

    return {
      id: `${department}-${runId}`,
      run_id: runId,
      agent: department,
      type: missionTypes[department] || 'execute',
      params: {
        brief_title: brief.title,
        target: brief.target,
        done_criteria: brief.done || [],
        risk: brief.risk || 'medium'
      },
      work_packet_ref: `runs/${runId}/work_packet.md`,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Identify decision gates
   */
  identifyDecisionGates(brief) {
    const gates = [];

    // Low risk = gate before prod
    if (brief.risk === 'low') {
      gates.push({
        trigger: 'before_production',
        requires: 'founder_approval',
        reason: 'low_risk_tolerance'
      });
    }

    // Deadline = gate if behind
    if (brief.deadline) {
      const deadline = new Date(brief.deadline);
      if (!isNaN(deadline)) {
        gates.push({
          trigger: 'milestone_checkpoint',
          requires: 'progress_review',
          deadline: brief.deadline
        });
      }
    }

    return gates;
  }

  /**
   * Format work packet as markdown
   */
  formatWorkPacket(packet) {
    return `# Work Packet

**Run ID**: ${packet.run_id}
**Title**: ${packet.title}
**Type**: ${packet.type}
**Target**: ${packet.target}

## Why
${packet.why}

## Definition of Done
${packet.definition_of_done.map(d => `- [ ] ${d}`).join('\n')}

## Risk Level
${packet.risk_tolerance}

${packet.deadline ? `## Deadline\n${packet.deadline}` : ''}

${packet.scope_excluded.length > 0 ? `## Out of Scope\n${packet.scope_excluded.map(s => `- ${s}`).join('\n')}` : ''}

---
*Generated: ${packet.generated_at}*`;
  }

  /**
   * Watch for new briefs
   */
  watch() {
    console.log('[COMPILER] Watching for delegate briefs...');
    console.log(`[COMPILER] Drop briefs in: ${BRIEFS_DIR}`);

    // Process existing briefs
    const existingBriefs = fs.readdirSync(BRIEFS_DIR)
      .filter(f => (f.endsWith('.yaml') || f.endsWith('.yml') || f.endsWith('.json'))
                && !f.includes('.processed'));

    if (existingBriefs.length > 0) {
      console.log(`[COMPILER] Found ${existingBriefs.length} pending briefs`);
      existingBriefs.forEach(brief => {
        this.compileBrief(path.join(BRIEFS_DIR, brief));
      });
    }

    // Watch for new briefs
    fs.watch(BRIEFS_DIR, (eventType, filename) => {
      if (filename &&
          (filename.endsWith('.yaml') || filename.endsWith('.yml') || filename.endsWith('.json')) &&
          !filename.includes('.processed')) {

        const briefPath = path.join(BRIEFS_DIR, filename);
        if (fs.existsSync(briefPath)) {
          console.log(`[COMPILER] New brief: ${filename}`);
          setTimeout(() => {
            this.compileBrief(briefPath);
          }, 100); // Small delay to ensure file write is complete
        }
      }
    });
  }
}

// Export for use
module.exports = MissionCompiler;

// CLI entry point
if (require.main === module) {
  const compiler = new MissionCompiler();
  compiler.watch();
}