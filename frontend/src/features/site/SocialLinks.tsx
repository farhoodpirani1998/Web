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

const SOCIAL_LINKS_PLACEHOLDER = [
  { id: "instagram", label: "اینستاگرام", href: "https://instagram.com/example" },
  { id: "telegram", label: "تلگرام", href: "https://t.me/example" },
  { id: "whatsapp", label: "واتس‌اپ", href: "https://wa.me/000000000" },
  { id: "linkedin", label: "لینکدین", href: "https://linkedin.com/company/example" },
  { id: "youtube", label: "یوتیوب", href: "https://youtube.com/@example" },
  { id: "x", label: "ایکس (توییتر)", href: "https://x.com/example" },
] as const;

export function SocialLinks() {
  const { data } = useSiteSettings();
  const hasApiLinks = Boolean(data?.socialLinks && data.socialLinks.length > 0);
  const socialLinks = hasApiLinks ? data!.socialLinks : SOCIAL_LINKS_PLACEHOLDER;

  return (
    <Section spacing="lg" aria-labelledby="site-social-heading">
      <Stack gap="md">
        <Heading id="site-social-heading" level={2}>
          شبکه‌های اجتماعی
        </Heading>
        <Grid cols="3" gap="md">
          {socialLinks.map((social) => (
            <Card key={social.id} variant="outline" padding="md">
              <CardHeader className="p-0">
                <CardTitle>{social.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <Link href={social.href} variant="subtle" dir="ltr" className="inline-block">
                  {social.href.replace(/^https:\/\//, "")}
                </Link>
              </CardContent>
            </Card>
          ))}
        </Grid>
        {!hasApiLinks && (
          <Text variant="caption" color="muted">
            نشانی‌های نمایش داده‌شده نمونه‌اند و پس از اتصال به سامانه
            مدیریت محتوا با آدرس واقعی صفحات جایگزین خواهند شد.
          </Text>
        )}
      </Stack>
    </Section>
  );
}
