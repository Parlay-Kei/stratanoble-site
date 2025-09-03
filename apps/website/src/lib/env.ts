import { logger } from './logger';

interface RequiredEnvVars {
  AWS_REGION?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  SES_FROM_EMAIL?: string;
  ADMIN_EMAIL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

/**
 * Validates and returns a required environment variable
 * @param key - The environment variable key
 * @param defaultValue - Optional default value
 * @returns The environment variable value
 * @throws Error if the variable is not set and no default is provided
 */
export function getRequiredEnvVar(key: keyof RequiredEnvVars, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    const error = `Missing required environment variable: ${key}`;
    logger.error(error);
    throw new Error(error);
  }
  
  return value;
}

/**
 * Validates all critical environment variables at startup
 */
export function validateEnvironment(): void {
  const requiredVars: Array<keyof RequiredEnvVars> = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    const error = `Missing required environment variables: ${missingVars.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }

  logger.info('Environment validation passed');
}

/**
 * Gets an environment variable with proper typing and optional validation
 */
export const env = {
  // AWS Configuration
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  SES_FROM_EMAIL: process.env.SES_FROM_EMAIL || 'info@stratanoble.com',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@stratanoble.com',

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Stripe Configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  // Application Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  VERCEL_URL: process.env.VERCEL_URL,
  PORT: process.env.PORT || '3000',
} as const;

export type EnvConfig = typeof env;
