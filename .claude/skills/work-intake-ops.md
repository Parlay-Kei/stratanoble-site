---
name: work-intake-ops
description: Work intake and triage operations - single front door for all requests, routing, SLA tracking
version: 1.0.0
level: 3
owner: A1
skillId: S1
triggers:
  - intake
  - triage
  - new ticket
  - work request
  - route task
  - sla check
---

# work-intake-ops Skill

Single front door for all work requests. Routes to appropriate agents, tracks SLAs, ensures nothing falls through cracks.

## Quick Commands

| Command | Action |
|---------|--------|
| `intake` | Process new work request |
| `triage` | Classify and prioritize |
| `route` | Route to appropriate agent |
| `sla` | Check SLA status |
| `queue` | Show current queue |
| `escalate` | Escalate overdue items |

---

## Level 1: Request Classification

### classifyRequest()
```javascript
/**
 * Classify incoming work request
 */
function classifyRequest(request) {
  const categories = {
    bug: ['bug', 'error', 'broken', 'fix', 'crash', 'issue'],
    feature: ['feature', 'add', 'new', 'enhance', 'improvement'],
    infra: ['deploy', 'server', 'database', 'hosting', 'infrastructure'],
    finance: ['invoice', 'payment', 'budget', 'expense', 'pricing'],
    legal: ['contract', 'agreement', 'compliance', 'policy', 'terms'],
    marketing: ['campaign', 'content', 'social', 'ad', 'promotion'],
    support: ['help', 'question', 'customer', 'user', 'complaint'],
    security: ['security', 'vulnerability', 'audit', 'access', 'breach']
  };

  const text = `${request.title} ${request.description}`.toLowerCase();

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => text.includes(k))) {
      return {
        category,
        confidence: 'high',
        keywords: keywords.filter(k => text.includes(k))
      };
    }
  }

  return { category: 'general', confidence: 'low', keywords: [] };
}
```

### determinePriority()
```javascript
/**
 * Determine priority based on signals
 */
function determinePriority(request, classification) {
  // P0: Critical - production down, security breach, legal deadline
  const p0Keywords = ['production down', 'security breach', 'urgent', 'deadline today', 'blocking'];
  // P1: High - major feature, significant bug, exec request
  const p1Keywords = ['major', 'important', 'exec request', 'revenue impact'];
  // P2: Normal - standard work
  // P3: Low - nice to have, backlog

  const text = `${request.title} ${request.description}`.toLowerCase();

  if (p0Keywords.some(k => text.includes(k))) {
    return { priority: 'P0', slaHours: 4, reason: 'Critical keywords detected' };
  }
  if (p1Keywords.some(k => text.includes(k))) {
    return { priority: 'P1', slaHours: 24, reason: 'High priority keywords detected' };
  }
  if (classification.category === 'security') {
    return { priority: 'P1', slaHours: 24, reason: 'Security category auto-escalates' };
  }

  return { priority: 'P2', slaHours: 72, reason: 'Standard priority' };
}
```

---

## Level 2: Routing

### routeToAgent()
```javascript
/**
 * Route request to appropriate agent
 */
function routeToAgent(classification, priority) {
  const routingMatrix = {
    bug: 'A2',        // QA Gatekeeper
    feature: 'A5',    // Product Lead
    infra: 'A7',      // Platform Ops
    finance: 'A3',    // CFO Agent
    legal: 'A4',      // Legal Ops
    marketing: 'A6',  // Growth Lead
    support: 'A9',    // Support Triage
    security: 'A7',   // Platform Ops
    general: 'A1'     // OCS handles unknowns
  };

  const agentId = routingMatrix[classification.category] || 'A1';

  return {
    agentId,
    classification,
    priority,
    routedAt: new Date().toISOString(),
    slaDeadline: new Date(Date.now() + priority.slaHours * 60 * 60 * 1000).toISOString()
  };
}
```

### generateTicketId()
```javascript
/**
 * Generate unique ticket ID
 */
function generateTicketId(category) {
  const prefix = {
    bug: 'BUG',
    feature: 'FEAT',
    infra: 'INFRA',
    finance: 'FIN',
    legal: 'LEG',
    marketing: 'MKT',
    support: 'SUP',
    security: 'SEC',
    general: 'GEN'
  };

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.floor(Math.random() * 9999).toString().padStart(4, '0');

  return `${prefix[category] || 'GEN'}-${date}-${seq}`;
}
```

---

## Level 3: SLA Management

### checkSLAStatus()
```javascript
/**
 * Check SLA status for all active tickets
 */
async function checkSLAStatus(tickets) {
  const now = new Date();
  const results = {
    onTrack: [],
    atRisk: [],
    breached: []
  };

  for (const ticket of tickets) {
    const deadline = new Date(ticket.slaDeadline);
    const hoursRemaining = (deadline - now) / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      results.breached.push({
        ...ticket,
        hoursOverdue: Math.abs(hoursRemaining).toFixed(1)
      });
    } else if (hoursRemaining < 4) {
      results.atRisk.push({
        ...ticket,
        hoursRemaining: hoursRemaining.toFixed(1)
      });
    } else {
      results.onTrack.push({
        ...ticket,
        hoursRemaining: hoursRemaining.toFixed(1)
      });
    }
  }

  return results;
}

/**
 * Generate SLA report
 */
function generateSLAReport(status) {
  return `# SLA Status Report

**Generated**: ${new Date().toISOString()}

## Summary
- On Track: ${status.onTrack.length}
- At Risk: ${status.atRisk.length}
- Breached: ${status.breached.length}

## Breached (Requires Immediate Action)
${status.breached.map(t => `- ${t.ticketId}: ${t.title} (${t.hoursOverdue}h overdue)`).join('\n') || 'None'}

## At Risk (< 4 hours remaining)
${status.atRisk.map(t => `- ${t.ticketId}: ${t.title} (${t.hoursRemaining}h left)`).join('\n') || 'None'}
`;
}
```

---

## Level 4: Queue Management

### getQueue()
```javascript
/**
 * Get current work queue
 */
async function getQueue(filters = {}) {
  const fs = require('fs').promises;
  const path = require('path');

  const queuePath = 'C:/Dev/.claude-anx/docs/ops/02-QUEUE/active/ops_queue.json';

  try {
    const content = await fs.readFile(queuePath, 'utf-8');
    let queue = JSON.parse(content);

    // Apply filters
    if (filters.agent) {
      queue = queue.filter(t => t.assignedTo === filters.agent);
    }
    if (filters.priority) {
      queue = queue.filter(t => t.priority === filters.priority);
    }
    if (filters.status) {
      queue = queue.filter(t => t.status === filters.status);
    }

    // Sort by priority then by SLA deadline
    queue.sort((a, b) => {
      const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.slaDeadline) - new Date(b.slaDeadline);
    });

    return queue;
  } catch (err) {
    return [];
  }
}
```

---

## MCP Tool Interface

```javascript
const workIntakeTool = {
  name: 'work_intake',
  description: 'Process work requests, route to agents, track SLAs',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['intake', 'triage', 'route', 'sla', 'queue', 'escalate'],
        description: 'Intake operation to perform'
      },
      request: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          requester: { type: 'string' }
        }
      },
      filters: {
        type: 'object',
        description: 'Queue filters (agent, priority, status)'
      }
    },
    required: ['action']
  }
};
```

---

## Usage Examples

```bash
# Process new work request
work-intake intake --title "Fix login bug" --description "Users can't log in on mobile"

# Check SLA status
work-intake sla

# View queue for specific agent
work-intake queue --agent A7

# Escalate overdue items
work-intake escalate

# Route specific ticket
work-intake route --ticket BUG-20260120-0001
```

---

## Success Criteria

- All requests get a ticket ID within 1 minute
- Routing accuracy > 95%
- No SLA breaches go unnoticed
- Queue is always queryable
- Escalation triggers automatically at 4h remaining
