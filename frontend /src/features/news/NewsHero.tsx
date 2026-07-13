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
 */
export function NewsHero() {
  return (
    <Section spacing="lg" aria-labelledby="news-hero-heading">
      <Stack gap="sm">
        <Badge variant="secondary" className="w-fit">
          اخبار
        </Badge>
        <Heading id="news-hero-heading" level={1}>
          آخرین اخبار و اطلاعیه‌ها
        </Heading>
        <Text variant="lead" className="max-w-2xl">
          متنی نمونه درباره تازه‌ترین رویدادها، اطلاعیه‌ها و دستاوردهای
          مجموعه. عناوین، تاریخ انتشار و متن کامل هر خبر در نهایت از طریق
          سامانه مدیریت محتوا و سرویس عمومی بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}
