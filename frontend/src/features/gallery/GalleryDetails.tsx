import { AspectRatio, Badge, Card, Heading, Image, Section, Stack, Text } from "@/shared/design-system/components";
import { galleryItems } from "./data";
import { useGallery } from "./useGallery";

/**
 * Gallery page "Details" section — the expanded, in-depth view of
 * each photo (full description, category), distinct from
 * `GalleryGrid`'s compact overview cards. Mirrors
 * `@/features/campuses`'s `CampusDetails` and
 * `@/features/teachers`'s `TeacherDetails`.
 *
 * This is the feature's "lightbox/details" functionality: rather than
 * a JS-driven modal/lightbox (a new interaction pattern and, for a
 * dialog, typically a new dependency), it reuses the same native
 * `<details>`/`<summary>` disclosure pattern already established by
 * `CampusDetails`/`TeacherDetails`/both `FAQ`s — fully interactive,
 * keyboard/screen-reader accessible (§26), zero React/component
 * state, and zero new dependencies, in keeping with this project's
 * existing conventions. Each `<details>` carries the id
 * `#gallery-{id}`, which is exactly what `GalleryCard`'s "توضیحات
 * بیشتر" link points at — following that link both scrolls to and
 * (once the browser supports `:target` auto-expansion, or once real
 * interactivity is added later) reveals the matching panel, no JS
 * required for the scroll-to-anchor part.
 *
 * Backed by `useGallery()` (the Public API's Gallery/Media content
 * module, §4, §8): renders `data.gallery` when the query has resolved
 * with at least one item, and falls back to the local `galleryItems`
 * placeholder array (`./data`) — the same source `GalleryGrid` falls
 * back to — while the query is loading, has errored, or the CMS has
 * nothing published yet. Each panel's photo prefers the CMS's own
 * `item.image.src`, rendered through the shared `Image` primitive,
 * falling back to the same labelled placeholder surface when absent.
 */
export function GalleryDetails() {
  const { data } = useGallery();
  const items = data && data.length > 0 ? data : galleryItems;

  return (
    <Section spacing="lg" tone="muted" aria-labelledby="gallery-details-heading">
      <Stack gap="md">
        <Heading id="gallery-details-heading" level={2}>
          جزئیات تصاویر
        </Heading>

        <Stack gap="sm">
          {items.map((item) => (
            <Card
              key={item.id}
              variant="outline"
              padding="none"
              className="overflow-hidden transition-colors hover:border-brand-gold/40"
            >
              <details id={`gallery-${item.id}`} className="group px-6 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Stack gap="xs">
                    <Text as="span" variant="body" weight="semibold" className="font-heading">
                      {item.title}
                    </Text>
                    <Badge variant="secondary" className="w-fit">
                      {item.category}
                    </Badge>
                  </Stack>
                  <Text
                    as="span"
                    aria-hidden="true"
                    className="shrink-0 text-brand-gold transition-transform group-open:rotate-180"
                  >
                    ⌄
                  </Text>
                </summary>

                <Stack gap="sm" className="pt-4">
                  {item.image.src ? (
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      ratio={16 / 9}
                      fit="cover"
                      containerClassName="max-w-md"
                      fallback={
                        <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                          تصویر نمونه
                        </div>
                      }
                    />
                  ) : (
                    <AspectRatio
                      ratio={16 / 9}
                      className="max-w-md bg-gradient-to-br from-brand-navy/10 via-muted to-brand-gold/15"
                    >
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
                  )}
                  <Text variant="bodySm" color="muted">
                    {item.description}
                  </Text>
                </Stack>
              </details>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}
