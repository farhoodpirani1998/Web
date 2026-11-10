import { PageLayout, Stack } from "@/shared/design-system/components";
import { GalleryHero, GalleryGrid, GalleryDetails, FAQ } from "@/features/gallery";

/**
 * Gallery page backed by the Public Gallery API through `useGallery()`.
 * Its feature sections own the presentation and loading states.
 */
export function GalleryPage() {
  return (
    <>
      {/* Full-bleed hero band, outside PageLayout (which is a Container). */}
      <GalleryHero />
      <PageLayout>
        <Stack gap="none">
          <GalleryGrid />
          <GalleryDetails />
          <FAQ />
        </Stack>
      </PageLayout>
    </>
  );
}
