import { PageLayout, Stack } from "@/shared/design-system/components";
import { Seo } from "@/shared/seo";
import { Hero, EventList, EventDetails, FAQ } from "@/features/events";

/** Static page-level SEO metadata for the events directory. */
const EVENTS_SEO = {
  title: "رویدادها و برنامه‌ها",
  description:
    "رویدادهای پیش‌رو، جشن‌ها، کارگاه‌های آموزشی و بازدیدهای علمی مجموعه.",
  canonicalUrl: `${window.location.origin}/events`,
  robots: "index, follow",
};

/**
 * Events directory backed by the Public Events API through
 * `useEvents()`. Individual event routes load their full detail
 * response separately.
 */
export function EventsPage() {
  return (
    <>
      <Seo seo={EVENTS_SEO} />
      {/* Full-bleed hero band, outside PageLayout (which is a Container). */}
      <Hero />
      <PageLayout>
        <Stack gap="none">
          <EventList />
          <EventDetails />
          <FAQ />
        </Stack>
      </PageLayout>
    </>
  );
}
