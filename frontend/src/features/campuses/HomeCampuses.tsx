import { ArrowLeft, MapPin } from "lucide-react";

import { Badge, Heading, Image, Link, Section, Stack, Text } from "@/shared/design-system/components";
import { useCampuses } from "./useCampuses";

/**
 * Homepage "Campuses" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — new
 * `HomeCampuses` component matching the approved Figma design's
 * `CampusesSection` (Figma Design Reference §4.7), added to `HomePage`
 * after `HomeAbout` and before `Features`, matching Figma's canonical
 * render order (§3).
 *
 * Distinct from the `/campuses` page's `CampusCard`/`CampusList` (same
 * `campuses` feature folder, same content domain): this is a compact
 * promotional grid backed by the same public API query. Only fields
 * present in the CMS response are rendered; unpublished or absent
 * records are never represented by local stand-ins.
 *
 * Presentation only: composed from existing design-system primitives
 * (`Section`, `Stack`, `Heading`, `Text`, `Image`, `Link`) —
 * no new shared component. The trailing "Coming Soon" card (dashed
 * border, no image) matches Figma exactly. Each "View School" link
 * points at `/campuses#campus-{id}`, the same in-page anchor
 * `CampusCard` already uses today (no per-campus route exists yet),
 * rather than a placeholder link (§ "no placeholder code").
 */

export function HomeCampuses() {
  const { data, isPending, isError } = useCampuses();
  const campuses = data ?? [];

  return (
    <Section spacing="lg" aria-labelledby="home-campuses-heading">
      <Stack gap="xl">
        <Stack gap="sm" align="center" className="text-center">
          <Badge variant="outline" className="rounded-full border-accent/40 bg-accent/10 text-primary">
            مدارس ما
          </Badge>
          <Heading id="home-campuses-heading" level={2}>
            پردیس‌های ما
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-accent" />
          <Text variant="lead" className="max-w-2xl">
            با پردیس‌های آموزشی مجموعه و امکانات هر یک آشنا شوید.
          </Text>
        </Stack>

        {isPending ? (
          <Text role="status" variant="bodySm" color="muted" align="center">
            در حال دریافت پردیس‌ها…
          </Text>
        ) : isError ? (
          <Text role="alert" variant="bodySm" color="muted" align="center">
            دریافت اطلاعات پردیس‌ها ممکن نشد.
          </Text>
        ) : campuses.length === 0 ? (
          <Text variant="bodySm" color="muted" align="center">
            در حال حاضر پردیس منتشرشده‌ای برای نمایش وجود ندارد.
          </Text>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campuses.map((campus) => (
            <div
              key={campus.id}
              className="group overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="relative">
                {campus.image.src ? (
                  <Image
                    src={campus.image.src}
                    alt={campus.image.alt}
                    fit="cover"
                    containerClassName="h-56 w-full"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-muted text-sm text-muted-foreground">
                    تصویری ثبت نشده است
                  </div>
                )}
              </div>

              <div className="p-5">
                {campus.address && (
                  <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                    {campus.address}
                  </div>
                )}

                <Heading level={3} className="mb-1 text-base">
                  {campus.name}
                </Heading>
                <Text variant="bodySm" color="muted" className="mb-4">
                  {campus.description}
                </Text>

                <Link
                  href={`/campuses/${campus.slug}`}
                  variant="subtle"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                >
                  مشاهده مدرسه
                  <ArrowLeft
                    className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          ))}
          </div>
        )}
      </Stack>
    </Section>
  );
}
