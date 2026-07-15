import { ArrowLeft, MapPin } from "lucide-react";

import { Badge, Heading, Image, Link, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

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
 * 4-up promotional grid, not the full directory — Figma's card shape
 * (`{ name, fullName, location, badge, image, badgeBg, badgeText,
 * grades }`, per §4.7) is a different, lighter shape than the existing
 * `Campus` type (which has no `grades`/`badge` fields and treats
 * missing photos as a labelled placeholder rather than an Unsplash
 * stand-in). So this file keeps its own small local `HomeCampus`
 * shape/data rather than reusing `campuses/data.ts` — the same "home
 * band owns its own placeholder content" convention already used by
 * `HomeStatsBand`/`HomeAbout`. `name`/`area` values are kept aligned
 * with the real `campuses` records (`central`/`west`/`isfahan`) so the
 * two sections don't visibly disagree once real data lands.
 *
 * Presentation only: composed from existing design-system primitives
 * (`Section`, `Stack`, `Heading`, `Text`, `Badge`, `Image`, `Link`) —
 * no new shared component. The trailing "Coming Soon" card (dashed
 * border, no image) matches Figma exactly. Each "View School" link
 * points at `/campuses#campus-{id}`, the same in-page anchor
 * `CampusCard` already uses today (no per-campus route exists yet),
 * rather than a placeholder link (§ "no placeholder code").
 */

interface HomeCampus {
  id: string;
  name: string;
  area: string;
  grades: string;
  badge: string;
  image: string;
}

const HOME_CAMPUSES: HomeCampus[] = [
  {
    id: "central",
    name: "پردیس مرکزی",
    area: "تهران، مرکز شهر",
    grades: "پایه‌ی ۱ تا ۹",
    badge: "مختلط",
    image:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=450&fit=crop&auto=format",
  },
  {
    id: "west",
    name: "پردیس غرب تهران",
    area: "تهران، منطقه غرب",
    grades: "پایه‌ی ۱ تا ۶",
    badge: "پسرانه",
    image:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=450&fit=crop&auto=format",
  },
  {
    id: "isfahan",
    name: "پردیس اصفهان",
    area: "اصفهان",
    grades: "پایه‌ی ۷ تا ۱۲",
    badge: "دخترانه",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=450&fit=crop&auto=format",
  },
] as const;

export function HomeCampuses() {
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
            متن معرفی نمونه برای بخش پردیس‌ها. این متن جایگزین خلاصه‌ای است که در نهایت پس از
            پیاده‌سازی ماژول محتوایی پردیس‌ها، از طریق Public API بک‌اند تأمین خواهد شد.
          </Text>
        </Stack>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_CAMPUSES.map((campus) => (
            <div
              key={campus.id}
              className="group overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="relative">
                <Image
                  src={campus.image}
                  alt={`نمای ساختمان ${campus.name}`}
                  fit="cover"
                  containerClassName="h-56 w-full"
                />
                <Badge className="absolute start-3 top-3 bg-primary text-primary-foreground">
                  {campus.badge}
                </Badge>
              </div>

              <div className="p-5">
                <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                  {campus.area}
                </div>

                <Heading level={3} className="mb-1 text-base">
                  {campus.name}
                </Heading>
                <Text variant="bodySm" color="muted" className="mb-4">
                  {campus.grades}
                </Text>

                <Link
                  href={`/campuses#campus-${campus.id}`}
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

          <div
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-6 text-center",
              "min-h-[19rem]",
            )}
          >
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground"
            >
              +
            </span>
            <Text variant="bodySm" weight="semibold">
              پردیس بعدی
            </Text>
            <Text variant="caption" color="muted">
              به‌زودی
            </Text>
          </div>
        </div>
      </Stack>
    </Section>
  );
}
