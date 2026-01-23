---
name: tasks-breakdown-ops
description: Task breakdown operations - decompose tickets into actionable work items with estimates and owners
version: 1.0.0
level: 3
owner: A1
skillId: S2
triggers:
  - breakdown
  - decompose
  - estimate
  - split task
  - subtasks
  - work items
---

# tasks-breakdown-ops Skill

Decompose tickets into actionable work items. Assign estimates, owners, and dependencies. Enable parallel execution where possible.

## Quick Commands

| Command | Action |
|---------|--------|
| `breakdown` | Decompose ticket into subtasks |
| `estimate` | Add effort estimates |
| `assign` | Assign owners to tasks |
| `deps` | Map dependencies |
| `parallel` | Identify parallelizable work |
| `critical` | Show critical path |

---

## Level 1: Task Decomposition

### decomposeTicket()
```javascript
/**
 * Decompose a ticket into subtasks
 */
function decomposeTicket(ticket) {
  const subtasks = [];
  const category = ticket.classification?.category || 'general';

  // Standard decomposition patterns by category
  const patterns = {
    bug: [
      { type: 'investigate', name: 'Reproduce and investigate', effort: 'S' },
      { type: 'fix', name: 'Implement fix', effort: 'M' },
      { type: 'test', name: 'Write regression test', effort: 'S' },
      { type: 'verify', name: 'Verify fix in staging', effort: 'S' },
      { type: 'deploy', name: 'Deploy to production', effort: 'S' }
    ],
    feature: [
      { type: 'spec', name: 'Write requirements spec', effort: 'M' },
      { type: 'design', name: 'Create design spec', effort: 'M' },
      { type: 'implement', name: 'Implement feature', effort: 'L' },
      { type: 'test', name: 'Write tests', effort: 'M' },
      { type: 'docs', name: 'Update documentation', effort: 'S' },
      { type: 'deploy', name: 'Deploy and verify', effort: 'S' }
    ],
    infra: [
      { type: 'plan', name: 'Create implementation plan', effort: 'M' },
      { type: 'backup', name: 'Backup current state', effort: 'S' },
      { type: 'implement', name: 'Execute changes', effort: 'L' },
      { type: 'verify', name: 'Verify changes', effort: 'M' },
      { type: 'rollback', name: 'Document rollback steps', effort: 'S' }
    ],
    general: [
      { type: 'analyze', name: 'Analyze requirements', effort: 'S' },
      { type: 'execute', name: 'Execute work', effort: 'M' },
      { type: 'verify', name: 'Verify completion', effort: 'S' }
    ]
  };

  const pattern = patterns[category] || patterns.general;

  for (let i = 0; i < pattern.length; i++) {
    const step = pattern[i];
    subtasks.push({
      id: `${ticket.ticketId}-${i + 1}`,
      parentId: ticket.ticketId,
      type: step.type,
      name: step.name,
      effort: step.effort,
      status: 'pending',
      owner: null,
      dependencies: i > 0 ? [`${ticket.ticketId}-${i}`] : [],
      createdAt: new Date().toISOString()
    });
  }

  return subtasks;
}
```

### effortToHours()
```javascript
/**
 * Convert T-shirt size to hours
 */
function effortToHours(effort) {
  const mapping = {
    'XS': 1,
    'S': 2,
    'M': 4,
    'L': 8,
    'XL': 16,
    'XXL': 32
  };
  return mapping[effort] || 4;
}

/**
 * Calculate total effort for ticket
 */
function calculateTotalEffort(subtasks) {
  let totalHours = 0;
  let criticalPathHours = 0;

  for (const task of subtasks) {
    totalHours += effortToHours(task.effort);
  }

  // Critical path = sequential tasks only
  const sequential = subtasks.filter(t => t.dependencies.length > 0);
  for (const task of sequential) {
    criticalPathHours += effortToHours(task.effort);
  }

  return {
    totalHours,
    criticalPathHours,
    parallelizationSavings: totalHours - criticalPathHours
  };
}
```

---

## Level 2: Dependency Mapping

### mapDependencies()
```javascript
/**
 * Map dependencies between subtasks
 */
function mapDependencies(subtasks) {
  const graph = new Map();

  for (const task of subtasks) {
    graph.set(task.id, {
      task,
      dependsOn: task.dependencies || [],
      blockedBy: [],
      blocks: []
    });
  }

  // Build reverse relationships
  for (const [id, node] of graph) {
    for (const depId of node.dependsOn) {
      const dep = graph.get(depId);
      if (dep) {
        dep.blocks.push(id);
        node.blockedBy.push(depId);
      }
    }
  }

  return graph;
}

/**
 * Find critical path through tasks
 */
function findCriticalPath(graph) {
  const visited = new Set();
  const path = [];

  function visit(id) {
    if (visited.has(id)) return;
    visited.add(id);

    const node = graph.get(id);
    if (!node) return;

    // Visit dependencies first
    for (const depId of node.dependsOn) {
      visit(depId);
    }

    path.push(node.task);
  }

  // Find all end nodes (nothing blocks them)
  const endNodes = Array.from(graph.values())
    .filter(n => n.blocks.length === 0)
    .map(n => n.task.id);

  for (const id of endNodes) {
    visit(id);
  }

  return path;
}
```

### findParallelizable()
```javascript
/**
 * Find tasks that can run in parallel
 */
function findParallelizable(graph) {
  const parallel = [];
  const byDepth = new Map();

  // Calculate depth (distance from root)
  function getDepth(id, visited = new Set()) {
    if (visited.has(id)) return 0;
    visited.add(id);

    const node = graph.get(id);
    if (!node || node.dependsOn.length === 0) return 0;

    return 1 + Math.max(...node.dependsOn.map(d => getDepth(d, visited)));
  }

  for (const [id, node] of graph) {
    const depth = getDepth(id);
    if (!byDepth.has(depth)) {
      byDepth.set(depth, []);
    }
    byDepth.set(depth, [...byDepth.get(depth), node.task]);
  }

  // Tasks at same depth can run in parallel
  for (const [depth, tasks] of byDepth) {
    if (tasks.length > 1) {
      parallel.push({
        depth,
        tasks: tasks.map(t => t.id),
        parallelCount: tasks.length
      });
    }
  }

  return parallel;
}
```

---

## Level 3: Assignment

### suggestOwners()
```javascript
/**
 * Suggest owners based on task type and agent specialization
 */
function suggestOwners(subtask, roster) {
  const typeToAgent = {
    investigate: ['A2', 'A7'],    // QA or Platform
    fix: ['A7', 'A8'],            // Platform or venture-specific
    test: ['A2'],                  // QA Gatekeeper
    spec: ['A5'],                  // Product Lead
    design: ['A5'],                // Product Lead
    implement: ['A7', 'A8'],       // Platform or venture
    deploy: ['A7'],                // Platform Ops
    verify: ['A2'],                // QA Gatekeeper
    docs: ['A1'],                  // OCS
    plan: ['A1', 'A5'],            // OCS or Product
    backup: ['A7'],                // Platform Ops
    analyze: ['A1', 'A5']          // OCS or Product
  };

  const candidates = typeToAgent[subtask.type] || ['A1'];

  return candidates.map(agentId => {
    const agent = roster.agents.find(a => a.id === agentId);
    return {
      agentId,
      agentName: agent?.name || agentId,
      match: subtask.type,
      available: agent?.status === 'active'
    };
  });
}

/**
 * Auto-assign based on capacity and specialization
 */
function autoAssign(subtasks, roster, currentLoad) {
  const assignments = [];

  for (const subtask of subtasks) {
    const candidates = suggestOwners(subtask, roster);
    const available = candidates.filter(c => c.available);

    // Pick agent with lowest current load
    let bestCandidate = available[0];
    let lowestLoad = Infinity;

    for (const candidate of available) {
      const load = currentLoad[candidate.agentId] || 0;
      if (load < lowestLoad) {
        lowestLoad = load;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      assignments.push({
        taskId: subtask.id,
        assignedTo: bestCandidate.agentId,
        reason: `Best match for ${subtask.type}, load: ${lowestLoad}`
      });
      currentLoad[bestCandidate.agentId] = (currentLoad[bestCandidate.agentId] || 0) + effortToHours(subtask.effort);
    }
  }

  return assignments;
}
```

---

## MCP Tool Interface

```javascript
const tasksBreakdownTool = {
  name: 'tasks_breakdown',
  description: 'Decompose tickets into subtasks with estimates and assignments',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['breakdown', 'estimate', 'assign', 'deps', 'parallel', 'critical'],
        description: 'Breakdown operation to perform'
      },
      ticketId: {
        type: 'string',
        description: 'Ticket ID to break down'
      },
      autoAssign: {
        type: 'boolean',
        description: 'Auto-assign owners based on capacity'
      }
    },
    required: ['action']
  }
};
```

---

## Usage Examples

```bash
# Break down a ticket
tasks-breakdown breakdown --ticket BUG-20260120-0001

# Get estimates for subtasks
tasks-breakdown estimate --ticket FEAT-20260120-0002

# Auto-assign owners
tasks-breakdown assign --ticket FEAT-20260120-0002 --auto

# Show dependency graph
tasks-breakdown deps --ticket FEAT-20260120-0002

# Find parallelizable work
tasks-breakdown parallel --ticket FEAT-20260120-0002

# Show critical path
tasks-breakdown critical --ticket FEAT-20260120-0002
```

---

## Success Criteria

- All tickets broken down within 15 minutes of triage
- Estimates within 20% of actuals (tracked over time)
- Parallel opportunities identified for 80% of feature tickets
- Auto-assignment matches human assignment 90% of time
- Critical path always identified for planning
