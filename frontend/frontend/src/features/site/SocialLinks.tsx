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

/**
 * Site Settings "Social Links" section — the outbound social-profile
 * URLs a real Site Settings record would carry, following the same
 * pattern as `hero`/`about`/`contact`/`schools`/`news`/`gallery`/
 * `statistics`.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Link`, `Text`) — no
 * data fetching, no business logic. Platforms are grouped into a local
 * array literal, shaped the way a future `useSiteSettings()` data
 * hook's result would look, so the eventual swap is a matter of
 * replacing this literal. There is no icon set in the design system
 * yet (§12, §13 — no new dependency introduced for this section), so
 * each platform is identified by its plain-text name rather than a
 * glyph; `Link` already renders `target="_blank"`/`rel="noopener
 * noreferrer"` for external hrefs like these on its own.
 */

const socialLinks = [
  { id: "instagram", label: "اینستاگرام", href: "https://instagram.com/example" },
  { id: "telegram", label: "تلگرام", href: "https://t.me/example" },
  { id: "whatsapp", label: "واتس‌اپ", href: "https://wa.me/000000000" },
  { id: "linkedin", label: "لینکدین", href: "https://linkedin.com/company/example" },
  { id: "youtube", label: "یوتیوب", href: "https://youtube.com/@example" },
  { id: "x", label: "ایکس (توییتر)", href: "https://x.com/example" },
] as const;

export function SocialLinks() {
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
        <Text variant="caption" color="muted">
          نشانی‌های نمایش داده‌شده نمونه‌اند و پس از اتصال به سامانه
          مدیریت محتوا با آدرس واقعی صفحات جایگزین خواهند شد.
        </Text>
      </Stack>
    </Section>
  );
}
