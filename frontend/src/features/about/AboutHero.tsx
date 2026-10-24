import { Sparkles } from "lucide-react";

import {
  Link,
  MediaFrame,
  PageHero,
  buttonVariants,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";
import { useAboutPage } from "./useAboutPage";
import type { AboutHeroContent } from "./types";

/**
 * Frontend-owned Persian placeholder copy, rendered while
 * `useAboutPage()` is loading, has errored, or the CMS has not
 * published a Hero block yet — the same "local literal as fallback"
 * convention `@/features/news`'s `NewsList` established.
 */
const fallbackHero: AboutHeroContent = {
  eyebrow: "درباره ما",
  title: "با گروه آموزشی ما بیشتر آشنا شوید",
  description:
    "مسیر آموزشی مجموعه، از نخستین سال تأسیس تا امروز، بر پایه سه اصل " +
    "کیفیت تدریس، پیگیری فردی دانش‌آموز و ارتباط مستمر با خانواده بنا شده است.",
};

/**
 * About page hero — thin feature wrapper around the shared `PageHero`.
 *
 * Rendered outside `AboutPage`'s `PageLayout` so the band can span the
 * full viewport width (see `FIGMA-DESIGN-REFERENCE.md` §3).
 */
export function AboutHero() {
  const { data } = useAboutPage();
  const hero = data?.hero ?? fallbackHero;

  return (
    <PageHero
      headingId="about-hero-heading"
      eyebrow={hero.eyebrow}
      title={hero.title}
      description={hero.description}
      media={
        <MediaFrame
          ratio={4 / 3}
          label="تصویر مجموعه به‌زودی"
          icon={Sparkles}
          className="rounded-3xl shadow-xl shadow-brand-navy/5 ring-1 ring-border/60"
        />
      }
      actions={
        <>
          <Link
            href="/admissions"
            className={cn(
              buttonVariants({ variant: "default", size: "lg", shape: "pill" }),
              "bg-brand-navy text-white shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90",
            )}
          >
            شرایط و مراحل پذیرش
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg", shape: "pill" }),
              "border-brand-navy/20 hover:bg-transparent",
            )}
          >
            گفت‌وگو با ما
          </Link>
        </>
      }
    />
  );
}
