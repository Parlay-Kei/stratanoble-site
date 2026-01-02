export interface Agent {
  name: string;
  description: string;
  triggers: AgentTrigger[];
  execute: () => Promise<void>;
  priority: number; // 1-10, higher = more urgent
}

export interface AgentTrigger {
  event: AgentEvent;
  condition?: () => boolean;
  autoRun: boolean;
}

export enum AgentEvent {
  // Git events
  PRE_COMMIT = 'pre-commit',
  PRE_PUSH = 'pre-push',
  POST_COMMIT = 'post-commit',

  // Build events
  PRE_BUILD = 'pre-build',
  BUILD_FAILED = 'build-failed',

  // Code quality events
  LINT_ERROR = 'lint-error',
  TYPE_ERROR = 'type-error',
  TEST_FAILURE = 'test-failure',

  // Deployment events
  PRE_DEPLOY = 'pre-deploy',
  DEPLOY_FAILED = 'deploy-failed',

  // System events
  SERVICE_DOWN = 'service-down',
  PERFORMANCE_DEGRADED = 'performance-degraded',

  // Time-based events
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',

  // Sprint management events
  SPRINT_PLAN = 'sprint-plan',
  SPRINT_STATUS = 'sprint-status',
  SPRINT_NEXT = 'sprint-next'
}

import { AgentLogger } from './logger.js';
import { AgentStorage, AgentExecutionRecord } from './storage.js';
import { showAgentStartBanner, showAgentCompleteBanner } from './banner.js';

class AgentRegistry {
  private agents: Map<string, Agent> = new Map();
  private storage: AgentStorage;

  constructor() {
    this.storage = new AgentStorage();
  }

  register(agent: Agent) {
    this.agents.set(agent.name, agent);
    console.log(`✅ Registered agent: ${agent.name}`);
  }

  getAgentsForEvent(event: AgentEvent): Agent[] {
    const matchingAgents: Agent[] = [];

    for (const agent of this.agents.values()) {
      for (const trigger of agent.triggers) {
        if (trigger.event === event) {
          // Check condition if present
          if (!trigger.condition || trigger.condition()) {
            matchingAgents.push(agent);
          }
        }
      }
    }

    // Sort by priority (highest first)
    return matchingAgents.sort((a, b) => b.priority - a.priority);
  }

  async executeEvent(event: AgentEvent): Promise<void> {
    const agents = this.getAgentsForEvent(event);
    
    if (agents.length === 0) {
      console.log(`ℹ️  No agents registered for event: ${event}`);
      return;
    }

    console.log(`\n🤖 Triggering ${agents.length} agent(s) for event: ${event}\n`);

    for (const agent of agents) {
      const trigger = agent.triggers.find(t => t.event === event);
      
      if (trigger?.autoRun) {
        await this.executeAgentWithMonitoring(agent, event);
      } else {
        console.log(`⏭️  Skipped (manual): ${agent.name}`);
      }
    }
  }

  private async executeAgentWithMonitoring(agent: Agent, trigger: string): Promise<void> {
    const logger = new AgentLogger(agent.name);
    const startTime = new Date();
    const executionId = `${agent.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Show start banner
    showAgentStartBanner(agent.name, trigger);
    
    await logger.info(`Starting execution`, { trigger });
    
    try {
      // Execute agent
      await agent.execute();
      
      // Calculate duration
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      // Log success
      await logger.success(`Execution completed successfully`);
      await logger.summary({
        success: true,
        actionsTaken: 1,
        filesModified: 0,
        errors: 0
      });
      
      // Save execution record
      const record: AgentExecutionRecord = {
        id: executionId,
        agentName: agent.name,
        trigger,
        status: 'success',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        actionsTaken: 1,
        filesModified: 0,
        errors: 0,
        fullLog: `Agent ${agent.name} executed successfully`
      };
      
      await this.storage.saveExecution(record);
      
      // Show completion banner
      showAgentCompleteBanner(agent.name, 'success');
      
      console.log(`✅ Completed: ${agent.name}\n`);
    } catch (error) {
      // Calculate duration
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      // Log failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      await logger.error(`Execution failed: ${errorMessage}`);
      await logger.summary({
        success: false,
        actionsTaken: 0,
        filesModified: 0,
        errors: 1
      });
      
      // Save execution record
      const record: AgentExecutionRecord = {
        id: executionId,
        agentName: agent.name,
        trigger,
        status: 'failed',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        actionsTaken: 0,
        filesModified: 0,
        errors: 1,
        fullLog: `Agent ${agent.name} failed: ${errorMessage}`
      };
      
      await this.storage.saveExecution(record);
      
      // Show completion banner
      showAgentCompleteBanner(agent.name, 'failed');
      
      console.error(`❌ Failed: ${agent.name}`, error);
    }
  }

  listAgents(): void {
    console.log('\n📋 Registered Agents:\n');
    
    for (const agent of this.agents.values()) {
      console.log(`🤖 ${agent.name}`);
      console.log(`   ${agent.description}`);
      console.log(`   Priority: ${agent.priority}`);
      console.log(`   Triggers: ${agent.triggers.map(t => t.event).join(', ')}`);
      console.log();
    }
  }
}

export const registry = new AgentRegistry();
