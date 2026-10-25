import { LandPlot } from "lucide-react";

import {
  Link,
  MediaFrame,
  PageHero,
  buttonVariants,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Campuses page hero — thin wrapper around the shared `PageHero`.
 * Full-bleed, so `CampusesPage` renders it outside `PageLayout`.
 *
 * Presentation only: the campus data itself belongs to `CampusList`.
 *
 * Note this page and `/schools` both surface `useCampuses()`. They are
 * kept separate deliberately (see the scope note on `CampusList`), but
 * the two heroes are differentiated so the pages do not read as copies.
 */
export function Hero() {
  return (
    <PageHero
      headingId="campuses-hero-heading"
      eyebrow="پردیس‌های آموزشی"
      title="پردیس‌ها و امکانات آموزشی ما"
      description="آدرس، راه‌های تماس و امکانات هر پردیس از طریق سامانه مدیریت محتوا در همین صفحه نمایش داده می‌شود."
      media={
        <MediaFrame
          ratio={4 / 3}
          label="تصویر پردیس به‌زودی"
          icon={LandPlot}
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
            تماس با ما
          </Link>
        </>
      }
    />
  );
}
