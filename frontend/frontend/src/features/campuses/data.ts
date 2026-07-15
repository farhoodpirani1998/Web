import type { Campus } from "./types";

/**
 * Frontend-owned placeholder `Campus` records.
 *
 * Grouped into a single local array literal rather than interleaved
 * in JSX (Website Frontend Architecture §4, §8), reused by both
 * `CampusList` (overview) and `CampusDetails` (expanded) so the
 * eventual swap to a `useCampuses()`-style data hook is a matter of
 * replacing this one literal — no section component needs to change.
 * Real values are ultimately the backend's Campuses content-module
 * data; every entry here is frontend-owned Persian placeholder copy.
 */
export const campuses: readonly Campus[] = [
  {
    id: "central",
    name: "پردیس مرکزی",
    description: "متن نمونه معرفی کوتاه برای پردیس مرکزی.",
    detailedDescription:
      "متن نمونه توضیح تکمیلی درباره پردیس مرکزی، امکانات آموزشی و رفاهی آن، و فضای کلی مجموعه.",
    area: "تهران، مرکز شهر",
    address: "خیابان انقلاب، نرسیده به میدان فردوسی، پلاک ۱۲",
    contact: { phone: "۰۲۱-۱۲۳۴۵۶۷۸", phoneHref: "tel:+982112345678" },
    image: { alt: "نمای ساختمان پردیس مرکزی" },
    features: ["کتابخانه", "سالن ورزشی", "آزمایشگاه علوم", "کارگاه رایانه"],
  },
  {
    id: "west",
    name: "پردیس غرب تهران",
    description: "متن نمونه معرفی کوتاه برای پردیس غرب تهران.",
    detailedDescription:
      "متن نمونه توضیح تکمیلی درباره پردیس غرب تهران، امکانات آموزشی و رفاهی آن، و فضای کلی مجموعه.",
    area: "تهران، منطقه غرب",
    address: "بلوار اشرفی اصفهانی، خیابان نمونه، پلاک ۴۵",
    contact: { phone: "۰۲۱-۲۳۴۵۶۷۸۹", phoneHref: "tel:+982123456789" },
    image: { alt: "نمای ساختمان پردیس غرب تهران" },
    features: ["سالن ورزشی", "زمین بازی", "کارگاه هنر"],
  },
  {
    id: "isfahan",
    name: "پردیس اصفهان",
    description: "متن نمونه معرفی کوتاه برای پردیس اصفهان.",
    detailedDescription:
      "متن نمونه توضیح تکمیلی درباره پردیس اصفهان، امکانات آموزشی و رفاهی آن، و فضای کلی مجموعه.",
    area: "اصفهان",
    address: "خیابان چهارباغ، خیابان نمونه، پلاک ۵۶",
    contact: {
      phone: "۰۳۱-۱۲۳۴۵۶۷۸",
      phoneHref: "tel:+983112345678",
      email: "isfahan@example.com",
    },
    image: { alt: "نمای ساختمان پردیس اصفهان" },
    features: ["کتابخانه", "آزمایشگاه علوم", "سالن آمفی‌تئاتر"],
  },
  {
    id: "mashhad",
    name: "پردیس مشهد",
    description: "متن نمونه معرفی کوتاه برای پردیس مشهد.",
    detailedDescription:
      "متن نمونه توضیح تکمیلی درباره پردیس مشهد، امکانات آموزشی و رفاهی آن، و فضای کلی مجموعه.",
    area: "خراسان رضوی، مشهد",
    address: "بلوار وکیل‌آباد، خیابان نمونه، پلاک ۸۹",
    contact: { phone: "۰۵۱-۱۲۳۴۵۶۷۸", phoneHref: "tel:+985112345678" },
    image: { alt: "نمای ساختمان پردیس مشهد" },
    features: ["کتابخانه", "کارگاه رایانه", "زمین بازی"],
  },
] as const;
