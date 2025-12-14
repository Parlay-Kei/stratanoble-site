# Autonomous Agent Trigger System

## Overview
The Autonomous Agent System is a proactive monitoring and auto-fix system that detects when actions are needed and executes automatically without manual invocation. This prevents issues like lint failures, type errors, and deployment problems before they reach production.

## Architecture

### Components

1. **Agent Registry** (`scripts/agents/registry.ts`)
   - Central registry for all autonomous agents
   - Manages agent triggers and execution
   - Supports conditional execution and prioritization

2. **Auto-Fix Lint Agent** (`scripts/agents/auto-fix-lint.mjs`)
   - Automatically fixes ESLint errors
   - Handles escape characters, console statements, const errors
   - Runs before commits and on lint errors

3. **Type Check Agent**
   - Generates Prisma types
   - Ensures TypeScript compilation succeeds
   - Runs before commits and on type errors

4. **Pre-Deploy Validator**
   - Validates environment configuration
   - Runs comprehensive checks before deployment
   - Prevents deployment failures

5. **Pre-Push Validator**
   - Runs lint and type checks before pushing
   - Prevents pushing broken code to repository

## Installation

### 1. Install Dependencies
```bash
npm install --save-dev husky node-cron tsx
```

### 2. Initialize Git Hooks
```bash
npm run agents:setup
```

This will create:
- `.husky/pre-commit` - Runs before git commit
- `.husky/pre-push` - Runs before git push
- `.husky/_/husky.sh` - Husky helper script

### 3. Fix Current Lint Errors
```bash
npm run fix-lint
```

## Usage

### Available Commands

#### List All Agents
```bash
npm run agents list
```

Shows all registered agents with their descriptions, priorities, and triggers.

#### Trigger Specific Event
```bash
npm run agents trigger <event>
```

Events:
- `pre-commit` - Before git commit
- `pre-push` - Before git push
- `pre-deploy` - Before deployment
- `lint-error` - When lint errors occur
- `type-error` - When type errors occur
- `hourly` - Every hour (for scheduled monitoring)
- `daily` - Every day
- `weekly` - Every week

#### Run Scheduler
```bash
npm run agents:schedule
```

Starts the agent scheduler for time-based triggers (hourly, daily, weekly).

### Agent Triggers

Agents automatically run on these events:

#### Pre-Commit
- ✅ Auto-Fix Lint Agent
- ✅ Auto-Fix Types Agent

#### Pre-Push
- ✅ Pre-Push Validator
- ✅ Lint check
- ✅ Type check

#### Pre-Deploy
- ✅ Pre-Deploy Validator
- ✅ Environment validation
- ✅ Build validation
- ✅ Test execution

## Creating Custom Agents

### 1. Define Agent Interface

```typescript
import { registry, AgentEvent } from './registry';

registry.register({
  name: 'My Custom Agent',
  description: 'Does something useful',
  priority: 8, // 1-10, higher = more urgent
  triggers: [
    {
      event: AgentEvent.PRE_COMMIT,
      autoRun: true,
      condition: () => {
        // Optional: Add conditions
        return process.env.NODE_ENV === 'production';
      }
    }
  ],
  execute: async () => {
    console.log('Executing custom agent...');
    // Your agent logic here
  }
});
```

### 2. Add to Registry

Add your agent registration to `scripts/agents/index.ts`.

## Git Hooks

### Pre-Commit Hook
Located at `.husky/pre-commit`, this hook:
1. Runs lint auto-fix
2. Checks TypeScript types
3. Blocks commit if errors remain

### Pre-Push Hook
Located at `.husky/pre-push`, this hook:
1. Runs comprehensive lint check
2. Validates TypeScript compilation
3. Blocks push if validation fails

### Bypassing Hooks
For emergencies only:
```bash
git commit --no-verify -m "emergency fix"
git push --no-verify
```

## Auto-Fix Capabilities

### Lint Auto-Fix
The Auto-Fix Lint Agent can automatically fix:

1. **Escape Characters**
   - Converts unescaped quotes to HTML entities
   - Fixes `react/no-unescaped-entities` errors

2. **Console Statements**
   - Comments out or removes console.log
   - Fixes `no-console` errors

3. **Const Declarations**
   - Converts `let` to `const` where appropriate
   - Fixes `prefer-const` errors

4. **Hook Dependencies**
   - Identifies missing dependencies
   - Flags for manual review

### Type Auto-Fix
The Type Check Agent:
- Regenerates Prisma client types
- Ensures database schema is in sync
- Updates type definitions

## Troubleshooting

### Hooks Not Running
```bash
# Re-initialize husky
npx husky install

# Make hooks executable (Linux/Mac)
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### Agent Fails
```bash
# Check which agents are registered
npm run agents list

# Run specific agent manually
npm run agents trigger pre-commit
```

### Skip All Checks (Emergency)
```bash
# Disable all agents temporarily
export HUSKY=0
git commit -m "emergency fix"
```

## Best Practices

1. **Let Agents Run** - Don't bypass hooks unless absolutely necessary
2. **Review Auto-Fixes** - Check what was auto-fixed before committing
3. **Add Custom Agents** - Create agents for project-specific needs
4. **Monitor Logs** - Check agent output for warnings
5. **Update Regularly** - Keep agent logic current with project needs

## Performance

- Pre-commit checks: ~10-30 seconds
- Pre-push validation: ~30-60 seconds
- Lint auto-fix: ~5-15 seconds

## Security

- All agents run locally on developer machines
- No external API calls without explicit configuration
- Git hooks can be audited in `.husky/` directory
- Agent code is version controlled

## Success Metrics

✅ Lint errors prevented before commit  
✅ Type errors caught before push  
✅ Deployment failures prevented  
✅ Zero manual intervention required  
✅ Automatic fixes applied successfully  
✅ CI/CD pipeline failures reduced  

## Future Enhancements

- [ ] Add test failure auto-fix agent
- [ ] Implement performance monitoring agent
- [ ] Add security vulnerability scanner agent
- [ ] Create automatic dependency update agent
- [ ] Add database migration validator agent

## Support

For issues or questions:
1. Check agent logs: `npm run agents list`
2. Run manual trigger: `npm run agents trigger <event>`
3. Review documentation in `/docs`
4. Check git hook files in `.husky/`

---

**Last Updated**: November 3, 2025  
**Version**: 1.0.0  
**Status**: ✅ Fully Operational
