---
name: browser-operator-ops
description: Browser automation operations - authenticated UI actions, screenshot capture, visual verification
version: 1.0.0
level: 3
owner: A7
skillId: S18
triggers:
  - browser automation
  - screenshot capture
  - visual verification
  - ui testing
  - shopify admin
---

# browser-operator-ops Skill

Execute authenticated browser UI actions. Capture screenshots. Visual verification. Owned by Engineering Lead (A7).

## Quick Commands

| Command | Action |
|---------|--------|
| `login` | Authenticate to target system |
| `screenshot` | Capture screenshot |
| `verify` | Visual verification |
| `navigate` | Navigate to URL |
| `action` | Execute UI action |

---

## Proof Requirements

This skill requires **strict** proof level with mandatory screenshot artifacts:

```javascript
const proofRequirements = {
  proof_level: 'strict',
  required_files: [
    {
      path: 'screenshots/{{execution_id}}_dashboard.png',
      type: 'image/png',
      min_bytes: 1024,
      description: 'Dashboard screenshot after login'
    }
  ],
  required_metadata: [
    { key: 'execution_id', type: 'string', required: true },
    { key: 'status', type: 'enum', values: ['success', 'partial', 'failed'], required: true },
    { key: 'screenshot_path', type: 'string', required: true }
  ]
};
```

---

## NOT YET IMPLEMENTED

This skill is a placeholder for the browser automation capability.

Currently, **NO skills** in the ANX framework execute authenticated browser UI actions:
- No Shopify Admin automation
- No Notion automation
- No Google Admin automation
- No screenshot proof pack generation

This is the next must-build capability.

---

*Generated for proof hard gate testing*
