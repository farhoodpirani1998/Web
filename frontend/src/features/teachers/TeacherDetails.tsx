import {
  Badge,
  Card,
  Heading,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { teachers as fallbackTeachers } from "./data";
import { useTeachers } from "./useTeachers";

/**
 * Teachers page "Details" section — the expanded, in-depth view of
 * each teacher (full bio, full specialty list), distinct from
 * `TeacherGrid`'s compact overview cards. Mirrors
 * `@/features/campuses`'s `CampusDetails`.
 *
 * Presentation only, no business logic beyond the fetched-or-fallback
 * source selection below. Like `CampusDetails` and `FAQ` (both
 * `campuses` and `pre-registration`), each panel uses the native
 * `<details>`/`<summary>` elements rather than a controlled
 * `open`/`onToggle` state — fully interactive, keyboard/screen-reader
 * accessible disclosure (§26), zero React/component state. Each
 * `<details>` carries the id `#teacher-{id}`, left in place for a
 * future `TeacherCard` deep-link (mirroring `CampusCard`'s "جزئیات
 * بیشتر" link) — not wired today, since that would mean modifying
 * `TeacherCard`, which is out of this task's scope.
 *
 * Backed by `useTeachers()` (the Public API's Teachers content
 * module, §4, §8), the same `useTeachers()` call `TeacherGrid` makes —
 * TanStack Query dedupes the two into a single request/cache entry
 * (§14). Renders `data` once the query has resolved with at least one
 * item, and falls back to the local `fallbackTeachers` literal
 * (`./data`) while the query is loading, has errored, or the CMS has
 * nothing published yet — the same convention `CampusList`/
 * `CampusDetails` now use.
 */
export function TeacherDetails() {
  const { data } = useTeachers();
  const teachers = data && data.length > 0 ? data : fallbackTeachers;

  return (
    <Section spacing="lg" tone="muted" aria-labelledby="teachers-details-heading">
      <Stack gap="md">
        <Heading id="teachers-details-heading" level={2}>
          جزئیات مدرسان
        </Heading>

        <Stack gap="sm">
          {teachers.map((teacher) => (
            <Card
              key={teacher.id}
              variant="outline"
              padding="none"
              className="bg-background transition-colors hover:border-brand-gold/40"
            >
              <details id={`teacher-${teacher.id}`} className="group px-6 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Stack gap="xs">
                    <Text as="span" variant="body" weight="semibold">
                      {teacher.name}
                    </Text>
                    <Text as="span" variant="caption" color="muted">
                      {teacher.subject}
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
                    {teacher.bio}
                  </Text>

                  <Stack direction="row" gap="xs" wrap>
                    {teacher.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
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
