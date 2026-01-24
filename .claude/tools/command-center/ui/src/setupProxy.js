const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy main API calls (system status, directives, etc.)
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:5001',
      changeOrigin: true,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('Proxy error for main API:', err.message);
        res.status(500).json({
          error: 'API proxy error',
          target: 'http://127.0.0.1:5001',
          attempted_url: req.url,
          timestamp: new Date().toISOString()
        });
      }
    })
  );

  // Proxy control API calls (runtime, start/stop, receipts)
  app.use(
    '/control',
    createProxyMiddleware({
      target: 'http://127.0.0.1:5001',
      changeOrigin: true,
      pathRewrite: {
        '^/control': '/'
      },
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('Proxy error for control API:', err.message);
        res.status(500).json({
          error: 'Control API proxy error',
          target: 'http://127.0.0.1:5001',
          attempted_url: req.url,
          timestamp: new Date().toISOString()
        });
      }
    })
  );
};