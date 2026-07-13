import { EmptyState, Section } from "@/shared/design-system/components";

/**
 * Pre-registration "Success" state.
 *
 * Standalone presentation only — this is the visual the page will show
 * in place of `RegistrationForm` *after* real submission logic exists
 * (a future `usePreRegistration()`-style mutation), not something
 * `PreRegistrationPage` conditionally renders today. Per this Sprint's
 * scope (no API, no submission logic, no form state), there is no
 * success/error state to switch on yet, so this component is exported
 * for future wiring but intentionally not composed into the page.
 *
 * Reuses the existing `EmptyState` composite (§12, §13, §19) rather
 * than introducing a new "result state" primitive — `EmptyState`'s
 * icon/title/description/action shape already covers this case
 * (a confirmation message with a follow-up action), the same way
 * `AboutPage`/`SchoolsPage` reuse `LoadingState`/`ErrorState` instead
 * of hand-rolling their own. The action button is inert (`onClick`
 * omitted) since navigation-after-success is real product behavior
 * this Sprint deliberately does not implement.
 */
export function SuccessState() {
  return (
    <Section spacing="lg" aria-label="نتیجه پیش‌ثبت‌نام">
      <EmptyState
        title="پیش‌ثبت‌نام شما با موفقیت ثبت شد"
        description="متن نمونه برای تشکر از تکمیل فرم و توضیح مراحل بعدی که کارشناسان مجموعه در تماس با شما خواهند بود."
        action={{ label: "بازگشت به صفحه اصلی", onClick: undefined }}
      />
    </Section>
  );
}
