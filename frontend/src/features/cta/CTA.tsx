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
 *
 * Visual refresh: stronger `xl` spacing and a rounded-2xl surface so it
 * reads as the page's closing statement, a gold underline accent to
 * match `Hero`/`Features`' eyebrow treatment, and two faint decorative
 * rings echoing the header/hero crest motif (`aria-hidden`, built only
 * from existing tokens — no new asset). A second, outlined link gives
 * the section a primary/secondary action pair instead of a single
 * button, using the existing `/admissions` route already listed in
 * `NAV_ITEMS` — no new route or backend functionality introduced.
 */
export function CTA() {
  return (
    <Section
      spacing="xl"
      tone="primary"
      className="relative isolate overflow-hidden rounded-2xl"
      aria-labelledby="home-cta-heading"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 via-transparent to-brand-gold/10"
      />
      <div
        aria-hidden="true"
        className="absolute -end-16 -top-16 h-56 w-56 rounded-full border border-brand-gold/20"
      />
      <div
        aria-hidden="true"
        className="absolute -start-10 -bottom-10 h-40 w-40 rounded-full border border-brand-gold/10"
      />

      <Stack gap="md" align="center" className="relative px-6 text-center">
        <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        <Heading id="home-cta-heading" level={2} color="inherit">
          عنوان نمونه برای بخش فراخوان اقدام
        </Heading>
        <Text variant="lead" color="inherit" className="max-w-2xl text-white/80">
          متن جمع‌بندی نمونه برای بخش فراخوان اقدام. این متن جایگزین محتوایی
          است که در نهایت پس از پیاده‌سازی ماژول محتوایی فراخوان اقدام، از
          طریق Public API بک‌اند تأمین خواهد شد.
        </Text>
        <Stack direction="row" gap="sm" wrap justify="center">
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "bg-brand-gold text-brand-navy hover:bg-brand-gold/90",
            )}
          >
            تماس با ما
          </Link>
          <Link
            href="/admissions"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/30 text-white hover:bg-white/10",
            )}
          >
            پذیرش و ثبت‌نام
          </Link>
        </Stack>
      </Stack>
    </Section>
  );
}
