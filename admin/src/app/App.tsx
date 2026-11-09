import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/features/auth";
import { router } from "@/routes";

const queryClient = new QueryClient();

/**
 * Application root component.
 *
 * Sprint 2.4B scope: wraps the router in `AuthProvider` (see
 * `features/auth/AuthProvider.tsx`) so the bootstrap auth check runs
 * once, above the router, before any route (including the guards
 * wrapping `/login` and `/admin`) renders.
 */

export function App() {
  return (
    <div dir="rtl" lang="fa">
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </div>
  );
}
