import { Check } from "lucide-react";

import {
  Container,
  Heading,
  Image,
  Link,
  Stack,
  Text,
  buttonVariants,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Homepage "About" section (Website Frontend Architecture §4, §10
 * "Section Architecture", §11 "Component Hierarchy") — new
 * `HomeAbout` component matching the approved Figma design's
 * `AboutSection` (Figma Design Reference §4.6), added to `HomePage`
 * after `WhyChoose`/`Features`.
 *
 * Distinct from the `/about` page's `AboutStory`/`AboutValues`/etc.
 * (same `about` feature folder, same content domain): this is a
 * compact two-column promotional block, not the full About page, and
 * uses a different visual treatment (image + floating stat card vs.
 * the About page's stacked text sections) — the same "home band vs.
 * full page" split already established by `HomeStatsBand` next to
 * `AboutStats`/`StatisticsGrid`.
 *
 * Presentation only, built from existing design-system primitives
 * (`Container`, `Image`, `Heading`, `Text`, `Link`/`buttonVariants`) —
 * no new shared component. Real photo/copy are ultimately About
 * content-module data (§4, §8); this renders a placeholder Unsplash
 * photo and frontend-owned Persian copy in the meantime, the same
 * convention already used by `Hero`. The Figma CTA ("Our Mission &
 * Vision") has no dedicated route yet, so it points at the existing
 * `/about` page (which already covers mission/values via
 * `AboutValues`) rather than a placeholder link (§ "no placeholder
 * code").
 *
 * Entrance motion: like `Hero`, uses `tailwindcss-animate`'s
 * `animate-in` utilities on initial mount only (no new dependency, no
 * scroll-triggered `IntersectionObserver`) rather than reproducing
 * Figma's `whileInView` slide-in-from-both-sides effect — the simpler
 * of the two options the reference doc leaves open (§5.4).
 *
 * Rendered *inside* `HomePage`'s `PageLayout` (unlike `Hero`/
 * `HomeStatsBand`/`CTA`): Figma's `AboutSection` is not one of the
 * full-bleed `bg-primary` bands, so it sits in the normal `max-w-7xl`
 * container like `Features`.
 */
const CHECKLIST_ITEMS = [
  "برنامه‌ی درسی به‌روز و منطبق با استانداردهای آموزشی روز",
  "کادر آموزشی مجرب و متعهد به رشد فردی هر دانش‌آموز",
  "فضای فیزیکی ایمن و امکانات آموزشی و رفاهی مدرن",
] as const;

export function HomeAbout() {
  return (
    <Container
      size="xl"
      className="grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16"
    >
      <div className="relative animate-in fade-in slide-in-from-start-8 duration-700">
        <span
          aria-hidden="true"
          className="absolute -end-4 -top-4 h-24 w-24 rounded-2xl border-2 border-accent/30 sm:-end-6 sm:-top-6 sm:h-32 sm:w-32"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-4 -start-4 h-24 w-24 rounded-2xl bg-primary/5 sm:-bottom-6 sm:-start-6 sm:h-32 sm:w-32"
        />

        <Image
          src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1000&h=1250&fit=crop&auto=format"
          alt="دانش‌آموزان در حال یادگیری در کلاس درس"
          ratio={4 / 5}
          fit="cover"
          containerClassName="relative overflow-hidden rounded-2xl shadow-lg"
        />

        <div className="absolute -bottom-6 end-4 max-w-[13rem] rounded-2xl bg-background p-5 shadow-xl sm:end-6">
          <div className="text-3xl font-bold text-accent">۲۰+ سال</div>
          <div className="mt-1 text-xs font-medium text-muted-foreground">
            در خدمت شکل‌گیری ذهن‌های جوان
          </div>
        </div>
      </div>

      <Stack
        gap="lg"
        align="start"
        className="animate-in fade-in slide-in-from-end-8 duration-700"
      >
        <Stack gap="xs" align="start">
          <div className="inline-flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-10 bg-accent" />
            <span className="text-xs font-bold text-accent">درباره‌ی ما</span>
          </div>
          <Heading level={2} className="max-w-md">
            روایتی از تعهد به آموزش با کیفیت
          </Heading>
        </Stack>

        <Text color="muted">
          متن معرفی نمونه برای بخش درباره‌ی ما. این متن جایگزین محتوایی است که در نهایت پس از
          پیاده‌سازی ماژول محتوایی درباره‌ی ما، از طریق Public API بک‌اند تأمین خواهد شد.
        </Text>
        <Text color="muted">
          پاراگراف نمونه‌ی دوم، برای بررسی فاصله‌گذاری و طول خطوط متن در کنار عکس و کارت شناور.
        </Text>

        <ul className="flex flex-col gap-3">
          {CHECKLIST_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <Text as="span" variant="bodySm">
                {item}
              </Text>
            </li>
          ))}
        </ul>

        <Link
          href="/about"
          className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-primary text-primary-foreground hover:bg-primary/90")}
        >
          مأموریت و چشم‌انداز ما
        </Link>
      </Stack>
    </Container>
  );
}
