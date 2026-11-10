import { Outlet } from "react-router-dom";

import { AppShell } from "@/app/shell";

/**
 * Root route layout that mounts the persistent app shell around the
 * nested route content.
 */
export function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
