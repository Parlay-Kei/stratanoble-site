// Run with: npm run list:auth
import dotenv from "dotenv";
import "tsconfig-paths/register";

async function main() {
  dotenv.config({ path: ".env.local" });
  dotenv.config();

  const { authOptions } = await import("../src/lib/auth");
  const ids = (authOptions.providers as any[]).map((p: any) => p.id);
  console.log("Configured providers:", ids);

  const hints: string[] = [];
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    hints.push("Google disabled (set GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET)");
  }
  if (!process.env.SES_FROM_EMAIL) {
    hints.push("Email magic link disabled (set SES_FROM_EMAIL)");
  }
  if (!process.env.NEXTAUTH_SECRET) {
    hints.push("NEXTAUTH_SECRET missing (required)");
  }
  if (hints.length) {
    console.log("Hints:", hints);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
