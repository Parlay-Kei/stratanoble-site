# Infrastructure Deployment Service

**Type**: Service (V2)
**Operator**: Platform Ops Lead

---

## Purpose

Deploy runbook and rollback steps.

## Environments

| Env | Purpose | Auto-deploy |
|-----|---------|-------------|
| Development | Feature work | On PR |
| Staging | Pre-prod testing | On merge to develop |
| Production | Live | Manual trigger |

## Deployment Commands

```bash
# Deploy to staging
vercel --env staging

# Deploy to production
vercel --prod

# Check deployment status
vercel ls
```

## Pre-Deploy Checklist

- [ ] Tests passing
- [ ] QA Gatekeeper approval
- [ ] No P0/P1 bugs open
- [ ] Rollback plan documented
- [ ] Monitoring ready

## Deploy Process

```
1. Verify pre-deploy checklist
2. Announce in #deploys
3. Execute deployment
4. Verify health checks
5. Monitor for 15 minutes
6. Confirm success or rollback
```

## Rollback

```bash
# Immediate rollback to previous
vercel rollback

# Rollback to specific deployment
vercel rollback [deployment-id]
```

## Rollback Triggers

- Error rate >1%
- P95 latency >2x baseline
- Health check failures
- Critical bug discovered

## Monitoring Post-Deploy

| Metric | Check At |
|--------|----------|
| Error rate | 1min, 5min, 15min |
| Latency | 1min, 5min, 15min |
| Throughput | 5min |
| Business metrics | 15min |

## Incidents

| Issue | Resolution |
|-------|------------|
| Deploy fails | Check build logs, fix, retry |
| Slow rollout | Check Vercel status |
| Health check fails | Rollback immediately |
