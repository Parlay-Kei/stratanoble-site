# Quick Start Guide - Gemini Multi-Agent System

## 🚀 3-Minute Setup

### 1. Install Dependencies

```bash
cd agents/orchestrator
npm install
```

### 2. Get Gemini API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in and create API key
3. Copy the key

### 3. Create .env File

```bash
echo "GEMINI_API_KEY=your_key_here" > .env
```

Replace `your_key_here` with your actual API key.

### 4. Start the System

```bash
npm start
```

## 📝 Your First Task

In a new terminal:

```bash
cd agents/orchestrator
node src/cli.js task --type "create-component" --description "Create a React button component" --priority 8
```

## ✅ Verify It's Working

```bash
node src/cli.js status
```

You should see:

- Orchestrator: Running ✅
- Agents: All initialized
- Queue: Your task processing

## 🎯 Next Steps

- Read `MULTI-AGENT-SYSTEM-SETUP.md` for full documentation
- Try different task types
- Monitor agent performance
- Submit complex multi-agent tasks

That's it! Your multi-agent system is ready! 🎉
