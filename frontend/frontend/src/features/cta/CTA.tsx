import { Container, Heading, Link, Text, buttonVariants } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Homepage "CTA" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — rebuilt as a
 * full-bleed `bg-primary` closing section matching the approved Figma
 * design's `CTASection`, replacing the earlier rounded-card treatment.
 *
 * Presentation only: composed from existing design-system primitives
 * (`Container`, `Heading`, `Text`, `Link`/`buttonVariants`) plus a
 * subtle `aria-hidden` dot-texture overlay (inline `radial-gradient`,
 * matching Figma exactly — no image asset). Real headline/supporting
 * copy are ultimately CTA content-module data (§4, §8); this renders
 * frontend-owned Persian placeholder copy in the meantime, the same
 * convention already used by `Hero`/`Features`/`Footer`. Both CTAs
 * point at real existing routes (`/pre-registration`, `/admissions`) —
 * Figma's second CTA ("Schedule a Campus Visit") has no backing route
 * yet, so it was replaced with the existing `/admissions` link rather
 * than wired to a placeholder (§ "no placeholder code").
 *
 * Rendered full-bleed *outside* `HomePage`'s `PageLayout`, the same
 * reasoning as `Hero`/`HomeStatsBand` (see `HomePage.tsx`) — it needs
 * to span the full viewport width, not sit inside `PageLayout`'s
 * `Container` gutters.
 */
export function CTA() {
  return (
    <section aria-labelledby="home-cta-heading" className="relative overflow-hidden bg-primary py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }}
      />

      <Container size="xl" className="relative z-10 text-center">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-accent/60" />
          <span className="text-xs font-bold text-accent">به خانواده‌ی ما بپیوندید</span>
          <span aria-hidden="true" className="h-px w-8 bg-accent/60" />
        </div>

        <Heading
          id="home-cta-heading"
          level={2}
          color="inherit"
          className="mx-auto mb-5 max-w-2xl text-3xl leading-tight text-white md:text-5xl"
        >
          عنوان نمونه برای بخش فراخوان اقدام
        </Heading>

        <Text variant="lead" color="inherit" className="mx-auto mb-10 max-w-xl text-white/55">
          متن جمع‌بندی نمونه برای بخش فراخوان اقدام. این متن جایگزین محتوایی است که در نهایت پس از
          پیاده‌سازی ماژول محتوایی فراخوان اقدام، از طریق Public API بک‌اند تأمین خواهد شد.
        </Text>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/pre-registration"
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full bg-accent px-8 py-4 text-primary shadow-xl shadow-accent/20 hover:bg-accent/90",
            )}
          >
            شروع پیش‌ثبت‌نام
          </Link>
          <Link
            href="/admissions"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-full border-white/25 px-8 py-4 text-white hover:border-accent hover:bg-transparent hover:text-accent",
            )}
          >
            پذیرش و ثبت‌نام
          </Link>
        </div>
      </Container>
    </section>
  );
}
