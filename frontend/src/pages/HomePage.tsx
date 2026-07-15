import { PageLayout } from "@/shared/design-system/components";
import { Hero } from "@/features/hero";
import { HomeStatsBand } from "@/features/statistics";
import { HomeAbout } from "@/features/about";
import { HomeCampuses } from "@/features/campuses";
import { Features } from "@/features/features";
import { HomeAchievements } from "@/features/achievements";
import { HomeNews } from "@/features/news";
import { HomeGallery } from "@/features/gallery";
import { CTA } from "@/features/cta";

/**
 * Root-route page.
 *
 * Homepage sections (Hero, Stats, About, Campuses, ...) are each a
 * separate content module/feature and remain out of scope one at a
 * time until their own sprints (Website Frontend Architecture §10
 * "Section Architecture", §11 "Component Hierarchy").
 *
 * Hero (`@/features/hero`), HomeStatsBand (`@/features/statistics`),
 * HomeAbout (`@/features/about`), HomeCampuses
 * (`@/features/campuses`), Features (`@/features/features`),
 * HomeAchievements (`@/features/achievements`), HomeNews
 * (`@/features/news`), and CTA (`@/features/cta`) are now extracted
 * feature modules — `HomePage` only composes them; it no longer owns
 * any section's markup/copy. Real copy/CTAs are ultimately
 * backend-owned content (Website Frontend Architecture §4, §8), which
 * each feature already renders as frontend-owned placeholder copy in
 * the meantime.
 *
 * `Hero`, `HomeStatsBand`, `HomeAchievements`, and `CTA` render
 * outside `PageLayout` (unlike `Features`/`HomeAbout`/`HomeCampuses`/
 * `HomeNews`/`HomeGallery`) because all four are full-bleed `bg-primary`
 * sections per the approved Figma design — they need to span the full
 * viewport width, not sit inside `PageLayout`'s `Container` gutters.
 * Each opens its own `Container` internally for its own content
 * column. `HomeAbout`/`HomeCampuses`/`Features` share one `PageLayout`,
 * and `HomeNews`/`HomeGallery` share a second one after the full-bleed
 * `HomeAchievements` band splits them — matching Figma's canonical
 * render order (Figma Design Reference §3): Hero → Stats → About →
 * Campuses → WhyChoose → Achievements → News → Gallery → CTA.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <HomeStatsBand />

      <PageLayout>
        <HomeAbout />
        <HomeCampuses />
        <Features />
      </PageLayout>

      <HomeAchievements />

      <PageLayout>
        <HomeNews />
        <HomeGallery />
      </PageLayout>

      <CTA />
    </>
  );
}
