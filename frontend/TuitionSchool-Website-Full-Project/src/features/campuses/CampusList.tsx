import { Grid, Heading, Section, Stack } from "@/shared/design-system/components";
import { CampusCard } from "./CampusCard";
import { campuses } from "./data";

/**
 * Campuses page "List" section — the compact overview grid, following
 * the same pattern as `SchoolsList`/`GalleryGrid`/`Information`
 * (§4, §8, §10 "Section Architecture").
 *
 * Presentation only: composed from `Section`/`Stack`/`Grid` plus this
 * feature's own `CampusCard`, over the local `campuses` literal
 * (`./data`) — no data fetching, no business logic. Swapping `./data`
 * for a `useCampuses()`-style data hook later is additive; this
 * component's JSX does not need to change.
 */
export function CampusList() {
  return (
    <Section spacing="lg" aria-labelledby="campuses-list-heading">
      <Stack gap="md">
        <Heading id="campuses-list-heading" level={2}>
          فهرست پردیس‌ها
        </Heading>
        <Grid cols="3" gap="md">
          {campuses.map((campus) => (
            <CampusCard key={campus.id} campus={campus} />
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
