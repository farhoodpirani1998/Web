import { RouterProvider } from "react-router-dom";

import { AppProviders } from "@/app/providers/AppProviders";
import { router } from "@/app/routes/router";

/**
 * The application's single root component (§3): one entry point, one
 * provider tree, one router. Nothing else composes providers or routing
 * — a page never reaches around this to add its own provider.
 */
export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
