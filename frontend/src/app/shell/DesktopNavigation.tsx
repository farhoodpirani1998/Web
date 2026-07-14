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
 * active *visual* treatment below only adds color/underline, it doesn't
 * re-derive that attribute.
 *
 * Visual refresh: same items/order/behavior, restyled with a gold
 * underline indicator (hover + active) and `flex-wrap` so a full
 * `NAV_ITEMS` list degrades to a second line instead of overflowing on
 * narrower desktop widths, rather than a structural change.
 */
export function DesktopNavigation() {
  return (
    <nav
      aria-label="ناوبری اصلی"
      className="hidden md:flex md:flex-wrap md:items-center md:justify-end md:gap-x-5 md:gap-y-1"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.href === "/"}
          className={({ isActive }) =>
            cn(
              "relative whitespace-nowrap rounded-sm px-0.5 py-2 text-sm font-medium tracking-tight text-foreground/70 transition-colors hover:text-foreground",
              "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-brand-gold after:transition-transform after:duration-300 hover:after:scale-x-100",
              FOCUS_RING_CLASSNAME,
              isActive && "text-foreground after:scale-x-100",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
