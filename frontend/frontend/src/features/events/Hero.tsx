import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Events page "Hero" section — first section of the `events` feature,
 * mirroring `@/features/campuses`'s and `@/features/teachers`'s
 * `Hero` sections (which themselves follow the same pattern as
 * `hero`/`about`/`schools`/`pre-registration`'s `Hero` sections).
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately the backend's
 * Events content-module data (§4, §8); this renders frontend-owned
 * Persian placeholder copy in the meantime.
 *
 * This feature is deliberately isolated, matching the same "new,
 * isolated feature" scope `@/features/campuses` and
 * `@/features/teachers` were built under — no other feature/page is
 * replaced, renamed, or modified.
 *
 * Visual refresh: adopts the same gold-badge/underline eyebrow
 * treatment and soft gradient backdrop already established by the
 * homepage `Hero`/`Features` sections (and now `AboutHero`/
 * `GalleryHero`/`NewsHero`/`CampusesHero`/`TeachersHero`), so this
 * page reads as part of the same premium navy/gold system instead of
 * a plain text block. Still zero new dependencies — the backdrop is a
 * plain `aria-hidden` `div` built from existing tokens, the same
 * technique those sections already use.
 */
export function Hero() {
  return (
    <Section
      spacing="lg"
      aria-labelledby="events-hero-heading"
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
          رویدادها
        </Badge>

        <Stack gap="xs" align="start">
          <Heading id="events-hero-heading" level={1}>
            رویدادها و برنامه‌های مجموعه ما
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>

        <Text variant="lead" className="max-w-2xl text-foreground/70">
          متنی نمونه درباره رویدادهای پیش‌رو، جشن‌ها، کارگاه‌های آموزشی و بازدیدهای علمی
          مجموعه. زمان، مکان و جزئیات هر رویداد در نهایت از طریق سامانه مدیریت محتوا و
          سرویس عمومی بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}
