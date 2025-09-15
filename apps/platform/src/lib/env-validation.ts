/**
 * Environment Variable Validation
 * Ensures all required environment variables are present and valid
 * for secure production deployment
 */

interface EnvConfig {
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;

  // Application Configuration
  NEXT_PUBLIC_BASE_URL?: string;
  NEXT_PUBLIC_ACHIEVERY_URL?: string;

  // Security Configuration
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;

  // Third-party Services
  STRIPE_SECRET_KEY?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  RESEND_API_KEY?: string;

  // Analytics & Monitoring
  NEXT_PUBLIC_ANALYTICS_ID?: string;
  SENTRY_DSN?: string;

  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS?: string;
  NEXT_PUBLIC_ENABLE_DEBUG?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface EnvRequirement {
  key: string;
  required: boolean;
  type: 'string' | 'url' | 'email' | 'boolean';
  minLength?: number;
  pattern?: RegExp;
  description: string;
}

const ENV_REQUIREMENTS: EnvRequirement[] = [
  // Critical Supabase Configuration
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    type: 'url',
    description: 'Supabase project URL'
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    type: 'string',
    minLength: 100,
    description: 'Supabase anonymous key'
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    type: 'string',
    minLength: 100,
    description: 'Supabase service role key (server-side only)'
  },

  // Application URLs
  {
    key: 'NEXT_PUBLIC_BASE_URL',
    required: true,
    type: 'url',
    description: 'Base URL for the application'
  },
  {
    key: 'NEXT_PUBLIC_ACHIEVERY_URL',
    required: true,
    type: 'url',
    description: 'ACHIEVERY platform URL'
  },

  // Authentication
  {
    key: 'NEXTAUTH_SECRET',
    required: true,
    type: 'string',
    minLength: 32,
    description: 'NextAuth.js secret key'
  },
  {
    key: 'NEXTAUTH_URL',
    required: true,
    type: 'url',
    description: 'NextAuth.js callback URL'
  },

  // Payment Processing
  {
    key: 'STRIPE_SECRET_KEY',
    required: true,
    type: 'string',
    pattern: /^sk_(test_|live_)/,
    description: 'Stripe secret key'
  },
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    type: 'string',
    pattern: /^pk_(test_|live_)/,
    description: 'Stripe publishable key'
  },

  // Email Service
  {
    key: 'RESEND_API_KEY',
    required: false,
    type: 'string',
    pattern: /^re_/,
    description: 'Resend email service API key'
  },

  // Optional Services
  {
    key: 'NEXT_PUBLIC_ANALYTICS_ID',
    required: false,
    type: 'string',
    description: 'Analytics tracking ID'
  },
  {
    key: 'SENTRY_DSN',
    required: false,
    type: 'url',
    description: 'Sentry error tracking DSN'
  }
];

/**
 * Validate all environment variables according to requirements
 */
export function validateEnvironmentVariables(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const env = process.env as EnvConfig;

  // Check each requirement
  for (const requirement of ENV_REQUIREMENTS) {
    const value = env[requirement.key as keyof EnvConfig];

    // Check if required variable is missing
    if (requirement.required && (!value || value.trim() === '')) {
      errors.push(`Missing required environment variable: ${requirement.key} - ${requirement.description}`);
      continue;
    }

    // Skip validation for optional missing variables
    if (!value) {
      if (!requirement.required) {
        warnings.push(`Optional environment variable not set: ${requirement.key} - ${requirement.description}`);
      }
      continue;
    }

    // Validate value format
    const validationError = validateEnvironmentValue(requirement.key, value, requirement);
    if (validationError) {
      errors.push(validationError);
    }
  }

  // Additional security checks
  const securityErrors = performSecurityChecks(env);
  errors.push(...securityErrors);

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate individual environment variable value
 */
function validateEnvironmentValue(key: string, value: string, requirement: EnvRequirement): string | null {
  // Check minimum length
  if (requirement.minLength && value.length < requirement.minLength) {
    return `${key} must be at least ${requirement.minLength} characters long`;
  }

  // Check type-specific validation
  switch (requirement.type) {
    case 'url':
      if (!isValidUrl(value)) {
        return `${key} must be a valid URL`;
      }
      break;

    case 'email':
      if (!isValidEmail(value)) {
        return `${key} must be a valid email address`;
      }
      break;

    case 'boolean':
      if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
        return `${key} must be a boolean value (true/false or 1/0)`;
      }
      break;
  }

  // Check pattern if specified
  if (requirement.pattern && !requirement.pattern.test(value)) {
    return `${key} does not match the required format`;
  }

  return null;
}

/**
 * Perform additional security-focused validation
 */
function performSecurityChecks(env: EnvConfig): string[] {
  const errors: string[] = [];

  // Check for development values in production
  if (process.env.NODE_ENV === 'production') {
    const devIndicators = ['localhost', '127.0.0.1', 'test_', 'placeholder', 'example.com'];

    Object.entries(env).forEach(([key, value]) => {
      if (value && devIndicators.some(indicator => value.includes(indicator))) {
        errors.push(`Production environment contains development value in ${key}: ${value.substring(0, 20)}...`);
      }
    });
  }

  // Check Stripe key consistency
  const stripeSecret = env.STRIPE_SECRET_KEY;
  const stripePublishable = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (stripeSecret && stripePublishable) {
    const secretIsTest = stripeSecret.includes('sk_test_');
    const publishableIsTest = stripePublishable.includes('pk_test_');

    if (secretIsTest !== publishableIsTest) {
      errors.push('Stripe secret and publishable keys are from different environments (test/live)');
    }

    if (process.env.NODE_ENV === 'production' && secretIsTest) {
      warnings.push('Using Stripe test keys in production environment');
    }
  }

  // Check for URL consistency
  if (env.NEXT_PUBLIC_BASE_URL && env.NEXTAUTH_URL) {
    try {
      const baseHost = new URL(env.NEXT_PUBLIC_BASE_URL).host;
      const authHost = new URL(env.NEXTAUTH_URL).host;

      if (baseHost !== authHost) {
        errors.push('NEXT_PUBLIC_BASE_URL and NEXTAUTH_URL must use the same domain');
      }
    } catch (e) {
      // URL parsing errors already caught in type validation
    }
  }

  return errors;
}

/**
 * Utility functions
 */
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get environment value with validation
 */
export function getValidatedEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];

  if (!value) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * Initialize environment validation on app startup
 */
export function initializeEnvironmentValidation(): void {
  // Only validate in server-side environment
  if (typeof window !== 'undefined') {
    return;
  }

  const validation = validateEnvironmentVariables();

  // Log errors and warnings
  if (validation.errors.length > 0) {
    console.error('\n🚨 ENVIRONMENT VALIDATION ERRORS:');
    validation.errors.forEach(error => console.error(`  ❌ ${error}`));
    console.error('\n⚠️  APPLICATION WILL NOT START PROPERLY WITH THESE ERRORS\n');
  }

  if (validation.warnings.length > 0) {
    console.warn('\n⚠️  ENVIRONMENT VALIDATION WARNINGS:');
    validation.warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`));
    console.warn('');
  }

  if (validation.isValid) {
    console.log('✅ Environment validation passed');
  }

  // In production, fail hard on validation errors
  if (process.env.NODE_ENV === 'production' && !validation.isValid) {
    console.error('❌ Environment validation failed in production - application startup aborted');
    process.exit(1);
  }
}

/**
 * Export validation result for use in middleware or startup checks
 */
export const environmentValidation = validateEnvironmentVariables();