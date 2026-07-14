import type { Teacher } from "./types";

/**
 * Frontend-owned placeholder `Teacher` records.
 *
 * Grouped into a single local array literal rather than interleaved
 * in JSX (Website Frontend Architecture §4, §8), mirroring
 * `@/features/campuses`'s `data.ts`, so the eventual swap to a
 * `useTeachers()`-style data hook is a matter of replacing this one
 * literal — no section component needs to change. Real values are
 * ultimately the backend's Teachers content-module data; every entry
 * here is frontend-owned Persian placeholder copy.
 */
export const teachers: readonly Teacher[] = [
  {
    id: "hosseini",
    name: "دکتر حسینی",
    subject: "دبیر ریاضی",
    bio: "متن نمونه معرفی کوتاه برای دبیر ریاضی و سابقه تدریس ایشان.",
    image: { alt: "تصویر دکتر حسینی" },
    specialties: ["دکترای ریاضی محض", "مدرس کنکور", "۱۵ سال سابقه تدریس"],
  },
  {
    id: "ahmadi",
    name: "خانم احمدی",
    subject: "دبیر ادبیات فارسی",
    bio: "متن نمونه معرفی کوتاه برای دبیر ادبیات فارسی و سابقه تدریس ایشان.",
    image: { alt: "تصویر خانم احمدی" },
    specialties: ["کارشناسی ارشد ادبیات فارسی", "مدرس کارگاه نویسندگی"],
  },
  {
    id: "karimi",
    name: "آقای کریمی",
    subject: "دبیر فیزیک",
    bio: "متن نمونه معرفی کوتاه برای دبیر فیزیک و سابقه تدریس ایشان.",
    image: { alt: "تصویر آقای کریمی" },
    specialties: ["کارشناسی ارشد فیزیک", "مدرس المپیاد", "۱۰ سال سابقه تدریس"],
  },
  {
    id: "rezaei",
    name: "خانم رضایی",
    subject: "دبیر زبان انگلیسی",
    bio: "متن نمونه معرفی کوتاه برای دبیر زبان انگلیسی و سابقه تدریس ایشان.",
    image: { alt: "تصویر خانم رضایی" },
    specialties: ["مدرک بین‌المللی تدریس زبان", "مدرس دوره‌های آیلتس"],
  },
] as const;
