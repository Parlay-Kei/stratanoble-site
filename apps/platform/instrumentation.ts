// Next.js instrumentation for Sentry
// Handles server-side Sentry initialization

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./src/lib/sentry.server');
  }
}
