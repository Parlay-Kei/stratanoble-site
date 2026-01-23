---
name: approvals-ops
description: Policy and approval matrix operations - rules that enable agent autonomy with appropriate guardrails
version: 1.0.0
level: 3
owner: A1
skillId: S3
triggers:
  - approve
  - approval
  - permission
  - authorize
  - policy check
  - threshold
---

# approvals-ops Skill

Manage approval policies and thresholds. Enable agent autonomy within defined boundaries. Route escalations when thresholds exceeded.

## Quick Commands

| Command | Action |
|---------|--------|
| `check` | Check if action requires approval |
| `approve` | Process approval request |
| `escalate` | Escalate to next authority |
| `thresholds` | Show current thresholds |
| `policy` | View/update policy rules |
| `audit` | Audit approval history |

---

## Level 1: Policy Definitions

### loadApprovalPolicy()
```javascript
/**
 * Load approval policy from governance files
 */
async function loadApprovalPolicy() {
  const fs = require('fs').promises;

  // Default policy structure
  const policy = {
    financial: {
      autoApprove: 500,
      agentAuthority: 5000,
      principalRequired: 5001,
      currency: 'USD'
    },
    deployment: {
      preview: 'auto',
      staging: 'auto',
      production: 'qa_gate_required'
    },
    contracts: {
      standard: { maxValue: 10000, authority: 'A3' },
      custom: { maxValue: 50000, authority: 'A4' },
      major: { minValue: 50001, authority: 'Steve' }
    },
    hiring: {
      contractor: { maxRate: 150, authority: 'A3' },
      fullTime: { authority: 'Steve' }
    },
    communications: {
      internal: 'auto',
      external_customers: 'A6',
      press: 'Steve',
      legal: 'A4'
    },
    autoApprovedActions: [
      'bug_fix',
      'documentation',
      'test_addition',
      'code_refactoring',
      'monitoring_update',
      'dependency_update_minor',
      'config_change_non_prod'
    ],
    alwaysEscalate: [
      'data_deletion',
      'security_policy_change',
      'production_rollback',
      'financial_reversal',
      'user_ban'
    ]
  };

  return policy;
}
```

### thresholdCheck()
```javascript
/**
 * Check if value exceeds threshold
 */
function thresholdCheck(category, value, policy) {
  const thresholds = policy[category];
  if (!thresholds) {
    return { approved: false, reason: 'Unknown category', escalateTo: 'A1' };
  }

  // Financial thresholds
  if (category === 'financial') {
    if (value <= thresholds.autoApprove) {
      return { approved: true, reason: `Within auto-approve threshold (<=${thresholds.autoApprove})` };
    }
    if (value <= thresholds.agentAuthority) {
      return { approved: true, reason: `Within agent authority (${thresholds.autoApprove}-${thresholds.agentAuthority})`, authority: 'A3' };
    }
    return { approved: false, reason: `Exceeds agent authority (>${thresholds.agentAuthority})`, escalateTo: 'Steve' };
  }

  return { approved: false, reason: 'Manual review required' };
}
```

---

## Level 2: Approval Checks

### canPerform()
```javascript
/**
 * Check if an agent can perform an action
 */
async function canPerform(agentId, action, context = {}) {
  const policy = await loadApprovalPolicy();

  const { type, value, target } = action;

  // Check auto-approved actions
  if (policy.autoApprovedActions.includes(type)) {
    return {
      approved: true,
      reason: 'Auto-approved action type',
      auditLog: true
    };
  }

  // Check always-escalate actions
  if (policy.alwaysEscalate.includes(type)) {
    return {
      approved: false,
      reason: 'Action requires principal approval',
      escalateTo: 'Steve',
      auditLog: true
    };
  }

  // Check financial thresholds
  if (type === 'expense' || type === 'spend' || type === 'payment') {
    const check = thresholdCheck('financial', value, policy);
    return { ...check, auditLog: true };
  }

  // Check deployment permissions
  if (type === 'deploy') {
    const env = context.environment || 'preview';
    const rule = policy.deployment[env];

    if (rule === 'auto') {
      return { approved: true, reason: `${env} deployment auto-approved` };
    }
    if (rule === 'qa_gate_required') {
      return {
        approved: true,
        requiresGate: true,
        gate: 'qa_gatekeeper',
        reason: 'Production deployment requires QA gate'
      };
    }
    return { approved: false, reason: 'Unknown deployment environment', escalateTo: 'A7' };
  }

  // Check communications
  if (type === 'communication') {
    const audience = context.audience || 'internal';
    const authority = policy.communications[audience];

    if (authority === 'auto') {
      return { approved: true, reason: `${audience} communication auto-approved` };
    }
    if (authority === agentId || authority === 'Steve') {
      return { approved: true, reason: `Agent has ${audience} communication authority` };
    }
    return { approved: false, reason: `${audience} communication requires approval`, escalateTo: authority };
  }

  // Default: require OCS review
  return {
    approved: false,
    reason: 'Action requires OCS review',
    escalateTo: 'A1'
  };
}
```

### requestApproval()
```javascript
/**
 * Create approval request
 */
async function requestApproval(request) {
  const {
    requesterId,
    action,
    context,
    justification
  } = request;

  const check = await canPerform(requesterId, action, context);

  if (check.approved) {
    return {
      status: 'auto_approved',
      ...check,
      timestamp: new Date().toISOString()
    };
  }

  // Create pending approval
  const approvalId = `APR-${Date.now()}`;
  const approval = {
    id: approvalId,
    requesterId,
    action,
    context,
    justification,
    status: 'pending',
    escalatedTo: check.escalateTo,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  // Store approval request
  await storeApprovalRequest(approval);

  // Notify approver
  await notifyApprover(check.escalateTo, approval);

  return {
    status: 'pending',
    approvalId,
    escalatedTo: check.escalateTo,
    reason: check.reason
  };
}
```

---

## Level 3: Escalation Chain

### escalate()
```javascript
/**
 * Escalate to next authority level
 */
async function escalate(approvalId, reason) {
  const approval = await getApprovalRequest(approvalId);
  if (!approval) {
    throw new Error(`Approval not found: ${approvalId}`);
  }

  // Escalation chain
  const chain = {
    'A1': 'Steve',   // OCS -> Steve
    'A2': 'A1',      // QA -> OCS
    'A3': 'Steve',   // CFO -> Steve
    'A4': 'Steve',   // Legal -> Steve
    'A5': 'A1',      // Product -> OCS
    'A6': 'A1',      // Growth -> OCS
    'A7': 'A1',      // Platform -> OCS
    'A8': 'A1',      // DC GM -> OCS
    'A9': 'A1'       // Support -> OCS
  };

  const currentApprover = approval.escalatedTo;
  const nextApprover = chain[currentApprover] || 'Steve';

  approval.previousApprover = currentApprover;
  approval.escalatedTo = nextApprover;
  approval.escalationReason = reason;
  approval.escalatedAt = new Date().toISOString();

  await updateApprovalRequest(approval);
  await notifyApprover(nextApprover, approval);

  return {
    status: 'escalated',
    from: currentApprover,
    to: nextApprover,
    reason
  };
}
```

### processDecision()
```javascript
/**
 * Process approval decision
 */
async function processDecision(approvalId, decision) {
  const { approverId, approved, comments } = decision;

  const approval = await getApprovalRequest(approvalId);
  if (!approval) {
    throw new Error(`Approval not found: ${approvalId}`);
  }

  // Verify approver has authority
  if (approval.escalatedTo !== approverId && approverId !== 'Steve') {
    throw new Error(`${approverId} is not authorized to approve this request`);
  }

  approval.status = approved ? 'approved' : 'rejected';
  approval.decidedBy = approverId;
  approval.decidedAt = new Date().toISOString();
  approval.comments = comments;

  await updateApprovalRequest(approval);
  await notifyRequester(approval.requesterId, approval);

  // Log for audit trail
  await logApprovalDecision(approval);

  return {
    status: approval.status,
    approvalId,
    decidedBy: approverId,
    comments
  };
}
```

---

## Level 4: Audit Trail

### logApprovalDecision()
```javascript
/**
 * Log approval decision for audit
 */
async function logApprovalDecision(approval) {
  const fs = require('fs').promises;
  const path = require('path');

  const date = new Date().toISOString().split('T')[0];
  const year = date.split('-')[0];
  const month = date.substring(0, 7);

  const auditDir = `C:/Dev/.claude-anx/docs/ops/04-PROOFS/${year}/${month}`;
  await fs.mkdir(auditDir, { recursive: true });

  const auditPath = path.join(auditDir, `APPROVAL_${approval.id}.md`);

  const receipt = `# Approval Receipt

**ID**: ${approval.id}
**Status**: ${approval.status.toUpperCase()}
**Timestamp**: ${approval.decidedAt}

## Request Details

| Field | Value |
|-------|-------|
| Requester | ${approval.requesterId} |
| Action Type | ${approval.action.type} |
| Value | ${approval.action.value || 'N/A'} |
| Context | ${JSON.stringify(approval.context || {})} |

## Decision

| Field | Value |
|-------|-------|
| Decided By | ${approval.decidedBy} |
| Decision | ${approval.status} |
| Comments | ${approval.comments || 'None'} |

## Escalation History

${approval.previousApprover ? `- Escalated from ${approval.previousApprover} to ${approval.escalatedTo}` : '- No escalation required'}
${approval.escalationReason ? `- Reason: ${approval.escalationReason}` : ''}

---
*Generated by approvals-ops skill*
`;

  await fs.writeFile(auditPath, receipt, 'utf-8');
  return auditPath;
}
```

---

## MCP Tool Interface

```javascript
const approvalsOpsTool = {
  name: 'approvals_ops',
  description: 'Check permissions, process approvals, manage policy',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['check', 'approve', 'escalate', 'thresholds', 'policy', 'audit'],
        description: 'Approval operation to perform'
      },
      agentId: {
        type: 'string',
        description: 'Agent requesting approval'
      },
      actionType: {
        type: 'string',
        description: 'Type of action requiring approval'
      },
      value: {
        type: 'number',
        description: 'Value for threshold checks'
      },
      approvalId: {
        type: 'string',
        description: 'Approval request ID'
      }
    },
    required: ['action']
  }
};
```

---

## Usage Examples

```bash
# Check if action is allowed
approvals-ops check --agent A3 --action expense --value 2500

# View current thresholds
approvals-ops thresholds

# Process approval request
approvals-ops approve --id APR-1705708800000 --approved true --comments "Approved"

# Escalate pending approval
approvals-ops escalate --id APR-1705708800000 --reason "Exceeds my authority"

# Audit approval history
approvals-ops audit --from 2026-01-01 --to 2026-01-31
```

---

## Success Criteria

- All actions checked against policy in < 100ms
- Zero unauthorized actions executed
- Full audit trail for all approvals
- Escalation response time < 4 hours
- Policy changes require principal approval
