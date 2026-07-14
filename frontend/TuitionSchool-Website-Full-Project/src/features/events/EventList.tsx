import { Grid, Heading, Section, Stack } from "@/shared/design-system/components";
import { EventCard } from "./EventCard";
import { events } from "./data";

/**
 * Events page "List" section — the compact overview grid, mirroring
 * `@/features/campuses`'s `CampusList` and `@/features/teachers`'s
 * `TeacherGrid` (themselves following the same pattern as
 * `SchoolsList`/`GalleryGrid`/`Information`, §4, §8, §10 "Section
 * Architecture").
 *
 * Presentation only: composed from `Section`/`Stack`/`Grid` plus this
 * feature's own `EventCard`, over the local `events` literal
 * (`./data`) — no data fetching, no business logic. Swapping `./data`
 * for a `useEvents()`-style data hook later is additive; this
 * component's JSX does not need to change.
 */
export function EventList() {
  return (
    <Section spacing="lg" aria-labelledby="events-list-heading">
      <Stack gap="md">
        <Heading id="events-list-heading" level={2}>
          فهرست رویدادها
        </Heading>
        <Grid cols="3" gap="md">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
