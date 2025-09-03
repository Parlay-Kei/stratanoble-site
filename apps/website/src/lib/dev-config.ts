// Development configuration with fallbacks
// This file provides default values for development when environment variables are not set

export const devConfig = {
  // Supabase fallbacks
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
  },
  
  // Stripe fallbacks
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
  },
  
  // Auth fallbacks
  auth: {
    secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production',
    url: process.env.NEXTAUTH_URL || 'http://localhost:8080',
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'placeholder-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder-client-secret',
    },
  },
  
  // Email fallbacks
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || 'placeholder@example.com',
      password: process.env.SMTP_PASSWORD || 'placeholder-password',
    },
    from: process.env.SES_FROM_EMAIL || 'noreply@stratanoble.com',
  },
  
  // AWS fallbacks
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'placeholder-access-key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'placeholder-secret',
  },
  
  // Redis/Upstash fallbacks
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL || 'https://placeholder.upstash.io',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || 'placeholder-token',
  },
  
  // Development flags
  dev: {
    skipRateLimiting: process.env.SKIP_RATE_LIMITING === 'true',
    skipCSRFProtection: process.env.SKIP_CSRF_PROTECTION === 'true',
    showPricing: process.env.NEXT_PUBLIC_SHOW_PRICING === 'true',
  },
  
  // Base URL
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080',
};

// Check if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development';

// Log missing environment variables in development
if (isDevelopment) {
  const missingVars = [];
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!process.env.STRIPE_SECRET_KEY) missingVars.push('STRIPE_SECRET_KEY');
  if (!process.env.NEXTAUTH_SECRET) missingVars.push('NEXTAUTH_SECRET');
  
  if (missingVars.length > 0) {
    // Missing environment variables detected in development
    // Create a .env.local file with these variables for full functionality
  }
}
