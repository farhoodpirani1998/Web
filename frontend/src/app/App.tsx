import { RouterProvider } from "react-router-dom";

import { AppProviders } from "@/app/providers/AppProviders";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { router } from "@/app/routes/router";

/**
 * The application's single root component (§3): one entry point, one
 * provider tree, one router, wrapped in ErrorBoundary for render-time crashes
 * (Phase 2). Nothing else composes providers or routing — a page never reaches
 * around this to add its own provider.
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
