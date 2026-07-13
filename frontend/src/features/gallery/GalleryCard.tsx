import { AspectRatio, Badge, Card, Link, Stack, Text } from "@/shared/design-system/components";
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
 * §4, §8, no Public API endpoint today), so the image slot renders a
 * labelled placeholder surface — an `AspectRatio` box on a muted
 * background — the same convention `CampusCard`/`TeacherCard` already
 * use, rather than wiring the `Image` component against a URL that
 * doesn't exist. Once `item.image.src` is populated by real data,
 * swapping the placeholder `Stack` below for
 * `<Image src={item.image.src} ... />` is a change contained entirely
 * to this file.
 *
 * The "توضیحات بیشتر" link points at `GalleryDetails`'s matching
 * `#gallery-{id}` anchor, the same "card links to its own details
 * panel" convention as `CampusCard`'s "جزئیات بیشتر" link.
 */
export function GalleryCard({ item }: GalleryCardProps) {
  return (
    <Card variant="outline" padding="none" className="overflow-hidden">
      <AspectRatio ratio={4 / 3} className="bg-muted">
        <Stack
          align="center"
          justify="center"
          className="absolute inset-0 h-full w-full px-2 text-center"
        >
          <Text variant="bodySm" color="muted">
            تصویر نمونه
          </Text>
        </Stack>
      </AspectRatio>

      <Stack gap="xs" className="p-3">
        <Badge variant="secondary" className="w-fit">
          {item.category}
        </Badge>
        <Text variant="bodySm" weight="semibold">
          {item.title}
        </Text>
        <Link href={`#gallery-${item.id}`} variant="subtle">
          توضیحات بیشتر
        </Link>
      </Stack>
    </Card>
  );
}
