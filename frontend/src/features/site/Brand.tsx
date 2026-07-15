import { Avatar, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { APP_NAME } from "@/shared/config/app";

import { useSiteSettings } from "./useSiteSettings";

/**
 * Site Settings "Brand" section — first section of the `site` feature
 * (Website Frontend Architecture §4, §10 "Section Architecture"),
 * following the same pattern as `hero`/`about`/`contact`/`schools`/
 * `news`/`gallery`/`statistics`.
 *
 * Backed by `useSiteSettings()` (the Public API's Site Settings content
 * module, §4, §8). While the query is loading, has errored, or a given
 * field is absent from the response, each value falls back to the
 * same frontend-owned placeholder this section rendered before it was
 * wired up — so the section never shows an empty/broken state.
 *
 * The logo is represented with the existing `Avatar` primitive; it
 * renders `logoUrl` when the CMS provides one, and falls back to its
 * initials state (the same "labelled placeholder instead of invented
 * media" move already used by `AboutTeam`) otherwise.
 */

const BRAND_NAME_PLACEHOLDER = APP_NAME;
const BRAND_TAGLINE_PLACEHOLDER = "ارتقای کیفیت آموزش، همراه شما در مسیر یادگیری";

export function Brand() {
  const { data } = useSiteSettings();

  const name = data?.brand.name ?? BRAND_NAME_PLACEHOLDER;
  const tagline = data?.brand.tagline ?? BRAND_TAGLINE_PLACEHOLDER;
  const logoUrl = data?.brand.logoUrl;

  return (
    <Section spacing="lg" aria-labelledby="site-brand-heading">
      <Stack gap="md">
        <Heading id="site-brand-heading" level={2}>
          هویت برند
        </Heading>
        <Stack direction="row" gap="md" align="center">
          <Avatar src={logoUrl} alt={name} fallback={name.slice(0, 1)} size="lg" />
          <Stack gap="xs">
            <Text weight="semibold">{name}</Text>
            <Text variant="bodySm" color="muted">
              {tagline}
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Section>
  );
}
