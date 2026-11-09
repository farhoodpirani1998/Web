import { BookOpen, GraduationCap, MessageCircle } from "lucide-react";
import { Container } from "@/shared/design-system/components";
import { APP_NAME } from "@/shared/config/app";
import { useSiteSettings } from "@/features/site";

export function ContactIntro() {
  const { data } = useSiteSettings();
  const siteName = data?.siteName.fa ?? APP_NAME;

  return (
    <section
      aria-labelledby="contact-intro-heading"
      dir="rtl"
      className="relative isolate overflow-hidden bg-[#071b34] text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-24 -top-32 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -start-16 bottom-[-8rem] h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
      />
      <Container
        size="xl"
        className="relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-center"
      >
        <div className="max-w-3xl duration-700 animate-in fade-in slide-in-from-bottom-3">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200/20 bg-sky-300/10 px-4 py-2 text-sm text-sky-100">
            <MessageCircle aria-hidden="true" size={16} />
            تماس با ما
          </p>
          <h1
            id="contact-intro-heading"
            className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
          >
            برای قدم بعدی، کنارت هستیم
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            برای انتخاب دورهٔ مناسب، آشنایی با برنامه‌های آموزشی یا مطرح‌کردن سؤال‌هات، با
            تیم {siteName} در ارتباط باش.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="relative hidden h-36 w-36 items-center justify-center rounded-full border border-sky-200/20 bg-gradient-to-br from-sky-300/20 to-blue-700/20 text-sky-100 shadow-2xl shadow-sky-950/30 lg:flex"
        >
          <BookOpen size={54} strokeWidth={1.2} />
          <GraduationCap
            className="absolute -end-3 bottom-1 text-sky-200/80"
            size={34}
            strokeWidth={1.4}
          />
        </div>
      </Container>
    </section>
  );
}
