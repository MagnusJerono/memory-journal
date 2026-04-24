import * as Sentry from '@sentry/react';

/**
 * Initializes Sentry if VITE_SENTRY_DSN is set at build time.
 *
 * Safe to call in development or when the DSN is missing — it becomes a no-op.
 * Release identifier is taken from VITE_APP_RELEASE (typically set by CI to
 * the git SHA) so errors are grouped per deploy.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: (import.meta.env.VITE_SENTRY_ENV as string | undefined) ?? import.meta.env.MODE,
    release: (import.meta.env.VITE_APP_RELEASE as string | undefined) ?? undefined,
    // Conservative traces sample rate — bump later if you want perf data.
    tracesSampleRate: 0.1,
    // Replays disabled by default for privacy; flip on in Sentry later if wanted.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
    beforeSend(event) {
      // Strip request bodies that may contain user content before leaving the
      // device. Sentry still keeps URL, status, and headers.
      if (event.request?.data) {
        event.request.data = '[scrubbed]';
      }
      return event;
    },
  });
}

export { Sentry };
