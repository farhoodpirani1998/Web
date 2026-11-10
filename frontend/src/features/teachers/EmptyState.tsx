import {
  EmptyState as SharedEmptyState,
  Section,
} from "@/shared/design-system/components";

/**
 * Teachers "no results" state.
 *
 * Feature-specific empty-state composition. The directory currently
 * uses the shared empty state directly, so this component is not
 * composed into `TeachersPage`.
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
    <Section spacing="lg" aria-label="نتیجه‌ای برای مدرسان یافت نشد">
      <SharedEmptyState
        title="مدرسی یافت نشد"
        description="متن نمونه برای زمانی که هیچ مدرسی با معیارهای انتخابی مطابقت ندارد."
        action={{ label: "پاک کردن فیلترها", onClick: undefined }}
      />
    </Section>
  );
}
