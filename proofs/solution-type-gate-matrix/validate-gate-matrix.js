#!/usr/bin/env node

/**
 * Gate Matrix Validator
 * Mission: QAG-SOLUTION-TYPE-GATE-MATRIX-0006
 *
 * Validates that missions have required proof artifacts based on solution type
 */

const fs = require('fs');
const path = require('path');

class GateMatrixValidator {
  constructor() {
    this.gateMatrixPath = path.join(__dirname, '..', 'governance', 'SOLUTION_TYPE_GATES.json');
    this.gateMatrix = null;
    this.validationResults = {
      mission: null,
      solutionType: null,
      passed: false,
      requiredGates: [],
      foundProofs: [],
      missingProofs: [],
      validationErrors: [],
      warnings: [],
      waivers: [],
      summary: {
        totalGates: 0,
        satisfiedGates: 0,
        missingGates: 0,
        activeWaivers: 0
      }
    };
  }

  /**
   * Load gate matrix configuration
   */
  loadGateMatrix() {
    if (!fs.existsSync(this.gateMatrixPath)) {
      throw new Error(`Gate matrix not found at ${this.gateMatrixPath}`);
    }

    const content = fs.readFileSync(this.gateMatrixPath, 'utf8');
    this.gateMatrix = JSON.parse(content);
    return this.gateMatrix;
  }

  /**
   * Load and validate mission configuration
   */
  loadMission(missionPath) {
    if (!fs.existsSync(missionPath)) {
      throw new Error(`Mission file not found: ${missionPath}`);
    }

    const content = fs.readFileSync(missionPath, 'utf8');
    const mission = JSON.parse(content);

    // Validate solution type is declared
    const solutionType = mission.solution_type || mission.solutionType;
    if (!solutionType) {
      throw new Error('Mission does not declare a solution_type');
    }

    // Validate solution type is valid
    if (!this.gateMatrix.gateMatrix[solutionType]) {
      throw new Error(`Invalid solution_type: ${solutionType}`);
    }

    this.validationResults.mission = mission;
    this.validationResults.solutionType = solutionType;

    return { mission, solutionType };
  }

  /**
   * Find proof files in mission directory
   */
  scanForProofs(missionDir) {
    const foundProofs = [];

    if (!fs.existsSync(missionDir)) {
      return foundProofs;
    }

    // Recursively scan for proof files
    const scanDirectory = (dir, relativePath = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativeFilePath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
          // Scan common proof directories
          if (['proofs', 'docs', 'evidence', 'artifacts'].includes(entry.name.toLowerCase())) {
            scanDirectory(fullPath, relativeFilePath);
          }
        } else if (entry.isFile()) {
          // Check for proof file patterns
          if (this.isProofFile(entry.name)) {
            foundProofs.push({
              name: entry.name,
              path: fullPath,
              relativePath: relativeFilePath,
              size: fs.statSync(fullPath).size,
              lastModified: fs.statSync(fullPath).mtime
            });
          }
        }
      }
    };

    scanDirectory(missionDir);
    return foundProofs;
  }

  /**
   * Check if a file matches proof naming patterns
   */
  isProofFile(filename) {
    const proofPatterns = [
      /^REQUIREMENTS_APPROVAL.*\.(md|pdf)$/i,
      /^DESIGN_REVIEW.*\.(md|pdf)$/i,
      /^ARCHITECTURE_DIAGRAM.*\.(png|jpg|pdf)$/i,
      /^SECURITY_ASSESSMENT.*\.(md|pdf)$/i,
      /^THREAT_MODEL.*\.(md|pdf)$/i,
      /^QA_TEST_REPORT.*\.(md|pdf|html)$/i,
      /^TEST_RESULTS.*\.(json|xml)$/i,
      /^COVERAGE_REPORT.*\.(html|xml)$/i,
      /^CLIENT_ACCEPTANCE.*\.(md|pdf)$/i,
      /^UAT_RESULTS.*\.(md|pdf)$/i,
      /^DEPLOYMENT_CHECKLIST.*\.(md|pdf)$/i,
      /^RUNBOOK.*\.(md|pdf)$/i,
      /^MONITORING_SETUP.*\.(md|pdf)$/i,
      /^TECHNICAL_DESIGN.*\.(md|pdf)$/i,
      /^CODE_REVIEW.*\.(md|pdf)$/i,
      /^INTEGRATION_TEST.*\.(md|pdf)$/i,
      /^API_TEST_RESULTS.*\.(json|xml)$/i,
      /^USER_GUIDE.*\.(md|pdf)$/i,
      /^API_DOCS.*\.(md|pdf|html)$/i,
      /^BRAND_APPROVAL.*\.(md|pdf)$/i,
      /^CONTENT_REVIEW.*\.(md|pdf)$/i,
      /^AUDIT_.*\.(md|pdf)$/i,
      /^DR_.*\.(md|pdf)$/i,
      /^CONCEPT_BRIEF.*\.(md|pdf)$/i,
      /^RESEARCH_.*\.(md|pdf)$/i
    ];

    return proofPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Validate specific proof file content
   */
  validateProofContent(proof, expectedValidators) {
    const validationResults = {
      valid: true,
      errors: [],
      warnings: []
    };

    try {
      const content = fs.readFileSync(proof.path, 'utf8');

      // Basic validation - file not empty
      if (content.trim().length === 0) {
        validationResults.valid = false;
        validationResults.errors.push('Proof file is empty');
        return validationResults;
      }

      // Validate based on file type
      if (proof.name.endsWith('.md')) {
        // Markdown-specific validation
        if (!content.includes('# ')) {
          validationResults.warnings.push('No main heading found');
        }

        // Check for common required sections based on proof type
        if (proof.name.includes('REQUIREMENTS_APPROVAL')) {
          const requiredSections = ['stakeholder', 'approval_date'];
          for (const section of requiredSections) {
            if (!content.toLowerCase().includes(section.toLowerCase())) {
              validationResults.warnings.push(`Missing section: ${section}`);
            }
          }
        }

        if (proof.name.includes('QA_TEST_REPORT')) {
          const requiredSections = ['test_summary', 'coverage', 'pass_rate'];
          for (const section of requiredSections) {
            if (!content.toLowerCase().includes(section.toLowerCase())) {
              validationResults.warnings.push(`Missing section: ${section}`);
            }
          }
        }
      }

      // JSON validation
      if (proof.name.endsWith('.json')) {
        try {
          JSON.parse(content);
        } catch (e) {
          validationResults.valid = false;
          validationResults.errors.push(`Invalid JSON: ${e.message}`);
        }
      }

    } catch (error) {
      validationResults.valid = false;
      validationResults.errors.push(`Cannot read file: ${error.message}`);
    }

    return validationResults;
  }

  /**
   * Check for active waivers
   */
  checkWaivers(mission, solutionType) {
    const waivers = mission.waivers || [];
    const activeWaivers = [];

    const now = new Date();

    for (const waiver of waivers) {
      const expiryDate = new Date(waiver.expiryDate);

      if (expiryDate > now) {
        // Waiver is still active
        activeWaivers.push({
          ...waiver,
          status: 'ACTIVE'
        });
      } else {
        // Waiver has expired
        activeWaivers.push({
          ...waiver,
          status: 'EXPIRED'
        });
      }
    }

    return activeWaivers;
  }

  /**
   * Validate mission against gate matrix
   */
  validateMission(missionPath, missionDir) {
    // Load mission and get solution type
    const { mission, solutionType } = this.loadMission(missionPath);
    const gateConfig = this.gateMatrix.gateMatrix[solutionType];

    console.log(`Validating ${solutionType} mission: ${mission.id || 'Unknown'}`);

    // Get required proofs for this solution type
    this.validationResults.requiredGates = gateConfig.requiredProofs || [];
    this.validationResults.summary.totalGates = this.validationResults.requiredGates.length;

    // Scan for proof files
    const foundProofs = this.scanForProofs(missionDir || path.dirname(missionPath));
    this.validationResults.foundProofs = foundProofs;

    console.log(`Found ${foundProofs.length} proof files`);

    // Check each required gate
    for (const gate of this.validationResults.requiredGates) {
      console.log(`\nChecking gate: ${gate.gate}`);

      let gateSatisfied = false;

      // Check if required proofs exist
      for (const requiredArtifact of gate.proofArtifacts) {
        const foundProof = foundProofs.find(p =>
          p.name.toLowerCase().includes(requiredArtifact.toLowerCase().replace('.md', '').replace('.json', '').replace('.png', ''))
        );

        if (foundProof) {
          console.log(`  ✅ Found: ${foundProof.name}`);

          // Validate proof content
          const validation = this.validateProofContent(foundProof, gate.validators);
          if (!validation.valid) {
            this.validationResults.validationErrors.push({
              gate: gate.gate,
              artifact: requiredArtifact,
              errors: validation.errors
            });
          }
          if (validation.warnings.length > 0) {
            this.validationResults.warnings.push({
              gate: gate.gate,
              artifact: requiredArtifact,
              warnings: validation.warnings
            });
          }

          gateSatisfied = true;
        } else {
          console.log(`  ❌ Missing: ${requiredArtifact}`);
          this.validationResults.missingProofs.push({
            gate: gate.gate,
            artifact: requiredArtifact
          });
        }
      }

      if (gateSatisfied) {
        this.validationResults.summary.satisfiedGates++;
      } else {
        this.validationResults.summary.missingGates++;
      }
    }

    // Check for waivers
    const activeWaivers = this.checkWaivers(mission, solutionType);
    this.validationResults.waivers = activeWaivers;
    this.validationResults.summary.activeWaivers = activeWaivers.filter(w => w.status === 'ACTIVE').length;

    // Apply waivers to missing proofs
    for (const waiver of activeWaivers.filter(w => w.status === 'ACTIVE')) {
      const waivedGate = waiver.gate;
      const beforeCount = this.validationResults.missingProofs.length;

      this.validationResults.missingProofs = this.validationResults.missingProofs.filter(
        missing => missing.gate !== waivedGate
      );

      const afterCount = this.validationResults.missingProofs.length;
      if (beforeCount > afterCount) {
        console.log(`  🔓 Waiver applied for gate: ${waivedGate}`);
      }
    }

    // Determine overall result
    const hasUnwaivedMissing = this.validationResults.missingProofs.length > 0;
    const hasCriticalErrors = this.validationResults.validationErrors.some(e => e.errors.length > 0);

    this.validationResults.passed = !hasUnwaivedMissing && !hasCriticalErrors;

    return this.validationResults;
  }

  /**
   * Generate validation report
   */
  generateReport() {
    const lines = [];

    lines.push('# Gate Matrix Validation Report');
    lines.push(`Mission: ${this.validationResults.mission?.id || 'Unknown'}`);
    lines.push(`Solution Type: ${this.validationResults.solutionType}`);
    lines.push(`Status: ${this.validationResults.passed ? '✅ PASSED' : '❌ FAILED'}`);
    lines.push('');

    // Summary
    lines.push('## Summary');
    lines.push(`- **Total Gates**: ${this.validationResults.summary.totalGates}`);
    lines.push(`- **Satisfied**: ${this.validationResults.summary.satisfiedGates}`);
    lines.push(`- **Missing**: ${this.validationResults.summary.missingGates}`);
    lines.push(`- **Active Waivers**: ${this.validationResults.summary.activeWaivers}`);
    lines.push('');

    // Missing proofs
    if (this.validationResults.missingProofs.length > 0) {
      lines.push('## ❌ Missing Required Proofs');
      for (const missing of this.validationResults.missingProofs) {
        lines.push(`- **${missing.gate}**: ${missing.artifact}`);
      }
      lines.push('');
    }

    // Validation errors
    if (this.validationResults.validationErrors.length > 0) {
      lines.push('## ❌ Validation Errors');
      for (const error of this.validationResults.validationErrors) {
        lines.push(`- **${error.gate}** (${error.artifact}):`);
        for (const err of error.errors) {
          lines.push(`  - ${err}`);
        }
      }
      lines.push('');
    }

    // Warnings
    if (this.validationResults.warnings.length > 0) {
      lines.push('## ⚠️ Warnings');
      for (const warning of this.validationResults.warnings) {
        lines.push(`- **${warning.gate}** (${warning.artifact}):`);
        for (const warn of warning.warnings) {
          lines.push(`  - ${warn}`);
        }
      }
      lines.push('');
    }

    // Found proofs
    if (this.validationResults.foundProofs.length > 0) {
      lines.push('## ✅ Found Proofs');
      for (const proof of this.validationResults.foundProofs) {
        lines.push(`- ${proof.name} (${Math.round(proof.size / 1024)}KB)`);
      }
      lines.push('');
    }

    // Active waivers
    if (this.validationResults.waivers.length > 0) {
      lines.push('## 🔓 Waivers');
      for (const waiver of this.validationResults.waivers) {
        const status = waiver.status === 'ACTIVE' ? '🟢' : '🔴';
        lines.push(`- ${status} **${waiver.gate}**: ${waiver.reason.substring(0, 100)}...`);
        lines.push(`  - Expires: ${waiver.expiryDate}`);
        lines.push(`  - Risk: ${waiver.riskRating}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Main execution
   */
  async run(missionPath, missionDir) {
    try {
      // Load gate matrix
      this.loadGateMatrix();

      // Validate mission
      const results = this.validateMission(missionPath, missionDir);

      // Print results
      console.log('\n' + '='.repeat(50));
      console.log('VALIDATION RESULTS');
      console.log('='.repeat(50));
      console.log(`Status: ${results.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`Gates: ${results.summary.satisfiedGates}/${results.summary.totalGates} satisfied`);
      console.log(`Waivers: ${results.summary.activeWaivers} active`);

      if (!results.passed) {
        console.log(`\nMissing proofs: ${results.missingProofs.length}`);
        console.log(`Validation errors: ${results.validationErrors.length}`);
      }

      console.log('='.repeat(50));

      return results.passed;

    } catch (error) {
      console.error('❌ Validation error:', error.message);
      return false;
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: validate-gate-matrix.js <mission.json> [mission-dir]');
    console.log('');
    console.log('Examples:');
    console.log('  validate-gate-matrix.js mission.json');
    console.log('  validate-gate-matrix.js mission.json ./mission-artifacts/');
    process.exit(1);
  }

  const validator = new GateMatrixValidator();
  const missionPath = args[0];
  const missionDir = args[1];

  validator.run(missionPath, missionDir).then(passed => {
    process.exit(passed ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = GateMatrixValidator;