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
 */
export function GalleryHero() {
  return (
    <Section spacing="lg" aria-labelledby="gallery-hero-heading">
      <Stack gap="sm">
        <Badge variant="secondary" className="w-fit">
          گالری تصاویر
        </Badge>
        <Heading id="gallery-hero-heading" level={1}>
          نگاهی به فضا و فعالیت‌های مجموعه
        </Heading>
        <Text variant="lead" className="max-w-2xl">
          متنی نمونه درباره تصاویری از فضای آموزشی، رویدادها و
          فعالیت‌های شعب مختلف. تصاویر واقعی در نهایت از طریق سامانه
          مدیریت محتوا و سرویس عمومی بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}
