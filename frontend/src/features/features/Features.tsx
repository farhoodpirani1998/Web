import {
  BookOpen,
  Dumbbell,
  FlaskConical,
  Globe,
  Monitor,
  Music,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

import {
  Badge,
  Container,
  Heading,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { useFeatures } from "./useFeatures";
import "./features.css";

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
 * grid of icon items, each an icon box (`Monitor`, `FlaskConical`,
 * `BookOpen`, `Dumbbell`, `Globe`, `Music` from `lucide-react`, per
 * §4.8) that flips from a soft navy tint to a solid `bg-primary`/
 * `text-accent` treatment on hover — echoing the navy↔gold language
 * `Hero`/`HomeStatsBand`/`CTA` already established — followed by a
 * title and short description.
 *
 * Visual-refresh pass (matching the approved mockup): each item now
 * sits in its own white, bordered, shadowed card (`rounded-2xl border
 * border-border bg-background shadow-sm`, `hover:shadow-lg`) at a
 * `sm:grid-cols-2 lg:grid-cols-4` width, the same card container
 * `HomeCampuses`/`HomeNews` already use — rather than bare icon+text
 * floating on the section's background — so the four "why choose"
 * cards read as distinct tiles like the mockup's, instead of an
 * unbounded icon grid.
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

const FEATURES_EYEBROW = "چرا ما را انتخاب کنید";
const FEATURES_HEADING = "زمینه‌ساز رشد و شکوفایی دانش‌آموزان";
const FEATURES_DESCRIPTION =
  "با آموزش هدفمند و فراهم‌کردن فرصت‌های متنوع یادگیری، مسیر رشد علمی و فردی دانش‌آموزان را هموار می‌کنیم.";

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

  // The backend's Features module has no section-level eyebrow/
  // heading/intro field (see ./types.ts) — that copy is owned by this
  // component, not CMS content, so it's
  // never read from `data`.
  const eyebrow = FEATURES_EYEBROW;
  const heading = FEATURES_HEADING;
  const description = FEATURES_DESCRIPTION;

  const items: WhyChooseItem[] =
    data && data.length > 0
      ? data.map((item) => ({
          id: item.id,
          icon: item.icon ? (ICON_MAP[item.icon] ?? FALLBACK_ICON) : FALLBACK_ICON,
          title: item.title.fa,
          description: item.description.fa,
        }))
      : WHY_CHOOSE_ITEMS_PLACEHOLDER;

  return (
    <Section
      spacing="lg"
      tone="muted"
      aria-labelledby="home-features-heading"
      className="relative isolate overflow-hidden"
    >
      <div
        data-aifx="blocky"
        data-aifx-colors="#e9e3ff,#ae9cec,#8261e1,#5c15f6"
        data-aifx-bg="#f7eaea"
        data-aifx-bg-alpha="0.83"
        data-aifx-speed="0.91"
        data-aifx-block-size="47"
        data-aifx-levels="8"
        data-aifx-scale="1.73"
        data-aifx-drift-angle="50"
        data-aifx-glint="0.36"
        data-aifx-contrast="1.06"
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />

      <Container size="xl" className="relative z-10">
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

          <div
            className="features-orbit"
            style={{ "--feature-card-count": items.length } as CSSProperties}
            role="group"
            aria-label="ویژگی‌های مجموعه؛ برای مشاهدهٔ کارت‌ها در صفحه پیمایش کنید"
          >
            <div className="features-orbit__track">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="features-orbit__card group relative isolate"
                  style={
                    {
                      "--feature-card-index": index,
                      "--feature-card-angle": `${(index / items.length) * 2 * Math.PI - Math.PI / 2}rad`,
                    } as CSSProperties
                  }
                >
                  <div
                    data-aifx="aurora-flow"
                    className="pointer-events-none absolute inset-0 -z-10"
                    aria-hidden="true"
                  />

                  <span aria-hidden="true" className="features-orbit__card-icon">
                    <item.icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>

                  <Heading level={3}>{item.title}</Heading>
                  <Text variant="bodySm" color="muted">
                    {item.description}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
