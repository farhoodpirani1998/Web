import {
  Avatar,
  Badge,
  Card,
  CardContent,
  Stack,
  Text,
} from "@/shared/design-system/components";
import type { Teacher } from "./types";

export interface TeacherCardProps {
  teacher: Teacher;
}

/**
 * Single-teacher summary card — the unit `TeacherGrid` repeats,
 * mirroring `@/features/campuses`'s `CampusCard`.
 *
 * Presentation only: takes a fully-formed `Teacher` object as a prop
 * and renders it; no data fetching, no business logic, no internal
 * state. Extracted as its own component (rather than inlined in
 * `TeacherGrid`'s `.map`) so it can also be reused elsewhere later
 * (e.g. a homepage "featured teachers" section) without duplicating
 * this markup.
 *
 * No real photo assets exist yet (Teachers/Media content-module data,
 * §4, §8, no Public API endpoint today), so the image slot still
 * renders a labelled placeholder rather than wiring the `Image`
 * component against a URL that doesn't exist. Visual refresh: swaps
 * the flat square placeholder tile for the same "portrait card" shape
 * `AboutTeam` already established — a soft gradient header panel
 * holding a large, gold-ringed `Avatar` (falls back to the teacher's
 * initial, same as `AboutTeam`), with name/subject centered beneath —
 * so the whole directory reads as one consistent premium people-card
 * language instead of two different treatments. Bio and specialty
 * badges keep their own place below, and the card picks up the same
 * hover lift as `GalleryCard`/`NewsCard`/`CampusCard`. Once
 * `teacher.image.src` is populated by real data, passing it as the
 * `Avatar`'s `src` is a change contained entirely to this file.
 */
export function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <Card
      variant="elevated"
      padding="none"
      className="group overflow-hidden bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <Stack
        align="center"
        gap="sm"
        className="bg-gradient-to-b from-brand-navy/10 via-muted/40 to-transparent px-6 pb-5 pt-8 text-center"
      >
        <span className="rounded-full p-1 ring-2 ring-brand-gold/40 transition-colors group-hover:ring-brand-gold">
          <Avatar
            alt={teacher.image.alt}
            src={teacher.image.src}
            fallback={teacher.name.slice(0, 1)}
            size="lg"
            className="h-20 w-20 text-2xl"
          />
        </span>
        <Stack gap="none" align="center">
          <Text weight="semibold" className="font-heading">
            {teacher.name}
          </Text>
          <Badge variant="secondary" className="mt-1 w-fit">
            {teacher.subject}
          </Badge>
        </Stack>
      </Stack>

      <CardContent className="p-4 pt-3">
        <Stack gap="sm">
          <Text variant="bodySm" color="muted">
            {teacher.bio}
          </Text>

          <Stack direction="row" gap="xs" wrap justify="center">
            {teacher.specialties.map((specialty) => (
              <Badge key={specialty} variant="outline">
                {specialty}
              </Badge>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
