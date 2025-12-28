# Environment Operations Skill
**Version**: 1.0
**Last Updated**: November 21, 2025
**Purpose**: Reference for all environment variables and configuration secrets.

---

## Critical Secrets (Do Not Commit)

| Variable | Description | Required In |
|----------|-------------|-------------|
| `CRON_SECRET` | Secures cron endpoints | Vercel, .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin access to DB | Vercel, Railway, .env.local |
| `OPENAI_API_KEY` | Access to OpenAI Realtime API | Vercel, Railway, .env.local |
| `TWILIO_AUTH_TOKEN` | Twilio API authentication | Vercel, .env.local |
| `VERCEL_TOKEN` | Vercel API access (MCP) | mcp.json (or env) |

---

## Public Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public client key | - |
| `NEXT_PUBLIC_APP_URL` | Frontend base URL | https://datasolutionslv.com |

---

## Feature Flags

| Variable | Description | Default |
|----------|-------------|---------|
| `SKIP_SIGNATURE_VERIFICATION` | Skip Twilio sig check | false (true in dev) |
| `ENABLE_DEBUG_LOGGING` | Verbose logs | false |

---

## Setup Guide

### Local Development
1. Copy `.env.example` to `.env.local`.
2. Fill in secrets from 1Password/Vault.
3. Run `npm run dev`.

### Production
1. Add all variables to Vercel Project Settings.
2. Add relevant variables to Railway Project Settings.
