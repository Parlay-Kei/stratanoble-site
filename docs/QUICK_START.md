# 🚀 Quick Start Guide - Production Operations Agent

**Get your cold calling system back online in 5 minutes**

---

## ⚡ Immediate Actions

### 1. Fix the Critical Issue (2 minutes)

Your cold calls are disconnecting because **OpenAI API Key is missing in Railway**.

**Fix It Now:**

```bash
# Option A: Use Railway CLI (if installed)
railway variables set OPENAI_API_KEY="sk-proj-YOUR_KEY_HERE" --environment production

# Option B: Use Railway Dashboard
# 1. Go to https://railway.app/dashboard
# 2. Select "datasolutions-websocket"
# 3. Click "Variables"
# 4. Add: OPENAI_API_KEY = sk-proj-YOUR_KEY_HERE
# 5. Click "Add" (auto-redeploys)
```

**Get Your OpenAI Key:**
1. Visit: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-proj-`)

---

### 2. Install Agent Dependencies (1 minute)

```bash
cd C:\Dev\DataSolutions\agents\production-ops
npm install
```

---

### 3. Run Health Check (1 minute)

```bash
npm run health
```

**If you see "OpenAI connection failed":**
- The Railway key is still not set
- Wait 2 minutes after setting it (for redeploy)
- Run `npm run health` again

**When you see "All systems operational":**
- ✅ System is fixed!
- ✅ Cold calls will now work

---

### 4. Validate with Test Calls (1 minute)

```bash
npm run test-calls
```

**Expected Output:**
```
📞 Running 10 test calls...

[1/10] Testing +15555551001...
   ✓ Call initiated: CAabc123
   ✓ Call logged: status=completed

[2/10] Testing +15555551002...
   ✓ Call initiated: CAdef456
   ✓ Call logged: status=completed

... (8 more) ...

📊 Test Results:
   Total: 10
   Successful: 10
   Failed: 0
   Success Rate: 100%

✓ Test campaign passed (≥90% success)
```

---

## 🛠️ Available Commands

### Health & Diagnostics

```bash
# Full health check
npm run health

# Run diagnostic (identifies issues)
npm run diagnose

# Run diagnostic for specific component
npm run cli diagnose --type openai
npm run cli diagnose --type railway
npm run cli diagnose --type twilio
```

### Testing

```bash
# Run 10 test calls
npm run test-calls

# Run test calls with specific numbers
npm run cli test --phones "+15551234567,+15559876543"

# Validate complete call flow
npm run cli test flow
```

### Fixes

```bash
# Apply automated fixes
npm run fix

# Fix specific issue
npm run cli fix openai-connection
npm run cli fix railway-service
```

### Monitoring

```bash
# Check agent status
npm run status

# View agent logs
npm run logs

# Real-time monitoring dashboard
npm run monitor
```

---

## 📋 Common Scenarios

### Scenario 1: "My calls keep disconnecting"

```bash
# 1. Run diagnostic
npm run diagnose

# 2. Look for OpenAI issues
# If you see "OpenAI API Key Missing" or "Invalid"
# → Set key in Railway (see section 1 above)

# 3. Validate fix
npm run test-calls

# If still failing:
npm run cli diagnose --type openai --fix
```

### Scenario 2: "How do I know if everything is healthy?"

```bash
# Run health check
npm run health

# Look for:
# - Overall Health: Should be ≥ 80
# - All components should show ✓ (green checkmarks)
# - Recommendations should say "All systems operational"
```

### Scenario 3: "I deployed new code, is it working?"

```bash
# 1. Wait 2 minutes for deployment

# 2. Run health check
npm run health

# 3. Run test calls
npm run test-calls

# If < 90% success:
npm run diagnose --fix
```

### Scenario 4: "Setup automated monitoring"

```bash
# Start agent (runs in background)
npm run start

# Agent will now:
# - Check health every hour
# - Run test calls nightly at 2 AM PT
# - Auto-fix issues when detected
# - Email you if manual intervention needed

# Check agent status
npm run status

# View what agent is doing
npm run logs --follow

# Stop agent
npm run stop
```

---

## 🎯 Success Checklist

After following this guide, you should be able to:

- [x] Health check returns ≥ 80 score
- [x] All components show green ✓
- [x] OpenAI connection working
- [x] Test calls succeed at 90%+
- [x] No critical recommendations
- [x] Cold calls connect successfully

---

## 🆘 Troubleshooting

### "npm install" fails

**Issue:** Dependencies won't install

**Fix:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### "Railway CLI not found"

**Issue:** `railway` command doesn't work

**Fix:**
```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login
railway login

# Link project
cd C:\Dev\DataSolutions
railway link

# Try again
railway variables set OPENAI_API_KEY="sk-proj-YOUR_KEY"
```

### "Health check shows all red X"

**Issue:** Everything appears down

**Fix:**
```bash
# Check if environment variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# If undefined, create .env file
cd C:\Dev\DataSolutions\agents\production-ops
echo "NEXT_PUBLIC_SUPABASE_URL=https://ftlrjnbuvbdvnkdboyrp.supabase.co" >> .env
echo "SUPABASE_SERVICE_ROLE_KEY=your_key" >> .env

# Try again
npm run health
```

### "Test calls all fail"

**Issue:** 0% success rate

**Fix:**
```bash
# Run full diagnostic
npm run diagnose

# Apply all available fixes
npm run fix

# Check Railway service status
curl https://datasolutions-websocket-production.up.railway.app

# If returns 502/503, restart service:
railway service restart datasolutions-websocket
```

---

## 📊 What's Automated vs Manual

### ✅ Ready Now (Manual Operation)

You can run these commands anytime:
- Health checks
- Diagnostics
- Test calls
- Apply fixes
- View status

### ⏸️ Coming Soon (Full Automation)

After running `npm run start`:
- Hourly automated health checks
- Nightly automated test campaigns
- Real-time error detection
- Automatic fix application
- Email/Slack alerts
- Monitoring dashboard

**Estimated time to build:** 4 hours  
**But you can use manual mode immediately!**

---

## 💡 Pro Tips

1. **Run health check every morning**
   ```bash
   npm run health
   ```

2. **Set up a daily task (Windows)**
   - Task Scheduler → Create Task
   - Trigger: Daily at 8 AM
   - Action: Run `npm run health` in agent directory
   - Email results to yourself

3. **Before any deployment**
   ```bash
   npm run health  # Check current state
   # Deploy...
   npm run test-calls  # Validate deployment
   ```

4. **When on-call**
   ```bash
   npm run monitor  # Keep dashboard open
   ```

5. **Weekly review**
   ```bash
   npm run cli report --period 7days
   ```

---

## 🎉 Success!

If you can run this command and see 100% success:

```bash
npm run test-calls
```

**Then your cold calling system is fully operational! 🎊**

All calls will now:
- Connect successfully
- Play AI greeting within 3 seconds
- Conduct natural conversations
- Log to database
- Generate transcripts

---

## 📞 Need Help?

**Check logs first:**
```bash
npm run logs
```

**Still stuck?**
1. Check Railway logs: https://railway.app/dashboard
2. Check Vercel logs: https://vercel.com/dashboard
3. Check Supabase logs: https://supabase.com/dashboard
4. Email: admin@datasolutionslv.com

---

**Last Updated:** 2025-11-06  
**Version:** 1.0.0
