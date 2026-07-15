import { BookOpen, Dumbbell, FlaskConical, Globe, Monitor, Music, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

import { useFeatures } from "./useFeatures";

/**
 * Homepage "WhyChoose" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — rebuilt to
 * match the approved Figma design's `WhyChooseSection` (Figma Design
 * Reference §4.8), replacing the earlier numbered-card placeholder.
 * `features/features` is the direct project equivalent of Figma's
 * "Why Choose Us" block, so this redesign happens in place rather than
 * as a new feature, per the reference doc.
 *
 * Backed by `useFeatures()` (the Public API's Features content
 * module, §4, §8). While the query is loading, has errored, or the
 * CMS has no items configured yet, this falls back to the same
 * frontend-owned Persian placeholder copy the section rendered before
 * it was wired up — same convention already used by `Hero`/
 * `HomeStatsBand`/`CTA`. Each item's `icon` comes back from the CMS as
 * a `lucide-react` icon name string; `ICON_MAP` resolves it to the
 * actual icon component, falling back to a generic icon for unknown
 * names so an unrecognized CMS value never breaks the grid.
 *
 * Matches Figma structurally: centered eyebrow → two-line heading →
 * `grid-cols-2 md:grid-cols-3` grid of icon items, each an icon
 * box (`Monitor`, `FlaskConical`, `BookOpen`, `Dumbbell`, `Globe`,
 * `Music` from `lucide-react`, per §4.8) that flips from a soft
 * navy tint to a solid `bg-primary`/`text-accent` treatment on hover —
 * echoing the navy↔gold language `Hero`/`HomeStatsBand`/`CTA` already
 * established — followed by a title and short description.
 */

interface WhyChooseItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Monitor,
  FlaskConical,
  BookOpen,
  Dumbbell,
  Globe,
  Music,
};
const FALLBACK_ICON: LucideIcon = Sparkles;

const FEATURES_EYEBROW_PLACEHOLDER = "چرا ما را انتخاب کنید";
const FEATURES_HEADING_PLACEHOLDER = "ساخته‌شده برای تعالی آموزشی";
const FEATURES_DESCRIPTION_PLACEHOLDER =
  "متن معرفی نمونه برای بخش ویژگی‌ها. این متن جایگزین خلاصه‌ای است که در نهایت پس از " +
  "پیاده‌سازی ماژول محتوایی ویژگی‌ها، از طریق Public API بک‌اند تأمین خواهد شد.";

const WHY_CHOOSE_ITEMS_PLACEHOLDER: WhyChooseItem[] = [
  {
    id: "smart-classrooms",
    icon: Monitor,
    title: "کلاس‌های هوشمند",
    description: "تجهیز کلاس‌ها به ابزارهای آموزشی دیجیتال برای یادگیری تعاملی‌تر.",
  },
  {
    id: "equipped-lab",
    icon: FlaskConical,
    title: "آزمایشگاه مجهز",
    description: "فضای عملی برای تجربه‌ی مستقیم علوم پایه در کنار آموزش نظری.",
  },
  {
    id: "rich-library",
    icon: BookOpen,
    title: "کتابخانه‌ی غنی",
    description: "مجموعه‌ای گسترده از منابع مطالعاتی برای تقویت عادت کتاب‌خوانی.",
  },
  {
    id: "sports-facilities",
    icon: Dumbbell,
    title: "امکانات ورزشی",
    description: "فضاهای استاندارد ورزشی برای رشد جسمی و روحیه‌ی تیمی دانش‌آموزان.",
  },
  {
    id: "language-education",
    icon: Globe,
    title: "آموزش زبان",
    description: "برنامه‌ی فشرده‌ی زبان خارجی با تمرکز بر مهارت‌های گفتاری و نوشتاری.",
  },
  {
    id: "cultural-activities",
    icon: Music,
    title: "فعالیت‌های فرهنگی و هنری",
    description: "کارگاه‌های موسیقی و هنر برای پرورش خلاقیت در کنار آموزش رسمی.",
  },
];

export function Features() {
  const { data } = useFeatures();

  const eyebrow = data?.eyebrow ?? FEATURES_EYEBROW_PLACEHOLDER;
  const heading = data?.heading ?? FEATURES_HEADING_PLACEHOLDER;
  const description = data?.description ?? FEATURES_DESCRIPTION_PLACEHOLDER;

  const items: WhyChooseItem[] =
    data?.items && data.items.length > 0
      ? data.items.map((item) => ({
          id: item.id,
          icon: ICON_MAP[item.icon] ?? FALLBACK_ICON,
          title: item.title,
          description: item.description,
        }))
      : WHY_CHOOSE_ITEMS_PLACEHOLDER;

  return (
    <Section spacing="lg" tone="muted" aria-labelledby="home-features-heading">
      <Stack gap="xl">
        <Stack gap="sm" align="center" className="text-center">
          <Badge
            variant="outline"
            className="rounded-full border-accent/40 bg-accent/10 text-primary"
          >
            {eyebrow}
          </Badge>
          <Heading id="home-features-heading" level={2}>
            {heading}
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-accent" />
          <Text variant="lead" className="max-w-2xl">
            {description}
          </Text>
        </Stack>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8">
          {items.map((item) => (
            <div key={item.id} className="group flex flex-col items-center gap-4 text-center">
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8 text-primary",
                  "transition-colors duration-300 group-hover:bg-primary group-hover:text-accent",
                )}
              >
                <item.icon className="h-7 w-7" strokeWidth={1.75} />
              </span>

              <Heading level={3} className="text-base">
                {item.title}
              </Heading>
              <Text variant="bodySm" color="muted" className="max-w-[16rem]">
                {item.description}
              </Text>
            </div>
          ))}
        </div>
      </Stack>
    </Section>
  );
}
