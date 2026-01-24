# Cockpit Production Server (Express)

This server serves the CRA build output (`/build`) and proxies `/api/*` to the Control backend.

## Environment Variables
- `PORT=3000` - Port for the Express server (default: 3000)
- `CONTROL_ORIGIN=http://127.0.0.1:5001` - Backend API origin for proxying

## Local Production Testing
```bash
# 1. Build the UI (creates /build directory)
cd .claude/tools/command-center/ui
npm run build

# 2. Install dependencies (if not already installed)
npm install

# 3. Start production server
CONTROL_ORIGIN=http://127.0.0.1:5001 npm run start:prod
```

## Production Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY build ./build
COPY server ./server
ENV PORT=3000
ENV CONTROL_ORIGIN=http://backend:5001
CMD ["node", "server/server.js"]
```

### Heroku
```bash
# Procfile
web: node server/server.js

# Set config vars
heroku config:set CONTROL_ORIGIN=https://your-backend.herokuapp.com
```

### Vercel/Netlify Alternative
For static hosting platforms, use their proxy/rewrite configuration instead of Express:

**vercel.json:**
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://your-backend.com/api/:path*" }
  ]
}
```

**netlify.toml:**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend.com/api/:splat"
  status = 200
  force = true
```

## Architecture Contract

### Browser → Express Server
- All API calls use relative paths: `/api/*`
- No cross-origin requests from browser
- No hardcoded `127.0.0.1:*` addresses in frontend code

### Express Server → Backend
- Server-side proxy resolves `/api/*` to `CONTROL_ORIGIN`
- Handles backend unavailability with structured 503 responses
- Preserves `/api` prefix when proxying

## Error Handling

### Backend Unavailable
When the backend is down, the Express server returns:
```json
{
  "ok": false,
  "code": "CONTROL_PROXY_ERROR",
  "message": "Control backend unavailable",
  "attempted": "/api/runtime",
  "ts": "2026-01-23T12:00:00.000Z"
}
```

### CONTROL_ORIGIN Not Set
If `CONTROL_ORIGIN` env var is missing:
```json
{
  "ok": false,
  "code": "CONTROL_ORIGIN_UNSET",
  "message": "CONTROL_ORIGIN env var not configured",
  "attempted": "/api/runtime",
  "ts": "2026-01-23T12:00:00.000Z"
}
```

## Verification

1. **Health Check:**
   ```bash
   curl http://localhost:3000/healthz
   ```

2. **API Proxy Test:**
   ```bash
   curl http://localhost:3000/api/system/status
   ```

3. **Network Inspector:**
   - Open browser DevTools → Network tab
   - All API calls should show as same-origin `/api/*`
   - No `127.0.0.1:*` requests should appear

## Production Checklist

- [ ] Build UI with `npm run build`
- [ ] Set `CONTROL_ORIGIN` environment variable
- [ ] Configure process manager (PM2, systemd, etc.)
- [ ] Set up health monitoring on `/healthz`
- [ ] Configure reverse proxy if needed (nginx for SSL termination)
- [ ] Set appropriate `NODE_ENV=production`