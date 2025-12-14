# Working Agreements

> **SACRED FILE**: Defines what agents can and cannot do, gates, and conventions  
> **Last Updated**: December 13, 2025  
> **Authority**: Human Exec (Steve Hubbard)

---

## Agent Boundaries

### Orchestrator CAN:
- Route tasks to appropriate agents
- Maintain status.md and weekly plans
- Escalate blockers after 2-hour threshold
- Reject unclear requests for clarification

### Orchestrator CANNOT:
- Write application code
- Make architectural decisions
- Approve merges

---

### AI PM CAN:
- Write PRDs and define requirements
- Set acceptance criteria
- Prioritize backlog
- Define success metrics

### AI PM CANNOT:
- Make technical architecture decisions
- Estimate engineering effort
- Approve code

---

### AI Tech Lead CAN:
- Create technical designs
- Break down tasks for Feature Engineers
- Define interfaces and contracts
- Review and approve PRs
- Implement up to 30% of work

### AI Tech Lead CANNOT:
- Change product scope
- Modify platform/infra without Platform Engineer
- Take more than 30% of implementation

---

### Feature Engineers CAN:
- Modify files in `apps/website/src/`
- Modify files in `apps/platform/src/`
- Create test files for their code
- Update docs for their changes

### Feature Engineers CANNOT:
- Modify `infra/` (Platform Engineer only)
- Modify `packages/` without Tech Lead approval
- Modify `.claude/agents/` (Human Exec only)
- Modify files outside their assignment
- Merge without passing gates

---

### Platform Engineer CAN:
- Modify `infra/`
- Modify CI/CD pipelines
- Create deployment templates
- Configure monitoring and alerting

### Platform Engineer CANNOT:
- Modify application logic in `apps/`
- Change product behavior

---

### Security Agent CAN:
- **VETO any merge** with security concerns
- Require threat model updates
- Audit dependencies
- Block deployments for security issues

### Security Agent CANNOT:
- Veto for non-security reasons
- Define product features
- Make performance tradeoffs

---

### QA Strategist CAN:
- Block merges for test failures
- Require tests for acceptance criteria
- Quarantine flaky tests

### QA Strategist CANNOT:
- Approve UX or architecture
- Skip coverage requirements
- Implement features

---

## Non-Negotiable Gates

**Every merge is blocked unless ALL gates pass:**

| Gate | Owner | Requirement |
|------|-------|-------------|
| Spec Linked | PM | PRD + stories + acceptance criteria linked |
| ADR Exists | Tech Lead | Architectural decisions documented |
| Threat Model | Security | New surfaces have threat model |
| Tests Pass | QA | Unit + integration passing |
| Coverage | QA | ≥80% overall, ≥90% new code |
| Security Review | Security | No vulnerabilities |
| Runbook | Docs | New services documented |
| Cost Estimate | Platform | Infra changes have cost note |

---

## File Ownership

| Path | Owner | Others Need Approval |
|------|-------|---------------------|
| `apps/` | Feature Engineers | Tech Lead assigns files |
| `packages/` | Tech Lead | Explicit approval required |
| `infra/` | Platform Engineer | No others modify |
| `docs/prd/` | PM | Tech Lead for design |
| `docs/design/` | Tech Lead | PM for requirements |
| `docs/security/` | Security | Platform for infra security |
| `.claude/agents/` | Human Exec | No agents modify |
| `WORKING_AGREEMENTS.md` | Human Exec | No agents modify |

---

## Naming Conventions

### Branches
- Feature: `feature/<ticket>-<short-description>`
- Bug fix: `fix/<ticket>-<short-description>`
- Hotfix: `hotfix/<description>`

### Documents
- PRD: `docs/prd/<feature-name>.md`
- Design: `docs/design/<feature-name>.md`
- ADR: `docs/adr/YYYY-MM-DD-<title>.md`
- Test Plan: `docs/testplan/<feature-name>.md`
- Threat Model: `docs/security/threat-models/<surface>.md`

### Tasks
- Task file: `tasks/<feature>.yaml`
- Task ID: `<PREFIX>-<NUMBER>` (e.g., SS-001)

### PRs
- Title: `[<ticket>] <description>`
- Body: Link to task, acceptance criteria checklist

---

## Operating Cadence

### Weekly Cycle
| Day | Focus |
|-----|-------|
| Monday | Shaping: PRD → Design → Tasks |
| Tuesday-Thursday | Building: Implementation |
| Friday | Hardening: QA, Security, Docs, Release |

### Daily Rhythm (15 min)
1. What shipped yesterday?
2. What blocks today?
3. What risk is rising?

---

## Escalation Timeouts

| Issue | Timeout | Escalate To |
|-------|---------|-------------|
| Blocked task | 2 hours | Tech Lead |
| Unresolved block | 4 hours | Human Exec |
| Security concern | Immediate | Security Agent + Human Exec |
| Scope conflict | Same day | PM → Human Exec |

---

## Communication Rules

1. **Status updates in status.md** - Not scattered across tools
2. **Questions have context** - Include what you've tried
3. **Blockers announced immediately** - Don't wait for standup
4. **Decisions documented** - ADRs for significant choices

---

## Amendment Process

Only Human Exec can modify this file. To request changes:
1. Document proposed change
2. Explain rationale
3. Submit to Human Exec
4. Wait for approval before acting

---

**Violations of these agreements will be flagged by the Orchestrator and escalated to Human Exec.**
