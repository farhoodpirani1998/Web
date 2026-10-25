import { CircleHelp, ClipboardList, FileText, Newspaper, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/cn";
import { ROUTE_PATHS } from "@/routes/paths";

/**
 * Shortcut tiles to the four content modules called out in this sprint's
 * scope. Plain navigation, not a permission-gated action — each
 * destination page already gates its own body behind
 * `website.content:read`, so a user without access simply sees that
 * page's own "no access" empty state after following the link.
 */
const QUICK_ACTIONS: { label: string; route: string; icon: LucideIcon }[] = [
  { label: "صفحات", route: ROUTE_PATHS.ADMIN_PAGES, icon: FileText },
  { label: "اخبار", route: ROUTE_PATHS.ADMIN_NEWS, icon: Newspaper },
  { label: "پیش‌ثبت‌نام‌ها", route: ROUTE_PATHS.ADMIN_PRE_REGISTRATIONS, icon: ClipboardList },
  { label: "پرسش‌های متداول", route: ROUTE_PATHS.ADMIN_FAQS, icon: CircleHelp },
];

export function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.route}
            to={action.route}
            className={cn(
              "group flex flex-col items-center gap-2 rounded-lg border border-border bg-card px-3 py-4 text-center",
              "text-sm font-medium text-foreground transition-all duration-200",
              "hover:-translate-y-0.5 hover:border-brand-gold/40 hover:shadow-card-hover",
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-brand-gold/15 group-hover:text-brand-gold">
              <Icon className="h-5 w-5" />
            </span>
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
