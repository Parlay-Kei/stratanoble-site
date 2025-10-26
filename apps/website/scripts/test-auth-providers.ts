// Run with: npm run test:auth
import dotenv from "dotenv";
import "tsconfig-paths/register";
import { NextRequest } from "next/server";

async function main() {
  // Load local env first, then fallback to .env
  dotenv.config({ path: ".env.local" });
  dotenv.config();

  // Force-disable dev credentials for this diagnostic run
  process.env.NEXTAUTH_DEV_LOGIN = "false";

  // Ensure NEXTAUTH_URL defaults for handler logic
  process.env.NEXTAUTH_URL ||= "http://localhost:3000";

  // Dynamically import the NextAuth route handler
  const route = await import("../src/app/api/auth/[...nextauth]/route");

  if (!("GET" in route)) {
    console.error("Auth route GET handler not found.");
    process.exit(1);
  }

  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const req = new NextRequest(new Request(base + "/api/auth/providers", { method: "GET" }));
  (req as any).query = { nextauth: ["providers"] };
  const res: Response = await (route as any).GET(req as any);

  const text = await res.text();
  // Try JSON parse if possible
  try {
    const json = JSON.parse(text);
    console.log("Status:", res.status);
    console.log("Providers:", Object.keys(json));
    console.log("Raw:", JSON.stringify(json, null, 2));
  } catch {
    console.log("Status:", res.status);
    console.log("Body:", text);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
