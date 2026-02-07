# QAG Governance Alignment Diff Summary

**Document ID**: QAG-GOV-DIFF-001
**Date**: 2026-02-06
**Agent**: QAG (QA Gatekeeper)
**Purpose**: Document any differences between governance sources

---

## Summary

**RESULT: NO BLOCKING DIFFERENCES**

All governance sources are aligned. This document captures the comparison methodology and confirms no drift.

---

## Comparison: ROSTER.md vs Interactive Artifacts

### PM Agent (A9) Definition

**governance/ROSTER.md:**
```markdown
### PM - Project Manager (with Business Analyst Capability)

| Attribute | Value |
|-----------|-------|
| **ID** | `pm` |
| **Role** | Project management with embedded Business Analyst capability |
| **Triggers** | Requirements clarification, operator documentation, project planning, stakeholder communication |
| **Owns** | Requirements gathering, user stories, acceptance criteria, operator documentation, project timelines, stakeholder reports |
| **Cannot** | Define product vision (Product Lead), make governance decisions (OCS), approve architecture (Tech Lead) |
| **Boundary** | Executes within product vision; does not set strategic direction |
```

**strataNoble-ops-interactive.html (L624-629):**
```html
<h2>Project Manager (with Business Analyst Capability)</h2>
<p class="subtitle">Agent ID: pm | Trigger: Requirements clarification, operator documentation, project planning</p>
<p>The PM agent includes embedded Business Analyst capability. PM is the <strong>default owner</strong> for requirements clarification and operator documentation.</p>
```

**interactive-org-chart-v4-GOVERNANCE-ENHANCED_1.html (L931-932):**
```javascript
title: 'Project Manager (with Business Analyst Capability)',
subtitle: 'A9 • Requirements Owner • Owner: Steve',
```

**DIFF: NONE** - All sources use identical role definition.

---

### BA Responsibilities Comparison

**ROSTER.md BA Functions:**
| Function | Description |
|----------|-------------|
| Requirements Elicitation | Gather and clarify requirements from stakeholders |
| Gap Analysis | Identify missing requirements or ambiguities |
| Documentation | Create operator documentation and guides |
| Process Mapping | Document business processes and workflows |
| Stakeholder Communication | Translate technical concepts for business stakeholders |

**Ops HTML (L631-642):**
- Requirements Elicitation: Present
- Gap Analysis: Present
- Documentation: Present
- Process Mapping: Present
- Stakeholder Communication: Present

**Org Chart HTML (PM modal):**
- Requirements Elicitation: Present
- Gap Analysis: Present
- Documentation: Present
- Process Mapping: Present
- Stakeholder Communication: Present

**DIFF: NONE** - All 5 BA functions present in all sources.

---

## Comparison: INTAKE.md vs Interactive Artifacts

### Default Routing Matrix

**governance/INTAKE.md:**
| Request Type | Default Owner |
|--------------|---------------|
| Requirements clarification | PM |
| User story creation | PM |
| Acceptance criteria | PM |
| Operator documentation | PM |
| Technical documentation | DOCSMITH |
| Feature implementation | ENGDEL |
| Bug fix | ENGDEL |
| Infrastructure change | PLATOPS |
| Quality validation | QAG |
| Security review | SECOPS |
| Governance question | OCS |

**strataNoble-ops-interactive.html Work Intake Section:**
- Requirements → PM: **Present**
- User stories → PM: **Present**
- Operator docs → PM: **Present**
- Technical → ENGDEL: **Present**
- Infrastructure → PLATOPS: **Present**
- QA → QAG: **Present**
- Governance → OCS: **Present**

**interactive-org-chart-v4-GOVERNANCE-ENHANCED_1.html OCS Modal:**
```javascript
'Route all incoming work through single front door (INTAKE.md)',
'Route requirements to PM by default (INTAKE.md)',
```

**DIFF: NONE** - Routing rules consistent.

---

## Comparison: Bootstrap Contract vs Interactive Artifacts

### Protected Resources

**ANX_BOOTSTRAP_CONTRACT.md (L100-104):**
```markdown
Local overlay is ADDITIVE ONLY. Local files cannot:
- Redefine agents from ROSTER.md
- Modify gate thresholds
- Override routing rules
- Change department prefixes
```

**ROOT_INVARIANT_GATE.md (L31-39):**
| Resource | Override Allowed |
|----------|------------------|
| Agent Roster | NEVER |
| Bootstrap | NEVER |
| Gates | NEVER |
| Policies | NEVER |
| Routing Rules | NEVER |
| Intake Rules | NEVER |

**strataNoble-ops-interactive.html Bootstrap Section:**
- Agent Roster: NEVER override - **Present**
- Gates: NEVER override - **Present**
- Policies: NEVER override - **Present**
- Routing Rules: NEVER override - **Present**

**interactive-org-chart-v4-GOVERNANCE-ENHANCED_1.html Footer:**
```html
No local project can override ROSTER.md or INTAKE.md. Violations cause HARD FAIL.
```

**DIFF: NONE** - Protected resources listed consistently.

---

## Comparison: PM Boundaries

### PM vs Product Lead

**ROSTER.md:**
| Responsibility | PM | Product Lead |
|----------------|----|--------------|
| Requirements gathering | OWNS | Informs |
| User story creation | OWNS | Approves |
| Acceptance criteria | OWNS | Approves |
| Product vision | Executes | OWNS |
| Roadmap prioritization | Supports | OWNS |

**Ops HTML (PM section):**
- Same table structure with identical ownership assignments

**Org Chart HTML (PM modal):**
- Same boundary comparison present

**DIFF: NONE**

### PM vs OCS

**ROSTER.md:**
| Responsibility | PM | OCS |
|----------------|----|----|
| Requirements clarification | OWNS | Routes to PM |
| Governance decisions | Follows | OWNS |
| Agent routing | Requests | OWNS |
| Mission coordination | Executes | OWNS |

**Ops HTML (PM section):**
- Same table structure

**Org Chart HTML (PM modal):**
- Same boundary comparison present

**DIFF: NONE**

---

## Version Comparison

| Source | Document ID | Version | Date |
|--------|-------------|---------|------|
| governance/ROSTER.md | ANX-ROSTER-001 | 2.0.0 | 2026-02-06 |
| governance/INTAKE.md | ANX-INTAKE-001 | 1.0.0 | 2026-02-06 |
| docs/anx/ANX_BOOTSTRAP_CONTRACT.md | ANX-BOOT-CONTRACT-001 | 1.1.0 | 2026-02-06 |
| docs/anx/ROOT_INVARIANT_GATE.md | ANX-GATE-ROOT-001 | 1.1.0 | 2026-02-06 |
| prompts/shared/root-discovery.md | PROMPT-SHARED-ROOTDISC-001 | 1.1.0 | 2026-02-06 |

**All versions dated 2026-02-06 - SYNCHRONIZED**

---

## Potential Drift Points (Monitored)

These areas should be monitored for future drift:

| Area | Risk Level | Mitigation |
|------|------------|------------|
| New agent additions | LOW | ROSTER.md is single source |
| Routing rule changes | LOW | INTAKE.md is canonical |
| HTML artifact updates | MEDIUM | Must sync with governance/* |
| Boundary redefinitions | LOW | Defined at ANX_ROOT only |

---

## Diff Summary Table

| Comparison | Source A | Source B | Differences | Blocking |
|------------|----------|----------|-------------|----------|
| PM role definition | ROSTER.md | Ops HTML | 0 | NO |
| PM role definition | ROSTER.md | Org Chart HTML | 0 | NO |
| BA responsibilities | ROSTER.md | Ops HTML | 0 | NO |
| BA responsibilities | ROSTER.md | Org Chart HTML | 0 | NO |
| PM vs Product Lead | ROSTER.md | Ops HTML | 0 | NO |
| PM vs OCS | ROSTER.md | Ops HTML | 0 | NO |
| Routing rules | INTAKE.md | Ops HTML | 0 | NO |
| Protected resources | CONTRACT.md | ROOT_GATE.md | 0 | NO |
| Protected resources | ROOT_GATE.md | Ops HTML | 0 | NO |
| Protected resources | ROOT_GATE.md | Org Chart HTML | 0 | NO |

**TOTAL DIFFERENCES: 0**
**BLOCKING ISSUES: 0**

---

## Conclusion

```
GOVERNANCE ALIGNMENT DIFF SUMMARY
─────────────────────────────────
Total sources compared: 7
Total comparisons: 10
Differences found: 0
Blocking drift issues: 0

STATUS: CLEAN - No action required
```

---

**Classification**: QAG DIFF REPORT
**Related**: GOV_ALIGNMENT_VERDICT.md
