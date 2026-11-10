import { RouterProvider } from "react-router-dom";

import { AppProviders } from "@/app/providers/AppProviders";
import { ErrorBoundary } from "@/shared/error/ErrorBoundary";
import { router } from "@/app/routes/router";

/**
 * The application's single root component (§3): one entry point, one
 * provider tree, one router, wrapped in ErrorBoundary for render-time
 * crashes. Nothing else composes providers or routing — a page never
 * reaches around this to add its own provider.
 *
 * ErrorBoundary: the outermost safety net for unhandled render exceptions.
 * Data-layer errors and async failures are handled closer to their source
 * via TanStack Query states and section-level ErrorState components.
 */
export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  );
}
