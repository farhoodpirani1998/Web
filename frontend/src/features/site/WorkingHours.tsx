import { Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Site Settings "Working Hours" section — the weekly schedule a real
 * Site Settings record would carry, following the same pattern as
 * `hero`/`about`/`contact`/`schools`/`news`/`gallery`/`statistics`.
 *
 * Backed by `useSiteSettings()` (Website Frontend Architecture §4, §8):
 * renders `data.workingHours` when the query has resolved with at
 * least one row, and falls back to this section's original
 * frontend-owned placeholder schedule while the query is loading, has
 * errored, or the CMS has no rows configured yet.
 *
 * Rendered as a `<dl>` (day = term, hours = description) rather than a
 * generic `Grid`/`Card` row list — this is genuinely paired label/value
 * data, so the semantic list primitive gives assistive technology an
 * explicit structure to announce instead of relying on visual
 * proximity alone (§26 accessibility).
 */

export function WorkingHours() {
  return (
    <Section spacing="lg" aria-labelledby="site-hours-heading">
      <Stack gap="md">
        <Heading id="site-hours-heading" level={2}>
          ساعات کاری
        </Heading>
        <Text variant="bodySm" color="muted">
          ساعات کاری هنوز در تنظیمات ثبت نشده است.
        </Text>
      </Stack>
    </Section>
  );
}
