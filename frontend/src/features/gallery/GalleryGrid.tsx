import { Badge, Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { GalleryCard } from "./GalleryCard";
import { galleryItems } from "./data";

/**
 * Gallery page "Grid" section — the image directory, following the
 * same pattern as `hero`/`features`/`cta`/`about`/`contact`/`schools`/
 * `news`, and now (as of this extension) also mirroring
 * `@/features/campuses`'s `CampusList` and `@/features/teachers`'s
 * `TeacherGrid`.
 *
 * Presentation only: composed from `Section`/`Stack`/`Grid` plus this
 * feature's own `GalleryCard`, over the local `galleryItems` literal
 * (`./data`) — no data fetching, no business logic. Swapping `./data`
 * for a `useGallery()`-style data hook later is additive; this
 * component's JSX does not need to change.
 *
 * Visual refresh: the heading now carries the same gold-badge/
 * underline eyebrow treatment and centered intro copy the homepage
 * `Features` section already established, so the section reads with
 * clearer hierarchy above the card grid, and the grid gap is bumped to
 * `lg` to give the (now visually heavier, `elevated`) `GalleryCard`
 * tiles room to breathe. This is a styling change only — the exported
 * `GalleryGrid` name, its section id (`gallery-grid-heading`), the
 * `cols="4"` layout, and the rendered items are unchanged, so every
 * existing caller (`GalleryPage`, `@/features/gallery`'s `index.ts`)
 * keeps working exactly as before.
 */
export function GalleryGrid() {
  return (
    <Section spacing="lg" aria-labelledby="gallery-grid-heading">
      <Stack gap="xl">
        <Stack gap="sm" align="center" className="text-center">
          <Badge
            variant="outline"
            className="w-fit rounded-full border-brand-gold/40 bg-brand-gold/10 text-brand-navy"
          >
            مجموعه تصاویر
          </Badge>
          <Heading id="gallery-grid-heading" level={2}>
            تصاویر گالری
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
          <Text variant="lead" className="max-w-2xl">
            گزیده‌ای از تصاویر فضای آموزشی، رویدادها و دستاوردهای شعب مختلف مجموعه.
          </Text>
        </Stack>

        <Grid cols="4" gap="lg">
          {galleryItems.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
