// Browser-safe public configuration (no fs, no server secrets)

export const publicConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://stratanoble.com',
  achieveryUrl: process.env.NEXT_PUBLIC_ACHIEVERY_URL || 'https://app.achievery.com',
} as const;
