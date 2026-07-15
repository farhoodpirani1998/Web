import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Teachers page "Hero" section — first section of the `teachers`
 * feature, mirroring `@/features/campuses`'s `Hero` (which itself
 * follows the same pattern as `hero`/`about`/`schools`/
 * `pre-registration`'s `Hero` sections).
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately the backend's
 * Teachers content-module data (§4, §8); this renders frontend-owned
 * Persian placeholder copy in the meantime.
 *
 * This feature is deliberately isolated, matching the same "new,
 * isolated feature" scope `@/features/campuses` was built under —
 * no other feature/page is replaced, renamed, or modified.
 *
 * Visual refresh: adopts the same gold-badge/underline eyebrow
 * treatment and soft gradient backdrop already established by the
 * homepage `Hero`/`Features` sections (and now `AboutHero`/
 * `GalleryHero`/`NewsHero`/`CampusesHero`), so this page reads as part
 * of the same premium navy/gold system instead of a plain text block.
 * Still zero new dependencies — the backdrop is a plain `aria-hidden`
 * `div` built from existing tokens, the same technique those sections
 * already use.
 */
export function Hero() {
  return (
    <Section
      spacing="lg"
      aria-labelledby="teachers-hero-heading"
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
          کادر آموزشی
        </Badge>

        <Stack gap="xs" align="start">
          <Heading id="teachers-hero-heading" level={1}>
            با مدرسان مجموعه ما آشنا شوید
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>

        <Text variant="lead" className="max-w-2xl text-foreground/70">
          متنی نمونه درباره کادر آموزشی مجموعه و تخصص هر یک از مدرسان. سوابق، مدارک تحصیلی
          و حوزه تدریس هر مدرس در نهایت از طریق سامانه مدیریت محتوا و سرویس عمومی بک‌اند
          دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}
