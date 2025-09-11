// This file configures the initialization of Sentry on the browser side.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Sentry initialization is now handled in instrumentation-client.ts
// This file is kept for compatibility but no longer initializes Sentry
// to avoid duplicate initialization warnings.
