import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Centralized, typed configuration loader
// Priority: process.env > secure JSON file (gitignored) > safe defaults for dev

const secureConfigPath = path.resolve(process.cwd(), 'secure.config.json');

type SecureConfig = Record<string, unknown>;

function readSecureConfig(): SecureConfig {
  try {
    if (fs.existsSync(secureConfigPath)) {
      const raw = fs.readFileSync(secureConfigPath, 'utf-8');
      return JSON.parse(raw) as SecureConfig;
    }
  } catch {
    // Ignore secure file errors; env vars should still work
  }
  return {};
}

const secure = readSecureConfig();

function fromSources(key: string): string | undefined {
  const envVal = process.env[key];
  if (envVal && envVal.length > 0) return envVal;
  const secVal = secure[key];
  if (typeof secVal === 'string' && secVal.length > 0) return secVal;
  return undefined;
}

const schema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // AWS SES
  AWS_REGION: z.string().min(1).default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  SES_FROM_EMAIL: z.string().email().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_BASE_URL: z.string().optional(),
  STRIPE_PRICE_ID_SOLUTION_LITE: z.string().optional(),
  STRIPE_PRICE_ID_SOLUTION_CORE: z.string().optional(),
  STRIPE_PRICE_ID_SOLUTION_PREMIUM: z.string().optional(),
  STRIPE_PRICE_ID_WORKSHOP_STANDARD: z.string().optional(),
  STRIPE_PRICE_ID_PRESENCE_STANDARD: z.string().optional(),
  STRIPE_PRICE_ID_ANALYSIS_STANDARD: z.string().optional(),

  // Upstash/Redis
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  QSTASH_TOKEN: z.string().min(1).optional(),

  // NextAuth / Auth
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // Mailchimp
  MAILCHIMP_API_KEY: z.string().optional(),
  MAILCHIMP_SERVER_PREFIX: z.string().optional(),
  MAILCHIMP_AUDIENCE_ID: z.string().optional(),

  // S3
  S3_BUCKET_NAME: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // General App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  VERCEL_URL: z.string().optional(),
  PORT: z.string().optional(),

  // MCP (Model Context Protocol) - optional
  MCP_SERVER_ENDPOINTS: z.string().optional(), // comma-separated list
  MCP_SERVER_CONFIG: z.string().optional(), // JSON string or path
  MCP_API_KEYS_JSON: z.string().optional(), // JSON string
});

const collected: Record<string, string | undefined> = {
  NEXT_PUBLIC_SUPABASE_URL: fromSources('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: fromSources('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: fromSources('SUPABASE_SERVICE_ROLE_KEY'),

  AWS_REGION: fromSources('AWS_REGION') ?? 'us-east-1',
  AWS_ACCESS_KEY_ID: fromSources('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: fromSources('AWS_SECRET_ACCESS_KEY'),
  SES_FROM_EMAIL: fromSources('SES_FROM_EMAIL'),

  STRIPE_SECRET_KEY: fromSources('STRIPE_SECRET_KEY'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: fromSources('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  STRIPE_WEBHOOK_SECRET: fromSources('STRIPE_WEBHOOK_SECRET'),

  UPSTASH_REDIS_REST_URL: fromSources('UPSTASH_REDIS_REST_URL'),
  UPSTASH_REDIS_REST_TOKEN: fromSources('UPSTASH_REDIS_REST_TOKEN'),

  NEXTAUTH_SECRET: fromSources('NEXTAUTH_SECRET'),
  NEXTAUTH_URL: fromSources('NEXTAUTH_URL'),
  GOOGLE_CLIENT_ID: fromSources('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: fromSources('GOOGLE_CLIENT_SECRET'),

  NODE_ENV: fromSources('NODE_ENV') ?? process.env.NODE_ENV ?? 'development',
  VERCEL_URL: fromSources('VERCEL_URL'),
  PORT: fromSources('PORT') ?? process.env.PORT,

  MCP_SERVER_ENDPOINTS: fromSources('MCP_SERVER_ENDPOINTS'),
  MCP_SERVER_CONFIG: fromSources('MCP_SERVER_CONFIG'),
  MCP_API_KEYS_JSON: fromSources('MCP_API_KEYS_JSON'),
};

const parsed = schema.safeParse(collected);

// During build time, provide safe defaults instead of throwing errors
let config: any;

if (!parsed.success) {
  const isBuildTime = process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build';
  
  if (isBuildTime) {
    // Provide safe defaults for build time
    config = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-key',
      SUPABASE_SERVICE_ROLE_KEY: 'placeholder-service-key',
      AWS_REGION: 'us-east-1',
      NODE_ENV: 'production' as const,
      ...collected
    };
  } else {
    const formatted = parsed.error.format();
    const missingKeys = Object.keys(formatted).filter((k) => k !== '_errors');
    const details = JSON.stringify(formatted, null, 2);
    throw new Error(`Configuration validation failed. Missing/invalid keys: ${missingKeys.join(', ')}\n${details}`);
  }
} else {
  config = parsed.data;
}

export { config };

export type AppConfig = typeof config;

export function requireServerSecret(name: keyof AppConfig | string): string {
  const value = fromSources(String(name)) ?? '';
  if (!value) {
    throw new Error(`Missing required server secret: ${String(name)}`);
  }
  return value;
}
