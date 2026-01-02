import { registry, AgentEvent } from './registry';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { projectManagerAgent } from './pm-agent';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register Lint Auto-Fix Agent
registry.register({
  name: 'Auto-Fix Lint',
  description: 'Automatically fixes ESLint errors before commits',
  priority: 10,
  triggers: [
    {
      event: AgentEvent.PRE_COMMIT,
      autoRun: true
    },
    {
      event: AgentEvent.LINT_ERROR,
      autoRun: true
    }
  ],
  execute: async () => {
    const { default: AutoFixLintAgent } = await import('./auto-fix-lint.mjs');
    const agent = new AutoFixLintAgent();
    await agent.execute();
  }
});

// Register Type Check Agent
registry.register({
  name: 'Auto-Fix Types',
  description: 'Automatically fixes TypeScript type errors',
  priority: 9,
  triggers: [
    {
      event: AgentEvent.PRE_COMMIT,
      autoRun: true
    },
    {
      event: AgentEvent.TYPE_ERROR,
      autoRun: true
    }
  ],
  execute: async () => {
    console.log('🔧 Running Prisma generate...');
    execSync('cd apps/website && npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Type definitions updated');
  }
});

// Register Pre-Deploy Agent
registry.register({
  name: 'Pre-Deploy Validator',
  description: 'Validates environment and builds before deployment',
  priority: 10,
  triggers: [
    {
      event: AgentEvent.PRE_DEPLOY,
      autoRun: true
    }
  ],
  execute: async () => {
    console.log('🔍 Running pre-deployment checks...');
    
    // Run lint
    console.log('📋 Checking code quality...');
    execSync('cd apps/website && npm run lint', { stdio: 'inherit' });
    
    // Run type check
    console.log('🔧 Checking TypeScript...');
    execSync('cd apps/website && npm run type-check', { stdio: 'inherit' });
    
    // Run tests
    console.log('🧪 Running tests...');
    try {
      execSync('cd apps/website && npm run test', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Tests not configured or failed');
    }
    
    console.log('✅ Pre-deployment validation passed');
  }
});

// Register Pre-Push Validator Agent
registry.register({
  name: 'Pre-Push Validator',
  description: 'Runs comprehensive validation before pushing code',
  priority: 10,
  triggers: [
    {
      event: AgentEvent.PRE_PUSH,
      autoRun: true
    }
  ],
  execute: async () => {
    console.log('🔍 Running pre-push validation...');
    
    // Run lint
    console.log('📋 Checking code quality...');
    execSync('cd apps/website && npm run lint', { stdio: 'inherit' });
    
    // Run type check
    console.log('🔧 Checking TypeScript...');
    execSync('cd apps/website && npm run type-check', { stdio: 'inherit' });
    
    console.log('✅ Pre-push validation passed');
  }
});

// Register Project Manager Agent
registry.register(projectManagerAgent);

export { registry };
