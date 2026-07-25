import { Link } from "react-router-dom";

import { ROUTE_PATHS } from "@/routes/paths";

/**
 * Shortcut links to the four content modules called out in this
 * sprint's scope. Plain navigation, not a permission-gated action —
 * same reasoning `AdminSidebar`'s nav items aren't permission-filtered
 * yet (see that file's own comment): each destination page already
 * gates its own body behind `website.content:read`, so a user without
 * access simply sees that page's own "no access" empty state after
 * following the link, rather than this needing to duplicate that
 * check.
 */
const QUICK_ACTIONS = [
  { label: "Pages", route: ROUTE_PATHS.ADMIN_PAGES },
  { label: "News", route: ROUTE_PATHS.ADMIN_NEWS },
  { label: "Pre-Registrations", route: ROUTE_PATHS.ADMIN_PRE_REGISTRATIONS },
  { label: "FAQ", route: ROUTE_PATHS.ADMIN_FAQS },
];

export function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {QUICK_ACTIONS.map((action) => (
        <Link
          key={action.route}
          to={action.route}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
