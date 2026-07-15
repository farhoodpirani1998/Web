import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * News page "Hero" section — first section of the `news` feature
 * (Website Frontend Architecture §4, §10 "Section Architecture"),
 * following the same pattern as `hero`/`features`/`cta`/`about`/
 * `contact`/`schools`.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately the backend's
 * News/Announcements content module (§4, §8); no such endpoint exists
 * on the Public API yet, so this renders frontend-owned Persian
 * placeholder copy in the meantime. Swapping this for a
 * `useNews()`-style data hook later is additive — `NewsPage` only ever
 * composes `<NewsHero />`, never its internals.
 *
 * Visual refresh: adopts the same gold-badge/underline eyebrow
 * treatment and soft gradient backdrop already established by the
 * homepage `Hero`/`Features` sections (and now `GalleryHero`), so this
 * page reads as part of the same premium navy/gold system instead of a
 * plain text block.
 */
export function NewsHero() {
  return (
    <Section
      spacing="lg"
      aria-labelledby="news-hero-heading"
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
          اخبار
        </Badge>

        <Stack gap="xs" align="start">
          <Heading id="news-hero-heading" level={1}>
            آخرین اخبار و اطلاعیه‌ها
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>

        <Text variant="lead" className="max-w-2xl text-foreground/70">
          متنی نمونه درباره تازه‌ترین رویدادها، اطلاعیه‌ها و دستاوردهای
          مجموعه. عناوین، تاریخ انتشار و متن کامل هر خبر در نهایت از طریق
          سامانه مدیریت محتوا و سرویس عمومی بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}
