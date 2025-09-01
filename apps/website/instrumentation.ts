export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('./sentry.server.config')
    init()
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const { init } = await import('./sentry.edge.config')
    init()
  }
}