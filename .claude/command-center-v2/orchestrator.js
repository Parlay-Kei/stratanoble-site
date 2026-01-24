#!/usr/bin/env node
/**
 * Command Center v2 Orchestrator
 * Brief → Work Packet → Missions → Decisions → Closeout
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Directories
const BASE_DIR = 'C:\\Dev\\.claude-anx';
const RUNS_DIR = path.join(BASE_DIR, 'runs');
const INTAKE_DIR = path.join(BASE_DIR, 'intake', 'briefs');
const MISSIONS_DIR = path.join(BASE_DIR, 'intake', 'missions');

class Orchestrator {
  constructor() {
    this.ensureDirectories();
  }

  ensureDirectories() {
    [RUNS_DIR, INTAKE_DIR, MISSIONS_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Process a delegate brief
   */
  async processBrief(briefPath) {
    const runId = this.generateRunId();
    const runDir = path.join(RUNS_DIR, runId);
    fs.mkdirSync(runDir, { recursive: true });

    console.log(`[OCS] Processing brief: ${runId}`);

    // Read and parse brief
    const briefContent = fs.readFileSync(briefPath, 'utf8');
    const brief = JSON.parse(briefContent);

    // Save brief to run directory
    fs.writeFileSync(path.join(runDir, 'brief.json'), briefContent);
    this.log(runId, 'Brief received', brief.title);

    // Generate work packet
    const workPacket = this.generateWorkPacket(brief, runId);
    fs.writeFileSync(
      path.join(runDir, 'work_packet.md'),
      this.formatWorkPacket(workPacket)
    );
    this.log(runId, 'Work packet generated');

    // Route to departments
    const missions = this.routeToDepartments(brief, workPacket, runId);

    // Save missions
    const missionsSubdir = path.join(runDir, 'missions');
    fs.mkdirSync(missionsSubdir, { recursive: true });

    missions.forEach(mission => {
      const missionPath = path.join(missionsSubdir, `${mission.department}.json`);
      fs.writeFileSync(missionPath, JSON.stringify(mission, null, 2));

      // Queue mission for execution
      this.queueMission(mission, runId);
    });

    this.log(runId, `${missions.length} missions created`);

    // Monitor for completion
    this.monitorRun(runId, missions.length);

    return runId;
  }

  /**
   * Generate work packet from brief
   */
  generateWorkPacket(brief, runId) {
    return {
      run_id: runId,
      title: brief.title,
      type: brief.type,
      target: brief.target,

      goal: {
        why: brief.why,
        definition_of_done: brief.definition_of_done
      },

      scope: {
        included: brief.scope_included || [],
        excluded: brief.scope_excluded || []
      },

      phases: this.identifyPhases(brief),

      departments_required: this.identifyDepartments(brief),

      decision_gates: this.identifyDecisionGates(brief),

      constraints: brief.constraints || [],
      risk_tolerance: brief.risk_tolerance || 'medium',

      receipts_required: this.identifyReceipts(brief)
    };
  }

  /**
   * Identify phases based on brief type
   */
  identifyPhases(brief) {
    const phases = [];

    switch(brief.type) {
      case 'feature':
        phases.push('design', 'implement', 'test', 'deploy');
        break;
      case 'project':
        phases.push('plan', 'execute', 'validate', 'closeout');
        break;
      case 'process':
        phases.push('analyze', 'optimize', 'document', 'train');
        break;
      default:
        phases.push('execute', 'validate');
    }

    return phases;
  }

  /**
   * Identify required departments
   */
  identifyDepartments(brief) {
    const departments = ['ocs', 'product-ops', 'engineering', 'qa'];

    // Add conditional departments
    const content = JSON.stringify(brief).toLowerCase();

    if (content.includes('deploy') || content.includes('release')) {
      departments.push('release-ops');
    }

    if (content.includes('infrastructure') || content.includes('environment')) {
      departments.push('platform-ops');
    }

    if (content.includes('cost') || content.includes('pricing')) {
      departments.push('finance-ops');
    }

    if (content.includes('compliance') || content.includes('legal')) {
      departments.push('legal-ops');
    }

    return departments;
  }

  /**
   * Identify decision gates
   */
  identifyDecisionGates(brief) {
    const gates = [];

    // Check for explicit approval thresholds
    if (brief.approval_thresholds) {
      brief.approval_thresholds.forEach(threshold => {
        gates.push({
          trigger: threshold.condition,
          requires: threshold.requires,
          type: 'approval'
        });
      });
    }

    // Add implicit gates based on risk
    if (brief.risk_tolerance === 'low') {
      gates.push({
        trigger: 'before_production_deploy',
        requires: 'founder_approval',
        type: 'safety'
      });
    }

    return gates;
  }

  /**
   * Identify required receipts
   */
  identifyReceipts(brief) {
    const receipts = [];

    // Standard receipts
    receipts.push('work_packet', 'execution_log');

    // Type-specific receipts
    switch(brief.type) {
      case 'feature':
        receipts.push('design_doc', 'test_results', 'deployment_log');
        break;
      case 'project':
        receipts.push('project_plan', 'milestone_reports', 'closeout_report');
        break;
      case 'process':
        receipts.push('process_map', 'optimization_metrics', 'training_materials');
        break;
    }

    return receipts;
  }

  /**
   * Route work to departments
   */
  routeToDepartments(brief, workPacket, runId) {
    const missions = [];

    workPacket.departments_required.forEach(dept => {
      const mission = {
        id: `${runId}-${dept}`,
        run_id: runId,
        department: dept,
        type: 'execute',

        brief: {
          title: brief.title,
          type: brief.type,
          target: brief.target
        },

        work_packet_ref: `runs/${runId}/work_packet.md`,

        scope: this.getScopeForDepartment(dept, workPacket),

        deliverables: this.getDeliverablesForDepartment(dept, brief.type),

        created_at: new Date().toISOString()
      };

      missions.push(mission);
    });

    return missions;
  }

  /**
   * Get department-specific scope
   */
  getScopeForDepartment(dept, workPacket) {
    const scopes = {
      'ocs': 'Orchestrate execution and produce closeout pack',
      'product-ops': 'Define requirements and success metrics',
      'engineering': 'Implement technical solution',
      'qa': 'Validate implementation meets requirements',
      'platform-ops': 'Handle infrastructure and deployment',
      'release-ops': 'Manage release process',
      'finance-ops': 'Analyze costs and pricing',
      'legal-ops': 'Ensure compliance'
    };

    return scopes[dept] || 'Execute assigned tasks';
  }

  /**
   * Get department-specific deliverables
   */
  getDeliverablesForDepartment(dept, briefType) {
    const deliverables = {
      'ocs': ['closeout_pack', 'decision_log'],
      'product-ops': ['requirements_doc', 'acceptance_criteria'],
      'engineering': ['implementation', 'technical_docs'],
      'qa': ['test_plan', 'test_results', 'qa_signoff'],
      'platform-ops': ['infrastructure_config', 'deployment_receipt'],
      'release-ops': ['release_notes', 'rollback_plan'],
      'finance-ops': ['cost_analysis', 'pricing_model'],
      'legal-ops': ['compliance_review', 'legal_signoff']
    };

    return deliverables[dept] || ['department_receipt'];
  }

  /**
   * Queue mission for execution
   */
  queueMission(mission, runId) {
    // Write to intake directory for mission-runner to pick up
    const missionFile = `${mission.department}-${runId}.json`;
    const missionPath = path.join(MISSIONS_DIR, missionFile);

    fs.writeFileSync(missionPath, JSON.stringify(mission, null, 2));
    this.log(runId, `Mission queued: ${mission.department}`);
  }

  /**
   * Monitor run for completion
   */
  async monitorRun(runId, expectedMissions) {
    const runDir = path.join(RUNS_DIR, runId);
    const receiptsDir = path.join(runDir, 'receipts');

    // This would normally poll for completion
    // For now, just log status
    this.log(runId, `Monitoring ${expectedMissions} missions`);

    // Create closeout pack when all missions complete
    setTimeout(() => {
      this.generateCloseoutPack(runId);
    }, 5000);
  }

  /**
   * Generate closeout pack
   */
  generateCloseoutPack(runId) {
    const runDir = path.join(RUNS_DIR, runId);
    const closeoutDir = path.join(runDir, 'closeout');
    fs.mkdirSync(closeoutDir, { recursive: true });

    const closeout = {
      run_id: runId,
      completed_at: new Date().toISOString(),

      summary: {
        status: 'completed',
        missions_completed: 0,
        decisions_made: 0,
        receipts_generated: 0
      },

      receipts_index: [],
      proof_packs: [],

      rollback_notes: 'No rollback required',

      lessons_learned: []
    };

    // Save closeout pack
    const closeoutPath = path.join(closeoutDir, 'CLOSEOUT_PACK.md');
    fs.writeFileSync(closeoutPath, this.formatCloseoutPack(closeout));

    this.log(runId, 'Closeout pack generated');
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

## Goal
**Why**: ${packet.goal.why}

**Definition of Done**:
${packet.goal.definition_of_done.map(d => `- ${d}`).join('\n')}

## Phases
${packet.phases.map(p => `- ${p}`).join('\n')}

## Departments
${packet.departments_required.map(d => `- ${d}`).join('\n')}

## Decision Gates
${packet.decision_gates.map(g => `- **${g.trigger}**: requires ${g.requires}`).join('\n') || 'None'}

## Constraints
${packet.constraints.map(c => `- ${c}`).join('\n') || 'None'}

## Risk Tolerance
${packet.risk_tolerance}

---
Generated: ${new Date().toISOString()}`;
  }

  /**
   * Format closeout pack as markdown
   */
  formatCloseoutPack(closeout) {
    return `# CLOSEOUT PACK

**Run ID**: ${closeout.run_id}
**Completed**: ${closeout.completed_at}

## Summary
- Status: ${closeout.summary.status}
- Missions Completed: ${closeout.summary.missions_completed}
- Decisions Made: ${closeout.summary.decisions_made}
- Receipts Generated: ${closeout.summary.receipts_generated}

## Receipts Index
${closeout.receipts_index.map(r => `- ${r}`).join('\n') || 'None yet'}

## Proof Packs
${closeout.proof_packs.map(p => `- ${p}`).join('\n') || 'None yet'}

## Rollback Notes
${closeout.rollback_notes}

## Lessons Learned
${closeout.lessons_learned.map(l => `- ${l}`).join('\n') || 'None captured'}

---
*Command Center v2 - Delegate and Done*`;
  }

  /**
   * Utilities
   */
  generateRunId() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `run-${timestamp}-${random}`;
  }

  log(runId, message, details = '') {
    const logLine = `[${new Date().toISOString()}] [${runId}] ${message} ${details}\n`;
    console.log(logLine.trim());

    // Also append to run log
    const runDir = path.join(RUNS_DIR, runId);
    const logPath = path.join(runDir, 'execution.log');

    if (fs.existsSync(runDir)) {
      fs.appendFileSync(logPath, logLine);
    }
  }
}

// Export for use
module.exports = Orchestrator;

// CLI entry point
if (require.main === module) {
  const orchestrator = new Orchestrator();

  // Watch for new briefs
  console.log('[OCS] Command Center v2 Orchestrator started');
  console.log(`[OCS] Watching: ${INTAKE_DIR}`);

  fs.watch(INTAKE_DIR, (eventType, filename) => {
    if (filename && filename.endsWith('.json')) {
      const briefPath = path.join(INTAKE_DIR, filename);
      if (fs.existsSync(briefPath)) {
        orchestrator.processBrief(briefPath).then(runId => {
          console.log(`[OCS] Run started: ${runId}`);
        });
      }
    }
  });
}