import { EmptyState as SharedEmptyState, Section } from "@/shared/design-system/components";

/**
 * News "no results" state.
 *
 * Standalone presentation only — this is the visual `NewsList` would
 * show in place of the grid if a future filtered/searched news list
 * came back empty (a future `useNews()`-style data hook with query
 * params, e.g. filtering by category). There is no filter/search
 * state to make empty today, so this component is exported for
 * future wiring but intentionally not composed into `NewsPage` —
 * mirroring the same precedent as `@/features/campuses`'s
 * `EmptyState`, `@/features/teachers`'s `EmptyState`, and
 * `@/features/gallery`'s `EmptyState`.
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
    <Section spacing="lg" aria-label="نتیجه‌ای برای اخبار یافت نشد">
      <SharedEmptyState
        title="خبری یافت نشد"
        description="متن نمونه برای زمانی که هیچ خبری با معیارهای انتخابی مطابقت ندارد."
        action={{ label: "پاک کردن فیلترها", onClick: undefined }}
      />
    </Section>
  );
}
