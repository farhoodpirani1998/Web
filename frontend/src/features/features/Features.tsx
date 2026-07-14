import {
  Badge,
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
 * Homepage "Features" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — extracted from
 * `HomePage`'s inline placeholder section without changing its markup,
 * styling, or content, following the same pattern as the `hero`
 * feature.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Heading`, `Text`, `Badge`, `Grid`,
 * `Card`) — no new components, no data fetching, no business logic.
 * Real headline/intro copy and feature items are ultimately Features
 * content-module data (§4, §8); this renders frontend-owned Persian
 * placeholder copy in the meantime, the same convention already used
 * by `Hero`/`Footer`/`ContactPage`/`AboutPage`. Swapping this for a
 * `useFeatures()`-style data hook later is additive — `HomePage` only
 * ever composes `<Features />`, never its internals.
 *
 * Visual refresh: the section now sits on the `muted` `Section` tone so
 * it reads as a distinct band between `Hero` and `CTA` (visual rhythm,
 * §10), gets the same gold-badge/underline eyebrow treatment `Hero`
 * already established, and each card carries a numbered navy/gold
 * marker — echoing the header/hero crest — plus a subtle oversized
 * numeral watermark for a more editorial, premium feel. Still no new
 * shared component: the marker/watermark are plain `span`s built from
 * existing tokens, `aria-hidden` since the numbering is decorative.
 */

const FEATURE_ITEMS = [
  {
    index: "۰۱",
    title: "عنوان نمونه ویژگی یک",
    description: "توضیح نمونه برای اولین مورد از ویژگی‌ها.",
  },
  {
    index: "۰۲",
    title: "عنوان نمونه ویژگی دو",
    description: "توضیح نمونه برای دومین مورد از ویژگی‌ها.",
  },
  {
    index: "۰۳",
    title: "عنوان نمونه ویژگی سه",
    description: "توضیح نمونه برای سومین مورد از ویژگی‌ها.",
  },
] as const;

export function Features() {
  return (
    <Section spacing="lg" tone="muted" aria-labelledby="home-features-heading">
      <Stack gap="xl">
        <Stack gap="sm" align="center" className="text-center">
          <Badge
            variant="outline"
            className="rounded-full border-brand-gold/40 bg-brand-gold/10 text-brand-navy"
          >
            چرا ما را انتخاب کنید
          </Badge>
          <Heading id="home-features-heading" level={2}>
            عنوان نمونه برای بخش ویژگی‌ها
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
          <Text variant="lead" className="max-w-2xl">
            متن معرفی نمونه برای بخش ویژگی‌ها. این متن جایگزین خلاصه‌ای
            است که در نهایت پس از پیاده‌سازی ماژول محتوایی ویژگی‌ها، از
            طریق Public API بک‌اند تأمین خواهد شد.
          </Text>
        </Stack>

        <Grid cols="3" gap="lg">
          {FEATURE_ITEMS.map((feature) => (
            <Card
              key={feature.index}
              variant="elevated"
              padding="lg"
              className="group relative overflow-hidden bg-background transition-shadow duration-300 hover:shadow-lg"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -end-2 -top-4 font-heading text-6xl font-bold text-brand-navy/5"
              >
                {feature.index}
              </span>

              <CardHeader className="relative gap-3 p-0">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold"
                >
                  {feature.index}
                </span>
                <CardTitle className="font-heading">{feature.title}</CardTitle>
              </CardHeader>

              <CardContent className="relative p-0 pt-3">
                <Text variant="bodySm" color="muted">
                  {feature.description}
                </Text>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}
