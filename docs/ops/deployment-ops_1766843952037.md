# Deployment Operations Skill
**Version**: 1.0
**Last Updated**: November 21, 2025
**Purpose**: Runbooks for deploying DSLV Platform to Vercel and Railway.

---

## Vercel (Frontend & API)

### Overview
Hosting for Next.js application, API routes, and static assets.

### Deployment Steps
1. **Push to Main**: Merging to `main` triggers auto-deployment.
2. **Manual Deploy**: `vercel deploy --prod` (requires Vercel CLI).

### Environment Variables
- Manage in Vercel Dashboard > Settings > Environment Variables.
- Must match `.env.local` (excluding local-only overrides).
- **Critical**: `CRON_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## Railway (WebSocket Server)

### Overview
Hosting for the custom WebSocket server (if separated) or long-running processes.
*Note: Currently, WebSocket is integrated into Next.js, but Railway is used for specific worker tasks or if Vercel functions time out.*

### Deployment Steps
1. **Push to Main**: Connected to GitHub repo.
2. **Verify Health**: Check Dashboard for "Active" status.

### Environment Variables
- **Required**:
  - `OPENAI_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PORT` (usually provided by Railway)

---

## Database Migrations

### Supabase
1. **Local**: `supabase migration new <name>`
2. **Deploy**: `npm run db:deploy` (pushes to remote Supabase).
3. **Verify**: Check Supabase Dashboard > Table Editor.

---

## Post-Deployment Verification
1. **Health Check**: Visit `/api/health` (if implemented) or check logs.
2. **Test Call**: Make a test call to verify Voice AI.
3. **Cron Jobs**: Verify Vercel Cron jobs are scheduled.
