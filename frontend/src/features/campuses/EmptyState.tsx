import {
  EmptyState as SharedEmptyState,
  Section,
} from "@/shared/design-system/components";

/**
 * Campuses "no results" state.
 *
 * Standalone presentation only — this is the visual `CampusList`
 * would show in place of the grid if a future filtered/searched
 * campus list came back empty (a future `useCampuses()`-style data
 * hook with query params). Per this Sprint's scope (no data fetching,
 * no state management), there is no filter/search state to make empty
 * today, so this component is exported for future wiring but
 * intentionally not composed into `CampusesPage` — mirroring the same
 * precedent as `@/features/pre-registration`'s `SuccessState`.
 *
 * Reuses the existing `EmptyState` composite (§12, §13, §19) rather
 * than introducing a new "no results" primitive — its icon/title/
 * description/action shape already covers this case. Re-exported here
 * under this feature's own name (rather than importing the shared
 * primitive directly at call sites) so a future feature-specific
 * empty-state variant (e.g. a "clear filters" action) stays contained
 * to this one file.
 */
export function EmptyState() {
  return (
    <Section spacing="lg" aria-label="نتیجه‌ای برای پردیس‌ها یافت نشد">
      <SharedEmptyState
        title="پردیسی یافت نشد"
        description="متن نمونه برای زمانی که هیچ پردیسی با معیارهای انتخابی مطابقت ندارد."
        action={{ label: "پاک کردن فیلترها", onClick: undefined }}
      />
    </Section>
  );
}
