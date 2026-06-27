"use client";
import Link from 'next/link';
import { Button } from './components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Page Not Found</h2>
      <p className="text-slate-500 max-w-md text-center mb-8">
        We can't seem to find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link href="/">
        <Button size="lg">Back to Homepage</Button>
      </Link>
    </div>
  );
}
