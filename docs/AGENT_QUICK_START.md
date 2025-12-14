# Autonomous Agent System - Quick Start Guide

## What Are Autonomous Agents?

Autonomous agents are automated scripts that run automatically when certain events occur (like git commits, pushes, or deployments) to catch and fix issues before they reach production.

## 🚀 Quick Setup (3 Steps)

### Step 1: Dependencies Already Installed ✅
The following packages are already installed:
- `husky` - Git hooks management
- `node-cron` - Scheduled task execution
- `tsx` - TypeScript execution

### Step 2: Git Hooks Already Configured ✅
The following hooks are active:
- `.husky/pre-commit` - Runs before every commit
- `.husky/pre-push` - Runs before every push

### Step 3: You're Ready! 🎉

## 📋 Available Commands

```bash
# List all registered agents
npm run agents list

# Manually trigger an agent event
npm run agents trigger pre-commit
npm run agents trigger pre-push
npm run agents trigger pre-deploy

# Fix current lint errors
npm run fix-lint

# Start the scheduler (for production monitoring)
npm run agents:schedule
```

## 🤖 What Happens Automatically

### When You Commit (git commit)
1. ✅ **Auto-Fix Lint Agent** runs
   - Fixes ESLint errors automatically
   - Converts `let` to `const`
   - Escapes React quotes
   - Comments out console statements

2. ✅ **Type Check Agent** runs
   - Generates Prisma types
   - Ensures TypeScript compiles

### When You Push (git push)
1. ✅ **Pre-Push Validator** runs
   - Comprehensive lint check
   - TypeScript validation
   - Blocks push if errors exist

### When You Deploy
1. ✅ **Pre-Deploy Validator** runs
   - Environment validation
   - Full test suite
   - Build verification

## 💡 Tips

### The system is working when you see:
```
🔍 Running pre-commit checks...
🤖 Triggering 2 agent(s) for event: pre-commit
▶️  Executing: Auto-Fix Lint
✅ Completed: Auto-Fix Lint
```

### If you need to skip hooks (emergency only):
```bash
git commit --no-verify -m "emergency fix"
git push --no-verify
```

### To see what agents are registered:
```bash
npm run agents list
```

Output:
```
📋 Registered Agents:

🤖 Auto-Fix Lint
   Automatically fixes ESLint errors before commits
   Priority: 10
   Triggers: pre-commit, lint-error

🤖 Auto-Fix Types
   Automatically fixes TypeScript type errors
   Priority: 9
   Triggers: pre-commit, type-error

🤖 Pre-Deploy Validator
   Validates environment and builds before deployment
   Priority: 10
   Triggers: pre-deploy

🤖 Pre-Push Validator
   Runs comprehensive validation before pushing code
   Priority: 10
   Triggers: pre-push
```

## 🔧 Troubleshooting

### Hooks not running?
```bash
# Re-initialize git hooks
npx husky install
```

### Want to test without committing?
```bash
# Test pre-commit checks
npm run agents trigger pre-commit

# Test pre-push validation
npm run agents trigger pre-push
```

### Need to fix lint errors manually?
```bash
# Run the lint fixer
npm run fix-lint

# Or fix in website directory
cd apps/website
npm run lint:fix
```

## 📊 Success Metrics

✅ Lint errors caught before commit  
✅ Type errors prevented before push  
✅ Zero broken builds in production  
✅ Automatic fixes applied  
✅ No more "Oops, forgot to lint"  

## 🎯 Next Steps

1. Make a test commit to see agents in action
2. Review the [Full Documentation](./AUTONOMOUS_AGENT_SYSTEM.md)
3. Create custom agents for your needs

---

**The system is active and protecting your codebase!** 🛡️
