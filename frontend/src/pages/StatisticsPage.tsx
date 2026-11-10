import { PageLayout } from "@/shared/design-system/components";
import { StatisticsHero, StatisticsGrid } from "@/features/statistics";

/**
 * Statistics page. `StatisticsGrid` loads published records from the
 * Public Statistics API; page-level layout and SEO remain local.
 */
export function StatisticsPage() {
  return (
    <>
      {/* Full-bleed hero band, outside PageLayout (which is a Container). */}
      <StatisticsHero />
      <PageLayout>
        <StatisticsGrid />
      </PageLayout>
    </>
  );
}
