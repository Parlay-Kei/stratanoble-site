# Deployment Operations Skill

**Purpose:** Manage deployments across Vercel, Railway, and Supabase  
**Version:** 1.0.0  
**Created:** 2025-11-06

---

## What This Skill Does

This skill provides comprehensive deployment management for the DataSolutions platform, including:

- **Pre-Deployment Validation:** Automated checks before deploying
- **Staged Rollouts:** Deploy to staging → validate → promote to production
- **Rollback Management:** Instant rollback on failures
- **Deployment Monitoring:** Real-time health monitoring post-deployment
- **Zero-Downtime Deployments:** Blue-green deployment strategies

---

## When to Use This Skill

Use this skill when you need to:

- ✅ Deploy new code to production safely
- ✅ Validate deployments before promoting
- ✅ Roll back failed deployments
- ✅ Monitor deployment health
- ✅ Manage environment-specific configurations
- ✅ Coordinate multi-service deployments

---

## Key Capabilities

### 1. Pre-Deployment Validation

**Run Pre-Deployment Checklist:**
```typescript
const validation = await validatePreDeployment();

// Returns:
{
  passed: true,
  checks: {
    testsPass: true,
    envVarsValid: true,
    dependenciesUpdated: true,
    noBreakingChanges: true,
    securityAuditPass: true
  },
  blockers: [],
  warnings: ['Minor version bump in openai package']
}
```

**Validate Environment Variables:**
```typescript
const envCheck = await validateEnvironmentVariables();

// Returns:
{
  vercel: { complete: true, missing: [] },
  railway: { complete: false, missing: ['OPENAI_API_KEY'] },
  supabase: { complete: true, missing: [] },
  recommendation: 'Set OPENAI_API_KEY in Railway before deploying'
}
```

### 2. Deployment Execution

**Deploy to Staging:**
```typescript
const staging = await deployToStaging({
  branch: 'main',
  runTests: true,
  skipCache: false
});

// Returns:
{
  deploymentId: 'dep_staging_xyz',
  url: 'https://datasolutions-staging.vercel.app',
  status: 'ready',
  buildTime: 47,  // seconds
  checks: {
    build: 'passed',
    tests: 'passed',
    lint: 'passed'
  }
}
```

**Deploy to Production:**
```typescript
const production = await deployToProduction({
  promoteStagingDeployment: true,
  runSmokeTests: true,
  monitoringDuration: 3600  // 1 hour
});

// Returns:
{
  deploymentId: 'dep_prod_abc',
  url: 'https://www.datasolutionslv.com',
  status: 'ready',
  previousDeployment: 'dep_prod_xyz',  // For rollback
  monitoringActive: true
}
```

**Deploy Railway Service:**
```typescript
const railway = await deployRailwayService({
  service: 'datasolutions-websocket',
  environment: 'production',
  healthCheckTimeout: 60
});

// Returns:
{
  deploymentId: 'rail_dep_123',
  status: 'running',
  url: 'https://datasolutions-websocket-production.up.railway.app',
  healthCheck: 'passed',
  environmentVars: 'verified'
}
```

### 3. Deployment Monitoring

**Monitor Post-Deployment Health:**
```typescript
const monitoring = await monitorDeployment({
  deploymentId: 'dep_prod_abc',
  duration: 3600000,  // 1 hour
  metrics: ['errorRate', 'responseTime', 'callSuccessRate']
});

// Returns (streaming updates):
{
  timestamp: '2025-11-06T14:30:00Z',
  errorRate: 0.5,  // 0.5% - within threshold
  responseTime: 145,  // ms - good
  callSuccessRate: 96,  // % - excellent
  status: 'healthy',
  alerts: []
}
```

**Run Smoke Tests:**
```typescript
const smokeTests = await runSmokeTests({
  environment: 'production',
  tests: ['health', 'callFlow', 'database', 'apiEndpoints']
});

// Returns:
{
  passed: 4,
  failed: 0,
  results: {
    health: { passed: true, time: 120 },
    callFlow: { passed: true, time: 3450 },
    database: { passed: true, time: 230 },
    apiEndpoints: { passed: true, time: 890 }
  },
  overallStatus: 'pass'
}
```

### 4. Rollback Management

**Rollback to Previous Deployment:**
```typescript
const rollback = await rollbackDeployment({
  platform: 'vercel',
  toPreviousDeployment: true,
  reason: 'High error rate detected'
});

// Returns:
{
  rolledBack: true,
  fromDeployment: 'dep_prod_abc',
  toDeployment: 'dep_prod_xyz',
  downtime: 12,  // seconds
  validated: true,
  rollbackTime: '2025-11-06T14:35:22Z'
}
```

**Rollback Railway Service:**
```typescript
const railwayRollback = await rollbackRailwayService({
  service: 'datasolutions-websocket',
  toVersion: 'previous'
});

// Returns:
{
  rolledBack: true,
  fromVersion: 'v1.2.5',
  toVersion: 'v1.2.4',
  serviceRestarted: true,
  healthCheckPassed: true
}
```

### 5. Deployment Reports

**Generate Deployment Report:**
```typescript
const report = await generateDeploymentReport({
  deploymentId: 'dep_prod_abc',
  includeMetrics: true,
  includeTests: true
});

// Returns:
{
  deployment: {
    id: 'dep_prod_abc',
    timestamp: '2025-11-06T14:00:00Z',
    duration: 47,  // seconds
    initiatedBy: 'production-ops-agent',
    branch: 'main',
    commit: 'abc123def'
  },
  validation: {
    preDeploymentChecks: 'passed',
    smokeTests: 'passed',
    postDeploymentMonitoring: 'passed'
  },
  metrics: {
    errorRate: { before: 1.2, after: 0.4, improvement: 67 },
    responseTime: { before: 210, after: 145, improvement: 31 },
    callSuccessRate: { before: 94, after: 96, improvement: 2 }
  },
  recommendation: 'Deployment successful, no issues detected'
}
```

---

## Common Workflows

### Workflow 1: Standard Production Deployment

```typescript
// 1. Validate pre-deployment
const preCheck = await validatePreDeployment();
if (!preCheck.passed) {
  throw new Error(`Deployment blocked: ${preCheck.blockers.join(', ')}`);
}

// 2. Deploy to staging
const staging = await deployToStaging();

// 3. Run smoke tests in staging
const stagingSmokeTests = await runSmokeTests({ environment: 'staging' });
if (stagingSmokeTests.failed > 0) {
  throw new Error('Staging smoke tests failed');
}

// 4. Promote to production
const production = await deployToProduction({
  promoteStagingDeployment: true
});

// 5. Monitor for 1 hour
const monitoring = startDeploymentMonitoring({
  deploymentId: production.deploymentId,
  duration: 3600000
});

// 6. Run production smoke tests
const prodSmokeTests = await runSmokeTests({ environment: 'production' });

// 7. Validate success
if (prodSmokeTests.failed > 0 || monitoring.errorRate > 5) {
  await rollbackDeployment({ reason: 'Failed validation' });
  throw new Error('Deployment failed validation, rolled back');
}

// 8. Generate report
const report = await generateDeploymentReport({
  deploymentId: production.deploymentId,
  includeMetrics: true
});

console.log('✅ Deployment successful!', report);
```

### Workflow 2: Emergency Hotfix

```typescript
// 1. Skip full validation (emergency)
console.log('⚠️ Emergency hotfix deployment');

// 2. Deploy immediately
const hotfix = await deployToProduction({
  branch: 'hotfix/critical-fix',
  skipStagingValidation: true
});

// 3. Monitor aggressively (every 10 seconds)
const monitoring = startDeploymentMonitoring({
  deploymentId: hotfix.deploymentId,
  duration: 600000,  // 10 minutes
  checkInterval: 10000  // 10 seconds
});

// 4. Run critical tests only
const criticalTests = await runSmokeTests({
  environment: 'production',
  tests: ['health', 'callFlow']  // Only critical tests
});

// 5. If any issue, rollback immediately
monitoring.on('alert', async (alert) => {
  console.log('🚨 Alert detected during hotfix:', alert);
  await rollbackDeployment({ reason: `Hotfix failed: ${alert.reason}` });
});

// 6. Document hotfix
await logIncident({
  type: 'emergency_hotfix',
  deployment: hotfix.deploymentId,
  reason: 'Critical production issue',
  outcome: monitoring.status
});
```

### Workflow 3: Blue-Green Deployment

```typescript
// 1. Deploy to "green" environment (new version)
const green = await deployToEnvironment({
  environment: 'green',
  branch: 'main'
});

// 2. Validate green environment
const greenValidation = await runSmokeTests({ environment: 'green' });
if (greenValidation.failed > 0) {
  throw new Error('Green environment validation failed');
}

// 3. Switch traffic gradually (10% → 50% → 100%)
await switchTraffic({ to: 'green', percentage: 10 });
await wait(300000);  // 5 min

const metrics10 = await collectMetrics({ environment: 'green' });
if (metrics10.errorRate > 5) {
  await switchTraffic({ to: 'blue', percentage: 100 });
  throw new Error('Green environment showing errors at 10% traffic');
}

await switchTraffic({ to: 'green', percentage: 50 });
await wait(600000);  // 10 min

const metrics50 = await collectMetrics({ environment: 'green' });
if (metrics50.errorRate > 5) {
  await switchTraffic({ to: 'blue', percentage: 100 });
  throw new Error('Green environment showing errors at 50% traffic');
}

// 4. Full cutover
await switchTraffic({ to: 'green', percentage: 100 });

// 5. Monitor for 1 hour
await monitorDeployment({
  environment: 'green',
  duration: 3600000
});

// 6. Decommission blue (old version)
await decommissionEnvironment({ environment: 'blue' });

console.log('✅ Blue-green deployment complete');
```

---

## Integration Points

### Vercel API
- Deploy: `POST /deployments`
- Get deployment: `GET /deployments/{id}`
- List deployments: `GET /deployments`
- Promote: `POST /deployments/{id}/promote`
- Environment vars: `GET/POST /projects/{id}/env`

### Railway API
- Deploy: `POST /services/{id}/deploy`
- Get deployment: `GET /deployments/{id}`
- Rollback: `POST /services/{id}/rollback`
- Logs: `GET /services/{id}/logs`

### GitHub API (optional)
- Get commit: `GET /repos/{owner}/{repo}/commits/{sha}`
- Create deployment: `POST /repos/{owner}/{repo}/deployments`
- Deployment status: `POST /repos/{owner}/{repo}/deployments/{id}/statuses`

---

## Error Handling

### Common Deployment Errors

**Error: "Build failed"**
- Check build logs
- Validate dependencies
- Fix linting errors
- Retry deployment

**Error: "Environment variables missing"**
- Run `validateEnvironmentVariables()`
- Set missing variables
- Redeploy

**Error: "Health check failed"**
- Check service logs
- Run diagnostics
- Fix issues
- Redeploy

**Error: "Smoke tests failed"**
- Review test failures
- Fix broken functionality
- Rollback if critical
- Redeploy after fix

---

## Best Practices

1. **Always validate before deploying**
2. **Deploy to staging first**
3. **Run smoke tests in staging**
4. **Monitor post-deployment for at least 1 hour**
5. **Keep previous deployment ID for quick rollback**
6. **Document all deployments**
7. **Use blue-green for major releases**
8. **Use hotfix process only for emergencies**
9. **Never deploy on Fridays (unless emergency)**
10. **Always have rollback plan ready**

---

## Quick Reference

```bash
# CLI Commands
ops-cli deploy validate             # Pre-deployment validation
ops-cli deploy staging              # Deploy to staging
ops-cli deploy production           # Deploy to production
ops-cli deploy rollback             # Rollback last deployment
ops-cli deploy status               # Check deployment status
ops-cli deploy monitor              # Monitor current deployment

# MCP Functions
validate_pre_deployment()           # Pre-checks
deploy_to_staging()                 # Stage deploy
deploy_to_production()              # Prod deploy
rollback_deployment()               # Rollback
monitor_deployment(id)              # Monitor
generate_deployment_report(id)      # Report
```

---

**Last Updated:** 2025-11-06  
**Maintained By:** Production Ops Team
