# Comprehensive Runtime Error Analysis Report
**Generated:** 2025-09-26T03:50:57.870Z
**URL:** http://localhost:3000
**Load Time:** 4742ms
**React Hydration:** ✅ SUCCESS

## Error Summary
- **Total Runtime Issues:** 5
- **Console Errors:** 4
- **Network Errors:** 0
- **JavaScript Errors:** 0
- **Resource Failures:** 1

## Console Errors
### 1. CONSOLE-WARNING
**Message:** Sentry Logger [warn]: No DSN provided, client will not send events.
**Location:** {"url":"webpack-internal:///(app-pages-browser)/./node_modules/@sentry/core/build/esm/utils/debug-logger.js","lineNumber":96,"columnNumber":74}
**Time:** 2025-09-26T03:50:45.929Z

### 2. CONSOLE-WARNING
**Message:** Ignoring Event: localhost
**Location:** {"url":"https://plausible.io/js/script.js","lineNumber":0,"columnNumber":1888}
**Time:** 2025-09-26T03:50:46.170Z

### 3. CONSOLE-WARNING
**Message:** Ignoring Event: localhost
**Location:** {"url":"https://plausible.io/js/script.js","lineNumber":0,"columnNumber":1888}
**Time:** 2025-09-26T03:50:46.192Z

### 4. CONSOLE-WARNING
**Message:** Ignoring Event: localhost
**Location:** {"url":"https://plausible.io/js/script.js","lineNumber":0,"columnNumber":1888}
**Time:** 2025-09-26T03:50:46.192Z

## Page State Analysis
- **Document Ready State:** complete
- **Scripts Loaded:** 45
- **Stylesheets:** 2
- **React Root Element:** Missing
- **Body Classes:** font-sans antialiased pt-12
- **Head Content Length:** 3840 characters
- **Body Content Length:** 115892 characters

## Interactive Elements Test
- Found 1 navigation elements
- Found 4 button elements
- Found 1 form elements
- First button clickable: FAILED - locator.click: Timeout 5000ms exceeded.
Call log:
[2m  - waiting for locator('button, [role="button"], .btn').first()[22m
[2m    - locator resolved to <button type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open main menu" class="relative -m-2.5 inline-flex items-center justify-center rounded-xl p-3 text-navy-700 hover:bg-navy-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 active:scale-95">…</button>[22m
[2m  - attempting click action[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not visible[22m
[2m    - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not visible[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    9 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not visible[22m
[2m    - retrying click action[22m
[2m      - waiting 500ms[22m

