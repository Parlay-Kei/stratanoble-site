# Session Revocation Semantics

## Current Implementation: Level A

Strata Noble implements **Level A revocation**, which is consistent with Supabase's authentication model.

### What happens on logout

1. **`signOut({ scope: 'global' })` is called**
   - All refresh tokens for the user are revoked immediately
   - This affects all devices/sessions

2. **Auth cookies are cleared**
   - All `sb-*-auth-token` cookies
   - `auth-session` indicator cookie
   - Cleared with `maxAge: 0`

3. **Access JWT remains valid until expiry**
   - This is by design (stateless JWT auth)
   - Cannot be revoked without server-side checks
   - Mitigated by short JWT expiry (recommended: 15 minutes)

### Multi-session behavior

```
Scenario:
1. User logs in on Device A (Session A, refresh token RA)
2. User logs in on Device B (Session B, refresh token RB)
3. User logs out on Device A with scope: 'global'

Result:
- RA is revoked immediately ✓
- RB is revoked immediately ✓
- Device A is logged out (cookies cleared) ✓
- Device B's access JWT still works until exp ⚠️
- Device B fails to refresh when JWT expires ✓
- Device B is then functionally logged out ✓
```

### JWT Expiry Configuration

**Recommendation**: Set JWT expiry to 15 minutes in Supabase Dashboard:
- Auth → Settings → JWT expiry limit

This minimizes the window where a revoked user can still access the system.

---

## Level B (Not Implemented)

Level B provides **immediate revocation** at the cost of a database lookup per request.

### When to implement Level B

- Payment processing
- Admin/elevated actions
- Account takeover recovery
- "Delete everything" operations

### How Level B works

1. Store `revoked_at` timestamp per user in database
2. On every authenticated request:
   - Extract `iat` (issued-at) from JWT
   - Query: `iat >= user.revoked_at`
   - Reject if token was issued before revocation
3. On logout: `UPDATE users SET revoked_at = NOW()`

### Trade-offs

| Aspect | Level A | Level B |
|--------|---------|---------|
| Revocation | Eventual (JWT expiry) | Immediate |
| Latency | None | +1 DB query/request |
| Complexity | Low | Medium |
| Supabase native | Yes | Requires custom middleware |

---

## Implementation Details

### Logout route: `/api/auth/logout`

```typescript
// Uses global scope to revoke all sessions
await supabase.auth.signOut({ scope: 'global' });
```

### Response includes honest note

```json
{
  "success": true,
  "message": "Logged out successfully",
  "note": "Refresh tokens revoked. Access token valid until expiry."
}
```

---

## References

- [Supabase Auth signOut](https://supabase.com/docs/reference/javascript/auth-signout)
- [Supabase JWT Configuration](https://supabase.com/docs/guides/auth/sessions)
