import { Trophy } from "lucide-react";

import { Container, Heading, Stack, Text } from "@/shared/design-system/components";
import { toPersianDigits } from "@/shared/utils/toPersianDigits";

/**
 * Homepage "Achievements" section (Website Frontend Architecture §4,
 * §10 "Section Architecture", §11 "Component Hierarchy") — new
 * `achievements` feature, matching the approved Figma design's
 * `AchievementsSection` (Figma Design Reference §4.9). `achievements`
 * has no existing project-side equivalent (unlike Campuses/WhyChoose/
 * News/Gallery, each already scaffolded around a real content
 * domain) — `features/README.md` lists it as one of the real site
 * sections the project will eventually have a feature folder for, so
 * this is that folder's first component, following the same
 * "home band owns its own placeholder content" convention already
 * used by `HomeStatsBand`/`HomeAbout`/`HomeCampuses`.
 *
 * Presentation only: composed from existing design-system primitives
 * (`Container`, `Stack`, `Heading`, `Text`) plus a `Trophy` icon
 * (`lucide-react`, already a dependency) and an `aria-hidden` dot-
 * texture overlay (inline `radial-gradient`, matching Figma's `0.03`
 * opacity — same technique `CTA` already uses at `0.04`). Real
 * headline/figures are ultimately Achievements content-module data
 * (§4, §8); this renders frontend-owned Persian placeholder figures in
 * the meantime, the same convention already used elsewhere.
 *
 * Full-bleed `bg-primary`, so — like `Hero`/`HomeStatsBand`/`CTA` —
 * it's rendered *outside* `HomePage`'s `PageLayout` and opens its own
 * `Container` internally, after `Features` (WhyChoose) per Figma's
 * canonical render order (§3): ... → WhyChoose → Achievements → News →
 * Gallery → CTA.
 */

interface Achievement {
  value: string;
  label: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { value: "۱۵+", label: "رتبه‌ی برتر کشوری در المپیادهای علمی دانش‌آموزی" },
  { value: "۹۵٪", label: "قبولی فارغ‌التحصیلان در دانشگاه‌های برتر کشور" },
  { value: "۳۰+", label: "مدال و رتبه در مسابقات علمی و ورزشی استانی و کشوری" },
  { value: "۱۰+", label: "تقدیرنامه و جایزه از وزارت آموزش و پرورش" },
];

export function HomeAchievements() {
  return (
    <section aria-labelledby="home-achievements-heading" className="relative overflow-hidden bg-primary py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }}
      />

      <Container size="xl" className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Stack gap="lg" align="start">
          <Stack gap="xs" align="start">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-10 bg-accent" />
              <span className="text-xs font-bold text-accent">افتخارات</span>
            </div>
            <Heading id="home-achievements-heading" level={2} color="inherit" className="max-w-md text-white">
              میراثی از تعالی آموزشی
            </Heading>
          </Stack>

          <Text color="inherit" className="max-w-md text-white/60">
            متن معرفی نمونه برای بخش افتخارات. این متن جایگزین محتوایی است که در نهایت پس از
            پیاده‌سازی ماژول محتوایی افتخارات، از طریق Public API بک‌اند تأمین خواهد شد.
          </Text>

          <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-5">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"
            >
              <Trophy className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <div>
              <div className="text-2xl font-bold text-accent">{toPersianDigits(20)}+ سال</div>
              <div className="text-xs font-medium text-white/50">سابقه‌ی درخشان آموزشی</div>
            </div>
          </div>
        </Stack>

        <div className="flex flex-col divide-y divide-white/10">
          {ACHIEVEMENTS.map((item) => (
            <div key={item.label} className="flex items-center gap-5 py-5 first:pt-0 last:pb-0">
              <span aria-hidden="true" className="shrink-0 text-4xl font-bold text-accent sm:text-5xl">
                {item.value}
              </span>
              <span aria-hidden="true" className="h-10 w-px shrink-0 bg-white/15" />
              <Text color="inherit" className="text-sm text-white/70">
                {item.label}
              </Text>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
