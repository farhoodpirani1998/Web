/**
 * Admin layout shell.
 *
 * Sprint 1.3 scope: overall page structure only — sidebar, header, and
 * a routed main content area. No auth, no guards, no business logic.
 * Applied to `/admin/*` routes in `routes/index.tsx`; the login page
 * intentionally stays outside this layout.
 *
 * Sprint 1.6 note: `<main>` intentionally has no padding/max-width of
 * its own anymore — that responsibility now lives in `PageContainer`
 * (`@/components/ui/PageContainer`), which each routed page wraps its
 * content in. This keeps the layout shell reusable for any future page
 * width without editing this file. `<main>` stays responsible for
 * overflow handling only.
 *
 * Sprint — CMS UX: Global Search + Command Palette: wraps everything
 * in `GlobalSearchProvider` (`@/features/cms/global-search`), which
 * mounts the Ctrl/Cmd+K Command Palette once for every `/admin/*`
 * route and exposes `openSearch()` to `AdminHeader`'s search button —
 * no other change to this file's structure.
 */
import { Outlet } from "react-router-dom";

import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { GlobalSearchProvider } from "@/features/cms/global-search";

export function AdminLayout() {
  return (
    <GlobalSearchProvider>
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />

          <main className="min-w-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </GlobalSearchProvider>
  );
}
