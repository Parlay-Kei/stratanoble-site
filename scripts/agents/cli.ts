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
        console.error('❌ Please specify an event to trigger');
        process.exit(1);
      }
      await registry.executeEvent(event);
      break;
      
    case 'help':
    default:
      console.log(`
🤖 Agent Management CLI

Usage:
  npm run agents list              List all registered agents
  npm run agents trigger <event>   Trigger agents for an event

Events:
  pre-commit      Before git commit
  pre-push        Before git push
  pre-deploy      Before deployment
  lint-error      On lint errors
  type-error      On type errors
  service-down    When service is down
  hourly          Every hour
  daily           Every day

Examples:
  npm run agents list
  npm run agents trigger pre-commit
  npm run agents trigger service-down
      `);
  }
}

main().catch(console.error);
