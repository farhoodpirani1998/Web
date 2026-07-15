import { NavLink } from "react-router-dom";

import { FOCUS_RING_CLASSNAME } from "@/shared/design-system/a11y";
import { Skeleton } from "@/shared/design-system/components/ui/skeleton";
import { cn } from "@/shared/utils/cn";

/**
 * Minimal shape `DesktopNavigation`/`MobileNavigation` need to render a
 * link — a subset of the CMS `NavigationItem` (`@/features/navigation`)
 * that also fits the frontend-owned fallback list. `Header` is the only
 * place that reconciles those two sources (loading/error/empty →
 * fallback), so this type — not the full `NavigationItem` — is the
 * contract between `Header` and its two presentational nav children.
 *
 * `children` (submenus) exist on the CMS type but aren't rendered yet —
 * no dropdown/flyout primitive exists in the design system (§12) for
 * either nav to build one on top of; top-level items only, same as the
 * `nav-data.ts` placeholder this replaces.
 */
export interface NavLinkItem {
  id: string;
  label: string;
  url: string;
  target?: "_self" | "_blank";
}

export interface DesktopNavigationProps {
  /** Already resolved by `Header` — real CMS items, or the fallback list. */
  items: readonly NavLinkItem[];
  /** True only while the initial fetch is in flight and no data exists yet. */
  isLoading?: boolean;
}

const EXTERNAL_URL_PATTERN = /^([a-z][a-z0-9+.-]*:)?\/\//i;

function isExternalUrl(url: string): boolean {
  return EXTERNAL_URL_PATTERN.test(url);
}

function linkClassName(isActive: boolean): string {
  return cn(
    "relative whitespace-nowrap rounded-sm px-0.5 py-2 text-sm font-medium tracking-tight text-foreground/70 transition-colors hover:text-foreground",
    "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-brand-gold after:transition-transform after:duration-300 hover:after:scale-x-100",
    FOCUS_RING_CLASSNAME,
    isActive && "text-foreground after:scale-x-100",
  );
}

/** Static, fixed-width placeholder bars — enough to fill the nav's usual footprint without layout jump once real items arrive. */
const SKELETON_WIDTHS = ["w-12", "w-16", "w-14", "w-20", "w-14", "w-16", "w-24"] as const;

/**
 * Desktop nav (§8, §26, §27): shown from `md` upward, hidden below it
 * where `MobileNavigation` takes over. Both are fed the same resolved
 * `items` prop from `Header`, so there is exactly one nav structure,
 * not two independently maintained ones.
 *
 * `react-router-dom`'s `NavLink` sets `aria-current="page"` on the
 * active link automatically (§26 "correct focus/state management"); the
 * active *visual* treatment below only adds color/underline, it doesn't
 * re-derive that attribute. CMS items can be external URLs (§4), which
 * `NavLink`'s client-side routing can't handle, so those render as a
 * plain `<a>` instead.
 */
export function DesktopNavigation({ items, isLoading = false }: DesktopNavigationProps) {
  if (isLoading) {
    return (
      <nav
        aria-label="ناوبری اصلی"
        aria-busy="true"
        className="hidden md:flex md:flex-wrap md:items-center md:justify-end md:gap-x-5 md:gap-y-1"
      >
        {SKELETON_WIDTHS.map((width, index) => (
          <Skeleton key={index} shape="text" className={cn(width, "h-4")} />
        ))}
      </nav>
    );
  }

  return (
    <nav
      aria-label="ناوبری اصلی"
      className="hidden md:flex md:flex-wrap md:items-center md:justify-end md:gap-x-5 md:gap-y-1"
    >
      {items.map((item) =>
        isExternalUrl(item.url) ? (
          <a
            key={item.id}
            href={item.url}
            target={item.target ?? "_blank"}
            rel="noopener noreferrer"
            className={linkClassName(false)}
          >
            {item.label}
          </a>
        ) : (
          <NavLink
            key={item.id}
            to={item.url}
            end={item.url === "/"}
            className={({ isActive }) => linkClassName(isActive)}
          >
            {item.label}
          </NavLink>
        ),
      )}
    </nav>
  );
}
