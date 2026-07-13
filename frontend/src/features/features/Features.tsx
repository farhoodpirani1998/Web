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
 * Homepage "Features" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — extracted from
 * `HomePage`'s inline placeholder section without changing its markup,
 * styling, or content, following the same pattern as the `hero`
 * feature.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Heading`, `Text`, `Grid`, `Card`) —
 * no new components, no data fetching, no business logic. Real
 * headline/intro copy and feature items are ultimately Features
 * content-module data (§4, §8); this renders frontend-owned Persian
 * placeholder copy in the meantime, the same convention already used
 * by `Hero`/`Footer`/`ContactPage`/`AboutPage`. Swapping this for a
 * `useFeatures()`-style data hook later is additive — `HomePage` only
 * ever composes `<Features />`, never its internals.
 */
export function Features() {
  return (
    <Section spacing="lg" aria-labelledby="home-features-heading">
      <Stack gap="lg">
        <Stack gap="sm" align="center" className="text-center">
          <Heading id="home-features-heading" level={2}>
            عنوان نمونه برای بخش ویژگی‌ها
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن معرفی نمونه برای بخش ویژگی‌ها. این متن جایگزین خلاصه‌ای
            است که در نهایت پس از پیاده‌سازی ماژول محتوایی ویژگی‌ها، از
            طریق Public API بک‌اند تأمین خواهد شد.
          </Text>
        </Stack>

        <Grid cols="3" gap="md">
          <Card variant="outline" padding="md">
            <CardHeader className="p-0">
              <CardTitle>عنوان نمونه ویژگی یک</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <Text variant="bodySm" color="muted">
                توضیح نمونه برای اولین مورد از ویژگی‌ها.
              </Text>
            </CardContent>
          </Card>

          <Card variant="outline" padding="md">
            <CardHeader className="p-0">
              <CardTitle>عنوان نمونه ویژگی دو</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <Text variant="bodySm" color="muted">
                توضیح نمونه برای دومین مورد از ویژگی‌ها.
              </Text>
            </CardContent>
          </Card>

          <Card variant="outline" padding="md">
            <CardHeader className="p-0">
              <CardTitle>عنوان نمونه ویژگی سه</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <Text variant="bodySm" color="muted">
                توضیح نمونه برای سومین مورد از ویژگی‌ها.
              </Text>
            </CardContent>
          </Card>
        </Grid>
      </Stack>
    </Section>
  );
}
