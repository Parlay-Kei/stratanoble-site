#!/usr/bin/env node
/**
 * ANX Command Center API Server
 * Local-only server bound to 127.0.0.1
 * Manages directives, plans, jobs, and execution
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Boot diagnostics
console.log('[API] ANX Command Center API Server starting...');
console.log('[API] Working directory:', process.cwd());
console.log('[API] Node version:', process.version);
console.log('[API] API Server path:', __dirname);

// Test mission compiler import during boot
let compilerBootStatus = 'unknown';
let compilerVersion = 'unknown';
let compilerBootError = null;

try {
  console.log('[API] Testing Mission Compiler import...');
  const MissionCompilerTest = require('../../mission-compiler/src/compiler.js');
  const testCompiler = new MissionCompilerTest();
  compilerVersion = testCompiler.version || 'v1';
  compilerBootStatus = 'operational';
  console.log(`[API] Mission Compiler test successful - version: ${compilerVersion}`);
} catch (error) {
  compilerBootStatus = 'failed';
  compilerBootError = error.message;
  console.error('[API] CRITICAL: Mission Compiler test failed during API boot:', error);
  console.error('[API] Import attempted from API server.js');
  console.error('[API] Attempted path: ../../mission-compiler/src/compiler.js');
}

// Import route handlers
const directivesRoutes = require('./routes/directives');
const plansRoutes = require('./routes/plans');
const jobsRoutes = require('./routes/jobs');
const runsRoutes = require('./routes/runs');
const receiptsRoutes = require('./routes/receipts');
const opsRoutes = require('./routes/ops');
const systemRoutes = require('./routes/system');

// Universal root resolver
const fs = require('fs');
const { getANXRoot } = require('C:\\Dev\\.claude-anx\\tools\\anx-root-resolver');

const app = express();
const BASE_PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1'; // Local only
const PORT_RANGE = 10; // Try ports 5000-5009

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Health check endpoints
app.get('/health', (req, res) => {
  const status = compilerBootStatus === 'failed' ? 'degraded' : 'healthy';
  res.json({
    status: status,
    service: 'ANX Command Center API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mission_compiler: {
      status: compilerBootStatus,
      version: compilerVersion,
      error: compilerBootError
    }
  });
});

app.get('/api/health', (req, res) => {
  const status = compilerBootStatus === 'failed' ? 'degraded' : 'healthy';
  res.json({
    status: status,
    service: 'ANX Command Center API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mission_compiler: {
      status: compilerBootStatus,
      version: compilerVersion,
      error: compilerBootError,
      resolved_path: compilerBootStatus === 'operational' ? '../mission-compiler/src/compiler.js' : 'failed_to_resolve'
    },
    capabilities: {
      directive_creation: compilerBootStatus === 'operational' ? 'enabled' : 'disabled',
      plan_compilation: compilerBootStatus === 'operational' ? 'enabled' : 'disabled',
      job_graph_generation: compilerBootStatus === 'operational' ? 'enabled' : 'disabled'
    }
  });
});

// Load/save context from runtime
const contextFile = path.join(getANXRoot(), 'runtime', 'context.json');

function loadContext() {
  try {
    if (fs.existsSync(contextFile)) {
      return JSON.parse(fs.readFileSync(contextFile, 'utf-8'));
    }
  } catch (err) {
    console.error('[API] Error loading context:', err);
  }
  return { project_root: null };
}

function saveContext(context) {
  try {
    const runtimeDir = path.dirname(contextFile);
    if (!fs.existsSync(runtimeDir)) {
      fs.mkdirSync(runtimeDir, { recursive: true });
    }
    fs.writeFileSync(contextFile, JSON.stringify(context, null, 2));
    return true;
  } catch (err) {
    console.error('[API] Error saving context:', err);
    return false;
  }
}

// Context endpoint - shows system's understanding of project context
app.get('/api/context', (req, res) => {
  const anxRoot = getANXRoot();
  const savedContext = loadContext();

  // Determine project root and mode
  let activeProjectRoot = null;
  let activeProjectName = 'Global';
  let projectMode = 'Global';
  let contextSource = 'implicit'; // explicit | derived | implicit

  // Priority 1: Saved context from runtime/context.json
  if (savedContext.project_root) {
    activeProjectRoot = savedContext.project_root;
    activeProjectName = path.basename(activeProjectRoot);
    projectMode = 'Project';
    contextSource = 'explicit';
  }
  // Priority 2: Environment variable
  else if (process.env.ANX_PROJECT_ROOT) {
    activeProjectRoot = path.resolve(process.env.ANX_PROJECT_ROOT);
    activeProjectName = path.basename(activeProjectRoot);
    contextSource = 'explicit';
    projectMode = 'Project';
  }
  // Priority 3: Derived from CWD
  else {
    const cwd = process.cwd();
    if (cwd.includes('\\StrataNoble')) {
      activeProjectRoot = 'C:\\Dev\\StrataNoble';
      activeProjectName = 'StrataNoble';
      projectMode = 'Project';
      contextSource = 'derived';
    } else if (cwd.includes('\\msaudreys-house')) {
      activeProjectRoot = 'C:\\Dev\\msaudreys-house';
      activeProjectName = 'MsAudreys House';
      projectMode = 'Project';
      contextSource = 'derived';
    } else if (cwd.includes('\\DirectCuts-iOS')) {
      activeProjectRoot = 'C:\\Dev\\DirectCuts-iOS';
      activeProjectName = 'DirectCuts iOS';
      projectMode = 'Project';
      contextSource = 'derived';
    } else if (cwd.includes('\\DSLV')) {
      activeProjectRoot = 'C:\\Dev\\DSLV';
      activeProjectName = 'DSLV';
      projectMode = 'Project';
      contextSource = 'derived';
    }
    // Check if we're in .claude-anx infrastructure
    else if (cwd.includes('\\.claude-anx')) {
      projectMode = 'Infrastructure';
      contextSource = 'implicit';
    }
    // Otherwise we're in global mode
    else {
      projectMode = 'Global';
      contextSource = process.env.ANX_MODE === 'global' ? 'explicit' : 'implicit';
    }
  }

  res.json({
    anx_root: anxRoot,
    active_project_root: activeProjectRoot,
    active_project_name: activeProjectName,
    project_mode: projectMode,
    context_source: contextSource,
    working_directory: process.cwd(),
    env: {
      ANX_ROOT: process.env.ANX_ROOT || null,
      ANX_PROJECT_ROOT: process.env.ANX_PROJECT_ROOT || null,
      ANX_MODE: process.env.ANX_MODE || null
    }
  });
});

// Set project context
app.post('/api/context/project', (req, res) => {
  const { project_root } = req.body;

  if (!project_root) {
    return res.status(400).json({
      error: 'project_root is required'
    });
  }

  const resolvedPath = path.resolve(project_root);

  // Validate path exists
  if (!fs.existsSync(resolvedPath)) {
    return res.status(400).json({
      error: 'Project root does not exist',
      path: resolvedPath
    });
  }

  // Check for .git directory or CLAUDE.md
  const hasGit = fs.existsSync(path.join(resolvedPath, '.git'));
  const hasClaude = fs.existsSync(path.join(resolvedPath, 'CLAUDE.md'));

  if (!hasGit && !hasClaude) {
    return res.status(400).json({
      error: 'Not a valid project root (no .git or CLAUDE.md found)',
      path: resolvedPath
    });
  }

  // Save to context file
  const context = { project_root: resolvedPath };
  if (saveContext(context)) {
    res.json({
      ok: true,
      project_root: resolvedPath,
      project_name: path.basename(resolvedPath),
      message: 'Project context set successfully'
    });
  } else {
    res.status(500).json({
      error: 'Failed to save context'
    });
  }
});

// Clear project context (back to Global)
app.post('/api/context/clear', (req, res) => {
  const context = { project_root: null };
  if (saveContext(context)) {
    res.json({
      ok: true,
      message: 'Context cleared - now in Global mode'
    });
  } else {
    res.status(500).json({
      error: 'Failed to clear context'
    });
  }
});

// Get list of known projects
app.get('/api/projects', (req, res) => {
  const knownProjects = [
    { path: 'C:\\Dev\\StrataNoble', name: 'StrataNoble', hasGit: true },
    { path: 'C:\\Dev\\msaudreys-house', name: 'MsAudreys House', hasGit: true },
    { path: 'C:\\Dev\\DirectCuts-iOS', name: 'DirectCuts iOS', hasGit: true },
    { path: 'C:\\Dev\\DSLV', name: 'DSLV', hasGit: true }
  ];

  // Filter to existing projects
  const existingProjects = knownProjects.filter(p => fs.existsSync(p.path));

  res.json({
    projects: existingProjects,
    current: loadContext().project_root
  });
});

// API Routes
app.use('/api/directives', directivesRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/runs', runsRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/ops', opsRoutes);
app.use('/api/system', systemRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Start server with automatic port fallback
async function startServer() {
  const net = require('net');

  for (let port = BASE_PORT; port < BASE_PORT + PORT_RANGE; port++) {
    try {
      // First check if port is available
      const available = await new Promise((resolve) => {
        const testServer = net.createServer();
        testServer.once('error', () => resolve(false));
        testServer.once('listening', () => {
          testServer.close(() => resolve(true));
        });
        testServer.listen(port, HOST);
      });

      if (available) {
        // Try to start Express server on this port
        return new Promise((resolve, reject) => {
          const server = app.listen(port, HOST, () => {
            console.log(`ANX Command Center API Server running on http://${HOST}:${port}`);
            console.log(`Health check: http://${HOST}:${port}/health`);
            if (port !== BASE_PORT) {
              console.log(`[API] Using fallback port ${port} (default ${BASE_PORT} was occupied)`);
            }
            resolve(server);
          }).on('error', reject);
        });
      }
    } catch (err) {
      console.log(`[API] Port ${port} is not available, trying next...`);
    }
  }

  console.error(`[API] FATAL: No available ports in range ${BASE_PORT}-${BASE_PORT + PORT_RANGE - 1}`);
  process.exit(1);
}

// Start the server
(async () => {
  const server = await startServer();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
})();

module.exports = app;