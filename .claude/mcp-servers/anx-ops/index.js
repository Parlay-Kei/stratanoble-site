#!/usr/bin/env node
/**
 * anx-ops MCP Server
 * Exposes the ANX Ops Dispatcher via MCP protocol
 * Uses standard AgentResultEnvelope for all responses
 * @see docs/AGENT_ARCHITECTURE.md
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";
import {
  createResultEnvelope,
  createErrorEnvelope,
  isValidEntity,
  validateAgents,
  validateGates,
  AGENTS,
  GATES,
  ENTITIES
} from "./types.js";

const OC_SCRIPT = "C:\\Dev\\.claude-anx\\tools\\ops-dispatcher\\oc.ps1";

/**
 * Execute oc.ps1 and return AgentResultEnvelope
 * @param {string} title
 * @param {string} entity
 * @param {string[]} agents
 * @param {string[]} gates
 * @param {string} branch
 * @param {string} priority
 * @returns {Promise<import('./types.js').AgentResultEnvelope>}
 */
async function executeOc(title, entity = "DC", agents = [], gates = [], branch = null, priority = "normal") {
  const startTime = Date.now();
  const envelope = createResultEnvelope({
    entity,
    stage: 'ocs_intake',
    status: 'pending',
    summary: `Starting pipeline: ${title}`
  });

  return new Promise((resolve) => {
    const args = [
      "-NoProfile",
      "-ExecutionPolicy", "Bypass",
      "-File", OC_SCRIPT,
      title,
      "-Entity", entity
    ];

    // Add optional parameters if provided
    if (agents.length > 0) {
      args.push("-Agents", agents.join(","));
    }
    if (gates.length > 0) {
      args.push("-Gates", gates.join(","));
    }
    if (branch) {
      args.push("-Branch", branch);
    }
    if (priority !== "normal") {
      args.push("-Priority", priority);
    }

    const proc = spawn("powershell", args, {
      shell: false,
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      const lines = stdout.split("\n");
      const duration_ms = Date.now() - startTime;

      // Parse output for structured data
      let ticketId = null;
      let decisionBriefPath = null;
      let proofPackPath = null;
      let agentsInvoked = [];
      let gatesPassed = [];
      let gatesFailed = [];
      let stage = 'completed';
      let summary = '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("TicketId:")) {
          ticketId = trimmed.replace("TicketId:", "").trim();
        } else if (trimmed.startsWith("Decision Brief:")) {
          decisionBriefPath = trimmed.replace("Decision Brief:", "").trim();
        } else if (trimmed.startsWith("Proof Pack:")) {
          proofPackPath = trimmed.replace("Proof Pack:", "").trim();
        } else if (trimmed.startsWith("Agents:")) {
          agentsInvoked = trimmed.replace("Agents:", "").trim().split(",").map(a => a.trim()).filter(Boolean);
        } else if (trimmed.startsWith("Gates Passed:")) {
          gatesPassed = trimmed.replace("Gates Passed:", "").trim().split(",").map(g => g.trim()).filter(Boolean);
        } else if (trimmed.startsWith("Gates Failed:")) {
          gatesFailed = trimmed.replace("Gates Failed:", "").trim().split(",").map(g => g.trim()).filter(Boolean);
        } else if (trimmed.startsWith("Stage:")) {
          stage = trimmed.replace("Stage:", "").trim();
        } else if (trimmed.startsWith("Summary:")) {
          summary = trimmed.replace("Summary:", "").trim();
        }
      }

      // Determine final status
      let status = 'success';
      if (code !== 0) {
        status = 'fail';
        stage = 'failed';
      } else if (gatesFailed.length > 0) {
        status = 'partial';
      }

      // Build summary if not provided
      if (!summary) {
        if (status === 'success') {
          summary = `Pipeline completed successfully. ${agentsInvoked.length} agents invoked, ${gatesPassed.length} gates passed.`;
        } else if (status === 'partial') {
          summary = `Pipeline completed with issues. ${gatesFailed.length} gates failed.`;
        } else {
          summary = `Pipeline failed. Check logs for details.`;
        }
      }

      resolve({
        ...envelope,
        ticket_id: ticketId,
        stage,
        status,
        summary,
        proof_pack_url: proofPackPath,
        decision_brief_url: decisionBriefPath,
        logs_ref: ticketId ? `logs/${new Date().toISOString().split('T')[0]}/${ticketId}.log` : null,
        agents_invoked: agentsInvoked.length > 0 ? agentsInvoked : (agents.length > 0 ? agents : ['pm', 'eng', 'db', 'release', 'qag']),
        gates_passed: gatesPassed,
        gates_failed: gatesFailed,
        duration_ms,
        timestamp: new Date().toISOString(),
        error: code !== 0 ? {
          code: 'ERR_PIPELINE_FAILED',
          message: stderr || 'Pipeline execution failed',
          agent: null,
          recoverable: true,
          context: { exit_code: code, stderr: stderr || null }
        } : null
      });
    });

    proc.on("error", (err) => {
      resolve(createErrorEnvelope(
        'ERR_SPAWN_FAILED',
        `Failed to start pipeline: ${err.message}`,
        {
          entity,
          duration_ms: Date.now() - startTime,
          error: {
            code: 'ERR_SPAWN_FAILED',
            message: err.message,
            agent: null,
            recoverable: false,
            context: { error: err.toString() }
          }
        }
      ));
    });
  });
}

// Create server
const server = new Server(
  {
    name: "anx-ops",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools - expanded schema per AGENT_ARCHITECTURE.md
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "oc_do",
        description: "Execute ANX Ops pipeline. Creates a ticket, runs full agent pipeline (OCS, PM, Eng, DB, Release, QAG), and returns results.",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The task description for the ANX org to execute"
            },
            entity: {
              type: "string",
              description: "Entity code: DC (Direct Cuts), SN (Snippets), or DSLV",
              default: "DC",
              enum: ENTITIES
            },
            agents: {
              type: "array",
              items: { type: "string", enum: AGENTS },
              description: `Specific agents to invoke. Options: ${AGENTS.join(', ')}`
            },
            gates: {
              type: "array",
              items: { type: "string", enum: GATES },
              description: `E2E gates to run after completion. Options: ${GATES.join(', ')}`
            },
            branch: {
              type: "string",
              description: "Git branch for changes (auto-created if not exists)"
            },
            priority: {
              type: "string",
              enum: ["critical", "high", "normal", "low"],
              default: "normal",
              description: "Execution priority"
            }
          },
          required: ["title"]
        }
      }
    ]
  };
});

// Handle tool calls - return AgentResultEnvelope
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "oc_do") {
    const {
      title,
      entity = "DC",
      agents = [],
      gates = [],
      branch = null,
      priority = "normal"
    } = request.params.arguments;

    // Validate title
    if (!title || typeof title !== "string" || title.trim() === "") {
      const errorEnvelope = createErrorEnvelope(
        'ERR_INVALID_REQUEST',
        'title is required and must be a non-empty string',
        { entity }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(errorEnvelope, null, 2) }]
      };
    }

    // Validate entity
    if (!isValidEntity(entity)) {
      const errorEnvelope = createErrorEnvelope(
        'ERR_INVALID_ENTITY',
        `Invalid entity: ${entity}. Must be one of: ${ENTITIES.join(', ')}`,
        { entity }
      );
      return {
        content: [{ type: "text", text: JSON.stringify(errorEnvelope, null, 2) }]
      };
    }

    // Validate agents if provided
    if (agents.length > 0) {
      const agentValidation = validateAgents(agents);
      if (!agentValidation.valid) {
        const errorEnvelope = createErrorEnvelope(
          'ERR_INVALID_AGENTS',
          `Invalid agents: ${agentValidation.invalid.join(', ')}. Valid options: ${AGENTS.join(', ')}`,
          { entity }
        );
        return {
          content: [{ type: "text", text: JSON.stringify(errorEnvelope, null, 2) }]
        };
      }
    }

    // Validate gates if provided
    if (gates.length > 0) {
      const gateValidation = validateGates(gates);
      if (!gateValidation.valid) {
        const errorEnvelope = createErrorEnvelope(
          'ERR_INVALID_GATES',
          `Invalid gates: ${gateValidation.invalid.join(', ')}. Valid options: ${GATES.join(', ')}`,
          { entity }
        );
        return {
          content: [{ type: "text", text: JSON.stringify(errorEnvelope, null, 2) }]
        };
      }
    }

    // Execute pipeline
    const result = await executeOc(title, entity, agents, gates, branch, priority);

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }

  // Unknown tool
  const errorEnvelope = createErrorEnvelope(
    'ERR_UNKNOWN_TOOL',
    `Unknown tool: ${request.params.name}`
  );
  return {
    content: [{ type: "text", text: JSON.stringify(errorEnvelope, null, 2) }]
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("anx-ops MCP server v2.0.0 running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
