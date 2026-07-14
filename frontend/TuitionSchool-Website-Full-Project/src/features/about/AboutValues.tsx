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
 */

const values = [
  {
    id: "quality",
    title: "کیفیت آموزشی",
    description:
      "طراحی دوره‌ها بر پایه استانداردهای به‌روز آموزشی و بازنگری مستمر محتوا توسط گروه علمی.",
  },
  {
    id: "access",
    title: "دسترسی‌پذیری",
    description:
      "ارائه دوره‌های حضوری و آنلاین در چند شعبه، برای دسترسی آسان‌تر خانواده‌ها و دانش‌آموزان.",
  },
  {
    id: "community",
    title: "جامعه یادگیری",
    description:
      "ایجاد فضایی حمایت‌گر میان دانش‌آموزان، اولیا و مدرسان برای رشد مستمر و مشارکتی.",
  },
  {
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

        <Grid cols="2" gap="md">
          {values.map((value) => (
            <Card key={value.id} variant="outline" padding="md">
              <CardHeader className="p-0">
                <CardTitle>{value.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
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
