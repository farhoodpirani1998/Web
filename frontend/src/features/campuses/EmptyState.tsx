import {
  EmptyState as SharedEmptyState,
  Section,
} from "@/shared/design-system/components";

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
