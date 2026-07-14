import type { Event } from "./types";

/**
 * Frontend-owned placeholder `Event` records.
 *
 * Grouped into a single local array literal rather than interleaved
 * in JSX (Website Frontend Architecture §4, §8), mirroring
 * `@/features/campuses`'s and `@/features/teachers`'s `data.ts`, so
 * the eventual swap to a `useEvents()`-style data hook is a matter of
 * replacing this one literal — no section component needs to change.
 * Real values are ultimately the backend's Events content-module
 * data; every entry here is frontend-owned Persian placeholder copy.
 */
export const events: readonly Event[] = [
  {
    id: "family-day",
    title: "روز خانواده",
    description: "متن نمونه معرفی کوتاه برای رویداد روز خانواده.",
    detailedDescription:
      "متن نمونه توضیح تکمیلی درباره برنامه روز خانواده، فعالیت‌های پیش‌بینی‌شده و نحوه حضور خانواده‌ها.",
    category: "رویداد فرهنگی",
    date: "۱۵ آبان ۱۴۰۳",
    time: "۹:۰۰ تا ۱۲:۰۰",
    location: "پردیس مرکزی",
    image: { alt: "تصویر رویداد روز خانواده" },
    tags: ["ویژه خانواده‌ها", "ثبت‌نام آزاد"],
  },
  {
    id: "graduation-ceremony",
    title: "جشن فارغ‌التحصیلی",
    description: "متن نمونه معرفی کوتاه برای جشن فارغ‌التحصیلی دانش‌آموزان.",
    detailedDescription:
      "متن نمونه توضیح تکمیلی درباره برنامه جشن فارغ‌التحصیلی، اهدای گواهی‌نامه‌ها و برنامه‌های جانبی مراسم.",
    category: "جشن مدرسه",
    date: "۲۰ خرداد ۱۴۰۴",
    time: "۱۶:۰۰ تا ۱۹:۰۰",
    location: "سالن آمفی‌تئاتر پردیس اصفهان",
    image: { alt: "تصویر جشن فارغ‌التحصیلی" },
    tags: ["ویژه دانش‌آموزان", "دعوت‌نامه محدود"],
  },
  {
    id: "parent-workshop",
    title: "کارگاه آموزشی والدین",
    description: "متن نمونه معرفی کوتاه برای کارگاه آموزشی ویژه والدین.",
    detailedDescription:
      "متن نمونه توضیح تکمیلی درباره سرفصل‌های کارگاه آموزشی والدین و نحوه ثبت‌نام در آن.",
    category: "کارگاه آموزشی",
    date: "۸ دی ۱۴۰۳",
    time: "۱۷:۰۰ تا ۱۹:۰۰",
    location: "پردیس غرب تهران",
    image: { alt: "تصویر کارگاه آموزشی والدین" },
    tags: ["ویژه والدین", "ظرفیت محدود"],
  },
  {
    id: "science-museum-visit",
    title: "بازدید علمی از موزه ملی",
    description: "متن نمونه معرفی کوتاه برای بازدید علمی دانش‌آموزان از موزه ملی.",
    detailedDescription:
      "متن نمونه توضیح تکمیلی درباره برنامه بازدید علمی، مسیر حرکت و هماهنگی‌های لازم پیش از بازدید.",
    category: "بازدید علمی",
    date: "۲ اسفند ۱۴۰۳",
    time: "۸:۳۰ تا ۱۳:۰۰",
    location: "پردیس مشهد",
    image: { alt: "تصویر بازدید علمی از موزه ملی" },
    tags: ["ویژه دانش‌آموزان", "نیازمند هماهنگی قبلی"],
  },
] as const;
