import { AspectRatio, Badge, Card, Link, Stack, Text } from "@/shared/design-system/components";
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
 * No real photo assets exist yet (Gallery/Media content-module data,
 * §4, §8, no Public API endpoint today), so the image slot still
 * renders a labelled placeholder surface rather than wiring the
 * `Image` component against a URL that doesn't exist. Visual refresh:
 * the placeholder is now a soft navy/gold gradient tile with a
 * decorative photo glyph (matching the crest/emblem language the
 * homepage `Hero` already established) instead of a flat grey box, the
 * category badge floats over the image as a frosted chip for stronger
 * hierarchy, and the whole card lifts on hover — the same
 * `elevated`/hover-shadow treatment the homepage `Features` cards use.
 * Once `item.image.src` is populated by real data, swapping the
 * placeholder block below for `<Image src={item.image.src} ... />` is
 * a change contained entirely to this file.
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
      <AspectRatio
        ratio={4 / 3}
        className="bg-gradient-to-br from-brand-navy/10 via-muted to-brand-gold/15"
      >
        <Stack
          align="center"
          justify="center"
          gap="xs"
          className="absolute inset-0 h-full w-full px-2 text-center transition-transform duration-300 group-hover:scale-105"
        >
          <PhotoGlyph className="h-9 w-9 text-brand-navy/25" />
          <Text variant="caption" color="muted">
            تصویر نمونه
          </Text>
        </Stack>

        <Badge
          variant="secondary"
          className="absolute start-3 top-3 border-brand-gold/30 bg-background/85 text-brand-navy backdrop-blur-sm"
        >
          {item.category}
        </Badge>
      </AspectRatio>

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
