import { EmptyState, Section } from "@/shared/design-system/components";

/**
 * Pre-registration "Success" state.
 *
 * Rendered by `RegistrationForm` in place of the form itself once a
 * submission to `POST /public/pre-registration` succeeds (see that
 * file's `isSuccess` state) — no props needed since this component's
 * copy is static and there is nothing per-submission to surface here
 * (no confirmation number, no echoed fields).
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
