import { buttonVariants, Heading, Link, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Homepage "Hero" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — the first real
 * feature module, extracted from `HomePage`'s inline placeholder
 * section without changing its markup, styling, or content.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Heading`, `Text`, `Link`/
 * `buttonVariants`) — no new components, no data fetching, no business
 * logic. Real headline/supporting copy/CTAs are ultimately Site
 * Settings/Hero content-module data (§4, §8); this renders
 * frontend-owned Persian placeholder copy in the meantime, the same
 * convention already used by `Footer`/`ContactPage`/`AboutPage`.
 * Swapping this for a `useHero()`-style data hook later is additive —
 * `HomePage` only ever composes `<Hero />`, never its internals.
 */
export function Hero() {
  return (
    <Section spacing="lg" aria-labelledby="home-hero-heading">
      <Stack gap="lg" align="center" className="min-h-[60vh] justify-center text-center">
        <Stack gap="sm" align="center">
          <Heading id="home-hero-heading" level={1}>
            عنوان اصلی نمونه برای بخش هیرو
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن معرفی نمونه برای بخش هیرو. این متن جایگزین محتوایی است که
            در نهایت پس از پیاده‌سازی ماژول محتوایی هیرو، از طریق Public
            API بک‌اند تأمین خواهد شد.
          </Text>
        </Stack>

        <Stack direction="row" gap="sm" wrap className="justify-center">
          <Link href="/about" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
            بیشتر بدانید
          </Link>
          <Link href="/contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            تماس با ما
          </Link>
        </Stack>
      </Stack>
    </Section>
  );
}
