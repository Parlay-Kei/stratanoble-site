// Browser-safe public configuration (no fs, no server secrets)

export const publicConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://REDACTED.supabase.co',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'REDACTED_ANON_KEY',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://stratanoble.com',
} as const;
