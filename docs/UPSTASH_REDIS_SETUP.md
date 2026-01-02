# Upstash Redis Setup for Rate Limiting

## Overview

Rate limiting is currently implemented but requires Upstash Redis to be active in production. Without it, the system gracefully degrades (allows all requests), but this is a security risk for public endpoints.

## Setup Steps

### 1. Create Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up or log in
3. Click **"Create Database"**
4. Choose:
   - **Type**: Redis
   - **Region**: Select closest to your Netlify deployment region (typically US East or US West)
   - **REST API**: **Enable** (required for serverless/edge functions)
   - **Plan**: Free tier is sufficient for rate limiting (10,000 commands/day)

5. Click **"Create"**

### 2. Get Credentials

After creation, you'll see:
- **UPSTASH_REDIS_REST_URL**: `https://your-db-name.upstash.io`
- **UPSTASH_REDIS_REST_TOKEN**: A long token string

Copy both values.

### 3. Add to Netlify Environment Variables

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **"Add variable"**
4. Add:
   - **Key**: `UPSTASH_REDIS_REST_URL`
   - **Value**: (paste the URL from Upstash - **no quotes**, just the URL like `https://your-db-name.upstash.io`)
   - **Scopes**: Production, Branch deploys, Deploy previews (or just Production if preferred)
5. Click **"Add variable"** again
6. Add:
   - **Key**: `UPSTASH_REDIS_REST_TOKEN`
   - **Value**: (paste the token from Upstash - **no quotes**, just the token string)
   - **Scopes**: Same as above

**Important**: Do NOT include quotes around the values. Enter the URL and token as plain text only.

### 4. Trigger New Deploy

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Or push a commit to trigger automatic deploy

### 5. Verify Rate Limiting is Active

After deployment:

1. Check build logs for the security warning:
   ```
   [SECURITY WARNING] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured in production. Rate limiting is DISABLED.
   ```
   This should **NOT** appear if setup is correct.

2. Test an API endpoint:
   ```bash
   curl -I https://stratanoble.com/api/health
   ```
   Check response headers for:
   - `X-RateLimit-Limit`
   - `X-RateLimit-Remaining`
   - `X-RateLimit-Reset`

   If these headers are present, rate limiting is active.

## Rate Limiting Configuration

Current limits (configured in `apps/website/src/middleware.ts`):

- **General API**: 100 requests per 10 minutes per IP
- **Authentication**: 20 requests per 15 minutes per IP
- **Payment/Checkout**: 50 requests per 5 minutes per IP
- **Contact Forms**: 10 requests per 10 minutes per IP

These can be adjusted via environment variables:
- `RATE_LIMIT_GENERAL_REQUESTS` (default: 100)
- `RATE_LIMIT_AUTH_REQUESTS` (default: 20)
- `RATE_LIMIT_PAYMENT_REQUESTS` (default: 50)
- `RATE_LIMIT_CONTACT_REQUESTS` (default: 10)

## Fallback Behavior

If Upstash is not configured:
- **Development**: Requests pass through (expected)
- **Production**: Requests pass through but security warning is logged

For production, you should either:
1. Set up Upstash (recommended)
2. Implement a hard fallback (e.g., basic captcha for contact forms)

## Troubleshooting

### Rate limiting not working

1. Verify environment variables are set in Netlify
2. Check build logs for errors
3. Verify Upstash database is active (not paused)
4. Test with curl to see rate limit headers

### "Too many requests" errors

- This is expected behavior when limits are exceeded
- Wait for the reset window (check `X-RateLimit-Reset` header)
- Or adjust limits via environment variables

### Upstash free tier limits

- Free tier: 10,000 commands/day
- For high-traffic sites, consider upgrading to paid tier
- Monitor usage in Upstash dashboard

## Cost

- **Free tier**: 10,000 commands/day (sufficient for most sites)
- **Paid tier**: Starts at $0.20 per 100K commands
- Rate limiting uses minimal commands (1-2 per request)

## Security Notes

- Never commit Upstash credentials to git
- Use Netlify environment variables only
- Rotate tokens if exposed
- Monitor Upstash dashboard for unusual activity
