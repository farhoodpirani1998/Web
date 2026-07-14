import { Grid, Heading, Section, Stack } from "@/shared/design-system/components";
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
 * This is a refactor of where the eight placeholder items and the
 * per-tile markup live — extracted into `./data` and `./GalleryCard`
 * respectively, matching the `campuses`/`teachers` architecture — not
 * a change to this component's public API: the exported `GalleryGrid`
 * name, its section id (`gallery-grid-heading`), and the rendered
 * output are unchanged, so every existing caller (`GalleryPage`,
 * `@/features/gallery`'s `index.ts`) keeps working exactly as before.
 */
export function GalleryGrid() {
  return (
    <Section spacing="lg" aria-labelledby="gallery-grid-heading">
      <Stack gap="md">
        <Heading id="gallery-grid-heading" level={2}>
          تصاویر گالری
        </Heading>
        <Grid cols="4" gap="md">
          {galleryItems.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
