/**
 * Centralized sidebar navigation configuration.
 *
 * Each entry is an id/label/route triple (consumed unchanged by
 * `AdminSidebar` and the global-search `navRegistry`), extended with a
 * `group` and a lucide `icon` for the grouped dark sidebar. Labels are
 * Persian — the admin shell's UI language.
 *
 * `NAV_GROUPS` fixes the section order; a group with no items simply
 * doesn't render. Nothing else should hardcode nav labels or paths.
 */
import {
  BarChart3,
  Building2,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  FileText,
  GraduationCap,
  History,
  Images,
  Info,
  LayoutDashboard,
  Link2,
  ListTree,
  MessageSquareQuote,
  MousePointerClick,
  Newspaper,
  Presentation,
  Settings,
  Sparkles,
  Trophy,
  UserCog,
  type LucideIcon,
} from "lucide-react";

import { ROUTE_PATHS } from "@/routes/paths";

export type NavGroupId =
  | "overview"
  | "content"
  | "people"
  | "blocks"
  | "media"
  | "submissions"
  | "system";

export interface NavItem {
  id: string;
  label: string;
  route: string;
  group: NavGroupId;
  icon: LucideIcon;
}

export interface NavGroup {
  id: NavGroupId;
  label: string;
}

/** Section order + Persian headings for the sidebar. */
export const NAV_GROUPS: NavGroup[] = [
  { id: "overview", label: "نمای کلی" },
  { id: "content", label: "محتوا" },
  { id: "people", label: "افراد و مکان‌ها" },
  { id: "blocks", label: "بلوک‌های صفحه" },
  { id: "media", label: "رسانه" },
  { id: "submissions", label: "درخواست‌ها" },
  { id: "system", label: "پیکربندی" },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "داشبورد",
    route: ROUTE_PATHS.ADMIN_DASHBOARD,
    group: "overview",
    icon: LayoutDashboard,
  },
  {
    id: "pages",
    label: "صفحات",
    route: ROUTE_PATHS.ADMIN_PAGES,
    group: "content",
    icon: FileText,
  },
  {
    id: "news",
    label: "اخبار",
    route: ROUTE_PATHS.ADMIN_NEWS,
    group: "content",
    icon: Newspaper,
  },
  {
    id: "events",
    label: "رویدادها",
    route: ROUTE_PATHS.ADMIN_EVENTS,
    group: "content",
    icon: CalendarDays,
  },
  {
    id: "gallery",
    label: "گالری",
    route: ROUTE_PATHS.ADMIN_GALLERY,
    group: "content",
    icon: Images,
  },
  {
    id: "hero-slides",
    label: "اسلایدهای هدر",
    route: ROUTE_PATHS.ADMIN_HERO_SLIDES,
    group: "content",
    icon: Presentation,
  },
  {
    id: "faq",
    label: "پرسش‌های متداول",
    route: ROUTE_PATHS.ADMIN_FAQS,
    group: "content",
    icon: CircleHelp,
  },
  {
    id: "teachers",
    label: "اساتید",
    route: ROUTE_PATHS.ADMIN_TEACHERS,
    group: "people",
    icon: GraduationCap,
  },
  {
    id: "campuses",
    label: "پردیس‌ها",
    route: ROUTE_PATHS.ADMIN_CAMPUSES,
    group: "people",
    icon: Building2,
  },
  {
    id: "testimonials",
    label: "نظرات",
    route: ROUTE_PATHS.ADMIN_TESTIMONIALS,
    group: "people",
    icon: MessageSquareQuote,
  },
  {
    id: "features",
    label: "ویژگی‌ها",
    route: ROUTE_PATHS.ADMIN_FEATURES,
    group: "blocks",
    icon: Sparkles,
  },
  {
    id: "statistics",
    label: "آمار",
    route: ROUTE_PATHS.ADMIN_STATISTICS,
    group: "blocks",
    icon: BarChart3,
  },
  {
    id: "about",
    label: "درباره ما",
    route: ROUTE_PATHS.ADMIN_ABOUT,
    group: "blocks",
    icon: Info,
  },
  {
    id: "achievements",
    label: "افتخارات",
    route: ROUTE_PATHS.ADMIN_ACHIEVEMENTS,
    group: "blocks",
    icon: Trophy,
  },
  {
    id: "academic-calendar",
    label: "تقویم آموزشی",
    route: ROUTE_PATHS.ADMIN_ACADEMIC_CALENDAR,
    group: "blocks",
    icon: CalendarDays,
  },
  {
    id: "admissions",
    label: "پذیرش",
    route: ROUTE_PATHS.ADMIN_ADMISSIONS,
    group: "blocks",
    icon: GraduationCap,
  },
  {
    id: "cta",
    label: "فراخوان اقدام",
    route: ROUTE_PATHS.ADMIN_CTA,
    group: "blocks",
    icon: MousePointerClick,
  },
  {
    id: "menus",
    label: "منوها",
    route: ROUTE_PATHS.ADMIN_MENUS,
    group: "blocks",
    icon: ListTree,
  },
  {
    id: "portal-links",
    label: "لینک‌های سامانه",
    route: ROUTE_PATHS.ADMIN_PORTAL_LINKS,
    group: "blocks",
    icon: Link2,
  },
  {
    id: "media",
    label: "رسانه",
    route: ROUTE_PATHS.ADMIN_MEDIA,
    group: "media",
    icon: Images,
  },
  {
    id: "pre-registrations",
    label: "پیش‌ثبت‌نام‌ها",
    route: ROUTE_PATHS.ADMIN_PRE_REGISTRATIONS,
    group: "submissions",
    icon: ClipboardList,
  },
  {
    id: "audit-log",
    label: "گزارش فعالیت‌ها",
    route: ROUTE_PATHS.ADMIN_AUDIT_LOG,
    group: "system",
    icon: History,
  },
  {
    id: "admin-users",
    label: "کاربران مدیریت",
    route: ROUTE_PATHS.ADMIN_ADMIN_USERS,
    group: "system",
    icon: UserCog,
  },
  {
    id: "settings",
    label: "تنظیمات",
    route: ROUTE_PATHS.ADMIN_SETTINGS,
    group: "system",
    icon: Settings,
  },
];
