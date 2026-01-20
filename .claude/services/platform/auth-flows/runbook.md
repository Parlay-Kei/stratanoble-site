# Auth Flows Service

**Type**: Service (V7)
**Operator**: Platform Ops Lead

---

## Purpose

Auth configuration and incident runbook.

## Auth Methods

| Method | Use Case |
|--------|----------|
| Email/Password | Primary |
| Magic Link | Passwordless |
| OAuth (Google) | Social login |
| Phone OTP | Mobile-first |

## Configuration

### JWT Settings
```
Access token: 1 hour
Refresh token: 7 days
Algorithm: RS256
```

### Password Policy
```
Min length: 8
Require uppercase: Yes
Require number: Yes
Max age: None
```

## Auth Flow: Sign Up

```
1. User submits email/password
2. Validate input
3. Check for existing account
4. Create user record
5. Send confirmation email
6. User confirms
7. Account active
```

## Auth Flow: Sign In

```
1. User submits credentials
2. Validate credentials
3. Generate tokens
4. Set session cookie
5. Return user data
```

## Session Management

| Event | Action |
|-------|--------|
| Login | Create session |
| Logout | Invalidate session |
| Token expired | Require re-auth |
| Suspicious activity | Force logout all |

## Common Issues

| Issue | Resolution |
|-------|------------|
| Can't login | Check credentials, reset password |
| Token expired | Refresh or re-login |
| Email not received | Check spam, resend |
| Account locked | Review, unlock if legit |

## Security Measures

- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after 5 failures
- [ ] Audit logging of auth events
- [ ] Session invalidation on password change

## Incidents

| Issue | Resolution |
|-------|------------|
| Mass failed logins | Possible attack, investigate IPs |
| Token leak | Rotate secrets, invalidate sessions |
| Auth bypass | Critical fix, post-mortem |
