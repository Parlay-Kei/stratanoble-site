# Edge Crypto Fix - Web Crypto API Migration

**Date**: January 2, 2026  
**Issue**: Node `crypto` module not available in Edge/middleware runtime  
**Fix**: Replaced with Web Crypto API (`globalThis.crypto.subtle.digest`)

## Changes Made

### File: `apps/website/src/lib/rate-limit-buckets.ts`

**Before** (Node-only):
```typescript
import { createHash } from 'crypto';

const uaHash = createHash('sha256')
  .update(userAgent.toLowerCase())
  .digest('hex')
  .slice(0, 8);
```

**After** (Edge-safe):
```typescript
async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

const uaHash = await hashString(userAgent.toLowerCase());
key = `${key}:${uaHash.slice(0, 8)}`;
```

## Impact

- ✅ Removed Node `crypto` import (Edge-incompatible)
- ✅ Uses `globalThis.crypto.subtle.digest` (Edge-safe)
- ✅ Made `generateRateLimitKey` async to support Web Crypto API
- ✅ Updated `rateLimit` function to await key generation

## Verification

After deploy:
- [ ] Check build logs for crypto warnings (should be gone)
- [ ] Verify rate limiting still works correctly
- [ ] Test user agent hashing (optional feature)
