import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

import { useSiteSettings } from "./useSiteSettings";

/**
 * Site Settings "General Website Information" section — the
 * miscellaneous site-level fields (name, description, founding year,
 * default locale) a real Site Settings record would carry, following
 * the same pattern as `hero`/`about`/`contact`/`schools`/`news`/
 * `gallery`/`statistics`.
 *
 * Backed by `useSiteSettings()` (Website Frontend Architecture §4, §8).
 * Fields are still grouped into a local array literal so the layout
 * below doesn't need to change, but each field's `value` now reads
 * from the API response, falling back to this section's original
 * frontend-owned placeholder while the query is loading, has errored,
 * or the field (e.g. optional `foundedYear`) is absent.
 */

export function GeneralWebsiteInformation() {
  const { data } = useSiteSettings();
  const siteName = data?.siteName.fa;
  const tagline = data?.tagline?.fa;

  return (
    <Section spacing="lg" aria-labelledby="site-general-heading">
      <Stack gap="md">
        <Stack gap="sm">
          <Badge variant="secondary" className="w-fit">
            تنظیمات سایت
          </Badge>
          <Heading id="site-general-heading" level={2}>
            اطلاعات عمومی وب‌سایت
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            {tagline ?? "اطلاعات عمومی سایت از تنظیمات مدیریت محتوا دریافت می‌شود."}
          </Text>
        </Stack>

        {siteName ? <Text variant="bodySm" color="muted">{siteName}</Text> : null}
      </Stack>
    </Section>
  );
}
