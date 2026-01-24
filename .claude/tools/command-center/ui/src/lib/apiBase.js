/**
 * API Base Authority
 * Single source of truth for API endpoint resolution
 */

/**
 * Global runtime context (injected by index.html or server)
 * @typedef {Object} ANXRuntime
 * @property {string} api_url - Base API URL (e.g., "http://127.0.0.1:5000")
 * @property {string} control_url - Control API URL (e.g., "http://127.0.0.1:5001")
 * @property {string} ui_url - UI URL
 * @property {string} started_at - ISO timestamp
 * @property {string} last_healthy_at - ISO timestamp
 */

/**
 * Get API base URL from runtime context, environment, or default
 * @returns {string} API base URL
 */
export function getApiBase() {
  // Priority 1: Runtime context (injected by server)
  if (window.__ANX_RUNTIME?.api_url) {
    return window.__ANX_RUNTIME.api_url;
  }

  // Priority 2: Environment variable (build-time)
  if (process.env.REACT_APP_CONTROL_API) {
    return process.env.REACT_APP_CONTROL_API;
  }

  // Priority 3: Same-origin default (preferred for production)
  return '/api';
}

/**
 * Get control API base URL (for supervisor/cockpit operations)
 * @returns {string} Control API base URL
 */
export function getControlApiBase() {
  // Priority 1: Runtime context
  if (window.__ANX_RUNTIME?.control_url) {
    return window.__ANX_RUNTIME.control_url;
  }

  // Priority 2: Environment variable
  if (process.env.REACT_APP_CONTROL_API) {
    return process.env.REACT_APP_CONTROL_API;
  }

  // Priority 3: Same-origin proxy path (setupProxy.js routes /control to port 5001)
  return '/control';
}

/**
 * Build full API endpoint URL
 * @param {string} endpoint - Endpoint path (e.g., "/runtime", "/system/status")
 * @param {boolean} [useControl=false] - Use control API base instead of main API
 * @returns {string} Full URL
 */
export function buildApiUrl(endpoint, useControl = false) {
  const base = useControl ? getControlApiBase() : getApiBase();

  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If base is already a full URL, use as-is
  if (base.startsWith('http://') || base.startsWith('https://')) {
    return `${base}${cleanEndpoint}`;
  }

  // Same-origin path
  return `${base}${cleanEndpoint}`;
}

/**
 * Get runtime context for debugging
 * @returns {Object} Current runtime resolution state
 */
export function getApiContext() {
  return {
    runtime: window.__ANX_RUNTIME || null,
    env: {
      REACT_APP_CONTROL_API: process.env.REACT_APP_CONTROL_API
    },
    resolved: {
      apiBase: getApiBase(),
      controlApiBase: getControlApiBase()
    },
    buildInfo: {
      timestamp: new Date().toISOString(),
      origin: window.location.origin
    }
  };
}