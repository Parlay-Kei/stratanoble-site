# Local LLM Operations Skill

**Skill ID**: local-llm-ops
**Owner**: A7 (Platform Ops Lead)
**Version**: 1.0.0

---

## Purpose

Autonomous installation, configuration, and management of local LLM infrastructure. Enables on-device inference for cost optimization, offline operation, and Claude Code routing.

## Capabilities

| Capability | Description |
|------------|-------------|
| `ollama-install` | Install Ollama runtime on Windows/Linux/macOS |
| `model-management` | Pull, list, remove local models |
| `local-inference` | Execute inference on local models |
| `claude-code-router` | Configure multi-model routing |

## Triggers

- "install ollama"
- "local llm"
- "glm model"
- "local model"
- "claude code router"
- "pull model"

---

## Playbook

### 1. Install Ollama

**Preconditions**: Admin privileges, internet access

```bash
# Windows
winget install Ollama.Ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# macOS
brew install ollama
```

**Proof Required**: `ollama --version` returns version string

### 2. Pull Model

**Preconditions**: Ollama installed, sufficient disk space

```bash
# Pull GLM-4 (recommended for general tasks)
ollama pull glm4

# Alternative models
ollama pull llama3.2
ollama pull codellama
ollama pull mistral
```

**Proof Required**: `ollama list` shows model

### 3. Configure Router

**Preconditions**: Ollama running, models available

Creates configuration at `C:\Dev\.claude-anx\tools\claude-code-router\config.json`

**Proof Required**: Router config file exists and validates

### 4. Verify Installation

**Preconditions**: All components installed

```bash
# Run verification suite
ollama run glm4 "Respond with: VERIFICATION_COMPLETE"
```

**Proof Required**: Model responds correctly

---

## Decision Tree

```
Start
  │
  ├─ Is Ollama installed?
  │   ├─ NO → Install Ollama
  │   └─ YES ↓
  │
  ├─ Is Ollama service running?
  │   ├─ NO → Start service
  │   └─ YES ↓
  │
  ├─ Is required model available?
  │   ├─ NO → Pull model
  │   └─ YES ↓
  │
  ├─ Is router configured?
  │   ├─ NO → Create router config
  │   └─ YES ↓
  │
  └─ Emit success proof
```

---

## Escalation Rules

| Condition | Action |
|-----------|--------|
| Installation fails 3x | Escalate to Steve |
| Model pull fails (disk) | Alert, suggest cleanup |
| Port conflict | Kill conflicting process |
| Memory insufficient | Recommend smaller model |

---

## Related Services

- **V15**: Local LLM Setup (runbook)
- **V2**: Infra Deployment
- **V5**: Ops Monitoring

---

## Proof Template

```json
{
  "skill": "local-llm-ops",
  "timestamp": "ISO-8601",
  "checks": {
    "ollama_installed": true,
    "ollama_version": "x.x.x",
    "service_running": true,
    "models_available": ["glm4"],
    "router_configured": true,
    "inference_test": "PASS"
  },
  "status": "COMPLETE"
}
```
