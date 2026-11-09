import { useState, type FormEvent } from "react";
import { ApiError } from "@/shared/api";
import { Button, Section, Stack } from "@/shared/design-system/components";
import { normalizeIranPhone } from "@/shared/utils/preRegistrationValidation";
import { submitContactMessage, type ContactMessagePayload } from "./api";

const fieldClassName =
  "min-h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white " +
  "placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60";

const labelClassName = "text-sm font-medium text-slate-100";

const subjects: { value: ContactMessagePayload["subject"]; label: string }[] = [
  { value: "educational-consultation", label: "مشاورهٔ آموزشی" },
  { value: "course-information", label: "اطلاعات دوره‌ها" },
  { value: "group-collaboration", label: "همکاری با گروه" },
  { value: "other", label: "سایر پرسش‌ها" },
];

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const phone = normalizeIranPhone(String(formData.get("phone") ?? ""));
    const subject = subjects.find(
      ({ value }) => value === String(formData.get("subject") ?? ""),
    )?.value;
    if (!phone) {
      setError("لطفاً یک شمارهٔ تماس معتبر وارد کن.");
      return;
    }
    if (!subject) {
      setError("لطفاً موضوع پیام را انتخاب کن.");
      return;
    }
    if (!String(formData.get("fullName") ?? "").trim()) {
      setError("لطفاً نام و نام خانوادگی را وارد کن.");
      return;
    }
    if (!String(formData.get("message") ?? "").trim()) {
      setError("لطفاً متن پیام را وارد کن.");
      return;
    }

    const payload: ContactMessagePayload = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      phone,
      subject,
      message: String(formData.get("message") ?? "").trim(),
    };

    setIsSubmitting(true);
    try {
      await submitContactMessage(payload);
      setIsSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "ارسال پیام انجام نشد. لطفاً دوباره تلاش کن.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <Section
      spacing="none"
      id="contact-form"
      aria-labelledby="contact-form-heading"
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/10 backdrop-blur-sm sm:p-8"
    >
      <Stack gap="lg">
        <div>
          <p className="mb-2 text-sm font-medium text-sky-300">پیام به گروه</p>
          <h2
            id="contact-form-heading"
            className="font-heading text-2xl font-bold text-white"
          >
            پیامت رو برامون بنویس
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            اطلاعاتت فقط برای پیگیری همین پیام استفاده می‌شه و به‌صورت عمومی نمایش داده
            نمی‌شه.
          </p>
        </div>

        {isSuccess ? (
          <div
            role="status"
            className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-5 text-sm leading-7 text-emerald-100"
          >
            پیامت با موفقیت ارسال شد. به‌زودی باهات در ارتباط خواهیم بود.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClassName}>نام و نام خانوادگی</span>
                <input
                  className={fieldClassName}
                  name="fullName"
                  autoComplete="name"
                  maxLength={150}
                  required
                />
              </label>
              <label className="space-y-2">
                <span className={labelClassName}>شمارهٔ تماس</span>
                <input
                  className={fieldClassName}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  maxLength={24}
                  required
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className={labelClassName}>موضوع پیام</span>
              <select className={fieldClassName} name="subject" defaultValue="" required>
                <option value="" disabled className="text-slate-900">
                  موضوع پیام را انتخاب کن
                </option>
                {subjects.map(({ value, label }) => (
                  <option key={value} value={value} className="text-slate-900">
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className={labelClassName}>متن پیام</span>
              <textarea
                className={`${fieldClassName} min-h-36 resize-y`}
                name="message"
                maxLength={5000}
                required
              />
            </label>

            {error ? (
              <p role="alert" className="text-sm leading-6 text-rose-300">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              size="lg"
              shape="pill"
              disabled={isSubmitting}
              className="w-full bg-sky-400 text-slate-950 hover:bg-sky-300 sm:w-auto"
            >
              {isSubmitting ? "در حال ارسال…" : "ارسال پیام"}
            </Button>
          </form>
        )}
      </Stack>
    </Section>
  );
}
