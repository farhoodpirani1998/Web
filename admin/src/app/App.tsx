import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/features/auth";
import { router } from "@/routes";
import { ToastProvider } from "@/components/ui/Toast";
import { ToastContainer } from "@/components/ui/Toast";

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
        <AuthProvider>
          <ToastProvider>
            <ToastContainer />
            <RouterProvider router={router} />
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
}
