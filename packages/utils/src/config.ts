import { z } from 'zod';

// Browser-safe config loader
// Only uses environment variables, no file system access

// Browser-safe configuration loader
// Uses only environment variables (no file system access)

function fromEnv(key: string): string | undefined {
  // Only use process.env, safe for browser environments
  if (typeof process !== 'undefined' && process.env) {
    const envVal = process.env[key];
    if (envVal && envVal.length > 0) return envVal;
  }
  return undefined;
}

const schema = z.object({
  // Supabase - more lenient validation for development
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().or(z.string().min(1)), 
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

  // OpenAI (for ACHIEVERY Reframe Engine)
  OPENAI_API_KEY: z.string().min(1).optional(),

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
  NEXT_PUBLIC_SUPABASE_URL: fromEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: fromEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: fromEnv('SUPABASE_SERVICE_ROLE_KEY'),

  AWS_REGION: fromEnv('AWS_REGION') ?? 'us-east-1',
  AWS_ACCESS_KEY_ID: fromEnv('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: fromEnv('AWS_SECRET_ACCESS_KEY'),
  SES_FROM_EMAIL: fromEnv('SES_FROM_EMAIL'),

  STRIPE_SECRET_KEY: fromEnv('STRIPE_SECRET_KEY'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: fromEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  STRIPE_WEBHOOK_SECRET: fromEnv('STRIPE_WEBHOOK_SECRET'),

  UPSTASH_REDIS_REST_URL: fromEnv('UPSTASH_REDIS_REST_URL'),
  UPSTASH_REDIS_REST_TOKEN: fromEnv('UPSTASH_REDIS_REST_TOKEN'),

  NEXTAUTH_SECRET: fromEnv('NEXTAUTH_SECRET'),
  NEXTAUTH_URL: fromEnv('NEXTAUTH_URL'),
  GOOGLE_CLIENT_ID: fromEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: fromEnv('GOOGLE_CLIENT_SECRET'),

  NODE_ENV: fromEnv('NODE_ENV') ?? (typeof process !== 'undefined' && process.env ? process.env.NODE_ENV : 'development'),
  VERCEL_URL: fromEnv('VERCEL_URL'),
  PORT: fromEnv('PORT') ?? (typeof process !== 'undefined' && process.env ? process.env.PORT : undefined),

  MCP_SERVER_ENDPOINTS: fromEnv('MCP_SERVER_ENDPOINTS'),
  MCP_SERVER_CONFIG: fromEnv('MCP_SERVER_CONFIG'),
  MCP_API_KEYS_JSON: fromEnv('MCP_API_KEYS_JSON'),
};

const parsed = schema.safeParse(collected);

// Handle development mode more gracefully
let config: any;

if (!parsed.success) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isBuildTime = process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build';
  
  if (isBuildTime || isDevelopment) {
    // Provide safe defaults for build time and development
    config = {
      NEXT_PUBLIC_SUPABASE_URL: collected.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: collected.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
      SUPABASE_SERVICE_ROLE_KEY: collected.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
      AWS_REGION: collected.AWS_REGION || 'us-east-1',
      NODE_ENV: collected.NODE_ENV || (isBuildTime ? 'production' : 'development'),
      STRIPE_SECRET_KEY: collected.STRIPE_SECRET_KEY || 'sk_test_placeholder',
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
  const value = fromEnv(String(name)) ?? '';
  if (!value) {
    throw new Error(`Missing required server secret: ${String(name)}`);
  }
  return value;
}
