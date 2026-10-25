/**
 * Admin sidebar — the dark, grouped navigation panel.
 *
 * Renders `ADMIN_NAV_ITEMS` (from `routes/nav.config.ts`) grouped by
 * `NAV_GROUPS`, in Persian. Active item = gold start-side bar + tinted
 * background. `collapsed` shrinks it to an icon rail (labels + group
 * headings hidden, tooltips via `title`). The same component powers both
 * the desktop rail (toggled in `AdminLayout`) and the mobile drawer — the
 * drawer just renders it with `collapsed={false}` and `onNavigate` set to
 * close itself.
 *
 * Items whose page the signed-in admin's role can't open are filtered
 * out via `routes/route-permissions` — the same map `RequireRouteAccess`
 * enforces, so a link is never shown for a page that would deny them.
 */
import { GraduationCap, PanelRightClose, PanelRightOpen } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "@/features/auth";
import { cn } from "@/lib/cn";
import { ADMIN_NAV_ITEMS, NAV_GROUPS } from "@/routes/nav.config";
import { canAccessRoute } from "@/routes/route-permissions";

interface AdminSidebarProps {
  collapsed: boolean;
  /** Called after a nav link is followed — used by the mobile drawer to close itself. */
  onNavigate?: () => void;
  /** When provided, renders the desktop collapse/expand toggle in the footer. */
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  collapsed,
  onNavigate,
  onToggleCollapse,
}: AdminSidebarProps) {
  const { admin } = useAuth();

  return (
    <div className="flex h-full flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground">
      <BrandHeader collapsed={collapsed} />

      <nav aria-label="ناوبری اصلی" className="flex-1 overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group) => {
          const items = ADMIN_NAV_ITEMS.filter(
            (item) => item.group === group.id && canAccessRoute(admin, item.route),
          );
          if (items.length === 0) return null;

          return (
            <div key={group.id} className="mb-4 last:mb-2">
              {!collapsed ? (
                <p className="mb-1.5 px-3 text-[0.68rem] font-semibold uppercase tracking-wider text-sidebar-muted">
                  {group.label}
                </p>
              ) : (
                <div
                  className="mx-auto mb-2 h-px w-6 bg-sidebar-border"
                  aria-hidden="true"
                />
              )}

              <ul className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <NavLink
                        to={item.route}
                        onClick={onNavigate}
                        title={collapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          cn(
                            "group relative flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors",
                            collapsed ? "justify-center px-0" : "px-3",
                            isActive
                              ? "bg-sidebar-active text-white"
                              : "text-sidebar-foreground/90 hover:bg-sidebar-hover hover:text-white",
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              aria-hidden="true"
                              className={cn(
                                "absolute inset-y-1.5 start-0 w-1 rounded-e-full bg-sidebar-accent transition-opacity",
                                isActive ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <Icon
                              className={cn(
                                "h-[18px] w-[18px] shrink-0 transition-colors",
                                isActive
                                  ? "text-sidebar-accent"
                                  : "text-sidebar-muted group-hover:text-sidebar-foreground",
                              )}
                            />
                            {!collapsed ? (
                              <span className="truncate">{item.label}</span>
                            ) : null}
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {onToggleCollapse ? (
        <div className="border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "flex w-full items-center gap-3 rounded-md py-2 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-white",
              collapsed ? "justify-center px-0" : "px-3",
            )}
            title={collapsed ? "باز کردن نوار کناری" : "جمع کردن نوار کناری"}
            aria-label={collapsed ? "باز کردن نوار کناری" : "جمع کردن نوار کناری"}
          >
            {collapsed ? (
              <PanelRightOpen className="h-[18px] w-[18px] shrink-0" />
            ) : (
              <>
                <PanelRightClose className="h-[18px] w-[18px] shrink-0" />
                <span>جمع کردن</span>
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function BrandHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex h-16 shrink-0 items-center border-b border-sidebar-border",
        collapsed ? "justify-center px-2" : "gap-3 px-5",
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gold to-[hsl(46_68%_38%)] text-primary shadow-glow">
        <GraduationCap className="h-5 w-5" />
      </span>
      {!collapsed ? (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-heading text-sm font-bold text-white">
            ندای حقیقت
          </span>
          <span className="truncate text-[0.7rem] text-sidebar-muted">
            پنل مدیریت محتوا
          </span>
        </span>
      ) : null}
    </div>
  );
}
