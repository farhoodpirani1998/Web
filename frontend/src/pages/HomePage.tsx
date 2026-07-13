import { PageLayout } from "@/shared/design-system/components";
import { Hero } from "@/features/hero";
import { Features } from "@/features/features";
import { CTA } from "@/features/cta";

/**
 * Root-route page.
 *
 * Homepage sections (Hero, Stats, About, Campuses, ...) are each a
 * separate content module/feature and remain out of scope one at a
 * time until their own sprints (Website Frontend Architecture §10
 * "Section Architecture", §11 "Component Hierarchy").
 *
 * Hero (`@/features/hero`), Features (`@/features/features`), and CTA
 * (`@/features/cta`) are now extracted feature modules — `HomePage`
 * only composes `<Hero />`, `<Features />`, and `<CTA />`; it no longer
 * owns any section's markup/copy. Real copy/CTAs are ultimately
 * backend-owned content (Website Frontend Architecture §4, §8), which
 * each feature already renders as frontend-owned placeholder copy in
 * the meantime.
 */
export function HomePage() {
  return (
    <PageLayout>
      <Hero />

      <Features />

      <CTA />
    </PageLayout>
  );
}
