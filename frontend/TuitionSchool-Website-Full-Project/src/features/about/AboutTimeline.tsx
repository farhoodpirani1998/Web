import { Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * About page "Timeline" section — extracted from `AboutPage`'s inline
 * markup without changing layout, styling, or content, following the
 * same pattern as the homepage's `hero`/`features`/`cta` features.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Heading`, `Text`) — no data
 * fetching, no business logic. Timeline entries are grouped into a
 * local array literal rather than interleaved in JSX (Website Frontend
 * Architecture §4, §8), so the eventual swap to a `useAboutPage()`-style
 * data hook is a matter of replacing this literal — the layout and
 * design-system wiring below do not need to change. Real copy is
 * ultimately Static Pages/About content-module data; this renders
 * frontend-owned Persian placeholder copy in the meantime.
 */

const timeline = [
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
] as const;

export function AboutTimeline() {
  return (
    <Section spacing="lg" aria-labelledby="about-timeline-heading">
      <Stack gap="md">
        <Heading id="about-timeline-heading" level={2}>
          مسیر رشد
        </Heading>
        <Stack gap="none" as="ol" className="border-s border-border ps-6">
          {timeline.map((item, index) => (
            <Stack
              key={item.id}
              as="li"
              gap="xs"
              className={index === timeline.length - 1 ? "pb-0 pt-6 first:pt-0" : "pb-6 pt-6 first:pt-0"}
            >
              <Text as="span" variant="overline" color="primary">
                {item.year}
              </Text>
              <Text as="span" weight="semibold">
                {item.title}
              </Text>
              <Text variant="bodySm" color="muted">
                {item.description}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}
