/**
 * Claude Code Router v1.1.0
 *
 * Multi-model routing for Claude Code CLI
 * Routes requests to Claude API or local Ollama based on task characteristics
 * Supports explicit model selection via CLI flags
 *
 * Owner: A7 (Platform Ops Lead)
 * Service: V15 (Local LLM Setup)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Configuration
const CONFIG_PATH = path.join(__dirname, 'config.json');
const ANX_ROOT = process.env.ANX_ROOT || 'C:/Dev/.claude-anx';

class ClaudeCodeRouter {
  constructor() {
    this.config = this.loadConfig();
    this.modelStatus = {};
    this.selectedModel = null;
    this.initialized = false;
  }

  loadConfig() {
    try {
      const configData = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('[Router] Failed to load config:', error.message);
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      defaultModel: 'claude',
      models: {
        claude: { type: 'api', priority: 1, selectable: true },
        glm4: { type: 'ollama', endpoint: 'http://localhost:11434', priority: 2, selectable: true }
      },
      modelSelection: { enabled: true, allowUserOverride: true },
      routing: { fallbackToLocal: true }
    };
  }

  async initialize() {
    console.log('[Router] Initializing Claude Code Router v1.1.0...');

    // Check model availability
    await this.checkModelHealth();

    this.initialized = true;
    console.log('[Router] Initialization complete');
    return this.modelStatus;
  }

  async checkModelHealth() {
    const checks = [];

    // Check Ollama
    if (this.config.models.glm4) {
      checks.push(this.checkOllama());
    }

    // Check Claude API (just verify config exists, don't make API call)
    if (this.config.models.claude) {
      this.modelStatus.claude = {
        available: !!process.env.ANTHROPIC_API_KEY,
        type: 'api',
        displayName: this.config.models.claude.displayName || 'Claude',
        selectable: this.config.models.claude.selectable !== false,
        reason: process.env.ANTHROPIC_API_KEY ? 'API key configured' : 'No API key'
      };
    }

    await Promise.all(checks);
    return this.modelStatus;
  }

  async checkOllama() {
    return new Promise((resolve) => {
      const endpoint = this.config.models.glm4?.endpoint || 'http://localhost:11434';
      const url = new URL('/api/tags', endpoint);
      const timeoutMs = this.config.healthCheck?.timeoutMs || 5000;

      const req = http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const hasGlm4 = parsed.models?.some(m => m.name.includes('glm4'));
            this.modelStatus.glm4 = {
              available: hasGlm4,
              type: 'ollama',
              displayName: this.config.models.glm4.displayName || 'GLM-4',
              selectable: this.config.models.glm4.selectable !== false,
              models: parsed.models?.map(m => m.name) || [],
              reason: hasGlm4 ? 'Model available' : 'Model not pulled - run: ollama pull glm4'
            };
          } catch (e) {
            this.modelStatus.glm4 = {
              available: false,
              type: 'ollama',
              displayName: 'GLM-4',
              selectable: true,
              reason: 'Parse error'
            };
          }
          resolve();
        });
      });

      req.on('error', (e) => {
        this.modelStatus.glm4 = {
          available: false,
          type: 'ollama',
          displayName: 'GLM-4',
          selectable: true,
          reason: `Ollama not running: ${e.message}`
        };
        resolve();
      });

      req.setTimeout(timeoutMs, () => {
        req.destroy();
        this.modelStatus.glm4 = {
          available: false,
          type: 'ollama',
          displayName: 'GLM-4',
          selectable: true,
          reason: 'Timeout - Ollama may not be running'
        };
        resolve();
      });
    });
  }

  /**
   * Get list of available and selectable models
   */
  getSelectableModels() {
    const models = [];
    for (const [id, status] of Object.entries(this.modelStatus)) {
      if (status.selectable) {
        models.push({
          id,
          displayName: status.displayName || id,
          available: status.available,
          type: status.type,
          reason: status.reason
        });
      }
    }
    return models;
  }

  /**
   * Select a specific model for routing
   * @param {string} modelId - Model identifier (glm4, claude) or shortcut (local, cloud, fast, smart)
   * @returns {boolean} Success
   */
  selectModel(modelId) {
    if (!this.config.modelSelection?.enabled) {
      console.error('[Router] Model selection is disabled');
      return false;
    }

    // Check if it's a shortcut
    const shortcuts = this.config.modelSelection?.shortcuts || {};
    const resolvedModel = shortcuts[modelId] || modelId;

    // Validate model exists
    if (!this.config.models[resolvedModel]) {
      console.error(`[Router] Unknown model: ${modelId}`);
      return false;
    }

    // Check if model is available
    if (!this.modelStatus[resolvedModel]?.available) {
      console.warn(`[Router] Model ${resolvedModel} selected but not currently available`);
    }

    this.selectedModel = resolvedModel;
    console.log(`[Router] Model selected: ${resolvedModel} (${this.config.models[resolvedModel].displayName})`);
    return true;
  }

  /**
   * Clear model selection (return to automatic routing)
   */
  clearSelection() {
    this.selectedModel = null;
    console.log('[Router] Model selection cleared - returning to automatic routing');
  }

  /**
   * Route a request to the appropriate model
   * @param {Object} request - The request object
   * @param {string} request.prompt - The prompt/message
   * @param {string} request.taskType - Type of task (code, chat, analysis)
   * @param {number} request.estimatedTokens - Estimated token count
   * @param {boolean} request.forceLocal - Force local model
   * @param {string} request.forceModel - Force specific model
   * @returns {Object} Routing decision
   */
  route(request) {
    const { prompt, taskType, estimatedTokens, forceLocal, forceModel } = request;

    // Explicit model override in request
    if (forceModel && this.modelStatus[forceModel]?.available) {
      return this.createRouteDecision(forceModel, `Explicit override: ${forceModel}`);
    }

    // User-selected model takes priority
    if (this.selectedModel && this.modelStatus[this.selectedModel]?.available) {
      return this.createRouteDecision(this.selectedModel, `User selected: ${this.selectedModel}`);
    }

    // Force local if requested
    if (forceLocal && this.modelStatus.glm4?.available) {
      return this.createRouteDecision('glm4', 'Forced local (--local flag)');
    }

    // Check if offline mode should kick in
    if (!this.modelStatus.claude?.available && this.config.routing.offlineMode?.enabled) {
      if (this.modelStatus.glm4?.available) {
        return this.createRouteDecision('glm4', 'Offline mode - Claude unavailable');
      }
    }

    // Task-based routing from config
    if (taskType && this.config.routing.taskRouting?.[taskType]) {
      const targetModel = this.config.routing.taskRouting[taskType];
      if (this.modelStatus[targetModel]?.available) {
        return this.createRouteDecision(targetModel, `Task routing: ${taskType} -> ${targetModel}`);
      }
    }

    // Cost optimization routing
    if (this.config.routing.costOptimization?.preferLocal) {
      const threshold = this.config.routing.localThreshold?.tokenLimit || 1000;
      if (estimatedTokens < threshold && this.modelStatus.glm4?.available) {
        return this.createRouteDecision('glm4', 'Cost optimization - simple task');
      }
    }

    // Task complexity routing (legacy)
    const complexTasks = ['architecture', 'complex-reasoning', 'code-generation', 'debugging', 'refactoring'];
    if (complexTasks.includes(taskType)) {
      if (this.modelStatus.claude?.available) {
        return this.createRouteDecision('claude', 'Complex task requires Claude');
      }
    }

    // Default to Claude
    if (this.modelStatus.claude?.available) {
      return this.createRouteDecision('claude', 'Default routing');
    }

    // Fallback to local
    if (this.config.routing.fallbackToLocal && this.modelStatus.glm4?.available) {
      return this.createRouteDecision('glm4', 'Fallback - Claude unavailable');
    }

    return this.createRouteDecision(null, 'No models available');
  }

  createRouteDecision(model, reason) {
    const modelConfig = model ? this.config.models[model] : null;
    const decision = {
      model,
      displayName: modelConfig?.displayName || model,
      reason,
      endpoint: modelConfig?.endpoint || null,
      type: modelConfig?.type || null,
      timestamp: new Date().toISOString()
    };

    // Log decision if enabled
    if (this.config.logging?.logRouteDecisions) {
      this.logDecision(decision);
    }

    return decision;
  }

  logDecision(decision) {
    const logPath = this.config.logging?.path;
    if (!logPath) return;

    try {
      const logDir = path.dirname(logPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logEntry = `${decision.timestamp} | ${decision.model || 'none'} | ${decision.reason}\n`;
      fs.appendFileSync(logPath, logEntry);
    } catch (e) {
      // Silently fail logging
    }
  }

  /**
   * Execute inference on the selected model
   */
  async inference(model, prompt, options = {}) {
    if (model === 'glm4') {
      return this.ollamaInference(prompt, options);
    }
    // Claude inference would go through normal Claude Code CLI
    throw new Error('Claude inference should use standard Claude Code CLI');
  }

  async ollamaInference(prompt, options = {}) {
    return new Promise((resolve, reject) => {
      const modelConfig = this.config.models.glm4;
      const endpoint = modelConfig?.endpoint || 'http://localhost:11434';
      const url = new URL('/api/generate', endpoint);

      const payload = JSON.stringify({
        model: modelConfig?.model || 'glm4',
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || modelConfig?.parameters?.temperature || 0.7,
          top_p: options.top_p || modelConfig?.parameters?.top_p || 0.9,
          num_ctx: options.num_ctx || modelConfig?.parameters?.num_ctx || 8192
        }
      });

      const req = http.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({
              response: parsed.response,
              model: 'glm4',
              displayName: modelConfig?.displayName || 'GLM-4',
              totalDuration: parsed.total_duration,
              evalCount: parsed.eval_count
            });
          } catch (e) {
            reject(new Error('Failed to parse Ollama response'));
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  getStatus() {
    return {
      version: '1.1.0',
      initialized: this.initialized,
      selectedModel: this.selectedModel,
      models: this.modelStatus,
      selectableModels: this.getSelectableModels(),
      config: {
        defaultModel: this.config.defaultModel,
        modelSelection: this.config.modelSelection,
        routing: this.config.routing
      }
    };
  }
}

// Export for use as module
module.exports = { ClaudeCodeRouter };

// CLI interface
if (require.main === module) {
  const router = new ClaudeCodeRouter();
  const args = process.argv.slice(2);

  const command = args[0];

  switch (command) {
    case 'status':
      router.initialize().then(() => {
        console.log(JSON.stringify(router.getStatus(), null, 2));
      });
      break;

    case 'health':
      router.checkModelHealth().then(() => {
        console.log(JSON.stringify(router.modelStatus, null, 2));
      });
      break;

    case 'models':
      router.initialize().then(() => {
        console.log('\nAvailable Models:');
        console.log('─'.repeat(50));
        for (const model of router.getSelectableModels()) {
          const status = model.available ? '✓' : '✗';
          console.log(`  ${status} ${model.id.padEnd(10)} ${model.displayName.padEnd(20)} [${model.type}]`);
          if (!model.available) {
            console.log(`    └─ ${model.reason}`);
          }
        }
        console.log('');
      });
      break;

    case 'select':
      const modelId = args[1];
      if (!modelId) {
        console.error('Usage: node router.js select <model>');
        console.log('Models: glm4, claude (or shortcuts: local, cloud, fast, smart)');
        process.exit(1);
      }
      router.initialize().then(() => {
        if (router.selectModel(modelId)) {
          console.log(`Model ${modelId} selected successfully`);
        } else {
          process.exit(1);
        }
      });
      break;

    case 'route':
      router.initialize().then(() => {
        const taskType = args[1] || 'chat';
        const forceModel = args.includes('--local') ? null :
                          args.includes('--cloud') ? 'claude' :
                          args.find(a => a.startsWith('--model='))?.split('=')[1];
        const forceLocal = args.includes('--local');

        const decision = router.route({
          taskType,
          estimatedTokens: parseInt(args[2]) || 500,
          forceLocal,
          forceModel
        });
        console.log(JSON.stringify(decision, null, 2));
      });
      break;

    case 'test':
      router.initialize().then(async () => {
        if (router.modelStatus.glm4?.available) {
          console.log('Testing GLM-4 inference...');
          const result = await router.inference('glm4', 'Say "Router test successful"');
          console.log('Result:', result.response);
        } else {
          console.log('GLM-4 not available for testing');
          console.log('Reason:', router.modelStatus.glm4?.reason);
        }
      });
      break;

    default:
      console.log(`
Claude Code Router v1.1.0

Usage:
  node router.js status           Show router status and model availability
  node router.js health           Check model health
  node router.js models           List all selectable models
  node router.js select <model>   Select a model (glm4, claude, local, cloud)
  node router.js route [task]     Test routing decision for a task type
  node router.js test             Test local GLM-4 inference

Routing flags:
  --local                         Force local model (GLM-4)
  --cloud                         Force cloud model (Claude)
  --model=<id>                    Force specific model

Shortcuts:
  local, fast   -> glm4
  cloud, smart  -> claude

Configuration: ${CONFIG_PATH}
      `);
  }
}
