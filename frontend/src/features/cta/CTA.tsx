import { Container, Heading, Link, Text, buttonVariants } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

import { useCTA } from "./useCTA";

/**
 * Homepage "CTA" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — rebuilt as a
 * full-bleed `bg-primary` closing section matching the approved Figma
 * design's `CTASection`, replacing the earlier rounded-card treatment.
 *
 * Backed by `useCTA()` (the Public API's CTA content module, §4, §8).
 * While the query is loading, has errored, or a given field is absent
 * from the response, each value falls back to the same frontend-owned
 * Persian placeholder copy this section rendered before it was wired
 * up — same convention already used by `Hero`/`Features`/`Footer`.
 * Both CTAs fall back to real existing routes (`/pre-registration`,
 * `/admissions`) rather than a placeholder link (§ "no placeholder
 * code").
 *
 * Rendered full-bleed *outside* `HomePage`'s `PageLayout`, the same
 * reasoning as `Hero`/`HomeStatsBand` (see `HomePage.tsx`) — it needs
 * to span the full viewport width, not sit inside `PageLayout`'s
 * `Container` gutters.
 */

const CTA_EYEBROW_PLACEHOLDER = "به خانواده‌ی ما بپیوندید";
const CTA_TITLE_PLACEHOLDER = "عنوان نمونه برای بخش فراخوان اقدام";
const CTA_DESCRIPTION_PLACEHOLDER =
  "متن جمع‌بندی نمونه برای بخش فراخوان اقدام. این متن جایگزین محتوایی است که در نهایت پس از " +
  "پیاده‌سازی ماژول محتوایی فراخوان اقدام، از طریق Public API بک‌اند تأمین خواهد شد.";
const CTA_PRIMARY_PLACEHOLDER = { label: "شروع پیش‌ثبت‌نام", href: "/pre-registration" };
const CTA_SECONDARY_PLACEHOLDER = { label: "پذیرش و ثبت‌نام", href: "/admissions" };

export function CTA() {
  const { data } = useCTA();

  const eyebrow = data?.eyebrow ?? CTA_EYEBROW_PLACEHOLDER;
  const title = data?.title ?? CTA_TITLE_PLACEHOLDER;
  const description = data?.description ?? CTA_DESCRIPTION_PLACEHOLDER;
  const primaryCta = data?.primaryCta ?? CTA_PRIMARY_PLACEHOLDER;
  const secondaryCta = data?.secondaryCta ?? CTA_SECONDARY_PLACEHOLDER;

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
          <span className="text-xs font-bold text-accent">{eyebrow}</span>
          <span aria-hidden="true" className="h-px w-8 bg-accent/60" />
        </div>

        <Heading
          id="home-cta-heading"
          level={2}
          color="inherit"
          className="mx-auto mb-5 max-w-2xl text-3xl leading-tight text-white md:text-5xl"
        >
          {title}
        </Heading>

        <Text variant="lead" color="inherit" className="mx-auto mb-10 max-w-xl text-white/55">
          {description}
        </Text>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href={primaryCta.href}
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full bg-accent px-8 py-4 text-primary shadow-xl shadow-accent/20 hover:bg-accent/90",
            )}
          >
            {primaryCta.label}
          </Link>
          <Link
            href={secondaryCta.href}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-full border-white/25 px-8 py-4 text-white hover:border-accent hover:bg-transparent hover:text-accent",
            )}
          >
            {secondaryCta.label}
          </Link>
        </div>
      </Container>
    </section>
  );
}
