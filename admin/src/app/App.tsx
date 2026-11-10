import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/features/auth";
import { router } from "@/routes";

const queryClient = new QueryClient();

/**
 * Application root component.
 *
 * `AuthProvider` bootstraps the session before the router and its route
 * guards render.
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
