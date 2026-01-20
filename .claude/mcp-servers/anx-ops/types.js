/**
 * ANX Agent Architecture Types
 * Standard schemas for agent orchestration across MCP, CLI, REST
 * @see docs/AGENT_ARCHITECTURE.md
 */

/**
 * @typedef {'DC' | 'SN' | 'DSLV'} EntityCode
 */

/**
 * @typedef {'queued' | 'ocs_intake' | 'pm_scoping' | 'eng_execution' | 'db_migration' | 'release_prep' | 'qag_validation' | 'completed' | 'failed' | 'blocked'} AgentStage
 */

/**
 * @typedef {'success' | 'partial' | 'fail' | 'pending' | 'blocked'} AgentStatus
 */

/**
 * @typedef {'critical' | 'high' | 'normal' | 'low'} TaskPriority
 */

/**
 * @typedef {Object} AgentError
 * @property {string} code - Error code (ERR_GATE_FAILED, ERR_AGENT_TIMEOUT, etc.)
 * @property {string} message - Human-readable error message
 * @property {string|null} agent - Which agent failed
 * @property {boolean} recoverable - Can be retried
 * @property {Object} context - Additional debug info
 */

/**
 * @typedef {Object} AgentResultEnvelope
 * @property {string|null} ticket_id - Ticket ID (OCS-DC-0001)
 * @property {string} request_id - UUID for tracing
 * @property {AgentStage} stage - Current pipeline stage
 * @property {AgentStatus} status - Overall execution status
 * @property {string} summary - Human-readable summary
 * @property {string|null} proof_pack_url - Path to proof pack
 * @property {string|null} decision_brief_url - Path to decision brief
 * @property {string|null} logs_ref - Log file reference
 * @property {EntityCode} entity - Target project
 * @property {string[]} agents_invoked - Agents that ran
 * @property {string[]} gates_passed - Gates that passed
 * @property {string[]} gates_failed - Gates that failed
 * @property {number} duration_ms - Execution time
 * @property {string} timestamp - ISO 8601 timestamp
 * @property {AgentError|null} error - Structured error if failed
 */

/**
 * @typedef {Object} TaskContext
 * @property {string[]} [related_tickets] - Related ticket IDs
 * @property {string} [user_story] - User story reference
 * @property {string[]} [acceptance_criteria] - Acceptance criteria
 * @property {string[]} [constraints] - Technical/business constraints
 * @property {string[]} [files_hint] - Files likely to be modified
 */

/**
 * @typedef {Object} AgentTaskRequest
 * @property {string} title - Task description
 * @property {EntityCode} entity - Target project
 * @property {string[]} [agents] - Specific agents to invoke
 * @property {string[]} [gates] - E2E gates to run
 * @property {string} [branch] - Git branch for changes
 * @property {string} [base_branch] - Base branch
 * @property {TaskPriority} [priority] - Execution priority
 * @property {TaskContext} [context] - Additional context
 */

import { randomUUID } from 'crypto';

/**
 * Create a new result envelope with defaults
 * @param {Partial<AgentResultEnvelope>} overrides
 * @returns {AgentResultEnvelope}
 */
export function createResultEnvelope(overrides = {}) {
  return {
    ticket_id: null,
    request_id: randomUUID(),
    stage: 'queued',
    status: 'pending',
    summary: '',
    proof_pack_url: null,
    decision_brief_url: null,
    logs_ref: null,
    entity: 'DC',
    agents_invoked: [],
    gates_passed: [],
    gates_failed: [],
    duration_ms: 0,
    timestamp: new Date().toISOString(),
    error: null,
    ...overrides
  };
}

/**
 * Create an error envelope
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Partial<AgentResultEnvelope>} overrides
 * @returns {AgentResultEnvelope}
 */
export function createErrorEnvelope(code, message, overrides = {}) {
  return createResultEnvelope({
    stage: 'failed',
    status: 'fail',
    summary: message,
    error: {
      code,
      message,
      agent: null,
      recoverable: false,
      context: {}
    },
    ...overrides
  });
}

/**
 * Available agents
 */
export const AGENTS = [
  'backend-dev-ops',
  'frontend-dev-ops',
  'api-admin-ops',
  'project-orchestrator-ops',
  'support-ticket-ops',
  'supabase-ops',
  'github-ops',
  'qag',
  'pm',
  'release'
];

/**
 * Available gates
 */
export const GATES = [
  'guest-booking',
  'subscription-gating',
  'rewards-merge',
  'webhook-replay',
  'otp-rate-limit'
];

/**
 * Entity codes
 */
export const ENTITIES = ['DC', 'SN', 'DSLV'];

/**
 * Validate entity code
 * @param {string} entity
 * @returns {boolean}
 */
export function isValidEntity(entity) {
  return ENTITIES.includes(entity);
}

/**
 * Validate agent IDs
 * @param {string[]} agents
 * @returns {{ valid: boolean, invalid: string[] }}
 */
export function validateAgents(agents) {
  const invalid = agents.filter(a => !AGENTS.includes(a));
  return { valid: invalid.length === 0, invalid };
}

/**
 * Validate gate IDs
 * @param {string[]} gates
 * @returns {{ valid: boolean, invalid: string[] }}
 */
export function validateGates(gates) {
  const invalid = gates.filter(g => !GATES.includes(g));
  return { valid: invalid.length === 0, invalid };
}
