import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { useAboutPage } from "./useAboutPage";
import type { AboutTimelineItem } from "./types";

/**
 * About page "Timeline" section, following the same pattern as the
 * homepage's `hero`/`features`/`cta` features and now (as of this
 * extension) also `@/features/news`'s `NewsList`.
 *
 * Backed by `useAboutPage()` (the Public API's Static Pages/About
 * content module, §4, §8): lays out `data.timeline` once the query
 * has resolved with at least one item, and falls back to the local
 * `fallbackTimeline` literal while the query is loading, has errored,
 * or the CMS has nothing published yet. The last entry (whichever
 * source it comes from) keeps the filled "today" marker dot.
 *
 * Visual refresh: the plain `border-s` rule now carries a gold tint and
 * each entry gets a small gold dot marker sitting on that line (plain
 * `aria-hidden` `span`s, no new component), the year moves from a bare
 * overline into a navy/gold `Badge` for stronger scannability, and the
 * final entry's dot is filled solid to read as "today" — a clearer
 * visual hierarchy than the previous same-weight text stack, while the
 * list stays the same semantic `<ol>`/`<li>` structure (§26).
 */

const fallbackTimeline: readonly AboutTimelineItem[] = [
  {
    id: "y1378",
    year: "۱۳۷۸",
    title: "آغاز فعالیت",
    description: "شروع کار با یک شعبه و گروهی کوچک از مدرسان داوطلب.",
  },
  {
    id: "y1390",
    year: "۱۳۹۰",
    title: "گسترش شعب",
    description: "راه‌اندازی سومین و چهارمین شعبه در مناطق دیگر شهر.",
  },
  {
    id: "y1398",
    year: "۱۳۹۸",
    title: "ورود به آموزش آنلاین",
    description: "افزودن دوره‌های آنلاین برای پوشش دانش‌آموزان خارج از شهر.",
  },
  {
    id: "y1404",
    year: "۱۴۰۴",
    title: "امروز",
    description: "فعالیت در ۶ شعبه با صدها دوره حضوری و آنلاین در سال.",
  },
];

export function AboutTimeline() {
  const { data } = useAboutPage();
  const timeline = data && data.timeline.length > 0 ? data.timeline : fallbackTimeline;

  return (
    <Section spacing="lg" aria-labelledby="about-timeline-heading">
      <Stack gap="md">
        <Stack gap="xs" align="start">
          <Heading id="about-timeline-heading" level={2}>
            مسیر رشد
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>

        <Stack gap="none" as="ol" className="border-s-2 border-brand-gold/30 ps-6">
          {timeline.map((item, index) => {
            const isLast = index === timeline.length - 1;
            return (
              <Stack
                key={item.id}
                as="li"
                gap="xs"
                className={`relative ${isLast ? "pb-0 pt-6 first:pt-0" : "pb-6 pt-6 first:pt-0"}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -start-[1.875rem] top-7 h-3 w-3 rounded-full border-2 border-brand-gold ${
                    isLast ? "bg-brand-gold" : "bg-background"
                  }`}
                />
                <Badge variant="secondary" className="w-fit">
                  {item.year}
                </Badge>
                <Text as="span" weight="semibold" className="font-heading">
                  {item.title}
                </Text>
                <Text variant="bodySm" color="muted">
                  {item.description}
                </Text>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Section>
  );
}
