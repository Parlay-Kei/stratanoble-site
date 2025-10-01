# Debugging Guide - StrataNoble & ACHIEVERY

## Server-Side Debugging with Chrome DevTools

Both the website and ACHIEVERY platform now support Node.js debugging through Chrome DevTools.

### Quick Start

**Website (Port 3000):**
```bash
cd apps/website
npm run dev:debug
```

**ACHIEVERY Platform (Port 3001):**
```bash
cd apps/platform
npm run dev:debug
```

### What You'll See

When you start the server with debugging enabled, you'll see output like:
```
Debugger listening on ws://127.0.0.1:9229/0cf90313-350d-4466-a748-cd60f4e47c95
For help, see: https://nodejs.org/en/docs/inspector
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Connecting Chrome DevTools

1. **Start the debug server** (using commands above)
2. **Open Chrome** and navigate to: `chrome://inspect`
3. **Click "Configure"** and ensure `localhost:9229` is in the list
4. **Click "inspect"** under your Next.js application
5. **Set breakpoints** in the DevTools Sources tab

### Available Debug Scripts

| Command | Port | Description |
|---------|------|-------------|
| `npm run dev` | 3000/3001 | Normal development mode |
| `npm run dev:debug` | 3000/3001 | Development with Node.js inspector |

### Advanced Debugging Options

**Remote Debugging (Docker/WSL):**
```bash
# Website
cross-env PORT=3000 NODE_OPTIONS='--inspect=0.0.0.0:9229' next dev

# Platform
cross-env PORT=3001 NODE_OPTIONS='--inspect=0.0.0.0:9230' next dev
```

**Different Debug Ports:**
```bash
# Website on debug port 9229 (default)
cross-env PORT=3000 NODE_OPTIONS='--inspect=9229' next dev

# Platform on debug port 9230
cross-env PORT=3001 NODE_OPTIONS='--inspect=9230' next dev
```

### Tips & Best Practices

1. **Breakpoint Locations:**
   - API routes: `apps/website/src/app/api/**/route.ts`
   - Server Components: Any component without `'use client'`
   - Middleware: `apps/*/middleware.ts`
   - Server Actions: Functions with `'use server'`

2. **Console Logs:**
   - Server-side logs appear in terminal
   - Client-side logs appear in browser console
   - Use `console.log('🔴 SERVER:', data)` to distinguish

3. **Hot Reload:**
   - Debug sessions persist through hot reloads
   - Breakpoints may need to be reset after major changes

4. **Performance:**
   - Debugging adds minimal overhead
   - Can run both servers in debug mode simultaneously

### Debugging Common Issues

**Port Already in Use:**
```bash
# Find process on port
netstat -ano | findstr :9229

# Kill process (Windows)
taskkill /F /PID <process_id>
```

**Debugger Not Connecting:**
- Ensure Chrome is on `chrome://inspect`
- Check firewall isn't blocking port 9229
- Restart the debug server
- Clear Chrome DevTools cache

**Breakpoints Not Hitting:**
- Verify code is server-side (not client component)
- Check file path matches source maps
- Ensure request actually reaches that code path

### Current Server Status

**Active Servers:**
- **Website:** `http://localhost:3000` (Normal mode)
- **Platform:** `http://localhost:3001` (Normal mode)

**To Enable Debugging:**
1. Stop current servers: `Ctrl+C` in terminal
2. Run debug command: `npm run dev:debug`
3. Connect Chrome DevTools as described above

### VS Code Debugging

For VS Code users, create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Website",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Platform",
      "type": "node",
      "request": "attach",
      "port": 9230,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Resources

- [Next.js Debugging Guide](https://nextjs.org/docs/pages/building-your-application/configuring/debugging)
- [Node.js Inspector](https://nodejs.org/en/docs/inspector)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
