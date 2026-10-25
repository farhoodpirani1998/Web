/**
 * Route-level permission gate for the `/admin/*` tree.
 *
 * Rendered as a *pathless layout route* (`routes/index.tsx`) wrapping all
 * of the admin pages, so one wrapper covers every current and future child
 * route without each one declaring its own guard: it reads the active
 * pathname and looks the requirement up in `routes/route-permissions.ts`
 * — the same map `AdminSidebar` uses to hide its links, which is what
 * keeps "link not shown" and "page not rendered" from ever disagreeing.
 *
 * Positioned inside `RequireAuth`, so by the time this runs there is
 * already a resolved session; it only answers "may this admin open this
 * page", never "are you logged in".
 *
 * Like `PermissionGate`, this is a UX/defense-in-depth layer, not the
 * security boundary: the backend's `@RequireCmsPermission` decorators
 * still 403 anything the admin isn't allowed to do. What this fixes is
 * the shell itself — without it a `content_editor` can navigate straight
 * to `/admin/admin-users` and get a page whose every request fails.
 */
import { ShieldAlert } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { ROUTE_PATHS } from "@/routes/paths";
import { canAccessRoute } from "@/routes/route-permissions";

import { useAuth } from "./authContext";

export function RequireRouteAccess() {
  const { admin } = useAuth();
  const { pathname } = useLocation();

  if (!canAccessRoute(admin, pathname)) {
    return (
      <PageContainer>
        <EmptyState
          icon={<ShieldAlert className="h-6 w-6" aria-hidden="true" />}
          title="دسترسی به این بخش محدود است"
          description="نقش شما مجوز مشاهدهٔ این صفحه را ندارد. اگر به آن نیاز دارید، با مدیر کل سامانه تماس بگیرید."
        >
          <Button asChild variant="outline">
            <Link to={ROUTE_PATHS.ADMIN_DASHBOARD}>بازگشت به داشبورد</Link>
          </Button>
        </EmptyState>
      </PageContainer>
    );
  }

  return <Outlet />;
}
