import { Badge, Card, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { events } from "./data";

/**
 * Events page "Details" section — the expanded, in-depth view of each
 * event (full description, date/time/location, full tag list),
 * distinct from `EventList`'s compact overview cards. Mirrors
 * `@/features/campuses`'s `CampusDetails` and `@/features/teachers`'s
 * `TeacherDetails`.
 *
 * Presentation only, no business logic. Like `CampusDetails`,
 * `TeacherDetails`, and `FAQ` (`campuses`/`teachers`/
 * `pre-registration`), each panel uses the native `<details>`/
 * `<summary>` elements rather than a controlled `open`/`onToggle`
 * state — fully interactive, keyboard/screen-reader accessible
 * disclosure (§26), zero React/component state, in keeping with this
 * feature's "no state management" scope. Each `<details>` carries the
 * id `EventCard`'s "جزئیات بیشتر" link points at (`#event-{id}`), so
 * following that link both scrolls to and (once the browser supports
 * `:target` auto-expansion, or once real interactivity is added
 * later) reveals the matching panel — no JS required for the
 * scroll-to-anchor part.
 *
 * Reuses the same local `events` literal (`./data`) as `EventList` —
 * single source of truth for this feature's placeholder data.
 */
export function EventDetails() {
  return (
    <Section spacing="lg" tone="muted" aria-labelledby="events-details-heading">
      <Stack gap="md">
        <Heading id="events-details-heading" level={2}>
          جزئیات رویدادها
        </Heading>

        <Stack gap="sm">
          {events.map((event) => (
            <Card
              key={event.id}
              variant="outline"
              padding="none"
              className="bg-background transition-colors hover:border-brand-gold/40"
            >
              <details id={`event-${event.id}`} className="group px-6 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Stack gap="xs">
                    <Text as="span" variant="body" weight="semibold">
                      {event.title}
                    </Text>
                    <Text as="span" variant="caption" color="muted">
                      {event.date} — {event.time}
                    </Text>
                  </Stack>
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-transform group-open:rotate-180"
                  >
                    ⌄
                  </span>
                </summary>

                <Stack gap="sm" className="pt-3">
                  <Text variant="bodySm" color="muted">
                    {event.detailedDescription}
                  </Text>

                  <Stack direction="row" gap="xs" wrap>
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </Stack>

                  <Stack gap="xs">
                    <Text variant="bodySm">{event.location}</Text>
                  </Stack>
                </Stack>
              </details>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}
