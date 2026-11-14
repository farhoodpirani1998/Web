import { lazy, Suspense, useMemo } from "react";

import { PageLayout, Stack } from "@/shared/design-system/components";
import { useCampuses } from "@/features/campuses";
import {
  ContactIntro,
  ContactInfo,
  ContactForm,
  ContactSocial,
} from "@/features/contact";

const SchoolsMap = lazy(() =>
  import("@/features/contact/map").then(({ SchoolsMap: Component }) => ({
    default: Component,
  })),
);

export function ContactPage() {
  const { data: campuses = [], isLoading, isError, refetch } = useCampuses();
  const schools = useMemo(
    () =>
      campuses.flatMap((campus) => {
        if (
          typeof campus.latitude !== "number" ||
          !Number.isFinite(campus.latitude) ||
          typeof campus.longitude !== "number" ||
          !Number.isFinite(campus.longitude) ||
          campus.latitude < -90 ||
          campus.latitude > 90 ||
          campus.longitude < -180 ||
          campus.longitude > 180
        ) {
          return [];
        }

        return [
          {
            id: campus.id,
            name: campus.name,
            lat: campus.latitude,
            lng: campus.longitude,
            address: campus.address,
            phone: campus.contact.phone,
          },
        ];
      }),
    [campuses],
  );

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
              <section className="space-y-4 pb-10 lg:pb-14" aria-labelledby="schools-map-title">
                <div>
                  <h2 id="schools-map-title" className="text-2xl font-bold">
                    موقعیت مدرسه‌های ما
                  </h2>
                  <p className="mt-2 text-sm text-white/75">
                    با تور مدرسه‌ها، موقعیت هر مدرسه را روی نقشه ببینید.
                  </p>
                </div>
                {isLoading ? (
                  <p className="rounded-md bg-white/10 p-4 text-sm" role="status">
                    در حال دریافت اطلاعات مدرسه‌ها…
                  </p>
                ) : isError ? (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-white/10 p-4"
                    role="alert"
                  >
                    <p className="text-sm">دریافت اطلاعات مدرسه‌ها با خطا روبه‌رو شد.</p>
                    <button
                      type="button"
                      className="min-h-11 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
                      onClick={() => void refetch()}
                    >
                      تلاش دوباره
                    </button>
                  </div>
                ) : campuses.length === 0 ? (
                  <p className="rounded-md bg-white/10 p-4 text-sm">
                    هنوز مدرسه‌ای ثبت نشده است.
                  </p>
                ) : schools.length === 0 ? (
                  <p className="rounded-md bg-white/10 p-4 text-sm">
                    برای مدرسه‌های ثبت‌شده هنوز مختصات جغرافیایی ثبت نشده است.
                  </p>
                ) : (
                  <Suspense
                    fallback={
                      <p className="rounded-md bg-white/10 p-4 text-sm" role="status">
                        در حال بارگذاری نقشه…
                      </p>
                    }
                  >
                    <SchoolsMap schools={schools} />
                  </Suspense>
                )}
              </section>
            </Stack>
          </PageLayout>
        </div>
      </main>
    </>
  );
}
