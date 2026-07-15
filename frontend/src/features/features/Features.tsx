import { BookOpen, Dumbbell, FlaskConical, Globe, Monitor, Music } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Homepage "WhyChoose" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — rebuilt to
 * match the approved Figma design's `WhyChooseSection` (Figma Design
 * Reference §4.8), replacing the earlier numbered-card placeholder.
 * `features/features` is the direct project equivalent of Figma's
 * "Why Choose Us" block, so this redesign happens in place rather than
 * as a new feature, per the reference doc.
 *
 * Presentation only: composed from existing design-system primitives
 * (`Section`, `Stack`, `Heading`, `Text`, `Badge`) plus plain `span`/
 * `div` for the icon grid — no new shared component. Real
 * headline/intro copy and feature items are ultimately Features
 * content-module data (§4, §8); this renders frontend-owned Persian
 * placeholder copy in the meantime, the same convention already used
 * by `Hero`/`HomeStatsBand`/`CTA`.
 *
 * Matches Figma structurally: centered eyebrow → two-line heading →
 * `grid-cols-2 md:grid-cols-3` grid of six icon items, each an icon
 * box (`Monitor`, `FlaskConical`, `BookOpen`, `Dumbbell`, `Globe`,
 * `Music` from `lucide-react`, per §4.8) that flips from a soft
 * navy tint to a solid `bg-primary`/`text-accent` treatment on hover —
 * echoing the navy↔gold language `Hero`/`HomeStatsBand`/`CTA` already
 * established — followed by a title and short description.
 */

interface WhyChooseItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const WHY_CHOOSE_ITEMS: WhyChooseItem[] = [
  {
    icon: Monitor,
    title: "کلاس‌های هوشمند",
    description: "تجهیز کلاس‌ها به ابزارهای آموزشی دیجیتال برای یادگیری تعاملی‌تر.",
  },
  {
    icon: FlaskConical,
    title: "آزمایشگاه مجهز",
    description: "فضای عملی برای تجربه‌ی مستقیم علوم پایه در کنار آموزش نظری.",
  },
  {
    icon: BookOpen,
    title: "کتابخانه‌ی غنی",
    description: "مجموعه‌ای گسترده از منابع مطالعاتی برای تقویت عادت کتاب‌خوانی.",
  },
  {
    icon: Dumbbell,
    title: "امکانات ورزشی",
    description: "فضاهای استاندارد ورزشی برای رشد جسمی و روحیه‌ی تیمی دانش‌آموزان.",
  },
  {
    icon: Globe,
    title: "آموزش زبان",
    description: "برنامه‌ی فشرده‌ی زبان خارجی با تمرکز بر مهارت‌های گفتاری و نوشتاری.",
  },
  {
    icon: Music,
    title: "فعالیت‌های فرهنگی و هنری",
    description: "کارگاه‌های موسیقی و هنر برای پرورش خلاقیت در کنار آموزش رسمی.",
  },
];

export function Features() {
  return (
    <Section spacing="lg" tone="muted" aria-labelledby="home-features-heading">
      <Stack gap="xl">
        <Stack gap="sm" align="center" className="text-center">
          <Badge
            variant="outline"
            className="rounded-full border-accent/40 bg-accent/10 text-primary"
          >
            چرا ما را انتخاب کنید
          </Badge>
          <Heading id="home-features-heading" level={2}>
            ساخته‌شده برای تعالی آموزشی
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-accent" />
          <Text variant="lead" className="max-w-2xl">
            متن معرفی نمونه برای بخش ویژگی‌ها. این متن جایگزین خلاصه‌ای است که در نهایت پس از
            پیاده‌سازی ماژول محتوایی ویژگی‌ها، از طریق Public API بک‌اند تأمین خواهد شد.
          </Text>
        </Stack>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8">
          {WHY_CHOOSE_ITEMS.map((item) => (
            <div key={item.title} className="group flex flex-col items-center gap-4 text-center">
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
