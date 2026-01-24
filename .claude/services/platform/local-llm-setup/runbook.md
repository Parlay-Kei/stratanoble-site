# Local LLM Setup Service

**Type**: Service (V15)
**Operator**: Platform Ops Lead (A7)
**Version**: 1.0.0

---

## Purpose

Install, configure, and manage local LLM infrastructure including Ollama and model deployment. Enables on-device inference for Claude Code routing and specialized model access.

## Supported Components

| Component | Purpose | Status |
|-----------|---------|--------|
| Ollama | Local LLM runtime | Required |
| GLM-4 | General language model | Required |
| Claude Code Router | Multi-model routing | Required |

## Prerequisites

- Windows 10/11 or compatible OS
- 16GB+ RAM recommended
- 20GB+ free disk space for models
- Admin privileges for installation

---

## Installation Commands

### 1. Install Ollama

```bash
# Windows (via winget)
winget install Ollama.Ollama

# Verify installation
ollama --version
```

### 2. Start Ollama Service

```bash
# Start Ollama (runs as background service)
ollama serve

# Verify service is running
curl http://localhost:11434/api/tags
```

### 3. Pull GLM-4 Model

```bash
# Pull GLM-4 (7B parameter version)
ollama pull glm4

# Verify model is available
ollama list
```

### 4. Test Model

```bash
# Quick test
ollama run glm4 "Hello, respond with 'GLM-4 operational'"
```

---

## Claude Code Router Setup

### Router Architecture

```
┌─────────────────┐
│  Claude Code    │
│     CLI         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Claude Code    │
│    Router       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│Claude │ │ GLM-4 │
│ API   │ │(Local)│
└───────┘ └───────┘
```

### Router Configuration

File: `C:\Dev\.claude-anx\tools\claude-code-router\config.json`

```json
{
  "version": "1.0.0",
  "defaultModel": "claude",
  "models": {
    "claude": {
      "type": "api",
      "endpoint": "https://api.anthropic.com",
      "priority": 1
    },
    "glm4": {
      "type": "ollama",
      "endpoint": "http://localhost:11434",
      "model": "glm4",
      "priority": 2,
      "useCases": ["offline", "local-inference", "cost-sensitive"]
    }
  },
  "routing": {
    "fallbackToLocal": true,
    "localThreshold": "simple-tasks",
    "costOptimization": false
  }
}
```

---

## Verification Checklist

- [ ] Ollama installed and accessible via CLI
- [ ] Ollama service running on port 11434
- [ ] GLM-4 model pulled and listed
- [ ] GLM-4 responds to test prompt
- [ ] Claude Code Router configured
- [ ] Router can reach both Claude API and local Ollama

---

## Health Checks

```bash
# Check Ollama service
curl -s http://localhost:11434/api/tags | jq .

# Check available models
ollama list

# Check model response time
time ollama run glm4 "ping" --verbose
```

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Ollama not found | Restart terminal, check PATH |
| Port 11434 in use | Kill existing process: `netstat -ano | findstr 11434` |
| Model pull fails | Check disk space, retry with `ollama pull glm4` |
| Slow inference | Reduce context, check RAM usage |
| Service won't start | Run `ollama serve` manually to see errors |

---

## Rollback

```bash
# Remove model
ollama rm glm4

# Uninstall Ollama (Windows)
winget uninstall Ollama.Ollama

# Clean up data directory
rm -rf %USERPROFILE%\.ollama
```

---

## Post-Install Validation

Run the following to generate proof receipt:

```bash
# Generate installation proof
node C:\Dev\.claude-anx\tools\proof-validator.js \
  --service "local-llm-setup" \
  --checks "ollama-installed,glm4-available,router-configured"
```

---

## Integration with ANX

Once installed, the local LLM can be used via:

1. **Direct Ollama API**: `http://localhost:11434/api/generate`
2. **Claude Code Router**: Routes based on task complexity
3. **Agent Framework**: A7 can delegate local inference tasks

---

## Monitoring

| Metric | Check Command | Alert Threshold |
|--------|---------------|-----------------|
| Ollama uptime | `curl localhost:11434` | Fails 3x |
| Model load time | `ollama run glm4 --verbose` | >30s |
| Memory usage | `ollama ps` | >80% RAM |

---

## Related Services

- V2: Infra Deployment
- V5: Ops Monitoring
- V8: Prompt Loader (for router prompts)
