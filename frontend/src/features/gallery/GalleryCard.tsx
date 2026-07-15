import { AspectRatio, Badge, Card, Image, Link, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";
import type { GalleryItem } from "./types";

export interface GalleryCardProps {
  item: GalleryItem;
}

/**
 * Single-photo summary card — the unit `GalleryGrid` repeats,
 * mirroring `@/features/campuses`'s `CampusCard` and
 * `@/features/teachers`'s `TeacherCard`.
 *
 * Presentation only: takes a fully-formed `GalleryItem` object as a
 * prop and renders it; no data fetching, no business logic, no
 * internal state. Extracted as its own component (rather than inlined
 * in `GalleryGrid`'s `.map`, which is how this markup previously
 * lived) so it can also be reused elsewhere later (e.g. a homepage
 * "featured photos" section) without duplicating this markup.
 *
 * Now that the Gallery/Media content module is wired up (`./useGallery`),
 * `item.image.src` renders through the shared `Image` primitive —
 * navy/gold gradient tile with a decorative photo glyph, as before —
 * when the CMS hasn't set an image for a given entry (or the query is
 * still on its local placeholder fallback), the same soft navy/gold
 * gradient tile with a decorative photo glyph is rendered instead of
 * guessing a URL. The category badge floats over the image as a
 * frosted chip either way, and the whole card lifts on hover — the
 * same `elevated`/hover-shadow treatment the homepage `Features` cards
 * use.
 *
 * The "توضیحات بیشتر" link points at `GalleryDetails`'s matching
 * `#gallery-{id}` anchor, the same "card links to its own details
 * panel" convention as `CampusCard`'s "جزئیات بیشتر" link.
 */
export function GalleryCard({ item }: GalleryCardProps) {
  return (
    <Card
      variant="elevated"
      padding="none"
      className="group overflow-hidden bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative">
        {item.image.src ? (
          <Image
            src={item.image.src}
            alt={item.image.alt}
            ratio={4 / 3}
            fit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            fallback={<GalleryPlaceholder />}
          />
        ) : (
          <AspectRatio
            ratio={4 / 3}
            className="bg-gradient-to-br from-brand-navy/10 via-muted to-brand-gold/15"
          >
            <GalleryPlaceholder className="transition-transform duration-300 group-hover:scale-105" />
          </AspectRatio>
        )}

        <Badge
          variant="secondary"
          className="absolute start-3 top-3 border-brand-gold/30 bg-background/85 text-brand-navy backdrop-blur-sm"
        >
          {item.category}
        </Badge>
      </div>

      <Stack gap="xs" className="p-4">
        <Text variant="body" weight="semibold" className="font-heading leading-snug">
          {item.title}
        </Text>
        <Link
          href={`#gallery-${item.id}`}
          variant="subtle"
          className="group/link inline-flex w-fit items-center gap-1 text-brand-navy"
        >
          توضیحات بیشتر
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover/link:-translate-x-0.5 rtl:group-hover/link:translate-x-0.5"
          >
            ‹
          </span>
        </Link>
      </Stack>
    </Card>
  );
}

/** Placeholder tile shown while no real photo asset is available for an item. */
function GalleryPlaceholder({ className }: { className?: string }) {
  return (
    <Stack
      align="center"
      justify="center"
      gap="xs"
      className={cn("absolute inset-0 h-full w-full px-2 text-center", className)}
    >
      <PhotoGlyph className="h-9 w-9 text-brand-navy/25" />
      <Text variant="caption" color="muted">
        تصویر نمونه
      </Text>
    </Stack>
  );
}

/** Small decorative "photo" glyph for the image placeholder tile. Purely presentational. */
function PhotoGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
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
