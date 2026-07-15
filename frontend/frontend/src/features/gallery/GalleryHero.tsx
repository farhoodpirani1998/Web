import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Gallery page "Hero" section — first section of the `gallery` feature
 * (Website Frontend Architecture §4, §10 "Section Architecture"),
 * following the same pattern as `hero`/`features`/`cta`/`about`/
 * `contact`/`schools`/`news`.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately the backend's
 * Gallery/Media content module (§4, §8); no such endpoint exists on
 * the Public API yet, so this renders frontend-owned Persian
 * placeholder copy in the meantime. Swapping this for a
 * `useGallery()`-style data hook later is additive — `GalleryPage`
 * only ever composes `<GalleryHero />`, never its internals.
 *
 * Visual refresh: adopts the same gold-badge/underline eyebrow
 * treatment and soft gradient backdrop already established by the
 * homepage `Hero`/`Features` sections, so this page reads as part of
 * the same premium navy/gold system instead of a plain text block.
 * Still zero new dependencies/components — the backdrop is a plain
 * `aria-hidden` `div` built from existing tokens, the same technique
 * `Hero` already uses.
 */
export function GalleryHero() {
  return (
    <Section
      spacing="lg"
      aria-labelledby="gallery-hero-heading"
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
          گالری تصاویر
        </Badge>

        <Stack gap="xs" align="start">
          <Heading id="gallery-hero-heading" level={1}>
            نگاهی به فضا و فعالیت‌های مجموعه
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>

        <Text variant="lead" className="max-w-2xl text-foreground/70">
          متنی نمونه درباره تصاویری از فضای آموزشی، رویدادها و
          فعالیت‌های شعب مختلف. تصاویر واقعی در نهایت از طریق سامانه
          مدیریت محتوا و سرویس عمومی بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}
