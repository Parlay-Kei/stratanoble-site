// Browser-safe public configuration (no fs, no server secrets)

export const publicConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bvneqoevtwodyfqglpzi.supabase.co',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bmVxb2V2dHdvZHlmcWdscHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzM4OTQsImV4cCI6MjA2NzAwOTg5NH0.7yTUwwa7UMfX5-ZBvG9T8LWDsst9SjQ2P0MON6iWTkw',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://stratanoble.com',
} as const;
