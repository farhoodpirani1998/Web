import { ArrowLeft } from "lucide-react";

import { Container, Image, Link, buttonVariants } from "@/shared/design-system/components";
import { APP_NAME } from "@/shared/config/app";
import { cn } from "@/shared/utils/cn";

/**
 * Homepage "Hero" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy").
 *
 * Full-bleed, image-backed hero matching the approved Figma design:
 * a `min-h-[600px] h-[90vh]` section with a cover photo, a `--primary`
 * (navy) scrim/gradient over it, and the headline/CTAs sitting on top.
 * Deliberately rendered *outside* `HomePage`'s `PageLayout`/`Container`
 * (see `HomePage.tsx`) so it can span the full viewport width; it opens
 * its own `Container` only for the text column, matching Figma's
 * `max-w-7xl` inner wrapper.
 *
 * The background photo is a stand-in: hero imagery is ultimately
 * sourced from the Site/CMS content module (§4, §8), so this renders a
 * placeholder image and frontend-owned Persian copy in the meantime —
 * same convention as `Footer`/`ContactPage`/`AboutPage`. Both CTAs
 * point at real existing routes (`/pre-registration`, `/contact`); no
 * portal-login route exists yet, so that Figma CTA is intentionally
 * left out rather than wired to a placeholder link (§ "no placeholder
 * code").
 *
 * Entrance motion uses `tailwindcss-animate`'s `animate-in` utilities
 * (already a dependency) instead of adding a runtime animation
 * library — CSS-only, no new dependency.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative flex h-[90vh] min-h-[600px] items-center overflow-hidden bg-primary"
    >
      <Image
        src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop&auto=format"
        alt="نمای ساختمان و محوطه‌ی آموزشی مجتمع"
        loading="eager"
        fit="cover"
        containerClassName="absolute inset-0 h-full w-full"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-primary/78" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent"
      />

      <Container size="xl" className="relative z-10 w-full pt-8">
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-7 inline-flex items-center gap-3 animate-in fade-in slide-in-from-start-4 duration-700 delay-150 fill-mode-both">
            <span aria-hidden="true" className="h-px w-10 bg-accent" />
            <span className="text-xs font-bold text-accent">{APP_NAME}</span>
          </div>

          <h1
            id="home-hero-heading"
            className="mb-6 text-4xl font-bold leading-[1.3] tracking-tight text-white md:text-5xl lg:text-[3.4rem]"
          >
            آینده‌ای روشن با <span className="text-accent">آموزشی معنادار</span>
          </h1>

          <p className="mb-10 max-w-xl text-base font-light leading-relaxed text-white/65 md:text-lg">
            متن معرفی نمونه برای بخش هیرو. این متن جایگزین محتوایی است که در نهایت پس از پیاده‌سازی ماژول
            محتوایی هیرو، از طریق Public API بک‌اند تأمین خواهد شد.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/pre-registration"
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 rounded-full bg-accent text-primary shadow-lg shadow-accent/20 hover:bg-accent/90",
              )}
            >
              پیش‌ثبت‌نام
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "gap-2 rounded-full border-white/30 text-white backdrop-blur-sm hover:border-accent hover:bg-transparent hover:text-accent",
              )}
            >
              تماس با ما
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>

      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 animate-in fade-in duration-700 delay-500 fill-mode-both"
      >
        <span className="text-[10px] font-medium text-white/30">اسکرول کنید</span>
        <span className="h-10 w-px bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  );
}
