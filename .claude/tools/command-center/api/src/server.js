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

// Import route handlers
const directivesRoutes = require('./routes/directives');
const plansRoutes = require('./routes/plans');
const jobsRoutes = require('./routes/jobs');
const runsRoutes = require('./routes/runs');
const receiptsRoutes = require('./routes/receipts');
const opsRoutes = require('./routes/ops');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1'; // Local only

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ANX Command Center API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
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

// Start server bound to localhost only
const server = app.listen(PORT, HOST, () => {
  console.log(`ANX Command Center API Server running on http://${HOST}:${PORT}`);
  console.log(`Health check: http://${HOST}:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;