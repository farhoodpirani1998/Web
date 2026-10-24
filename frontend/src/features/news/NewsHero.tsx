import { Rss } from "lucide-react";

import { Link, PageHero, buttonVariants } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * News page hero — thin feature wrapper around the shared `PageHero`.
 *
 * No media slot: an article index reads better with a wider text block
 * than with a decorative image. Real copy is ultimately the backend's
 * News/Announcements content module (§4, §8); `NewsPage` only ever
 * composes `<NewsHero />`, so wiring a data hook in later stays inside
 * this file.
 */
export function NewsHero() {
  return (
    <PageHero
      headingId="news-hero-heading"
      eyebrow="اخبار و اطلاعیه‌ها"
      title="تازه‌ترین اخبار مجموعه"
      description="اطلاعیه‌های آموزشی، رویدادها و دستاوردهای گروه آموزشی ندای حقیقت در این بخش منتشر می‌شود."
      actions={
        <>
          <Link
            href="/events"
            className={cn(
              buttonVariants({ variant: "default", size: "lg", shape: "pill" }),
              "bg-brand-navy text-white shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90",
            )}
          >
            تقویم رویدادها
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg", shape: "pill" }),
              "gap-2 border-brand-navy/20 hover:bg-transparent",
            )}
          >
            <Rss className="h-4 w-4" aria-hidden="true" />
            پیگیری اطلاعیه‌ها
          </Link>
        </>
      }
    />
  );
}
