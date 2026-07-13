import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * About page "Hero" section — extracted from `AboutPage`'s inline
 * markup without changing layout, styling, or content, following the
 * same pattern as the homepage's `hero`/`features`/`cta` features.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately Static
 * Pages/About content-module data (Website Frontend Architecture §4,
 * §8); this renders frontend-owned Persian placeholder copy in the
 * meantime. Swapping this for a `useAboutPage()`-style data hook later
 * is additive — `AboutPage` only ever composes `<AboutHero />`, never
 * its internals.
 */
export function AboutHero() {
  return (
    <Section spacing="lg" aria-labelledby="about-hero-heading">
      <Stack gap="sm">
        <Badge variant="secondary" className="w-fit">
          درباره ما
        </Badge>
        <Heading id="about-hero-heading" level={1}>
          با گروه آموزشی ما بیشتر آشنا شوید
        </Heading>
        <Text variant="lead" className="max-w-2xl">
          متنی نمونه برای معرفی کلی مجموعه. این پاراگراف جایگزین خلاصه‌ای
          است که در آینده از طریق سامانه مدیریت محتوا و از سرویس عمومی
          بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}
