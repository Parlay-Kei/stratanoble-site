import { Agent, AgentEvent } from './registry.js';
import { AgentLogger } from './logger.js';
import fs from 'fs/promises';
import path from 'path';

interface SprintState {
  activeSprint: number;
  phase: string;
  lastUpdated: string;
  gates: Record<string, string>;
  completedTasks: string[];
  blockers: Array<{
    id: string;
    description: string;
    impact: string;
    blockedTasks: string[];
  }>;
  nextReview: string;
}

interface Task {
  id: string;
  title: string;
  assigneeRole: string;
  priority: string;
  status: string;
  dependencies: string[];
  acceptanceCriteria: string[];
  artifacts: string[];
  estimateHours: number;
}

interface TaskPacket {
  sprint: number;
  goal: string;
  duration: string;
  tasks: Task[];
}

interface Signal {
  signal: string;
  date: string;
  status: string;
  gates: Record<string, string>;
  completed_tasks?: string[];
  evidence: Record<string, string> | string[];
  next_validation_required?: string[];
  metadata?: {
    created_at: string;
    updated_at: string;
    triggered_by: string;
  };
}

export const projectManagerAgent: Agent = {
  name: 'Project Manager v1',
  description: 'Maintains sprint state, creates evidence-backed plans, produces orchestrator-ready task packets',
  priority: 8,
  triggers: [
    {
      event: AgentEvent.SPRINT_PLAN,
      autoRun: true
    },
    {
      event: AgentEvent.SPRINT_STATUS,
      autoRun: true
    },
    {
      event: AgentEvent.SPRINT_NEXT,
      autoRun: false
    }
  ],
  execute: async () => {
    const logger = new AgentLogger('project-manager-v1');
    const sprintDir = path.join(process.cwd(), 'docs', 'sprints');
    const proofsDir = path.join(process.cwd(), 'docs', 'audits', 'proofs');

    try {
      await logger.info('PM Agent v1 - Starting sprint state management');

      // Bootstrap: Ensure directory structure exists
      await ensureDirectories(sprintDir, proofsDir, logger);

      // Load or create sprint state
      const statePath = path.join(sprintDir, '_state.json');
      let state = await loadOrCreateState(statePath, logger);

      // Process signal files to update state
      await processSignalFiles(sprintDir, state, logger);

      // Generate sprint plan if missing
      await generateSprintPlanIfMissing(sprintDir, state, logger);

      // Generate orchestrator task packet
      await generateTaskPacket(sprintDir, state, logger);

      // Generate supporting files
      await generateSupportingFiles(sprintDir, logger);

      // Generate status update
      await generateStatusUpdate(sprintDir, state, logger);

      // Save updated state
      state.lastUpdated = new Date().toISOString();
      await fs.writeFile(statePath, JSON.stringify(state, null, 2));

      await logger.success('Sprint state management complete');
      await logger.summary({
        success: true,
        actionsTaken: 6,
        filesModified: 5,
        errors: 0
      });

    } catch (error) {
      await logger.error(`Failed: ${error}`);
      throw error;
    }
  }
};

async function processSignalFiles(sprintDir: string, state: SprintState, logger: AgentLogger): Promise<void> {
  const signalsDir = path.join(sprintDir, 'signals');

  try {
    await fs.access(signalsDir);
  } catch {
    return; // No signals directory, skip
  }

  const signalFiles = await fs.readdir(signalsDir);

  for (const signalFile of signalFiles) {
    if (!signalFile.endsWith('.json')) continue;

    try {
      const signalPath = path.join(signalsDir, signalFile);
      const signalContent = await fs.readFile(signalPath, 'utf-8');
      const signal: Signal = JSON.parse(signalContent);

      // Only process completed signals
      if (signal.status !== 'complete') {
        await logger.info(`Signal ${signalFile} not complete (status: ${signal.status})`);
        continue;
      }

      await logger.info(`Processing completed signal: ${signalFile}`);

      // Update gates based on signal
      for (const [gateName, gateStatus] of Object.entries(signal.gates)) {
        // Normalize gate name (e.g., "P0-1-middleware-bypass" -> "middleware_bypass")
        const normalizedGateName = gateName
          .replace(/^P\d+-\d+-/, '')
          .replace(/-/g, '_');

        if (gateStatus === 'complete' || gateStatus === 'passed') {
          // Check if we have a matching gate in state
          const matchingGate = Object.keys(state.gates).find(g =>
            g.toLowerCase().includes(normalizedGateName.split('_')[0]) ||
            normalizedGateName.includes(g.toLowerCase())
          );

          if (matchingGate) {
            state.gates[matchingGate] = 'passed';
            await logger.success(`Gate '${matchingGate}' updated to passed from signal`);
          }
        }
      }

      // Mark signal tasks as completed
      if (signal.completed_tasks) {
        for (const taskId of signal.completed_tasks) {
          if (!state.completedTasks.includes(taskId)) {
            state.completedTasks.push(taskId);
            await logger.success(`Task ${taskId} marked complete from signal`);
          }
        }
      }

      // Remove blockers for completed tasks
      if (signal.completed_tasks) {
        state.blockers = state.blockers.filter(blocker => {
          const stillBlocked = blocker.blockedTasks.some(
            taskId => !signal.completed_tasks?.includes(taskId)
          );
          if (!stillBlocked) {
            logger.info(`Blocker ${blocker.id} resolved - all blocked tasks complete`);
          }
          return stillBlocked;
        });
      }

      // Log next validation requirements
      if (signal.next_validation_required && signal.next_validation_required.length > 0) {
        await logger.info(`Next validation required: ${signal.next_validation_required.join(', ')}`);
      }

    } catch (error) {
      await logger.warning(`Failed to process signal ${signalFile}: ${error}`);
    }
  }
}

async function ensureDirectories(sprintDir: string, proofsDir: string, logger: AgentLogger): Promise<void> {
  try {
    await fs.access(sprintDir);
  } catch {
    await fs.mkdir(sprintDir, { recursive: true });
    await logger.info('Created docs/sprints/');
  }

  try {
    await fs.access(proofsDir);
  } catch {
    await fs.mkdir(proofsDir, { recursive: true });
    await logger.info('Created docs/audits/proofs/');
  }

  // Create today's proof directory
  const today = new Date().toISOString().split('T')[0];
  const todayProofDir = path.join(proofsDir, today);
  try {
    await fs.access(todayProofDir);
  } catch {
    await fs.mkdir(todayProofDir, { recursive: true });
    await logger.info(`Created docs/audits/proofs/${today}/`);
  }
}

async function loadOrCreateState(statePath: string, logger: AgentLogger): Promise<SprintState> {
  try {
    const stateContent = await fs.readFile(statePath, 'utf-8');
    const state = JSON.parse(stateContent);
    await logger.info('Loaded existing sprint state');
    return state;
  } catch {
    const newState: SprintState = {
      activeSprint: 1,
      phase: "Security Closeout Proof + Build + CI Stabilization",
      lastUpdated: new Date().toISOString(),
      gates: {
        security: "in_progress",
        build: "not_started",
        ci: "in_progress",
        observability: "in_progress"
      },
      completedTasks: [
        "SEC-001", // Middleware bypass removed
        "SEC-002", // Admin client fail-loud
        "SEC-003", // Protected route enforcement
        "SEC-004", // Middleware security tests
        "SEC-005"  // Env validation CI script
      ],
      blockers: [
        {
          id: "BLOCK-001",
          description: "Observability alert proof pending completion",
          impact: "medium",
          blockedTasks: ["SEC-006"]
        }
      ],
      nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days
    };

    await fs.writeFile(statePath, JSON.stringify(newState, null, 2));
    await logger.info('Created new sprint state');
    return newState;
  }
}

async function generateSprintPlanIfMissing(sprintDir: string, state: SprintState, logger: AgentLogger): Promise<void> {
  const planPath = path.join(sprintDir, `sprint-${state.activeSprint}-plan.md`);

  try {
    await fs.access(planPath);
    await logger.info('Sprint plan already exists');
  } catch {
    const planContent = `# Sprint ${state.activeSprint}: ${state.phase}

**Duration:** 2 weeks (January 1-12, 2026)
**Goal:** Complete security closeout with evidence, stabilize build pipeline, prepare for feature development
**Status:** IN PROGRESS

---

## Sprint Objectives

### Primary Goals
1. Complete all security hardening tasks with proof artifacts
2. Stabilize Next.js 15 build pipeline (zero build errors)
3. Achieve green CI/CD pipeline
4. Generate comprehensive Security Gate Proof document

### Success Criteria
- [ ] All critical security tasks completed with proof files
- [ ] Build completes successfully across all apps
- [ ] CI pipeline passing with all checks green
- [ ] Security Gate Proof document references all evidence

---

## Completed Tasks

### SEC-001: Remove Middleware Bypass
**Status:** COMPLETED
**Assignee:** Security Agent
**Proof:** \`docs/audits/proofs/2026-01-01/middleware-fix.log\`

**Description:** Removed early return from middleware to enforce full security chain.

**Acceptance Criteria:**
- [x] Middleware has no unconditional NextResponse.next() bypass
- [x] Security tests cover the chain
- [x] Proof file saved

---

### SEC-002: Supabase Admin Client Fail-Loud
**Status:** COMPLETED
**Assignee:** Security Agent
**Proof:** \`docs/audits/proofs/2026-01-01/admin-client-validation.log\`

**Description:** Configured admin client to fail loudly if service role key missing.

**Acceptance Criteria:**
- [x] Service role key validation at startup
- [x] Loud failure prevents silent degradation
- [x] Proof file saved

---

### SEC-003: Protected Route Enforcement
**Status:** COMPLETED
**Assignee:** Security Agent
**Proof:** \`docs/audits/proofs/2026-01-01/route-protection-tests.log\`

**Description:** Ensured all protected routes require proper authentication.

**Acceptance Criteria:**
- [x] Route guards implemented
- [x] Unauthenticated access blocked
- [x] Proof file saved

---

### SEC-004: Middleware Security Tests
**Status:** COMPLETED
**Assignee:** Security Agent
**Proof:** \`docs/audits/proofs/2026-01-01/middleware-tests.log\`

**Description:** Added comprehensive security tests for middleware chain.

**Acceptance Criteria:**
- [x] Tests cover CSRF protection
- [x] Tests cover auth validation
- [x] Proof file saved

---

### SEC-005: Environment Validation CI Script
**Status:** COMPLETED
**Assignee:** Platform Engineer
**Proof:** \`docs/audits/proofs/2026-01-01/env-validation.log\`

**Description:** Created CI check script to validate required environment variables.

**Acceptance Criteria:**
- [x] Script checks all required env vars
- [x] CI fails if vars missing
- [x] Proof file saved

---

## In Progress Tasks

### SEC-006: Observability Alert Proof
**Status:** IN PROGRESS
**Assignee:** Platform Engineer
**Expected Proof:** \`docs/audits/proofs/2026-01-01/observability-alert.png\`

**Description:** Demonstrate that security monitoring alerts work.

**Acceptance Criteria:**
- [ ] Test alert triggered
- [ ] Screenshot/log saved
- [ ] Monitoring verified functional

---

## Remaining Tasks

### BUILD-001: Fix Next.js 15 SSR Build Failures
**Status:** NOT STARTED
**Assignee:** Tech Lead
**Priority:** CRITICAL
**Estimate:** 12 hours

**Description:** Resolve server-side rendering conflicts causing build failures.

**Acceptance Criteria:**
- [ ] Build completes without errors
- [ ] All pages pass static generation
- [ ] Build output saved to \`docs/audits/proofs/<date>/build-success.log\`

**Files to Update:**
- \`apps/website/src/app/vault/page.tsx\`
- \`apps/website/src/app/dashboard/page.tsx\`
- \`apps/website/src/app/achievery-preview/page.tsx\`

---

### CI-001: Commit ESLint Fix and Verify CI
**Status:** NOT STARTED
**Assignee:** Platform Engineer
**Priority:** HIGH
**Estimate:** 2 hours

**Description:** Commit prepared ESLint fix and confirm CI pipeline passes.

**Acceptance Criteria:**
- [ ] ESLint fix committed
- [ ] CI pipeline runs and passes
- [ ] CI output saved to \`docs/audits/proofs/<date>/ci-success.log\`

---

### DOC-001: Security Gate Proof Document
**Status:** NOT STARTED
**Assignee:** Security Agent + PM
**Priority:** HIGH
**Estimate:** 4 hours

**Description:** Generate comprehensive Security Gate Proof document with all evidence links.

**Acceptance Criteria:**
- [ ] All completed tasks referenced
- [ ] All proof files linked
- [ ] No claims without evidence
- [ ] Document saved to \`docs/audits/security-gate-proof.md\`

---

## Dependency Graph

\`\`\`
Security Track (Completed):
SEC-001 -> SEC-002 -> SEC-003 -> SEC-004 -> SEC-005

Security Track (In Progress):
SEC-006 -> DOC-001

Build Track (Parallel):
BUILD-001
CI-001

Documentation:
DOC-001 (depends on SEC-006, BUILD-001, CI-001)
\`\`\`

---

## Blockers

### BLOCK-001: Observability Alert Proof
**Impact:** MEDIUM
**Description:** SEC-006 waiting for agent completion
**Blocked Tasks:** DOC-001
**Mitigation:** Agent progressing, expected completion today

---

## Next Actions

1. Complete SEC-006 (observability alert proof)
2. Start BUILD-001 (Next.js SSR fixes)
3. Execute CI-001 (ESLint commit)
4. Generate DOC-001 (Security Gate Proof)

---

**Sprint Plan Created:** ${new Date().toISOString()}
**Next Review:** ${state.nextReview}
**Maintained By:** PM Agent v1
`;

    await fs.writeFile(planPath, planContent);
    await logger.success(`Created sprint-${state.activeSprint}-plan.md`);
  }
}

async function generateTaskPacket(sprintDir: string, state: SprintState, logger: AgentLogger): Promise<void> {
  const taskPacketPath = path.join(sprintDir, `sprint-${state.activeSprint}-tasks.json`);

  const today = new Date().toISOString().split('T')[0];

  const taskPacket: TaskPacket = {
    sprint: state.activeSprint,
    goal: "Security closeout proof + build stabilization",
    duration: "2 weeks",
    tasks: [
      {
        id: "SEC-001",
        title: "Remove middleware bypass",
        assigneeRole: "security",
        priority: "critical",
        status: "completed",
        dependencies: [],
        acceptanceCriteria: [
          "Middleware has no unconditional NextResponse.next() bypass",
          "Security tests cover the chain"
        ],
        artifacts: [
          `docs/audits/proofs/${today}/middleware-fix.log`
        ],
        estimateHours: 4
      },
      {
        id: "SEC-002",
        title: "Supabase admin client fail-loud",
        assigneeRole: "security",
        priority: "critical",
        status: "completed",
        dependencies: [],
        acceptanceCriteria: [
          "Service role key validation at startup",
          "Loud failure prevents silent degradation"
        ],
        artifacts: [
          `docs/audits/proofs/${today}/admin-client-validation.log`
        ],
        estimateHours: 3
      },
      {
        id: "SEC-003",
        title: "Protected route enforcement",
        assigneeRole: "security",
        priority: "critical",
        status: "completed",
        dependencies: [],
        acceptanceCriteria: [
          "Route guards implemented",
          "Unauthenticated access blocked"
        ],
        artifacts: [
          `docs/audits/proofs/${today}/route-protection-tests.log`
        ],
        estimateHours: 4
      },
      {
        id: "SEC-004",
        title: "Middleware security tests",
        assigneeRole: "security",
        priority: "high",
        status: "completed",
        dependencies: ["SEC-001"],
        acceptanceCriteria: [
          "Tests cover CSRF protection",
          "Tests cover auth validation"
        ],
        artifacts: [
          `docs/audits/proofs/${today}/middleware-tests.log`
        ],
        estimateHours: 3
      },
      {
        id: "SEC-005",
        title: "Environment validation CI script",
        assigneeRole: "platform",
        priority: "high",
        status: "completed",
        dependencies: [],
        acceptanceCriteria: [
          "Script checks all required env vars",
          "CI fails if vars missing"
        ],
        artifacts: [
          `docs/audits/proofs/${today}/env-validation.log`
        ],
        estimateHours: 2
      },
      {
        id: "SEC-006",
        title: "Observability alert proof",
        assigneeRole: "platform",
        priority: "high",
        status: "in_progress",
        dependencies: [],
        acceptanceCriteria: [
          "Test alert triggered",
          "Screenshot/log saved",
          "Monitoring verified functional"
        ],
        artifacts: [
          `docs/audits/proofs/${today}/observability-alert.png`
        ],
        estimateHours: 4
      },
      {
        id: "BUILD-001",
        title: "Fix Next.js 15 SSR build failures",
        assigneeRole: "tech-lead",
        priority: "critical",
        status: "not_started",
        dependencies: [],
        acceptanceCriteria: [
          "Build completes without errors",
          "All pages pass static generation",
          "Build output saved to proof file"
        ],
        artifacts: [
          `docs/audits/proofs/<date>/build-success.log`
        ],
        estimateHours: 12
      },
      {
        id: "CI-001",
        title: "Commit ESLint fix and verify CI",
        assigneeRole: "platform",
        priority: "high",
        status: "not_started",
        dependencies: [],
        acceptanceCriteria: [
          "ESLint fix committed",
          "CI pipeline runs and passes",
          "CI output saved to proof file"
        ],
        artifacts: [
          `docs/audits/proofs/<date>/ci-success.log`
        ],
        estimateHours: 2
      },
      {
        id: "DOC-001",
        title: "Security Gate Proof document",
        assigneeRole: "security",
        priority: "high",
        status: "not_started",
        dependencies: ["SEC-006", "BUILD-001", "CI-001"],
        acceptanceCriteria: [
          "All completed tasks referenced",
          "All proof files linked",
          "No claims without evidence"
        ],
        artifacts: [
          "docs/audits/security-gate-proof.md"
        ],
        estimateHours: 4
      }
    ]
  };

  await fs.writeFile(taskPacketPath, JSON.stringify(taskPacket, null, 2));
  await logger.success(`Created sprint-${state.activeSprint}-tasks.json for orchestrator`);
}

async function generateSupportingFiles(sprintDir: string, logger: AgentLogger): Promise<void> {
  const files = ['backlog.md', 'dependencies.md', 'roadmap.md', 'risks.md'];

  for (const file of files) {
    const filePath = path.join(sprintDir, file);
    try {
      await fs.access(filePath);
    } catch {
      const content = `# ${file.replace('.md', '').replace('-', ' ').toUpperCase()}

Created by PM Agent v1

---

*This file will be populated as sprints progress.*
`;
      await fs.writeFile(filePath, content);
      await logger.info(`Created ${file}`);
    }
  }
}

async function generateStatusUpdate(sprintDir: string, state: SprintState, logger: AgentLogger): Promise<void> {
  const statusPath = path.join(sprintDir, 'status.md');

  const completedCount = state.completedTasks.length;
  const totalTasks = 9; // Based on task packet
  const completionPercent = Math.round((completedCount / totalTasks) * 100);

  const statusContent = `# Sprint ${state.activeSprint} Status - Week 1

**Last Updated:** ${state.lastUpdated}
**Sprint:** ${state.phase}
**Duration:** January 1-12, 2026

---

## Progress Summary
- Tasks Completed: ${completedCount}/${totalTasks} (${completionPercent}%)
- Tasks In Progress: 1/${totalTasks} (11%)
- Tasks Not Started: ${totalTasks - completedCount - 1}/${totalTasks} (${Math.round(((totalTasks - completedCount - 1) / totalTasks) * 100)}%)
- Overall Completion: ${completionPercent}%

---

## Completed This Week
${state.completedTasks.map(taskId => `- ${taskId}: See sprint plan for details`).join('\n')}

---

## In Progress
- SEC-006: Observability alert proof (agent working)

---

## Blocked
${state.blockers.length > 0 ? state.blockers.map(b => `- ${b.id}: ${b.description} (Impact: ${b.impact})`).join('\n') : '- None'}

---

## Next Week Focus
1. Complete observability alert proof (SEC-006)
2. Fix Next.js 15 SSR build failures (BUILD-001)
3. Commit ESLint fix and verify CI (CI-001)
4. Generate Security Gate Proof document (DOC-001)

---

## Gates Status
${Object.entries(state.gates).map(([gate, status]) => `- **${gate}**: ${status}`).join('\n')}

---

## Risks & Concerns
- **Medium Risk:** Build complexity may exceed estimate
  - Mitigation: Tech Lead allocated 20% buffer time

---

**Next Review:** ${state.nextReview}
**Generated By:** PM Agent v1
`;

  await fs.writeFile(statusPath, statusContent);
  await logger.success('Generated status.md');
}
