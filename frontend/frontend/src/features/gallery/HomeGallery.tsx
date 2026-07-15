import type { SVGProps } from "react";

import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";
import { galleryItems } from "./data";

/**
 * Homepage "Gallery" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — new
 * `HomeGallery` component matching the approved Figma design's
 * `GallerySection` (Figma Design Reference §4.11), added to `HomePage`
 * after `HomeNews` and before `CTA`, matching Figma's canonical render
 * order (§3): ... → News → Gallery → CTA.
 *
 * Distinct from the `/gallery` page's `GalleryGrid`/`GalleryCard` (same
 * `gallery` feature folder, same content domain): this is a compact,
 * text-free masonry teaser — Figma's version has no caption/category
 * on the tiles themselves (only a hover overlay), unlike the full
 * directory's cards which show a title/category/description. So this
 * renders its own lighter tile rather than reusing `GalleryCard`.
 * Pulls its images from the shared `galleryItems` (`./data`) — first
 * seven entries — rather than a separate local list, so the homepage
 * teaser and the full gallery never disagree about what a given photo
 * actually is; only the *presentation* differs here.
 *
 * No real photo assets exist yet (Gallery/Media content-module data,
 * §4, §8, no Public API endpoint today) — same as `GalleryCard`, each
 * tile renders a labelled gradient placeholder instead of guessing an
 * `Image` URL. `alt` text is still drawn from the real item data for
 * accessibility, even though the visible surface is a placeholder.
 *
 * Masonry effect (per Figma: `grid-cols-2 md:grid-cols-3`,
 * `gridAutoRows: 200px`, some tiles `row-span-2`) is reproduced with
 * plain Tailwind (`auto-rows-[200px]`, `row-span-2` on alternating
 * tiles) — no masonry library, matching this project's "CSS-only,
 * no new dependency" convention already used by `Hero`/`Features`.
 * Hover overlay matches Figma exactly: transparent → `bg-primary/20`
 * on hover, no text over the photo itself.
 */

const HOME_GALLERY_ITEMS = galleryItems.slice(0, 7);

/** Every third tile spans two rows, echoing Figma's masonry rhythm. */
function isTall(index: number) {
  return index % 3 === 0;
}

export function HomeGallery() {
  return (
    <Section spacing="lg" tone="muted" aria-labelledby="home-gallery-heading">
      <Stack gap="xl">
        <Stack gap="sm" align="center" className="text-center">
          <Badge variant="outline" className="rounded-full border-accent/40 bg-accent/10 text-primary">
            گالری تصاویر
          </Badge>
          <Heading id="home-gallery-heading" level={2}>
            نگاهی به فضای مجموعه
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-accent" />
          <Text variant="lead" className="max-w-2xl">
            متن معرفی نمونه برای بخش گالری. این متن جایگزین خلاصه‌ای است که در نهایت پس از
            پیاده‌سازی ماژول محتوایی گالری، از طریق Public API بک‌اند تأمین خواهد شد.
          </Text>
        </Stack>

        <div className="grid grid-cols-2 gap-3 [grid-auto-rows:200px] sm:gap-4 md:grid-cols-3">
          {HOME_GALLERY_ITEMS.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-muted to-accent/15",
                isTall(index) && "row-span-2",
              )}
            >
              <span className="sr-only">{item.image.alt}</span>
              <PhotoGlyph
                aria-hidden="true"
                className="absolute inset-0 m-auto h-9 w-9 text-primary/20"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/20"
              />
            </div>
          ))}
        </div>
      </Stack>
    </Section>
  );
}

/** Small decorative "photo" glyph for the image placeholder tile. Purely presentational. */
function PhotoGlyph({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} focusable="false" {...props}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="10" r="1.75" fill="currentColor" />
      <path
        d="M3 17.5 8.5 12l3.5 3.5 3-3L21 17.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
