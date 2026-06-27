"use client";
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from './components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <h1 className="text-8xl font-bold text-red-500 mb-4">500</h1>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Internal Server Error</h2>
      <p className="text-slate-500 max-w-md text-center mb-8">
        Oops! Something went wrong on our end. We've been notified and are looking into it.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="outline">Try Again</Button>
        <Button onClick={() => window.location.href = '/'}>Back to Homepage</Button>
      </div>
    </div>
  );
}
