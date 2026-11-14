/**
 * Centralized sidebar navigation configuration.
 *
 * Each entry is an id/label/route triple (consumed unchanged by
 * `AdminSidebar` and the global-search `navRegistry`), extended with a
 * `group` and a lucide `icon` for the grouped dark sidebar. Labels are
 * Persian â€” the admin shell's UI language.
 *
 * `NAV_GROUPS` fixes the section order; a group with no items simply
 * doesn't render. Nothing else should hardcode nav labels or paths.
 */
import {
  BarChart3,
  BookOpen,
  BadgeCheck,
  Building2,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  MessageSquare,
  FileText,
  GraduationCap,
  History,
  Images,
  Info,
  LayoutDashboard,
  Link2,
  Mail,
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
  "overview" | "content" | "people" | "blocks" | "media" | "submissions" | "system";

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
  { id: "overview", label: "Ù†Ù…Ø§ÛŒ Ú©Ù„ÛŒ" },
  { id: "content", label: "Ù…Ø­ØªÙˆØ§" },
  { id: "people", label: "Ø§ÙØ±Ø§Ø¯ Ùˆ Ù…Ú©Ø§Ù†â€ŒÙ‡Ø§" },
  { id: "blocks", label: "Ø¨Ù„ÙˆÚ©â€ŒÙ‡Ø§ÛŒ ØµÙØ­Ù‡" },
  { id: "media", label: "Ø±Ø³Ø§Ù†Ù‡" },
  { id: "submissions", label: "Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§" },
  { id: "system", label: "Ù¾ÛŒÚ©Ø±Ø¨Ù†Ø¯ÛŒ" },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯",
    route: ROUTE_PATHS.ADMIN_DASHBOARD,
    group: "overview",
    icon: LayoutDashboard,
  },
  {
    id: "pages",
    label: "ØµÙØ­Ø§Øª",
    route: ROUTE_PATHS.ADMIN_PAGES,
    group: "content",
    icon: FileText,
  },
  {
    id: "news",
    label: "Ø§Ø®Ø¨Ø§Ø±",
    route: ROUTE_PATHS.ADMIN_NEWS,
    group: "content",
    icon: Newspaper,
  },
  {
    id: "events",
    label: "Ø±ÙˆÛŒØ¯Ø§Ø¯Ù‡Ø§",
    route: ROUTE_PATHS.ADMIN_EVENTS,
    group: "content",
    icon: CalendarDays,
  },
  {
    id: "gallery",
    label: "Ú¯Ø§Ù„Ø±ÛŒ",
    route: ROUTE_PATHS.ADMIN_GALLERY,
    group: "content",
    icon: Images,
  },
  {
    id: "hero-slides",
    label: "Ø§Ø³Ù„Ø§ÛŒØ¯Ù‡Ø§ÛŒ Ù‡Ø¯Ø±",
    route: ROUTE_PATHS.ADMIN_HERO_SLIDES,
    group: "content",
    icon: Presentation,
  },
  {
    id: "faq",
    label: "Ù¾Ø±Ø³Ø´â€ŒÙ‡Ø§ÛŒ Ù…ØªØ¯Ø§ÙˆÙ„",
    route: ROUTE_PATHS.ADMIN_FAQS,
    group: "content",
    icon: CircleHelp,
  },
  {
    id: "textbooks",
    label: "کتاب‌های درسی",
    route: ROUTE_PATHS.ADMIN_TEXTBOOKS,
    group: "content",
    icon: BookOpen,
  },
  {
    id: "teachers",
    label: "Ø§Ø³Ø§ØªÛŒØ¯",
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
    label: "Ù†Ø¸Ø±Ø§Øª",
    route: ROUTE_PATHS.ADMIN_TESTIMONIALS,
    group: "people",
    icon: MessageSquareQuote,
  },
  {
    id: "trust-badges",
    label: "Ù†Ø´Ø§Ù†â€ŒÙ‡Ø§ÛŒ Ø§Ø¹ØªÙ…Ø§Ø¯",
    route: ROUTE_PATHS.ADMIN_TRUST_BADGES,
    group: "content",
    icon: BadgeCheck,
  },
  {
    id: "features",
    label: "ÙˆÛŒÚ˜Ú¯ÛŒâ€ŒÙ‡Ø§",
    route: ROUTE_PATHS.ADMIN_FEATURES,
    group: "blocks",
    icon: Sparkles,
  },
  {
    id: "statistics",
    label: "Ø¢Ù…Ø§Ø±",
    route: ROUTE_PATHS.ADMIN_STATISTICS,
    group: "blocks",
    icon: BarChart3,
  },
  {
    id: "about",
    label: "Ø¯Ø±Ø¨Ø§Ø±Ù‡ Ù…Ø§",
    route: ROUTE_PATHS.ADMIN_ABOUT,
    group: "blocks",
    icon: Info,
  },
  {
    id: "achievements",
    label: "Ø§ÙØªØ®Ø§Ø±Ø§Øª",
    route: ROUTE_PATHS.ADMIN_ACHIEVEMENTS,
    group: "blocks",
    icon: Trophy,
  },
  {
    id: "academic-calendar",
    label: "ØªÙ‚ÙˆÛŒÙ… Ø¢Ù…ÙˆØ²Ø´ÛŒ",
    route: ROUTE_PATHS.ADMIN_ACADEMIC_CALENDAR,
    group: "blocks",
    icon: CalendarDays,
  },
  {
    id: "admissions",
    label: "Ù¾Ø°ÛŒØ±Ø´",
    route: ROUTE_PATHS.ADMIN_ADMISSIONS,
    group: "blocks",
    icon: GraduationCap,
  },
  {
    id: "cta",
    label: "ÙØ±Ø§Ø®ÙˆØ§Ù† Ø§Ù‚Ø¯Ø§Ù…",
    route: ROUTE_PATHS.ADMIN_CTA,
    group: "blocks",
    icon: MousePointerClick,
  },
  {
    id: "menus",
    label: "Ù…Ù†ÙˆÙ‡Ø§",
    route: ROUTE_PATHS.ADMIN_MENUS,
    group: "blocks",
    icon: ListTree,
  },
  {
    id: "portal-links",
    label: "Ù„ÛŒÙ†Ú©â€ŒÙ‡Ø§ÛŒ Ø³Ø§Ù…Ø§Ù†Ù‡",
    route: ROUTE_PATHS.ADMIN_PORTAL_LINKS,
    group: "blocks",
    icon: Link2,
  },
  {
    id: "media",
    label: "Ø±Ø³Ø§Ù†Ù‡",
    route: ROUTE_PATHS.ADMIN_MEDIA,
    group: "media",
    icon: Images,
  },
  {
    id: "pre-registrations",
    label: "Ù¾ÛŒØ´â€ŒØ«Ø¨Øªâ€ŒÙ†Ø§Ù…â€ŒÙ‡Ø§",
    route: ROUTE_PATHS.ADMIN_PRE_REGISTRATIONS,
    group: "submissions",
    icon: ClipboardList,
  },
  {
    id: "contact-messages",
    label: "Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ÛŒ ØªÙ…Ø§Ø³",
    route: ROUTE_PATHS.ADMIN_CONTACT_MESSAGES,
    group: "submissions",
    icon: MessageSquare,
  },
  {
    id: "newsletter",
    label: "Ù…Ø´ØªØ±Ú©Ø§Ù† Ø®Ø¨Ø±Ù†Ø§Ù…Ù‡",
    route: ROUTE_PATHS.ADMIN_NEWSLETTER,
    group: "submissions",
    icon: Mail,
  },
  {
    id: "audit-log",
    label: "Ú¯Ø²Ø§Ø±Ø´ ÙØ¹Ø§Ù„ÛŒØªâ€ŒÙ‡Ø§",
    route: ROUTE_PATHS.ADMIN_AUDIT_LOG,
    group: "system",
    icon: History,
  },
  {
    id: "admin-users",
    label: "Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ù…Ø¯ÛŒØ±ÛŒØª",
    route: ROUTE_PATHS.ADMIN_ADMIN_USERS,
    group: "system",
    icon: UserCog,
  },
  {
    id: "settings",
    label: "ØªÙ†Ø¸ÛŒÙ…Ø§Øª",
    route: ROUTE_PATHS.ADMIN_SETTINGS,
    group: "system",
    icon: Settings,
  },
];
