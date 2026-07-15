import * as React from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { LogIn } from "lucide-react";

import { FOCUS_RING_CLASSNAME } from "@/shared/design-system/a11y";
import { VisuallyHidden } from "@/shared/design-system/components/VisuallyHidden";
import { Link } from "@/shared/design-system/components/ui/link";
import { buttonVariants } from "@/shared/design-system/components/ui/button";
import { Skeleton } from "@/shared/design-system/components/ui/skeleton";
import { APP_NAME } from "@/shared/config/app";
import { cn } from "@/shared/utils/cn";
import type { NavLinkItem } from "@/app/shell/DesktopNavigation";

const MOBILE_NAV_PANEL_ID = "mobile-nav-panel";
const EXTERNAL_URL_PATTERN = /^([a-z][a-z0-9+.-]*:)?\/\//i;

function isExternalUrl(url: string): boolean {
  return EXTERNAL_URL_PATTERN.test(url);
}

/** Fixed-width placeholder rows, same intent as `DesktopNavigation`'s skeleton bars. */
const SKELETON_WIDTHS = ["w-24", "w-32", "w-20", "w-28", "w-16", "w-24", "w-20"] as const;

export interface MobileNavigationProps {
  /** Already resolved by `Header` — real CMS items, or the fallback list. */
  items: readonly NavLinkItem[];
  /** True only while the initial fetch is in flight and no data exists yet. */
  isLoading?: boolean;
  /** Opens the shared `PortalModal` — the modal instance itself lives in `Header`. */
  onOpenPortal: () => void;
}

/**
 * Mobile nav (§8, §26, §27; Figma Design Reference §4.2 "Navbar"): a
 * toggle button plus an off-canvas drawer, shown below `md` where
 * `DesktopNavigation` is hidden. The open/closed state is ordinary
 * component-local UI state (§16).
 *
 * Drawer direction — **mirrored from Figma on purpose**: Figma's
 * source design opens the drawer from the right because it's an LTR
 * mock. This project is RTL-only (§28, `dir="rtl"` on the document
 * root), so the equivalent, natural-feeling drawer opens from the
 * *left* — the reference doc calls this out explicitly (§4.2, §5.2) as
 * a detail that must be reversed, not copied literally. Implemented
 * with CSS logical properties (`end-0`, `slide-in-from-end`) rather
 * than a hardcoded `left`/`right`, so "left in RTL" falls out of the
 * existing logical-property convention instead of a one-off override.
 *
 * Structure matches Figma: logo at the top, the nav link list, and the
 * Portal Login / pre-registration actions pinned at the bottom —
 * rebuilt as a real slide-in panel (`fixed` + `animate-in
 * slide-in-from-end` from `tailwindcss-animate`, already a dependency)
 * with a click-to-dismiss backdrop, replacing the previous dropdown-
 * under-header treatment.
 *
 * Bilingual accessibility (§26, §28): icon glyphs are hidden from
 * assistive technology (`aria-hidden`) and the toggle's accessible name
 * comes from real text via `VisuallyHidden`.
 */
export function MobileNavigation({ items, isLoading = false, onOpenPortal }: MobileNavigationProps) {
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
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

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50">
            <div
              aria-hidden="true"
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-primary/50 backdrop-blur-sm animate-in fade-in duration-200"
            />

            <nav
              id={MOBILE_NAV_PANEL_ID}
              aria-label="ناوبری اصلی"
              className={cn(
                "absolute inset-y-0 end-0 flex w-80 max-w-[85vw] flex-col bg-background shadow-2xl",
                "animate-in slide-in-from-end duration-300",
              )}
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <span className="font-heading text-sm font-bold text-foreground">{APP_NAME}</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground",
                    "hover:bg-accent hover:text-accent-foreground",
                    FOCUS_RING_CLASSNAME,
                  )}
                >
                  <CloseIcon />
                  <VisuallyHidden>بستن منو</VisuallyHidden>
                </button>
              </div>

              <ul
                className="flex flex-1 flex-col gap-1 overflow-y-auto p-4"
                aria-busy={isLoading || undefined}
              >
                {isLoading
                  ? SKELETON_WIDTHS.map((width, index) => (
                      <li key={index} className="px-3 py-2.5">
                        <Skeleton shape="text" className={cn(width, "h-4")} />
                      </li>
                    ))
                  : items.map((item) => {
                      const linkClassName = cn(
                        "flex items-center rounded-md px-3 py-2.5 text-start text-sm font-medium text-foreground/80",
                        "hover:bg-accent hover:text-accent-foreground",
                        FOCUS_RING_CLASSNAME,
                      );

                      if (isExternalUrl(item.url)) {
                        return (
                          <li key={item.id}>
                            <a
                              href={item.url}
                              target={item.target ?? "_blank"}
                              rel="noopener noreferrer"
                              className={linkClassName}
                            >
                              {item.label}
                            </a>
                          </li>
                        );
                      }

                      return (
                        <li key={item.id}>
                          <NavLink
                            to={item.url}
                            end={item.url === "/"}
                            className={({ isActive }) =>
                              cn(linkClassName, isActive && "bg-accent text-foreground")
                            }
                          >
                            {item.label}
                          </NavLink>
                        </li>
                      );
                    })}
              </ul>

              <div className="border-t border-border p-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenPortal();
                  }}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "mb-2 w-full gap-1.5 border-brand-navy text-brand-navy hover:border-brand-gold hover:bg-transparent hover:text-brand-gold",
                  )}
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  ورود به پورتال
                </button>
                <Link
                  href="/pre-registration"
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                    "w-full bg-brand-gold text-brand-navy hover:bg-brand-gold/90",
                  )}
                >
                  پیش‌ثبت‌نام
                </Link>
              </div>
            </nav>
          </div>,
          document.body,
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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
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
