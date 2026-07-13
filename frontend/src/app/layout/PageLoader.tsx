import { Spinner } from "@/shared/design-system/components";

/**
 * A single, consistent loading affordance shown while a route's code
 * and/or data is still resolving (§19 "Loading Strategy") — used as the
 * `Suspense` fallback for lazily-loaded routes (§7, §29).
 *
 * Feature/section-level skeletons (sized to their eventual content) are
 * a separate, later concern owned by each feature — this component only
 * covers the page-level/route-transition case.
 */
export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Spinner label="Loading page" className="text-lg" />
    </div>
  );
}
