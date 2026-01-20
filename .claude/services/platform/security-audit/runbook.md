# Security Audit Service

**Type**: Service (V6)
**Operator**: Platform Ops Lead

---

## Purpose

Security checks, access reviews, incident hooks.

## Audit Schedule

| Audit | Frequency | Owner |
|-------|-----------|-------|
| Dependency scan | Daily (CI) | Automated |
| Access review | Monthly | Platform Ops |
| Penetration test | Quarterly | External |
| SOC 2 prep | Ongoing | Legal Ops |

## Security Scans

```bash
# Dependency vulnerabilities
npm audit

# More thorough scan
npx snyk test

# SAST scan
npx eslint --ext .ts,.tsx src/
```

## Vulnerability Severity

| Severity | Response Time | Action |
|----------|---------------|--------|
| Critical | Immediate | Stop work, fix |
| High | 24 hours | Prioritize fix |
| Medium | 1 week | Plan fix |
| Low | Next sprint | Backlog |

## Access Review Checklist

- [ ] Review all admin accounts
- [ ] Verify MFA enabled
- [ ] Check for orphaned accounts
- [ ] Audit API key usage
- [ ] Review third-party access

## OWASP Top 10 Checks

| Vulnerability | Check |
|---------------|-------|
| Injection | Input validation |
| Broken Auth | Session management |
| Sensitive Data | Encryption at rest/transit |
| XXE | XML parsing disabled |
| Broken Access | RLS policies |
| Misconfig | Security headers |
| XSS | Output encoding |
| Deserialization | Input validation |
| Components | Dependency scan |
| Logging | Audit trail |

## Incident Response

```
1. Identify and contain
2. Assess impact
3. Notify stakeholders (Legal Ops if breach)
4. Remediate
5. Document and learn
```

## Incidents

| Issue | Resolution |
|-------|------------|
| Vuln discovered | Assess, prioritize, fix |
| Access abuse | Revoke, investigate |
| Data exposure | Contain, notify, remediate |
