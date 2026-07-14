import { Avatar, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { APP_NAME } from "@/shared/config/app";

/**
 * Site Settings "Brand" section — first section of the `site` feature
 * (Website Frontend Architecture §4, §10 "Section Architecture"),
 * following the same pattern as `hero`/`about`/`contact`/`schools`/
 * `news`/`gallery`/`statistics`.
 *
 * This feature is presentation-only scaffolding for the backend's
 * **Site Settings** content module (§4, §8) — logo, site name,
 * tagline, contact details, social links, working hours, and
 * copyright/legal text. No such endpoint exists on the Public API yet,
 * so every value here is a frontend-owned, CMS-ready placeholder:
 * shaped the way a future `useSiteSettings()` data hook's result would
 * look, so swapping this section's constants for real data later is
 * additive — only this file changes, never its callers.
 *
 * The logo is represented with the existing `Avatar` primitive in its
 * fallback (initials) state, the same "labelled placeholder instead of
 * invented media" move already used by `AboutTeam` — there is no real
 * logo asset to point an `Image` at yet.
 */

const BRAND_NAME_PLACEHOLDER = APP_NAME;
const BRAND_TAGLINE_PLACEHOLDER = "ارتقای کیفیت آموزش، همراه شما در مسیر یادگیری";

export function Brand() {
  return (
    <Section spacing="lg" aria-labelledby="site-brand-heading">
      <Stack gap="md">
        <Heading id="site-brand-heading" level={2}>
          هویت برند
        </Heading>
        <Stack direction="row" gap="md" align="center">
          <Avatar
            alt={BRAND_NAME_PLACEHOLDER}
            fallback={BRAND_NAME_PLACEHOLDER.slice(0, 1)}
            size="lg"
          />
          <Stack gap="xs">
            <Text weight="semibold">{BRAND_NAME_PLACEHOLDER}</Text>
            <Text variant="bodySm" color="muted">
              {BRAND_TAGLINE_PLACEHOLDER}
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Section>
  );
}
