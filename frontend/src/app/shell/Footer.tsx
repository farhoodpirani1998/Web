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
import { APP_NAME, APP_NAME_EN } from "@/shared/config/app";
import { NAV_ITEMS } from "@/app/shell/nav-data";
import { useSiteSettings } from "@/features/site";
import { getContactPhones, toTelephoneHref } from "@/shared/config/contact";
import { toPersianDigits } from "@/shared/utils/toPersianDigits";
import { useTrustBadges } from "@/features/trust-badges";
import { useCampuses } from "@/features/campuses";

/**
 * Persistent footer chrome (§8 "Layout Architecture"), mounted once in
 * `AppShell` below `ContentWrapper`, never re-mounted on route changes —
 * the same pattern `Header` already follows.
 *
 * Rebuilt to match the approved Figma design's `Footer` (Figma Design
 * Reference §4.13): four columns — brand+description | quick links |
 * schools list | contact info — replacing the earlier two-way NAV_ITEMS
 * split. Contact details now come from Site Settings, including all
 * configured telephone numbers.
 *
 * Resolved open decisions from the reference doc (§5):
 * - §5.3 footer color: a dedicated `--footer-bg` token
 *   (`shared/design-system/tokens/tokens.css`) matching Figma's
 *   `#0A1E38` exactly, rather than reusing `--primary`/`--brand-navy`
 *   at an opacity — the two are visibly distinct brand surfaces.
 * - §5.6 `href="#"` links: Figma's Privacy/Terms/Sitemap row has no
 *   real routes yet, so — same "no placeholder code" convention
 *   `Hero`/`TopBar` already follow — that row is left out entirely
 *   rather than wired to `#`. Once those routes exist, adding the row
 *   back is additive.
 *
 * The schools list uses the public `useCampuses` feature hook so links
 * always target live campus IDs and match the anchors rendered by
 * `CampusDetails`.
 *
 * Presentation only: composed from existing design-system primitives
 * (`Container`, `Grid`, `Stack`, `Heading`, `Text`, `Link`) plus local,
 * `aria-hidden` decorative SVG helpers in the same spirit as `Header`'s
 * `BrandMark` — no new shared component, no data fetching, no business
 * logic.
 *
 * Persian-first and RTL-compatible: the document root already sets
 * `lang="fa"`/`dir="rtl"` (see `index.html`), and every primitive used
 * here (`Container`, `Grid`, `Stack`, `Text`, `Link`) is logical-
 * property-based, so this component needs no direction-specific
 * overrides of its own.
 */

/** Figma's primary nav set (§4.2), reused here as the footer's "quick links" column. */
const FOOTER_QUICK_LINKS = NAV_ITEMS.filter((item) =>
  ["/", "/schools", "/about", "/news", "/pre-registration", "/contact"].includes(item.href),
);

/** Shared on-navy link treatment for every footer link (nav + contact). */
const FOOTER_LINK_CLASSNAME = cn(
  "inline-block text-white/70 transition-colors hover:text-brand-gold",
  FOCUS_RING_CLASSNAME,
);

export function Footer() {
  const year = new Date().getFullYear();
  const { data } = useSiteSettings();
  const { data: trustBadges = [] } = useTrustBadges();
  const { data: campuses = [] } = useCampuses();
  const siteName = data?.siteName.fa ?? APP_NAME;
  const siteNameEn = data?.siteName.en ?? APP_NAME_EN;
  const phones = getContactPhones(data?.contactPhones, data?.contactPhone);
  const email = data?.contactEmail;
  const address = data?.address?.fa;
  const socialLinks = data?.socialLinks.filter((social) => social.active !== false) ?? [];

  return (
    <footer className="border-t border-brand-gold/20 bg-footer text-white">
      <Container>
        <Section spacing="lg" tone="transparent" as="div">
          <Grid cols="4" gap="lg">
            <Stack gap="sm" className="sm:col-span-2 lg:col-span-1">
              <Stack direction="row" align="center" gap="sm">
                {data?.logo?.url ? (
                  <img
                    src={data.logo.url}
                    alt={data.logo.altText || siteName}
                    className="h-11 w-11 shrink-0 rounded-md object-contain"
                  />
                ) : (
                  <FooterBrandMark className="h-11 w-11 shrink-0" />
                )}
                <Stack gap="none" className="min-w-0">
                  <Heading level={3} as="h3" className="text-white">
                    {siteName}
                  </Heading>
                  {data?.tagline?.fa ? (
                    <Text variant="caption" className="text-brand-gold">
                      {data.tagline.fa}
                    </Text>
                  ) : null}
                  <Text variant="caption" className="text-white/50" dir="ltr">
                    {siteNameEn}
                  </Text>
                </Stack>
              </Stack>
              {data?.tagline?.fa ? (
                <Text variant="bodySm" className="text-white/70">
                  {data.tagline.fa}
                </Text>
              ) : null}
            </Stack>

            <Stack gap="sm" as="nav" aria-label="لینک‌های سریع فوتر">
              <Text variant="overline" as="span" className="text-brand-gold">
                لینک‌های سریع
              </Text>
              <Stack gap="xs" as="ul" className="list-none p-0 m-0">
                {FOOTER_QUICK_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} variant="muted" className={FOOTER_LINK_CLASSNAME}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </Stack>
            </Stack>

            <Stack gap="sm" as="nav" aria-label="فهرست مدارس در فوتر">
              <Text variant="overline" as="span" className="text-brand-gold">
                مدارس ما
              </Text>
              <Stack gap="xs" as="ul" className="list-none p-0 m-0">
                {campuses.map((campus) => (
                  <li key={campus.id}>
                    <Link
                      href={`/campuses#campus-${campus.id}`}
                      variant="muted"
                      className={FOOTER_LINK_CLASSNAME}
                    >
                      {campus.name}
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
                {address ? <Stack direction="row" gap="sm" align="start">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                  {data?.mapUrl ? (
                    <Link href={data.mapUrl} variant="muted" className={FOOTER_LINK_CLASSNAME}>
                      {address}
                    </Link>
                  ) : (
                    <Text variant="bodySm" className="text-white/70">{address}</Text>
                  )}
                </Stack> : null}
                {data?.mapLatitude != null && data.mapLongitude != null ? (
                  <iframe
                    title="موقعیت گروه آموزشی ندای حقیقت روی نقشه"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-36 w-full rounded-md border border-white/15"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(`${data.mapLatitude},${data.mapLongitude}`)}&output=embed`}
                  />
                ) : null}
                {phones.map((phone, index) => (
                  <Stack key={`${phone}-${index}`} direction="row" gap="sm" align="center">
                    <PhoneIcon className="h-4 w-4 shrink-0 text-brand-gold" />
                    <Link
                      href={toTelephoneHref(phone)}
                      variant="muted"
                      className={FOOTER_LINK_CLASSNAME}
                      dir="ltr"
                    >
                      {toPersianDigits(phone)}
                    </Link>
                  </Stack>
                ))}
                {email ? <Stack direction="row" gap="sm" align="center">
                  <MailIcon className="h-4 w-4 shrink-0 text-brand-gold" />
                  <Link
                    href={`mailto:${email}`}
                    variant="muted"
                    className={FOOTER_LINK_CLASSNAME}
                    dir="ltr"
                  >
                    {email}
                  </Link>
                </Stack> : null}
                {socialLinks.length > 0 ? (
                  <Stack gap="xs">
                    {socialLinks.map((social) => (
                      <Link
                        key={social.platform}
                        href={social.url}
                        variant="muted"
                        className={FOOTER_LINK_CLASSNAME}
                        dir="ltr"
                      >
                        {social.url.replace(/^https?:\/\//, "")}
                      </Link>
                    ))}
                  </Stack>
                ) : null}
              </Stack>
            </Stack>
          </Grid>

          {trustBadges.length > 0 ? (
            <Stack
              gap="sm"
              className="mt-8 border-t border-white/10 pt-6"
              aria-label="نشان‌های اعتماد"
            >
              <Text variant="overline" as="span" className="text-brand-gold">
                نشان‌های اعتماد
              </Text>
              <Stack direction="row" wrap align="center" gap="md">
                {trustBadges.map((badge) => {
                  const image = (
                    <img
                      src={badge.image.url}
                      alt={badge.image.altText || badge.name.fa}
                      loading="lazy"
                      className="h-16 w-16 rounded bg-white object-contain p-1"
                    />
                  );
                  return badge.url ? (
                    <a
                      key={badge.id}
                      href={badge.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={badge.name.fa}
                      className={FOOTER_LINK_CLASSNAME}
                    >
                      {image}
                    </a>
                  ) : (
                    <span key={badge.id} aria-label={badge.name.fa}>
                      {image}
                    </span>
                  );
                })}
              </Stack>
            </Stack>
          ) : null}

          <Stack
            direction="row"
            justify="between"
            align="center"
            wrap
            gap="sm"
            className="mt-10 border-t border-white/10 pt-6"
          >
            <Text variant="caption" className="text-white/60">
              {`© ${year} ${siteName}. تمامی حقوق محفوظ است.`}
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
