import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Contact page "Intro" section — extracted from `ContactPage`'s inline
 * markup without changing layout or styling, following the same
 * pattern as the `hero`/`features`/`cta`/`about` features.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately Site Settings–
 * derived content (Website Frontend Architecture §8 "Layout
 * Architecture"); this renders frontend-owned Persian placeholder copy
 * in the meantime. Swapping this for a `useSiteSettings()`-style data
 * hook later is additive — `ContactPage` only ever composes
 * `<ContactIntro />`, never its internals.
 *
 * Visual refresh: now wraps its content in a `Section` (with the same
 * gold-badge/underline eyebrow and soft gradient backdrop `AboutHero`/
 * `GalleryHero`/`NewsHero` already use) instead of a bare `Stack`, so
 * this page picks up the same vertical rhythm and premium navy/gold
 * treatment as every other page — `ContactPage` still composes
 * `<ContactIntro />` exactly as before, this component just fills more
 * of its own space now.
 */
export function ContactIntro() {
  return (
    <Section
      spacing="lg"
      aria-labelledby="contact-intro-heading"
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
          ارتباط با ما
        </Badge>

        <Stack gap="xs" align="start">
          <Heading id="contact-intro-heading" level={1}>
            تماس با ما
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>

        <Text variant="lead" className="max-w-2xl text-foreground/70">
          متن نمونه برای معرفی راه‌های ارتباطی با مجموعه. اطلاعات تماس واقعی
          پس از اتصال به سامانه مدیریت محتوا از سرویس عمومی بک‌اند دریافت
          خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}
