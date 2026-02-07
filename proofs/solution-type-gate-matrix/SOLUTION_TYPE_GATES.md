# Solution Type Gate Matrix
Version: 1.0.0
Effective: 2026-01-30
Authority: QA Gatekeeper

## Overview

This document defines the gate requirements matrix keyed by solution type, ensuring that each mission produces the required proof artifacts based on its classification. The gate matrix enforces quality standards while providing flexibility through a structured waiver mechanism.

## Gate Requirements by Solution Type

### CLIENT_DELIVERY (Risk: HIGH)
**Enforcement**: STRICT - All gates required, limited waivers

#### Required Gates & Proofs
1. **requirements-review**
   - `REQUIREMENTS_APPROVAL.md` - Stakeholder signoff on requirements
   - Validators: stakeholder_signoff, completeness_check

2. **design-approval**
   - `DESIGN_REVIEW.md` - Technical design documentation
   - `ARCHITECTURE_DIAGRAM.png` - Visual architecture representation
   - Validators: architect_review, design_completeness

3. **security-review**
   - `SECURITY_ASSESSMENT.md` - Security analysis and mitigations
   - `THREAT_MODEL.md` - Threat modeling documentation
   - Validators: security_scan_results, penetration_test

4. **qa-testing**
   - `QA_TEST_REPORT.md` - Comprehensive test results
   - `TEST_RESULTS.json` - Machine-readable test data
   - `COVERAGE_REPORT.html` - Code coverage analysis
   - Validators: test_coverage_80, all_tests_pass, integration_tests

5. **client-acceptance**
   - `CLIENT_ACCEPTANCE.md` - Client signoff documentation
   - `UAT_RESULTS.md` - User acceptance test results
   - Validators: client_signoff, uat_completion

6. **production-readiness**
   - `DEPLOYMENT_CHECKLIST.md` - Production deployment verification
   - `RUNBOOK.md` - Operational procedures
   - `MONITORING_SETUP.md` - Monitoring configuration
   - Validators: deployment_tested, rollback_verified, monitoring_active

**Waiver Policy**: Maximum 1 waiver, CTO + Client approval required, 30-day expiry

---

### INTERNAL_TOOLING (Risk: MEDIUM)
**Enforcement**: FLEXIBLE - Required gates + optional, generous waivers

#### Required Gates & Proofs
1. **technical-review**
   - `TECHNICAL_DESIGN.md` - Technical implementation plan
   - `CODE_REVIEW.md` - Peer review documentation
   - Validators: peer_review, design_soundness

2. **integration-testing**
   - `INTEGRATION_TEST.md` - Integration test results
   - `API_TEST_RESULTS.json` - API contract validation
   - Validators: integration_verified, api_contract_valid

3. **documentation**
   - `USER_GUIDE.md` - End-user documentation
   - `API_DOCS.md` - Developer documentation
   - Validators: documentation_complete, examples_provided

#### Optional Gates
4. **rollback-plan**
   - `ROLLBACK_PROCEDURE.md` - Rollback strategy
   - Validators: rollback_tested

**Waiver Policy**: Maximum 2 waivers, Engineering Lead approval, 60-day expiry

---

### MARKETING_OPS (Risk: MEDIUM)
**Enforcement**: FLEXIBLE - Core gates required

#### Required Gates & Proofs
1. **brand-review**
   - `BRAND_APPROVAL.md` - Brand compliance verification
   - `BRAND_CHECKLIST.json` - Brand guideline checklist
   - Validators: brand_compliance, visual_consistency

2. **content-approval**
   - `CONTENT_REVIEW.md` - Content review and approval
   - `MESSAGING_APPROVAL.md` - Message approval documentation
   - Validators: legal_cleared, message_approved

3. **schedule-coordination**
   - `CAMPAIGN_SCHEDULE.md` - Campaign timeline
   - `STAKEHOLDER_APPROVAL.md` - Stakeholder coordination
   - Validators: timeline_approved, resource_allocated

#### Optional Gates
4. **compliance-check**
   - `LEGAL_REVIEW.md` - Legal compliance review
   - Validators: legal_approved

**Waiver Policy**: Maximum 2 waivers, Brand Manager approval, 45-day expiry

---

### INFRASTRUCTURE (Risk: CRITICAL)
**Enforcement**: STRICT - All gates mandatory, no waivers

#### Required Gates & Proofs
1. **architecture-review**
   - `ARCHITECTURE_REVIEW.md` - Infrastructure design review
   - `INFRASTRUCTURE_DIAGRAM.png` - Infrastructure topology
   - `CAPACITY_ANALYSIS.md` - Capacity planning analysis
   - Validators: architect_approval, scalability_verified, cost_approved

2. **security-hardening**
   - `SECURITY_HARDENING.md` - Security hardening documentation
   - `VULNERABILITY_SCAN.json` - Security scan results
   - `PENETRATION_TEST.md` - Penetration test report
   - Validators: security_scan_clean, hardening_applied, pen_test_passed

3. **disaster-recovery**
   - `DR_PLAN.md` - Disaster recovery plan
   - `DR_TEST_RESULTS.md` - DR testing results
   - `BACKUP_VERIFICATION.md` - Backup validation
   - Validators: dr_tested, rto_verified, backup_validated

4. **monitoring-setup**
   - `MONITORING_CONFIG.md` - Monitoring configuration
   - `ALERTING_RULES.json` - Alert rule definitions
   - `DASHBOARD_SCREENSHOTS.png` - Monitoring dashboards
   - Validators: monitoring_active, alerts_functional, dashboards_complete

5. **load-testing**
   - `LOAD_TEST_RESULTS.md` - Performance testing results
   - `PERFORMANCE_METRICS.json` - Performance metrics
   - `CAPACITY_REPORT.md` - Capacity analysis
   - Validators: load_targets_met, performance_acceptable, capacity_sufficient

**Waiver Policy**: NO WAIVERS ALLOWED

---

### RESEARCH_PROTOTYPE (Risk: LOW)
**Enforcement**: FLEXIBLE - Minimal requirements

#### Required Gates & Proofs
1. **concept-approval**
   - `CONCEPT_BRIEF.md` - Research concept documentation
   - `RESEARCH_PLAN.md` - Research methodology
   - Validators: concept_viable, resources_allocated

2. **findings-documentation**
   - `RESEARCH_FINDINGS.md` - Research outcomes
   - `PROTOTYPE_DEMO.mp4` - Demonstration video
   - Validators: findings_documented, demo_available

#### Optional Gates
3. **resource-allocation**
   - `RESOURCE_PLAN.md` - Resource allocation plan
   - Validators: budget_approved

**Waiver Policy**: Maximum 3 waivers, Innovation Lead approval, 90-day expiry

---

### COMPLIANCE_AUDIT (Risk: HIGH)
**Enforcement**: STRICT - All gates mandatory, no waivers

#### Required Gates & Proofs
1. **audit-scope**
   - `AUDIT_SCOPE.md` - Audit scope definition
   - `AUDIT_CRITERIA.md` - Audit criteria documentation
   - Validators: scope_defined, criteria_approved

2. **evidence-collection**
   - `EVIDENCE_INVENTORY.md` - Evidence catalog
   - `EVIDENCE_ARCHIVE.zip` - Evidence preservation
   - Validators: evidence_complete, chain_of_custody

3. **findings-review**
   - `AUDIT_FINDINGS.md` - Audit findings report
   - `STAKEHOLDER_REVIEW.md` - Stakeholder review documentation
   - Validators: findings_verified, stakeholder_notified

4. **audit-signoff**
   - `AUDIT_COMPLETION.md` - Audit completion certificate
   - `AUDITOR_SIGNATURE.pdf` - Auditor certification
   - Validators: auditor_approved, completion_certified

**Waiver Policy**: NO WAIVERS ALLOWED

---

## Waiver Mechanism

### Waiver Request Structure

```json
{
  "requestId": "WAIVER-2026-123456",
  "solutionType": "INTERNAL_TOOLING",
  "gate": "rollback-plan",
  "reason": "Tool deployment is reversible through feature flag disable with zero data impact",
  "requestedBy": "john.doe@company.com",
  "expiryDate": "2026-03-01",
  "riskRating": "LOW",
  "compensatingControls": [
    {
      "control": "Feature Flag Rollback",
      "description": "Tool can be instantly disabled via feature flag",
      "verificationMethod": "Automated rollback test in staging"
    }
  ]
}
```

### Approval Requirements by Risk Level

| Risk Level | Required Approvers | Max Duration | Max Waivers |
|------------|-------------------|--------------|-------------|
| LOW | Innovation Lead | 90 days | 3 |
| MEDIUM | Engineering Lead or Brand Manager | 45-60 days | 2 |
| HIGH | CTO + Stakeholder | 30 days | 1 |
| CRITICAL | No waivers allowed | 0 days | 0 |

### Compensating Controls

All waivers must include compensating controls that:
- Mitigate the risk introduced by skipping the gate
- Have a defined verification method
- Are implementable within the project timeline
- Provide equivalent assurance to the waived gate

## Validation Framework

### Automatic Validators

The gate matrix includes automatic validators for common proof types:

- **stakeholder_signoff**: Validates signature blocks in approval documents
- **test_coverage_80**: Ensures minimum 80% code coverage
- **all_tests_pass**: Validates 100% test pass rate
- **security_scan_clean**: No critical vulnerabilities detected
- **architect_approval**: Architecture team signoff present

### File Naming Conventions

Proof artifacts must follow standardized naming:
- `REQUIREMENTS_APPROVAL.md` or `REQUIREMENTS_APPROVAL_{PROJECT}.md`
- `QA_TEST_REPORT.md` or `QA_TEST_REPORT_{VERSION}.md`
- `CLIENT_ACCEPTANCE.md` or `CLIENT_ACCEPTANCE_{MILESTONE}.md`

### Mandatory Document Sections

Each proof document must contain required fields:
- **REQUIREMENTS_APPROVAL.md**: stakeholder, approval_date, requirements_hash
- **QA_TEST_REPORT.md**: test_summary, coverage_percentage, pass_rate
- **CLIENT_ACCEPTANCE.md**: client_name, acceptance_date, uat_completion

## CI/CD Integration

The gate matrix is enforced through automated CI checks that:

1. **Validate Solution Type**: Ensure mission declares valid solution type
2. **Check Required Proofs**: Verify all required artifacts exist
3. **Run Validators**: Execute automatic validation on proof documents
4. **Validate Waivers**: Check waiver approvals and expiry dates
5. **Block Deployment**: Prevent progression without gate compliance

### Example CI Check

```yaml
- name: Validate Solution Type Gates
  run: |
    node .claude-anx/tools/validate-gate-matrix.js
    if [ $? -ne 0 ]; then
      echo "Gate validation failed"
      exit 1
    fi
```

## Enforcement Levels

### STRICT (Infrastructure, Compliance Audit)
- All gates mandatory
- No waivers allowed or very limited
- Automatic CI blocking
- Executive approval for any exceptions

### STANDARD (Client Delivery)
- All gates required
- Limited waivers with senior approval
- CI warnings and blocking
- Stakeholder notification

### FLEXIBLE (Internal Tools, Marketing, Research)
- Core gates required
- Generous waiver policy
- CI warnings but not blocking
- Team lead approval sufficient

---

**This gate matrix ensures consistent quality while providing appropriate flexibility based on solution risk and business impact.**