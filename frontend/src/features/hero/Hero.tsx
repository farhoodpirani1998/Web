import { Badge, buttonVariants, Heading, Link, Section, Stack, Text } from "@/shared/design-system/components";
import { APP_NAME } from "@/shared/config/app";
import { cn } from "@/shared/utils/cn";

/**
 * Homepage "Hero" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — the first real
 * feature module, extracted from `HomePage`'s inline placeholder
 * section without changing its markup, styling, or content.
 *
 * Presentation only: composed from existing design-system primitives
 * (`Section`, `Stack`, `Heading`, `Text`, `Badge`, `Link`/
 * `buttonVariants`) plus two small local, `aria-hidden` decorative SVG
 * helpers (`SparkIcon`, `HeroEmblem`) in the same spirit as
 * `MobileNavigation`'s existing `MenuIcon` — no new shared component,
 * no data fetching, no business logic. Real headline/supporting
 * copy/CTAs are ultimately Site Settings/Hero content-module data (§4,
 * §8); this still renders frontend-owned Persian placeholder copy in
 * the meantime, the same convention already used by
 * `Footer`/`ContactPage`/`AboutPage`.
 *
 * Visual refresh: the centered single column becomes an asymmetric
 * two-column layout (text + a decorative navy/gold crest echoing the
 * header's `BrandMark`) on `lg`+, collapsing back to a single stacked
 * column below it. `Section` still sits inside `HomePage`'s existing
 * `PageLayout`/`Container`, so no extra `Container` is introduced here
 * — that would double up the horizontal gutters already provided by
 * the page.
 */
export function Hero() {
  return (
    <Section spacing="xl" aria-labelledby="home-hero-heading" className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-b from-muted/70 via-muted/15 to-transparent"
      />

      <div className="grid items-center gap-12 py-4 lg:min-h-[26rem] lg:grid-cols-12 lg:gap-10">
        <Stack gap="lg" align="start" className="lg:col-span-7">
          <Stack gap="sm" align="start">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-brand-gold/40 bg-brand-gold/10 px-3 py-1 text-brand-navy"
            >
              <SparkIcon className="h-3 w-3" />
              {APP_NAME}
            </Badge>

            <Stack gap="xs" align="start">
              <Heading id="home-hero-heading" level={1} className="max-w-xl">
                عنوان اصلی نمونه برای بخش هیرو
              </Heading>
              <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
            </Stack>

            <Text variant="lead" className="max-w-lg text-foreground/70">
              متن معرفی نمونه برای بخش هیرو. این متن جایگزین محتوایی است که
              در نهایت پس از پیاده‌سازی ماژول محتوایی هیرو، از طریق Public
              API بک‌اند تأمین خواهد شد.
            </Text>
          </Stack>

          <Stack direction="row" gap="sm" wrap>
            <Link
              href="/about"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "bg-brand-gold text-brand-navy shadow-sm hover:bg-brand-gold/90",
              )}
            >
              بیشتر بدانید
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-brand-navy/25 text-brand-navy hover:bg-brand-navy hover:text-white",
              )}
            >
              تماس با ما
            </Link>
          </Stack>
        </Stack>

        <div className="lg:col-span-5">
          <HeroEmblem className="mx-auto w-full max-w-xs sm:max-w-sm" />
        </div>
      </div>
    </Section>
  );
}

/** Small "quality mark" glyph used inside the eyebrow badge. Decorative only. */
function SparkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" focusable="false">
      <path
        d="M8 0.5 9.4 6.1 15 8 9.4 9.9 8 15.5 6.6 9.9 1 8 6.6 6.1 8 0.5Z"
        className="fill-brand-gold"
      />
    </svg>
  );
}

/**
 * Decorative navy/gold crest — the hero's signature visual, echoing
 * `Header`'s `BrandMark` at a larger scale so the two areas read as one
 * brand system. Purely presentational (`aria-hidden`), built only from
 * existing tokens (`brand-navy`/`brand-gold`/`accent`/`background`), no
 * external image asset.
 */
function HeroEmblem({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-square", className)} aria-hidden="true">
      <div className="absolute inset-0 rounded-[2rem] bg-accent" />
      <div className="absolute inset-6 rounded-[1.5rem] border border-brand-gold/30" />
      <svg viewBox="0 0 200 200" className="absolute inset-10">
        <circle cx="100" cy="100" r="92" className="fill-brand-navy" />
        <circle cx="100" cy="100" r="90" className="fill-none stroke-brand-gold/70" strokeWidth="1.5" />
        <path
          d="M55 118V72l45-24 45 24v46"
          className="fill-none stroke-brand-gold"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M100 48v70" className="stroke-brand-gold" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="130" r="4" className="fill-brand-gold" />
        <path
          d="M55 118q45 22 90 0"
          className="fill-none stroke-background/60"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute -top-2 end-10 h-3 w-3 rounded-full bg-brand-gold shadow-sm" />
      <span className="absolute bottom-8 start-0 h-2 w-2 rounded-full bg-brand-navy/50" />
    </div>
  );
}
