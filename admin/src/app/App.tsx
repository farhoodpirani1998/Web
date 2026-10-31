import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
/**
 * Application root component.
 *
 * Sprint 2.4B scope: wraps the router in `AuthProvider` (see
 * `features/auth/AuthProvider.tsx`) so the bootstrap auth check runs
 * once, above the router, before any route (including the guards
 * wrapping `/login` and `/admin`) renders.
 */
import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "@/features/auth";
import { router } from "@/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider, triggerToast } from "@/components/ui/Toast";

export function App() {
  return (
    <div dir="rtl" lang="fa">
      <ErrorBoundary>
        <ErrorBoundary>
      <AuthProvider>
          <ToastProvider>
      <ToastContainer />
            <RouterProvider router={router} />
          </ToastProvider>
        </AuthProvider>
    </ErrorBoundary>
      </ErrorBoundary>
    </div>
  );
}
