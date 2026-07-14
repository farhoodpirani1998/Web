import {
  Container,
  Grid,
  Heading,
  Link,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { FOCUS_RING_CLASSNAME } from "@/shared/design-system/a11y";
import { cn } from "@/shared/utils/cn";
import { APP_NAME } from "@/shared/config/app";
import { NAV_ITEMS } from "@/app/shell/nav-data";

/**
 * Persistent footer chrome (§8 "Layout Architecture"), mounted once in
 * `AppShell` below `ContentWrapper`, never re-mounted on route changes —
 * the same pattern `Header` already follows.
 *
 * Presentation only: every string below (site name, description,
 * contact details) is a frontend-owned placeholder, shaped the way a
 * future Site Settings–derived data hook would return it (§4, §8,
 * §35 "does not invent backend functionality" — no such public
 * endpoint exists yet). Swapping these constants for real CMS content
 * later is additive; this component never assumes their shape beyond
 * plain strings. Navigation links reuse the same `NAV_ITEMS` list the
 * `Header` renders (split across two columns purely for footer
 * scannability), since both are the same frontend-owned structural
 * nav, not independently maintained content.
 *
 * Brand pass: a dark navy/gold surface — the same identity `Header`'s
 * `BrandMark` and `Hero`'s `HeroEmblem` already establish — so the
 * chrome reads as one consistent school brand system from top to
 * bottom of the page. Still composed only from existing design-system
 * primitives (`Container`, `Grid`, `Stack`, `Heading`, `Text`, `Link`)
 * plus local, `aria-hidden` decorative SVG helpers in the same spirit
 * as `Header`'s `BrandMark` and `Hero`'s `SparkIcon`/`HeroEmblem` — no
 * new shared component, no data fetching, no business logic.
 *
 * Persian-first and RTL-compatible: the document root already sets
 * `lang="fa"`/`dir="rtl"` (see `index.html`), and every primitive used
 * here (`Container`, `Grid`, `Stack`, `Text`, `Link`) is logical-
 * property-based, so this component needs no direction-specific
 * overrides of its own.
 */

const SITE_DESCRIPTION_PLACEHOLDER =
  "گروه آموزشی ندای حقیقت با هدف ارتقای کیفیت آموزش و یادگیری، محتوای آموزشی و خدمات مشاوره‌ای را برای دانش‌آموزان و خانواده‌های آن‌ها فراهم می‌کند.";

const CONTACT_ADDRESS_PLACEHOLDER = "تهران، خیابان ولیعصر، پلاک ۱۲۳، طبقه ۲";
const CONTACT_PHONE_PLACEHOLDER = "۰۲۱-۱۲۳۴۵۶۷۸";
const CONTACT_PHONE_HREF = "tel:+982112345678";
const CONTACT_EMAIL_PLACEHOLDER = "info@example.com";
const CONTACT_EMAIL_HREF = "mailto:info@example.com";

/** Shared on-navy link treatment for every footer link (nav + contact). */
const FOOTER_LINK_CLASSNAME = cn(
  "inline-block text-white/70 transition-colors hover:text-brand-gold",
  FOCUS_RING_CLASSNAME,
);

/** `NAV_ITEMS`, split into two even columns purely for footer layout. */
const FOOTER_NAV_SPLIT = Math.ceil(NAV_ITEMS.length / 2);
const FOOTER_NAV_COLUMN_ONE = NAV_ITEMS.slice(0, FOOTER_NAV_SPLIT);
const FOOTER_NAV_COLUMN_TWO = NAV_ITEMS.slice(FOOTER_NAV_SPLIT);

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-gold/20 bg-brand-navy text-white">
      <Container>
        <Section spacing="lg" tone="transparent" as="div">
          <Grid cols="4" gap="lg">
            <Stack gap="sm" className="sm:col-span-2 lg:col-span-1">
              <Stack direction="row" align="center" gap="sm">
                <FooterBrandMark className="h-11 w-11 shrink-0" />
                <Stack gap="none" className="min-w-0">
                  <Heading level={3} as="h3" className="text-white">
                    {APP_NAME}
                  </Heading>
                  <Text variant="caption" className="text-brand-gold">
                    گروه آموزشی
                  </Text>
                </Stack>
              </Stack>
              <Text variant="bodySm" className="text-white/70">
                {SITE_DESCRIPTION_PLACEHOLDER}
              </Text>
            </Stack>

            <Stack gap="sm" as="nav" aria-label="پیوندهای کاربردی فوتر (بخش اول)">
              <Text variant="overline" as="span" className="text-brand-gold">
                لینک‌های سریع
              </Text>
              <Stack gap="xs" as="ul" className="list-none p-0 m-0">
                {FOOTER_NAV_COLUMN_ONE.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} variant="muted" className={FOOTER_LINK_CLASSNAME}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </Stack>
            </Stack>

            <Stack gap="sm" as="nav" aria-label="پیوندهای کاربردی فوتر (بخش دوم)">
              <Text variant="overline" as="span" className="text-brand-gold">
                دسترسی بیشتر
              </Text>
              <Stack gap="xs" as="ul" className="list-none p-0 m-0">
                {FOOTER_NAV_COLUMN_TWO.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} variant="muted" className={FOOTER_LINK_CLASSNAME}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </Stack>
            </Stack>

            <Stack gap="sm" as="address" className="not-italic">
              <Text variant="overline" as="span" className="text-brand-gold">
                اطلاعات تماس
              </Text>
              <Stack gap="sm">
                <Stack direction="row" gap="sm" align="start">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                  <Text variant="bodySm" className="text-white/70">
                    {CONTACT_ADDRESS_PLACEHOLDER}
                  </Text>
                </Stack>
                <Stack direction="row" gap="sm" align="center">
                  <PhoneIcon className="h-4 w-4 shrink-0 text-brand-gold" />
                  <Link
                    href={CONTACT_PHONE_HREF}
                    variant="muted"
                    className={FOOTER_LINK_CLASSNAME}
                    dir="ltr"
                  >
                    {CONTACT_PHONE_PLACEHOLDER}
                  </Link>
                </Stack>
                <Stack direction="row" gap="sm" align="center">
                  <MailIcon className="h-4 w-4 shrink-0 text-brand-gold" />
                  <Link
                    href={CONTACT_EMAIL_HREF}
                    variant="muted"
                    className={FOOTER_LINK_CLASSNAME}
                    dir="ltr"
                  >
                    {CONTACT_EMAIL_PLACEHOLDER}
                  </Link>
                </Stack>
              </Stack>
            </Stack>
          </Grid>

          <Stack
            direction="row"
            justify="between"
            align="center"
            wrap
            gap="sm"
            className="mt-10 border-t border-white/10 pt-6"
          >
            <Text variant="caption" className="text-white/60">
              {`© ${year} ${APP_NAME}. تمامی حقوق محفوظ است.`}
            </Text>
            <span aria-hidden="true" className="h-1 w-10 rounded-full bg-brand-gold/70" />
          </Stack>
        </Section>
      </Container>
    </footer>
  );
}

/**
 * Decorative footer brand crest — the same "open book" motif as
 * `Header`'s `BrandMark`, re-drawn for the dark navy footer surface
 * (gold linework only, no navy fill needed since the footer itself
 * already provides that background). Purely presentational and
 * `aria-hidden`, so it stays a local helper rather than a new shared
 * component, matching `BrandMark`/`HeroEmblem`'s existing convention.
 */
function FooterBrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="19" className="fill-white/5 stroke-brand-gold" strokeWidth="1.25" />
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

/** Decorative address-pin glyph. Presentational only. */
function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.25" />
    </svg>
  );
}

/** Decorative phone-receiver glyph. Presentational only. */
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8Z" />
    </svg>
  );
}

/** Decorative envelope glyph. Presentational only. */
function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}
