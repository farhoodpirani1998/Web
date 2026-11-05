import { useEffect, useState, type ReactNode } from "react";

import { ErrorState } from "@/shared/design-system/components";
import { PageLayout } from "@/shared/design-system/components";

export interface ErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Error Boundary for catching render-time crashes (§12, §13, Phase 2).
 *
 * React error boundaries only catch errors during render, lifecycle methods,
 * and constructors — not async errors, event handlers, or setTimeout.
 * This is a class component pattern wrapped in a functional API using hooks.
 *
 * Handles:
 * - Render-time crashes in child components
 * - Provides a fallback UI with retry option (reload)
 *
 * Does NOT handle:
 * - Data-fetch failures (use ErrorState component instead)
 * - Async errors (caught at window level or in useEffect)
 * - Event handler errors (wrap handlers individually)
 */
export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Catch unhandled synchronous errors
      console.error("Uncaught error:", event.error);
      setError(event.error || new Error("Unknown error"));
      // Prevent default browser error handling
      event.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Catch unhandled promise rejections
      console.error("Unhandled promise rejection:", event.reason);
      setError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
      );
      // Prevent default browser error handling
      event.preventDefault();
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  if (error) {
    return (
      <PageLayout className="py-12">
        <ErrorState
          title="مشکلی در نمایش این صفحه پیش آمد"
          description="ممکن است مشکل از سمت سرور باشد یا یک خرابی ناشناخته اتفاق افتاده است. لطفاً صفحه را بازخانی کنید."
          onRetry={() => {
            setError(null);
            window.location.reload();
          }}
          retryLabel="بازخانی صفحه"
        />
      </PageLayout>
    );
  }

  return children;
}
