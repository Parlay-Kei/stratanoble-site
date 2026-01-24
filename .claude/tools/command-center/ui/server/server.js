/* Production server: serves CRA build + proxies /api/* to CONTROL_ORIGIN
   - Same-origin in browser: all calls go to /api/*
   - Backend origin resolved server-side via CONTROL_ORIGIN
*/
const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const BUILD_DIR = path.join(process.cwd(), "build");
const PORT = process.env.PORT || 3000;
const CONTROL_ORIGIN = process.env.CONTROL_ORIGIN; // e.g. http://127.0.0.1:5001

// Basic hardening
app.disable("x-powered-by");

// Health endpoint for the web server itself
app.get("/healthz", (_req, res) => {
  res.json({ ok: true, service: "cockpit-web", ts: new Date().toISOString() });
});

// Proxy /api/* to control backend (server-side)
if (CONTROL_ORIGIN) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: CONTROL_ORIGIN,
      changeOrigin: true,
      xfwd: true,
      // Keep the /api prefix as-is
      pathRewrite: (pathReq) => pathReq,
      onError: (err, req, res) => {
        const payload = {
          ok: false,
          code: "CONTROL_PROXY_ERROR",
          message: "Control backend unavailable",
          attempted: req.originalUrl,
          ts: new Date().toISOString(),
        };
        if (!res.headersSent) res.writeHead(503, { "Content-Type": "application/json" });
        res.end(JSON.stringify(payload));
        console.error("[proxy] error:", err && err.message ? err.message : err);
      },
    })
  );
} else {
  // Fail closed with a structured error so UI doesn't show generic "Failed to fetch"
  app.use("/api", (req, res) => {
    res.status(503).json({
      ok: false,
      code: "CONTROL_ORIGIN_UNSET",
      message: "CONTROL_ORIGIN env var not configured",
      attempted: req.originalUrl,
      ts: new Date().toISOString(),
    });
  });
}

// Serve static build
app.use(express.static(BUILD_DIR));

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(BUILD_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`[web] listening on ${PORT}`);
  console.log(`[web] build dir: ${BUILD_DIR}`);
  console.log(`[web] control origin: ${CONTROL_ORIGIN ? "[set]" : "[unset]"}`);
});