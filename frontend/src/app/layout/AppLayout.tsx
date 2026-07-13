import { Outlet } from "react-router-dom";

/**
 * The single, persistent layout shell (§8 "Layout Architecture").
 *
 * Renders once at the app-shell layer and is never re-mounted on route
 * changes, so navigation never causes a header/footer flash.
 *
 * Phase 1 scope: structural shell only. TopBar/Navbar/Footer and the
 * Portal-selector modal are content-bearing chrome sourced from Site
 * Settings/Navigation/Portal Links (§8) and are added once those
 * features exist — out of scope for this bootstrap phase. A minimal
 * `<main>` landmark is provided now so routed pages have a correct
 * semantic mount point (§26 "Semantic HTML first").
 */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* TopBar / Navbar mount here once the Navigation + Site Settings
          features exist (§8). Intentionally absent in Phase 1. */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      {/* Footer mounts here once the Footer feature exists (§8). */}
    </div>
  );
}
