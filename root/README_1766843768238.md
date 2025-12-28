# Website App Environment

This app requires environment variables for authentication and optional voice features. Configure them in your deploy platform (e.g., Netlify) and locally via .env.local.

Required (Auth)
- NEXTAUTH_SECRET: random 32‑byte base64 string
- NEXTAUTH_URL: public site URL (e.g., https://stratanoble.com)

Optional (Voice/Twilio)
- TWILIO_ACCOUNT_SID: your Twilio SID (AC…)
- TWILIO_AUTH_TOKEN: your Twilio Auth Token
- TWILIO_PHONE_NUMBER_PRIMARY: E.164 number (e.g., +1XXXXXXXXXX)

Local development
1. Create pps/website/.env.local and set the variables above.
2. Generate a strong secret:
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

Netlify (production)
- Recommended commands (Netlify CLI):
  netlify env:set NEXTAUTH_SECRET "<32B-base64>" --context production
  netlify env:set NEXTAUTH_URL "https://stratanoble.com" --context production
  netlify env:set TWILIO_ACCOUNT_SID "ACxxxxxxxx..." --context production
  netlify env:set TWILIO_AUTH_TOKEN "<token>" --context production
  netlify env:set TWILIO_PHONE_NUMBER_PRIMARY "+1xxxxxxxxxx" --context production

Notes
- The build suppresses warnings for missing envs in CI, but authentication will fail at runtime without NEXTAUTH_SECRET.
- Do not commit real credentials; keep secrets in env vars only.
