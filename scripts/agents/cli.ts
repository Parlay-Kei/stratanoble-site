#!/usr/bin/env node

import { registry } from './index';
import { AgentEvent } from './registry';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'list':
      registry.listAgents();
      break;

    case 'trigger':
      const event = args[1] as AgentEvent;
      if (!event) {
        console.error('Please specify an event to trigger');
        process.exit(1);
      }
      await registry.executeEvent(event);
      break;

    // Sprint management commands
    case 'sprint:plan':
      console.log('Planning sprint...');
      await registry.executeEvent(AgentEvent.SPRINT_PLAN);
      break;

    case 'sprint:status':
      console.log('Generating status...');
      await registry.executeEvent(AgentEvent.SPRINT_STATUS);
      break;

    case 'sprint:next':
      console.log('Planning next sprint...');
      await registry.executeEvent(AgentEvent.SPRINT_NEXT);
      break;

    case 'help':
    default:
      console.log(`
Agent Management CLI

Usage:
  npm run agents list              List all registered agents
  npm run agents trigger <event>   Trigger agents for an event

Sprint Commands:
  npm run agents sprint:plan       Create or update sprint plan
  npm run agents sprint:status     Show current sprint status
  npm run agents sprint:next       Plan next sprint

Events:
  pre-commit      Before git commit
  pre-push        Before git push
  pre-deploy      Before deployment
  lint-error      On lint errors
  type-error      On type errors
  service-down    When service is down
  sprint-plan     Create/update sprint plan
  sprint-status   Generate sprint status
  sprint-next     Plan next sprint
  hourly          Every hour
  daily           Every day

Examples:
  npm run agents list
  npm run agents trigger pre-commit
  npm run agents trigger service-down
  npm run agents sprint:plan
  npm run agents sprint:status
      `);
  }
}

main().catch(console.error);
