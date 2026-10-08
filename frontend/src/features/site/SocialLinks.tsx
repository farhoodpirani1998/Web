import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Heading,
  Link,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";

import { useSiteSettings } from "./useSiteSettings";

/**
 * Site Settings "Social Links" section — the outbound social-profile
 * URLs a real Site Settings record would carry, following the same
 * pattern as `hero`/`about`/`contact`/`schools`/`news`/`gallery`/
 * `statistics`.
 *
 * Backed by `useSiteSettings()` (Website Frontend Architecture §4, §8):
 * renders `data.socialLinks` when the query has resolved with at least
 * one entry, and falls back to this section's original frontend-owned
 * placeholder list while the query is loading, has errored, or the
 * CMS has no links configured yet. There is no icon set in the design
 * system yet (§12, §13 — no new dependency introduced for this
 * section), so each platform is identified by its plain-text label
 * rather than a glyph; `Link` already renders `target="_blank"`/`rel=
 * "noopener noreferrer"` for external hrefs like these on its own.
 */

const SOCIAL_PLATFORM_LABELS = {
  instagram: "اینستاگرام",
  telegram: "تلگرام",
  whatsapp: "واتس‌اپ",
  eitaa: "ایتا",
  youtube: "یوتیوب",
  linkedin: "لینکدین",
  twitter: "توییتر",
  facebook: "فیسبوک",
} as const;

export function SocialLinks() {
  const { data } = useSiteSettings();
  const socialLinks = data?.socialLinks ?? [];

  return (
    <Section spacing="lg" aria-labelledby="site-social-heading">
      <Stack gap="md">
        <Heading id="site-social-heading" level={2}>
          شبکه‌های اجتماعی
        </Heading>
        <Grid cols="3" gap="md">
          {socialLinks.map((social) => (
            <Card key={social.platform} variant="outline" padding="md">
              <CardHeader className="p-0">
                <CardTitle>{SOCIAL_PLATFORM_LABELS[social.platform]}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <Link href={social.url} variant="subtle" dir="ltr" className="inline-block">
                  {social.url.replace(/^https:\/\//, "")}
                </Link>
              </CardContent>
            </Card>
          ))}
        </Grid>
        {socialLinks.length === 0 ? (
          <Text variant="caption" color="muted">شبکه‌ی اجتماعی‌ای در تنظیمات ثبت نشده است.</Text>
        ) : null}
      </Stack>
    </Section>
  );
}
