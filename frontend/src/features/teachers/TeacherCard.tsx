import {
  AspectRatio,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
 * §4, §8, no Public API endpoint today), so the image slot renders a
 * labelled placeholder surface — an `AspectRatio` box on a muted
 * background — the same convention `GalleryGrid`/`CampusCard` already
 * use, rather than wiring the `Image` component against a URL that
 * doesn't exist. Once `teacher.image.src` is populated by real data,
 * swapping the placeholder `Stack` below for
 * `<Image src={teacher.image.src} ... />` is a change contained
 * entirely to this file.
 */
export function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <Card variant="outline" padding="none" className="overflow-hidden">
      <AspectRatio ratio={1} className="bg-muted">
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
          <CardTitle>{teacher.name}</CardTitle>
          <Badge variant="secondary" className="w-fit">
            {teacher.subject}
          </Badge>
        </Stack>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <Stack gap="sm">
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
      </CardContent>
    </Card>
  );
}
