import { Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";
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
 *
 * Visual refresh: adds a short lead paragraph under the heading (the
 * same heading+lead pairing `AboutTeam`/`AboutValues`/`CampusList`
 * use) and widens the card gap from `md` to `lg` to give the taller
 * portrait-style `TeacherCard`s room to breathe.
 */
export function TeacherGrid() {
  return (
    <Section spacing="lg" aria-labelledby="teachers-grid-heading">
      <Stack gap="md">
        <Stack gap="sm">
          <Heading id="teachers-grid-heading" level={2}>
            فهرست مدرسان
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن نمونه برای معرفی مدرسان مجموعه به تفکیک درس و تخصص.
          </Text>
        </Stack>
        <Grid cols="4" gap="lg">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
