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

export async function onRequestError(error: any, request: any, context: any) {
  const { captureException } = await import('@sentry/nextjs')
  captureException(error, {
    tags: {
      source: 'nextjs_request_error'
    },
    contexts: {
      request: {
        url: request?.url,
        method: request?.method,
        headers: request?.headers,
      },
    },
  })
}