import { PageLayout, Stack } from "@/shared/design-system/components";
import { ContactIntro, ContactInfo } from "@/features/contact";

/**
 * Static "Contact" page (Sprint 3B "Website Pages Foundation").
 *
 * Fixed singular page, route `/contact`. Contact details (address,
 * phone, email, working hours) are ultimately Site Settings–derived
 * content (Website Frontend Architecture §8 "Layout Architecture" —
 * the same category of data the app-shell's `Footer` consumes).
 *
 * The intro and contact-info sections are now extracted feature
 * modules (`@/features/contact`), following the same pattern as the
 * homepage's `hero`/`features`/`cta` features and the `about` page's
 * sections — `ContactPage` only composes `<ContactIntro />` and
 * `<ContactInfo />`; it no longer owns either section's markup/copy.
 * Swapping either for a `useSiteSettings()`-style data hook later is
 * additive and stays entirely inside that section's own feature file.
 *
 * A contact **form** is a distinct, unbuilt backend capability (no
 * public form-submission endpoint exists in the Public API contract).
 * Per the architecture's working rules ("never mock or assume the
 * shape of an undocumented capability"), this page deliberately does
 * not include a form, submit handler, or any client-side validation —
 * it is named here only as a future extension point.
 */
export function ContactPage() {
  return (
    <PageLayout>
      <Stack gap="lg">
        <ContactIntro />
        <ContactInfo />
      </Stack>
    </PageLayout>
  );
}
