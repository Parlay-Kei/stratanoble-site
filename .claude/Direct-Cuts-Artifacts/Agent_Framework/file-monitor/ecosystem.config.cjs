/**
 * PM2 Ecosystem Configuration
 * For running file monitor as a persistent daemon
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 stop file-monitor
 *   pm2 restart file-monitor
 *   pm2 logs file-monitor
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      name: 'file-monitor',
      script: 'monitor.js',
      cwd: __dirname,
      interpreter: 'node',
      interpreter_args: '--experimental-modules',

      // Instance configuration
      instances: 1,
      exec_mode: 'fork',

      // Auto-restart configuration
      autorestart: true,
      watch: false, // Don't watch for changes (we ARE the watcher)
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,

      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Environment
      env: {
        NODE_ENV: 'production',
        FORCE_COLOR: '1'
      },

      // Memory management
      max_memory_restart: '200M',

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Cron-like restart (optional - daily restart at 3 AM)
      // cron_restart: '0 3 * * *',

      // Health check endpoint (if implemented)
      // exp_backoff_restart_delay: 100
    }
  ]
};
