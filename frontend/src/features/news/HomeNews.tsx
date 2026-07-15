import { ArrowLeft, Calendar } from "lucide-react";

import { Badge, Heading, Image, Link, Section, Stack, Text, buttonVariants } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";
import { newsItems } from "./data";

/**
 * Homepage "News" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — new
 * `HomeNews` component matching the approved Figma design's
 * `NewsSection` (Figma Design Reference §4.10), added to `HomePage`
 * after `HomeAchievements`, matching Figma's canonical render order
 * (§3).
 *
 * Unlike `HomeCampuses` (which needed its own local data shape),
 * `NewsItem` (`id`/`title`/`category`/`date`/`excerpt`) already covers
 * everything Figma's card needs except a photo — so this reuses the
 * real `newsItems` array from `./data` directly (first three, most
 * recent) rather than duplicating placeholder copy, plus a small local
 * id→photo lookup for the one field the shared type doesn't carry yet.
 * Presentation differs from the full `/news` page's `NewsCard` (photo
 * + gold category badge + `line-clamp` title/excerpt vs. `NewsCard`'s
 * medallion-icon treatment), the same "home band, different visual
 * treatment, same content domain" split already used by
 * `HomeStatsBand`/`HomeCampuses`.
 *
 * Presentation only: composed from existing design-system primitives
 * (`Section`, `Stack`, `Heading`, `Text`, `Badge`, `Image`, `Link`) —
 * no new shared component. Each card's "ادامه مطلب" link points at
 * `/news#news-{id}`, the same in-page anchor `NewsCard`/`NewsDetails`
 * already use today (no per-article route exists yet — §7), and the
 * header's "مشاهده همه اخبار" link goes to the real `/news` route.
 */

const NEWS_IMAGES: Record<string, string> = {
  n1: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=450&fit=crop&auto=format",
  n2: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&h=450&fit=crop&auto=format",
  n3: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&h=450&fit=crop&auto=format",
};

export function HomeNews() {
  const featured = newsItems.slice(0, 3);

  return (
    <Section spacing="lg" tone="muted" aria-labelledby="home-news-heading">
      <Stack gap="xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Stack gap="xs" align="start">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-10 bg-accent" />
              <span className="text-xs font-bold text-accent">اخبار و رویدادها</span>
            </div>
            <Heading id="home-news-heading" level={2}>
              تازه‌های مجموعه
            </Heading>
          </Stack>

          <Link
            href="/news"
            className={cn(buttonVariants({ variant: "ghost" }), "gap-1.5 text-primary")}
          >
            مشاهده همه اخبار
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow duration-300 hover:shadow-lg"
            >
              <Image
                src={NEWS_IMAGES[item.id]}
                alt={item.title}
                fit="cover"
                containerClassName="h-48 w-full"
              />

              <div className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Badge className="bg-accent text-primary">{item.category}</Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.date}
                  </span>
                </div>

                <Heading level={3} className="mb-2 line-clamp-2 text-base">
                  {item.title}
                </Heading>
                <Text variant="bodySm" color="muted" className="mb-4 line-clamp-3">
                  {item.excerpt}
                </Text>

                <Link
                  href={`/news#news-${item.id}`}
                  variant="subtle"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                >
                  ادامه مطلب
                  <ArrowLeft
                    className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Stack>
    </Section>
  );
}
