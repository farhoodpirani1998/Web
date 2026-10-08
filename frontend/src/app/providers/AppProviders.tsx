import { QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

import { queryClient } from "@/shared/api/queryClient";
import { ErrorBoundary } from "@/shared/error/ErrorBoundary";

interface AppProvidersProps {
  children: React.ReactNode;
}

// Loaded via dynamic import, wrapped in Suspense, and only ever rendered
// when `import.meta.env.DEV` is true. Vite/Rollup replaces that check
// with `false` in production builds and dead-code-eliminates the branch
// below, so the dynamic `import()` is never reached and the devtools
// chunk is never fetched by a production visitor.
const ReactQueryDevtools = React.lazy(() =>
  import("@tanstack/react-query-devtools").then((m) => ({
    default: m.ReactQueryDevtools,
  })),
);

/**
 * The application's one root provider tree (§3): data-fetching today;
 * theming and localization providers are added here too once they carry
 * actual runtime state (locale/theme persistence is currently handled
 * by route params + CSS tokens, per §16, §24, §28 — no provider needed
 * yet for either).
 *
 * The error boundary wraps everything so a render-time exception
 * anywhere in the tree is caught by the single top-level fallback (§18).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        {import.meta.env.DEV && (
          <React.Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </React.Suspense>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
