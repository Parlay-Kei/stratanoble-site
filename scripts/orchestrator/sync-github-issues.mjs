#!/usr/bin/env node

/**
 * Syncs GitHub Issues created by orchestrator back to sprint task packet
 *
 * This script adds validation tasks to the task packet when orchestrator
 * creates GitHub Issues for post-P0 validation.
 */

import fs from 'fs/promises';
import path from 'path';

const SPRINT_DIR = path.join(process.cwd(), 'docs', 'sprints');
const SIGNALS_DIR = path.join(SPRINT_DIR, 'signals');

async function getActiveSprintNumber() {
  try {
    const statePath = path.join(SPRINT_DIR, '_state.json');
    const stateContent = await fs.readFile(statePath, 'utf-8');
    const state = JSON.parse(stateContent);
    return state.activeSprint || 1;
  } catch {
    return 1;
  }
}

async function syncGitHubIssues() {
  const sprintNumber = await getActiveSprintNumber();
  const taskPacketPath = path.join(SPRINT_DIR, `sprint-${sprintNumber}-tasks.json`);

  // Read current task packet
  let taskPacket;
  try {
    const taskPacketContent = await fs.readFile(taskPacketPath, 'utf-8');
    taskPacket = JSON.parse(taskPacketContent);
  } catch (error) {
    console.error(`Failed to read task packet: ${error}`);
    process.exit(1);
  }

  // Read signal file to get completed tasks
  let signal;
  try {
    const signalPath = path.join(SIGNALS_DIR, 'security-hotfix-p0.json');
    const signalContent = await fs.readFile(signalPath, 'utf-8');
    signal = JSON.parse(signalContent);
  } catch (error) {
    console.log('No signal file found, skipping validation task sync');
    return;
  }

  // Only process if signal is complete
  if (signal.status !== 'complete') {
    console.log(`Signal not complete (status: ${signal.status}), skipping sync`);
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const completedTaskIds = signal.completed_tasks || [];

  // Define validation tasks that should be created
  const validationTasks = [
    {
      id: "VAL-001",
      title: "Run test suite + save proof",
      assigneeRole: "qa",
      priority: "high",
      status: "not_started",
      dependencies: completedTaskIds,
      acceptanceCriteria: [
        "All tests pass",
        "Test output saved to proof file"
      ],
      artifacts: [
        `docs/audits/proofs/${today}/test-suite-validation.log`
      ],
      estimateHours: 2
    },
    {
      id: "VAL-002",
      title: "Run production build + save proof",
      assigneeRole: "platform",
      priority: "high",
      status: "not_started",
      dependencies: ["VAL-001"],
      acceptanceCriteria: [
        "Build completes successfully",
        "Build output saved to proof file"
      ],
      artifacts: [
        `docs/audits/proofs/${today}/production-build-validation.log`
      ],
      estimateHours: 1
    },
    {
      id: "VAL-003",
      title: "Deploy to staging + validate",
      assigneeRole: "platform",
      priority: "high",
      status: "not_started",
      dependencies: ["VAL-002"],
      acceptanceCriteria: [
        "Staging deployment successful",
        "Smoke tests pass",
        "Deployment log saved"
      ],
      artifacts: [
        `docs/audits/proofs/${today}/staging-deployment.log`
      ],
      estimateHours: 2
    },
    {
      id: "VAL-004",
      title: "Configure Sentry alerts",
      assigneeRole: "security",
      priority: "medium",
      status: "not_started",
      dependencies: ["VAL-003"],
      acceptanceCriteria: [
        "Alerts configured for new security fixes",
        "Test alert triggered and verified"
      ],
      artifacts: [
        `docs/audits/proofs/${today}/sentry-alerts-config.log`
      ],
      estimateHours: 1
    },
    {
      id: "VAL-005",
      title: "Update sprint state",
      assigneeRole: "pm",
      priority: "high",
      status: "not_started",
      dependencies: ["VAL-001", "VAL-002", "VAL-003", "VAL-004"],
      acceptanceCriteria: [
        "_state.json updated with validation results",
        "All gates marked passed with proof"
      ],
      artifacts: [
        "docs/sprints/_state.json"
      ],
      estimateHours: 0.5
    }
  ];

  // Add validation tasks to packet if not present
  let tasksAdded = 0;
  for (const valTask of validationTasks) {
    const exists = taskPacket.tasks.find(t => t.id === valTask.id);
    if (!exists) {
      taskPacket.tasks.push(valTask);
      console.log(`Added validation task: ${valTask.id} - ${valTask.title}`);
      tasksAdded++;
    }
  }

  if (tasksAdded === 0) {
    console.log('All validation tasks already exist in task packet');
    return;
  }

  // Save updated task packet
  await fs.writeFile(taskPacketPath, JSON.stringify(taskPacket, null, 2));
  console.log(`Task packet synced with ${tasksAdded} validation tasks`);
}

syncGitHubIssues().catch((error) => {
  console.error('Sync failed:', error);
  process.exit(1);
});
