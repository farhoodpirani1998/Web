import { PageLayout, Stack } from "@/shared/design-system/components";
import { Seo } from "@/shared/seo";
import { Hero, TeacherGrid, TeacherDetails, FAQ } from "@/features/teachers";

/** Static page-level SEO metadata for the teachers directory. */
const TEACHERS_SEO = {
  title: "کادر آموزشی",
  description: "با کادر آموزشی مجموعه و تخصص هر یک از مدرسان آشنا شوید.",
  canonicalUrl: `${window.location.origin}/teachers`,
  robots: "index, follow",
};

/**
 * Teachers directory backed by the Public Teachers API through
 * `useTeachers()`. Individual teacher routes load their full detail
 * response separately.
 */
export function TeachersPage() {
  return (
    <>
      <Seo seo={TEACHERS_SEO} />
      {/* Full-bleed hero band, outside PageLayout (which is a Container). */}
      <Hero />
      <PageLayout>
        <Stack gap="none">
          <TeacherGrid />
          <TeacherDetails />
          <FAQ />
        </Stack>
      </PageLayout>
    </>
  );
}
