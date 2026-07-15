import * as React from "react";
import { LogIn } from "lucide-react";

import { Container } from "@/shared/design-system/components/Container";
import { FOCUS_RING_CLASSNAME } from "@/shared/design-system/a11y";
import { cn } from "@/shared/utils/cn";
import { APP_NAME } from "@/shared/config/app";
import { Link } from "@/shared/design-system/components/ui/link";
import { buttonVariants } from "@/shared/design-system/components/ui/button";
import { useNavigation, type NavigationItem } from "@/features/navigation";
import { DesktopNavigation, type NavLinkItem } from "@/app/shell/DesktopNavigation";
import { MobileNavigation } from "@/app/shell/MobileNavigation";
import { PortalModal } from "@/app/shell/PortalModal";
import { NAV_ITEMS } from "@/app/shell/nav-data";

/**
 * Frontend-owned fallback used only when the CMS Navigation endpoint
 * (`useNavigation`) has no usable data — a failed request, or (once
 * the backend genuinely has zero items) an empty response. A header
 * with no navigation at all is a worse failure mode than a brief,
 * stale-but-correct list of the routes this build actually ships
 * (`nav-data.ts`, still route-verified per that file's doc comment),
 * so this is the same array reshaped to `NavLinkItem` rather than a
 * second hand-maintained list.
 */
const FALLBACK_NAV_ITEMS: readonly NavLinkItem[] = NAV_ITEMS.map((item) => ({
  id: item.href,
  label: item.label,
  url: item.href,
}));

function sortByOrder(items: readonly NavigationItem[]): NavLinkItem[] {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map(({ id, label, url, target }) => ({ id, label, url, target }));
}

/**
 * Persistent header chrome (§8 "Layout Architecture"), part of the
 * `AppShell` and rendered once, never re-mounted on route changes.
 *
 * Sprint 3A scope: structural nav only. The logo/brand mark and contact
 * info are Site Settings–derived content (§4, §8) and are wired in once
 * that feature exists — the app name is used as a text placeholder here
 * so the brand link has *something* accessible in the meantime, not as
 * a stand-in for real Site Settings content.
 *
 * Visual refresh (brand pass): sticky/backdrop-blurred chrome, a small
 * presentational crest mark (`BrandMark`, decorative-only via
 * `aria-hidden`) paired with the existing `APP_NAME` text, and a
 * secondary CTA link. Purely a presentation change — still composed
 * only from existing design-system primitives (`Container`,
 * `buttonVariants`, `Link`) plus the same "local inline SVG" pattern
 * `MobileNavigation`'s `MenuIcon` already uses; no new shared
 * component, no new dependency, no change to nav data/behavior.
 *
 * Portal Login (Figma Design Reference §4.2/§4.3): `isPortalOpen` is
 * ordinary component-local UI state (§16) — it has no reason to live
 * anywhere else. `Header` owns it (rather than `PortalModal` owning its
 * own open state) because both the desktop trigger below *and*
 * `MobileNavigation`'s own trigger need to open the same single modal
 * instance — matching Figma's `App.tsx`, where one `<PortalModal />`
 * sits at the shell level rather than one per trigger.
 */
export function Header() {
  const [isPortalOpen, setIsPortalOpen] = React.useState(false);
  const { data, isLoading, isError } = useNavigation();

  // Header is the single fetch site for nav data (§16-style "owns the
  // state both consumers need"): DesktopNavigation and MobileNavigation
  // stay presentational and receive the already-resolved list, so the
  // loading/error/empty → fallback decision lives in exactly one place
  // instead of being re-derived by each consumer.
  const navItems = React.useMemo<readonly NavLinkItem[]>(() => {
    if (isLoading) return [];
    if (isError || !data || data.items.length === 0) return FALLBACK_NAV_ITEMS;
    return sortByOrder(data.items);
  }, [data, isLoading, isError]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link
          href="/"
          variant="subtle"
          className={cn("group flex items-center gap-3 no-underline", FOCUS_RING_CLASSNAME)}
        >
          <BrandMark className="h-10 w-10 shrink-0 transition-transform duration-300 group-hover:scale-105" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="max-w-[10rem] truncate font-heading text-base font-bold tracking-tight text-foreground sm:max-w-none">
              {APP_NAME}
            </span>
            <span className="text-xs font-medium tracking-wide text-brand-gold">
              گروه آموزشی
            </span>
          </span>
        </Link>

        <DesktopNavigation items={navItems} isLoading={isLoading} />

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPortalOpen(true)}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden gap-1.5 border-brand-navy text-brand-navy hover:border-brand-gold hover:bg-transparent hover:text-brand-gold sm:inline-flex",
            )}
          >
            <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
            ورود به پورتال
          </button>
          <Link
            href="/pre-registration"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "hidden bg-brand-gold text-brand-navy hover:bg-brand-gold/90 sm:inline-flex",
            )}
          >
            پیش‌ثبت‌نام
          </Link>
          <MobileNavigation
            items={navItems}
            isLoading={isLoading}
            onOpenPortal={() => setIsPortalOpen(true)}
          />
        </div>
      </Container>

      <PortalModal open={isPortalOpen} onClose={() => setIsPortalOpen(false)} />
    </header>
  );
}

/**
 * Decorative brand crest (a stylized "open book" mark inside a ring),
 * echoing the navy-and-gold identity in `tokens.css`. Purely
 * presentational — `aria-hidden`, no independent meaning — so it stays
 * a local helper here rather than a new design-system export.
 */
function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="19" className="fill-brand-navy" />
      <circle cx="20" cy="20" r="19" className="fill-none stroke-brand-gold" strokeWidth="1.25" />
      <path
        d="M12 25.5V15.8L20 11l8 4.8v9.7"
        className="fill-none stroke-brand-gold"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 11v14.5" className="stroke-brand-gold" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="20" cy="27.5" r="1.4" className="fill-brand-gold" />
    </svg>
  );
}
