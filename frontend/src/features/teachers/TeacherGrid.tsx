import { Grid, Heading, Section, Stack } from "@/shared/design-system/components";
import { TeacherCard } from "./TeacherCard";
import { teachers } from "./data";

/**
 * Teachers page "Grid" section — the teacher directory, mirroring
 * `@/features/campuses`'s `CampusList` (itself following the same
 * pattern as `SchoolsList`/`GalleryGrid`/`Information`, §4, §8, §10
 * "Section Architecture").
 *
 * Presentation only: composed from `Section`/`Stack`/`Grid` plus this
 * feature's own `TeacherCard`, over the local `teachers` literal
 * (`./data`) — no data fetching, no business logic. Swapping `./data`
 * for a `useTeachers()`-style data hook later is additive; this
 * component's JSX does not need to change.
 */
export function TeacherGrid() {
  return (
    <Section spacing="lg" aria-labelledby="teachers-grid-heading">
      <Stack gap="md">
        <Heading id="teachers-grid-heading" level={2}>
          فهرست مدرسان
        </Heading>
        <Grid cols="4" gap="md">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
