# Prompt Loader Service

**Type**: Service (V8)
**Operator**: Platform Ops Lead

---

## Purpose

Prompt registry and runtime loading.

## Prompt Structure

```
agents/
└── [agent]/
    └── prompt.md    # System prompt
```

## Loading Process

```
1. Agent invoked
2. Load prompt.md from agent folder
3. Inject context (date, user, etc.)
4. Send to model
```

## Prompt Registry

| Agent | Prompt Location |
|-------|-----------------|
| OCS | agents/ocs/prompt.md |
| QA Gatekeeper | agents/qa-gatekeeper/prompt.md |
| CFO | agents/cfo/prompt.md |
| ... | ... |

## Context Injection

| Variable | Value |
|----------|-------|
| {{DATE}} | Current date |
| {{USER}} | Requesting user |
| {{VENTURE}} | Active venture |

## Prompt Updates

```
1. Edit prompt.md
2. Test in development
3. Review with agent owner
4. Deploy
5. Monitor for regressions
```

## Version Control

- All prompts in Git
- Changes via PR
- Rollback via Git revert

## Performance

| Metric | Target |
|--------|--------|
| Load time | <100ms |
| Cache hit rate | >95% |

## Incidents

| Issue | Resolution |
|-------|------------|
| Prompt not loading | Check file path, permissions |
| Wrong context | Verify injection logic |
| Performance slow | Check cache, optimize |
