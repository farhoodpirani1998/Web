import { ArrowLeft, BookOpen, Calendar, Users } from "lucide-react";

import { Container, Image, Link, buttonVariants } from "@/shared/design-system/components";
import { APP_NAME } from "@/shared/config/app";
import { cn } from "@/shared/utils/cn";
import { useHero } from "./useHero";
import type { Hero as HeroContent } from "./types";

/**
 * Frontend-owned Persian placeholder copy, rendered while `useHero()`
 * is loading, has errored, or the CMS has not published a Hero block
 * yet — the same "local literal as fallback" convention
 * `@/features/about`'s `AboutHero` and `@/features/site`'s `Brand`
 * established.
 */
const fallbackHero: HeroContent = {
  eyebrow: "به آینده‌ی فرزندانتان سرمایه‌گذاری کنید",
  title: `آینده‌ای روشن با ${APP_NAME}`,
  description:
    "ما با بهره‌گیری از اساتید مجرب و متدهای روز دنیا، مسیر موفقیت تحصیلی و فردی " +
    "دانش‌آموزان را هموار می‌کنیم.",
  image: {
    src: "/images/placeholders/hero.svg",
    alt: "دانش‌آموزان در حال مطالعه",
  },
  primaryCta: { label: "پیش‌ثبت‌نام", href: "/pre-registration" },
  secondaryCta: { label: "تماس با ما", href: "/contact" },
};

/**
 * Homepage "Hero" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy").
 *
 * Visual-refresh pass: a light, two-column layout (text column +
 * image column) replacing the earlier full-bleed dark-image hero —
 * matching the approved mockup's structure. The floating "active
 * students" badge and the small "استاندارد" icon card are frontend-
 * owned decorative chrome (same convention `TopBar`/`Header` already
 * use for non-CMS UI furniture), not CMS content — only `eyebrow`,
 * `title`, `description`, `image`, and the two CTAs come from
 * `useHero()`/`fallbackHero`.
 *
 * Rendered *outside* `HomePage`'s `PageLayout` (see `HomePage.tsx`)
 * so it can control its own full-bleed background; it opens its own
 * `Container` internally.
 */
export function Hero() {
  const { data } = useHero();
  const hero = data ?? fallbackHero;

  return (
    <section aria-labelledby="home-hero-heading" className="relative overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-navy/5 blur-3xl"
      />

      <Container size="xl" className="relative z-10 grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
        {/* Text column — first in DOM/reading order, sits on the right in RTL */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {hero.eyebrow && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-navy/5 px-3 py-1.5">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
              <span className="text-xs font-bold text-brand-navy">{hero.eyebrow}</span>
            </div>
          )}

          <h1
            id="home-hero-heading"
            className="mb-5 text-4xl font-bold leading-[1.35] tracking-tight text-foreground md:text-5xl"
          >
            {hero.title}
          </h1>

          <p className="mb-8 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            {hero.description}
          </p>

          {(hero.primaryCta || hero.secondaryCta) && (
            <div className="flex flex-wrap gap-3">
              {hero.secondaryCta && (
                <Link
                  href={hero.secondaryCta.href}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "gap-2 rounded-full border-brand-navy/20 text-brand-navy hover:border-brand-navy hover:bg-transparent",
                  )}
                >
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {hero.secondaryCta.label}
                </Link>
              )}
              {hero.primaryCta && (
                <Link
                  href={hero.primaryCta.href}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "gap-2 rounded-full bg-brand-navy text-white shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90",
                  )}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  {hero.primaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Image column */}
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
          <div
            aria-hidden="true"
            className="absolute -right-4 -top-4 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-lg ring-1 ring-border/60 md:-right-8 md:-top-8"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-xs font-bold leading-tight text-foreground">
              آموزش استاندارد
              <span className="block font-normal text-muted-foreground">بر اساس متدهای روز</span>
            </span>
          </div>

          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            loading="eager"
            fit="cover"
            ratio={4 / 3}
            containerClassName="overflow-hidden rounded-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-brand-navy p-4 text-white shadow-lg md:-left-8"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Users className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm leading-tight">
              <span className="block text-lg font-bold">+۳۲۰۰</span>
              <span className="text-xs text-white/70">دانش‌آموز فعال</span>
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
