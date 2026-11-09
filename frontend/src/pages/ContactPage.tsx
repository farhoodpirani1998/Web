import { PageLayout, Stack } from "@/shared/design-system/components";
import {
  ContactIntro,
  ContactInfo,
  ContactForm,
  ContactSocial,
} from "@/features/contact";

export function ContactPage() {
  return (
    <>
      <ContactIntro />

      <main dir="rtl" className="relative overflow-hidden bg-[#071b34] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-24 top-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"
        />
        <div className="relative">
          <PageLayout>
            <Stack gap="none">
              <div className="grid gap-6 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:items-start lg:gap-8 lg:py-14">
                <ContactForm />
                <ContactInfo />
              </div>
              <ContactSocial />
            </Stack>
          </PageLayout>
        </div>
      </main>
    </>
  );
}
