import { Mail, MapPin, Phone } from "lucide-react";

import { Container, Stack } from "@/shared/design-system/components";
import { Link } from "@/shared/design-system/components/ui/link";
import { FOCUS_RING_CLASSNAME } from "@/shared/design-system/a11y";
import { cn } from "@/shared/utils/cn";
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_EMAIL_HREF, CONTACT_PHONE, CONTACT_PHONE_HREF } from "@/shared/config/contact";

/**
 * Persistent top strip (Figma Design Reference §4.1 "TopBar"), mounted
 * once in `AppShell` above `Header` — the same persistent,
 * router-agnostic pattern `Header`/`Footer` already follow.
 *
 * Figma's TopBar also has a right-hand cluster of social icons
 * (Instagram/Telegram/Aparat), every one of them `href="#"` in the
 * source design. Per the reference doc's own open-decision item (§5.6)
 * and the project's "no placeholder code" convention (already applied
 * by `Hero`/`CTA` when a Figma CTA had no real route to point at), a
 * link with no real destination is left out entirely rather than wired
 * to `#` — so that cluster is intentionally not reproduced here. Once
 * real social URLs exist (Site Settings content module, §4, §8), that
 * block is additive.
 *
 * Contact details reuse `shared/config/contact` (shared with `Footer`)
 * — the same frontend-owned placeholder values two chrome components
 * would otherwise each hardcode separately.
 *
 * Responsive per Figma: phone always visible, email only from `md`,
 * the (unlinked) short address only from `lg`.
 */
export function TopBar() {
  return (
    <div className="hidden bg-primary text-white/70 sm:block">
      <Container>
        <Stack direction="row" align="center" justify="between" gap="md" className="h-9 text-xs">
          <Stack direction="row" align="center" gap="md">
            <Link
              href={CONTACT_PHONE_HREF}
              className={cn(
                "inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-brand-gold",
                FOCUS_RING_CLASSNAME,
              )}
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              <span dir="ltr">{CONTACT_PHONE}</span>
            </Link>
            <Link
              href={CONTACT_EMAIL_HREF}
              className={cn(
                "hidden items-center gap-1.5 text-white/70 transition-colors hover:text-brand-gold md:inline-flex",
                FOCUS_RING_CLASSNAME,
              )}
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              <span dir="ltr">{CONTACT_EMAIL}</span>
            </Link>
          </Stack>

          <Stack direction="row" align="center" gap="xs" className="hidden lg:flex">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{CONTACT_ADDRESS}</span>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
