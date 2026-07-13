import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";

import { FOCUS_RING_CLASSNAME } from "@/shared/design-system/a11y";
import { VisuallyHidden } from "@/shared/design-system/components/VisuallyHidden";
import { cn } from "@/shared/utils/cn";
import { NAV_ITEMS } from "@/app/shell/nav-data";

const MOBILE_NAV_PANEL_ID = "mobile-nav-panel";

/**
 * Mobile nav (§8, §26, §27): a toggle button plus a collapsible panel,
 * shown below `md` where `DesktopNavigation` is hidden. The open/closed
 * state is ordinary component-local UI state (§16) — it has no reason
 * to be visible outside this component.
 *
 * Bilingual accessibility (§26, §28): icon glyphs are hidden from
 * assistive technology (`aria-hidden`) and the toggle's accessible name
 * comes from real text via `VisuallyHidden`, so it reads correctly in
 * either locale/direction rather than depending on an icon's shape.
 */
export function MobileNavigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  // Local UI state should never persist past the interaction it belongs
  // to (§16) — a completed navigation closes the panel.
  React.useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={MOBILE_NAV_PANEL_ID}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          FOCUS_RING_CLASSNAME,
        )}
      >
        <MenuIcon isOpen={isOpen} />
        <VisuallyHidden>{isOpen ? "بستن منو" : "باز کردن منو"}</VisuallyHidden>
      </button>

      {isOpen && (
        <nav
          id={MOBILE_NAV_PANEL_ID}
          aria-label="ناوبری اصلی"
          className="absolute inset-x-0 top-full border-t border-border bg-background px-4 py-3 shadow-md"
        >
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-md px-3 py-2 text-start text-sm font-medium text-foreground/80",
                      "hover:bg-accent hover:text-accent-foreground",
                      FOCUS_RING_CLASSNAME,
                      isActive && "bg-accent text-foreground",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

function MenuIcon({ isOpen }: { isOpen: boolean }) {
  if (isOpen) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path
          d="M6 6l12 12M18 6L6 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
