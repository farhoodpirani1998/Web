import { Outlet } from "react-router-dom";

import { AppShell } from "@/app/shell";

/**
 * The router/route-tree side of the persistent layout shell (§8 "Layout
 * Architecture", §5 "App Shell / Providers"). This is the one place the
 * router's `<Outlet />` and the app shell meet — `AppShell` itself stays
 * router-agnostic (`@/app/shell/AppShell`), and this thin wrapper is
 * what mounts it as the route tree's root element in `router.tsx`.
 *
 * Sprint 3A: `Header`/`DesktopNavigation`/`MobileNavigation` now render
 * via `AppShell`. Footer and the Portal-selector modal are still
 * content-bearing chrome sourced from Site Settings/Navigation/Portal
 * Links (§8) and remain out of scope until those features exist.
 */
export function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
