import { NavLink } from "react-router-dom";

import { FOCUS_RING_CLASSNAME } from "@/shared/design-system/a11y";
import { cn } from "@/shared/utils/cn";
import { NAV_ITEMS } from "@/app/shell/nav-data";

/**
 * Desktop nav (§8, §26, §27): shown from `md` upward, hidden below it
 * where `MobileNavigation` takes over — the same `NAV_ITEMS` data feeds
 * both, so there is exactly one nav structure, not two independently
 * maintained ones.
 *
 * `react-router-dom`'s `NavLink` sets `aria-current="page"` on the
 * active link automatically (§26 "correct focus/state management"); the
 * active *visual* treatment below only adds color, it doesn't re-derive
 * that attribute.
 */
export function DesktopNavigation() {
  return (
    <nav aria-label="ناوبری اصلی" className="hidden md:flex md:items-center md:gap-6">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.href === "/"}
          className={({ isActive }) =>
            cn(
              "rounded-sm text-sm font-medium text-foreground/80 transition-colors hover:text-foreground",
              FOCUS_RING_CLASSNAME,
              isActive && "text-foreground",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
