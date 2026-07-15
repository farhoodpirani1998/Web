import { Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { APP_NAME } from "@/shared/config/app";

/**
 * Site Settings "Copyright" section — the legal/copyright line a real
 * Site Settings record would carry, following the same pattern as
 * `hero`/`about`/`contact`/`schools`/`news`/`gallery`/`statistics`.
 * Mirrors the same copyright line the app-shell's `Footer` already
 * renders (same category of Site Settings–derived data), scoped here
 * as its own settings section rather than page chrome.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Text`) — no data fetching, no
 * business logic. The year is computed at render time (not a CMS
 * field) since it's a pure function of "now", not editorial content;
 * everything else is a frontend-owned, CMS-ready placeholder.
 */
export function Copyright() {
  const year = new Date().getFullYear();

  return (
    <Section spacing="md" aria-labelledby="site-copyright-heading">
      <Stack gap="xs">
        <Heading id="site-copyright-heading" level={2}>
          کپی‌رایت
        </Heading>
        <Text variant="bodySm" color="muted">
          {`© ${year} ${APP_NAME}. تمامی حقوق محفوظ است.`}
        </Text>
      </Stack>
    </Section>
  );
}
