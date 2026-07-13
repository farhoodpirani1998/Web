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
 * `Header` renders, since both are the same frontend-owned structural
 * nav, not independently maintained content.
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

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted">
      <Container>
        <Section spacing="lg" tone="transparent" as="div">
          <Grid cols="3" gap="lg">
            <Stack gap="sm">
              <Heading level={2} as="h3">
                {APP_NAME}
              </Heading>
              <Text variant="bodySm" color="muted">
                {SITE_DESCRIPTION_PLACEHOLDER}
              </Text>
            </Stack>

            <Stack gap="sm" as="nav" aria-label="پیوندهای کاربردی فوتر">
              <Text variant="overline" as="span">
                پیوندهای کاربردی
              </Text>
              <Stack gap="xs" as="ul" className="list-none p-0 m-0">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      variant="muted"
                      className={cn("inline-block", FOCUS_RING_CLASSNAME)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </Stack>
            </Stack>

            <Stack gap="sm" as="address" className="not-italic">
              <Text variant="overline" as="span">
                اطلاعات تماس
              </Text>
              <Stack gap="xs">
                <Text variant="bodySm" color="muted">
                  {CONTACT_ADDRESS_PLACEHOLDER}
                </Text>
                <Link
                  href={CONTACT_PHONE_HREF}
                  variant="muted"
                  className={cn("inline-block", FOCUS_RING_CLASSNAME)}
                  dir="ltr"
                >
                  {CONTACT_PHONE_PLACEHOLDER}
                </Link>
                <Link
                  href={CONTACT_EMAIL_HREF}
                  variant="muted"
                  className={cn("inline-block", FOCUS_RING_CLASSNAME)}
                  dir="ltr"
                >
                  {CONTACT_EMAIL_PLACEHOLDER}
                </Link>
              </Stack>
            </Stack>
          </Grid>

          <Stack className="mt-8 border-t border-border pt-6" align="center">
            <Text variant="caption" color="muted" align="center">
              {`© ${year} ${APP_NAME}. تمامی حقوق محفوظ است.`}
            </Text>
          </Stack>
        </Section>
      </Container>
    </footer>
  );
}
