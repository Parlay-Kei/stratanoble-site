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

// API Routes
app.use('/api/directives', directivesRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/runs', runsRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/ops', opsRoutes);

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