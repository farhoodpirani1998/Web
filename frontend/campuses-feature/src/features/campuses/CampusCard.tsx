import {
  AspectRatio,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Link,
  Stack,
  Text,
} from "@/shared/design-system/components";
import type { Campus } from "./types";

export interface CampusCardProps {
  campus: Campus;
}

/**
 * Single-campus summary card — the unit `CampusList` repeats.
 *
 * Presentation only: takes a fully-formed `Campus` object as a prop
 * and renders it; no data fetching, no business logic, no internal
 * state. Extracted as its own component (rather than inlined in
 * `CampusList`'s `.map`) so it can also be reused elsewhere later
 * (e.g. a homepage "featured campuses" section) without duplicating
 * this markup.
 *
 * No real photo assets exist yet (Campuses/Media content-module data,
 * §4, §8, no Public API endpoint today), so the image slot renders a
 * labelled placeholder surface — an `AspectRatio` box on a muted
 * background — the same convention `GalleryGrid` already uses, rather
 * than wiring the `Image` component against a URL that doesn't exist.
 * Once `campus.image.src` is populated by real data, swapping the
 * placeholder `Stack` below for `<Image src={campus.image.src} ... />`
 * is a change contained entirely to this file.
 */
export function CampusCard({ campus }: CampusCardProps) {
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

      <CardHeader className="p-4 pb-0">
        <Stack gap="xs">
          <CardTitle>{campus.name}</CardTitle>
          <Badge variant="secondary" className="w-fit">
            {campus.area}
          </Badge>
        </Stack>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <Stack gap="sm">
          <Text variant="bodySm" color="muted">
            {campus.description}
          </Text>

          <Stack direction="row" gap="xs" wrap>
            {campus.features.map((feature) => (
              <Badge key={feature} variant="outline">
                {feature}
              </Badge>
            ))}
          </Stack>

          <Stack gap="xs">
            <Text variant="bodySm" color="muted">
              {campus.address}
            </Text>
            <Link href={campus.contact.phoneHref} variant="subtle">
              {campus.contact.phone}
            </Link>
          </Stack>

          <Link href={`#campus-${campus.id}`} variant="default">
            جزئیات بیشتر
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
}
