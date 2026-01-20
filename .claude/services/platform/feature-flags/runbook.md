# Feature Flags Service

**Type**: Service (V1)
**Operator**: Platform Ops Lead

---

## Purpose

Flag configuration and rollout controls.

## Configuration

| Flag Type | Use Case |
|-----------|----------|
| Boolean | On/off features |
| Percentage | Gradual rollout |
| User segment | Targeted features |

## Creating a Flag

```bash
# Create boolean flag
anx flags create --name "new-checkout" --type boolean --default false

# Create percentage flag
anx flags create --name "new-checkout" --type percentage --value 10
```

## Rollout Process

```
1. Create flag (default: off)
2. Deploy code with flag checks
3. Enable for internal (100% internal)
4. Enable 5% external
5. Monitor metrics
6. Increase to 25%, 50%, 100%
7. Remove flag after 30 days at 100%
```

## Rollback

```bash
# Immediate disable
anx flags disable "new-checkout"

# This is instant, no deploy needed
```

## Monitoring

| Metric | Alert Threshold |
|--------|-----------------|
| Error rate | >1% delta |
| Latency | >10% increase |
| Conversion | >5% decrease |

## Cleanup Policy

- Flags at 100% for 30 days → Remove
- Flags at 0% for 30 days → Remove
- Maximum flag age: 90 days

## Incidents

| Issue | Resolution |
|-------|------------|
| Flag not updating | Check cache TTL |
| Inconsistent behavior | Verify flag logic |
| Performance impact | Check flag fetch frequency |
