/**
 * Admin sidebar.
 *
 * Sprint 1.4 scope: real navigation. Renders `ADMIN_NAV_ITEMS` as
 * `NavLink`s with active/inactive styling — no permission filtering,
 * no icons (none installed yet). The nav item list itself lives in
 * `routes/nav.config.ts`, not here.
 *
 * Sprint 1.6 note: `nav` scrolls independently of the sidebar frame so
 * a longer nav list stays usable on short viewports. A collapsible
 * mobile drawer is out of scope for this sprint (would need
 * open/close state, not just layout primitives) and is left for a
 * dedicated navigation sprint.
 */
import { NavLink } from "react-router-dom";

import { ADMIN_NAV_ITEMS } from "@/routes/nav.config";

export function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 overflow-y-auto border-r border-slate-200 bg-white">
      <nav className="flex flex-col gap-1 p-4">
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.route}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

