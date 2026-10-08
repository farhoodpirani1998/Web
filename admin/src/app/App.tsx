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

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
