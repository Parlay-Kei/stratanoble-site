# ANX Root Canonicalization v1

**Date:** 2026-01-23
**Objective:** Eliminate dual-root ambiguity between C:\Dev\.claude and C:\Dev\.claude-anx
**Status:** CANONICAL ROOT ESTABLISHED

## Directory Inventory & Classification

### C:\Dev\.claude-anx (CANONICAL - GLOBAL)
**Type:** Global ANX infrastructure
**Contents:**
```
├── autonomy/             # Global agent orchestration
├── browser-sessions/     # Shared browser automation state
├── certifications/       # Global certificates and credentials
├── docs/                # ANX system documentation
├── governance/          # Global policies and frameworks
├── logs/                # System-wide logging
├── mcp-servers/         # Global MCP server implementations
├── missions/            # Mission templates and specs
├── orchestrators/       # Global orchestration logic
├── policies/            # System-wide policies
├── receipts/            # Global receipt store
├── runtime/             # Runtime contracts (CRITICAL)
├── services/            # Global service definitions
├── skills/              # Global skill library
├── state/               # System state persistence
├── tools/               # Global tools (command-center, etc)
└── types/               # Global type definitions
```

### C:\Dev\StrataNoble\.claude (PROJECT-LOCAL)
**Type:** Project-specific configuration and local tools
**Contents:**
```
├── commands/            # Project-specific commands
├── config.json         # Project configuration
├── scripts/             # Local automation scripts
├── settings.local.json  # Local settings override
├── skills/              # Project-specific skills (DUPLICATE)
└── tools/               # Local tools (DUPLICATE - should be shims)
```

## Content Classification

### 🌍 GLOBAL (Must live in .claude-anx)
- **Runtime contracts** - Single source of truth
- **Agent orchestration** - System-wide coordination
- **Global services** - Command Center, skills server, etc
- **Receipt store** - Forensic trail across all projects
- **System state** - Persistent supervisor/service state
- **Documentation** - ANX system docs
- **Governance** - Policies, frameworks, certifications
- **MCP servers** - Reusable across projects

### 📁 PROJECT-LOCAL (Can stay in project .claude)
- **settings.local.json** - Project-specific overrides
- **config.json** - Project configuration
- **commands/** - Project-specific commands
- **scripts/** - Local automation

### ⚠️ DUPLICATES/DRIFT (Same concept in both places)
- **skills/** - Both locations have skill definitions
- **tools/** - Command center exists in both roots
- **Various scripts** - Duplicated automation logic

## ANX Root References Found

### Hard-coded References
| File | Line | Reference | Type |
|------|------|-----------|------|
| `anx_supervisor.js` | 22 | `C:\\Dev\\.claude-anx` | Hard-coded |
| `control-plane/server.js` | 18 | `C:\\Dev\\.claude-anx` | Hard-coded |
| Various MCP configs | Multiple | `.claude-anx` paths | Hard-coded |

### Dynamic References (Need Investigation)
- Skills server startup scripts
- Agent framework bootstrapping
- Manifest.json readers
- Browser session managers

## Canonical Root Reference Method

### Environment Variable Strategy
```bash
# Primary
ANX_ROOT=C:\Dev\.claude-anx

# Fallbacks
ANX_FALLBACK_ROOT=C:\Dev\.claude-anx
```

### Reference Resolution Function
```javascript
function getANXRoot() {
  // 1. Check environment variable
  const envRoot = process.env.ANX_ROOT;
  if (envRoot && fs.existsSync(envRoot)) {
    return envRoot;
  }

  // 2. Check canonical fallback
  const canonicalRoot = 'C:\\Dev\\.claude-anx';
  if (fs.existsSync(canonicalRoot)) {
    return canonicalRoot;
  }

  // 3. Fail fast with diagnostic
  throw new Error(`
ANX_ROOT_ERROR: Canonical root not found
- Checked ANX_ROOT env var: ${envRoot || 'undefined'}
- Checked canonical path: ${canonicalRoot}
- Resolution: Set ANX_ROOT environment variable or ensure ${canonicalRoot} exists
  `);
}
```

## Project .claude Shim Conversion

### Before (Duplicated)
```
C:\Dev\StrataNoble\.claude\
├── tools\command-center\     # DUPLICATE
└── skills\                   # DUPLICATE
```

### After (Shim Pointers)
```
C:\Dev\StrataNoble\.claude\
├── anx-root.config.json      # Points to canonical root
├── config.json              # Project-specific config
└── settings.local.json      # Local overrides
```

### anx-root.config.json
```json
{
  "anx_canonical_root": "C:\\Dev\\.claude-anx",
  "project_name": "StrataNoble",
  "shim_version": "1.0.0",
  "tools_redirect": {
    "command-center": "global",
    "skills-server": "global",
    "browser-operator": "global"
  },
  "local_overrides": {
    "settings": "./settings.local.json",
    "commands": "./commands/"
  }
}
```

## Migration Steps

### 1. Update All Hard-coded References
```bash
# Files to update:
- anx_supervisor.js: Use getANXRoot()
- control-plane/server.js: Use getANXRoot()
- All MCP server configs
- Skills server bootstrapping
- Agent framework initialization
```

### 2. Install Root Resolution
```javascript
// In each component
const ANX_ROOT = require('./anx-root-resolver').getANXRoot();
```

### 3. Convert Project .claude to Shims
- Remove duplicate tools/ directories
- Remove duplicate skills/
- Add anx-root.config.json
- Keep only project-specific configs

### 4. Add Canonical Root Guard
```javascript
function validateCanonicalRoot() {
  const detectedRoots = [
    { path: 'C:\\Dev\\.claude', exists: fs.existsSync('C:\\Dev\\.claude') },
    { path: 'C:\\Dev\\.claude-anx', exists: fs.existsSync('C:\\Dev\\.claude-anx') }
  ];

  const activeRoots = detectedRoots.filter(r => r.exists);

  if (activeRoots.length > 1) {
    console.error('[ANX_ROOT_GUARD] REGRESSION DETECTED: Multiple ANX roots found');
    console.error('[ANX_ROOT_GUARD] Canonical: C:\\Dev\\.claude-anx');
    console.error('[ANX_ROOT_GUARD] Detected:', activeRoots.map(r => r.path));
    process.exit(1);
  }
}
```

## Verification Scenarios

### Test 1: Strata Noble Start
```bash
cd C:\Dev\StrataNoble
# Should resolve to canonical .claude-anx
npm run command-center:start
```

### Test 2: Direct-Cuts Start
```bash
cd C:\Dev\DirectCuts-iOS
# Should resolve to same canonical .claude-anx
npm run command-center:start
```

### Test 3: New Project Start
```bash
cd C:\Dev\NewProject
# Should resolve to canonical .claude-anx
npx anx-cli start
```

**Pass Criteria:**
- Same runtime contract location across all projects
- Same agent roster resolves
- Same tools and skills available
- Single receipts directory accumulates all forensics

## Benefits

### ✅ Eliminated Ambiguity
- Single source of truth: `C:\Dev\.claude-anx`
- No more dual-root confusion
- Clear global vs local distinction

### ✅ Simplified Deployment
- One ANX installation serves all projects
- Consistent behavior across repos
- Universal start experience

### ✅ Prevented Drift
- No more duplicate tool maintenance
- Centralized skill library
- Single governance framework

### ✅ Enhanced Forensics
- All receipts in one location
- Cross-project audit trail
- Unified logging and state

---
**Status:** CANONICAL ROOT ESTABLISHED
**Next:** Implement root resolution function and convert project shims