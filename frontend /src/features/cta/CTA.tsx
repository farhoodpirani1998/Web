import { buttonVariants, Heading, Link, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Homepage "CTA" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — extracted from
 * `HomePage`'s inline placeholder section without changing its markup,
 * styling, or content, following the same pattern as the `hero` and
 * `features` features.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Heading`, `Text`, `Link`/
 * `buttonVariants`) — no new components, no data fetching, no business
 * logic. Real headline/supporting copy/CTA target are ultimately CTA
 * content-module data (§4, §8); this renders frontend-owned Persian
 * placeholder copy in the meantime, the same convention already used
 * by `Hero`/`Features`/`Footer`/`ContactPage`/`AboutPage`. Swapping
 * this for a `useCta()`-style data hook later is additive — `HomePage`
 * only ever composes `<CTA />`, never its internals.
 */
export function CTA() {
  return (
    <Section spacing="lg" tone="primary" className="rounded-lg" aria-labelledby="home-cta-heading">
      <Stack gap="md" align="center" className="text-center px-6">
        <Heading id="home-cta-heading" level={2} color="inherit">
          عنوان نمونه برای بخش فراخوان اقدام
        </Heading>
        <Text variant="lead" color="inherit" className="max-w-2xl">
          متن جمع‌بندی نمونه برای بخش فراخوان اقدام. این متن جایگزین محتوایی
          است که در نهایت پس از پیاده‌سازی ماژول محتوایی فراخوان اقدام، از
          طریق Public API بک‌اند تأمین خواهد شد.
        </Text>
        <Link href="/contact" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
          تماس با ما
        </Link>
      </Stack>
    </Section>
  );
}
