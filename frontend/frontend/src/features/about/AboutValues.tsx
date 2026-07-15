import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";

/**
 * About page "Values" section — extracted from `AboutPage`'s inline
 * markup without changing layout, styling, or content, following the
 * same pattern as the homepage's `hero`/`features`/`cta` features.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Heading`, `Text`) —
 * no data fetching, no business logic. Value items are grouped into a
 * local array literal rather than interleaved in JSX (Website Frontend
 * Architecture §4, §8), so the eventual swap to a `useAboutPage()`-style
 * data hook is a matter of replacing this literal — the layout and
 * design-system wiring below do not need to change. Real copy is
 * ultimately Static Pages/About content-module data; this renders
 * frontend-owned Persian placeholder copy in the meantime.
 *
 * Visual refresh: adopts the same numbered navy/gold marker + oversized
 * numeral watermark treatment the homepage `Features` cards already
 * established (plain `aria-hidden` `span`s built from existing tokens,
 * no new component), on `elevated` cards with a hover lift, so this
 * grid reads as part of the same premium card language as the
 * homepage instead of a plain bordered list.
 */

const values = [
  {
    index: "۰۱",
    id: "quality",
    title: "کیفیت آموزشی",
    description:
      "طراحی دوره‌ها بر پایه استانداردهای به‌روز آموزشی و بازنگری مستمر محتوا توسط گروه علمی.",
  },
  {
    index: "۰۲",
    id: "access",
    title: "دسترسی‌پذیری",
    description:
      "ارائه دوره‌های حضوری و آنلاین در چند شعبه، برای دسترسی آسان‌تر خانواده‌ها و دانش‌آموزان.",
  },
  {
    index: "۰۳",
    id: "community",
    title: "جامعه یادگیری",
    description:
      "ایجاد فضایی حمایت‌گر میان دانش‌آموزان، اولیا و مدرسان برای رشد مستمر و مشارکتی.",
  },
  {
    index: "۰۴",
    id: "transparency",
    title: "شفافیت",
    description:
      "اطلاع‌رسانی روشن درباره برنامه درسی، هزینه‌ها و پیشرفت تحصیلی به خانواده‌ها.",
  },
] as const;

export function AboutValues() {
  return (
    <Section spacing="lg" tone="muted" className="rounded-lg" aria-labelledby="about-values-heading">
      <Stack gap="md">
        <Stack gap="sm">
          <Heading id="about-values-heading" level={2}>
            ارزش‌های ما
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن نمونه برای معرفی اصولی که مبنای تصمیم‌گیری و فعالیت روزانه
            مجموعه هستند.
          </Text>
        </Stack>

        <Grid cols="2" gap="lg">
          {values.map((value) => (
            <Card
              key={value.id}
              variant="elevated"
              padding="lg"
              className="group relative overflow-hidden bg-background transition-shadow duration-300 hover:shadow-lg"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -end-2 -top-4 font-heading text-6xl font-bold text-brand-navy/5"
              >
                {value.index}
              </span>

              <CardHeader className="relative gap-3 p-0">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold"
                >
                  {value.index}
                </span>
                <CardTitle className="font-heading">{value.title}</CardTitle>
              </CardHeader>

              <CardContent className="relative p-0 pt-3">
                <Text variant="bodySm" color="muted">
                  {value.description}
                </Text>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
