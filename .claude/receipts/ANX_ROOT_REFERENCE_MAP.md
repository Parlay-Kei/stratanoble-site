# ANX Root Reference Map

**Date:** 2026-01-23
**Purpose:** Track every system component that reads ANX root paths

## Current Hard-coded References

### 🔧 Command Center Components

| File | Line | Reference | Usage | Priority |
|------|------|-----------|-------|----------|
| `anx_supervisor.js` | 22 | `C:\\Dev\\.claude-anx` | State DB, receipts, runtime, tools paths | **P0** |
| `control-plane/server.js` | 18 | `C:\\Dev\\.claude-anx` | Runtime file, receipts, supervisor path | **P0** |
| `api/src/server.js` | Unknown | Likely hard-coded | API server paths | **P1** |
| `ui/src/App.js` | 10 | `http://127.0.0.1:5000/api` | API endpoint (indirect) | **P1** |

### 🧠 Skills & Agents

| Component | Reference Type | Usage | Priority |
|-----------|----------------|-------|----------|
| Skills Server | Config-based | Agent resolution, skill loading | **P0** |
| Agent Framework | Runtime discovery | Agent manifest reading | **P0** |
| MCP Servers | Config files | Service endpoints, state | **P1** |
| Browser Operator | Session storage | Browser state persistence | **P2** |
| LinkedIn Setup | Script paths | Automation workflows | **P2** |

### 📋 Orchestration & Governance

| Component | Reference Type | Usage | Priority |
|-----------|----------------|-------|----------|
| Mission Compiler | Path resolution | Mission template loading | **P1** |
| Policy Engine | Governance paths | Policy file reading | **P1** |
| Receipt System | Direct writes | Forensic trail storage | **P0** |
| Runtime Contracts | File I/O | System state persistence | **P0** |
| Autonomy Runner | Bootstrap paths | Autonomous agent loading | **P1** |

### 🌐 MCP & External Services

| Service | Config Location | Reference | Priority |
|---------|----------------|-----------|----------|
| Supabase MCP | `mcp-servers/supabase/` | Connection configs | **P1** |
| Skills Server | `mcp-servers/skills-server/` | Skill library paths | **P0** |
| ANX Ops | `mcp-servers/anx-ops/` | Operations tooling | **P1** |
| Google Drive | `mcp-servers/google-drive-server/` | Document storage | **P2** |

## Reference Pattern Analysis

### 🚨 Direct Hard-coding (Most Fragile)
```javascript
// BAD: Hard-coded absolute path
const ANX_ROOT = 'C:\\Dev\\.claude-anx';
```
**Found in:** supervisor, control-plane
**Risk:** Breaks on different environments
**Priority:** Fix immediately

### 🔄 Config-based (Better)
```json
{
  "anx_root": "${ANX_ROOT:-C:\\Dev\\.claude-anx}",
  "paths": {
    "receipts": "${anx_root}/receipts"
  }
}
```
**Found in:** Some MCP servers
**Risk:** Config drift
**Priority:** Standardize

### ✅ Environment-aware (Best)
```javascript
const ANX_ROOT = process.env.ANX_ROOT || 'C:\\Dev\\.claude-anx';
```
**Found in:** Newer components
**Risk:** Low
**Priority:** Expand to all components

## Resolution Strategy by Component

### P0 - Critical Path (Fix First)

#### anx_supervisor.js
```javascript
// BEFORE
const ANX_ROOT = 'C:\\Dev\\.claude-anx';

// AFTER
const { getANXRoot } = require('./anx-root-resolver');
const ANX_ROOT = getANXRoot();
```

#### control-plane/server.js
```javascript
// BEFORE
const ANX_ROOT = 'C:\\Dev\\.claude-anx';

// AFTER
const { getANXRoot } = require('../shared/anx-root-resolver');
const ANX_ROOT = getANXRoot();
```

#### Skills Server Bootstrap
```javascript
// BEFORE: Multiple possible root discoveries

// AFTER: Single resolution
const { getANXRoot } = require('@anx/root-resolver');
const skillsPath = path.join(getANXRoot(), 'skills');
```

### P1 - Important (Fix Second)

#### API Server Configuration
```javascript
// In api/config/paths.js
const ANX_ROOT = require('@anx/root-resolver').getANXRoot();

module.exports = {
  receipts: path.join(ANX_ROOT, 'receipts'),
  state: path.join(ANX_ROOT, 'state'),
  runtime: path.join(ANX_ROOT, 'runtime')
};
```

#### MCP Server Configs
```json
{
  "$schema": "./schema.json",
  "anx_root": {
    "source": "environment",
    "variable": "ANX_ROOT",
    "fallback": "C:\\Dev\\.claude-anx"
  }
}
```

### P2 - Nice to Have (Fix Last)

#### Browser Session Storage
```javascript
const sessionPath = path.join(getANXRoot(), 'browser-sessions');
```

#### LinkedIn Automation Paths
```javascript
const linkedinSetupPath = path.join(getANXRoot(), 'linkedin-setup');
```

## Universal Root Resolver Implementation

### anx-root-resolver.js
```javascript
const fs = require('fs');
const path = require('path');

let cachedRoot = null;

function getANXRoot() {
  if (cachedRoot) return cachedRoot;

  // 1. Environment variable (highest priority)
  const envRoot = process.env.ANX_ROOT;
  if (envRoot) {
    if (fs.existsSync(envRoot)) {
      cachedRoot = path.resolve(envRoot);
      return cachedRoot;
    } else {
      throw new Error(`ANX_ROOT env var points to non-existent path: ${envRoot}`);
    }
  }

  // 2. Canonical fallback
  const canonical = 'C:\\Dev\\.claude-anx';
  if (fs.existsSync(canonical)) {
    cachedRoot = canonical;
    return cachedRoot;
  }

  // 3. Project-local detection (temporary migration support)
  const projectLocal = findProjectLocal();
  if (projectLocal) {
    console.warn('[ANX] Using project-local .claude - migrate to canonical .claude-anx');
    cachedRoot = projectLocal;
    return cachedRoot;
  }

  // 4. Fail fast with diagnostics
  throw new Error(`
[ANX_ROOT_RESOLVER] No valid ANX root found
Checked:
  - ANX_ROOT env var: ${envRoot || 'undefined'}
  - Canonical path: ${canonical}
  - Project .claude: none found
Resolution:
  1. Set ANX_ROOT environment variable, OR
  2. Ensure canonical path exists: ${canonical}
`);
}

function findProjectLocal() {
  let currentDir = process.cwd();
  while (currentDir !== path.dirname(currentDir)) {
    const claudeDir = path.join(currentDir, '.claude');
    if (fs.existsSync(claudeDir)) {
      return claudeDir;
    }
    currentDir = path.dirname(currentDir);
  }
  return null;
}

function validateCanonicalRoot() {
  const roots = [
    'C:\\Dev\\.claude',
    'C:\\Dev\\.claude-anx'
  ].filter(fs.existsSync);

  if (roots.length > 1) {
    console.error('[ANX_ROOT_GUARD] REGRESSION: Multiple roots detected');
    console.error('[ANX_ROOT_GUARD] Expected: Single canonical root');
    console.error('[ANX_ROOT_GUARD] Found:', roots);
    console.error('[ANX_ROOT_GUARD] Action: Remove non-canonical roots');
    process.exit(1);
  }
}

module.exports = {
  getANXRoot,
  validateCanonicalRoot
};
```

## Migration Checklist

### Phase 1: Install Root Resolver
- [ ] Create `anx-root-resolver.js`
- [ ] Update `anx_supervisor.js`
- [ ] Update `control-plane/server.js`
- [ ] Test Command Center functionality

### Phase 2: Update Critical Components
- [ ] Skills Server bootstrap
- [ ] Agent Framework initialization
- [ ] Receipt system writers
- [ ] Runtime contract handlers

### Phase 3: Convert Project Shims
- [ ] Create `anx-root.config.json` in project .claude
- [ ] Remove duplicate tools from projects
- [ ] Remove duplicate skills from projects
- [ ] Test universal start across repos

### Phase 4: Add Guards & Validation
- [ ] Install canonical root guard
- [ ] Add startup validation
- [ ] Add regression prevention
- [ ] Document new patterns

## Verification Commands

```bash
# Test root resolution
node -e "console.log(require('./anx-root-resolver').getANXRoot())"

# Test multi-root detection
ANX_ROOT=C:\Dev\.claude-anx node test-universal-start.js

# Test fallback behavior
unset ANX_ROOT && node test-canonical-fallback.js
```

---
**Status:** MAPPING COMPLETE
**Next:** Implement root resolver and update critical components