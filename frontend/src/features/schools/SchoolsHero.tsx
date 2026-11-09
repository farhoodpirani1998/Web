import { Building2 } from "lucide-react";

import {
  Link,
  MediaFrame,
  PageHero,
  buttonVariants,
} from "@/shared/design-system/components";
import { APP_NAME } from "@/shared/config/app";
import { cn } from "@/shared/utils/cn";

/**
 * Schools page hero — thin feature wrapper around the shared `PageHero`
 * (see `FIGMA-DESIGN-REFERENCE.md` §3: full-bleed bands render outside
 * `PageLayout`, which is why `SchoolsPage` keeps `<SchoolsHero />` out
 * of its container).
 *
 * The school directory is a visitor-friendly view of existing campus
 * data; campuses are the group's physical schools.
 */
export function SchoolsHero() {
  return (
    <PageHero
      headingId="schools-hero-heading"
      eyebrow="مدارس و پردیس‌ها"
      title={`مدارس ${APP_NAME}`}
      description="با مدارس گروه آموزشی آشنا شوید و اطلاعات هر مدرسه را در صفحه اختصاصی آن ببینید."
      media={
        <MediaFrame
          ratio={4 / 3}
          label="تصویر مدارس"
          icon={Building2}
          className="rounded-3xl shadow-xl shadow-brand-navy/5 ring-1 ring-border/60"
        />
      }
      actions={
        <>
          <Link
            href="/pre-registration"
            className={cn(
              buttonVariants({ variant: "default", size: "lg", shape: "pill" }),
              "bg-brand-navy text-white shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90",
            )}
          >
            پیش‌ثبت‌نام
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg", shape: "pill" }),
              "border-brand-navy/20 hover:bg-transparent",
            )}
          >
            مشاوره و پذیرش
          </Link>
        </>
      }
    />
  );
}
