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
import type { Event } from "./types";

export interface EventCardProps {
  event: Event;
}

/**
 * Single-event summary card — the unit `EventList` repeats, mirroring
 * `@/features/campuses`'s `CampusCard` and `@/features/teachers`'s
 * `TeacherCard`.
 *
 * Presentation only: takes a fully-formed `Event` object as a prop
 * and renders it; no data fetching, no business logic, no internal
 * state. Extracted as its own component (rather than inlined in
 * `EventList`'s `.map`) so it can also be reused elsewhere later
 * (e.g. a homepage "upcoming events" section) without duplicating
 * this markup.
 *
 * No real photo assets exist yet (Events/Media content-module data,
 * §4, §8, no Public API endpoint today), so the image slot renders a
 * labelled placeholder surface — an `AspectRatio` box on a muted
 * background — the same convention `GalleryGrid`/`CampusCard`/
 * `TeacherCard` already use, rather than wiring the `Image` component
 * against a URL that doesn't exist. Once `event.image.src` is
 * populated by real data, swapping the placeholder `Stack` below for
 * `<Image src={event.image.src} ... />` is a change contained
 * entirely to this file.
 */
export function EventCard({ event }: EventCardProps) {
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
          <CardTitle>{event.title}</CardTitle>
          <Badge variant="secondary" className="w-fit">
            {event.category}
          </Badge>
        </Stack>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <Stack gap="sm">
          <Text variant="bodySm" color="muted">
            {event.description}
          </Text>

          <Stack direction="row" gap="xs" wrap>
            {event.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </Stack>

          <Stack gap="xs">
            <Text variant="bodySm" color="muted">
              {event.date} — {event.time}
            </Text>
            <Text variant="bodySm" color="muted">
              {event.location}
            </Text>
          </Stack>

          <Link href={`#event-${event.id}`} variant="default">
            جزئیات بیشتر
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
}
