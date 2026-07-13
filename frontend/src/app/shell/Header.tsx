import { Container } from "@/shared/design-system/components/Container";
import { FOCUS_RING_CLASSNAME } from "@/shared/design-system/a11y";
import { cn } from "@/shared/utils/cn";
import { APP_NAME } from "@/shared/config/app";
import { Link } from "@/shared/design-system/components/ui/link";
import { DesktopNavigation } from "@/app/shell/DesktopNavigation";
import { MobileNavigation } from "@/app/shell/MobileNavigation";

/**
 * Persistent header chrome (§8 "Layout Architecture"), part of the
 * `AppShell` and rendered once, never re-mounted on route changes.
 *
 * Sprint 3A scope: structural nav only. The logo/brand mark and contact
 * info are Site Settings–derived content (§4, §8) and are wired in once
 * that feature exists — the app name is used as a text placeholder here
 * so the brand link has *something* accessible in the meantime, not as
 * a stand-in for real Site Settings content.
 */
export function Header() {
  return (
    <header className="relative border-b border-border bg-background">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          variant="subtle"
          className={cn("font-heading text-base font-semibold no-underline", FOCUS_RING_CLASSNAME)}
        >
          {APP_NAME}
        </Link>

        <DesktopNavigation />
        <MobileNavigation />
      </Container>
    </header>
  );
}
