'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center p-6 border rounded-lg max-w-md">
          <h2 className="text-2xl font-bold text-destructive mb-2">Unexpected Admin Console Error</h2>
          <p className="text-sm text-muted-foreground mb-4">
            An error occurred while rendering the administration interface. Our team has been notified.
          </p>
          <button
            onClick={() => reset()}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
