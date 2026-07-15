import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Academic Calendar page "Hero" section — first section of the
 * `academic-calendar` feature, following the same pattern as
 * `hero`/`about`/`campuses`/`teachers`/`admissions`'s `Hero` sections.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately the backend's
 * Academic Calendar content-module data (§4, §8); this renders
 * frontend-owned Persian placeholder copy in the meantime.
 *
 * This feature is deliberately isolated, matching the same "new,
 * isolated feature" scope `@/features/campuses`/`@/features/teachers`/
 * `@/features/admissions` were built under — no other feature or page
 * is replaced, renamed, or modified by this work.
 *
 * Visual refresh: adopts the same gold-badge/underline eyebrow
 * treatment and soft gradient backdrop already established by the
 * homepage `Hero`/`Features` sections (and now `AboutHero`/
 * `CampusesHero`/`TeachersHero`/`EventsHero`), so this page reads as
 * part of the same premium navy/gold system instead of a plain text
 * block. Still zero new dependencies — the backdrop is a plain
 * `aria-hidden` `div` built from existing tokens, the same technique
 * those sections already use.
 */
export function Hero() {
  return (
    <Section
      spacing="lg"
      aria-labelledby="academic-calendar-hero-heading"
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
          تقویم آموزشی
        </Badge>

        <Stack gap="xs" align="start">
          <Heading id="academic-calendar-hero-heading" level={1}>
            تقویم سال تحصیلی
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>

        <Text variant="lead" className="max-w-2xl text-foreground/70">
          متنی نمونه درباره تقویم سال تحصیلی، نیم‌سال‌ها، تعطیلات، بازه‌های امتحانی و
          تاریخ‌های مهم مجموعه. تاریخ‌های دقیق و نهایی در نهایت از طریق سامانه مدیریت
          محتوا و سرویس عمومی بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}
