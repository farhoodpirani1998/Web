import type { GalleryItem } from "./types";

/**
 * Frontend-owned placeholder `GalleryItem` records.
 *
 * Grouped into a single local array literal rather than interleaved
 * in JSX (Website Frontend Architecture §4, §8), mirroring
 * `@/features/campuses`'s `data.ts` and `@/features/teachers`'s
 * `data.ts`, so the eventual swap to a `useGallery()`-style data hook
 * is a matter of replacing this one literal — no section component
 * needs to change. Real values are ultimately the backend's
 * Gallery/Media content-module data; every entry here is
 * frontend-owned Persian placeholder copy.
 *
 * These are the same eight items previously inlined directly inside
 * `GalleryGrid` (same `id`/category grouping, captions carried over
 * verbatim as `title`) — extracting them here is a refactor of where
 * the data lives, not a change to what is shown.
 */
export const galleryItems: readonly GalleryItem[] = [
  {
    id: "g1",
    title: "فضای آموزشی شعبه مرکزی",
    category: "فضای آموزشی",
    image: { alt: "فضای آموزشی شعبه مرکزی" },
    description: "متن نمونه توضیح تکمیلی درباره فضای آموزشی شعبه مرکزی و امکانات کلاس‌های آن.",
  },
  {
    id: "g2",
    title: "کارگاه آموزشی ویژه اولیا",
    category: "رویداد",
    image: { alt: "کارگاه آموزشی ویژه اولیا" },
    description: "متن نمونه توضیح تکمیلی درباره کارگاه آموزشی برگزارشده ویژه اولیای دانش‌آموزان.",
  },
  {
    id: "g3",
    title: "کلاس درس شعبه غرب تهران",
    category: "فضای آموزشی",
    image: { alt: "کلاس درس شعبه غرب تهران" },
    description: "متن نمونه توضیح تکمیلی درباره فضای کلاس درس و امکانات آموزشی شعبه غرب تهران.",
  },
  {
    id: "g4",
    title: "نشست معرفی مسیرهای تحصیلی",
    category: "رویداد",
    image: { alt: "نشست معرفی مسیرهای تحصیلی" },
    description: "متن نمونه توضیح تکمیلی درباره نشست معرفی مسیرهای تحصیلی برای دانش‌آموزان و خانواده‌ها.",
  },
  {
    id: "g5",
    title: "کتابخانه و فضای مطالعه",
    category: "فضای آموزشی",
    image: { alt: "کتابخانه و فضای مطالعه" },
    description: "متن نمونه توضیح تکمیلی درباره کتابخانه و فضای مطالعه در دسترس دانش‌آموزان.",
  },
  {
    id: "g6",
    title: "جشن فارغ‌التحصیلی دانش‌آموزان",
    category: "رویداد",
    image: { alt: "جشن فارغ‌التحصیلی دانش‌آموزان" },
    description: "متن نمونه توضیح تکمیلی درباره مراسم جشن فارغ‌التحصیلی دانش‌آموزان مجموعه.",
  },
  {
    id: "g7",
    title: "آزمایشگاه علوم شعبه اصفهان",
    category: "فضای آموزشی",
    image: { alt: "آزمایشگاه علوم شعبه اصفهان" },
    description: "متن نمونه توضیح تکمیلی درباره آزمایشگاه علوم و تجهیزات آموزشی شعبه اصفهان.",
  },
  {
    id: "g8",
    title: "مراسم اهدای جوایز برترین‌ها",
    category: "دستاورد",
    image: { alt: "مراسم اهدای جوایز برترین‌ها" },
    description: "متن نمونه توضیح تکمیلی درباره مراسم اهدای جوایز به دانش‌آموزان برتر مجموعه.",
  },
] as const;
