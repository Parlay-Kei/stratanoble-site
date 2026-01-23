# Cold Calling Operations Skill

**Purpose:** Manage and operate the DataSolutions cold calling system  
**Version:** 1.0.0  
**Created:** 2025-11-06

---

## What This Skill Does

This skill provides comprehensive operations management for the DataSolutions cold calling system, including:

- **Health Monitoring:** Real-time health checks of all calling infrastructure
- **Issue Detection:** Automatic detection of calling failures and performance degradation
- **Remediation:** Automated fixes for common cold calling issues
- **Call Testing:** Automated test call campaigns to validate system health
- **Reporting:** Detailed call performance analytics and reporting

---

## When to Use This Skill

Use this skill when you need to:

- ✅ Check the health of the cold calling system
- ✅ Diagnose why calls are failing or disconnecting
- ✅ Fix common cold calling issues (OpenAI connection, Twilio webhooks, etc.)
- ✅ Run test calls to validate system functionality
- ✅ Generate call performance reports
- ✅ Monitor call success rates and quality metrics

---

## Key Capabilities

### 1. Health Monitoring

**Check Overall System Health:**
```typescript
// Comprehensive health check of all components
const health = await checkColdCallingHealth();

// Returns:
{
  overall: 85,  // Health score 0-100
  railway: { healthy: true, responseTime: 120 },
  openai: { healthy: true, canConnect: true },
  twilio: { healthy: true, webhookConfigured: true },
  supabase: { healthy: true, callLogsAccessible: true }
}
```

**Monitor Call Success Rates:**
```typescript
// Get real-time call metrics
const metrics = await getCallMetrics();

// Returns:
{
  successRate: 94.5,  // Percentage
  avgDuration: 182,   // Seconds
  failureRate: 5.5,
  lastHourCalls: 47,
  errors: ['openai_timeout: 2', 'twilio_busy: 1']
}
```

### 2. Issue Diagnosis

**Diagnose OpenAI Connection Issues:**
```typescript
// Test OpenAI Realtime API connectivity
const diagnosis = await diagnoseOpenAI();

// Returns:
{
  canConnect: false,
  error: 'OPENAI_API_KEY not configured in Railway',
  suggestedFix: 'Set environment variable in Railway dashboard',
  urgency: 'critical'
}
```

**Diagnose Twilio Webhook Configuration:**
```typescript
// Validate Twilio webhook setup
const webhookStatus = await diagnoseTwilioWebhook();

// Returns:
{
  configured: true,
  url: 'https://www.datasolutionslv.com/api/voice/twiml',
  reachable: true,
  respondsWithTwiML: true
}
```

**Diagnose Railway WebSocket Server:**
```typescript
// Check Railway WebSocket server health
const railwayStatus = await diagnoseRailway();

// Returns:
{
  serverRunning: true,
  httpStatus: 200,
  websocketAccessible: true,
  environmentVarsPresent: true,
  issues: []
}
```

### 3. Automated Fixes

**Fix Missing Environment Variables:**
```typescript
// Automatically detect and set missing env vars
const fix = await fixMissingEnvVars();

// Returns:
{
  fixed: ['OPENAI_API_KEY'],
  verified: true,
  requiresRestart: true
}
```

**Restart Unresponsive Services:**
```typescript
// Restart Railway service if unresponsive
const restart = await restartRailwayService();

// Returns:
{
  restarted: true,
  newDeploymentId: 'dep_xyz789',
  healthCheckPassed: true,
  downtime: 45  // seconds
}
```

**Sync Environment Variables:**
```typescript
// Sync env vars across Vercel, Railway, Supabase
const sync = await syncEnvironmentVariables();

// Returns:
{
  synced: {
    vercel: ['OPENAI_API_KEY', 'TWILIO_AUTH_TOKEN'],
    railway: ['OPENAI_API_KEY', 'SUPABASE_URL']
  },
  conflicts: [],
  requiresRedeploy: ['vercel', 'railway']
}
```

### 4. Call Testing

**Run Automated Test Calls:**
```typescript
// Execute test call campaign
const testResults = await runTestCalls({
  count: 10,
  phones: ['+15551234567', '+15559876543'],
  validateGreeting: true,
  validateLogging: true
});

// Returns:
{
  total: 10,
  successful: 9,
  failed: 1,
  successRate: 90,
  failures: [
    { phone: '+15551234567', error: 'OpenAI timeout after 30s' }
  ],
  avgDuration: 45,
  allGreetingsPlayed: true,
  allCallsLogged: true
}
```

**Validate Call Flow End-to-End:**
```typescript
// Simulate complete call flow
const validation = await validateCallFlow();

// Returns:
{
  steps: {
    twilioWebhook: { passed: true, time: 120 },
    railwayConnect: { passed: true, time: 260 },
    openaiGreeting: { passed: true, time: 2800 },
    callLogging: { passed: true, time: 450 }
  },
  overallResult: 'pass',
  totalTime: 3630  // milliseconds
}
```

### 5. Reporting

**Generate Daily Call Report:**
```typescript
// Daily summary of call performance
const report = await generateDailyCallReport();

// Returns:
{
  date: '2025-11-06',
  totalCalls: 247,
  successful: 234,
  failed: 13,
  successRate: 94.7,
  avgDuration: 182,
  topErrors: [
    { type: 'openai_timeout', count: 8 },
    { type: 'twilio_busy', count: 5 }
  ],
  recommendations: [
    'Consider increasing OpenAI timeout threshold',
    'Review call timing to avoid peak busy periods'
  ]
}
```

**Monitor Performance Trends:**
```typescript
// Weekly trend analysis
const trends = await analyzeCallTrends({ days: 7 });

// Returns:
{
  successRateTrend: 'improving',  // +2.3% vs previous week
  durationTrend: 'stable',        // -1.2% (not significant)
  volumeTrend: 'increasing',      // +15.4%
  errorTrend: 'improving',        // -34.5%
  insights: [
    'OpenAI connection issues resolved on Nov 4',
    'Call volume increased after marketing campaign'
  ]
}
```

---

## Common Workflows

### Workflow 1: Morning Health Check

**Use Case:** Daily validation before starting cold calling campaigns

```typescript
// 1. Run comprehensive health check
const health = await checkColdCallingHealth();

// 2. If health score < 80, run diagnostics
if (health.overall < 80) {
  const diagnosis = await runFullDiagnostic();
  
  // 3. Apply automated fixes
  for (const issue of diagnosis.issues) {
    await applyFix(issue.type);
  }
  
  // 4. Validate fixes worked
  const recheck = await checkColdCallingHealth();
  if (recheck.overall < 80) {
    alertHuman('Manual intervention required', recheck);
  }
}

// 5. Run test calls
const testResults = await runTestCalls({ count: 5 });

// 6. Generate report
const report = await generateHealthReport(health, testResults);
```

### Workflow 2: Incident Response

**Use Case:** Automated response to call failures

```typescript
// 1. Detect failure (triggered by monitoring)
const alert = {
  type: 'high_failure_rate',
  successRate: 45,  // < 80% threshold
  timeWindow: '5 minutes'
};

// 2. Run targeted diagnostic
const diagnosis = await diagnoseFa ilurePattern(alert);

// 3. Identify root cause
const rootCause = identifyRootCause(diagnosis);
// Returns: 'openai_connection_failure'

// 4. Execute fix workflow
const fix = await executeFix('openai_connection_failure');

// 5. Validate fix within 2 minutes
await wait(120000);
const validation = await validateCallFlow();

// 6. If not fixed, escalate
if (!validation.overallResult === 'pass') {
  escalateToHuman(rootCause, fix, validation);
}

// 7. Document incident
await logIncident({
  detected: alert.timestamp,
  rootCause: rootCause,
  fix: fix,
  resolution: validation,
  mttr: calculateMTTR(alert.timestamp, validation.timestamp)
});
```

### Workflow 3: Deployment Validation

**Use Case:** Validate production deployment before promoting

```typescript
// 1. Pre-deployment checks
const preChecks = await runPreDeploymentChecks();
if (!preChecks.allPassed) {
  blockDeployment('Pre-checks failed', preChecks.failures);
}

// 2. Deploy to staging
await deployToStaging();

// 3. Run smoke tests in staging
const smokeTests = await runTestCalls({ 
  count: 5, 
  environment: 'staging' 
});
if (smokeTests.successRate < 100) {
  blockDeployment('Smoke tests failed', smokeTests.failures);
}

// 4. Deploy to production
await deployToProduction();

// 5. Monitor for 1 hour
const monitoring = await monitorProduction({ duration: 3600000 });

// 6. Validate 10 production calls
const prodValidation = await runTestCalls({ 
  count: 10, 
  environment: 'production' 
});

// 7. Rollback if issues detected
if (prodValidation.successRate < 90 || monitoring.errorRate > 10) {
  await rollbackDeployment();
  alertHuman('Deployment rolled back', { prodValidation, monitoring });
}

// 8. Generate deployment report
const report = await generateDeploymentReport({
  preChecks,
  smokeTests,
  monitoring,
  prodValidation
});
```

---

## Integration Points

### Railway API
- Health checks: `GET /health`
- Restart service: `POST /services/{id}/restart`
- Environment vars: `GET/POST /services/{id}/variables`
- Logs: `GET /services/{id}/logs`

### Vercel API
- Deployment status: `GET /deployments/{id}`
- Redeploy: `POST /deployments`
- Environment vars: `GET/POST /projects/{id}/env`

### Supabase API
- Call logs: `SELECT * FROM call_logs`
- Metrics: Custom queries for aggregations
- Connection test: `SELECT 1`

### Twilio API
- Webhook config: `GET /PhoneNumbers/{sid}`
- Call logs: `GET /Calls`
- Debugger: `GET /Monitor/Logs`

### OpenAI API
- Realtime connection test: WebSocket to `wss://api.openai.com/v1/realtime`
- API key validation: `GET /models`
- Usage check: `GET /usage`

---

## Error Handling

### Common Errors & Fixes

**Error: "Calls disconnecting immediately"**
- **Diagnosis:** Run `diagnoseOpenAI()`
- **Fix:** `fixMissingEnvVars()` → `restartRailwayService()`
- **Validation:** `runTestCalls({ count: 3 })`

**Error: "WebSocket connection failed"**
- **Diagnosis:** Run `diagnoseRailway()`
- **Fix:** Check Railway service status → `restartRailwayService()`
- **Validation:** `validateCallFlow()`

**Error: "TwiML webhook not responding"**
- **Diagnosis:** Run `diagnoseTwilioWebhook()`
- **Fix:** Check Vercel deployment → `redeployVercel()`
- **Validation:** `curl https://www.datasolutionslv.com/api/voice/twiml`

**Error: "Call logs not saving"**
- **Diagnosis:** Run `diagnoseSupabase()`
- **Fix:** Check Supabase connection → `reconnectSupabase()`
- **Validation:** Query `call_logs` table

---

## Metrics & SLAs

### Key Metrics Tracked
- **Call Success Rate:** Target 95%+
- **Average Call Duration:** Baseline ~180 seconds
- **Response Time:** < 2s for HTTP, < 500ms WebSocket
- **Error Rate:** < 5% of total calls
- **Uptime:** 99.9% (43 min downtime/month max)

### Monitoring Frequency
- **Health Checks:** Every 60 seconds
- **Call Metrics:** Real-time
- **Full Diagnostic:** Every hour
- **Test Calls:** Every 30 minutes (non-production hours)

---

## Best Practices

1. **Always run health check before starting operations**
2. **Run diagnostics before applying fixes**
3. **Validate fixes immediately after applying**
4. **Log all automated actions**
5. **Escalate to human when automation fails**
6. **Generate reports for all incidents**
7. **Run test calls in non-production hours (2-6 AM PT)**
8. **Never apply destructive fixes without validation**

---

## Quick Reference

```bash
# CLI Commands
ops-cli health                    # Health check
ops-cli diagnose --type openai    # Diagnose specific component
ops-cli fix openai-connection     # Apply known fix
ops-cli test --number 10          # Run 10 test calls
ops-cli monitor                   # Real-time monitoring

# MCP Functions
check_cold_calling_health()       # Health check
diagnose_openai()                 # OpenAI diagnostic
fix_missing_env_vars()            # Auto-fix env vars
run_test_calls(count)             # Test calls
generate_daily_report()           # Generate report
```

---

## Support & Documentation

**Related Files:**
- Implementation: `/agents/production-ops/src/`
- Tests: `/agents/production-ops/tests/`
- Runbooks: `/agents/production-ops/runbooks/`

**External Resources:**
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Twilio Docs: https://www.twilio.com/docs
- OpenAI Realtime: https://platform.openai.com/docs/guides/realtime

---

**Last Updated:** 2025-11-06  
**Maintained By:** Production Ops Team
