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
 *
 * Visual refresh: adopts the same gold-badge/underline eyebrow
 * treatment and soft gradient backdrop already established by the
 * homepage `Hero`/`Features` sections (and now `GalleryHero`/
 * `NewsHero`), so this page reads as part of the same premium
 * navy/gold system instead of a plain text block. Still zero new
 * dependencies — the backdrop is a plain `aria-hidden` `div` built
 * from existing tokens, the same technique `Hero` already uses.
 */
export function AboutHero() {
  return (
    <Section
      spacing="lg"
      aria-labelledby="about-hero-heading"
      className="relative isolate overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-b from-muted/70 via-muted/15 to-transparent"
      />

      <Stack gap="sm" align="start" className="max-w-2xl">
        <Badge
          variant="outline"
          className="w-fit gap-1.5 rounded-full border-brand-gold/40 bg-brand-gold/10 px-3 py-1 text-brand-navy"
        >
          درباره ما
        </Badge>

        <Stack gap="xs" align="start">
          <Heading id="about-hero-heading" level={1}>
            با گروه آموزشی ما بیشتر آشنا شوید
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>

        <Text variant="lead" className="max-w-2xl text-foreground/70">
          متنی نمونه برای معرفی کلی مجموعه. این پاراگراف جایگزین خلاصه‌ای
          است که در آینده از طریق سامانه مدیریت محتوا و از سرویس عمومی
          بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}
