import { Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { APP_NAME } from "@/shared/config/app";

import { useSiteSettings } from "./useSiteSettings";

/**
 * Site Settings "Copyright" section — the legal/copyright line a real
 * Site Settings record would carry, following the same pattern as
 * `hero`/`about`/`contact`/`schools`/`news`/`gallery`/`statistics`.
 * Mirrors the same copyright line the app-shell's `Footer` already
 * renders (same category of Site Settings–derived data), scoped here
 * as its own settings section rather than page chrome.
 *
 * Backed by `useSiteSettings()` (Website Frontend Architecture §4, §8):
 * renders the CMS's fully-formed `copyright.text` line when available,
 * falling back to the section's original render-time-computed
 * placeholder (current year + `APP_NAME`) while the query is loading,
 * has errored, or the field is absent.
 */
export function Copyright() {
  const { data } = useSiteSettings();
  const year = new Date().getFullYear();
  const copyrightText = data?.copyright.text ?? `© ${year} ${APP_NAME}. تمامی حقوق محفوظ است.`;

  return (
    <Section spacing="md" aria-labelledby="site-copyright-heading">
      <Stack gap="xs">
        <Heading id="site-copyright-heading" level={2}>
          کپی‌رایت
        </Heading>
        <Text variant="bodySm" color="muted">
          {copyrightText}
        </Text>
      </Stack>
    </Section>
  );
}
