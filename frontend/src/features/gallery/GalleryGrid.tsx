import {
  AspectRatio,
  Badge,
  Card,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";

/**
 * Gallery page "Grid" section — the image directory, following the
 * same pattern as `hero`/`features`/`cta`/`about`/`contact`/`schools`/
 * `news`.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `AspectRatio`,
 * `Badge`, `Text`) — no data fetching, no business logic. Gallery
 * entries are grouped into a local array literal rather than
 * interleaved in JSX (Website Frontend Architecture §4, §8), so the
 * eventual swap to a `useGallery()`-style data hook is a matter of
 * replacing this literal — the layout and design-system wiring below
 * do not need to change.
 *
 * No real photo assets exist yet (they are ultimately the backend's
 * Gallery/Media content-module data, §4, §8, with no Public API
 * endpoint today), so each tile renders a frontend-owned placeholder
 * surface — an `AspectRatio` box on a muted background with a caption
 * — the same "labelled placeholder instead of invented content" move
 * already used by `AboutTeam`'s initials-only `Avatar`s, rather than
 * wiring up the `Image` component against URLs that don't exist.
 */

const gallery = [
  { id: "g1", caption: "فضای آموزشی شعبه مرکزی", category: "فضای آموزشی" },
  { id: "g2", caption: "کارگاه آموزشی ویژه اولیا", category: "رویداد" },
  { id: "g3", caption: "کلاس درس شعبه غرب تهران", category: "فضای آموزشی" },
  { id: "g4", caption: "نشست معرفی مسیرهای تحصیلی", category: "رویداد" },
  { id: "g5", caption: "کتابخانه و فضای مطالعه", category: "فضای آموزشی" },
  { id: "g6", caption: "جشن فارغ‌التحصیلی دانش‌آموزان", category: "رویداد" },
  { id: "g7", caption: "آزمایشگاه علوم شعبه اصفهان", category: "فضای آموزشی" },
  { id: "g8", caption: "مراسم اهدای جوایز برترین‌ها", category: "دستاورد" },
] as const;

export function GalleryGrid() {
  return (
    <Section spacing="lg" aria-labelledby="gallery-grid-heading">
      <Stack gap="md">
        <Heading id="gallery-grid-heading" level={2}>
          تصاویر گالری
        </Heading>
        <Grid cols="4" gap="md">
          {gallery.map((item) => (
            <Card key={item.id} variant="outline" padding="none" className="overflow-hidden">
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
              <Stack gap="xs" className="p-3">
                <Badge variant="secondary" className="w-fit">
                  {item.category}
                </Badge>
                <Text variant="bodySm" weight="semibold">
                  {item.caption}
                </Text>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
