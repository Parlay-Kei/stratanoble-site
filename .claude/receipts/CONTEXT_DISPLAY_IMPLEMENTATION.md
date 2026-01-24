# Context Display Implementation

**Date:** 2026-01-23
**Component:** ANX Command Center Context Display
**Status:** DELIVERED ✅

## Summary

Implemented a context display system in the ANX Command Center to show what the system thinks the repo context is, helping identify implicit context issues.

## Implementation Details

### Backend: Context Endpoint

**Endpoint:** `GET /api/context`
**Location:** `C:\Dev\StrataNoble\.claude\tools\command-center\api\src\server.js`

Returns:
```json
{
  "anx_root": "C:\\Dev\\.claude-anx",
  "active_project_root": null,
  "active_project_name": "Global",
  "project_mode": "Infrastructure",
  "context_source": "implicit",
  "working_directory": "C:\\Dev\\.claude-anx\\tools\\command-center\\api",
  "env": {
    "ANX_ROOT": null,
    "ANX_PROJECT_ROOT": null,
    "ANX_MODE": null
  }
}
```

### Context Determination Logic

1. **Explicit:** Via `ANX_PROJECT_ROOT` environment variable
2. **Derived:** Based on CWD containing known project paths
3. **Implicit:** System guessing based on location

### Frontend: Context Strip

**Location:** `C:\Dev\StrataNoble\.claude\tools\command-center\ui\src\App.js`

Features:
- Context strip in header showing Project name
- Mode and Source indicators
- Clickable panel for full details
- Visual warnings for implicit context (pulsing border)

### Visual Indicators

- **Source Badge Colors:**
  - Explicit: Green (#27ae60)
  - Derived: Orange (#ff8800)
  - Implicit: Red (#ff4444)

- **Mode Badge Colors:**
  - Global: Blue (#3498db)
  - Project: Green (#27ae60)
  - Infrastructure: Purple (#8e44ad)

## Issue Identified

✅ **Found the Gremlin:** System is showing `context_source: "implicit"` with `project_mode: "Infrastructure"`

This happens because:
- API is running from `C:\Dev\.claude-anx\tools\command-center\api`
- No explicit environment variables set
- System implicitly determines it's in infrastructure mode

## Solution

To make context explicit, set environment variables:
```bash
SET ANX_ROOT=C:\Dev\.claude-anx
SET ANX_PROJECT_ROOT=C:\Dev\StrataNoble
SET ANX_MODE=project
```

## Files Modified

1. `C:\Dev\StrataNoble\.claude\tools\command-center\api\src\server.js`
   - Added `/api/context` endpoint
   - Context determination logic

2. `C:\Dev\StrataNoble\.claude\tools\command-center\ui\src\App.js`
   - Added context display in header
   - Context panel with details
   - System context state management

3. `C:\Dev\StrataNoble\.claude\tools\command-center\ui\src\App.css`
   - Context strip styling
   - Context panel styling
   - Warning indicators for implicit context

## Access URLs

- **API Context Endpoint:** http://127.0.0.1:5002/api/context
- **UI with Context Display:** http://localhost:3001

## Status

The context display is fully operational and successfully identifies when the system is using implicit context determination. The UI provides clear visual feedback with warnings when context is implicit.