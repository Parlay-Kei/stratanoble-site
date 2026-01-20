# Checkr Verification Service

**Type**: Service (V11)
**Operator**: Direct Cuts GM

---

## Purpose

Background check integration for barbers.

## Process Flow

```
1. Barber applies
2. Collect consent
3. Submit to Checkr API
4. Receive webhook updates
5. Process result
6. Update barber status
```

## Checkr API

### Submit Check
```bash
POST https://api.checkr.com/v1/candidates
{
  "first_name": "...",
  "last_name": "...",
  "email": "...",
  "ssn": "...",  # Encrypted
  "package": "driver_standard"
}
```

### Webhook Events
| Event | Action |
|-------|--------|
| report.completed | Process result |
| report.suspended | Review needed |
| report.adverse_action | Compliance flow |

## Status Mapping

| Checkr Status | Barber Status |
|---------------|---------------|
| clear | approved |
| consider | manual_review |
| adverse_action | rejected |
| suspended | pending |

## Compliance

- [ ] Consent collected before check
- [ ] Adverse action process followed
- [ ] Results stored securely
- [ ] Access limited to need-to-know

## Adverse Action Flow

```
1. Pre-adverse action notice (wait 5 days)
2. Review for accuracy
3. Final decision
4. Post-adverse action notice if rejected
```

## Error Handling

| Error | Resolution |
|-------|------------|
| Invalid SSN | Request correction |
| API timeout | Retry with backoff |
| Webhook missed | Poll for status |

## Incidents

| Issue | Resolution |
|-------|------------|
| Slow turnaround | Check Checkr status |
| Wrong result | Dispute with Checkr |
| Data mismatch | Reconcile records |
