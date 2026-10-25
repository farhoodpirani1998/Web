import { Link, PageHero, buttonVariants } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Gallery page hero — thin wrapper around the shared `PageHero`.
 * Full-bleed, so `GalleryPage` renders it outside `PageLayout`.
 *
 * Deliberately no `media` slot: `GalleryGrid` immediately below *is*
 * the imagery, and a placeholder tile in the hero would compete with it.
 */
export function GalleryHero() {
  return (
    <PageHero
      headingId="gallery-hero-heading"
      eyebrow="گالری تصاویر"
      title="نگاهی به فضا و فعالیت‌های مجموعه"
      description="تصاویر واقعی کلاس‌ها، رویدادها و فعالیت‌های شعب از طریق سامانه مدیریت محتوا در همین گالری منتشر می‌شود."
      actions={
        <>
          <Link
            href="/schools"
            className={cn(
              buttonVariants({ variant: "default", size: "lg", shape: "pill" }),
              "bg-brand-navy text-white shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90",
            )}
          >
            شعب و مدارس
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
