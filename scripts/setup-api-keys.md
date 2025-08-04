# API Keys Setup Guide

## 1. YouTube Data API v3

### Get Your API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing one
3. Enable YouTube Data API v3
4. Go to Credentials → Create Credentials → API Key
5. Restrict the key to YouTube Data API v3

### Add to Supabase:
1. Go to: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/settings/vault
2. Click "New Secret"
3. Name: `YOUTUBE_API_KEY`
4. Value: Your API key (starts with `AIza...`)

## 2. TikTok for Business API (Optional)

### Get Your Access Token:
1. Go to [TikTok for Business](https://business.tiktok.com/portal/docs)
2. Create app and get OAuth credentials
3. Generate access token for your account

### Add to Supabase:
1. Same vault location as above
2. Name: `TIKTOK_ACCESS_TOKEN`
3. Value: Your access token

## 3. Test the Setup

After adding keys, test with:

```bash
# Test fetch-metrics function
curl -X POST https://bvneqoevtwodyfqglpzi.supabase.co/functions/v1/fetch-metrics \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"

# Check if data appeared  
node scripts/check-metrics-data.js
```

## 4. Quota Management

YouTube has daily quota limits:
- 10,000 units per day (default)
- 1 channel request = ~3 units
- 50 clients = ~150 units per run
- 4 runs per day = 600 units total

**Safe for ~50 clients initially**