import {
  AspectRatio,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Image,
  Link,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";
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
 * Now that the Events content module is wired up (`./useEvents`),
 * `event.image.src` renders through the shared `Image` primitive;
 * when the CMS hasn't set an image for a given entry (or the query is
 * still on its local placeholder fallback), the same soft navy/gold
 * gradient tile with a decorative calendar glyph — the same
 * "crest/emblem instead of a flat grey box" treatment
 * `GalleryCard`/`CampusCard` already established — is rendered
 * instead, with the category floating over it as a frosted chip, the
 * card lifting on hover (`elevated` + hover-shadow, matching
 * `GalleryCard`/`NewsCard`/`CampusCard`), and the date/time/location
 * rows picking up small inline glyphs (matching `CampusCard`'s
 * address/phone rows) so the schedule details read as structured data
 * rather than plain text.
 */
export function EventCard({ event }: EventCardProps) {
  return (
    <Card
      variant="elevated"
      padding="none"
      className="group overflow-hidden bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative">
        {event.image.src ? (
          <Image
            src={event.image.src}
            alt={event.image.alt}
            ratio={4 / 3}
            fit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            fallback={<EventPlaceholder />}
          />
        ) : (
          <AspectRatio
            ratio={4 / 3}
            className="bg-gradient-to-br from-brand-navy/10 via-muted to-brand-gold/15"
          >
            <EventPlaceholder className="transition-transform duration-300 group-hover:scale-105" />
          </AspectRatio>
        )}

        <Badge
          variant="secondary"
          className="absolute start-3 top-3 border-brand-gold/30 bg-background/85 text-brand-navy backdrop-blur-sm"
        >
          {event.category}
        </Badge>
      </div>

      <CardHeader className="gap-2 p-4 pb-0">
        <CardTitle className="font-heading">{event.title}</CardTitle>
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

          <Stack gap="xs" className="border-t border-border pt-3">
            <Stack direction="row" gap="xs" align="center">
              <ClockGlyph className="h-4 w-4 shrink-0 text-brand-gold" />
              <Text variant="bodySm" color="muted">
                {event.date} — {event.time}
              </Text>
            </Stack>
            <Stack direction="row" gap="xs" align="start">
              <PinGlyph className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
              <Text variant="bodySm" color="muted">
                {event.location}
              </Text>
            </Stack>
          </Stack>

          <Link
            href={`#event-${event.id}`}
            variant="subtle"
            className="group/link inline-flex w-fit items-center gap-1 text-brand-navy"
          >
            جزئیات بیشتر
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover/link:-translate-x-0.5 rtl:group-hover/link:translate-x-0.5"
            >
              ‹
            </span>
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
}

/** Placeholder tile shown while no real photo asset is available for an event. */
function EventPlaceholder({ className }: { className?: string }) {
  return (
    <Stack
      align="center"
      justify="center"
      gap="xs"
      className={cn("absolute inset-0 h-full w-full px-2 text-center", className)}
    >
      <CalendarGlyph className="h-9 w-9 text-brand-navy/25" />
      <Text variant="caption" color="muted">
        تصویر نمونه
      </Text>
    </Stack>
  );
}

/** Small decorative "calendar" glyph for the image placeholder tile. Purely presentational. */
function CalendarGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8.5" cy="13.5" r="1" fill="currentColor" />
      <circle cx="12" cy="13.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="13.5" r="1" fill="currentColor" />
    </svg>
  );
}

/** Small decorative "clock" glyph for the date/time row. Purely presentational. */
function ClockGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Small decorative "location pin" glyph for the location row. Purely presentational. */
function PinGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
